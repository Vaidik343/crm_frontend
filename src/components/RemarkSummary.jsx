// components/dashboard/RemarkSummary.jsx
import { useEffect, useState } from "react";

import Badge from "../components/ui/Badge"
import api from "../api/axiosInstance";

const STATUS_CONFIG = {
  open:    { color: 'text-[#132ea7]', dot: 'bg-[#132ea7]',   label: 'Open' },
  ongoing: { color: 'text-slate-500', dot: 'bg-slate-400',   label: 'Ongoing' },
  hold:    { color: 'text-amber-500', dot: 'bg-amber-400',   label: 'Hold' },
  closed:  { color: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Closed' },
};

export default function RemarkSummary({ onOpenTask }) {
  const [summary, setSummary]     = useState(null);
  const [expanded, setExpanded]   = useState(null); // which status is open
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get("/tasks/remark-summary")
      .then(r => setSummary(r.data.summary))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (status) =>
    setExpanded(prev => (prev === status ? null : status));

  return (
    <div className="bg-white rounded-[2rem] p-6 px-10 border border-slate-100 shadow-xl shadow-slate-200/30 space-y-4">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 whitespace-nowrap">
          <span className="w-2 h-8 bg-[#132ea7] rounded-full" />
          Today's Summary
          <span className="text-slate-300 font-bold text-xs tracking-widest uppercase ml-1">Today</span>
        </h3>

        {loading ? (
          <span className="text-xs text-slate-400 font-bold animate-pulse">Loading...</span>
        ) : (
          <div className="flex flex-wrap items-center gap-4 md:gap-8">
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
              const count = summary?.[status]?.count ?? 0;
              const isOpen = expanded === status;
              return (
                <button
                  key={status}
                  onClick={() => count > 0 && toggle(status)}
                  className={`flex items-center gap-3 transition-all rounded-xl px-2 py-1
                    ${count > 0 ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default opacity-50'}
                    ${isOpen ? 'bg-slate-100 ring-1 ring-slate-200' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-black capitalize tracking-widest text-slate-400">
                    {cfg.label}
                  </span>
                  <span className={`text-xl font-black ${cfg.color}`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Expanded task list */}
      {expanded && summary?.[expanded]?.tasks?.length > 0 && (
        <div className="border-t border-slate-100 pt-4 animate-in fade-in duration-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            {STATUS_CONFIG[expanded].label} — Tasks with Remarks Today
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            {summary[expanded].tasks.map(task => (
              <div
                key={task.id}
                onClick={() => onOpenTask(task.id)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 
                           cursor-pointer border border-transparent hover:border-slate-100 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-black text-[#132ea7] font-mono whitespace-nowrap">
                    {task.display_id}
                  </span>
                  <span className="text-xs font-bold text-slate-700 truncate">{task.task}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-[10px] font-bold text-slate-400">
                    {task.assignee?.name}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                    {task.remark_count} remark{task.remark_count !== 1 ? 's' : ''}
                  </span>
                  {task.last_remark && (
                    <span className="text-[10px] text-slate-400 italic max-w-[160px] truncate hidden md:block">
                      "{task.last_remark}"
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}