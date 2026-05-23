import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";
import {
  MdGroup, MdFolder, MdCheckCircle, MdPhone, MdWarning,
  MdArrowBack, MdPerson, MdTrendingUp, MdAccessTime, MdFiberManualRecord
} from "react-icons/md";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent }) => (
  <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-lg p-6 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${accent}`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-800">{value ?? 0}</p>
    </div>
  </div>
);

// ── Task Bar ──────────────────────────────────────────────────────────────────
const TaskBar = ({ open, ongoing, closed, total }) => {
  if (!total) return <div className="h-2 rounded-full bg-slate-100 w-full" />;
  return (
    <div className="flex h-2 rounded-full overflow-hidden w-full gap-0.5">
      {open > 0 && <div className="bg-slate-300 rounded-full" style={{ width: `${(open / total) * 100}%` }} />}
      {ongoing > 0 && <div className="bg-[#132ea7] rounded-full" style={{ width: `${(ongoing / total) * 100}%` }} />}
      {closed > 0 && <div className="bg-emerald-400 rounded-full" style={{ width: `${(closed / total) * 100}%` }} />}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const TeamDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/teams/${id}/dashboard`);

        setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Loading team dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <MdWarning size={32} className="text-red-400" />
      </div>
      <p className="text-slate-600 font-bold text-lg">{error}</p>
      <button onClick={() => navigate(-1)} className="text-[#132ea7] font-black uppercase tracking-widest text-sm flex items-center gap-2">
        <MdArrowBack size={18} /> Go Back
      </button>
    </div>
  );

  const { team, summary, alerts, members, member_stats, project_stats, recent_calls, recent_activity } = data;
  const ts = summary?.task_stats || {};
  const tabs = ["overview", "members", "projects", "activity"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-[#132ea7] hover:border-[#132ea7]/20 transition-all shadow-sm"
          >
            <MdArrowBack size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
                {team?.name}
              </h2>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${team?.is_active
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-slate-50 text-slate-400 border-slate-100"
                }`}>
                {team?.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            {team?.description && (
              <p className="text-slate-400 font-medium mt-1">{team.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(alerts?.overdue_count > 0 || alerts?.due_soon_count > 0) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {alerts.overdue_count > 0 && (
            <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl px-6 py-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <MdWarning size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-black text-red-700 uppercase tracking-widest">
                  {alerts.overdue_count} Overdue Task{alerts.overdue_count !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-red-400 font-medium mt-0.5">Past due date, needs immediate attention</p>
              </div>
            </div>
          )}
          {alerts.due_soon_count > 0 && (
            <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 rounded-2xl px-6 py-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <MdAccessTime size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-700 uppercase tracking-widest">
                  {alerts.due_soon_count} Due Soon
                </p>
                <p className="text-xs text-amber-400 font-medium mt-0.5">Due within 48 hours</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Members" value={summary?.total_members} icon={<MdGroup size={28} className="text-[#132ea7]" />} accent="bg-[#132ea7]/10" />
        <StatCard label="Projects" value={summary?.total_projects} icon={<MdFolder size={28} className="text-violet-500" />} accent="bg-violet-50" />
        <StatCard label="Total Tasks" value={ts.total} icon={<MdCheckCircle size={28} className="text-slate-500" />} accent="bg-slate-100" />
        <StatCard label="Completed" value={ts.closed} icon={<MdTrendingUp size={28} className="text-emerald-500" />} accent="bg-emerald-50" />
      </div>

      {/* Task Progress Overview */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg p-8">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Task Progress</h3>
        <div className="space-y-3">
          <TaskBar open={ts.open} ongoing={ts.ongoing} closed={ts.closed} total={ts.total} />
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Open ({ts.open})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#132ea7]" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Ongoing ({ts.ongoing})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Closed ({ts.closed})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-2 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
              ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
              : "text-slate-400 hover:text-slate-600"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Overview — project stats */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Projects Overview</h3>
          {project_stats?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 font-bold uppercase tracking-widest">
              No projects in this team
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project_stats?.map((p) => (
                <div key={p.project_id} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center font-black">
                      <MdFolder size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{p.project_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.total} tasks total</p>
                    </div>
                  </div>
                  <TaskBar open={p.open} ongoing={p.ongoing} closed={p.closed} total={p.total} />
                  <div className="flex justify-between mt-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Open: {p.open}</span>
                    <span className="text-[10px] font-black text-[#132ea7] uppercase">Ongoing: {p.ongoing}</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Done: {p.closed}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Members */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Member Productivity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {member_stats?.map((m) => (
              <div key={m.user_id} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-lg p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-lg">
                    {m.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800">{m.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.employee_id}</p>
                    {m.role && (
                      <span className="text-[10px] font-black text-[#132ea7] uppercase tracking-widest bg-[#132ea7]/10 px-2 py-0.5 rounded-full">
                        {m.role}
                      </span>
                    )}
                  </div>
                </div>
                <TaskBar open={m.tasks_open} ongoing={m.tasks_ongoing} closed={m.tasks_closed} total={m.tasks_total} />
                <div className="flex justify-between mt-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Open: {m.tasks_open}</span>
                  <span className="text-[10px] font-black text-[#132ea7] uppercase">Ongoing: {m.tasks_ongoing}</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Done: {m.tasks_closed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Projects — recent calls */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Calls</h3>
          {recent_calls?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 font-bold uppercase tracking-widest">
              No calls logged for this team's projects
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Caller</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logged By</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recent_calls.map((call) => (
                    <tr key={call.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#132ea7] flex items-center justify-center font-black text-sm">
                            {call.caller_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-700 text-sm">{call.caller_name}</p>
                            {call.caller_number && <p className="text-[10px] text-slate-400 font-bold">{call.caller_number}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-slate-600">{call.Project?.name || "—"}</td>
                      <td className="px-6 py-5"><Badge value={call.call_type} /></td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-500">{call.User?.name || "—"}</td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-400">
                        {new Date(call.createdAt).toLocaleDateString("default", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Activity */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Activity</h3>
          {recent_activity?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 font-bold uppercase tracking-widest">
              No recent activity
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg divide-y divide-slate-50">
              {recent_activity.map((task) => (
                <div key={task.id} className="flex items-start gap-5 px-8 py-5 hover:bg-slate-50/80 transition-colors">
                  <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${task.status === "closed" ? "bg-emerald-400" :
                    task.status === "ongoing" ? "bg-[#132ea7]" : "bg-slate-300"
                    }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-700 text-sm truncate">{task.task}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {task.project?.name || "No Project"}
                      </span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {task.assignee?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Badge value={task.status} />
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(task.updatedAt).toLocaleDateString("default", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default TeamDashboard;
