import { useState } from 'react';
import Badge, { DueDateBadge } from './ui/Badge';

import {
    MdAdd,
    MdAssignment,
    MdEdit,
    MdDelete,
    MdFolder,
    MdPerson,
    MdVisibility,
    MdSearch ,
    MdClose,
    MdPhone
  } from "react-icons/md";
import Modal from './ui/Modal';
import Button from './ui/Button';



const EmployeeTasksTable = ({ rows = [], loading }) => {

  
   const [viewTarget, setViewTarget] = useState(null);
  
     const [viewHistory, setViewHistory] = useState([]);

       const [showModal, setShowModal] = useState(false);
         const [editTarget, setEditTarget] = useState(null);
;

         
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedCall, setSelectedCall] = useState(null);

    const closeModal = () => {
  setShowModal(false);
  setEditTarget(null);
  setForm(initialForm);
  setFieldErrors({});
  setSelectedProject(null);
  setSelectedCall(null);
};
  
//   const closeViewModal = () => {
//   setViewTarget(null);
//   setViewHistory([]);
// };

  return (
    <div className="hidden md:block bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
      {/* Desktop */}
      <div className="overflow-x-auto custom-scrollbar">
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
                  <DueDateBadge dueDate={task.due_date} status={task.status} completedAt={task.completedAt} />
                </td>

                
                                    {/* Actions */}
                                    <td className="px-10 py-6 text-right">
                                      <div className="flex items-center justify-end gap-3">
                                        <button
                                          onClick={() => setViewTarget(task)}
                                          title="View"
                                          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all"
                                        >
                                          <MdVisibility size={20} />
                                        </button>
                                       
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
                <DueDateBadge dueDate={task.due_date} status={task.status} completedAt={task.completedAt} />
              </div>
            </div>
          </div>
        ))}
      </div>

       {/* ── View Modal ───────────────────────────────────────────── */}
        <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Task Details" size="lg">
          {viewTarget && (
            <div className="space-y-6 py-2">

              {/* Header */}
              <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center shrink-0 shadow-xl shadow-[#132ea7]/20">
                  <MdAssignment size={26} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-black text-slate-800">{viewTarget.task}</h3>
                    <Badge value={viewTarget.status} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
                    {viewTarget.display_id || "No display ID"}
                  </p>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Assigned To", value: viewTarget.assignee?.name || "—" },
                  { label: "Assigned By", value: viewTarget.assigner?.name || "—" },
                  { label: "Project", value: viewTarget.project?.name || "—" },
                  { label: "Due Date", value: viewTarget.due_date ? new Date(viewTarget.due_date).toLocaleDateString() : "—" },
                  { label: "Start Date", value: viewTarget.start_date ? new Date(viewTarget.start_date).toLocaleDateString() : "—" },
                  
                  {
                  label: "Update Date",
                  value: viewTarget.start_date
                    ? new Date(viewTarget.updatedAt).toLocaleDateString()
                    : "—",
                },
                { label: "Completed",      value: viewTarget.completedAt ? new Date(viewTarget.completedAt).toLocaleDateString()
                    : "—", },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-black text-slate-700 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {viewTarget.description && (
                <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Description</p>
                  <p className="font-medium leading-relaxed opacity-90">{viewTarget.description}</p>
                </div>
              )}

            {/* Remarks log */}
              {viewTarget.remarks && Array.isArray(viewTarget.remarks) && viewTarget.remarks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Remarks ({viewTarget.remarks.length})
                  </p>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                    {[...viewTarget.remarks].reverse().map((r, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm font-bold text-slate-700">{r.text}</p>
                        <div className="flex justify-between mt-1.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase">{r.added_by_name}</p>
                          <p className="text-[10px] font-bold text-slate-300">
                            {new Date(r.created_at).toLocaleString("default", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="ghost" onClick={() => setViewTarget(null)} className="font-black uppercase tracking-widest text-xs">Close</Button>
              </div>
            </div>
          )}
        </Modal>
    </div>
  );
};

export default EmployeeTasksTable;