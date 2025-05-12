import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  marketAlerts: z.boolean(),
  customsUpdates: z.boolean(),
  routeOptimizations: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Profile() {
  const { user, logoutMutation, updateUserProfile, updateNotificationSettings, updatePassword } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      company: user?.company || "",
    },
  });

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      marketAlerts: true,
      customsUpdates: true,
      routeOptimizations: false,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      setIsUpdating(true);
      // Call API to update profile
      await updateUserProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onNotificationSubmit = async (data: NotificationFormValues) => {
    try {
      setIsUpdating(true);
      // Call API to update notification settings
      await updateNotificationSettings(data);
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      setIsUpdating(true);
      // Call API to update password
      await updatePassword(data.currentPassword, data.newPassword);
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
        variant: "success",
      });
      // Reset form fields after successful update
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Password update failed",
        description: error instanceof Error ? error.message : "Failed to update password. Please ensure your current password is correct.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteAccount = async () => {
    // This would typically show a confirmation dialog first
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // Implement delete account functionality in your auth hook
        // await deleteAccount();
        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted.",
          variant: "success",
        });
        // Redirect to login page or home
      } catch (error) {
        toast({
          title: "Delete failed",
          description: error instanceof Error ? error.message : "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-4 lg:pl-64 pt-4">
          <div className="container mx-auto max-w-4xl">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-neutral-800">Profile & Settings</h1>
              <p className="mt-1 text-neutral-600">Manage your account preferences</p>
            </div>

            <Tabs defaultValue="profile" className="mb-6">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your account details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <div className="h-20 w-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold">
                          {user?.fullName?.split(" ").map(n => n[0]).join("") || user?.username?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-6">
                          <h2 className="font-medium text-lg">{user?.fullName || user?.username}</h2>
                          <p className="text-neutral-600">{user?.email}</p>
                        </div>
                      </div>
                      
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your email address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your company name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit">Save Changes</Button>
                        </form>
                      </Form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Control how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Email Notifications</FormLabel>
                                <p className="text-sm text-neutral-500">Receive notifications via email</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="marketAlerts"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Market Price Alerts</FormLabel>
                                <p>Get notified about significant market price changes</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="customsUpdates"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Customs Status Updates</FormLabel>
                                <p>Receive updates when customs status changes</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="routeOptimizations"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Route Optimization Suggestions</FormLabel>
                                <p>Get suggestions for optimizing your shipping routes</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit">Save Preferences</Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Change Password</h3>
                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium">Current Password</label>
                            <Input type="password" className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">New Password</label>
                            <Input type="password" className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Confirm New Password</label>
                            <Input type="password" className="mt-1" />
                          </div>
                        </div>
                        <Button>Update Password</Button>
                      </div>
                      
                      <div className="pt-6 border-t">
                        <h3 className="font-medium mb-4">Account Actions</h3>
                        <div className="space-y-4">
                          <Button variant="outline" onClick={handleLogout}>
                            {logoutMutation.isPending ? "Logging out..." : "Log Out"}
                          </Button>
                          <Button variant="destructive">Delete Account</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
