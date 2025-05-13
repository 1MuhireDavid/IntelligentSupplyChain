import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, insertUserSchema } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type SafeUser = Omit<User, "password">;

// === Validation Schemas ===
const loginSchema = insertUserSchema.pick({ username: true, password: true });
const registerSchema = insertUserSchema.pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  company: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Invalid email address"),
});
const profileUpdateSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
});
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  marketAlerts: z.boolean(),
  customsUpdates: z.boolean(),
  routeOptimizations: z.boolean(),
});
const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
interface ToggleStatusParams {
  userId: string;
  isActive: boolean;
}

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;
type PasswordUpdateData = z.infer<typeof passwordUpdateSchema>;

type AuthContextType = {
  user: SafeUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<void, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<void, Error, RegisterData>;
  updateUserProfile: (data: ProfileUpdateData) => Promise<SafeUser>;
  updateNotificationSettings: (data: NotificationSettingsData) => Promise<NotificationSettingsData>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (userId?: string) => Promise<void>;
  toggleUserStatus: UseMutationResult<SafeUser, Error, ToggleStatusParams>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

function setToken(token: string) {
  localStorage.setItem("token", token);
}
function clearToken() {
  localStorage.removeItem("token");
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SafeUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      const data = await res.json();
      setToken(data.token);
      queryClient.setQueryData(["/api/user"], data.user);
    },
    onSuccess: () => {
      toast({ title: "Login successful", description: "Welcome back!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      const user = await res.json();
    },
    onSuccess: () => {
      toast({ title: "Account created", description: "Welcome to the platform!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      clearToken();
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries();
      toast({ title: "Logged out", description: "You have been logged out." });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserProfile = async (data: ProfileUpdateData): Promise<SafeUser> => {
    const res = await apiRequest("PUT", "/api/user/profile", data);
    const updated = await res.json();
    queryClient.setQueryData(["/api/user"], updated);
    toast({ title: "Profile updated" });
    return updated;
  };

  const updateNotificationSettings = async (data: NotificationSettingsData) => {
    const res = await apiRequest("PUT", "/api/user/notifications", data);
    const updated = await res.json();
    queryClient.setQueryData(["/api/user"], (old: SafeUser | null) =>
      old ? { ...old, notifications: updated } : null
    );
    toast({ title: "Notification preferences updated" });
    return updated;
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    await apiRequest("PUT", "/api/user/password", { currentPassword, newPassword });
    toast({ title: "Password changed" });
  };
  const deleteAccount = async (userId?: string) => {
    return deleteAccountMutation.mutate(userId);
  };
  const deleteAccountMutation = useMutation({
    mutationFn: async (userId?: string) => {
      
      if (userId) {
        // Admin deleting another user's account
        const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
        return response;
      } else {
        // User deleting their own account
        const response = await apiRequest("DELETE", "/api/user/account");
        return response;
      }
    },
    onSuccess: (_, userId) => {
      if (userId) {
        // Admin deleted someone else's account
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        toast({ title: "Account deleted" });
      } else {
        // User deleted their own account
        clearToken();
        queryClient.setQueryData(["/api/user"], null);
        queryClient.invalidateQueries();
        toast({ title: "Account deleted successfully" });
      }
    },
    onError: (error: Error) => {
      console.error("Account deletion failed:", error);
      toast({ 
        title: "Failed to delete account", 
        variant: "destructive",
        description: error.message 
      });
    }
  });
  // New toggle user status mutation
    const toggleUserStatus = useMutation({
    mutationFn: async ({ userId }: ToggleStatusParams) => {
      const token = localStorage.getItem("token");
      // Also using relative path here for the mutation
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to update user status: ${res.status} ${res.statusText}`);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Status update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateUserProfile,
        updateNotificationSettings,
        updatePassword,
        deleteAccount,
        toggleUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
