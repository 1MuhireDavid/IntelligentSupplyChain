// admin-routes.ts

import { Express, Request, Response } from "express";
import { authenticateAdmin, authenticateSuperAdmin, checkPermission } from "./middleware/admin-auth";
import { User, MarketData, ShippingRoute, CustomsDocument, ActivityLog } from "./mongodb";
import { hashPassword } from "./auth";
import { verifyJWT } from "./middleware/jwt-auth";

export function registerAdminRoutes(app: Express) {
  // Get all users (Admin only)
  app.get("/api/admin/users", verifyJWT, authenticateAdmin, async (req, res) => {
    try {
      const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error });
    }
  });

  // Get user by ID (Admin only)
  app.get("/api/admin/users/:id", verifyJWT, authenticateAdmin, async (req, res) => {
    try {
      const user = await User.findById(req.params.id, { password: 0 });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  });

  // Create new user (Admin only)
  app.post("/api/admin/users", verifyJWT, authenticateAdmin, async (req, res) => {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create the user with hashed password
      const newUser = new User({
        ...req.body,
        password: await hashPassword(req.body.password),
      });
      
      const user = await newUser.save();
      
      // Don't send the password in the response
      const userObject = user.toObject();
      const { password, ...userWithoutPassword } = userObject;
      
      // Log this admin action
      const adminUser = req.user as any;
      const activity = new ActivityLog({
        userId: adminUser._id,
        action: "user_created",
        details: `Admin created new user: ${newUser.username} with role ${newUser.role}`,
        timestamp: new Date()
      });
      await activity.save();
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user", error });
    }
  });

  // Update user (Admin only)
  app.put("/api/admin/users/:id", verifyJWT, authenticateAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const adminUser = req.user as any;
      
      // Special protection for superadmin accounts
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only superadmins can modify other superadmins
      if (targetUser.role === "admin" && adminUser.role !== "admin") {
        return res.status(403).json({ message: "Only superadmins can modify superadmin accounts" });
      }
      
      // Prepare update data (exclude password as it requires special handling)
      const { password, ...updateData } = req.body;
      
      // Handle password update separately if provided
      if (password) {
        updateData.password = await hashPassword(password);
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log the admin action
      const activity = new ActivityLog({
        userId: adminUser.userId,
        action: "user_updated",
        details: `Admin updated user: ${updatedUser.username}`,
        timestamp: new Date()
      });
      await activity.save();
      
      // Don't send the password in the response
      const userObject = updatedUser.toObject();
      const { password: pwd, ...userWithoutPassword } = userObject;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user", error });
    }
  });

   // Toggle user active status (Admin only)
  app.patch("/api/admin/users/:id/toggle-status", verifyJWT, authenticateAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const adminUser = req.user as any;
      const { isActive } = req.body;
      
      // Special protection for superadmin accounts
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only superadmins can modify other superadmins
      if (targetUser.role === "superadmin" && adminUser.role !== "superadmin") {
        return res.status(403).json({ message: "Only superadmins can modify superadmin accounts" });
      }
      
      // Prevent admins from deactivating themselves
      if (userId === adminUser.userId.toString() && isActive === false) {
        return res.status(400).json({ message: "Cannot deactivate your own account" });
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { isActive } },
        { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log the admin action
      const activity = new ActivityLog({
        userId: adminUser.userId,
        action: "user_status_updated",
        details: `Admin ${isActive ? 'activated' : 'deactivated'} user: ${updatedUser.username}`,
        timestamp: new Date()
      });
      await activity.save();
      
      // Don't send the password in the response
      const userObject = updatedUser.toObject();
      const { password, ...userWithoutPassword } = userObject;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user status", error });
    }
  });

  // Delete user (Admin only)
  app.delete("/api/admin/users/:id", verifyJWT, authenticateAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const adminUser = req.user as any;


      // Check if the target user exists
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only superadmins can delete admin accounts
      if ((targetUser.role === "admin" || targetUser.role === "superadmin") && 
          adminUser.role !== "superadmin") {
        return res.status(403).json({ message: "Only superadmins can delete admin accounts" });
      }
      
      // Prevent admins from deleting themselves
      if (userId === adminUser.userId.toString()) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      // Perform the deletion with proper error handling
    const deletionResult = await User.findByIdAndDelete(userId);
    
    if (!deletionResult) {
      return res.status(404).json({ message: "User not found or already deleted" });
    }
    
      
 // Log the admin action
    try {
      const activity = new ActivityLog({
        userId: adminUser.userId,
        action: "user_deleted",
        details: `Admin deleted user: ${targetUser.username}`,
        timestamp: new Date()
      });
      await activity.save();
    } catch (logError) {
      // Don't fail the request if activity logging fails
      console.error("Failed to create activity log:", logError);
    }
    
    // Return success response
    return res.status(200).json({ message: "User deleted successfully" });
    
  } catch (error) {
    console.error("Error in delete user route:", error);
    
    // Create a safe error object with useful info but without sensitive data
    const safeError = {
      message: error.message || "Unknown error",
      name: error.name || "Error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    };
    
    res.status(500).json({ 
      message: "Failed to delete user", 
      error: safeError 
    });
  }
});

  // Update user role (SuperAdmin only)
  app.put("/api/admin/users/:id/role", verifyJWT, authenticateSuperAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { role, permissions } = req.body;
      const adminUser = req.user as any;
      
      // Validate role
      if (!["trader", "admin", "superadmin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Prevent changing own role from superadmin
      if (userId === adminUser.userId.toString() && adminUser.role === "superadmin" && role !== "superadmin") {
        return res.status(400).json({ message: "Cannot downgrade your own superadmin role" });
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { role, permissions } },
        { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log the admin action
      const activity = new ActivityLog({
        userId: adminUser._id,
        action: "role_updated",
        details: `SuperAdmin updated user role: ${updatedUser.username} to ${role}`,
        timestamp: new Date()
      });
      await activity.save();
      
      // Don't send the password in the response
      const userObject = updatedUser.toObject();
      const { password, ...userWithoutPassword } = userObject;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role", error });
    }
  });

  // Get system statistics (Admin only)
  app.get("/api/admin/statistics", verifyJWT, authenticateAdmin, async (req, res) => {
    try {
      // Get counts of various documents
      const userCount = await User.countDocuments();
      const traderCount = await User.countDocuments({ role: "trader" });
      const adminCount = await User.countDocuments({ role: "admin" });
      const superAdminCount = await User.countDocuments({ role: "superadmin" });
      
      const marketDataCount = await MarketData.countDocuments();
      const shippingRouteCount = await ShippingRoute.countDocuments();
      const customsDocumentCount = await CustomsDocument.countDocuments();
      
      // Get counts of customs documents by status
      const pendingDocuments = await CustomsDocument.countDocuments({ status: "pending" });
      const approvedDocuments = await CustomsDocument.countDocuments({ status: "approved" });
      const rejectedDocuments = await CustomsDocument.countDocuments({ status: "rejected" });
      
      // Get recent activity counts
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayActivities = await ActivityLog.countDocuments({ 
        timestamp: { $gte: today } 
      });
      
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const weeklyActivities = await ActivityLog.countDocuments({ 
        timestamp: { $gte: lastWeek } 
      });
      
      // Get new users in last 30 days
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);
      const newUsers = await User.countDocuments({ 
        createdAt: { $gte: lastMonth } 
      });
      
      res.json({
        users: {
          total: userCount,
          traders: traderCount,
          admins: adminCount,
          superAdmins: superAdminCount,
          newInLastMonth: newUsers
        },
        data: {
          marketData: marketDataCount,
          shippingRoutes: shippingRouteCount,
          customsDocuments: customsDocumentCount
        },
        customs: {
          pending: pendingDocuments,
          approved: approvedDocuments,
          rejected: rejectedDocuments
        },
        activity: {
          today: todayActivities,
          weekly: weeklyActivities
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics", error });
    }
  });

  // Get user activity log (Admin only)
  app.get("/api/admin/activities", verifyJWT, authenticateAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await ActivityLog.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('userId', 'username fullName role -_id');
        
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs", error });
    }
  });

  // Get user activity for a specific user (Admin only)
  app.get("/api/admin/activities/user/:userId", verifyJWT, authenticateAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      const activities = await ActivityLog.find({ userId })
        .sort({ timestamp: -1 })
        .populate('userId', 'username fullName role -_id');
        
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user activities", error });
    }
  });

  // Approve customs document (Admin only)
  app.put("/api/admin/customs-documents/:id/approve", 
    checkPermission("canApproveDocuments"), 
    async (req, res) => {
      try {
        const documentId = req.params.id;
        const adminUser = req.user as any;
        
        const document = await CustomsDocument.findById(documentId);
        if (!document) {
          return res.status(404).json({ message: "Customs document not found" });
        }
        
        document.status = "approved";
        document.approvedBy = adminUser._id;
        document.approvedAt = new Date();
        document.comments = req.body.comments || document.comments;
        
        await document.save();
        
        // Log the admin action
        const activity = new ActivityLog({
          userId: adminUser._id,
          action: "document_approved",
          details: `Admin approved customs document: ${document._id}`,
          timestamp: new Date()
        });
        await activity.save();
        
        res.json(document);
      } catch (error) {
        res.status(500).json({ message: "Failed to approve customs document", error });
      }
    }
  );

  // Reject customs document (Admin only)
  app.put("/api/admin/customs-documents/:id/reject", 
    checkPermission("canApproveDocuments"), 
    async (req, res) => {
      try {
        const documentId = req.params.id;
        const adminUser = req.user as any;
        
        const document = await CustomsDocument.findById(documentId);
        if (!document) {
          return res.status(404).json({ message: "Customs document not found" });
        }
        
        document.status = "rejected";
        document.rejectedBy = adminUser._id;
        document.rejectedAt = new Date();
        document.comments = req.body.comments || "Document rejected";
        
        await document.save();
        
        // Log the admin action
        const activity = new ActivityLog({
          userId: adminUser._id,
          action: "document_rejected",
          details: `Admin rejected customs document: ${document._id}`,
          timestamp: new Date()
        });
        await activity.save();
        
        res.json(document);
      } catch (error) {
        res.status(500).json({ message: "Failed to reject customs document", error });
      }
    }
  );
}