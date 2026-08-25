import { useEffect, useState } from "react";
import { useWorkLog } from "../../context/WorkLogContext";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { MdBook, MdVisibility, MdCalendarToday, MdPerson, MdAccessTime, MdOutlineSpeakerNotes, MdSearch } from "react-icons/md";
import SearchInput from "../../components/ui/SearchInput";
import { useProject } from "../../context/ProjectContext";
import Pagination from "../../components/ui/Pagination";

const AdminWorkLogs = () => {
  const { workLogs = [], loading, page, limit,
      totalPages,
      setPage, getAllWorkLogs } = useWorkLog();
  
  const [viewTarget, setViewTarget] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  
    const [remarksTarget, setRemarksTarget] = useState(null);
  const [remarkText, setRemarkText]       = useState("");
  const [remarkSubmitting, setRemarkSubmitting] = useState(false);
  const [showNewRemark, setShowNewRemark] = useState(false);

const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");
const today = new Date().toISOString().split("T")[0];
  

const [search, setSearch] = useState("");
  const { projects, getAllProjects } = useProject();

// const search = filter.toLowerCase().trim();


useEffect(() => {
  const debounce = setTimeout(() => {
    getAllWorkLogs(search ? 1 : page, dateFrom, dateTo, search);
  }, 300);
  return () => clearTimeout(debounce);
}, [page, dateFrom, dateTo, search]);

useEffect(() => {
  if (search && page !== 1) setPage(1);
}, [search]);

useEffect(() => {
  getAllProjects?.();
}, []);

  // filter by employee name

  const filtered = workLogs || [];

//  const filtered = filter.trim()
//   ? (workLogs || []).filter((w) =>
//       w.User?.name?.toLowerCase().includes(filter.toLowerCase()) ||
//       w.User?.employee_id?.toLowerCase().includes(filter.toLowerCase())
//     )
//   : (workLogs || []);

  // if (loading && !workLogs.length) return (
  //   <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
  //     <Spinner size="lg" />
  //     <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Accessing historical archives...</p>
  //   </div>
  // );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            Work <span className="text-[#132ea7]">Logs</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Comprehensive stream of agent daily activity and mission status updates ({workLogs.length} total)</p>
        </div>
        

 <div className="flex flex-wrap items-center gap-3">
         {/* Date range filter */}
    <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm">

      
        
      <label className="text-xs font-black text-slate-400 uppercase">From</label>
      <input type="date" value={dateFrom} max={today} onChange={(e) => setDateFrom(e.target.value)}
        className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold" />

      <label className="text-xs font-black text-slate-400 uppercase">To</label>
      <input type="date" value={dateTo} max={today} onChange={(e) => setDateTo(e.target.value)}
        className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold" />
        
      {(dateFrom || dateTo) && (
        <button
          onClick={() => { setDateFrom(""); setDateTo(""); }}
          className="text-[10px] font-black text-[#132ea7] uppercase tracking-widest hover:underline whitespace-nowrap"
        >
          Show All
        </button>
      )}
    </div>

      
       
          <SearchInput 
    value={search}
  onChange={setSearch}
placeholder="Search  Projects and Employee "
  />
       
        {/* <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <MdSearch size={20} />
          </div>
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 focus:border-[#132ea7] transition-all shadow-sm"
            placeholder="Search by Employee identity..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div> */}

</div>
      </div>

      <Alert type="danger" message={error} onClose={() => setError("")} />

      {/* Desktop Table Container */}
      <div className="hidden md:block bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Employee Identity</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
  Display ID
</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Operational Date</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Work Briefing</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Projects</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">No operational logs found in current archive.</td>
                </tr>
              )}
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#132ea7]/20 transition-all group-hover:scale-110">
                        {log.user?.name?.charAt(0) || <MdPerson size={20} />}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-lg leading-tight">{log.user?.name || "—"}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{log.user?.employee_id || "Unknown ID"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#132ea7] flex items-center justify-center shadow-inner">
                          <MdCalendarToday size={18} />
                       </div>
                       <span className="text-sm font-black text-slate-700 uppercase tracking-wider">{new Date(log.date).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
  <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[11px] font-black uppercase tracking-widest font-mono">
    {log.display_id || "—"}
  </span>
</td>

                  <td className="px-8 py-6">
                    <p className="text-sm font-bold  truncate max-w-[400px]">
                      {log.description}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold  uppercase tracking-widest mt-0.5">
   {log.Project?.name || "No Project Assigned"}
</p>
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

        {/* Pagination */}
     {totalPages > 1 && 
            
            (
 <div className="px-6 py-6 border-t border-slate-100">
    <Pagination
      page={page}
      totalPages={totalPages}
      onPageChange={(p) => setPage(p)}
    />
  </div>
            )}
            
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No operational logs found.</div>
        ) : (
          filtered.map((log) => (
            <div key={log.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center font-black shrink-0">
                  {log.user?.name?.charAt(0) || <MdPerson size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 leading-tight">{log.user?.name || "—"}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.user?.employee_id || "Unknown ID"}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Date</span>
                  <div className="flex items-center gap-1.5">
                    <MdCalendarToday className="text-slate-300" size={13} />
                    <span className="font-bold text-slate-700 text-xs">{new Date(log.date).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">Work</span>
                  <p className="text-xs font-bold  text-right truncate max-w-[220px]">{log.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setViewTarget(log)}
                  className="w-full h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
                >
                  <MdVisibility size={16} /> View Full Log
                </button>
              </div>
            </div>
          ))
        )}
        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">Prev</button>
            <span className="text-sm font-bold text-slate-500">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">Next</button>
          </div>
        )}
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

export default AdminWorkLogs;