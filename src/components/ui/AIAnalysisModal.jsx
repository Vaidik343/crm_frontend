import { useState } from "react";
import api from "../../api/axiosInstance";
import Modal from "./Modal";
import Button from "./Button";
import Spinner from "./Spinner";
import { MdAutoAwesome, MdPictureAsPdf, MdTableChart } from "react-icons/md";

const AIAnalysisModal = ({ show, onClose, project }) => {
  const today = new Date().toISOString().split("T")[0];

  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF,   setLoadingPDF]   = useState(false);
  const [error,        setError]        = useState("");

  const generate = async (format) => {
    if (!project) return;

    const isExcel = format === "excel";
    if (isExcel) setLoadingExcel(true);
    else         setLoadingPDF(true);
    setError("");

    try {
      const res = await api.get(
        `/export/project/${project.id}/ai-analysis?format=${format}`,
        { responseType: "blob" }
      );

      const url       = window.URL.createObjectURL(new Blob([res.data]));
      const link      = document.createElement("a");
      link.href       = url;
      const projLabel = project.code || project.name.replace(/\s+/g, "_");
      const ext       = isExcel ? "xlsx" : "pdf";
      link.setAttribute("download", `${projLabel}_AI_Analysis_${today}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      try {
        const text   = await err?.response?.data?.text?.();
        const parsed = JSON.parse(text);
        setError(parsed?.message || "AI analysis failed.");
      } catch {
        setError("AI analysis failed. Please try again.");
      }
    } finally {
      setLoadingExcel(false);
      setLoadingPDF(false);
    }
  };

  const isAnyLoading = loadingExcel || loadingPDF;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={`AI Analysis — ${project?.name || ""}`}
      size="md"
    >
      <div className="space-y-6">

        {/* Header */}
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
              <div key={item} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
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
            <p className="text-xs font-black text-red-500 uppercase tracking-widest">{error}</p>
          </div>
        )}

        {/* ── Two buttons ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => generate("excel")}
            disabled={isAnyLoading}
            className="flex items-center justify-center gap-2 px-4 py-4 bg-[#132ea7] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#132ea7]/90 transition-all disabled:opacity-60 shadow-lg shadow-[#132ea7]/20"
          >
            {loadingExcel ? (
              <><Spinner size="sm" /> Generating...</>
            ) : (
              <><MdTableChart size={16} /> Excel</>
            )}
          </button>

          <button
            onClick={() => generate("pdf")}
            disabled={isAnyLoading}
            className="flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-[#e98937] to-orange-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-orange-500/20"
          >
            {loadingPDF ? (
              <><Spinner size="sm" /> Generating...</>
            ) : (
              <><MdPictureAsPdf size={16} /> PDF</>
            )}
          </button>
        </div>

        {/* Loading note */}
        {isAnyLoading && (
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            AI is analysing project data — this may take 15–30 seconds
          </p>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-50">
          <Button variant="ghost" onClick={onClose} disabled={isAnyLoading}
            className="font-black uppercase tracking-widest text-xs">
            Close
          </Button>
        </div>

      </div>
    </Modal>
  );
};

export default AIAnalysisModal;