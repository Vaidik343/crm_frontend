import { useState } from "react";
import api from "../../api/axiosInstance";
import Modal from "./Modal";
import Button from "./Button";
import { MdDownload, MdCalendarToday } from "react-icons/md";

const ExportProjectModal = ({ show, onClose, project }) => {
  const today = new Date().toISOString().split("T")[0];
  const [from, setFrom] = useState("");
  const [downloading, setDownloading] = useState(false);

  const download = async (fromDate, toDate) => {
    if (!project) return;
    try {
      setDownloading(true);
      const params = fromDate ? `from=${fromDate}&to=${toDate}` : "";

      const res = await api.get(`/export/project/${project.id}${params ? `?${params}` : ""}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const label = fromDate ? `${fromDate}_to_${toDate}` : today;
      const projLabel = project.code || project.name.replace(/\s+/g, "_");
      link.setAttribute("download", `${projLabel}_activity_${label}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title={`Export Activity Report — ${project?.name || ""}`} size="md">
      <div className="space-y-6">

        <p className="text-sm font-bold text-slate-400">
          Download all calls and tasks logged for this project.
        </p>

        {/* Date range picker */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
            From
          </label>
          <input
            type="date"
            value={from}
            max={today}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20"
          />
          <span className="text-xs font-bold text-slate-400">to {today}</span>
          {from && (
            <button
              onClick={() => setFrom("")}
              className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest ml-auto"
            >
              Clear
            </button>
          )}
        </div>

        {/* Download actions */}
        <div className="flex gap-3">
          <button
            onClick={() => download("", "")}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            <MdCalendarToday size={14} /> {downloading ? "..." : "All Time"}
          </button>

          <button
            onClick={() => download(from, today)}
            disabled={!from || downloading}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-[#132ea7] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0f2490] transition-all disabled:opacity-40"
          >
            <MdDownload size={14} /> {downloading ? "..." : "Date Range"}
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-50">
          <Button variant="ghost" onClick={onClose} className="font-black uppercase tracking-widest text-xs">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportProjectModal;