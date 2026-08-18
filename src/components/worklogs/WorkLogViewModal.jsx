// ── Work Log View Modal Component ─────────────────────────────────────────────
const WorkLogViewModal = ({ workLog, onClose }) => {
  if (!workLog) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col border border-slate-100 overflow-hidden transition-all">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-slate-800">
              Work Log Detail
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged on {formatDate(workLog.createdAt || workLog.date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          
          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Log Date
              </p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">
                {workLog.date ? formatDate(workLog.date) : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Hours Worked
              </p>
              <p className="text-sm font-black text-[#132ea7] mt-0.5">
                {workLog.hours_worked || workLog.hours || "—"} hrs
              </p>
            </div>
          </div>

          {/* Associated Task */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Task
            </p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {workLog.task?.task || workLog.task_name || "General Log"}
            </p>
          </div>

          {/* Work Summary / Description */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Work Done
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-700 whitespace-pre-line leading-relaxed">
              {workLog.work_done || workLog.description || "No description provided."}
            </div>
          </div>

          {/* Remarks / Comments */}
          {workLog.remark && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Remarks
              </p>
              <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-xs font-semibold text-amber-800 whitespace-pre-line">
                {workLog.remark}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-white transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};