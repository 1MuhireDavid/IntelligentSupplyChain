import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, UserPlus, Users, XCircle, CheckCircle } from "lucide-react";
import { Redirect } from "wouter";

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
  const auth = useAuth();
  const user = auth.user;
  const isLoadingAuth = auth.isLoading;

  // Redirect unauthorized users
  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <Redirect to="/login" />;
  }

  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">User Management</h1>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow border bg-white">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Login</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((u) => (
                      <tr key={u._id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{u.username}</td>
                        <td className="px-4 py-2">{u.fullName}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2 capitalize">{u.role}</td>
                        <td className="px-4 py-2">
                          {u.isActive ? (
                            <span className="inline-flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-600">
                              <XCircle className="w-4 h-4 mr-1" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          <button className="text-sm text-blue-600 hover:underline">Edit</button>
                          <button className="text-sm text-red-600 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagementPage;
