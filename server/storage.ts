import { 
  users, 
  type User, 
  type InsertUser, 
  marketData, 
  type MarketData, 
  type InsertMarketData,
  shippingRoutes,
  type ShippingRoute,
  type InsertShippingRoute,
  customsDocuments,
  type CustomsDocument,
  type InsertCustomsDocument,
  currencyExchangeRates,
  type CurrencyExchangeRate,
  type InsertCurrencyExchangeRate,
  marketOpportunities,
  type MarketOpportunity,
  type InsertMarketOpportunity,
  activitiesLog,
  type ActivityLog,
  type InsertActivityLog
} from "@shared/schema";
import { pool, db } from "./db";
import { eq, like, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Market data methods
  getMarketData(id: number): Promise<MarketData | undefined>;
  getAllMarketData(): Promise<MarketData[]>;
  getMarketDataByProduct(product: string): Promise<MarketData[]>;
  createMarketData(data: InsertMarketData): Promise<MarketData>;
  updateMarketData(id: number, data: Partial<InsertMarketData>): Promise<MarketData | undefined>;
  
  // Shipping routes methods
  getShippingRoute(id: number): Promise<ShippingRoute | undefined>;
  getShippingRoutesByUser(userId: number): Promise<ShippingRoute[]>;
  createShippingRoute(route: InsertShippingRoute): Promise<ShippingRoute>;
  updateShippingRoute(id: number, route: Partial<InsertShippingRoute>): Promise<ShippingRoute | undefined>;
  
  // Customs documents methods
  getCustomsDocument(id: number): Promise<CustomsDocument | undefined>;
  getCustomsDocumentsByUser(userId: number): Promise<CustomsDocument[]>;
  createCustomsDocument(doc: InsertCustomsDocument): Promise<CustomsDocument>;
  updateCustomsDocument(id: number, doc: Partial<InsertCustomsDocument>): Promise<CustomsDocument | undefined>;
  
  // Currency exchange rates methods
  getCurrencyExchangeRate(id: number): Promise<CurrencyExchangeRate | undefined>;
  getAllCurrencyExchangeRates(): Promise<CurrencyExchangeRate[]>;
  createCurrencyExchangeRate(rate: InsertCurrencyExchangeRate): Promise<CurrencyExchangeRate>;
  updateCurrencyExchangeRate(id: number, rate: Partial<InsertCurrencyExchangeRate>): Promise<CurrencyExchangeRate | undefined>;
  
  // Market opportunities methods
  getMarketOpportunity(id: number): Promise<MarketOpportunity | undefined>;
  getAllMarketOpportunities(): Promise<MarketOpportunity[]>;
  createMarketOpportunity(opportunity: InsertMarketOpportunity): Promise<MarketOpportunity>;
  updateMarketOpportunity(id: number, opportunity: Partial<InsertMarketOpportunity>): Promise<MarketOpportunity | undefined>;
  
  // Activities log methods
  getActivityLog(id: number): Promise<ActivityLog | undefined>;
  getActivityLogsByUser(userId: number): Promise<ActivityLog[]>;
  getRecentActivityLogs(limit: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool, 
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Market data methods
  async getMarketData(id: number): Promise<MarketData | undefined> {
    const [data] = await db.select().from(marketData).where(eq(marketData.id, id));
    return data;
  }

  async getAllMarketData(): Promise<MarketData[]> {
    return await db.select().from(marketData);
  }

  async getMarketDataByProduct(product: string): Promise<MarketData[]> {
    return await db.select().from(marketData)
      .where(like(marketData.productName, `%${product}%`));
  }

  async createMarketData(data: InsertMarketData): Promise<MarketData> {
    const [marketDataResult] = await db
      .insert(marketData)
      .values(data)
      .returning();
    return marketDataResult;
  }

  async updateMarketData(id: number, data: Partial<InsertMarketData>): Promise<MarketData | undefined> {
    const [updated] = await db
      .update(marketData)
      .set(data)
      .where(eq(marketData.id, id))
      .returning();
    return updated;
  }

  // Shipping routes methods
  async getShippingRoute(id: number): Promise<ShippingRoute | undefined> {
    const [route] = await db.select().from(shippingRoutes).where(eq(shippingRoutes.id, id));
    return route;
  }

  async getShippingRoutesByUser(userId: number): Promise<ShippingRoute[]> {
    return await db.select().from(shippingRoutes).where(eq(shippingRoutes.userId, userId));
  }

  async createShippingRoute(route: InsertShippingRoute): Promise<ShippingRoute> {
    const [routeResult] = await db
      .insert(shippingRoutes)
      .values(route)
      .returning();
    return routeResult;
  }

  async updateShippingRoute(id: number, route: Partial<InsertShippingRoute>): Promise<ShippingRoute | undefined> {
    const [updated] = await db
      .update(shippingRoutes)
      .set(route)
      .where(eq(shippingRoutes.id, id))
      .returning();
    return updated;
  }

  // Customs documents methods
  async getCustomsDocument(id: number): Promise<CustomsDocument | undefined> {
    const [doc] = await db.select().from(customsDocuments).where(eq(customsDocuments.id, id));
    return doc;
  }

  async getCustomsDocumentsByUser(userId: number): Promise<CustomsDocument[]> {
    return await db.select().from(customsDocuments).where(eq(customsDocuments.userId, userId));
  }

  async createCustomsDocument(doc: InsertCustomsDocument): Promise<CustomsDocument> {
    const [docResult] = await db
      .insert(customsDocuments)
      .values(doc)
      .returning();
    return docResult;
  }

  async updateCustomsDocument(id: number, doc: Partial<InsertCustomsDocument>): Promise<CustomsDocument | undefined> {
    const [updated] = await db
      .update(customsDocuments)
      .set(doc)
      .where(eq(customsDocuments.id, id))
      .returning();
    return updated;
  }

  // Currency exchange rates methods
  async getCurrencyExchangeRate(id: number): Promise<CurrencyExchangeRate | undefined> {
    const [rate] = await db.select().from(currencyExchangeRates).where(eq(currencyExchangeRates.id, id));
    return rate;
  }

  async getAllCurrencyExchangeRates(): Promise<CurrencyExchangeRate[]> {
    return await db.select().from(currencyExchangeRates);
  }

  async createCurrencyExchangeRate(rate: InsertCurrencyExchangeRate): Promise<CurrencyExchangeRate> {
    const [rateResult] = await db
      .insert(currencyExchangeRates)
      .values(rate)
      .returning();
    return rateResult;
  }

  async updateCurrencyExchangeRate(id: number, rate: Partial<InsertCurrencyExchangeRate>): Promise<CurrencyExchangeRate | undefined> {
    const [updated] = await db
      .update(currencyExchangeRates)
      .set(rate)
      .where(eq(currencyExchangeRates.id, id))
      .returning();
    return updated;
  }

  // Market opportunities methods
  async getMarketOpportunity(id: number): Promise<MarketOpportunity | undefined> {
    const [opportunity] = await db.select().from(marketOpportunities).where(eq(marketOpportunities.id, id));
    return opportunity;
  }

  async getAllMarketOpportunities(): Promise<MarketOpportunity[]> {
    return await db.select().from(marketOpportunities);
  }

  async createMarketOpportunity(opportunity: InsertMarketOpportunity): Promise<MarketOpportunity> {
    const [opportunityResult] = await db
      .insert(marketOpportunities)
      .values(opportunity)
      .returning();
    return opportunityResult;
  }

  async updateMarketOpportunity(id: number, opportunity: Partial<InsertMarketOpportunity>): Promise<MarketOpportunity | undefined> {
    const [updated] = await db
      .update(marketOpportunities)
      .set(opportunity)
      .where(eq(marketOpportunities.id, id))
      .returning();
    return updated;
  }

  // Activities log methods
  async getActivityLog(id: number): Promise<ActivityLog | undefined> {
    const [log] = await db.select().from(activitiesLog).where(eq(activitiesLog.id, id));
    return log;
  }

  async getActivityLogsByUser(userId: number): Promise<ActivityLog[]> {
    return await db.select().from(activitiesLog)
      .where(eq(activitiesLog.userId, userId))
      .orderBy(desc(activitiesLog.timestamp));
  }

  async getRecentActivityLogs(limit: number): Promise<ActivityLog[]> {
    return await db.select().from(activitiesLog)
      .orderBy(desc(activitiesLog.timestamp))
      .limit(limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [logResult] = await db
      .insert(activitiesLog)
      .values(log)
      .returning();
    return logResult;
  }
}

export const storage = new DatabaseStorage();
