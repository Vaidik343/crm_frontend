import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import {
  MdPhone, MdFolder, MdCalendarToday,
  MdAssignment, MdTransferWithinAStation
} from "react-icons/md";

const EmployeeCallsTable = ({ rows = [], loading }) => {
  return (
    <div>
      {/* Desktop */}
      <div className="hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {["Display ID", "Caller Info", "Project", "Type", "Medium", "Date"].map(h => (
                <th key={h} className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#132ea7]/20 border-t-[#132ea7] rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
                      Accessing comms archives...
                    </p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">
                  No communication logs found.
                </td>
              </tr>
            ) : rows.map((call) => (
              <tr key={call.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[11px] font-black uppercase tracking-widest font-mono">
                    {call.display_id || "—"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center font-black shadow-lg shadow-[#132ea7]/10 shrink-0">
                      {call.caller_name?.charAt(0) || <MdPhone size={18} />}
                    </div>
                    <div>
                      <div className="font-black text-slate-800 leading-tight">{call.caller_name}</div>
                      {call.caller_number && (
                        <div className="text-xs font-bold text-slate-400 mt-0.5">{call.caller_number}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <MdFolder className="text-slate-300" size={16} />
                    {call.project?.name || call.Project?.name || "—"}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5">
                    <Badge value={call.call_type} />
                    <div className="flex gap-1.5 flex-wrap">
                      {call.is_task && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                          <MdAssignment size={12} /> Task
                        </span>
                      )}
                      {call.transfer_to && (
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                          <MdTransferWithinAStation size={12} /> Transfer
                        </span>
                      )}
                      {call.parent_call_id && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[10px] font-black uppercase">
                          Follow-up
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5"><Badge value={call.receive_type} /></td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                    <MdCalendarToday className="text-slate-300" size={16} />
                    {new Date(call.createdAt).toLocaleDateString("default", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
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
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-4 border border-slate-100">
            <div className="w-10 h-10 border-4 border-[#132ea7]/20 border-t-[#132ea7] rounded-full animate-spin" />
            <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Loading...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
            No communication logs found.
          </div>
        ) : rows.map((call) => (
          <div key={call.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center font-black shrink-0">
                {call.caller_name?.charAt(0) || <MdPhone size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800 leading-tight truncate">{call.caller_name}</p>
                {call.caller_number && <p className="text-xs font-bold text-slate-400">{call.caller_number}</p>}
              </div>
              <span className="shrink-0 px-2 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[10px] font-black uppercase font-mono">
                {call.display_id || "—"}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Project</span>
                <div className="flex items-center gap-1.5">
                  <MdFolder className="text-slate-300" size={14} />
                  <span className="font-bold text-slate-700 text-xs">{call.project?.name || call.Project?.name || "—"}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Type</span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <Badge value={call.call_type} />
                  {call.is_task && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                      <MdAssignment size={10} /> Task
                    </span>
                  )}
                  {call.transfer_to && (
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                      <MdTransferWithinAStation size={10} /> Transfer
                    </span>
                  )}
                  {call.parent_call_id && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[10px] font-black uppercase">Follow-up</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Medium</span>
                <Badge value={call.receive_type} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Date</span>
                <div className="flex items-center gap-1.5">
                  <MdCalendarToday className="text-slate-300" size={13} />
                  <span className="font-bold text-slate-700 text-xs">
                    {new Date(call.createdAt).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeCallsTable;