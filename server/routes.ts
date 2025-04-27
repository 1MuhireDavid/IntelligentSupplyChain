import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertMarketDataSchema, 
  insertShippingRouteSchema,
  insertCustomsDocumentSchema,
  insertCurrencyExchangeRateSchema,
  insertMarketOpportunitySchema,
  insertActivityLogSchema
} from "@shared/schema";

// Middleware to check if user is authenticated
const authenticate = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Market Data routes
  app.get("/api/market-data", authenticate, async (req, res) => {
    try {
      const marketDataList = await storage.getAllMarketData();
      res.json(marketDataList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data", error });
    }
  });

  app.get("/api/market-data/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const marketDataItem = await storage.getMarketData(id);
      
      if (!marketDataItem) {
        return res.status(404).json({ message: "Market data not found" });
      }
      
      res.json(marketDataItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data", error });
    }
  });

  app.get("/api/market-data/product/:name", authenticate, async (req, res) => {
    try {
      const name = req.params.name;
      const marketDataList = await storage.getMarketDataByProduct(name);
      res.json(marketDataList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data by product", error });
    }
  });

  app.post("/api/market-data", authenticate, async (req, res) => {
    try {
      const validatedData = insertMarketDataSchema.parse(req.body);
      const newMarketData = await storage.createMarketData(validatedData);
      res.status(201).json(newMarketData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid market data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create market data", error });
    }
  });

  app.put("/api/market-data/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMarketDataSchema.partial().parse(req.body);
      const updatedMarketData = await storage.updateMarketData(id, validatedData);
      
      if (!updatedMarketData) {
        return res.status(404).json({ message: "Market data not found" });
      }
      
      res.json(updatedMarketData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid market data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update market data", error });
    }
  });

  // Shipping Routes endpoints
  app.get("/api/shipping-routes", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const routes = await storage.getShippingRoutesByUser(userId);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipping routes", error });
    }
  });

  app.get("/api/shipping-routes/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const route = await storage.getShippingRoute(id);
      
      if (!route) {
        return res.status(404).json({ message: "Shipping route not found" });
      }
      
      // Check if the route belongs to the authenticated user
      if (route.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this shipping route" });
      }
      
      res.json(route);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipping route", error });
    }
  });

  app.post("/api/shipping-routes", authenticate, async (req, res) => {
    try {
      // Ensure the userId is set to the authenticated user
      const data = { ...req.body, userId: req.user.id };
      const validatedData = insertShippingRouteSchema.parse(data);
      
      const newRoute = await storage.createShippingRoute(validatedData);
      res.status(201).json(newRoute);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shipping route data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create shipping route", error });
    }
  });

  app.put("/api/shipping-routes/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const route = await storage.getShippingRoute(id);
      
      if (!route) {
        return res.status(404).json({ message: "Shipping route not found" });
      }
      
      // Check if the route belongs to the authenticated user
      if (route.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this shipping route" });
      }
      
      const validatedData = insertShippingRouteSchema.partial().parse(req.body);
      const updatedRoute = await storage.updateShippingRoute(id, validatedData);
      
      res.json(updatedRoute);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shipping route data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update shipping route", error });
    }
  });

  // Customs Documents endpoints
  app.get("/api/customs-documents", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const documents = await storage.getCustomsDocumentsByUser(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customs documents", error });
    }
  });

  app.get("/api/customs-documents/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getCustomsDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Customs document not found" });
      }
      
      // Check if the document belongs to the authenticated user
      if (document.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this customs document" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customs document", error });
    }
  });

  app.post("/api/customs-documents", authenticate, async (req, res) => {
    try {
      // Ensure the userId is set to the authenticated user
      const data = { ...req.body, userId: req.user.id };
      const validatedData = insertCustomsDocumentSchema.parse(data);
      
      const newDocument = await storage.createCustomsDocument(validatedData);
      res.status(201).json(newDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customs document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customs document", error });
    }
  });

  app.put("/api/customs-documents/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getCustomsDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Customs document not found" });
      }
      
      // Check if the document belongs to the authenticated user
      if (document.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this customs document" });
      }
      
      const validatedData = insertCustomsDocumentSchema.partial().parse(req.body);
      const updatedDocument = await storage.updateCustomsDocument(id, validatedData);
      
      res.json(updatedDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customs document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customs document", error });
    }
  });

  // Currency Exchange Rates endpoints
  app.get("/api/currency-exchange-rates", async (req, res) => {
    try {
      const rates = await storage.getAllCurrencyExchangeRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch currency exchange rates", error });
    }
  });

  app.post("/api/currency-exchange-rates", authenticate, async (req, res) => {
    try {
      const validatedData = insertCurrencyExchangeRateSchema.parse(req.body);
      const newRate = await storage.createCurrencyExchangeRate(validatedData);
      res.status(201).json(newRate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid currency exchange rate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create currency exchange rate", error });
    }
  });

  app.put("/api/currency-exchange-rates/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCurrencyExchangeRateSchema.partial().parse(req.body);
      const updatedRate = await storage.updateCurrencyExchangeRate(id, validatedData);
      
      if (!updatedRate) {
        return res.status(404).json({ message: "Currency exchange rate not found" });
      }
      
      res.json(updatedRate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid currency exchange rate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update currency exchange rate", error });
    }
  });

  // Market Opportunities endpoints
  app.get("/api/market-opportunities", authenticate, async (req, res) => {
    try {
      const opportunities = await storage.getAllMarketOpportunities();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market opportunities", error });
    }
  });

  app.get("/api/market-opportunities/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.getMarketOpportunity(id);
      
      if (!opportunity) {
        return res.status(404).json({ message: "Market opportunity not found" });
      }
      
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market opportunity", error });
    }
  });

  app.post("/api/market-opportunities", authenticate, async (req, res) => {
    try {
      const validatedData = insertMarketOpportunitySchema.parse(req.body);
      const newOpportunity = await storage.createMarketOpportunity(validatedData);
      res.status(201).json(newOpportunity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid market opportunity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create market opportunity", error });
    }
  });

  app.put("/api/market-opportunities/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMarketOpportunitySchema.partial().parse(req.body);
      const updatedOpportunity = await storage.updateMarketOpportunity(id, validatedData);
      
      if (!updatedOpportunity) {
        return res.status(404).json({ message: "Market opportunity not found" });
      }
      
      res.json(updatedOpportunity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid market opportunity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update market opportunity", error });
    }
  });

  // Activities Log endpoints
  app.get("/api/activities", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const activities = await storage.getActivityLogsByUser(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities", error });
    }
  });

  app.get("/api/activities/recent", authenticate, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivityLogs(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activities", error });
    }
  });

  app.post("/api/activities", authenticate, async (req, res) => {
    try {
      // Ensure the userId is set to the authenticated user if not provided
      const data = { ...req.body, userId: req.body.userId || req.user.id };
      const validatedData = insertActivityLogSchema.parse(data);
      
      const newActivity = await storage.createActivityLog(validatedData);
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity log data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity log", error });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
