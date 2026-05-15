import { useState } from "react";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import { MdFileDownload, MdPhone, MdAssignment, MdHistory, MdSecurity } from "react-icons/md";

const Export = () => {
  const [loading, setLoading] = useState(null);
  const [alert, setAlert]     = useState({ type: "", message: "" });

  const handleExport = async (type) => {
    try {
      setLoading(type);
      const response = await api.get(`${ENDPOINTS.EXPORT.ALL}?type=${type}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_archive_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      setAlert({ type: "success", message: `${type.toUpperCase()} data archive exported successfully` });
    } catch (err) {
      setAlert({ type: "danger", message: "Archive extraction failed" });
    } finally {
      setLoading(null);
    }
  };

  const exportTypes = [
    { id: "calls",     label: "Intelligence Logs", icon: <MdPhone size={24} />,      description: "Complete call history & summaries" },
    { id: "tasks",     label: "Mission Tasks",     icon: <MdAssignment size={24} />, description: "Project objectives & status tracking" },
    { id: "worklogs",  label: "Operational Logs", icon: <MdHistory size={24} />,    description: "Daily Employee activity journals" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
         <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Archive <span className="text-[#132ea7]">Vault</span></h3>
         <p className="text-slate-500 font-bold text-base italic">"Extract comprehensive datasets for offline intelligence analysis."</p>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportTypes.map((type) => (
          <div key={type.id} className="group relative bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 text-[#132ea7] flex items-center justify-center group-hover:bg-[#132ea7] group-hover:text-white transition-all duration-500 shadow-inner">
                {type.icon}
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{type.label}</h4>
                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{type.description}</p>
              </div>
              <Button 
                variant="primary" 
                className="w-full h-12 shadow-lg shadow-[#132ea7]/20 font-black uppercase tracking-widest text-xs"
                onClick={() => handleExport(type.id)}
                loading={loading === type.id}
              >
                <MdFileDownload size={18} /> Extract Data
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 flex items-start gap-4">
         <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#132ea7] flex items-center justify-center shrink-0">
            <MdSecurity size={20} />
         </div>
         <div>
            <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest">Security Disclaimer</h5>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider leading-relaxed">
               All exports are tracked and logged. Authorized personnel only. Data extraction outside of secure environments is strictly monitored.
            </p>
         </div>
      </div>
    </div>
  );
};

export default Export;