import { useState } from "react";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import Modal from "./Modal";
import Button from "./Button";
import { MdDownload, MdCalendarToday, MdDescription, MdDateRange, MdCheckCircle } from "react-icons/md";
import toast from "react-hot-toast";

const ExportInternModal = ({ show, onClose, intern, isSelfExport = false }) => {
  const today = new Date().toISOString().split("T")[0];
  const [exportMode, setExportMode] = useState("all"); // 'all' or 'range'
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const endpoint = isSelfExport
        ? ENDPOINTS.INTERNS.MY_EXPORT
        : ENDPOINTS.INTERNS.EXPORT(intern?.id);

      const params = new URLSearchParams();
      if (exportMode === "range" && from) {
        params.set("from", from);
        params.set("to", to || today);
      }

      const res = await api.get(`${endpoint}?${params.toString()}`, {
        responseType: "blob",
      });

      // Create download blob link
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const internName = intern?.name ? intern.name.replace(/\s+/g, "_") : "Intern";
      const rangeTag = exportMode === "range" && from ? `${from}_to_${to}` : "AllTime";
      link.setAttribute("download", `Intern_Report_${internName}_${rangeTag}.xlsx`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel Report downloaded successfully!");
      onClose();
    } catch (err) {
      console.error("Intern Export failed:", err);
      toast.error(err?.response?.data?.message || "Failed to download export report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title={`Export Intern Report — ${intern?.name || ""}`} size="md">
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="p-4 bg-[#132ea7]/5 border border-[#132ea7]/10 rounded-2xl flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center shrink-0">
            <MdDescription size={22} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              All-in-One Multi-Sheet Excel Workbook
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Includes 3 separate sheets: <strong>Overview & Project</strong>, <strong>Assigned Tasks</strong>, and <strong>Work Logs</strong>.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
            Select Export Scope
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* All Time Option */}
            <div
              onClick={() => setExportMode("all")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                exportMode === "all"
                  ? "border-[#132ea7] bg-[#132ea7]/5 shadow-md shadow-[#132ea7]/10"
                  : "border-slate-100 bg-slate-50 hover:bg-slate-100/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${exportMode === "all" ? "bg-[#132ea7] text-white" : "bg-slate-200 text-slate-500"}`}>
                  <MdCalendarToday size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wider">All Time</p>
                  <p className="text-[10px] text-slate-400 font-bold">Entire history</p>
                </div>
              </div>
              {exportMode === "all" && <MdCheckCircle size={20} className="text-[#132ea7]" />}
            </div>

            {/* Date Range Option */}
            <div
              onClick={() => setExportMode("range")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                exportMode === "range"
                  ? "border-[#132ea7] bg-[#132ea7]/5 shadow-md shadow-[#132ea7]/10"
                  : "border-slate-100 bg-slate-50 hover:bg-slate-100/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${exportMode === "range" ? "bg-[#132ea7] text-white" : "bg-slate-200 text-slate-500"}`}>
                  <MdDateRange size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Date Range</p>
                  <p className="text-[10px] text-slate-400 font-bold">Custom date filter</p>
                </div>
              </div>
              {exportMode === "range" && <MdCheckCircle size={20} className="text-[#132ea7]" />}
            </div>
          </div>
        </div>

        {/* Date Inputs if Custom Range */}
        {exportMode === "range" && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 animate-in fade-in duration-200">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Choose Date Boundaries
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={from}
                  max={today}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={to}
                  max={today}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} className="font-black uppercase tracking-widest text-xs">
            Cancel
          </Button>
          <button
            onClick={handleDownload}
            disabled={loading || (exportMode === "range" && !from)}
            className="flex items-center gap-2 px-6 py-3 bg-[#132ea7] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition-all disabled:opacity-40 shadow-lg shadow-[#132ea7]/20"
          >
            <MdDownload size={18} />
            {loading ? "Generating Excel..." : "Download Excel (.xlsx)"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportInternModal;
