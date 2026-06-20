import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const Alert = ({ type = "info", message, onClose }) => {
  const lastMessage = useRef(null);

  useEffect(() => {
    if (!message) return;
    // prevent re-firing the same toast on unrelated re-renders
    if (lastMessage.current === message) return;
    lastMessage.current = message;

    if (type === "success") {
      toast.success(message);
    } else if (type === "danger") {
      toast.error(message);
    } else if (type === "warning") {
      toast(message, { icon: "⚠️" });
    } else {
      toast(message, { icon: "ℹ️" });
    }

    // clear parent's alert state right after firing, so the next
    // identical message (e.g. two consecutive "Export failed") still triggers a new toast
    if (onClose) {
      const id = setTimeout(() => {
        onClose();
        lastMessage.current = null;
      }, 100);
      return () => clearTimeout(id);
    }
  }, [message, type]);

  return null;
};

export default Alert;