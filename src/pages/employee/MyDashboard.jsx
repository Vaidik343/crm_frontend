import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import {
  MdCheckCircle, MdPhone, MdFolder, MdGroup, MdWarning,
  MdAccessTime, MdArrowForward, MdTrendingUp, MdTask,
  MdCalendarToday, MdPerson
} from "react-icons/md";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent, textAccent, dark }) => (
  <div className={`rounded-[1.5rem] p-6 flex items-center gap-5 ${
    dark
      ? "bg-[#132ea7] shadow-lg shadow-[#132ea7]/20"
      : "bg-white border border-slate-100 shadow-lg"
  }`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${accent}`}>
      {icon}
    </div>
    <div>
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${dark ? "text-white/60" : "text-slate-400"}`}>
        {label}
      </p>
      <p className={`text-3xl font-black ${dark ? "text-white" : "text-slate-800"}`}>
        {value ?? 0}
      </p>
    </div>
  </div>
);

// ── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ open, ongoing, closed, total }) => {
  if (!total) return <div className="h-1.5 rounded-full bg-slate-100 w-full" />;
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden w-full gap-px">
      {open    > 0 && <div className="bg-slate-300 rounded-full" style={{ width: `${(open/total)*100}%` }} />}
      {ongoing > 0 && <div className="bg-[#132ea7] rounded-full" style={{ width: `${(ongoing/total)*100}%` }} />}
      {closed  > 0 && <div className="bg-emerald-400 rounded-full" style={{ width: `${(closed/total)*100}%` }} />}
    </div>
  );
};

// ── Task Row ──────────────────────────────────────────────────────────────────
const TaskRow = ({ task }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "closed";
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-50 last:border-0 group">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
          task.status === "closed"  ? "bg-emerald-400" :
          task.status === "ongoing" ? "bg-[#132ea7]"   : "bg-slate-300"
        }`} />
        <div className="min-w-0 flex-1">
          <p className="font-black text-slate-700 text-sm truncate group-hover:text-[#132ea7] transition-colors">{task.task}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {task.project?.name && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <MdFolder size={10} className="text-slate-300" />
                {task.project.name}
              </span>
            )}
            {task.due_date && (
              <>
                <span className="text-slate-200 text-[10px]">•</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                  isOverdue ? "text-red-500" : "text-slate-400"
                }`}>
                  <MdCalendarToday size={10} />
                  {isOverdue ? "Overdue" : `Due ${new Date(task.due_date).toLocaleDateString("default", { month: "short", day: "numeric" })}`}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <Badge value={task.status} />
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const MyDashboard = () => {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
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
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <MdWarning size={32} className="text-red-400" />
      </div>
      <p className="text-slate-600 font-bold">{error}</p>
    </div>
  );

  const { summary, alerts, my_teams, my_projects, my_tasks, tasks_by_project, my_calls } = data;
  const ts = summary?.task_stats || {};
  const cs = summary?.call_stats || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
            MY <span className="text-[#132ea7]">Dashboard</span>
          </h2>
          <p className="text-slate-400 font-medium mt-1">Your work at a glance</p>
        </div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {new Date().toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* ── Alerts ── */}
      {(alerts?.overdue_count > 0 || alerts?.due_soon_count > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {alerts.overdue_count > 0 && (
            <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex-1">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <MdWarning size={18} className="text-red-500" />
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
            <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex-1">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <MdAccessTime size={18} className="text-amber-500" />
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

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Teams"    value={summary?.total_teams}    icon={<MdGroup size={26} className="text-[#132ea7]" />}       accent="bg-[#132ea7]/10" />
        <StatCard label="Projects" value={summary?.total_projects} icon={<MdFolder size={26} className="text-violet-500" />}     accent="bg-violet-50" />
        <StatCard label="My Tasks" value={ts.total}                icon={<MdCheckCircle size={26} className="text-white" />}     accent="bg-white/20" dark />
        <StatCard label="Calls"    value={cs.total}                icon={<MdPhone size={26} className="text-emerald-500" />}     accent="bg-emerald-50" />
      </div>

      {/* ── Task Progress Bar ── */}
      {ts.total > 0 && (
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-lg px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Task Overview</h3>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open ({ts.open})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#132ea7]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ongoing ({ts.ongoing})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Done ({ts.closed})</span>
              </div>
            </div>
          </div>
          <ProgressBar open={ts.open} ongoing={ts.ongoing} closed={ts.closed} total={ts.total} />
        </div>
      )}

      {/* ── Main Grid: Tasks + Teams ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* My Tasks */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">My Tasks</h3>
            <div className="flex items-center gap-3">
              {[
                { label: "Open", value: ts.open, color: "text-slate-600 bg-slate-50" },
                { label: "Ongoing", value: ts.ongoing, color: "text-[#132ea7] bg-[#132ea7]/5" },
                { label: "Done", value: ts.closed, color: "text-emerald-600 bg-emerald-50" },
              ].map((s) => (
                <div key={s.label} className={`flex flex-col items-center px-3 py-1.5 rounded-xl ${s.color}`}>
                  <span className={`text-lg font-black`}>{s.value ?? 0}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-8 py-2">
            {!my_tasks?.length ? (
              <div className="text-center py-12 text-slate-300 font-bold uppercase tracking-widest text-sm">
                <MdTask size={32} className="mx-auto mb-3 opacity-30" />
                No tasks assigned yet
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {my_tasks.slice(0, 10).map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Teams */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              My Teams
              <span className="ml-2 bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded-full font-black">{my_teams?.length ?? 0}</span>
            </h3>
          </div>
          <div className="p-4">
            {!my_teams?.length ? (
              <div className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-sm">
                <MdGroup size={28} className="mx-auto mb-2 opacity-30" />
                No teams yet
              </div>
            ) : (
              <div className="space-y-2">
                {my_teams.map((team) => (
                  <button
                    key={team.team_id}
                    onClick={() => navigate(`/employee/teams/${team.team_id}/dashboard`)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-[#132ea7]/20 hover:bg-[#132ea7]/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-sm group-hover:bg-[#132ea7] group-hover:text-white transition-all">
                        {team.team_name?.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-700">{team.team_name}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                          team.is_active ? "text-emerald-500" : "text-slate-400"
                        }`}>
                          {team.is_active ? "● Active" : "● Inactive"}
                        </span>
                      </div>
                    </div>
                    <MdArrowForward size={16} className="text-slate-300 group-hover:text-[#132ea7] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Grid: Tasks by Project + Recent Calls ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Tasks by Project */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Tasks by Project</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{my_projects?.length ?? 0} projects</span>
          </div>
          <div className="p-6">
            {!tasks_by_project?.length ? (
              <div className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-sm">
                <MdFolder size={28} className="mx-auto mb-2 opacity-30" />
                No projects
              </div>
            ) : (
              <div className="space-y-5">
                {tasks_by_project.map((p) => (
                  <div key={p.project_id}>
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <p className="text-sm font-black text-slate-700">{p.project_name}</p>
                        {p.team_name && (
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                            <MdGroup size={10} /> {p.team_name}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                        {p.my_tasks} task{p.my_tasks !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <ProgressBar open={p.open} ongoing={p.ongoing} closed={p.closed} total={p.my_tasks} />
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Open: {p.open}</span>
                      <span className="text-[9px] font-black text-[#132ea7] uppercase tracking-widest">Ongoing: {p.ongoing}</span>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Done: {p.closed}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Calls</h3>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">{cs.inquiry ?? 0} Inquiry</span>
              <span className="text-[9px] font-black text-[#132ea7] bg-[#132ea7]/10 px-2 py-1 rounded-lg uppercase tracking-widest">{cs.request ?? 0} Request</span>
              <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg uppercase tracking-widest">{cs.complaint ?? 0} Complaint</span>
            </div>
          </div>
          <div className="p-4">
            {!my_calls?.length ? (
              <div className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-sm">
                <MdPhone size={28} className="mx-auto mb-2 opacity-30" />
                No calls logged
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {my_calls.slice(0, 8).map((call) => (
                  <div key={call.id} className="flex items-center justify-between py-3.5 px-2 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-sm flex-shrink-0">
                        {call.caller_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700">{call.caller_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <MdFolder size={10} className="text-slate-300" />
                          {call.Project?.name || "No project"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge value={call.call_type} />
                      <span className="text-[9px] font-bold text-slate-400">
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

    </div>
  );
};

export default MyDashboard;
