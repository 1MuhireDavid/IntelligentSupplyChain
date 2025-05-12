import React from "react";

type User = {
  _id: string;
  username: string;
  fullName: string;
  email: string;
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
};

type Props = {
  users: User[];
  onToggleActive: (userId: string) => void;
};

const UserTable: React.FC<Props> = ({ users, onToggleActive }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
      <table className="min-w-full bg-white text-sm">
        <thead>
          <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase">
            <th className="px-4 py-3">Username</th>
            <th className="px-4 py-3">Full Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last Login</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{user.username}</td>
              <td className="px-4 py-2">{user.fullName}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.role}</td>
              <td className="px-4 py-2">{user.company || "-"}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-2">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => onToggleActive(user._id)}
                  className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 text-xs"
                >
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
