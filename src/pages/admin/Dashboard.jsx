import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import { MdPeople, MdPhone, MdCheckCircle, MdBook, MdGroups } from "react-icons/md";
import Export from "./Export";

import RemarkSummary from "../../components/RemarkSummary";
import { useLocation } from "react-router-dom";



import StatCard from "../../components/ui/StatCard";
import { useNavigate } from "react-router-dom";
import { useTask } from "../../context/TaskContext";
import SearchInput from "../../components/ui/SearchInput";

const renderStatusItems = (breakdown) => {
  return Object.entries(breakdown || {}).map(([status, count]) => {
    if (status === "due" && count > 0) {
      return (
        <div key={status} className="flex items-center gap-2 bg-orange-500 text-white shadow-lg shadow-orange-500/20 px-4 py-2 rounded-[1rem] animate-pulse">
          <span className="text-xs font-black uppercase tracking-widest">Due Today</span>
          <span className="text-lg font-black border-l border-white/20 pl-2 ml-1">{count}</span>
        </div>
      );
    }
    if (status === "overdue" && count > 0) {
      return (
        <div key={status} className="flex items-center gap-2 bg-red-500 text-white shadow-lg shadow-red-500/20 px-4 py-2 rounded-[1rem]">
          <span className="text-xs font-black uppercase tracking-widest">Overdue</span>
          <span className="text-lg font-black border-l border-white/20 pl-2 ml-1">{count}</span>
        </div>
      );
    }

    const statusConfig = {
      open: { color: 'text-[#132ea7]', dot: 'bg-[#132ea7]', label: 'Open' },
      ongoing: { color: 'text-slate-500', dot: 'bg-slate-400', label: 'Ongoing' },
      closed: { color: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Closed' },
      due: { color: 'text-orange-500', dot: 'bg-orange-400', label: 'Due Today' },
      overdue: { color: 'text-red-500', dot: 'bg-red-500', label: 'Overdue' },
    };
    const config = statusConfig[status] || { color: 'text-slate-500', dot: 'bg-slate-500', label: status };
    return (
      <div key={status} className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span className="text-xs font-black capitalize tracking-widest text-slate-400">{config.label}</span>
        <span className={`text-xl font-black ${config.color}`}>{count}</span>
      </div>
    );
  });
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
const {
    tasks,
  
  } = useTask();


// That's the full integration. Two files touched, zero duplication.
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const params = fromDate ? { from: fromDate } : {};
      const { data: res } = await api.get(ENDPOINTS.DASHBOARD.ALL, { params });
      // console.log("🚀 ~ fetchDashboard ~ data:", data)
      setData(res);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [fromDate])



  useEffect(() => {

    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-medium animate-pulse">Loading intelligence...</p>
    </div>
  );
  // console.log(data.task_status_breakdown);
  // console.log(data.task_status_breakdown_all_time);
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
            Welcome back, <span className="text-[#132ea7]">{user?.name}</span> 👋
          </h2>
          <p className="text-slate-500 font-bold text-base">System performance is optimal. Here's your daily summary.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-white p-2 px-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date Range:</span>
            <input
              type="date"
              max={today}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-sm font-bold text-slate-700 bg-slate-50 border-none rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-[#132ea7]/20"
            />
            {fromDate && (
              <button
                onClick={() => setFromDate('')}
                className="text-xs font-bold text-[#132ea7] hover:underline px-2"
              >
                Reset to Today
              </button>
            )}
          </div>

          {/* <div className="flex items-center gap-4 bg-white p-3 px-5 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
               <MdCheckCircle size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">System Status</p>
              <p className="text-base font-black text-emerald-600 uppercase tracking-widest">Active & Secure</p>
            </div>
          </div> */}
        </div>
      </div>

      <Alert type="danger" message={error} onClose={() => setError("")} />

      {/* ── Total counts ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          label="Total Employee"
          value={data?.totals?.employees}
          icon={<MdPeople size={28} />}
          color="secondary"
          description="Active Employees"
          onClick={() => navigate('/admin/employees')}
        />

        <StatCard
          label="Total Projects"
          value={data?.totals?.projects}
          icon={<MdGroups size={28} />}
          color="success"
          description="Active Teams"
          onClick={() => navigate('/admin/projects')}
        />
        <StatCard
          label="Total Calls"
          value={data?.totals?.calls}
          icon={<MdPhone size={28} />}
          color="info"
          description={fromDate ? `Since ${fromDate}` : "Today"}
          onClick={() => navigate('/admin/calls')}
        />
        <StatCard
          label="Total Task"
          value={data?.totals?.tasks}
          icon={<MdCheckCircle size={28} />}
          color="primary"
          description={fromDate ? `Since ${fromDate}` : "Today"}
          onClick={() => navigate('/admin/tasks')}
        />
        <StatCard
          label="Work Archives"
          value={data?.totals?.work_logs}
          icon={<MdBook size={28} />}
          color="warning"
          description={fromDate ? `Since ${fromDate}` : "Today"}
          onClick={() => navigate('/admin/work-logs')}
        />
      </div>

      {/* ── Activity & Status ────────────────────────── */}
      <div className="space-y-8">
        {/* ── Task Breakdown (Simplified) ───────────────── */}
        {/* ── Task Breakdown ───────────────── */}
        <div className="bg-white rounded-[2rem] p-6 px-10 border border-slate-100 shadow-xl shadow-slate-200/30 space-y-5">

          {/* Real-time row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6"

          >
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 whitespace-nowrap">
              <span className="w-2 h-8 bg-[#132ea7] rounded-full" />
              Task Status <span className="text-slate-300 font-bold text-xs tracking-widest uppercase ml-1">Real-time</span>
            </h3>
            <div className="flex flex-wrap items-center gap-4 md:gap-8"
              onClick={() => navigate('/admin/tasks')}
            >
              {renderStatusItems(data?.task_status_breakdown)}

            </div>
          </div>

  

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-5 border-t border-slate-50">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 whitespace-nowrap">
              <span className="w-2 h-8 bg-slate-300 rounded-full" />
              Task Status <span className="text-slate-300 font-bold text-xs tracking-widest uppercase ml-1">All-time</span>
            </h3>
            <div className="flex flex-wrap items-center gap-4 md:gap-8"
              onClick={() => navigate('/admin/tasks')}
            >
              {renderStatusItems(data?.task_status_breakdown_all_time)}
            </div>
          </div>

        </div>
  {/* ── Remark Summary ───────────────── */}
        <RemarkSummary onOpenTask={(taskId) => navigate('/admin/tasks', { state: { openTaskId: taskId } })} />
        {/* ── Calls Center ───────────────────────────────── */}
        <div className="space-y-6 ">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-2 h-8 bg-[#132ea7] rounded-full" />
            Calls Center
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center justify-between transition-all hover:shadow-2xl hover:-translate-y-1">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Calls</p>
                <p className="text-3xl font-black text-slate-800">{data?.calls_section?.total_calls ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <MdPhone size={24} />
              </div>
            </div> */}
            <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center justify-between transition-all hover:shadow-2xl hover:-translate-y-1">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Today's Calls</p>
                <p className="text-3xl font-black text-slate-800">{data?.calls_section?.today_count ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <MdPhone size={24} />
              </div>
            </div>
            <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center justify-between transition-all hover:shadow-2xl hover:-translate-y-1">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Task-Linked Calls</p>
                <p className="text-3xl font-black text-slate-800">{data?.calls_section?.task_call_count ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <MdPhone size={24} />
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1   md:grid-cols-2  gap-6">
            <div className="bg-white rounded-[2rem]  p-8 border border-slate-100 shadow-xl shadow-slate-200/30">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Today's Call List</h4>
              <div className="overflow-auto max-h-[450px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Caller</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Number</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.calls_section?.today_calls?.length > 0 ? data.calls_section.today_calls.map((c) => (
                      <tr key={c.id}>
                        <td className="py-4 text-xs font-bold text-slate-700">{c.caller_name || 'N/A'}</td>
                        <td className="py-4 text-xs font-bold text-slate-500">{c.phone_number || 'N/A'}</td>
                        <td className="py-4"><span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase">{c.call_type || 'N/A'}</span></td>
                        <td className="py-4 text-xs font-bold text-[#132ea7]">{c.caller?.name || 'N/A'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="py-6 text-center text-xs font-bold text-slate-400">No calls today</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white  rounded-[2rem]  p-8 border border-slate-100 shadow-xl shadow-slate-200/30">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Task-Linked Calls</h4>
              <div className="overflow-auto max-h-[350px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Caller</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.calls_section?.task_calls?.length > 0 ? data.calls_section.task_calls.slice(0, 10).map((c) => (
                      <tr key={c.id}>
                        <td className="py-4 text-xs font-bold text-slate-700">{c.caller_name || 'N/A'}</td>
                        <td className="py-4"><span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase">{c.call_type || 'N/A'}</span></td>
                        <td className="py-4 text-xs font-bold text-[#132ea7]">{c.caller?.name || 'N/A'}</td>
                        <td className="py-4 text-xs font-bold text-emerald-600">{c.project?.name || 'N/A'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="py-6 text-center text-xs font-bold text-slate-400">No task-linked calls</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* ── Tasks Center ───────────────────────────────── */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-2 h-8 bg-emerald-500 rounded-full" />
            Tasks Center
            <span className="text-slate-300 font-bold text-xs tracking-widest uppercase ml-1">
              {fromDate ? `From ${fromDate}` : "Today"}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                  {fromDate ? "Range Tasks" : "Today's Tasks"}
                </p>
                <p className="text-3xl font-black text-slate-800">{data?.tasks_section?.today_count ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <MdCheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/30">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
              {fromDate ? `Tasks (${fromDate} → Today)` : "Today's Tasks"}
            </h4>
            <div className="overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Display ID</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Task</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned To</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.tasks_section?.today_tasks?.length > 0
                    ? data.tasks_section.today_tasks.slice(0, 10).map((t) => (
                      <tr key={t.id}>
                        <td className="py-4 text-[10px] font-black text-[#132ea7] font-mono">{t.display_id || "—"}</td>
                        <td className="py-4 text-xs font-bold text-slate-700">{t.task}</td>
                        <td className="py-4"><Badge value={t.status} /></td>
                        <td className="py-4 text-xs font-bold text-[#132ea7]">{t.assignee?.name || "—"}</td>
                        <td className="py-4 text-xs font-bold text-emerald-600">{t.project?.name || "—"}</td>
                        <td className="py-4 text-xs font-bold text-slate-500">
                          {t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))
                    : <tr><td colSpan="6" className="py-6 text-center text-xs font-bold text-slate-400">No tasks</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── WorkLogs Center ────────────────────────────── */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-2 h-8 bg-amber-500 rounded-full" />
            Work Logs Center
            <span className="text-slate-300 font-bold text-xs tracking-widest uppercase ml-1">
              {fromDate ? `From ${fromDate}` : "Today"}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                  {fromDate ? "Range Logs" : "Today's Logs"}
                </p>
                <p className="text-3xl font-black text-slate-800">{data?.worklogs_section?.today_count ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <MdBook size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/30">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
              {fromDate ? `Work Logs (${fromDate} → Today)` : "Today's Work Logs"}
            </h4>
            <div className="overflow-auto max-h-[350px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.worklogs_section?.today_logs?.length > 0
                    ? data.worklogs_section.today_logs.slice(0, 10).map((l) => (
                      <tr key={l.id}>
                        <td className="py-4 text-xs font-bold text-[#132ea7]">{l.User?.name || "—"}</td>
                        <td className="py-4 text-xs font-bold text-slate-700 max-w-[300px] truncate">{l.description}</td>
                        <td className="py-4 text-xs font-bold text-slate-500">{l.date}</td>
                      </tr>
                    ))
                    : <tr><td colSpan="3" className="py-6 text-center text-xs font-bold text-slate-400">No work logs</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ──  Activity ─────────────────────── */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/40">
          {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-2.5 h-10 bg-[#132ea7] rounded-full" />
              Operational Activity <span className="text-slate-300 font-bold text-sm ml-2 tracking-widest uppercase">(Last 7 Days)</span>
            </h3>
            <div className="px-5 py-2 bg-[#132ea7]/5 rounded-full text-[11px] font-black text-[#132ea7] uppercase tracking-[0.2em] w-fit">
              Live Metrics
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Calls", value: data?.last_7_days?.calls, color: "text-[#132ea7]", border: "border-slate-100", bg: "bg-slate-50/50" },
              { label: "Tasks", value: data?.last_7_days?.tasks, color: "text-emerald-600", border: "border-slate-100", bg: "bg-slate-50/50" },
              { label: "Logs", value: data?.last_7_days?.work_logs, color: "text-amber-600", border: "border-slate-100", bg: "bg-slate-50/50" },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} border ${item.border} rounded-[2rem] p-8 transition-all hover:shadow-lg hover:-translate-y-1`}>
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-3 text-center">{item.label}</p>
                <p className={`text-4xl font-black text-center ${item.color}`}>{item.value ?? 0}</p>
              </div>
            ))}
          </div> */}

          <div className=" border-t border-slate-50">
            <Export />
          </div>
        </div>
      </div>

      {/* ── Employee activity table ────────────────────── */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-2xl font-black text-slate-800">Employee Daily Records</h3>
          {/* <button className="text-[#132ea7] text-sm font-black uppercase tracking-widest hover:underline">Full Analytics</button> */}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Employee Identity</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Designation</th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Calls</th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Tasks</th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.employee_breakdown?.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#132ea7]/20">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-lg leading-tight">{emp.name}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.employee_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                      {emp.role || "MEMBER"}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-base font-black text-[#132ea7] bg-[#132ea7]/5 px-4 py-2 rounded-xl border border-[#132ea7]/10">{emp.calls}</span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-base font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">{emp.tasks}</span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-base font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">{emp.work_logs}</span>
                  </td>
                  {/* <td className="px-10 py-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"
              style={{ width: `${Math.min(((emp.calls + emp.tasks + emp.work_logs) / 15) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tier One Status</span>
        </div>
      </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;