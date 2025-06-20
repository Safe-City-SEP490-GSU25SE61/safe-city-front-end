import React, { useEffect } from "react";

interface NotificationBarProps {
  message: string;
  type?: "success" | "error" | "info";
  show: boolean;
  onClose: () => void;
  duration?: number; // in ms
}

const typeStyles = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-blue-500 text-white",
};

const NotificationBar: React.FC<NotificationBarProps> = ({
  message,
  type = "info",
  show,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 transition-all duration-500 ease-in-out ${
        show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
      }`}
      style={{ minWidth: '280px', maxWidth: '90vw' }}
    >
      <div
        className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 ${typeStyles[type]} backdrop-blur-sm`}
      >
        <span className="flex-1 text-base font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 focus:outline-none"
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default NotificationBar;