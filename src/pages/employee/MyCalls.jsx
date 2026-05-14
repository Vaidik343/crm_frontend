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

const initialForm = {
  caller_name:  "",
  caller_number: "",
  project_id:   "",
  call_type:    "",
  call_subtype: "",
  receive_type: "",
  call_summary: "",
  remarks:      "",
};

const MyCalls = () => {
  const { calls, loading, getAllCalls, createCall, updateCall, deleteCall } = useCall();
  const { projects, getAllProjects } = useProject();
  const { can } = useAuth();

  const [showModal, setShowModal]         = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [form, setForm]                   = useState(initialForm);
  const [fieldErrors, setFieldErrors]     = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [alert, setAlert]                 = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    getAllCalls();
    getAllProjects();
      // getAllUsers();
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
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">My Calls</h4>
          <p className="text-muted small mb-0">{calls.length} total calls logged</p>
        </div>
        {can("can_write") && (
          <Button variant="primary" onClick={openCreate}>
            + Log Call
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
        <div className="text-center py-5 text-muted">
          <p className="mb-0">No calls logged yet</p>
        </div>
      ) : (
        <div className="row g-3">
          {calls.map((call) => (
            <div key={call.id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">

                  {/* Type badges */}
                  <div className="d-flex gap-2 mb-2 flex-wrap">
                    <Badge value={call.call_type} />
                    <Badge value={call.receive_type} />
                  </div>

                  {/* Caller */}
                  <h6 className="fw-semibold mb-1">{call.caller_name}</h6>
                  {call.caller_number && (
                    <p className="text-muted small mb-1">{call.caller_number}</p>
                  )}

                  {/* Subtype */}
                  <p className="text-muted small mb-1">
                    Subtype: <span className="fw-medium text-dark">{call.call_subtype}</span>
                  </p>

                  {/* Project */}
                  <p className="text-muted small mb-1">
                    Project:{" "}
                    <span className="fw-medium text-dark">
                      {call.Project?.name || "—"}
                    </span>
                  </p>

                  {/* Summary */}
                  {call.call_summary && (
                    <p className="text-muted small mb-1 mt-2">{call.call_summary}</p>
                  )}

                  {/* Date */}
                  <p className="text-muted small mb-0 mt-2">
                    {new Date(call.createdAt).toLocaleString()}
                  </p>

                </div>

                {/* Actions */}
                {(can("can_update") || can("can_delete")) && (
                  <div className="card-footer bg-white border-top d-flex gap-2">
                    {can("can_update") && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="flex-grow-1"
                        onClick={() => openEdit(call)}
                      >
                        Edit
                      </Button>
                    )}
                    {can("can_delete") && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="flex-grow-1"
                        onClick={() => setConfirmDelete(call)}
                      >
                        Delete
                      </Button>
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
        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-md-6">
              <Input
                label="Caller Name"
                name="caller_name"
                value={form.caller_name}
                onChange={handleChange}
                error={fieldErrors.caller_name}
                placeholder="e.g. Rahul Shah"
                required
              />
            </div>
            <div className="col-md-6">
              <Input
                label="Caller Number"
                name="caller_number"
                value={form.caller_number}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
              />
            </div>
            <div className="col-md-12">
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
            <div className="col-md-6">
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
            </div>
            <div className="col-md-6">
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
            </div>
            <div className="col-md-6">
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
            </div>
            <div className="col-md-12">
              <Textarea
                label="Call Summary"
                name="call_summary"
                value={form.call_summary}
                onChange={handleChange}
                placeholder="Brief summary of the call..."
                rows={3}
              />
            </div>
            <div className="col-md-12">
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

          <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
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