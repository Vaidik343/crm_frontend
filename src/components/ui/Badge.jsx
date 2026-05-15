import React from 'react';

const colorMap = {
  // Task Statuses
  pending: "bg-slate-100 text-slate-500 border border-slate-200",
  "in-progress": "bg-blue-50 text-blue-600 border border-blue-100",
  completed: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  cancelled: "bg-red-50 text-red-600 border border-red-100",

  // Call Types
  inbound: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  outbound: "bg-purple-50 text-purple-600 border border-purple-100",

  // Generic / Old
  open: "bg-orange-50 text-orange-600 border border-orange-100",
  ongoing: "bg-amber-50 text-amber-600 border border-amber-100",
  closed: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  active: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  inactive: "bg-slate-100 text-slate-500 border border-slate-200",
  danger: "bg-red-50 text-red-600 border border-red-100",
  secondary: "bg-slate-100 text-slate-500 border border-slate-200",
  primary: "bg-[#132ea7]/5 text-[#132ea7] border border-[#132ea7]/10",
  admin: "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20",
  employee: "bg-slate-100 text-slate-600 border border-slate-200",
};

const Badge = ({ value, overrideColor }) => {
  const style = colorMap[overrideColor] || colorMap[value?.toLowerCase()] || colorMap.secondary;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${style}`}>
      {value}
    </span>
  );
};

export const DueDateBadge = ({ dueDate }) => {
  if (!dueDate) return <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">No due date</span>;

  const now = new Date();
  const due = new Date(dueDate);

  // Set to end of the day for fairer comparison
  due.setHours(23, 59, 59, 999);

  const diffMs = due - now;
  const diffHrs = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) {
    return <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-500/20">Overdue</span>;
  }

  if (diffHrs <= 48) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest bg-orange-500 text-white shadow-lg shadow-orange-500/20 animate-pulse">
        Due in {Math.ceil(diffHrs)}h
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200">
      {due.toLocaleDateString()}
    </span>
  );
};

export default Badge;