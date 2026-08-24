import { useState } from "react";
import api from "../../api/axiosInstance";
import Modal from "./Modal";
import Button from "./Button";
import Spinner from "./Spinner";
import { MdAutoAwesome, MdDownload } from "react-icons/md";

const AIAnalysisModal = ({ show, onClose, project }) => {
  const today = new Date().toISOString().split("T")[0];
  const [loading, setLoading] = useState(false);
  console.log("🚀 ~ AIAnalysisModal ~ loading:", loading)
  const [error,   setError]   = useState("");
  console.log("🚀 ~ AIAnalysisModal ~ error:", error)

  // ── Date filter state — uncomment when needed ──
  // const [from, setFrom] = useState("");


  const generate = async () => {
    if (!project) return;
    try {
      setLoading(true);
      setError("");

      // ── Build params — uncomment date filter when needed ──
      // const params = from ? `?from=${from}&to=${today}` : "";
      const params = "";

      const res = await api.get(
        `/export/project/${project.id}/ai-analysis${params}`,
        { responseType: "blob" }
      );
      console.log("🚀 ~ generate ~ res:", res)

      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href  = url;
      const projLabel = project.code || project.name.replace(/\s+/g, "_");

      // ── File label — uncomment date filter version when needed ──
      // const label = from ? `${from}_to_${today}` : today;
      const label = today;

      link.setAttribute("download", `${projLabel}_AI_Analysis_${label}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
            console.log("🚀 ~ generate ~ err:", err)
      // blob error — read message from response
      try {
        const text   = await err?.response?.data?.text?.();
        const parsed = JSON.parse(text);
        setError(parsed?.message || "AI analysis failed.");
      } catch {
        setError("AI analysis failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={`AI Analysis — ${project?.name || ""}`}
      size="md"
    >
      <div className="space-y-6">

        {/* Header icon + description */}
        <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-[#132ea7]/5 to-[#e98937]/5 rounded-2xl border border-[#132ea7]/10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#132ea7] to-[#e98937] flex items-center justify-center shrink-0 shadow-lg">
            <MdAutoAwesome size={22} className="text-white" />
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm uppercase tracking-widest mb-1">
              AI Project Analysis
            </p>
            <p className="text-xs font-bold text-slate-400 leading-relaxed">
              Generates a professional client-ready project timeline and analysis report.
              Covers full project history — calls, tasks, work logs and milestones.
            </p>
          </div>
        </div>

        {/* ── Date filter — uncomment entire block when needed ──
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Filter by Date Range (Optional)
          </p>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest shrink-0">
              From
            </label>
            <input
              type="date"
              value={from}
              max={today}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 flex-1"
            />
            <span className="text-xs font-bold text-slate-400 shrink-0">to {today}</span>
            {from && (
              <button
                onClick={() => setFrom("")}
                className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest ml-auto shrink-0"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-400 pl-1">
            Leave empty to analyse full project history.
          </p>
        </div>
        ── end date filter ── */}

        {/* What's included */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Report Includes
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Executive Summary",
              "Project Timeline",
              "Task Performance",
              "Communication Log",
              "Work Progress",
              "Status & Next Steps",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#132ea7] shrink-0" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-xs font-black text-red-500 uppercase tracking-widest">
              {error}
            </p>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-[#132ea7] to-[#e98937] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-60 shadow-xl shadow-[#132ea7]/20"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Generating Analysis...
            </>
          ) : (
            <>
              <MdDownload size={16} />
              Generate & Download
            </>
          )}
        </button>

        {/* Loading note */}
        {loading && (
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            AI is analysing project data — this may take 15–30 seconds
          </p>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-50">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="font-black uppercase tracking-widest text-xs"
          >
            Close
          </Button>
        </div>

      </div>
    </Modal>
  );
};

export default AIAnalysisModal;