import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import Spinner from "../components/ui/Spinner";
import { MdAssignment, MdPhone, MdFolder, MdComment, MdCheckCircle } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
const TYPE_META = {
  TASK_ASSIGNED:    { label: "Task Assigned",    icon: MdAssignment, color: "text-blue-600 bg-blue-100" },
  TASK_UPDATED:     { label: "Task Updated",     icon: MdAssignment, color: "text-purple-600 bg-purple-100" },
  TASK_DUE_SOON:    { label: "Task Due Soon",    icon: MdAssignment, color: "text-red-600 bg-red-100" },
  CALL_TRANSFER:    { label: "Call Transfer",    icon: MdPhone,      color: "text-orange-600 bg-orange-100" },
  CALL_FOLLOWUP:    { label: "Call Follow-up",   icon: MdPhone,      color: "text-yellow-600 bg-yellow-100" },
  PROJECT_ADDED:    { label: "Project Added",    icon: MdFolder,     color: "text-green-600 bg-green-100" },
  MEETING_ATTENDEE: { label: "Meeting Attendee", icon: MdComment,    color: "text-teal-600 bg-teal-100" },
};

const TYPE_FILTERS = [
  { value: "",                 label: "All Types" },
  { value: "TASK_ASSIGNED",    label: "Task Assigned" },
  { value: "TASK_UPDATED",     label: "Task Updated" },
  { value: "TASK_DUE_SOON",    label: "Task Due Soon" },
  { value: "CALL_TRANSFER",    label: "Call Transfer" },
  { value: "CALL_FOLLOWUP",    label: "Call Follow-up" },
  { value: "PROJECT_ADDED",    label: "Project Added" },
  { value: "MEETING_ATTENDEE", label: "Meeting Attendee" },
];

const buildLink = (notification, isAdmin) => {
  const prefix = isAdmin ? "/admin" : "/employee";
  const { type } = notification;
  if (type.startsWith("TASK")) return `${prefix}/tasks`;
  if (type.startsWith("CALL")) return `${prefix}/calls`;
  if (type.startsWith("PROJECT")) return `${prefix}/projects`;
  if (type === "MEETING_ATTENDEE") return `${prefix}/calls`;
  return null;
};


const NotificationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all"); // all | unread | read
  const [typeFilter, setTypeFilter] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 15;

  const { isAdmin } = useAuth();

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, limit };
    console.log("🚀 ~ NotificationsPage ~ params:", params)
    if (activeTab === "unread") params.is_read = "false";
    if (activeTab === "read")   params.is_read = "true";
    if (typeFilter) params.type = typeFilter;

    api.get("/notifications", { params })
      .then((res) => {
        setNotifications(res.data.data);
        setTotal(res.data.total);
        setUnread(res.data.unread);
      })
      .finally(() => setLoading(false));
  }, [activeTab, typeFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => { setPage(1); }, [activeTab, typeFilter]);

    const handleClick = async (n) => {
      if (!n.is_read) {
        await api.patch(`/notifications/${n.id}/read`);
        setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
        setUnread((u) => Math.max(0, u - 1));
      }
      const link = buildLink(n, isAdmin);
      if (link) navigate(link);
    };

  const handleMarkAllRead = async () => {
    await api.patch("/notifications/read-all");
    fetchData();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Notifications</h2>
        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-black text-[#132ea7] uppercase tracking-widest hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 border-b border-slate-100">
          {[
            { key: "all",    label: "All" },
            { key: "unread", label: `Unread${unread ? ` (${unread})` : ""}` },
            { key: "read",   label: "Read" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                activeTab === tab.key
                  ? "border-[#132ea7] text-[#132ea7]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 uppercase tracking-widest"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : !notifications.length ? (
          <div className="text-center py-16 text-slate-300 font-bold uppercase tracking-widest text-sm">No notifications</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type] || { label: n.type, icon: MdCheckCircle, color: "text-slate-400 bg-slate-100" };
              const Icon = meta.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-4 px-8 py-5 text-left hover:bg-slate-50/50 transition-colors ${!n.is_read ? "bg-[#132ea7]/[0.03]" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-800 text-sm">{n.title}</p>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#132ea7] flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">{n.message}</p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                      {new Date(n.createdAt).toLocaleString("default", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                p === page ? "bg-[#132ea7] text-white" : "bg-white border border-slate-100 text-slate-400 hover:text-slate-600"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;