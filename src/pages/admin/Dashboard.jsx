import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import { MdPeople, MdPhone, MdCheckCircle, MdBook ,MdGroups } from "react-icons/md";
import Export from "./Export";

import StatCard from "../../components/ui/StatCard";

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data: res } = await api.get(ENDPOINTS.DASHBOARD.ALL);
        setData(res);
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
      <p className="text-slate-400 font-medium animate-pulse">Loading intelligence...</p>
    </div>
  );

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
        <div className="flex items-center gap-4 bg-white p-3 px-5 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
             <MdCheckCircle size={24} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">System Status</p>
            <p className="text-base font-black text-emerald-600 uppercase tracking-widest">Active & Secure</p>
          </div>
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
        />

        <StatCard
  label="Total Teams"
  value={data?.totals?.teams}
  icon={<MdGroups size={28} />}
  color="success"
  description="Active Teams"
/>
        <StatCard 
          label="Total Calls" 
          value={data?.totals?.calls} 
          icon={<MdPhone size={28} />} 
          color="info"
          description="Calls & Meetings"
        />
        <StatCard 
          label="Total Task" 
          value={data?.totals?.tasks} 
          icon={<MdCheckCircle size={28} />} 
          color="primary"
          description="Assigned"
        />
        <StatCard 
          label="Work Archives" 
          value={data?.totals?.work_logs} 
          icon={<MdBook size={28} />} 
          color="warning"
          description="Daily Submissions"
        />
      </div>

      {/* ── Activity & Status ────────────────────────── */}
      <div className="space-y-8">
        {/* ── Task Breakdown (Simplified) ───────────────── */}
        <div className="bg-white rounded-[2rem] p-6 px-10 border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 whitespace-nowrap">
            <span className="w-2 h-8 bg-[#132ea7] rounded-full" />
            Task Status <span className="text-slate-300 font-bold text-xs tracking-widest uppercase ml-1">Real-time</span>
          </h3>
          <div className="flex flex-wrap items-center gap-4 md:gap-8">
            {Object.entries(data?.task_status_breakdown || {}).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#132ea7]" />
                <span className="text-xs font-black capitalize tracking-widest text-slate-400">{status}</span>
                <span className="text-xl font-black text-[#132ea7]">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Last 7 days Activity ─────────────────────── */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
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
          </div>
          
          <div className="mt-10 pt-10 border-t border-slate-50">
            <Export />
          </div>
        </div>
      </div>

      {/* ── Employee activity table ────────────────────── */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-2xl font-black text-slate-800">Employee Performance Board</h3>
          <button className="text-[#132ea7] text-sm font-black uppercase tracking-widest hover:underline">Full Analytics</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Employee Identity</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Designation</th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Logs</th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Missions</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Efficiency</th>
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
                  <td className="px-10 py-6">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" 
                            style={{ width: `${Math.min(((emp.calls + emp.tasks) / 10) * 100, 100)}%` }} 
                          />
                       </div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tier One Status</span>
                    </div>
                  </td>
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