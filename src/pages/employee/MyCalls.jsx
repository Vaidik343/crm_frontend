import { useEffect, useState } from "react";
import { useCall } from "../../context/CallContext";
import { useProject } from "../../context/ProjectContext";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { MdPhone, MdAdd, MdCalendarToday, MdVisibility, MdEdit, MdDelete, MdFolder, MdInfoOutline, MdHistory } from "react-icons/md";

const CALL_TYPES = {
  inquiry:   ["inquiry", "follow-back"],
  request:   ["other", "update", "new development"],
  complaint: ["bug", "error solve"],
};

const RECEIVE_OPTIONS = [
  { value: "call",    label: "Call" },
  { value: "msg",     label: "Message" },
  { value: "email",   label: "Email" },
  { value: "meeting", label: "Meeting" },
];

const FILTER_OPTIONS = [
  { value: "all",       label: "All" },
  { value: "inquiry",   label: "Inquiry" },
  { value: "request",   label: "Request" },
  { value: "complaint", label: "Complaint" },
];

const initialForm = {
  caller_name:   "",
  caller_number: "",
  project_id:    "",
  call_type:     "",
  call_subtype:  "",
  receive_type:  "",
  call_summary:  "",
  remarks:       "",
  is_task:       false,
};

const MyCalls = () => {
  const { calls, loading, page, setPage, totalPages, getAllCalls, createCall, updateCall, deleteCall } = useCall();
  const { projects, getAllProjects } = useProject();
  console.log("🚀 ~ MyCalls ~ projects:", projects)

  const [filter, setFilter]               = useState("all");
  const [showModal, setShowModal]         = useState(false);
  const [viewTarget, setViewTarget]       = useState(null);
  const [editTarget, setEditTarget]       = useState(null);
  const [form, setForm]                   = useState(initialForm);
  const [fieldErrors, setFieldErrors]     = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [alert, setAlert]                 = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    getAllCalls?.(page);
    getAllProjects?.();
  }, [page]);

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  console.log("🚀 ~ MyCalls ~ projectOptions:", projectOptions)

  const callTypeOptions = Object.keys(CALL_TYPES).map((t) => ({
    value: t, label: t.charAt(0).toUpperCase() + t.slice(1),
  }));
  console.log("🚀 ~ MyCalls ~ callTypeOptions:", callTypeOptions)

  const subtypeOptions = form.call_type
    ? CALL_TYPES[form.call_type].map((s) => ({ value: s, label: s }))
    : [];

  const filtered = filter === "all" ? calls : calls.filter((c) => c.call_type === filter);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (name === "call_type") {
      setForm((prev) => ({ ...prev, call_type: newValue, call_subtype: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: newValue }));
    }
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.caller_name.trim()) errors.caller_name  = "Caller name is required";
    if (!form.call_type)          errors.call_type    = "Call type is required";
    if (!form.call_subtype)       errors.call_subtype = "Call subtype is required";
    if (!form.receive_type)       errors.receive_type = "Receive type is required";
    if (form.is_task && !form.project_id) errors.project_id = "Project is required when creating a task";
    return errors;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (call) => {
    setEditTarget(call);
    setForm({
      caller_name:   call.caller_name   || "",
      caller_number: call.caller_number || "",
      project_id:    call.project_id    || "",
      call_type:     call.call_type     || "",
      call_subtype:  call.call_subtype  || "",
      receive_type:  call.receive_type  || "",
      call_summary:  call.call_summary  || "",
      remarks:       call.remarks       || "",
      is_task:       call.is_task       || false,
    });
    setFieldErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateCall(editTarget.id, form);
        setAlert({ type: "success", message: "Call updated successfully" });
      } else {
        const payload = {
          ...form,
          project_id:    form.project_id    || null,
          caller_number: form.caller_number || null,
          call_summary:  form.call_summary  || null,
          remarks:       form.remarks       || null,
        };
        const cc = await createCall(payload);
        if (cc?.task) {
          setAlert({ type: "success", message: "Call logged and task auto-created successfully" });
        } else {
          setAlert({ type: "success", message: "Call logged successfully" });
        }
      }
      closeModal();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteCall(confirmDelete.id);
      setAlert({ type: "success", message: "Call deleted" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            CALL <span className="text-[#132ea7]">Logs</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Total calls: {calls.length}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <select
            className="bg-white border border-slate-100 text-slate-600 text-sm font-bold rounded px-3 focus:outline-none focus:border-[#132ea7]/30 focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none shadow-sm cursor-pointer h-[52px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 px-6 rounded font-black uppercase tracking-widest text-sm whitespace-nowrap h-[52px]" onClick={openCreate}>
            <MdAdd size={20} className="mr-1" /> Log New Call
          </Button>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Stats */}
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
              {calls.filter((c) => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}
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

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Caller</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Project</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Medium</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-16 font-bold italic text-lg uppercase tracking-widest">No logs archived yet.</td>
                </tr>
              )}
              {filtered.map((call) => (
                <tr key={call.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#132ea7] flex items-center justify-center shadow-inner group-hover:bg-[#132ea7] group-hover:text-white transition-all">
                        <MdCalendarToday size={18} />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-base">{new Date(call.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(call.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-700 text-sm">{call.caller_name}</div>
                    {call.caller_number && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{call.caller_number}</div>}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-600">
                      <MdFolder className="text-[#132ea7]" size={16} />
                      {call.Project?.name || "—"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <Badge value={call.call_type} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{call.call_subtype}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">{call.receive_type}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all" onClick={() => setViewTarget(call)} title="View">
                        <MdVisibility size={20} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all" onClick={() => openEdit(call)} title="Edit">
                        <MdEdit size={20} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" onClick={() => setConfirmDelete(call)} title="Delete">
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-6 border-t border-slate-100">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">Previous</button>
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i+1} onClick={() => setPage(i+1)} className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i+1 ? "bg-[#132ea7] text-white" : "bg-slate-100 text-slate-700"}`}>{i+1}</button>
            ))}
          </div>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onClose={closeModal} title={editTarget ? "Edit Call Log" : "Log New Call"} size="lg">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Input label="Caller Name" name="caller_name" value={form.caller_name}
              onChange={handleChange} error={fieldErrors.caller_name}
              placeholder="e.g. Rahul Shah" required />

            <Input label="Caller Number" name="caller_number" value={form.caller_number}
              onChange={handleChange} placeholder="e.g. +91 98765 43210" />

            <div className="md:col-span-2">
              <Select label="Project" name="project_id" value={form.project_id}
                onChange={handleChange} options={projectOptions}
                error={fieldErrors.project_id} placeholder="Select associated project..." />
            </div>

            <Select label="Call Type" name="call_type" value={form.call_type}
              onChange={handleChange} options={callTypeOptions}
              error={fieldErrors.call_type} placeholder="Select core classification..." required />

            <Select label="Call Subtype" name="call_subtype" value={form.call_subtype}
              onChange={handleChange} options={subtypeOptions}
              error={fieldErrors.call_subtype}
              placeholder={form.call_type ? "Select specific subtype..." : "Select type first"}
              disabled={!form.call_type} required />

            <div className="md:col-span-2">
              <Select label="Communication Medium" name="receive_type" value={form.receive_type}
                onChange={handleChange} options={RECEIVE_OPTIONS}
                error={fieldErrors.receive_type} placeholder="Select medium..." required />
            </div>

            <div className="md:col-span-2">
              <Textarea label="Executive Summary" name="call_summary" value={form.call_summary}
                onChange={handleChange} placeholder="Brief summary of the contact objectives..." rows={3} />
            </div>

            <div className="md:col-span-2">
              <Textarea label="Employee Remarks" name="remarks" value={form.remarks}
                onChange={handleChange} placeholder="Any additional notes or action items..." rows={2} />
            </div>

            {/* is_task toggle — only on create */}
            {!editTarget && (
              <div className="md:col-span-2">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Auto-Create Task</p>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                      {form.is_task ? "A task will be auto-created from this call" : "Log call only, no task created"}
                    </p>
                    {form.is_task && !form.project_id && (
                      <p className="text-xs font-bold text-amber-500 mt-1">⚠ Select a project to enable task creation</p>
                    )}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="is_task" checked={form.is_task} onChange={handleChange} className="sr-only peer" />
                    <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#132ea7]" />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm" loading={submitting}>
              {editTarget ? "Authorize Update" : "Create Call Log"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Call Details" size="lg">
        {viewTarget && (
          <div className="space-y-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-50">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-[2rem] bg-[#132ea7] text-white flex items-center justify-center font-black text-3xl shadow-2xl shadow-[#132ea7]/20">
                  {viewTarget.caller_name?.charAt(0) || <MdPhone size={32} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight">{viewTarget.caller_name}</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-1">Contact: {viewTarget.caller_number || "—"}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge value={viewTarget.call_type} />
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MdCalendarToday size={16} className="text-slate-300" />
                  {new Date(viewTarget.createdAt).toLocaleDateString("default", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <MdFolder size={16} /> Project
                </p>
                <p className="text-lg font-black text-slate-800">{viewTarget.Project?.name || "—"}</p>
                <p className="text-xs font-bold text-[#132ea7] uppercase tracking-widest mt-1">Subtype: {viewTarget.call_subtype || "General"}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <MdPhone size={16} /> Contact Details
                </p>
                <Badge value={viewTarget.receive_type} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                  Employee: {viewTarget.User?.name || "—"} ({viewTarget.User?.employee_id})
                </p>
              </div>
            </div>

            {(viewTarget.call_summary || viewTarget.remarks) && (
              <div className="p-10 bg-[#132ea7] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  {viewTarget.call_summary && (
                    <div>
                      <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <MdInfoOutline size={18} className="text-white/30" /> Executive Summary
                      </p>
                      <p className="text-xl font-medium leading-relaxed opacity-95 italic whitespace-pre-wrap">"{viewTarget.call_summary}"</p>
                    </div>
                  )}
                  {viewTarget.remarks && (
                    <div>
                      <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-3">Remarks</p>
                      <p className="text-base font-medium leading-relaxed opacity-80 whitespace-pre-wrap">{viewTarget.remarks}</p>
                    </div>
                  )}
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-[80px]" />
              </div>
            )}

            <div className="flex items-center justify-end pt-4">
              <Button variant="ghost" onClick={() => setViewTarget(null)} className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        show={!!confirmDelete}
        message={`Permanently delete call record for "${confirmDelete?.caller_name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default MyCalls;
