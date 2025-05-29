// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pool } from "./db";
import http from 'http'; // Используем http.createServer

const app = express();

// --- НАСТРОЙКА ДЛЯ РАБОТЫ ЗА HTTPS-ТЕРМИНИРУЮЩИМ ПРОКСИ ---
// Это должно быть одной из первых вещей, которые вы настраиваете для app
if (process.env.NODE_ENV === 'production') {
  // '1' означает доверие первому прокси в заголовке X-Forwarded-For.
  // Это значение может потребовать корректировки в зависимости от вашей хостинг-платформы.
  // Некоторые требуют 'loopback', другие могут указывать на количество прокси.
  // Проверьте документацию вашего хостинга или начните с '1'.
  app.set('trust proxy', 1);
  console.log("Production mode: 'trust proxy' is set to 1. SERVER IS EXPECTING TO BE BEHIND AN HTTPS TERMINATING PROXY.");
} else {
  console.log("Development mode: 'trust proxy' is NOT set. SERVER IS EXPECTING PLAIN HTTP.");
}
// -----------------------------------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Настройка хранилища сессий
const PgStore = connectPgSimple(session);
const sessionStore = new PgStore({
  pool: pool,
  tableName: "user_sessions",
  createTableIfMissing: true,
});

// Настройка сессий
console.log("Current NODE_ENV for session cookie config:", process.env.NODE_ENV);
const isProduction = process.env.NODE_ENV === 'production';
console.log("Cookie secure will be set to:", isProduction);
console.log("Cookie proxy will be set to:", isProduction);


app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "fallback-secret-key-please-change",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // TRUE для production (HTTPS), FALSE для development (HTTP)
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 день
      sameSite: 'lax', // Хороший стандарт
      path: '/',       // Стандартный путь
      // domain: '.yourdomain.com', // Указывать только если нужно для субдоменов
      proxy: isProduction, // ВАЖНО! Говорит express-session доверять X-Forwarded-Proto, если app.set('trust proxy') настроено.
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// ... ваш middleware логирования запросов ...
app.use((req: Request, res: Response, next: NextFunction) => {
  // (ваш код логирования)
  // Добавим сюда лог для req.secure и req.protocol, чтобы видеть, что Express думает
  if (req.path.startsWith("/api/auth")) { // Логируем только для auth роутов для краткости
    console.log(`[Auth Route Check] Path: ${req.path}, Method: ${req.method}, req.secure: ${req.secure}, req.protocol: ${req.protocol}, X-Forwarded-Proto: ${req.headers['x-forwarded-proto']}`);
  }
  next();
});


(async () => {
  // registerRoutes больше не создает сервер, а только настраивает роуты на 'app'
  await registerRoutes(app);

  // Middleware для обработки ошибок
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error on server:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ success: false, message });
  });

  // Создаем HTTP сервер. В продакшене он будет за HTTPS-терминирующим прокси.
  const httpServer = http.createServer(app);

  if (app.get("env") === "development") {
    console.log("Setting up Vite for development...");
    await setupVite(app, httpServer); // Vite работает с этим httpServer
  } else {
    console.log("Serving static files for production...");
    serveStatic(app); // Для продакшена, если Vite не используется
  }

  const port = process.env.PORT || 5000; // Платформа может указывать свой порт через process.env.PORT
  httpServer.listen({
    port,
    host: "0.0.0.0", // Слушать на всех интерфейсах, важно для PaaS/контейнеров
    reusePort: true,
  }, () => {
    log(`HTTP Server running on port ${port}. In production, this should be behind an HTTPS-terminating proxy.`);
  });
})();