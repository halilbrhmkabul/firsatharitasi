import { pgTable, text, integer, decimal, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User types: 'customer' = normal user, 'business' = business owner
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  userType: text("user_type").notNull().default("customer"), // 'customer' or 'business'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalı"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  userType: z.enum(["customer", "business"]).default("customer"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Stores table - linked to business owner
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id), // Business owner
  name: text("name").notNull(),
  category: text("category").notNull(), // 'Food', 'Shopping', 'Entertainment', 'Event', 'Service'
  discountRate: integer("discount_rate").notNull().default(0),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  address: text("address").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull().default("0"),
  loyaltyScore: integer("loyalty_score").default(0),
  isSponsored: boolean("is_sponsored").default(false),
  isVerified: boolean("is_verified").default(false), // Blue checkmark for verified businesses
  openingDate: text("opening_date"), // ISO date string for "coming soon" stores
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
});

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

// Discounts/Deals table - tracks all discount history
export const discounts = pgTable("discounts", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discountRate: integer("discount_rate").notNull(), // Percentage off
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDiscountSchema = createInsertSchema(discounts).omit({
  id: true,
  createdAt: true,
});

export type InsertDiscount = z.infer<typeof insertDiscountSchema>;
export type Discount = typeof discounts.$inferSelect;

// User favorites - stores that users follow
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storeId: integer("store_id").references(() => stores.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;

// User visits - tracks user visits to stores (for personalization)
export const userVisits = pgTable("user_visits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storeId: integer("store_id").references(() => stores.id).notNull(),
  visitedAt: timestamp("visited_at").defaultNow().notNull(),
});

export const insertUserVisitSchema = createInsertSchema(userVisits).omit({
  id: true,
});

export type InsertUserVisit = z.infer<typeof insertUserVisitSchema>;
export type UserVisit = typeof userVisits.$inferSelect;

// Business activity log - for calculating loyalty score
export const businessActivities = pgTable("business_activities", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id).notNull(),
  activityType: text("activity_type").notNull(), // 'discount_created', 'discount_updated', 'profile_updated'
  metadata: text("metadata"), // JSON string with activity details
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBusinessActivitySchema = createInsertSchema(businessActivities).omit({
  id: true,
  createdAt: true,
});

export type InsertBusinessActivity = z.infer<typeof insertBusinessActivitySchema>;
export type BusinessActivity = typeof businessActivities.$inferSelect;

// Store creation schema for business owners
export const createStoreSchema = z.object({
  name: z.string().min(2, "Mağaza adı en az 2 karakter olmalı"),
  category: z.enum(["Food", "Shopping", "Entertainment", "Event", "Service"]),
  latitude: z.string().or(z.number()),
  longitude: z.string().or(z.number()),
  address: z.string().min(5, "Adres en az 5 karakter olmalı"),
  image: z.string().url("Geçerli bir resim URL'si girin").optional().or(z.literal("")),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalı"),
});

export const createDiscountSchema = z.object({
  storeId: z.number(),
  title: z.string().min(3, "Başlık en az 3 karakter olmalı"),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalı"),
  discountRate: z.number().min(1).max(100),
  originalPrice: z.string().optional(),
  discountedPrice: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
