import { MdCalendarToday, MdFolder, MdPerson } from "react-icons/md";

const EmployeeWorkLogsTable = ({ rows = [], loading }) => {
  return (
    <div>
      {/* Desktop */}
      <div className="hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {["Date", "Work Briefing", "Project"].map(h => (
                <th key={h} className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#132ea7]/20 border-t-[#132ea7] rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Loading logs...</p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">
                  No work logs found.
                </td>
              </tr>
            ) : rows.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-[#132ea7] flex items-center justify-center shadow-inner">
                      <MdCalendarToday size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-700 uppercase tracking-wider">
                      {new Date(log.date).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-700 truncate max-w-[400px]">{log.description}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <MdFolder className="text-slate-300" size={16} />
                    {log.Project?.name || log.Project?.name || "—"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-4 p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-10 h-10 border-4 border-[#132ea7]/20 border-t-[#132ea7] rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No work logs found.</div>
        ) : rows.map((log) => (
          <div key={log.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-[#132ea7] flex items-center justify-center shadow-inner shrink-0">
                <MdCalendarToday size={16} />
              </div>
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider">
                {new Date(log.date).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">Work</span>
                <p className="text-xs font-bold text-right truncate max-w-[220px]">{log.description}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Project</span>
                <div className="flex items-center gap-1.5">
                  <MdFolder className="text-slate-300" size={14} />
                  <span className="font-bold text-slate-700 text-xs">{log.Project?.name || log.Project?.name || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeWorkLogsTable;