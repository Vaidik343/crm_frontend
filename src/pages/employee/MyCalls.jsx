import { useEffect, useState } from "react";
import { useCall } from "../../context/CallContext";
import { useProject } from "../../context/ProjectContext";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import { MdAdd, MdEdit, MdDelete, MdPhone, MdFolder } from "react-icons/md";

const CALL_TYPES = {
  inquiry: ["inquiry", "follow-back"],
  request: ["other", "update", "new development"],
  complaint: ["bug", "error solve"],
};

const RECEIVE_OPTIONS = [
  { value: "call", label: "Call" },
  { value: "msg", label: "Message" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
];

const initialForm = {
  caller_name: "",
  caller_number: "",
  project_id: "",
  call_type: "",
  call_subtype: "",
  receive_type: "",
  call_summary: "",
  remarks: "",
};

const MyCalls = () => {
  const { calls, loading, getAllCalls, createCall, updateCall, deleteCall } = useCall();
  const { projects, getAllProjects } = useProject();
  const { can } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getAllCalls();
    getAllProjects();
  }, []);

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));

  const callTypeOptions = Object.keys(CALL_TYPES).map((t) => ({
    value: t, label: t.charAt(0).toUpperCase() + t.slice(1),
  }));

  const subtypeOptions = form.call_type
    ? CALL_TYPES[form.call_type].map((s) => ({ value: s, label: s }))
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    // reset subtype when type changes
    if (name === "call_type") {
      setForm((prev) => ({ ...prev, call_type: value, call_subtype: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.caller_name.trim()) errors.caller_name = "Caller name is required";
    if (!form.project_id) errors.project_id = "Project is required";
    if (!form.call_type) errors.call_type = "Call type is required";
    if (!form.call_subtype) errors.call_subtype = "Call subtype is required";
    if (!form.receive_type) errors.receive_type = "Receive type is required";
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
      caller_name: call.caller_name || "",
      caller_number: call.caller_number || "",
      project_id: call.project_id || "",
      call_type: call.call_type || "",
      call_subtype: call.call_subtype || "",
      receive_type: call.receive_type || "",
      call_summary: call.call_summary || "",
      remarks: call.remarks || "",
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
        await createCall(form);
        setAlert({ type: "success", message: "Call logged successfully" });
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

  if (loading && !calls.length) return <Spinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            My <span className="text-[#132ea7]">Calls</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">{calls.length} total calls logged</p>
        </div>
        {can("can_write") && (
          <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 py-3.5 px-8 rounded-2xl font-black uppercase tracking-widest text-xs" onClick={openCreate}>
            <MdAdd size={20} /> Log Call
          </Button>
        )}
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Calls list */}
      {calls.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-slate-300 py-16 text-center shadow-sm">
          <MdPhone size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No calls logged yet. Add your first entry.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {calls.map((call) => (
            <div key={call.id} className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Icons & Types */}
                <div className="flex flex-col gap-3 shrink-0 md:w-48">
                  <div className="flex flex-wrap gap-2">
                    <Badge value={call.call_type} />
                    <Badge value={call.receive_type} />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <MdFolder className="text-[#132ea7]" size={16} />
                    {call.Project?.name || "Global"}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h6 className="text-lg font-black text-slate-800 leading-none">{call.caller_name}</h6>
                    {call.caller_number && (
                      <span className="text-slate-400 font-bold text-sm tracking-wide bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{call.caller_number}</span>
                    )}
                  </div>
                  
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Subtype: <span className="text-slate-600">{call.call_subtype}</span>
                  </p>

                  {call.call_summary && (
                    <div className="p-4 bg-[#132ea7]/5 border border-[#132ea7]/10 rounded-2xl mt-3">
                      <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                        "{call.call_summary}"
                      </p>
                    </div>
                  )}

                  {call.remarks && (
                    <p className="text-sm text-slate-500 mt-2">
                      <span className="font-bold text-xs uppercase tracking-widest text-slate-400">Remarks:</span> {call.remarks}
                    </p>
                  )}
                  
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                    {new Date(call.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                {(can("can_update") || can("can_delete")) && (
                  <div className="flex items-start md:items-center md:flex-col gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
                    {can("can_update") && (
                      <button
                        onClick={() => openEdit(call)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        <MdEdit size={16} /> Edit
                      </button>
                    )}
                    {can("can_delete") && (
                      <button
                        onClick={() => setConfirmDelete(call)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        <MdDelete size={16} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Edit Call" : "Log a Call"}
        size="lg"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Caller Name"
              name="caller_name"
              value={form.caller_name}
              onChange={handleChange}
              error={fieldErrors.caller_name}
              placeholder="e.g. Rahul Shah"
              required
            />
            <Input
              label="Caller Number"
              name="caller_number"
              value={form.caller_number}
              onChange={handleChange}
              placeholder="e.g. +91 98765 43210"
            />
            <div className="md:col-span-2">
              <Select
                label="Project"
                name="project_id"
                value={form.project_id}
                onChange={handleChange}
                options={projectOptions}
                error={fieldErrors.project_id}
                placeholder="Select a project"
                required
              />
            </div>
            <Select
              label="Call Type"
              name="call_type"
              value={form.call_type}
              onChange={handleChange}
              options={callTypeOptions}
              error={fieldErrors.call_type}
              placeholder="Select type"
              required
            />
            <Select
              label="Call Subtype"
              name="call_subtype"
              value={form.call_subtype}
              onChange={handleChange}
              options={subtypeOptions}
              error={fieldErrors.call_subtype}
              placeholder={form.call_type ? "Select subtype" : "Select type first"}
              disabled={!form.call_type}
              required
            />
            <Select
              label="Receive Type"
              name="receive_type"
              value={form.receive_type}
              onChange={handleChange}
              options={RECEIVE_OPTIONS}
              error={fieldErrors.receive_type}
              placeholder="Select receive type"
              required
            />
            <div className="md:col-span-2">
              <Textarea
                label="Call Summary"
                name="call_summary"
                value={form.call_summary}
                onChange={handleChange}
                placeholder="Brief summary of the call..."
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Remarks"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Any additional remarks..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-50 mt-6">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-[2] h-14 text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#132ea7]/20" loading={submitting}>
              {editTarget ? "Update Call" : "Log Call"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`Delete call from "${confirmDelete?.caller_name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default MyCalls;