import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const streamerApplications = pgTable("streamer_applications", {
  id: serial("id").primaryKey(),
  telegramUserId: text("telegram_user_id"),
  telegramUsername: text("telegram_username").notNull(), // УБЕДИТЕСЬ, ЧТО ЭТО ЕСТЬ
  twitchChannel: text("twitch_channel"),
  youtubeChannel: text("youtube_channel"),
  contentType: text("content_type").notNull(),
  streamSchedule: text("stream_schedule").notNull(),
  goals: text("goals").notNull(),
  challenges: text("challenges").notNull(),
  socialMedia: text("social_media"),
  // email: text("email").notNull(), // УБЕДИТЕСЬ, ЧТО ЭТА СТРОКА ЗАКОММЕНТИРОВАНА ИЛИ УДАЛЕНА
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatbotInteractions = pgTable("chatbot_interactions", {
  id: serial("id").primaryKey(),
  userMessage: text("user_message").notNull(),
  botResponse: text("bot_response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});



export const insertStreamerApplicationSchema = createInsertSchema(streamerApplications, {
  // Можно добавить кастомные правила валидации для Zod, если нужно
  telegramUsername: z.string().min(2, "Ник в Telegram должен содержать хотя бы 2 символа").regex(/^@?[a-zA-Z0-9_]{2,32}$/, "Некорректный формат ника Telegram (например, @username или username)"),
}).omit({
id: true,
createdAt: true,
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  createdAt: true,
});

export const insertChatbotInteractionSchema = createInsertSchema(chatbotInteractions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStreamerApplication = z.infer<typeof insertStreamerApplicationSchema>;
export type StreamerApplication = typeof streamerApplications.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type ChatbotInteraction = typeof chatbotInteractions.$inferSelect;
export type InsertChatbotInteraction = z.infer<typeof insertChatbotInteractionSchema>;
