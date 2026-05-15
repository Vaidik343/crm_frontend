import { useEffect, useState } from "react";
import { useCall } from "../../context/CallContext";
import { useProject } from "../../context/ProjectContext";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Badge from "../../components/ui/Badge";
import Alert from "../../components/ui/Alert";
import { MdPhone, MdAdd, MdCalendarToday, MdFolder, MdInfoOutline, MdHistory } from "react-icons/md";

const MyCalls = () => {
  const { calls, loading, getMyCalls, createCall } = useCall();
  const { projects, getAllProjects } = useProject();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ project_id: "", call_type: "inbound", call_subtype: "", medium: "phone", summary: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    getMyCalls();
    getAllProjects();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const validate = () => {
    const errors = {};
    if (!form.summary.trim()) errors.summary = "Communication summary is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSubmitting(true);
      await createCall(form);
      setAlert({ type: "success", message: "Intelligence log submitted successfully" });
      setShowModal(false);
      setForm({ project_id: "", call_type: "inbound", call_subtype: "", medium: "phone", summary: "" });
      getMyCalls();
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to log communication" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !calls.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Accessing comms archives...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            Communication <span className="text-[#132ea7]">Logs</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Archive and track all mission-related intelligence and contacts</p>
        </div>
        <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 py-3 px-8 rounded-2xl h-[52px] font-black uppercase tracking-widest text-sm" onClick={() => setShowModal(true)}>
          <MdAdd size={22} />
          Log New Contact
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
            <MdPhone size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Logs</p>
            <p className="text-3xl font-black text-slate-800">{calls.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <MdHistory size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Today's Contacts</p>
            <p className="text-3xl font-black text-slate-800">
              {calls.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
        </div>
        <div className="bg-[#132ea7] p-8 rounded-[2rem] shadow-2xl shadow-[#132ea7]/20 flex items-center gap-6 text-white relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center relative z-10">
            <MdInfoOutline size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Last Submission</p>
            <p className="text-lg font-black">{calls[0] ? new Date(calls[0].createdAt).toLocaleDateString() : "No Records"}</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Operation</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Contact Method</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Executive Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {calls.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-slate-400 py-16 font-bold italic text-lg uppercase tracking-widest">No intelligence logs archived yet.</td>
                </tr>
              )}
              {calls.map((call) => (
                <tr key={call.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#132ea7] flex items-center justify-center shadow-inner group-hover:bg-[#132ea7] group-hover:text-white transition-all">
                        <MdCalendarToday size={18} />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-base">{new Date(call.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <MdFolder className="text-[#132ea7]" size={16} />
                        {call.Project?.name || "Global Operation"}
                      </div>
                      <Badge value={call.call_type} />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">{call.medium}</span>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-base font-medium text-slate-600 italic truncate max-w-[400px]">
                      "{call.summary}"
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Archive New Intelligence Log"
        size="lg"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Parent Operation</label>
              <select
                name="project_id"
                value={form.project_id}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none"
              >
                <option value="">No Associated Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Call Classification</label>
              <div className="flex gap-4">
                {["inbound", "outbound"].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, call_type: t })}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${form.call_type === t ? 'bg-[#132ea7] text-white border-[#132ea7] shadow-lg shadow-[#132ea7]/20' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Intelligence Classification (Subtype)"
              name="call_subtype"
              value={form.call_subtype}
              onChange={handleChange}
              placeholder="e.g. Technical Support, Follow-up"
            />

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">Communication Medium</label>
              <select
                name="medium"
                value={form.medium}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none"
              >
                <option value="phone">Voice Call</option>
                <option value="email">Electronic Mail</option>
                <option value="meeting">Direct Meeting</option>
                <option value="other">Alternative Medium</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Intelligence Executive Summary"
            name="summary"
            value={form.summary}
            onChange={handleChange}
            error={fieldErrors.summary}
            placeholder="Detail the core objectives discussed and the outcomes achieved..."
            rows={5}
            required
          />

          <div className="flex gap-4 pt-8 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={() => setShowModal(false)} disabled={submitting}>Abort Submission</Button>
            <Button type="submit" variant="primary" className="flex-[2] h-16 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm" loading={submitting}>
              Archive Intelligence Log
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyCalls;