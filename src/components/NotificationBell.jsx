import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { MdNotifications, MdNotificationsNone } from "react-icons/md";

const NotificationBell = () => {
  const { isAdmin } = useAuth();
  const { bellNotifications, unread, loading, markRead, markAllRead } = useNotification();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [permissionState, setPermissionState] = useState(
    "Notification" in window ? Notification.permission : "denied"
  );
  const dropdownRef = useRef(null);

  // Add this inside NotificationBell component
const handleNotificationClick = async (n) => {
  setOpen(false);
  if (!n.is_read) {
    await markRead(n.id);
  }
  const link = buildLink(n, isAdmin);
  if (link) navigate(link);
};

const buildLink = (notification, isAdmin) => {
  const prefix = isAdmin ? "/admin" : "/employee";
  const { type } = notification;
  if (type.startsWith("TASK"))    return `${prefix}/tasks`;
  if (type.startsWith("CALL"))    return `${prefix}/calls`;
  if (type.startsWith("PROJECT")) return `${prefix}/projects`;
  if (type.startsWith("LEAVE"))   return `${prefix}/leaves`;
  if (type.startsWith("INTERN"))  return `${prefix}/interns`;
  if (type === "WORKLOG_CREATED") return `${prefix}/work-logs`;
  if (type === "MEETING_ATTENDEE")return `${prefix}/calls`;
  if (type === "EVENT")           return `${prefix}/events`;
  return null;
};
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setPermissionState(permission);
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeColors = {
    TASK_ASSIGNED:     "bg-blue-100 text-blue-600",
    TASK_UPDATED:      "bg-purple-100 text-purple-600",
    CALL_TRANSFER:     "bg-orange-100 text-orange-600",
    PROJECT_ADDED:     "bg-green-100 text-green-600",
    TASK_DUE_SOON:     "bg-red-100 text-red-600",
    CALL_FOLLOWUP:     "bg-yellow-100 text-yellow-600",
    MEETING_ATTENDEE:  "bg-teal-100 text-teal-600",
    LEAVE_REQUESTED:   "bg-amber-100 text-amber-600",
    LEAVE_APPROVED:    "bg-green-100 text-green-600",
    LEAVE_REJECTED:    "bg-red-100 text-red-600",
    LEAVE_CANCELLED:   "bg-slate-100 text-slate-600",
    CALL_LOGGED:       "bg-orange-100 text-orange-600",
    WORKLOG_CREATED:   "bg-indigo-100 text-indigo-600",
    INTERN_REGISTERED: "bg-pink-100 text-pink-600",
    INTERN_ACTIVATED:  "bg-teal-100 text-teal-600",
    EVENT:             "bg-purple-100 text-purple-600",
    default:           "bg-slate-100 text-slate-600",
  };

  const getTypeColor = (type) => typeColors[type] || typeColors.default;

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#009966] hover:bg-white/10 transition"
      >
        {unread > 0 ? (
          <MdNotifications size={24} />
        ) : (
          <MdNotificationsNone size={24} />
        )}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#e98937] rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-lg">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

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
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-black text-[#132ea7] uppercase tracking-widest hover:underline"
                >
                  Mark all read
                </button>
              )}
              {permissionState !== "granted" && (
                <button
                  onClick={requestNotificationPermission}
                  title={
                    permissionState === "denied"
                      ? "Blocked in browser settings."
                      : "Enable desktop alerts"
                  }
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:text-[#132ea7] transition px-2 py-1 rounded-lg hover:bg-[#132ea7]/10"
                  style={{
                    color: permissionState === "denied" ? "#ef4444" : "#e98937",
                  }}
                >
                  <MdNotificationsNone size={14} />
                  {permissionState === "denied" ? "Blocked" : "Enable Alerts"}
                </button>
              )}
            </div>
          </div>

          {/* List Section */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading && bellNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">
                Loading...
              </div>
            ) : bellNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <MdNotificationsNone
                  size={40}
                  className="text-slate-200 mx-auto mb-3"
                />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                  No notifications
                </p>
              </div>
            ) : (
              bellNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                    n.is_read
                      ? "bg-white hover:bg-slate-50/80"
                      : "bg-[#132ea7]/[0.03] hover:bg-[#132ea7]/[0.06]"
                  }`}
                >
                  {/* Top Row: Category Badge (Left) + Time & Dot (Right) */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${getTypeColor(
                        n.type
                      )}`}
                    >
                      {n.type?.replace(/_/g, " ")}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {timeAgo(n.createdAt)}
                      </span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#e98937]" />
                      )}
                    </div>
                  </div>

                  {/* Title (Full Width) */}
                  <p
                    className={`text-xs font-black leading-snug ${
                      !n.is_read ? "text-[#132ea7]" : "text-slate-800"
                    }`}
                  >
                    {n.title}
                  </p>

                  {/* Body / Message (Full Width) */}
                  <p className="text-xs font-normal text-slate-500 mt-1 leading-relaxed break-words">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <button
            onClick={() => {
              setOpen(false);
              navigate(
                isAdmin
                  ? "/admin/notifications"
                  : "/employee/notifications"
              );
            }}
            className="w-full py-3.5 text-[10px] font-black text-[#132ea7] uppercase tracking-widest hover:bg-slate-50 transition border-t border-slate-50"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;