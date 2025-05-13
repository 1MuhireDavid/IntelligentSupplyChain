import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, UserPlus, Pencil, Trash2, Check, X } from "lucide-react";
import { Redirect } from "wouter";
import { useState } from "react";
import UserFormModal from "@/components/ui/userFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  company?: string;
  role: "trader" | "admin" | "superadmin";
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  permissions: {
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canManageMarketData: boolean;
    canApproveDocuments: boolean;
  };
}

const UserManagementPage: React.FC = () => {
  const { user, updateUserProfile, deleteAccount, toggleUserStatus } =
    useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const { toast } = useToast();
  const isLoadingAuth = useAuth().isLoading;
  const queryClient = useQueryClient();

  // Loading State
  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  // Permission check for non-admin users
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <Redirect to="/login" />;
  }

    const handleSaveUserProfile = async (data: {
        fullName: string;
        email: string;
        role: string;
        permissions: Permissions;
      }) => {
  try {
    if (!selectedUser) throw new Error("No user selected");

    const token = localStorage.getItem("token");

    const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        permissions: data.permissions,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Update failed");
    }

    const updatedUser = await res.json();
      toast({
        title: "User updated",
        description: `User ${updatedUser.fullName} details updated.`,
      });
      setFormOpen(false); // Close the modal after save
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Confirm deletion of user account
  const handleConfirmDelete = async () => {
    try {
      if (selectedUser) {
        await deleteAccount(selectedUser._id);
        toast({
          title: "Account deleted",
          description: `User ${selectedUser.fullName} has been deleted.`,
        });
        setConfirmOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      }
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Open user edit modal
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
    setFormOpen(true); // Make sure the form is open
  };

  // Open confirmation dialog for deletion
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  };
    const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        return data as User[];
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
  });

  const handleToggleStatus = (user: User) => {
    toggleUserStatus.mutate(user, {
      onSuccess: () => {
        toast({
          title: "Status updated",
          description: `${user.fullName}'s status has been updated.`,
        });
      },
      onError: (error: any) => {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">User Management</h1>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
                onClick={() => {
                  setSelectedUser(null);
                  setShowForm(true);
                  setFormOpen(true); // Open the user form to add a new user
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>

            {/* Loading or users table */}
            <div className="overflow-x-auto rounded-lg shadow border bg-white">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-gray-500" />
                </div>
              ) : (
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created At</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Example data */}
                    {users?.map((u) => (
                      <tr key={u._id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{u.username}</td>
                        <td className="px-4 py-2">{u.fullName}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2 capitalize">{u.role}</td>
                        <td className="px-4 py-2">
                          <button
                            className={`inline-flex items-center font-medium ${
                              u.isActive ? "text-green-600" : "text-red-600"
                            }`}
                            onClick={() => handleToggleStatus(u)}
                          >
                            {u.isActive ? (
                              <>
                                <Check className="w-4 h-4 mr-1" /> Active
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-1" /> Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-2">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleString()
                            : "Never"}
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            onClick={() => handleEdit(u)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            <Pencil className="w-4 h-4 inline" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            <Trash2 className="w-4 h-4 inline" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* User Form Modal */}
            {showForm && (
              <UserFormModal
                isOpen={isFormOpen}
                onClose={() => setFormOpen(false)}
                onSave={handleSaveUserProfile}
                initialData={selectedUser}
              />
            )}

            {/* Confirmation Dialog */}
            <ConfirmDialog
              isOpen={isConfirmOpen}
              onCancel={() => setConfirmOpen(false)}
              onConfirm={handleConfirmDelete}
              message={`Are you sure you want to delete ${selectedUser?.fullName}?`}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagementPage;
