import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import Spinner from "../../components/ui/Spinner";
import Badge, { DueDateBadge } from "../../components/ui/Badge";
import {
  MdFolder, MdGroup, MdPhone, MdWarning, MdAccessTime,
  MdArrowBack, MdAssignment, MdCalendarToday, MdCheckCircle,
  MdPerson, MdDownload 
} from "react-icons/md";
import ExportProjectModal from "../../components/ui/ExportProjectModal";
const STATUS_COLORS = {
  planning:  "bg-slate-100 text-slate-600",
  active:    "bg-emerald-100 text-emerald-700",
  testing:   "bg-purple-100 text-purple-700",
  completed: "bg-blue-100 text-blue-700",
};

const ProgressBar = ({ open, ongoing, closed, total }) => {
  if (!total) return <div className="h-2 rounded-full bg-slate-100 w-full" />;
  return (
    <div className="flex h-2 rounded-full overflow-hidden w-full gap-px">
      {open    > 0 && <div className="bg-[#e98937] rounded-full" style={{ width: `${(open/total)*100}%` }} />}
      {ongoing > 0 && <div className="bg-[#132ea7] rounded-full" style={{ width: `${(ongoing/total)*100}%` }} />}
      {closed  > 0 && <div className="bg-emerald-400 rounded-full" style={{ width: `${(closed/total)*100}%` }} />}
    </div>
  );
};

const ProjectDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [showExport, setShowExport] = useState(false);



  useEffect(() => {
    api.get(`/projects/${id}/dashboard`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);


  const handleExport = async () => {
  setExporting(true);
  try {
    const params = {};
    if (exportFrom && exportTo) {
      params.from = exportFrom;
      params.to = exportTo;
    }
    const res = await api.get(`/export/project/${id}`, {
      params,
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    const fileLabel = exportFrom && exportTo ? `${exportFrom}_to_${exportTo}` : new Date().toISOString().split("T")[0];
    link.setAttribute("download", `${project.name}_activity_${fileLabel}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setShowExport(false);
  } catch (err) {
    alert(err?.response?.data?.message || "Export failed");
  } finally {
    setExporting(false);
  }
};
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Loading project...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <MdWarning size={40} className="text-red-300" />
      <p className="text-slate-600 font-bold">{error}</p>
      <button onClick={() => navigate(-1)} className="text-[#132ea7] font-black text-sm uppercase tracking-widest hover:underline">
        Go Back
      </button>
    </div>
  );

  const { project, summary, alerts, members, member_stats, recent_calls, recent_tasks } = data;
  const ts = summary?.task_stats || {};
  const cs = summary?.call_stats || {};


const overdueTasks = (recent_tasks || []).filter(
  (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "closed"
);
const dueSoonTasks = (recent_tasks || []).filter((t) => {
  if (!t.due_date || t.status === "closed") return false;
  const diff = new Date(t.due_date) - new Date();
  return diff > 0 && diff <= 48 * 60 * 60 * 1000;
});


  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="mt-1 p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-[#132ea7] hover:border-[#132ea7]/20 transition-all shadow-sm"
        >
          <MdArrowBack size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
              {project.name}
            </h2>
            <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-xs font-black uppercase tracking-widest">
              {project.code || "—"}
            </span>
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[project.development_status] || "bg-slate-100 text-slate-600"}`}>
              {project.development_status || "—"}
            </span>
          </div>
          {project.description && (
            <p className="text-slate-400 font-bold text-sm mt-1">{project.description}</p>
          )}
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Created by {project.creator?.name || "—"} · {new Date(project.createdAt).toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        

  {/* Export */}
<button
  onClick={() => setShowExport(true)}
  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-widest shadow-sm hover:bg-[#132ea7]/90 transition-all mt-1"
>
  <MdDownload size={16} />
  Export
</button>
      </div>


      {/* Alerts */}
      {(alerts?.overdue_count > 0 || alerts?.due_soon_count > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {alerts.overdue_count > 0 && (
            <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <MdWarning size={20} className="text-red-500" />
              </div>
              <div>
  <p className="text-sm font-black text-red-700 uppercase tracking-widest">
    {alerts.overdue_count} Overdue Task{alerts.overdue_count !== 1 ? "s" : ""}
  </p>
  <p className="text-xs text-red-400 font-medium mt-0.5">Needs immediate attention</p>
  {overdueTasks.length > 0 && (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {[...new Set(overdueTasks.map((t) => t.assignee?.name).filter(Boolean))].map((name) => (
        <span key={name} className="px-2 py-0.5 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
          {name}
        </span>
      ))}
    </div>
  )}
</div>

            </div>
          )}
          {alerts.due_soon_count > 0 && (
            <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <MdAccessTime size={20} className="text-amber-500" />
              </div>
<div>
  <p className="text-sm font-black text-amber-700 uppercase tracking-widest">
    {alerts.due_soon_count} Due Within 48 Hours
  </p>
  <p className="text-xs text-amber-400 font-medium mt-0.5">Plan accordingly</p>
  {dueSoonTasks.length > 0 && (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {[...new Set(dueSoonTasks.map((t) => t.assignee?.name).filter(Boolean))].map((name) => (
        <span key={name} className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
          {name}
        </span>
      ))}
    </div>
  )}
</div>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Members",   value: summary?.total_members, icon: <MdGroup size={22} className="text-[#132ea7]" />,       color: "bg-[#132ea7]/10" },
          { label: "Tasks",     value: ts.total,               icon: <MdAssignment size={22} className="text-violet-500" />, color: "bg-violet-50",    sub: `${ts.ongoing ?? 0} ongoing` },
          { label: "Calls",     value: cs.total,               icon: <MdPhone size={22} className="text-emerald-500" />,     color: "bg-emerald-50",   sub: `${cs.inquiry ?? 0} inquiries` },
          { label: "Completed", value: ts.closed,              icon: <MdCheckCircle size={22} className="text-blue-500" />,  color: "bg-blue-50",      sub: `${ts.total ? Math.round((ts.closed/ts.total)*100) : 0}% done` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{s.label}</p>
              <p className="text-2xl font-black text-slate-800">{s.value ?? 0}</p>
              {s.sub && <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Task progress */}
      {ts.total > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Task Progress</h3>
            <div className="flex items-center gap-4 flex-wrap justify-end">
              {[
                { dot: "bg-[#e98937]",   label: "Open",    val: ts.open },
                { dot: "bg-[#132ea7]",   label: "Ongoing", val: ts.ongoing },
                { dot: "bg-emerald-400", label: "Done",    val: ts.closed },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label} ({s.val ?? 0})</span>
                </div>
              ))}
            </div>
          </div>
          <ProgressBar open={ts.open} ongoing={ts.ongoing} closed={ts.closed} total={ts.total} />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Tasks</h3>
          </div>
          <div className="px-6 py-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {!recent_tasks?.length ? (
              <div className="text-center py-12 text-slate-300 font-bold uppercase tracking-widest text-sm">No tasks yet</div>
            ) : (
              recent_tasks.map((task) => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "closed";
                return (
                  <div key={task.id} className="flex items-center justify-between gap-4 py-4 border-b border-slate-50 last:border-0">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        task.status === "closed" ? "bg-emerald-400" :
                        task.status === "ongoing" ? "bg-[#132ea7]" : "bg-slate-300"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-800 text-sm truncate">{task.task}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {task.assignee?.name || "—"}
                          </span>
                          {task.due_date && (
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isOverdue ? "text-red-500" : "text-slate-400"}`}>
                              · {isOverdue ? "Overdue" : new Date(task.due_date).toLocaleDateString("default", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge value={task.status} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Members</h3>
            <span className="bg-[#132ea7]/10 text-[#132ea7] text-xs px-3 py-1 rounded-full font-black">{members?.length ?? 0}</span>
          </div>
          <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {!member_stats?.length ? (
              <div className="text-center py-10 text-slate-300 font-bold text-sm">No members</div>
            ) : (
              member_stats.map((m) => (
                <div key={m.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-sm flex-shrink-0">
                      {m.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">{m.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.role || m.employee_id || "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#132ea7]">{m.tasks_total}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">tasks</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Member Stats Table */}
      {member_stats?.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Member Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Open</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ongoing</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Done</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {member_stats.map((m) => (
                  <tr key={m.user_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-xs">
                          {m.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-700">{m.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{m.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {m.role || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-slate-500">{m.tasks_open}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-[#132ea7]">{m.tasks_ongoing}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-emerald-600">{m.tasks_closed}</span>
                    </td>
                    <td className="px-6 py-4 w-40">
                      <ProgressBar
                        open={m.tasks_open}
                        ongoing={m.tasks_ongoing}
                        closed={m.tasks_closed}
                        total={m.tasks_total}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Calls */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Calls</h3>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg uppercase tracking-widest">{cs.inquiry ?? 0} Inquiry</span>
            <span className="text-[9px] font-black text-[#132ea7] bg-[#132ea7]/10 border border-[#132ea7]/20 px-2 py-1 rounded-lg uppercase tracking-widest">{cs.request ?? 0} Request</span>
            <span className="text-[9px] font-black text-red-500 bg-red-50 border border-red-100 px-2 py-1 rounded-lg uppercase tracking-widest">{cs.complaint ?? 0} Complaint</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Caller</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medium</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!recent_calls?.length ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-300 font-bold text-sm uppercase tracking-widest">No calls yet</td>
                </tr>
              ) : (
                recent_calls.slice(0, 10).map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-xs flex-shrink-0">
                          {call.caller_name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-700">{call.caller_name}</p>
                          {call.caller_number && <p className="text-[10px] font-bold text-slate-400">{call.caller_number}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Badge value={call.call_type} /></td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-widest">{call.receive_type || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-600">{call.User?.name || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-400">
                        {new Date(call.createdAt).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
<ExportProjectModal show={showExport} onClose={() => setShowExport(false)} project={project} />
    </div>
  );
};

export default ProjectDashboard;