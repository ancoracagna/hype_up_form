import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pool } from "./db"; // Убедитесь, что pool экспортируется и используется

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Настройка хранилища сессий
const PgStore = connectPgSimple(session);
const sessionStore = new PgStore({
  pool: pool, // Ваш пул подключений к PostgreSQL
  tableName: "user_sessions", // Имя таблицы для сессий
  createTableIfMissing: true, // Автоматически создать таблицу, если её нет
});

// Настройка сессий
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "fallback-secret-key-please-change", // ЗАМЕНИТЕ НА СЕКРЕТНЫЙ КЛЮЧ В .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true в продакшене (требует HTTPS)
      httpOnly: true, // Предотвращает доступ к куке через JS на клиенте
      maxAge: 1000 * 60 * 60 * 24, // 1 день (в миллисекундах)
    },
  }),
);

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session()); // Используем сессии для Passport

// Middleware для логирования запросов
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(this, [bodyJson, ...args] as any); // Добавил 'as any' для совместимости типов
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && Object.keys(capturedJsonResponse).length > 0) { // Проверяем, что объект не пустой
        const responseLog = JSON.stringify(capturedJsonResponse);
        // Ограничиваем длину лога ответа, если он слишком большой
        const maxResponseLogLength = 200;
        logLine += ` :: ${responseLog.length > maxResponseLogLength ? responseLog.substring(0, maxResponseLogLength) + "..." : responseLog}`;
      }

      if (logLine.length > 300) { // Увеличил общую длину лога
        logLine = logLine.slice(0, 299) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app); // registerRoutes теперь также настраивает passport

  // Middleware для обработки ошибок (должен идти после всех роутов)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err); // Добавим логирование ошибки на сервере
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ success: false, message }); // Добавил success: false для консистентности
    // В development можно передавать stack: err.stack
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Serving on port ${port}`);
  });
})();