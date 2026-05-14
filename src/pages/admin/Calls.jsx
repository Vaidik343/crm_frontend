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
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";

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
};

const Calls = () => {
  const { calls, loading, getAllCalls, createCall, updateCall, deleteCall } = useCall();
  const { projects, getAllProjects } = useProject();

  const [filter, setFilter]           = useState("all");
  const [showModal, setShowModal]     = useState(false);
  const [viewTarget, setViewTarget]   = useState(null);
  const [editTarget, setEditTarget]   = useState(null);
  const [form, setForm]               = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [alert, setAlert]             = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]       = useState(false);

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

  const filtered = filter === "all"
    ? calls
    : calls.filter((c) => c.call_type === filter);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "call_type") {
      setForm((prev) => ({ ...prev, call_type: value, call_subtype: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.caller_name.trim()) errors.caller_name  = "Caller name is required";
    if (!form.project_id)         errors.project_id   = "Project is required";
    if (!form.call_type)          errors.call_type    = "Call type is required";
    if (!form.call_subtype)       errors.call_subtype = "Call subtype is required";
    if (!form.receive_type)       errors.receive_type = "Receive type is required";
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
       const uc = await updateCall(editTarget.id, form);
        console.log("🚀 ~ handleSubmit ~ uc:", uc)
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
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">All Calls</h4>
          <p className="text-muted small mb-0">{calls.length} total call logs</p>
        </div>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            style={{ width: 160 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Button variant="primary" onClick={openCreate}>
            + Log Call
          </Button>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 text-muted small text-uppercase fw-semibold">Caller</th>
                  <th className="text-muted small text-uppercase fw-semibold">Employee</th>
                  <th className="text-muted small text-uppercase fw-semibold">Project</th>
                  <th className="text-muted small text-uppercase fw-semibold">Type</th>
                  <th className="text-muted small text-uppercase fw-semibold">Subtype</th>
                  <th className="text-muted small text-uppercase fw-semibold">Via</th>
                  <th className="text-muted small text-uppercase fw-semibold">Date</th>
                  <th className="text-muted small text-uppercase fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-5">No calls found</td>
                  </tr>
                )}
                {filtered.map((call) => (
                  <tr key={call.id}>
                    <td className="px-3">
                      <div className="fw-semibold">{call.caller_name}</div>
                      {call.caller_number && (
                        <div className="text-muted small">{call.caller_number}</div>
                      )}
                    </td>
                    <td>
                      <div className="fw-medium">{call.User?.name || "—"}</div>
                      <div className="text-muted small">{call.User?.employee_id || ""}</div>
                    </td>
                    <td>
                      <span className="text-muted small">{call.Project?.name || "—"}</span>
                    </td>
                    <td><Badge value={call.call_type} /></td>
                    <td><span className="text-muted small">{call.call_subtype}</span></td>
                    <td><Badge value={call.receive_type} /></td>
                    <td>
                      <span className="text-muted small">
                        {new Date(call.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-primary" onClick={() => setViewTarget(call)}>
                          <MdVisibility size={14} className="me-1" /> View
                        </Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => openEdit(call)}>
                          <MdEdit size={14} className="me-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => setConfirmDelete(call)}>
                          <MdDelete size={14} className="me-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onClose={closeModal} title={editTarget ? "Edit Call" : "Log a Call"} size="lg">
        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-md-6">
              <Input label="Caller Name" name="caller_name" value={form.caller_name}
                onChange={handleChange} error={fieldErrors.caller_name}
                placeholder="e.g. Rahul Shah" required />
            </div>
            <div className="col-md-6">
              <Input label="Caller Number" name="caller_number" value={form.caller_number}
                onChange={handleChange} placeholder="e.g. +91 98765 43210" />
            </div>
            <div className="col-12">
              <Select label="Project" name="project_id" value={form.project_id}
                onChange={handleChange} options={projectOptions}
                error={fieldErrors.project_id} placeholder="Select a project" required />
            </div>
            <div className="col-md-6">
              <Select label="Call Type" name="call_type" value={form.call_type}
                onChange={handleChange} options={callTypeOptions}
                error={fieldErrors.call_type} placeholder="Select type" required />
            </div>
            <div className="col-md-6">
              <Select label="Call Subtype" name="call_subtype" value={form.call_subtype}
                onChange={handleChange} options={subtypeOptions}
                error={fieldErrors.call_subtype}
                placeholder={form.call_type ? "Select subtype" : "Select type first"}
                disabled={!form.call_type} required />
            </div>
            <div className="col-md-6">
              <Select label="Receive Type" name="receive_type" value={form.receive_type}
                onChange={handleChange} options={RECEIVE_OPTIONS}
                error={fieldErrors.receive_type} placeholder="Select receive type" required />
            </div>
            <div className="col-12">
              <Textarea label="Call Summary" name="call_summary" value={form.call_summary}
                onChange={handleChange} placeholder="Brief summary of the call..." rows={3} />
            </div>
            <div className="col-12">
              <Textarea label="Remarks" name="remarks" value={form.remarks}
                onChange={handleChange} placeholder="Any additional remarks..." rows={2} />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editTarget ? "Update Call" : "Log Call"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Call Details" size="lg">
        {viewTarget && (
          <div className="row g-3">
            <div className="col-md-6">
              <p className="text-muted small mb-1">Caller Name</p>
              <p className="fw-semibold mb-0">{viewTarget.caller_name}</p>
            </div>
            <div className="col-md-6">
              <p className="text-muted small mb-1">Caller Number</p>
              <p className="fw-semibold mb-0">{viewTarget.caller_number || "—"}</p>
            </div>
            <div className="col-md-6">
              <p className="text-muted small mb-1">Logged By</p>
              <p className="fw-semibold mb-0">
                {viewTarget.User?.name || "—"}{" "}
                <span className="text-muted small">({viewTarget.User?.employee_id})</span>
              </p>
            </div>
            <div className="col-md-6">
              <p className="text-muted small mb-1">Project</p>
              <p className="fw-semibold mb-0">{viewTarget.Project?.name || "—"}</p>
            </div>
            <div className="col-md-4">
              <p className="text-muted small mb-1">Call Type</p>
              <Badge value={viewTarget.call_type} />
            </div>
            <div className="col-md-4">
              <p className="text-muted small mb-1">Subtype</p>
              <p className="fw-semibold mb-0">{viewTarget.call_subtype}</p>
            </div>
            <div className="col-md-4">
              <p className="text-muted small mb-1">Received Via</p>
              <Badge value={viewTarget.receive_type} />
            </div>
            {viewTarget.call_summary && (
              <div className="col-12">
                <p className="text-muted small mb-1">Summary</p>
                <p className="mb-0">{viewTarget.call_summary}</p>
              </div>
            )}
            {viewTarget.remarks && (
              <div className="col-12">
                <p className="text-muted small mb-1">Remarks</p>
                <p className="mb-0">{viewTarget.remarks}</p>
              </div>
            )}
            <div className="col-12">
              <p className="text-muted small mb-1">Logged At</p>
              <p className="fw-semibold mb-0">{new Date(viewTarget.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
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

export default Calls;