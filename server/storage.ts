import { users, streamerApplications, type User, type InsertUser, type StreamerApplication, type InsertStreamerApplication } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createStreamerApplication(application: InsertStreamerApplication): Promise<StreamerApplication>;
  getStreamerApplication(id: number): Promise<StreamerApplication | undefined>;
  getAllStreamerApplications(): Promise<StreamerApplication[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private streamerApplications: Map<number, StreamerApplication>;
  private currentUserId: number;
  private currentApplicationId: number;

  constructor() {
    this.users = new Map();
    this.streamerApplications = new Map();
    this.currentUserId = 1;
    this.currentApplicationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createStreamerApplication(insertApplication: InsertStreamerApplication): Promise<StreamerApplication> {
    const id = this.currentApplicationId++;
    const application: StreamerApplication = { ...insertApplication, id };
    this.streamerApplications.set(id, application);
    return application;
  }

  async getStreamerApplication(id: number): Promise<StreamerApplication | undefined> {
    return this.streamerApplications.get(id);
  }

  async getAllStreamerApplications(): Promise<StreamerApplication[]> {
    return Array.from(this.streamerApplications.values());
  }
}

export const storage = new MemStorage();
