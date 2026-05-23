import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import {
  MdCheckCircle, MdPhone, MdFolder, MdGroup, MdWarning,
  MdAccessTime, MdArrowForward, MdTrendingUp, MdFiberManualRecord
} from "react-icons/md";

// ── Mini Stat Card ────────────────────────────────────────────────────────────
const MiniStat = ({ label, value, color }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <p className={`text-2xl font-black ${color}`}>{value ?? 0}</p>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

// ── Task Row ──────────────────────────────────────────────────────────────────
const TaskRow = ({ task }) => (
  <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-50 last:border-0">
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
        task.status === "closed"  ? "bg-emerald-400" :
        task.status === "ongoing" ? "bg-[#132ea7]"   : "bg-slate-300"
      }`} />
      <div className="min-w-0">
        <p className="font-black text-slate-700 text-sm truncate">{task.task}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.project?.name && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {task.project.name}
            </span>
          )}
          {task.due_date && (
            <>
              <span className="text-slate-200 text-[10px]">•</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                new Date(task.due_date) < new Date() && task.status !== "closed"
                  ? "text-red-500" : "text-slate-400"
              }`}>
                Due {new Date(task.due_date).toLocaleDateString("default", { month: "short", day: "numeric" })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
    <Badge value={task.status} />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const MyDashboard = () => {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get("/me/dashboard");
        setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Loading your dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <MdWarning size={40} className="text-red-400" />
      <p className="text-slate-600 font-bold">{error}</p>
    </div>
  );

  const { summary, alerts, my_teams, my_projects, my_tasks, tasks_by_project, my_calls } = data;
  const ts = summary?.task_stats || {};
  const cs = summary?.call_stats || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
          MY <span className="text-[#132ea7]">Dashboard</span>
        </h2>
        <p className="text-slate-400 font-medium">Your work at a glance</p>
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
                <p className="text-xs text-red-400 font-medium mt-0.5">Needs immediate attention</p>
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

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-lg p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#132ea7]/10 flex items-center justify-center flex-shrink-0">
            <MdGroup size={24} className="text-[#132ea7]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Teams</p>
            <p className="text-2xl font-black text-slate-800">{summary?.total_teams ?? 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-lg p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center flex-shrink-0">
            <MdFolder size={24} className="text-violet-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Projects</p>
            <p className="text-2xl font-black text-slate-800">{summary?.total_projects ?? 0}</p>
          </div>
        </div>
        <div className="bg-[#132ea7] rounded-[1.5rem] shadow-lg shadow-[#132ea7]/20 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <MdCheckCircle size={24} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">My Tasks</p>
            <p className="text-2xl font-black text-white">{ts.total ?? 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-lg p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <MdPhone size={24} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Calls</p>
            <p className="text-2xl font-black text-slate-800">{cs.total ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* My Tasks — col span 2 */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">My Tasks</h3>
            <div className="flex items-center gap-4">
              <MiniStat label="Open"    value={ts.open}    color="text-slate-600" />
              <MiniStat label="Ongoing" value={ts.ongoing} color="text-[#132ea7]" />
              <MiniStat label="Done"    value={ts.closed}  color="text-emerald-500" />
            </div>
          </div>

          {my_tasks?.length === 0 ? (
            <div className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-sm">
              No tasks assigned
            </div>
          ) : (
            <div className="space-y-0 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {my_tasks?.slice(0, 10).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* My Teams — col span 1 */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg p-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">My Teams</h3>
          {my_teams?.length === 0 ? (
            <div className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-sm">
              No teams yet
            </div>
          ) : (
            <div className="space-y-3">
              {my_teams.map((team) => (
                <button
                  key={team.team_id}
                  onClick={() => navigate(`/employee/teams/${team.team_id}/dashboard`)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#132ea7]/20 hover:bg-[#132ea7]/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-sm group-hover:bg-[#132ea7] group-hover:text-white transition-all">
                      {team.team_name?.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-700">{team.team_name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        team.is_active ? "text-emerald-500" : "text-slate-400"
                      }`}>
                        {team.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <MdArrowForward size={18} className="text-slate-300 group-hover:text-[#132ea7] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Projects + Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Tasks by Project */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg p-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Tasks by Project</h3>
          {tasks_by_project?.length === 0 ? (
            <div className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-sm">No projects</div>
          ) : (
            <div className="space-y-4">
              {tasks_by_project?.map((p) => (
                <div key={p.project_id}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-black text-slate-700">{p.project_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.team_name}</p>
                    </div>
                    <span className="text-xs font-black text-slate-500">{p.my_tasks} tasks</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 gap-0.5">
                    {p.open    > 0 && <div className="bg-slate-300 rounded-full" style={{ width: `${(p.open/p.my_tasks)*100}%` }} />}
                    {p.ongoing > 0 && <div className="bg-[#132ea7] rounded-full" style={{ width: `${(p.ongoing/p.my_tasks)*100}%` }} />}
                    {p.closed  > 0 && <div className="bg-emerald-400 rounded-full" style={{ width: `${(p.closed/p.my_tasks)*100}%` }} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Calls */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Calls</h3>
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="text-emerald-500">{cs.inquiry} Inquiry</span>
              <span className="text-[#132ea7]">{cs.request} Request</span>
              <span className="text-red-400">{cs.complaint} Complaint</span>
            </div>
          </div>
          {my_calls?.length === 0 ? (
            <div className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-sm">No calls logged</div>
          ) : (
            <div className="space-y-0 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {my_calls?.slice(0, 8).map((call) => (
                <div key={call.id} className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#132ea7] flex items-center justify-center font-black text-sm flex-shrink-0">
                      {call.caller_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">{call.caller_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {call.Project?.name || "No project"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge value={call.call_type} />
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(call.createdAt).toLocaleDateString("default", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default MyDashboard;
