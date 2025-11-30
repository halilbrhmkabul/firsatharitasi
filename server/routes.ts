import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStoreSchema, registerSchema, loginSchema, createStoreSchema, createDiscountSchema, rateStoreSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";

// Middleware to check if user is authenticated
function requireAuth(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Oturum açılmamış" });
  }
  req.userId = userId;
  next();
}

// Middleware to check if user is a business owner
async function requireBusiness(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Oturum açılmamış" });
  }
  
  const user = await storage.getUser(userId);
  if (!user || user.userType !== 'business') {
    return res.status(403).json({ error: "Bu işlem için işletme hesabı gerekli" });
  }
  
  req.userId = userId;
  req.user = user;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Bu e-posta adresi zaten kayıtlı" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        userType: validatedData.userType || 'customer',
      });
      
      // Set session
      (req.session as any).userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Register error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.issues[0]?.message || "Geçersiz veri" });
      }
      res.status(500).json({ error: "Kayıt işlemi başarısız" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ error: "E-posta veya şifre hatalı" });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "E-posta veya şifre hatalı" });
      }
      
      // Set session
      (req.session as any).userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Login error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.issues[0]?.message || "Geçersiz veri" });
      }
      res.status(500).json({ error: "Giriş işlemi başarısız" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Çıkış işlemi başarısız" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Çıkış başarılı" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Oturum açılmamış" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Store routes (public)
  app.get("/api/stores", async (req, res) => {
    try {
      const { categories, minDiscount } = req.query;
      
      const filters: {
        categories?: string[];
        minDiscount?: number;
      } = {};

      if (categories) {
        filters.categories = Array.isArray(categories) 
          ? categories.map(c => String(c)) 
          : [String(categories)];
      }

      if (minDiscount) {
        filters.minDiscount = parseInt(minDiscount as string, 10);
      }

      const stores = await storage.getStoresByFilters(filters);
      res.json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ error: "Mağazalar yüklenemedi" });
    }
  });

  app.get("/api/stores/top", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const stores = await storage.getTopRatedStores(limit);
      res.json(stores);
    } catch (error) {
      console.error("Error fetching top stores:", error);
      res.status(500).json({ error: "Vitrin mağazaları yüklenemedi" });
    }
  });

  app.get("/api/stores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const store = await storage.getStoreById(id);
      
      if (!store) {
        return res.status(404).json({ error: "Mağaza bulunamadı" });
      }

      res.json(store);
    } catch (error) {
      console.error("Error fetching store:", error);
      res.status(500).json({ error: "Mağaza yüklenemedi" });
    }
  });

  app.get("/api/stores/:id/discounts", async (req, res) => {
    try {
      const storeId = parseInt(req.params.id, 10);
      const discounts = await storage.getDiscountsByStoreId(storeId);
      res.json(discounts);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      res.status(500).json({ error: "İndirimler yüklenemedi" });
    }
  });

  // Business owner routes
  app.get("/api/business/stores", requireBusiness, async (req: any, res) => {
    try {
      const stores = await storage.getStoresByOwnerId(req.userId);
      res.json(stores);
    } catch (error) {
      console.error("Error fetching business stores:", error);
      res.status(500).json({ error: "Mağazalar yüklenemedi" });
    }
  });

  app.post("/api/business/stores", requireBusiness, async (req: any, res) => {
    try {
      const validatedData = createStoreSchema.parse(req.body);
      
      const store = await storage.createStore({
        ...validatedData,
        ownerId: req.userId,
        latitude: String(validatedData.latitude),
        longitude: String(validatedData.longitude),
        image: validatedData.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        discountRate: 0,
        rating: "0",
        loyaltyScore: 0,
        isSponsored: false,
        isVerified: false,
      });
      
      // Record activity
      await storage.recordActivity(store.id, 'store_created');
      
      res.status(201).json(store);
    } catch (error: any) {
      console.error("Error creating store:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.issues[0]?.message || "Geçersiz veri" });
      }
      res.status(500).json({ error: "Mağaza oluşturulamadı" });
    }
  });

  app.patch("/api/business/stores/:id", requireBusiness, async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.id, 10);
      
      // Check ownership
      const existingStore = await storage.getStoreById(storeId);
      if (!existingStore || existingStore.ownerId !== req.userId) {
        return res.status(403).json({ error: "Bu mağazayı düzenleme yetkiniz yok" });
      }
      
      const updates = req.body;
      const store = await storage.updateStore(storeId, updates);
      
      // Record activity
      await storage.recordActivity(storeId, 'store_updated');
      await storage.updateStoreLoyaltyScore(storeId);
      
      res.json(store);
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(500).json({ error: "Mağaza güncellenemedi" });
    }
  });

  app.delete("/api/business/stores/:id", requireBusiness, async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.id, 10);
      
      // Check ownership
      const existingStore = await storage.getStoreById(storeId);
      if (!existingStore || existingStore.ownerId !== req.userId) {
        return res.status(403).json({ error: "Bu mağazayı silme yetkiniz yok" });
      }
      
      await storage.deleteStore(storeId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting store:", error);
      res.status(500).json({ error: "Mağaza silinemedi" });
    }
  });

  // Discount routes for business owners
  app.post("/api/business/discounts", requireBusiness, async (req: any, res) => {
    try {
      const validatedData = createDiscountSchema.parse(req.body);
      
      // Check store ownership
      const store = await storage.getStoreById(validatedData.storeId);
      if (!store || store.ownerId !== req.userId) {
        return res.status(403).json({ error: "Bu mağazaya indirim ekleme yetkiniz yok" });
      }
      
      const discount = await storage.createDiscount({
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        isActive: true,
      });
      
      // Update store's current discount rate to the highest active discount
      const discounts = await storage.getDiscountsByStoreId(validatedData.storeId);
      const activeDiscounts = discounts.filter(d => d.isActive && new Date(d.endDate) > new Date());
      if (activeDiscounts.length > 0) {
        const maxDiscount = Math.max(...activeDiscounts.map(d => d.discountRate));
        await storage.updateStore(validatedData.storeId, { discountRate: maxDiscount });
      }
      
      res.status(201).json(discount);
    } catch (error: any) {
      console.error("Error creating discount:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.issues[0]?.message || "Geçersiz veri" });
      }
      res.status(500).json({ error: "İndirim oluşturulamadı" });
    }
  });

  app.patch("/api/business/discounts/:id", requireBusiness, async (req: any, res) => {
    try {
      const discountId = parseInt(req.params.id, 10);
      const updates = req.body;
      
      const discount = await storage.updateDiscount(discountId, updates);
      if (!discount) {
        return res.status(404).json({ error: "İndirim bulunamadı" });
      }
      
      res.json(discount);
    } catch (error) {
      console.error("Error updating discount:", error);
      res.status(500).json({ error: "İndirim güncellenemedi" });
    }
  });

  app.delete("/api/business/discounts/:id", requireBusiness, async (req: any, res) => {
    try {
      const discountId = parseInt(req.params.id, 10);
      await storage.deleteDiscount(discountId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting discount:", error);
      res.status(500).json({ error: "İndirim silinemedi" });
    }
  });

  // User favorites routes
  app.get("/api/favorites", requireAuth, async (req: any, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: "Favoriler yüklenemedi" });
    }
  });

  app.post("/api/favorites/:storeId", requireAuth, async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      
      // Check if already favorite
      const isFav = await storage.isFavorite(req.userId, storeId);
      if (isFav) {
        return res.status(400).json({ error: "Zaten favorilerde" });
      }
      
      const favorite = await storage.addFavorite(req.userId, storeId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ error: "Favorilere eklenemedi" });
    }
  });

  app.delete("/api/favorites/:storeId", requireAuth, async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      await storage.removeFavorite(req.userId, storeId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Favorilerden kaldırılamadı" });
    }
  });

  app.get("/api/favorites/:storeId/check", requireAuth, async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const isFavorite = await storage.isFavorite(req.userId, storeId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ error: "Favori durumu kontrol edilemedi" });
    }
  });

  // User visits routes
  app.post("/api/visits/:storeId", requireAuth, async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const visit = await storage.recordVisit(req.userId, storeId);
      res.status(201).json(visit);
    } catch (error) {
      console.error("Error recording visit:", error);
      res.status(500).json({ error: "Ziyaret kaydedilemedi" });
    }
  });

  app.get("/api/recommendations", requireAuth, async (req: any, res) => {
    try {
      // Get user's most visited stores for personalized recommendations
      const mostVisited = await storage.getMostVisitedStores(req.userId, 5);
      
      // Get user's favorites
      const favorites = await storage.getUserFavorites(req.userId);
      
      // Get top rated stores that aren't already in favorites
      const topStores = await storage.getTopRatedStores(10);
      const favoriteIds = new Set(favorites.map(f => f.id));
      const newRecommendations = topStores.filter(s => !favoriteIds.has(s.id));
      
      res.json({
        personalized: mostVisited.map(m => m.store),
        topRated: newRecommendations,
        favorites: favorites.slice(0, 5),
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Öneriler yüklenemedi" });
    }
  });

  // Store ratings routes
  app.get("/api/stores/:id/ratings", async (req, res) => {
    try {
      const storeId = parseInt(req.params.id, 10);
      const ratings = await storage.getStoreRatings(storeId);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ error: "Puanlar yüklenemedi" });
    }
  });

  app.post("/api/stores/:id/ratings", requireAuth, async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.id, 10);
      const validatedData = rateStoreSchema.parse(req.body);
      
      const rating = await storage.rateStore(
        req.userId, 
        storeId, 
        validatedData.rating, 
        validatedData.comment
      );
      
      // Also record a visit when rating
      await storage.recordVisit(req.userId, storeId);
      
      res.status(201).json(rating);
    } catch (error: any) {
      console.error("Error rating store:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.issues[0]?.message || "Geçersiz veri" });
      }
      res.status(500).json({ error: "Puanlama başarısız" });
    }
  });

  app.get("/api/stores/:id/my-rating", requireAuth, async (req: any, res) => {
    try {
      const storeId = parseInt(req.params.id, 10);
      const rating = await storage.getUserRating(req.userId, storeId);
      res.json({ rating: rating || null });
    } catch (error) {
      console.error("Error fetching user rating:", error);
      res.status(500).json({ error: "Puan bilgisi yüklenemedi" });
    }
  });

  // Legacy store routes (for compatibility)
  app.post("/api/stores", async (req, res) => {
    try {
      const validatedData = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(validatedData);
      res.status(201).json(store);
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(400).json({ error: "Geçersiz mağaza verisi" });
    }
  });

  app.patch("/api/stores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updates = req.body;
      
      const store = await storage.updateStore(id, updates);
      
      if (!store) {
        return res.status(404).json({ error: "Mağaza bulunamadı" });
      }

      res.json(store);
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(500).json({ error: "Mağaza güncellenemedi" });
    }
  });

  app.delete("/api/stores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await storage.deleteStore(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Mağaza bulunamadı" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting store:", error);
      res.status(500).json({ error: "Mağaza silinemedi" });
    }
  });

  return httpServer;
}
