import { type User, type InsertUser, type Store, type InsertStore, users, stores } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Store operations
  getAllStores(): Promise<Store[]>;
  getStoreById(id: number): Promise<Store | undefined>;
  getStoresByFilters(filters: {
    categories?: string[];
    minDiscount?: number;
  }): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, updates: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllStores(): Promise<Store[]> {
    return await db.select().from(stores);
  }

  async getStoreById(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store || undefined;
  }

  async getStoresByFilters(filters: {
    categories?: string[];
    minDiscount?: number;
  }): Promise<Store[]> {
    const conditions = [];
    
    if (filters.categories && filters.categories.length > 0) {
      conditions.push(inArray(stores.category, filters.categories));
    }
    
    if (filters.minDiscount !== undefined && filters.minDiscount > 0) {
      conditions.push(gte(stores.discountRate, filters.minDiscount));
    }

    if (conditions.length === 0) {
      return this.getAllStores();
    }

    return await db.select().from(stores).where(and(...conditions));
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const [store] = await db.insert(stores).values(insertStore).returning();
    return store;
  }

  async updateStore(id: number, updates: Partial<InsertStore>): Promise<Store | undefined> {
    const [store] = await db.update(stores).set(updates).where(eq(stores.id, id)).returning();
    return store || undefined;
  }

  async deleteStore(id: number): Promise<boolean> {
    const result = await db.delete(stores).where(eq(stores.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
