import React from 'react';

const StatCard = ({ label, value, icon, color = "primary", description }) => {
  const colorMap = {
    primary: "border-l-[#e98937]",
    secondary: "border-l-[#0d6efd]",
    success: "border-l-emerald-500",
    info: "border-l-sky-500",
    warning: "border-l-amber-500",
  };

  const iconBgMap = {
    primary: "bg-[#e98937]/10 text-[#e98937]",
    secondary: "bg-[#0d6efd]/10 text-[#0d6efd]",
    success: "bg-emerald-500/10 text-emerald-500",
    info: "bg-sky-500/10 text-sky-500",
    warning: "bg-amber-500/10 text-amber-500",
  };

  const textHoverMap = {
    primary: "group-hover:text-[#e98937]",
    secondary: "group-hover:text-[#0d6efd]",
    success: "group-hover:text-emerald-500",
    info: "group-hover:text-sky-500",
    warning: "group-hover:text-amber-500",
  };

  return (
    <div className={`relative overflow-hidden group bg-white border border-slate-100 border-l-4 ${colorMap[color] || colorMap.primary} shadow-xl shadow-slate-200/50 rounded-[1.5rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
          <h3 className={`text-3xl font-black transition-colors ${textHoverMap[color] || textHoverMap.primary} text-slate-800`}>
            {value ?? 0}
          </h3>
          {description && (
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
               {description}
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconBgMap[color] || iconBgMap.primary}`}>
          {icon}
        </div>
      </div>
      
      {/* Subtle abstract background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50" />
    </div>
  );
};

export default StatCard;
