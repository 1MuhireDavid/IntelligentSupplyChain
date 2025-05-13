import { Dialog } from "@headlessui/react";
import { Trash2, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onConfirm, onCancel, message }) => {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white max-w-md w-full rounded-md p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">Confirm Action</Dialog.Title>
            <button onClick={onCancel}><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button onClick={onCancel} className="text-sm px-4 py-2 border rounded-md">Cancel</button>
            <button onClick={onConfirm} className="text-sm px-4 py-2 bg-red-600 text-white rounded-md flex items-center">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
