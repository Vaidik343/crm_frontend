import { useEffect, useState } from "react";
import { useWorkLog } from "../../context/WorkLogContext";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";

const initialForm = {
  description: "",
  date: new Date().toISOString().split("T")[0], // today's date as default
};

const WorkLog = () => {
  const { workLogs, loading, getAllWorkLogs, createWorkLog, updateWorkLog, deleteWorkLog } = useWorkLog();
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
    getAllWorkLogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.description.trim()) errors.description = "Description is required";
    if (!form.date)               errors.date        = "Date is required";
    return errors;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (log) => {
    setEditTarget(log);
    setForm({ description: log.description, date: log.date });
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
        await updateWorkLog(editTarget.id, form);
        setAlert({ type: "success", message: "Work log updated" });
      } else {
        await createWorkLog(form);
        setAlert({ type: "success", message: "Work log added" });
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
      await deleteWorkLog(confirmDelete.id);
      setAlert({ type: "success", message: "Work log deleted" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (loading && !workLogs.length) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Work Log</h4>
          <p className="text-muted small mb-0">Your daily work journal</p>
        </div>
        {can("can_write") && (
          <Button variant="primary" onClick={openCreate}>
            + Add Entry
          </Button>
        )}
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Work logs */}
      {workLogs.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="mb-0">No work logs yet. Add your first entry.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {workLogs.map((log) => (
            <div key={log.id} className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-start justify-content-between gap-3">
                  {/* Date pill */}
                  <div
                    className="d-flex flex-column align-items-center justify-content-center bg-primary bg-opacity-10 rounded-3 flex-shrink-0"
                    style={{ width: 56, height: 56 }}
                  >
                    <span className="fw-bold text-primary" style={{ fontSize: 16, lineHeight: 1 }}>
                      {new Date(log.date).getDate()}
                    </span>
                    <span className="text-primary" style={{ fontSize: 10 }}>
                      {new Date(log.date).toLocaleString("default", { month: "short" })}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="flex-grow-1">
                    <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{log.description}</p>
                    <p className="text-muted small mb-0 mt-1">
                      {new Date(log.date).toLocaleDateString("default", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2 flex-shrink-0">
                    {can("can_update") && (
                      <Button size="sm" variant="outline-primary" onClick={() => openEdit(log)}>
                        Edit
                      </Button>
                    )}
                    {can("can_delete") && (
                      <Button size="sm" variant="outline-danger" onClick={() => setConfirmDelete(log)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Edit Work Log" : "Add Work Log"}
      >
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            error={fieldErrors.date}
            required
          />
          <Textarea
            label="What did you do today?"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={fieldErrors.description}
            placeholder="Describe your work for the day..."
            rows={5}
            required
          />
          <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editTarget ? "Update" : "Save Entry"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message="Delete this work log entry? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default WorkLog;