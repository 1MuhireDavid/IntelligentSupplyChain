import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { registerAdminRoutes } from "./admin-routes";
import { z } from "zod";
import { 
  MarketData,
  ShippingRoute,
  CustomsDocument,
  CurrencyExchangeRate,
  MarketOpportunity,
  ActivityLog
} from "./mongodb";
import { verifyJWT } from "./middleware/jwt-auth";


export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  // Register admin routes
  registerAdminRoutes(app);

  // Market Data routes
  app.get("/api/market-data", verifyJWT, async (req, res) => {
    try {
      const marketDataList = await MarketData.find().sort({ timestamp: -1 });
      res.json(marketDataList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data", error });
    }
  });

  app.get("/api/market-data/:id", verifyJWT, async (req, res) => {
    try {
      const marketDataItem = await MarketData.findById(req.params.id);
      
      if (!marketDataItem) {
        return res.status(404).json({ message: "Market data not found" });
      }
      
      res.json(marketDataItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data", error });
    }
  });

  app.get("/api/market-data/product/:name", verifyJWT, async (req, res) => {
    try {
      const name = req.params.name;
      const marketDataList = await MarketData.find({ productName: name }).sort({ timestamp: -1 });
      res.json(marketDataList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data by product", error });
    }
  });

  app.post("/api/market-data", verifyJWT, async (req, res) => {
    try {
      const newMarketData = new MarketData(req.body);
      const result = await newMarketData.save();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to create market data", error });
    }
  });

  app.put("/api/market-data/:id", verifyJWT, async (req, res) => {
    try {
      const updatedMarketData = await MarketData.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      
      if (!updatedMarketData) {
        return res.status(404).json({ message: "Market data not found" });
      }
      
      res.json(updatedMarketData);
    } catch (error) {
      res.status(500).json({ message: "Failed to update market data", error });
    }
  });

  // Shipping Routes endpoints
  app.get("/api/shipping-routes", verifyJWT, async (req, res) => {
    try {
      const userId = (req.user as any)._id;
      const routes = await ShippingRoute.find({ userId }).sort({ createdAt: -1 });
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipping routes", error });
    }
  });

  app.get("/api/shipping-routes/:id", verifyJWT, async (req, res) => {
    try {
      const route = await ShippingRoute.findById(req.params.id);
      
      if (!route) {
        return res.status(404).json({ message: "Shipping route not found" });
      }
      
      // Check if the route belongs to the authenticated user
      if (route.userId.toString() !== (req.user as any)._id.toString()) {
        return res.status(403).json({ message: "Unauthorized access to this shipping route" });
      }
      
      res.json(route);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipping route", error });
    }
  });

  app.post("/api/shipping-routes", verifyJWT, async (req, res) => {
    try {
      // Ensure the userId is set to the authenticated user
      const data = { ...req.body, userId: (req.user as any)._id };
      
      const newRoute = new ShippingRoute(data);
      const result = await newRoute.save();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to create shipping route", error });
    }
  });

  app.put("/api/shipping-routes/:id", verifyJWT, async (req, res) => {
    try {
      const route = await ShippingRoute.findById(req.params.id);
      
      if (!route) {
        return res.status(404).json({ message: "Shipping route not found" });
      }
      
      // Check if the route belongs to the authenticated user
      if (route.userId.toString() !== (req.user as any)._id.toString()) {
        return res.status(403).json({ message: "Unauthorized access to this shipping route" });
      }
      
      const updatedRoute = await ShippingRoute.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      
      res.json(updatedRoute);
    } catch (error) {
      res.status(500).json({ message: "Failed to update shipping route", error });
    }
  });

  // Customs Documents endpoints
  app.get("/api/customs-documents", verifyJWT, async (req, res) => {
    try {
      const userId = (req.user as any)._id;
      const documents = await CustomsDocument.find({ userId }).sort({ createdAt: -1 });
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customs documents", error });
    }
  });

  app.get("/api/customs-documents/:id", verifyJWT, async (req, res) => {
    try {
      const document = await CustomsDocument.findById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ message: "Customs document not found" });
      }
      
      // Check if the document belongs to the authenticated user
      if (document.userId.toString() !== (req.user as any)._id.toString()) {
        return res.status(403).json({ message: "Unauthorized access to this customs document" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customs document", error });
    }
  });

  app.post("/api/customs-documents", verifyJWT, async (req, res) => {
    try {
      // Ensure the userId is set to the authenticated user
      const data = { ...req.body, userId: (req.user as any)._id };
      
      const newDocument = new CustomsDocument(data);
      const result = await newDocument.save();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to create customs document", error });
    }
  });

  app.put("/api/customs-documents/:id", verifyJWT, async (req, res) => {
    try {
      const document = await CustomsDocument.findById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ message: "Customs document not found" });
      }
      
      // Check if the document belongs to the authenticated user
      if (document.userId.toString() !== (req.user as any)._id.toString()) {
        return res.status(403).json({ message: "Unauthorized access to this customs document" });
      }
      
      const updatedDocument = await CustomsDocument.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customs document", error });
    }
  });

  // Currency Exchange Rates endpoints
  app.get("/api/currency-exchange-rates", async (req, res) => {
    try {
      const rates = await CurrencyExchangeRate.find().sort({ lastUpdated: -1 });
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch currency exchange rates", error });
    }
  });

  app.post("/api/currency-exchange-rates", verifyJWT, async (req, res) => {
    try {
      const newRate = new CurrencyExchangeRate(req.body);
      const result = await newRate.save();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to create currency exchange rate", error });
    }
  });

  app.put("/api/currency-exchange-rates/:id", verifyJWT, async (req, res) => {
    try {
      const updatedRate = await CurrencyExchangeRate.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      
      if (!updatedRate) {
        return res.status(404).json({ message: "Currency exchange rate not found" });
      }
      
      res.json(updatedRate);
    } catch (error) {
      res.status(500).json({ message: "Failed to update currency exchange rate", error });
    }
  });

  // Market Opportunities endpoints
  app.get("/api/market-opportunities", verifyJWT, async (req, res) => {
    try {
      const opportunities = await MarketOpportunity.find().sort({ createdAt: -1 });
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market opportunities", error });
    }
  });

  app.get("/api/market-opportunities/:id", verifyJWT, async (req, res) => {
    try {
      const opportunity = await MarketOpportunity.findById(req.params.id);
      
      if (!opportunity) {
        return res.status(404).json({ message: "Market opportunity not found" });
      }
      
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market opportunity", error });
    }
  });

  app.post("/api/market-opportunities", verifyJWT, async (req, res) => {
    try {
      const newOpportunity = new MarketOpportunity(req.body);
      const result = await newOpportunity.save();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to create market opportunity", error });
    }
  });

  app.put("/api/market-opportunities/:id", verifyJWT, async (req, res) => {
    try {
      const updatedOpportunity = await MarketOpportunity.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      
      if (!updatedOpportunity) {
        return res.status(404).json({ message: "Market opportunity not found" });
      }
      
      res.json(updatedOpportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to update market opportunity", error });
    }
  });

  // Activities Log endpoints
  app.get("/api/activities", verifyJWT, async (req, res) => {
    try {
      const userId = (req.user as any)._id;
      const activities = await ActivityLog.find({ userId }).sort({ timestamp: -1 });
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities", error });
    }
  });

  app.get("/api/activities/recent", verifyJWT, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await ActivityLog.find()
        .sort({ timestamp: -1 })
        .limit(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activities", error });
    }
  });

  app.post("/api/activities", verifyJWT, async (req, res) => {
    try {
      // Ensure the userId is set to the authenticated user if not provided
      const data = {
        ...req.body,
        userId: req.body.userId || (req.user as any)._id,
        timestamp: new Date()
      };
      
      const newActivity = new ActivityLog(data);
      const result = await newActivity.save();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to create activity log", error });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
