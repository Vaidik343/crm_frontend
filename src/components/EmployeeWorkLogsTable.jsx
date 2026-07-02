import { useState } from 'react';

import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import Modal from './ui/Modal';
import Button from './ui/Button';


import { MdBook, MdVisibility, MdCalendarToday,MdFolder , MdPerson, MdAccessTime, MdOutlineSpeakerNotes, MdSearch } from "react-icons/md";

const EmployeeWorkLogsTable = ({ rows = [], loading }) => {

   
     const [viewTarget, setViewTarget] = useState(null);
    
       const [viewHistory, setViewHistory] = useState([]);
       
  return (
   <div className=" bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
      {/* Desktop */}
   <div className="overflow-x-auto custom-scrollbar">
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

                <td className="px-10 py-6 text-right">
                    <button
                      className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all shadow-sm"
                      onClick={() => setViewTarget(log)}
                      title="View Full Log"
                    >
                      <MdVisibility size={22} />
                    </button>
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
          {/* Log Detail Modal */}
      <Modal
        show={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Operational Report Details"
        size="lg"
      >
        {viewTarget && (
          <div className="space-y-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-50">
               <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-[2rem] bg-[#132ea7] text-white flex items-center justify-center font-black text-3xl shadow-2xl shadow-[#132ea7]/20">
                     {viewTarget.user?.name?.charAt(0) || <MdPerson size={32} />}
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-800 leading-tight">{viewTarget.user?.name || "—"}</h3>
                      <p className="text-sm font-bold text-[#132ea7] uppercase tracking-widest mt-0.5">
   {viewTarget.Project?.name || "No Project Assigned"}
</p>
                     <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-1">Employee Identification: {viewTarget.user?.employee_id || "N/A"}</p>
                  </div>
               </div>

               
               <div className="flex items-center gap-4 bg-slate-50 p-4 px-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                  <MdAccessTime size={24} className="text-[#132ea7]" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Operational Date</p>
                    <p className="text-base font-black text-slate-800 uppercase tracking-widest">{new Date(viewTarget.date).toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-[#132ea7] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <MdOutlineSpeakerNotes size={20} className="text-white/30" /> Mission Activity Briefing
                 </p>
                 <p className="text-xl font-medium leading-relaxed opacity-95 italic whitespace-pre-wrap">
                    "{viewTarget.description}"
                 </p>
               </div>
            </div>


            {viewTarget.remarks &&
              Array.isArray(viewTarget?.remarks) &&
              viewTarget.remarks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Remarks ({viewTarget.remarks.length})
                  </p>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                    {[...viewTarget.remarks].reverse().map((r, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <p className="text-sm font-bold text-slate-700">
                          {r.text}
                        </p>
                        <div className="flex justify-between mt-1.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase">
                            {r.added_by_name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-300">
                            {new Date(r.created_at).toLocaleString("default", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex items-center justify-end pt-4">
               <Button variant="ghost" onClick={() => setViewTarget(null)} className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Close </Button>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeWorkLogsTable;