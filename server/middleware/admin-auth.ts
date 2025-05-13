// middleware/admin-auth.ts

import { Request, Response, NextFunction } from "express";

// Middleware to check if user is authenticated and is an admin
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  console.log("User in authenticateAdmin middleware:", user.role);
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  return next();
};

export const authenticateSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  if (!user || user.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden: SuperAdmin access required" });
  }
  return next();
};

export const checkPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role === "superadmin") return next();
    if (user.role === "admin" && user.permissions?.[permission]) return next();

    return res.status(403).json({ message: `Forbidden: ${permission} permission required` });
  };
};
