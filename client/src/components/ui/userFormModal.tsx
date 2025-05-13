import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface Permissions {
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageMarketData: boolean;
  canApproveDocuments: boolean;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: { fullName: string; email: string; role: string; permissions: Permissions }) => void;
  initialData?: {
    fullName: string;
    email: string;
    role: "trader" | "admin" | "superadmin";
    permissions: Permissions;
  };
}

const roles = ["trader", "admin", "superadmin"] as const;

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "trader" as "trader" | "admin" | "superadmin",
    permissions: {
      canManageUsers: false,
      canViewAnalytics: false,
      canManageMarketData: false,
      canApproveDocuments: false,
    },
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (key: keyof Permissions) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-white p-6 rounded-md shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">Edit User</Dialog.Title>
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2 text-sm"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Permissions</label>
              <div className="space-y-2">
                {Object.entries(formData.permissions).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handlePermissionToggle(key as keyof Permissions)}
                    />
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="text-sm px-4 py-2 border rounded-md">Cancel</button>
            <button onClick={handleSubmit} className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md">
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UserFormModal;