import { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "./mongodb";
import { verifyJWT } from "./middleware/jwt-auth";

const scryptAsync = promisify(scrypt);

// Extend Express User interface for TypeScript
declare global {
  namespace Express {
    interface User {
      _id: mongoose.Types.ObjectId;
      username: string;
      email: string;
      fullName: string;
      company?: string;
      role: string;
      createdAt: Date;
    }
  }
}

// 🔐 Password utilities
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${hash.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// 🔧 LocalStrategy for Passport
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false, { message: "Invalid credentials" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// 🧠 Main auth setup
export function setupAuth(app: Express) {
  app.use(passport.initialize());

  // ✅ Register route
  app.post("/api/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, fullName, password } = req.body;
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ message: "Username already exists" });

      const newUser = new User({
        username,
        email,
        fullName,
        password: await hashPassword(password),
        role: "trader",
      });

      const user = await newUser.save();
      
       // Create JWT token for the new user - similar to login flow
      const payload = {
        userId: user._id,
        role: user.role,
        username: user.username,
        fullName: user.fullName,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d" });
      
      // Don't send the password in the response
      const userObject = user.toObject();
      const { password: _, ...userWithoutPassword } = userObject;
      
      // Return token + user data just like the login endpoint
      res.status(201).json({ token, user: userWithoutPassword });
    } catch (err) {
      res.status(500).json({ message: "Registration failed", error: err });
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });

      const payload = {
        userId: user._id,
        role: user.role,
        username: user.username,
        fullName: user.fullName,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d" });

      const { password: _, ...userData } = user.toObject();
      return res.json({ token, user: userData });
    })(req, res, next);
  });

  app.post("/api/logout", (_req, res) => {
    res.status(200).json({ message: "Logged out (client must delete JWT)" });
  });

  // Updated user route using JWT authentication
app.get("/api/user", verifyJWT, async (req: Request, res: Response) => {
  try {
    // Since verifyJWT middleware adds the user to req, we can safely access it
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Find the full user document to ensure we have the most up-to-date information
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Convert to plain object and remove sensitive information
    const userObject: { [key: string]: any } = user.toObject();
    delete userObject.password;
    
    res.json(userObject);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error while fetching user" });
  }
});
// Update user profile (requires authentication)
app.put("/api/user/profile", verifyJWT, async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const updates = {
    fullName: req.body.fullName,
    email: req.body.email,
    company: req.body.company,
  };

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id, // Use the userId from the decoded JWT
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userObject: { [key: string]: any } = (req.user as any).toObject();
    delete userObject.password;
    res.json(userObject);
  } catch (error) {
    next(error);
  }
});

// Change password route (requires authentication)
app.put("/api/user/password", verifyJWT, async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
    const user = await User.findById(req.user._id); // Get user by ID from decoded JWT
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await comparePasswords(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
});  
}



