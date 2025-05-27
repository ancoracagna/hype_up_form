import { users, streamerApplications, pageViews, chatbotInteractions, type User, type InsertUser, type StreamerApplication, type InsertStreamerApplication, type PageView, type InsertPageView, type ChatbotInteraction, type InsertChatbotInteraction } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createStreamerApplication(application: InsertStreamerApplication): Promise<StreamerApplication>;
  getStreamerApplication(id: number): Promise<StreamerApplication | undefined>;
  getAllStreamerApplications(): Promise<StreamerApplication[]>;
  trackPageView(pageView: InsertPageView): Promise<PageView>;
  trackChatbotInteraction(interaction: InsertChatbotInteraction): Promise<ChatbotInteraction>;
  getAnalytics(): Promise<{
    totalApplications: number;
    totalPageViews: number;
    totalChatInteractions: number;
    recentApplications: StreamerApplication[];
    pageViewsToday: number;
    chatInteractionsToday: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createStreamerApplication(insertApplication: InsertStreamerApplication): Promise<StreamerApplication> {
    const [application] = await db
      .insert(streamerApplications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async getStreamerApplication(id: number): Promise<StreamerApplication | undefined> {
    const [application] = await db.select().from(streamerApplications).where(eq(streamerApplications.id, id));
    return application || undefined;
  }

  async getAllStreamerApplications(): Promise<StreamerApplication[]> {
    return await db.select().from(streamerApplications).orderBy(desc(streamerApplications.createdAt));
  }

  async trackPageView(pageView: InsertPageView): Promise<PageView> {
    const [view] = await db
      .insert(pageViews)
      .values(pageView)
      .returning();
    return view;
  }

  async trackChatbotInteraction(interaction: InsertChatbotInteraction): Promise<ChatbotInteraction> {
    const [chatInteraction] = await db
      .insert(chatbotInteractions)
      .values(interaction)
      .returning();
    return chatInteraction;
  }

  async getAnalytics(): Promise<{
    totalApplications: number;
    totalPageViews: number;
    totalChatInteractions: number;
    recentApplications: StreamerApplication[];
    pageViewsToday: number;
    chatInteractionsToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalApplications] = await db.select({ count: count() }).from(streamerApplications);
    const [totalPageViews] = await db.select({ count: count() }).from(pageViews);
    const [totalChatInteractions] = await db.select({ count: count() }).from(chatbotInteractions);
    
    const [pageViewsToday] = await db
      .select({ count: count() })
      .from(pageViews)
      .where(sql`${pageViews.createdAt} >= ${today}`);
    
    const [chatInteractionsToday] = await db
      .select({ count: count() })
      .from(chatbotInteractions)
      .where(sql`${chatbotInteractions.createdAt} >= ${today}`);

    const recentApplications = await db
      .select()
      .from(streamerApplications)
      .orderBy(desc(streamerApplications.createdAt))
      .limit(10);

    return {
      totalApplications: totalApplications.count,
      totalPageViews: totalPageViews.count,
      totalChatInteractions: totalChatInteractions.count,
      recentApplications,
      pageViewsToday: pageViewsToday.count,
      chatInteractionsToday: chatInteractionsToday.count,
    };
  }
}

export const storage = new DatabaseStorage();
