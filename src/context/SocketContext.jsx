import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  // ✅ Use state (not ref) so consumers re-render when socket becomes available
  const [socket, setSocket] = useState(null);
  console.log("🚀 ~ SocketProvider ~ socket:", socket)
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      // Disconnect on logout
      setSocket((prev) => {
        if (prev) {
          prev.disconnect();
        }
        return null;
      });
      setIsConnected(false);
      return;
    }

    const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:7015/api";
    console.log("🚀 ~ SocketProvider ~ rawUrl:", rawUrl)
    const socketUrl = new URL(rawUrl).origin;
    console.log("🚀 ~ SocketProvider ~ socketUrl:", socketUrl)

    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    console.log("🚀 ~ SocketProvider ~ newSocket:", newSocket)

    newSocket.on("connect", () => {
      console.log("✅ [Socket] Connected:", newSocket.id);
      newSocket.emit("join", user.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("⚠️ [Socket] Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ [Socket] Connection error:", err.message);
      setIsConnected(false);
    });

    // ✅ Store in state so consumers (TaskContext, NotificationBell) re-render
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  // console.log("🚀 ~ useSocket ~ context:", context)
  if (!context) throw new Error("useSocket must be used inside SocketProvider");
  return context;
};
