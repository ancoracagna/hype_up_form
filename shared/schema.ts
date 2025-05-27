import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
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
  twitchChannel: text("twitch_channel"),
  youtubeChannel: text("youtube_channel"),
  contentType: text("content_type").notNull(),
  streamSchedule: text("stream_schedule").notNull(),
  goals: text("goals").notNull(),
  challenges: text("challenges").notNull(),
  socialMedia: text("social_media"),
  email: text("email").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStreamerApplicationSchema = createInsertSchema(streamerApplications).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStreamerApplication = z.infer<typeof insertStreamerApplicationSchema>;
export type StreamerApplication = typeof streamerApplications.$inferSelect;
