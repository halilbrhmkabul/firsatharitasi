import { 
  type User, type InsertUser, 
  type Store, type InsertStore, 
  type Discount, type InsertDiscount,
  type UserFavorite, type InsertUserFavorite,
  type UserVisit, type InsertUserVisit,
  type BusinessActivity, type InsertBusinessActivity,
  users, stores, discounts, userFavorites, userVisits, businessActivities 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, inArray, desc, sql, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Store operations
  getAllStores(): Promise<Store[]>;
  getStoreById(id: number): Promise<Store | undefined>;
  getStoresByOwnerId(ownerId: number): Promise<Store[]>;
  getStoresByFilters(filters: {
    categories?: string[];
    minDiscount?: number;
  }): Promise<Store[]>;
  getTopRatedStores(limit?: number): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, updates: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: number): Promise<boolean>;
  
  // Discount operations
  getDiscountsByStoreId(storeId: number): Promise<Discount[]>;
  getActiveDiscounts(): Promise<Discount[]>;
  createDiscount(discount: InsertDiscount): Promise<Discount>;
  updateDiscount(id: number, updates: Partial<InsertDiscount>): Promise<Discount | undefined>;
  deleteDiscount(id: number): Promise<boolean>;
  
  // User favorites
  getUserFavorites(userId: number): Promise<Store[]>;
  addFavorite(userId: number, storeId: number): Promise<UserFavorite>;
  removeFavorite(userId: number, storeId: number): Promise<boolean>;
  isFavorite(userId: number, storeId: number): Promise<boolean>;
  
  // User visits
  recordVisit(userId: number, storeId: number): Promise<UserVisit>;
  getUserVisitedStores(userId: number, limit?: number): Promise<Store[]>;
  getMostVisitedStores(userId: number, limit?: number): Promise<{store: Store, visitCount: number}[]>;
  
  // Business activity
  recordActivity(storeId: number, activityType: string, metadata?: string): Promise<BusinessActivity>;
  getStoreActivities(storeId: number, limit?: number): Promise<BusinessActivity[]>;
  
  // Loyalty score calculation
  calculateLoyaltyScore(storeId: number): Promise<number>;
  updateStoreLoyaltyScore(storeId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const processedUpdates = { ...updates };
    
    if (processedUpdates.password) {
      processedUpdates.password = await bcrypt.hash(processedUpdates.password, 10);
    }
    
    const [user] = await db.update(users).set(processedUpdates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  // Store operations
  async getAllStores(): Promise<Store[]> {
    return await db.select().from(stores);
  }

  async getStoreById(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store || undefined;
  }

  async getStoresByOwnerId(ownerId: number): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.ownerId, ownerId));
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

  async getTopRatedStores(limit: number = 10): Promise<Store[]> {
    return await db
      .select()
      .from(stores)
      .orderBy(desc(stores.loyaltyScore))
      .limit(limit);
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

  // Discount operations
  async getDiscountsByStoreId(storeId: number): Promise<Discount[]> {
    return await db
      .select()
      .from(discounts)
      .where(eq(discounts.storeId, storeId))
      .orderBy(desc(discounts.createdAt));
  }

  async getActiveDiscounts(): Promise<Discount[]> {
    const now = new Date();
    return await db
      .select()
      .from(discounts)
      .where(
        and(
          eq(discounts.isActive, true),
          gte(discounts.endDate, now)
        )
      )
      .orderBy(desc(discounts.discountRate));
  }

  async createDiscount(insertDiscount: InsertDiscount): Promise<Discount> {
    const [discount] = await db.insert(discounts).values(insertDiscount).returning();
    
    // Record activity and update loyalty score
    await this.recordActivity(insertDiscount.storeId, 'discount_created', JSON.stringify({
      discountRate: insertDiscount.discountRate,
      title: insertDiscount.title
    }));
    await this.updateStoreLoyaltyScore(insertDiscount.storeId);
    
    return discount;
  }

  async updateDiscount(id: number, updates: Partial<InsertDiscount>): Promise<Discount | undefined> {
    const [discount] = await db.update(discounts).set(updates).where(eq(discounts.id, id)).returning();
    return discount || undefined;
  }

  async deleteDiscount(id: number): Promise<boolean> {
    const result = await db.delete(discounts).where(eq(discounts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // User favorites
  async getUserFavorites(userId: number): Promise<Store[]> {
    const favorites = await db
      .select({ store: stores })
      .from(userFavorites)
      .innerJoin(stores, eq(userFavorites.storeId, stores.id))
      .where(eq(userFavorites.userId, userId));
    
    return favorites.map(f => f.store);
  }

  async addFavorite(userId: number, storeId: number): Promise<UserFavorite> {
    const [favorite] = await db
      .insert(userFavorites)
      .values({ userId, storeId })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: number, storeId: number): Promise<boolean> {
    const result = await db
      .delete(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.storeId, storeId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async isFavorite(userId: number, storeId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.storeId, storeId)));
    return !!favorite;
  }

  // User visits
  async recordVisit(userId: number, storeId: number): Promise<UserVisit> {
    const [visit] = await db
      .insert(userVisits)
      .values({ userId, storeId })
      .returning();
    return visit;
  }

  async getUserVisitedStores(userId: number, limit: number = 10): Promise<Store[]> {
    const visits = await db
      .select({ store: stores })
      .from(userVisits)
      .innerJoin(stores, eq(userVisits.storeId, stores.id))
      .where(eq(userVisits.userId, userId))
      .orderBy(desc(userVisits.visitedAt))
      .limit(limit);
    
    return visits.map(v => v.store);
  }

  async getMostVisitedStores(userId: number, limit: number = 5): Promise<{store: Store, visitCount: number}[]> {
    const result = await db
      .select({
        store: stores,
        visitCount: count(userVisits.id)
      })
      .from(userVisits)
      .innerJoin(stores, eq(userVisits.storeId, stores.id))
      .where(eq(userVisits.userId, userId))
      .groupBy(stores.id)
      .orderBy(desc(count(userVisits.id)))
      .limit(limit);
    
    return result.map(r => ({ store: r.store, visitCount: Number(r.visitCount) }));
  }

  // Business activity
  async recordActivity(storeId: number, activityType: string, metadata?: string): Promise<BusinessActivity> {
    const [activity] = await db
      .insert(businessActivities)
      .values({ storeId, activityType, metadata })
      .returning();
    return activity;
  }

  async getStoreActivities(storeId: number, limit: number = 50): Promise<BusinessActivity[]> {
    return await db
      .select()
      .from(businessActivities)
      .where(eq(businessActivities.storeId, storeId))
      .orderBy(desc(businessActivities.createdAt))
      .limit(limit);
  }

  // Loyalty score calculation
  async calculateLoyaltyScore(storeId: number): Promise<number> {
    // Get all discounts for this store
    const storeDiscounts = await this.getDiscountsByStoreId(storeId);
    
    // Get activities for this store in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivities = await db
      .select()
      .from(businessActivities)
      .where(
        and(
          eq(businessActivities.storeId, storeId),
          gte(businessActivities.createdAt, thirtyDaysAgo)
        )
      );
    
    // Calculate score based on:
    // 1. Total discounts created (10 points each, max 50)
    const discountScore = Math.min(storeDiscounts.length * 10, 50);
    
    // 2. Average discount rate (higher is better, max 20 points)
    const avgDiscountRate = storeDiscounts.length > 0 
      ? storeDiscounts.reduce((sum, d) => sum + d.discountRate, 0) / storeDiscounts.length 
      : 0;
    const rateScore = Math.min(avgDiscountRate / 5, 20);
    
    // 3. Recent activity frequency (5 points per activity in last 30 days, max 30)
    const activityScore = Math.min(recentActivities.length * 5, 30);
    
    // Total score (0-100)
    return Math.round(discountScore + rateScore + activityScore);
  }

  async updateStoreLoyaltyScore(storeId: number): Promise<void> {
    const score = await this.calculateLoyaltyScore(storeId);
    await db.update(stores).set({ loyaltyScore: score }).where(eq(stores.id, storeId));
  }
}

export const storage = new DatabaseStorage();
