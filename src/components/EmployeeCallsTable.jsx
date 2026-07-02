import { useState } from 'react';

import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import Modal from './ui/Modal';
import Button from './ui/Button';

import {
  MdEdit,
  MdDelete,
  MdSearch,
  MdComment,
  MdAssignment,
  MdVisibility,
  MdTransferWithinAStation,
  MdPhone,
  MdFolder,
  MdCalendarToday,
  MdInfoOutline,
  MdAdd,
  MdClose,
  MdArrowBack   
} from "react-icons/md";

const EmployeeCallsTable = ({ rows = [], loading }) => {

  
     const [viewTarget, setViewTarget] = useState(null);
    
       const [viewHistory, setViewHistory] = useState([]);

         const [showModal, setShowModal] = useState(false);

         const [editTarget, setEditTarget] = useState(null);
      
           const [showNewRemark, setShowNewRemark] = useState(false);

  
      const closeModal = () => {
      setShowModal(false);
      setEditTarget(null);
      setForm(initialForm);
      setFieldErrors({});
          // getAllClients?.()
      setShowNewRemark(false);
    };
  
    
    const closeViewModal = () => {
    setViewTarget(null);
    setViewHistory([]);
  };
  return (
    <div className=" bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
      
      {/* Desktop */}
       <div className="hidden md:block overflow-x-auto custom-scrollbar">
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

                      {/* Actions */}
                                    <td className="px-10 py-6 text-right">
                                      <div className="flex items-center justify-end gap-3">
                                        <button
                                          onClick={() => setViewTarget(call)}
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

      
            {/* View Modal */}
            <Modal
              show={!!viewTarget}
               onClose={closeViewModal} 
              title="Call Details"
              size="lg"
            >
              
              {viewTarget && (
                <div className="space-y-6 py-2">
                  {/* Header */}
      
                  {/* Back button — only shows when navigated from follow-up */}
          {viewHistory.length > 0 && (
            <button
              onClick={() => {
                setViewTarget(viewHistory[viewHistory.length - 1]);
                setViewHistory(prev => prev.slice(0, -1));
              }}
              className="flex items-center gap-1 text-xs font-black text-slate-400 hover:text-[#132ea7] uppercase tracking-widest transition-colors mb-2"
            >
              <MdArrowBack size={14} /> Back to Follow-Back call
            </button>
          )}
      
                  <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                    <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-[#132ea7]/20 shrink-0">
                      {viewTarget.caller_name?.charAt(0) || <MdPhone size={24} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-black text-slate-800">
                          {viewTarget.caller_name}
                        </h3>
                        <Badge value={viewTarget.call_type} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
                        {viewTarget.display_id || "No display ID"}
                      </p>
                      {viewTarget.caller_number && (
                        <p className="text-xs font-bold text-slate-400 mt-1">
                          {viewTarget.caller_number}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="text-xs font-black text-slate-400 uppercase">
                        Logged By
                      </label>
                      <Badge
                        value={
                          viewTarget.caller?.name || viewTarget.User?.name || "—"
                        }
                      />
                    </div>
                  </div>
      
                  {/* Info grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: "Subtype", value: viewTarget.call_subtype || "—" },
                      { label: "Medium", value: viewTarget.receive_type || "—" },
                      {
                        label: "Project",
                        value:
                          viewTarget.project?.name || viewTarget.Project?.name || "—",
                      },
                      // { label: "Logged By",  value: viewTarget.caller?.name || viewTarget.User?.name || "—" },
                      {
                        label: "Date",
                        value: new Date(viewTarget.createdAt).toLocaleDateString(),
                      },
                      {
                        label: "Has Call Transfer",
                        value: viewTarget.transfer_to ? "Yes" : "No",
                      },
                      { label: "Has Task", value: viewTarget.is_task ? "Yes" : "No" },
                      {
                        label: "Has Task Assigned",
                        value: viewTarget.task_assigned_to ? "Yes" : "No",
                      },
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          {item.label}
                        </p>
                        <p className="font-black text-slate-700 text-sm">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
      
                  {/* Transfer info */}
                  {viewTarget.transfer_to && (
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                      <MdTransferWithinAStation
                        size={20}
                        className="text-orange-500 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-black text-orange-600 uppercase tracking-widest">
                          Call Transferred
                        </p>
                        <p className="text-sm font-bold text-orange-700 mt-0.5">
                          {users.find((u) => u.id === viewTarget.transfer_to)?.name ||
                            viewTarget.transfer_to}
                        </p>
                      </div>
                    </div>
                  )}
      
                  {/* Task assign info */}
                  {viewTarget.task_assigned_to && (
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                      <MdTransferWithinAStation
                        size={20}
                        className="text-blue-500 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest">
                          Task Assigned To
                        </p>
                        <p className="text-sm font-bold text-blue-700 mt-0.5">
                          {users.find((u) => u.id === viewTarget.task_assigned_to)
                            ?.name || viewTarget.task_assigned_to}
                        </p>
                      </div>
                    </div>
                  )}
      
                  {/* Follow-up info */}
                  {/* {viewTarget.follow_up_date && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                      <MdCalendarToday size={20} className="text-purple-500 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-purple-600 uppercase tracking-widest">Follow-up Scheduled</p>
                        <p className="text-sm font-bold text-purple-700 mt-0.5">
                          {new Date(viewTarget.follow_up_date).toLocaleString("default", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  )} */}
      
                  {/* Parent call */}
        {viewTarget.parent_call_id && (
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <MdPhone size={18} className="text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Follow-Back for original call
            </p>
            {(() => {
              const parent = calls.find((c) => c.id === viewTarget.parent_call_id);
              return parent ? (
                <button
                  onClick={() => {
                    setViewHistory(prev => [...prev, viewTarget]);
                    setViewTarget(parent);
                  }}
                  className="text-xs font-black text-[#132ea7] mt-0.5 hover:underline cursor-pointer flex items-center gap-1"
                >
                  [{parent.display_id}] {parent.caller_name} — {parent.call_subtype}
                  <MdVisibility size={12} />
                </button>
              ) : (
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  {viewTarget.parent_call_id}
                </p>
              );
            })()}
          </div>
        </div>
      )}
      
                  {/* Summary */}
                  {viewTarget.call_summary && (
                    <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <MdInfoOutline size={14} /> Summary
                      </p>
                      <p className="font-medium leading-relaxed opacity-90 italic">
                        "{viewTarget.call_summary}"
                      </p>
                    </div>
                  )}
      
                  {viewTarget.attendees && Array.isArray(viewTarget.attendees) && viewTarget.attendees.length > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <MdAssignment size={20} className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest">
                          Attendees
                        </p>
                        <p className="text-sm font-bold text-blue-700 mt-1">
                          {viewTarget.attendees
                            .map((id) => users.find((u) => u.id === id)?.name || id)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
      
                  {/* Remarks log */}
                  {viewTarget.remarks &&
                    Array.isArray(viewTarget.remarks) &&
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
      
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setViewTarget(null)}
                      className="font-black uppercase tracking-widest text-xs"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </Modal>
    </div>
  );
};

export default EmployeeCallsTable;