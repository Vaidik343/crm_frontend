import { useState } from "react";
import api from "../../api/axiosInstance";
import { MdDownload, MdCalendarToday } from "react-icons/md";

const ExportBar = ({ type }) => {
  const today = new Date().toISOString().split("T")[0];
  const [from, setFrom] = useState("");
  const [downloading, setDownloading] = useState(false);

  const download = async (fromDate, toDate) => {
    try {
      setDownloading(true);
      const params = fromDate
        ? `type=${type}&from=${fromDate}&to=${toDate}`
        : `type=${type}`;

      const res = await api.get(`/export/mine?${params}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const label = fromDate ? `${fromDate}_to_${toDate}` : today;
      link.setAttribute("download", `${type}_${label}.xlsx`);
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
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
      
      {/* Today button */}
      <button
        onClick={() => download("", "")}
        disabled={downloading}
        className="flex items-center gap-2 px-4 py-2 bg-[#132ea7] text-white rounded text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition-all disabled:opacity-50"
      >
        <MdCalendarToday size={14} />
        Today
      </button>

      <span className="text-slate-300 font-bold text-xs">or</span>

      {/* From date */}
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From</label>
        <input
          type="date"
          value={from}
          max={today}
          onChange={(e) => setFrom(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20"
        />
      </div>

      {/* Download range button */}
      <button
        onClick={() => download(from, today)}
        disabled={!from || downloading}
        className="flex items-center gap-2 px-4 py-2 bg-[#132ea7] text-white rounded text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-70"
      >
        <MdDownload size={14} />
        {downloading ? "Downloading..." : `Download (${from || "—"} → ${today})`}
      </button>

    </div>
  );
};

export default ExportBar;