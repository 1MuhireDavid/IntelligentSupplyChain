import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  company: text("company"),
  role: text("role").default("trader"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Market data table
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull(),
  category: text("category").notNull(),
  currentPrice: real("current_price").notNull(),
  priceChange: real("price_change"),
  currency: text("currency").default("USD"),
  marketPlace: text("market_place"),
  timestamp: timestamp("timestamp").defaultNow(),
  historicalData: jsonb("historical_data"),
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
  timestamp: true,
});

// Shipping routes table
export const shippingRoutes = pgTable("shipping_routes", {
  id: serial("id").primaryKey(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  distance: real("distance").notNull(),
  transportMode: text("transport_mode").notNull(),
  transitTime: real("transit_time").notNull(), // in days
  cost: real("cost").notNull(),
  carbonFootprint: real("carbon_footprint"),
  efficiency: real("efficiency"), // percentage
  status: text("status").default("active"),
  userId: integer("user_id").notNull(),
});

export const insertShippingRouteSchema = createInsertSchema(shippingRoutes).omit({
  id: true,
});

// Customs documents table
export const customsDocuments = pgTable("customs_documents", {
  id: serial("id").primaryKey(),
  shipmentId: text("shipment_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  destination: text("destination").notNull(),
  status: text("status").default("pending"),
  clearanceDate: timestamp("clearance_date"),
  progress: integer("progress").default(0), // 0-100
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomsDocumentSchema = createInsertSchema(customsDocuments).omit({
  id: true,
  createdAt: true,
});

// Currency exchange rates table
export const currencyExchangeRates = pgTable("currency_exchange_rates", {
  id: serial("id").primaryKey(),
  baseCurrency: text("base_currency").notNull(),
  targetCurrency: text("target_currency").notNull(),
  rate: real("rate").notNull(),
  change: real("change"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertCurrencyExchangeRateSchema = createInsertSchema(currencyExchangeRates).omit({
  id: true,
  lastUpdated: true,
});

// Market opportunities table
export const marketOpportunities = pgTable("market_opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  potentialLevel: text("potential_level").notNull(), // High, Medium, Emerging
  profitMargin: real("profit_margin"),
  market: text("market").notNull(),
  product: text("product").notNull(),
  isBookmarked: boolean("is_bookmarked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarketOpportunitySchema = createInsertSchema(marketOpportunities).omit({
  id: true,
  createdAt: true,
});

// Activities log table
export const activitiesLog = pgTable("activities_log", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // shipping, weather, market, document
  timestamp: timestamp("timestamp").defaultNow(),
  userId: integer("user_id"),
  relatedId: integer("related_id"),
  relatedType: text("related_type"),
});

export const insertActivityLogSchema = createInsertSchema(activitiesLog).omit({
  id: true,
  timestamp: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

export type ShippingRoute = typeof shippingRoutes.$inferSelect;
export type InsertShippingRoute = z.infer<typeof insertShippingRouteSchema>;

export type CustomsDocument = typeof customsDocuments.$inferSelect;
export type InsertCustomsDocument = z.infer<typeof insertCustomsDocumentSchema>;

export type CurrencyExchangeRate = typeof currencyExchangeRates.$inferSelect;
export type InsertCurrencyExchangeRate = z.infer<typeof insertCurrencyExchangeRateSchema>;

export type MarketOpportunity = typeof marketOpportunities.$inferSelect;
export type InsertMarketOpportunity = z.infer<typeof insertMarketOpportunitySchema>;

export type ActivityLog = typeof activitiesLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
