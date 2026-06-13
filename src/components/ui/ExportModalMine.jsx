import { useState } from "react";
import api from "../../api/axiosInstance";
import Modal from "./Modal";
import Button from "./Button";
import { MdDownload, MdCalendarToday, MdPhone, MdAssignment, MdHistory } from "react-icons/md";

const ALL_DATA_TYPES = [
  { value: "calls",     label: "Calls",     icon: MdPhone },
  { value: "tasks",     label: "Tasks",     icon: MdAssignment },
  { value: "work-logs", label: "Work Logs", icon: MdHistory },
];

// types: optional array like ["tasks"] or ["calls"] or ["work-logs"]
// if omitted, shows all three
const ExportModalMine = ({ show, onClose, types }) => {
  const today = new Date().toISOString().split("T")[0];
  const [from, setFrom] = useState("");
  const [downloadingType, setDownloadingType] = useState(null);

  const dataTypes = types
    ? ALL_DATA_TYPES.filter((d) => types.includes(d.value))
    : ALL_DATA_TYPES;

  const download = async (type, fromDate, toDate) => {
    try {
      setDownloadingType(type);
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
      setDownloadingType(null);
    }
  };

  const title = dataTypes.length === 1
    ? `Download ${dataTypes[0].label}`
    : "Download Reports";

  return (
    <Modal show={show} onClose={onClose} title={title} size="md">
      <div className="space-y-6">

        <p className="text-sm font-bold text-slate-400">
          {dataTypes.length === 1
            ? `Download your ${dataTypes[0].label.toLowerCase()} as an Excel file.`
            : "Download your activity logs as Excel files."}
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

        {/* Data type cards */}
        <div className="space-y-3">
          {dataTypes.map(({ value, label, icon: Icon }) => (
            <div
              key={value}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <span className="font-black text-slate-700 text-sm uppercase tracking-widest">
                  {label}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => download(value, "", "")}
                  disabled={downloadingType === value}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  <MdCalendarToday size={12} /> Today
                </button>

                <button
                  onClick={() => download(value, from, today)}
                  disabled={!from || downloadingType === value}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#132ea7] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0f2490] transition-all disabled:opacity-40"
                >
                  <MdDownload size={12} />
                  {downloadingType === value ? "..." : "Range"}
                </button>
              </div>
            </div>
          ))}
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

export default ExportModalMine;