import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import { insertStreamerApplicationSchema, insertPageViewSchema, insertChatbotInteractionSchema } from "@shared/schema";
import { z } from "zod";

// --- Настройка Passport ---
// В реальном приложении пользователи должны храниться в БД и пароли хэшироваться.
// Для простоты, используем одного жестко закодированного админа.
const adminUser = {
  id: 1, // Уникальный ID для пользователя
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "password",
  role: "admin",
};
// Не забудьте добавить ADMIN_USERNAME и ADMIN_PASSWORD в .env файл!

passport.use(
  new LocalStrategy(
    // По умолчанию LocalStrategy ожидает поля 'username' и 'password' в req.body
    async (username, password, done) => {
      try {
        // В реальном приложении здесь будет проверка по базе данных
        // const userFromDb = await storage.getUserByUsername(username);
        // if (!userFromDb) {
        //   return done(null, false, { message: "Неверное имя пользователя." });
        // }
        // const isPasswordMatch = await bcrypt.compare(password, userFromDb.password); // Если используете bcrypt
        // if (!isPasswordMatch) {
        //   return done(null, false, { message: "Неверный пароль." });
        // }
        // return done(null, userFromDb);

        // Упрощенная проверка для примера:
        if (username === adminUser.username && password === adminUser.password) {
          return done(null, adminUser); // Передаем объект пользователя
        } else {
          return done(null, false, { message: "Неверное имя пользователя или пароль." });
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  // Сохраняем только ID пользователя в сессию для минимизации данных в куке
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    // В реальном приложении здесь будет поиск пользователя в БД по ID
    // const user = await storage.getUser(id);
    // if (user) {
    //   done(null, user);
    // } else {
    //   done(new Error("Пользователь не найден в сессии."));
    // }

    // Упрощенная десериализация для примера:
    if (id === adminUser.id) {
      done(null, adminUser); // Возвращаем полный объект пользователя
    } else {
      done(new Error(`Пользователь с ID ${id} не найден.`));
    }
  } catch (err) {
    done(err);
  }
});

// Middleware для проверки аутентификации и роли администратора
export function isAuthenticatedAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user as any)?.role === 'admin') {
    return next();
  }
  res.status(401).json({ success: false, message: "Не авторизован или нет прав администратора" });
}
// --- Конец настройки Passport ---


export async function registerRoutes(app: Express): Promise<Server> {
  // --- Маршруты аутентификации ---
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: any, info: { message: string } | undefined) => {
      if (err) {
        console.error("Сервер: Ошибка passport.authenticate:", err); // Логируем ошибку аутентификации
        return next(err);
      }
      if (!user) {
        console.log("Сервер: passport.authenticate - Пользователь не найден или неверные учетные данные. Info:", info);
        return res.status(401).json({ success: false, message: info?.message || "Ошибка входа" });
      }

      // Пользователь найден, пытаемся залогинить и установить сессию
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Сервер: Ошибка req.logIn:", loginErr);
          return next(loginErr);
        }

        // Явно сохраняем сессию перед отправкой ответа
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Сервер: Ошибка сохранения сессии (req.session.save) после логина:", saveErr);
            return next(saveErr); // Важно передать ошибку дальше, чтобы клиент не получил ложноположительный ответ
          }

          // Только после успешного сохранения сессии логируем и отвечаем
          console.log("Сервер: Сессия успешно СОХРАНЕНА после /api/auth/login. User ID:", user.id, "Session ID:", req.sessionID);
          // Проверим состояние аутентификации сразу после сохранения (серверная сторона)
          console.log("Сервер: Проверка сразу после сохранения: req.isAuthenticated():", req.isAuthenticated(), "req.user:", req.user ? (req.user as any).username : 'undefined');

          // Отправляем только неконфиденциальную информацию о пользователе
          return res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    const sessionIdBeforeLogout = req.sessionID; // Сохраним для лога
    console.log(`Сервер: Попытка выхода для сессии ${sessionIdBeforeLogout}`);
    req.logout((err) => {
      if (err) {
        console.error(`Сервер: Ошибка req.logout для сессии ${sessionIdBeforeLogout}:`, err);
        return next(err);
      }
      console.log(`Сервер: req.logout успешен для сессии ${sessionIdBeforeLogout}. Пользователь в req.user после logout:`, req.user); // Должен быть undefined

      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error(`Сервер: Ошибка req.session.destroy для сессии ${sessionIdBeforeLogout}:`, destroyErr);
          // Продолжаем, чтобы хотя бы очистить куку на клиенте
        } else {
          console.log(`Сервер: Сессия ${sessionIdBeforeLogout} успешно уничтожена.`);
        }
        res.clearCookie('connect.sid'); // Имя куки по умолчанию для express-session
        console.log(`Сервер: Кука connect.sid очищена для ответа.`);
        res.json({ success: true, message: "Выход выполнен успешно" });
      });
    });
  });

  app.get("/api/auth/status", (req, res) => {
    // Добавляем подробное логирование для /api/auth/status
    console.log("Сервер: Запрос /api/auth/status. Session ID:", req.sessionID);
    console.log("Сервер: /api/auth/status - req.session:", req.session); // Посмотреть всю сессию
    console.log("Сервер: /api/auth/status - req.user:", req.user ? (req.user as any).username : 'undefined');
    console.log("Сервер: /api/auth/status - req.isAuthenticated():", req.isAuthenticated());

    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({
        success: true,
        isAuthenticated: true,
        user: { id: user.id, username: user.username, role: user.role }
      });
    } else {
      res.json({ success: false, isAuthenticated: false });
    }
  });
  // --- Конец маршрутов аутентификации ---


  // Submit streamer application (остается публичным)
  app.post("/api/streamer-application", async (req, res) => {
    try {
      const validatedData = insertStreamerApplicationSchema.parse(req.body);
      const application = await storage.createStreamerApplication(validatedData);
      res.json({ success: true, application });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors
        });
      } else {
        console.error("Error creating streamer application:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  });

  // Get all applications (ЗАЩИЩАЕМ)
  app.get("/api/streamer-applications", isAuthenticatedAdmin, async (req, res) => {
    try {
      const applications = await storage.getAllStreamerApplications();
      res.json({ success: true, applications });
    } catch (error) {
      console.error("Error getting all streamer applications:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Track page views (остается публичным)
  app.post("/api/analytics/page-view", async (req, res) => {
    try {
      const pageViewData = insertPageViewSchema.parse({
        path: req.body.path || "/", // Обеспечиваем значение по умолчанию
        userAgent: req.get("User-Agent"),
        ip: req.ip || req.socket?.remoteAddress, // Используем req.socket.remoteAddress как запасной вариант
      });

      await storage.trackPageView(pageViewData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking page view:", error);
      if (error instanceof z.ZodError) {
         res.status(400).json({ success: false, message: "Invalid page view data", errors: error.errors });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error while tracking page view"
        });
      }
    }
  });

  // Get analytics data (ЗАЩИЩАЕМ)
  app.get("/api/analytics", isAuthenticatedAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Chatbot (остается публичным)
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message } = req.body;

      if (typeof message !== 'string' || !message.trim()) { // Улучшенная проверка
        return res.status(400).json({
          success: false,
          message: "Message is required and must be a non-empty string"
        });
      }

      // ... (ваша логика ответа чат-бота) ...
      let response = "Thanks for your message! Our team will get back to you soon. In the meantime, check out our FAQ section for common questions.";
      // (добавьте вашу логику выбора ответа здесь)

      await storage.trackChatbotInteraction({
        userMessage: message,
        botResponse: response,
      });

      res.json({
        success: true,
        response
      });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}