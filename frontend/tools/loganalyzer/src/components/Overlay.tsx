import React from "react";
import { X } from "lucide-react";

interface OverlayProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-96 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Overlay;
