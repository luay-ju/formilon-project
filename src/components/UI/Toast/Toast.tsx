import { useEffect } from "react";
import { motion } from "framer-motion";
import { LuX, LuCheck, LuCircleAlert } from "react-icons/lu";

export interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

// Übersetze die Standard-Nachrichten
const DEFAULT_MESSAGES = {
  success: "Erfolgreich gespeichert",
  error: "Ein Fehler ist aufgetreten",
};

export function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === "success" ? <LuCheck /> : <LuCircleAlert />;
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const displayMessage = message || DEFAULT_MESSAGES[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-24 right-8 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}
    >
      {icon}
      <span>{displayMessage}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-80"
        aria-label="Schließen"
      >
        <LuX />
      </button>
    </motion.div>
  );
}
