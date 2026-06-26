import Badge, { DueDateBadge } from './ui/Badge';
import { MdAssignment, MdFolder } from "react-icons/md";

const EmployeeTasksTable = ({ rows = [], loading }) => {
  return (
    <div>
      {/* Desktop */}
      <div className="hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {["Display ID", "Task", "Status", "Assigned By", "Assigned To", "Project", "Due Date"].map(h => (
                <th key={h} className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#132ea7]/20 border-t-[#132ea7] rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Loading tasks...</p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">
                  No tasks found.
                </td>
              </tr>
            ) : rows.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[11px] font-black uppercase tracking-widest font-mono">
                    {task.display_id || "—"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#132ea7] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#132ea7]/10">
                      <MdAssignment size={16} />
                    </div>
                    <div>
                      <div className="font-black text-slate-800 truncate max-w-[200px] leading-tight">{task.task}</div>
                      {task.description && (
                        <div className="text-xs font-bold text-slate-400 mt-0.5 truncate max-w-[200px] italic">{task.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5"><Badge value={task.status} /></td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px]">
                      {task.assigner?.name?.charAt(0) || "?"}
                    </div>
                    <span className="text-sm font-black text-slate-700">{task.assigner?.name || "—"}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px]">
                      {task.assignee?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-600">{task.assignee?.name || "—"}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{task.assignee?.employee_id || ""}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <MdFolder className="text-slate-300" size={16} />
                    {task.project?.name || "—"}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <DueDateBadge dueDate={task.due_date} status={task.status} completedAt={task.completed_at} />
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
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No tasks found.</div>
        ) : rows.map((task) => (
          <div key={task.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center shrink-0">
                  <MdAssignment size={18} />
                </div>
                <div>
                  <p className="font-black text-slate-800 leading-tight">{task.task}</p>
                  <p className="text-[10px] font-black text-slate-400 font-mono mt-0.5">{task.display_id}</p>
                </div>
              </div>
              <Badge value={task.status} />
            </div>
            {task.description && (
              <p className="text-xs text-slate-400 italic px-1 truncate">{task.description}</p>
            )}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Assigned By</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[9px]">{task.assigner?.name?.charAt(0) || "?"}</div>
                  <span className="font-bold text-slate-700 text-xs">{task.assigner?.name || "—"}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Assigned To</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[9px]">{task.assignee?.name?.charAt(0) || "?"}</div>
                  <span className="font-bold text-slate-700 text-xs">{task.assignee?.name || "—"}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Project</span>
                <div className="flex items-center gap-1.5">
                  <MdFolder className="text-slate-300" size={14} />
                  <span className="font-bold text-slate-700 text-xs">{task.project?.name || "—"}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Due</span>
                <DueDateBadge dueDate={task.due_date} status={task.status} completedAt={task.completed_at} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTasksTable;