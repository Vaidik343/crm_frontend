import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useNavigate } from "react-router-dom";

const AnnouncementContext = createContext(null);

export const AnnouncementProvider = ({ children }) => {
  const { socket } = useSocket();
  const [announcement, setAnnouncement] = useState(null); // current popup
  const [unreadCount,  setUnreadCount]  = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on("EVENT_ANNOUNCED", (event) => {
      setAnnouncement(event);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.off("EVENT_ANNOUNCED");
  }, [socket]);

  const dismissAnnouncement = () => {
    setAnnouncement(null);
  };

  const clearUnread = () => setUnreadCount(0);

  return (
    <AnnouncementContext.Provider value={{
      announcement,
      unreadCount,
      dismissAnnouncement,
      clearUnread,
    }}>
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  if (!context) throw new Error("useAnnouncement must be used inside AnnouncementProvider");
  return context;
};