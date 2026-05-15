import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import Textarea from "../../components/ui/Textarea";
import Alert from "../../components/ui/Alert";
import { MdBook, MdHistory, MdCalendarToday, MdAccessTime, MdOutlineSpeakerNotes } from "react-icons/md";

const WorkLog = () => {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [logText, setLogText]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert]         = useState({ type: "", message: "" });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(ENDPOINTS.WORKLOG.MY_LOGS);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!logText.trim()) return;

    try {
      setSubmitting(true);
      await api.post(ENDPOINTS.WORKLOG.ALL, { log_text: logText });
      setLogText("");
      setAlert({ type: "success", message: "Mission journal updated successfully" });
      fetchLogs();
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to submit operational report" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !logs.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Syncing mission archives...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            Mission <span className="text-[#132ea7]">Journal</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Document your daily operations and tactical progress</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 px-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
           <div className="w-12 h-12 rounded-xl bg-[#132ea7] text-white flex items-center justify-center shadow-lg shadow-[#132ea7]/20">
              <MdCalendarToday size={24} />
           </div>
           <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1 text-center">Active Date</p>
              <p className="text-base font-black text-[#132ea7] uppercase tracking-widest leading-none">{new Date().toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}</p>
           </div>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Entry Form */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/40 sticky top-10">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-2 h-10 bg-[#132ea7] rounded-full shadow-[0_0_15px_#132ea7]" />
               <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">New Entry</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Briefing Report</label>
                 <Textarea
                   value={logText}
                   onChange={(e) => setLogText(e.target.value)}
                   placeholder="Detail your accomplishments, technical blockers, and objectives for the day..."
                   rows={10}
                   className="text-base font-bold leading-relaxed rounded-3xl border-slate-100 focus:ring-4 focus:ring-[#132ea7]/5"
                   required
                 />
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#132ea7]/20" 
                loading={submitting}
              >
                Deploy Report
              </Button>
            </form>

            <div className="mt-10 p-6 bg-[#132ea7]/5 border border-[#132ea7]/10 rounded-2xl">
               <p className="text-xs font-bold text-slate-500 italic leading-relaxed">
                  "Daily submissions are essential for mission continuity and team alignment. Provide clear, actionable summaries."
               </p>
            </div>
          </div>
        </div>

        {/* Archives */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <MdHistory size={28} className="text-[#132ea7]" />
                Archived Reports
             </h3>
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">{logs.length} Submissions</span>
          </div>

          <div className="space-y-6">
            {logs.length === 0 && (
              <div className="bg-white rounded-[2rem] p-20 text-center border border-dashed border-slate-200">
                <MdOutlineSpeakerNotes size={48} className="text-slate-200 mx-auto mb-4" />
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Reports Logged</h4>
                <p className="text-slate-400 font-bold text-base mt-2">Begin your first operational entry to build your mission archive.</p>
              </div>
            )}
            {logs.map((log) => (
              <div key={log.id} className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center md:items-start shrink-0">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 text-[#132ea7] flex items-center justify-center shadow-inner group-hover:bg-[#132ea7] group-hover:text-white transition-all duration-500 mb-4">
                        <MdAccessTime size={28} />
                     </div>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Operational Date</p>
                     <p className="text-base font-black text-slate-800 uppercase tracking-widest">{new Date(log.date).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  
                  <div className="flex-grow space-y-4">
                     <div className="p-8 bg-[#132ea7]/5 border border-[#132ea7]/10 rounded-[1.5rem] relative">
                        <p className="text-lg font-medium text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                          "{log.log_text}"
                        </p>
                     </div>
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkLog;