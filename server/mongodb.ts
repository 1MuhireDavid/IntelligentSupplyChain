import mongoose from 'mongoose';
import { hashPassword } from './auth';

// MongoDB Connection String
const MONGODB_URI = "mongodb+srv://muhiredavid74:lWalpJXSMyb4JWF0@cluster0.2rzsyit.mongodb.net/ISC?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    await seedInitialData();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

// Define Schemas and Models

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  company: { type: String },
  role: { type: String, default: 'trader' },
  createdAt: { type: Date, default: Date.now }
});

// Market Data Schema
const marketDataSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  priceChange: { type: Number },
  currency: { type: String, default: 'USD' },
  marketPlace: { type: String },
  timestamp: { type: Date, default: Date.now },
  historicalData: { type: mongoose.Schema.Types.Mixed }
});

// Shipping Routes Schema
const shippingRouteSchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  distance: { type: Number, required: true },
  transportMode: { type: String, required: true },
  transitTime: { type: Number, required: true },
  cost: { type: Number, required: true },
  carbonFootprint: { type: Number },
  efficiency: { type: Number },
  status: { type: String, default: 'active' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Customs Documents Schema
const customsDocumentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  destination: { type: String, required: true },
  status: { type: String, default: 'pending' },
  clearanceDate: { type: Date },
  progress: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Currency Exchange Rates Schema
const currencyExchangeRateSchema = new mongoose.Schema({
  baseCurrency: { type: String, required: true },
  targetCurrency: { type: String, required: true },
  rate: { type: Number, required: true },
  change: { type: Number },
  lastUpdated: { type: Date, default: Date.now }
});

// Market Opportunities Schema
const marketOpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  potentialLevel: { type: String, required: true },
  profitMargin: { type: Number },
  market: { type: String, required: true },
  product: { type: String, required: true },
  isBookmarked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Activities Log Schema
const activityLogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedId: { type: mongoose.Schema.Types.Mixed },
  relatedType: { type: String }
});

// Create Models
export const User = mongoose.model('User', userSchema);
export const MarketData = mongoose.model('MarketData', marketDataSchema);
export const ShippingRoute = mongoose.model('ShippingRoute', shippingRouteSchema);
export const CustomsDocument = mongoose.model('CustomsDocument', customsDocumentSchema);
export const CurrencyExchangeRate = mongoose.model('CurrencyExchangeRate', currencyExchangeRateSchema);
export const MarketOpportunity = mongoose.model('MarketOpportunity', marketOpportunitySchema);
export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// Seed initial data if the database is empty
async function seedInitialData() {
  // Check if we already have users
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return; // Database already has data, skip seeding
  }

  try {
    // Create initial users
    const users = await User.create([
      {
        username: 'david',
        password: await hashPassword('password'),
        email: 'muhiredavid74@gmail.com',
        fullName: 'MUHIRE DAVID',
        company: 'ddd',
        role: 'trader'
      },
      {
        username: 'kagi',
        password: await hashPassword('password'),
        email: 'kagisaac103@gmail.com',
        fullName: 'KAGENZA Isaac',
        company: 'imc',
        role: 'trader'
      }
    ]);

    const david = users[0];
    const kagi = users[1];

    // Market Data
    await MarketData.create([
      {
        productName: 'Coffee Arabica',
        category: 'Agriculture',
        currentPrice: 4.25,
        priceChange: 0.15,
        currency: 'USD',
        marketPlace: 'Rwanda Commodities Exchange'
      },
      {
        productName: 'Tea Premium',
        category: 'Agriculture',
        currentPrice: 2.85,
        priceChange: -0.05,
        currency: 'USD',
        marketPlace: 'Mombasa Tea Auction'
      },
      {
        productName: 'Electronics Components',
        category: 'Technology',
        currentPrice: 120.50,
        priceChange: 3.75,
        currency: 'USD',
        marketPlace: 'China Import Market'
      },
      {
        productName: 'Textiles Cotton',
        category: 'Textiles',
        currentPrice: 3.65,
        priceChange: 0.20,
        currency: 'USD',
        marketPlace: 'East Africa Trade Hub'
      },
      {
        productName: 'Minerals Coltan',
        category: 'Mining',
        currentPrice: 65.30,
        priceChange: 5.20,
        currency: 'USD',
        marketPlace: 'Rwanda Mining Board'
      }
    ]);

    // Shipping Routes
    await ShippingRoute.create([
      {
        origin: 'Kigali',
        destination: 'Nairobi',
        distance: 840,
        transportMode: 'Road',
        transitTime: 2.5,
        cost: 1200,
        carbonFootprint: 45,
        efficiency: 82,
        status: 'active',
        userId: david._id
      },
      {
        origin: 'Kigali',
        destination: 'Mombasa',
        distance: 1400,
        transportMode: 'Road',
        transitTime: 4.2,
        cost: 2100,
        carbonFootprint: 75,
        efficiency: 68,
        status: 'active',
        userId: david._id
      },
      {
        origin: 'Kigali',
        destination: 'Dubai',
        distance: 3600,
        transportMode: 'Air',
        transitTime: 0.5,
        cost: 4500,
        carbonFootprint: 85,
        efficiency: 92,
        status: 'active',
        userId: david._id
      },
      {
        origin: 'Mombasa',
        destination: 'Shanghai',
        distance: 7800,
        transportMode: 'Sea',
        transitTime: 18.5,
        cost: 3200,
        carbonFootprint: 35,
        efficiency: 88,
        status: 'active',
        userId: david._id
      },
      {
        origin: 'Kigali',
        destination: 'Amsterdam',
        distance: 6500,
        transportMode: 'Air',
        transitTime: 1.2,
        cost: 5800,
        carbonFootprint: 90,
        efficiency: 75,
        status: 'pending',
        userId: david._id
      },
      {
        origin: 'Kigali',
        destination: 'Dar es Salaam',
        distance: 1200,
        transportMode: 'Road',
        transitTime: 3.5,
        cost: 1800,
        carbonFootprint: 55,
        efficiency: 78,
        status: 'active',
        userId: kagi._id
      },
      {
        origin: 'Nairobi',
        destination: 'London',
        distance: 6800,
        transportMode: 'Air',
        transitTime: 1.0,
        cost: 6200,
        carbonFootprint: 88,
        efficiency: 80,
        status: 'active',
        userId: kagi._id
      },
      {
        origin: 'Mombasa',
        destination: 'New York',
        distance: 12500,
        transportMode: 'Sea',
        transitTime: 28.0,
        cost: 4800,
        carbonFootprint: 30,
        efficiency: 95,
        status: 'active',
        userId: kagi._id
      }
    ]);

    // Customs Documents
    await CustomsDocument.create([
      {
        shipmentId: 'SHP-2023-001',
        title: 'Coffee Export Certificate',
        description: 'Export documentation for premium coffee shipment',
        destination: 'Nairobi',
        status: 'cleared',
        clearanceDate: new Date(),
        progress: 100,
        userId: david._id
      },
      {
        shipmentId: 'SHP-2023-002',
        title: 'Electronics Import Documents',
        description: 'Import forms for consumer electronics',
        destination: 'Kigali',
        status: 'in progress',
        progress: 65,
        userId: david._id
      },
      {
        shipmentId: 'SHP-2023-003',
        title: 'Textile Export Permit',
        description: 'Export permit for cotton textiles',
        destination: 'Dubai',
        status: 'pending',
        progress: 30,
        userId: david._id
      },
      {
        shipmentId: 'SHP-2023-004',
        title: 'Mining Equipment Import',
        description: 'Import documentation for mining equipment',
        destination: 'Kigali',
        status: 'cleared',
        clearanceDate: new Date(),
        progress: 100,
        userId: kagi._id
      },
      {
        shipmentId: 'SHP-2023-005',
        title: 'Tea Export Certificate',
        description: 'Export permit for premium tea',
        destination: 'London',
        status: 'in progress',
        progress: 75,
        userId: kagi._id
      }
    ]);

    // Currency Exchange Rates
    await CurrencyExchangeRate.create([
      {
        baseCurrency: 'RWF',
        targetCurrency: 'USD',
        rate: 0.00078,
        change: 0.4
      },
      {
        baseCurrency: 'RWF',
        targetCurrency: 'EUR',
        rate: 0.00071,
        change: 0.2
      },
      {
        baseCurrency: 'RWF',
        targetCurrency: 'GBP',
        rate: 0.00061,
        change: -0.3
      },
      {
        baseCurrency: 'RWF',
        targetCurrency: 'CNY',
        rate: 0.0055,
        change: -0.5
      },
      {
        baseCurrency: 'RWF',
        targetCurrency: 'KES',
        rate: 0.106,
        change: 0.1
      }
    ]);

    // Market Opportunities
    await MarketOpportunity.create([
      {
        title: 'Premium Coffee Export to EU',
        description: 'Increasing demand for Rwandan specialty coffee in European markets with favorable trade terms.',
        potentialLevel: 'High',
        profitMargin: 28.5,
        market: 'European Union',
        product: 'Specialty Coffee'
      },
      {
        title: 'Organic Tea Processing',
        description: 'Growing market for organic certified tea products in North America and Europe.',
        potentialLevel: 'Medium',
        profitMargin: 22.0,
        market: 'North America',
        product: 'Organic Tea',
        isBookmarked: true
      },
      {
        title: 'Textile Manufacturing for East Africa',
        description: 'Regional demand for locally produced textiles is growing with AfCFTA implementation.',
        potentialLevel: 'High',
        profitMargin: 18.5,
        market: 'East African Community',
        product: 'Cotton Textiles'
      },
      {
        title: 'Technology Hardware Distribution',
        description: 'Emerging market for affordable smartphones and computing devices across East Africa.',
        potentialLevel: 'Medium',
        profitMargin: 15.0,
        market: 'Rwanda',
        product: 'Consumer Electronics',
        isBookmarked: true
      },
      {
        title: 'Mining Sector Equipment Supply',
        description: 'Increasing investment in mining sectors requires specialized equipment supply and maintenance.',
        potentialLevel: 'Emerging',
        profitMargin: 12.0,
        market: 'Rwanda',
        product: 'Mining Equipment'
      }
    ]);

    // Activities Log
    const marketData = await MarketData.findOne({ productName: 'Coffee Arabica' });
    const shippingRoutes = await ShippingRoute.find({});
    const customsDocs = await CustomsDocument.find({});
    const marketOpportunities = await MarketOpportunity.find({});

    await ActivityLog.create([
      {
        title: 'New Shipping Route Added',
        description: 'Route from Kigali to Dubai has been added to your shipping options.',
        type: 'shipping',
        userId: david._id,
        relatedId: shippingRoutes.find(r => r.destination === 'Dubai')?._id,
        relatedType: 'shipping_route'
      },
      {
        title: 'Weather Alert: Port of Mombasa',
        description: 'Heavy rainfall forecasted at Port of Mombasa may cause delays.',
        type: 'weather',
        userId: david._id,
        relatedId: shippingRoutes.find(r => r.destination === 'Mombasa')?._id,
        relatedType: 'shipping_route'
      },
      {
        title: 'Market Price Alert',
        description: 'Coffee prices have increased by 3.5% in the last 24 hours.',
        type: 'market',
        userId: david._id,
        relatedId: marketData?._id,
        relatedType: 'market_data'
      },
      {
        title: 'Document Processed',
        description: 'Your Coffee Export Certificate has been cleared by customs.',
        type: 'document',
        userId: david._id,
        relatedId: customsDocs.find(d => d.title === 'Coffee Export Certificate')?._id,
        relatedType: 'customs_document'
      },
      {
        title: 'New Market Opportunity',
        description: 'New opportunity identified in European specialty coffee market.',
        type: 'market',
        userId: kagi._id,
        relatedId: marketOpportunities.find(o => o.title.includes('Coffee Export to EU'))?._id,
        relatedType: 'market_opportunity'
      },
      {
        title: 'Shipping Cost Reduction',
        description: 'Your shipping costs have been optimized, saving 12%.',
        type: 'shipping',
        userId: kagi._id,
        relatedId: shippingRoutes.find(r => r.destination === 'Dar es Salaam')?._id,
        relatedType: 'shipping_route'
      },
      {
        title: 'Customs Documentation Update',
        description: 'Tea Export Certificate is awaiting final approval.',
        type: 'document',
        userId: kagi._id,
        relatedId: customsDocs.find(d => d.title === 'Tea Export Certificate')?._id,
        relatedType: 'customs_document'
      }
    ]);

    console.log('Database seeded successfully with initial data');
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}