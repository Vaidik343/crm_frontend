import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [bellNotifications, setBellNotifications] = useState([]);
  const [unread,            setUnread]            = useState(0);
  const [loading,           setLoading]           = useState(false);

  const fetchBell = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await api.get("/notifications?page=1&limit=6");
      setBellNotifications(res.data.data || []);
      setUnread(res.data.unread || 0);
    } catch (err) {
      console.error("fetchBell error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchBell();
  }, [fetchBell]);

  // Socket — new notification comes in
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification) => {
      setBellNotifications((prev) => [notification, ...prev].slice(0, 6));
      setUnread((prev) => prev + 1);

      // Browser push notification
      if ("Notification" in window && Notification.permission === "granted") {
        const n = new Notification(notification.title, {
          body:  notification.message,
          icon:  "/logo.png",
          badge: "/logo.png",
          tag:   notification.id,
        });
        setTimeout(() => n.close(), 5000);
        n.onclick = () => { window.focus(); n.close(); };
      }
    };

    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, [socket]);

  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setBellNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("markRead error:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch("/notifications/read-all");
      setBellNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch (err) {
      console.error("markAllRead error:", err);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      bellNotifications,
      unread,
      loading,
      fetchBell,
      markRead,
      markAllRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used inside NotificationProvider");
  return context;
};