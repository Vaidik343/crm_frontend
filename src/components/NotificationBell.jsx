import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../api/axiosInstance";
import { MdNotifications, MdNotificationsNone, MdDoneAll } from "react-icons/md";

// ── Show a system-level browser notification ───────────────────────────────────
const showSystemNotification = (notification) => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const n = new Notification(notification.title, {
    body: notification.message,
    icon: "/logo.png",
    badge: "/logo.png",
    tag: notification.id, // prevents duplicate popups for same notification
  });

  setTimeout(() => n.close(), 5000);

  n.onclick = () => {
    window.focus();
    n.close();
  };
};

const NotificationBell = () => {
  const { user } = useAuth();
  const { socket } = useSocket(); // consume global socket

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [page, setPage]                   = useState(1);
  const [hasMore, setHasMore]             = useState(true);
  const [permissionState, setPermissionState] = useState(
    "Notification" in window ? Notification.permission : "denied"
  );
  const dropdownRef = useRef(null);

  // ── Request browser notification permission ───────────────────────────────────
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setPermissionState(permission);
  };

  // ── Fetch notifications from DB on mount ─────────────────────────────────────
  useEffect(() => {
    fetchNotifications(1);
  }, []);

  // ── Listen for real-time notifications on the shared socket ──────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnread((prev) => prev + 1);
      showSystemNotification(notification);
    };

    socket.on("notification", handleNotification);

    // cleanup listener only (socket lifecycle is managed by SocketContext)
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  // ── Close dropdown on outside click ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── API helpers ───────────────────────────────────────────────────────────────
  const fetchNotifications = async (pageNo = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications?page=${pageNo}&limit=5`);

      if (pageNo === 1) {
        setNotifications(res.data.data || []);
      } else {
        setNotifications((prev) => [...prev, ...(res.data.data || [])]);
      }

      setUnread(res.data.unread || 0);
      const loaded = pageNo * (res.data.limit || 5);
      setHasMore(loaded < res.data.total);
    } catch (err) {
      console.error("fetchNotifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("markRead error:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch (err) {
      console.error("markAllRead error:", err);
    }
  };

  // ── Styling helpers ───────────────────────────────────────────────────────────
  const typeColors = {
    TASK_ASSIGNED: "bg-blue-100 text-blue-600",
    TASK_UPDATED:  "bg-purple-100 text-purple-600",
    CALL_TRANSFER: "bg-orange-100 text-orange-600",
    PROJECT_ADDED: "bg-green-100 text-green-600",
    TASK_DUE_SOON: "bg-red-100 text-red-600",
    CALL_FOLLOWUP: "bg-yellow-100 text-yellow-600",
    default:       "bg-slate-100 text-slate-600",
  };
  const getTypeColor = (type) => typeColors[type] || typeColors.default;

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#009966] hover:bg-white/10 transition"
      >
        {unread > 0
          ? <MdNotifications size={24} />
          : <MdNotificationsNone size={24} />
        }

        {/* Unread badge */}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#e98937] rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-lg">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-14 w-[360px] bg-white rounded-[1.5rem] shadow-2xl shadow-slate-300/40 border border-slate-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">
                Notifications
              </h3>
              {unread > 0 && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {unread} unread
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Enable Notifications button — only shows if not yet granted */}
              {permissionState !== "granted" && (
                <button
                  onClick={requestNotificationPermission}
                  title={
                    permissionState === "denied"
                      ? "Blocked in browser settings. Allow in site settings."
                      : "Enable desktop alerts"
                  }
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:text-[#132ea7] transition px-2 py-1 rounded-lg hover:bg-[#132ea7]/10"
                  style={{ color: permissionState === "denied" ? "#ef4444" : "#e98937" }}
                >
                  <MdNotificationsNone size={14} />
                  {permissionState === "denied" ? "Blocked" : "Enable Alerts"}
                </button>
              )}

              {/* Mark all read */}
              {/* {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-[10px] font-black text-[#132ea7] uppercase tracking-widest hover:text-[#e98937] transition"
                >
                  <MdDoneAll size={16} />
                  All read
                </button>
              )} */}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <MdNotificationsNone size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                  No notifications
                </p>
              </div>
            ) : (
              <>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    className={`flex items-start gap-3 px-5 py-4 border-b border-slate-50 cursor-pointer transition-colors
                      ${n.is_read ? "bg-white" : "bg-[#132ea7]/[0.03] hover:bg-[#132ea7]/[0.06]"}`}
                  >
                    {/* Type badge */}
                    <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getTypeColor(n.type)}`}>
                      {n.type?.replace(/_/g, " ")}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black leading-tight ${!n.is_read ? "text-[#132ea7]" : "text-slate-800"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs font-bold text-slate-400 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1.5">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.is_read && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-[#e98937] mt-2" />
                    )}
                  </div>
                ))}

                {/* Load More */}
                {hasMore && (
                  <button
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      fetchNotifications(next);
                    }}
                    disabled={loading}
                    className="w-full py-3.5 text-[10px] font-black text-[#132ea7] uppercase tracking-widest hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;