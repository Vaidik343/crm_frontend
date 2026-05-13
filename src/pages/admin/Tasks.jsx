import { useEffect, useState } from "react";
import { useTask } from "../../context/TaskContext";
import { useUser } from "../../context/UserContext";
import Badge, { DueDateBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";

const initialForm = {
  task:        "",
  description: "",
  assigned_to: "",
  due_date:    "",
    status:      "",
};

const FILTER_OPTIONS = [
  { value: "all",     label: "All" },
  { value: "open",    label: "Open" },
  { value: "ongoing", label: "Ongoing" },
  { value: "closed",  label: "Closed" },
];

const STATUS_OPTIONS = [
  { value: "open",    label: "Open" },
  { value: "ongoing", label: "Ongoing" },
  { value: "closed",  label: "Closed" },
];

const Tasks = () => {
  const { tasks, loading, getAllTasks, createTask, updateTask, deleteTask } = useTask();
  const { users, getAllUsers } = useUser();

  const [showModal, setShowModal]         = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [form, setForm]                   = useState(initialForm);
  const [fieldErrors, setFieldErrors]     = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [alert, setAlert]                 = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);
  const [filter, setFilter]               = useState("all");

  useEffect(() => {
    getAllTasks();
    getAllUsers();
  }, []);

  const employeeOptions = users.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.employee_id})`,
  }));

  const filtered = filter === "all"
    ? tasks
    : tasks.filter((t) => t.status === filter);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.task.trim())   errors.task        = "Task name is required";
    if (!form.assigned_to)   errors.assigned_to = "Please select an employee";
    return errors;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTarget(task);
    setForm({
      task:        task.task        || "",
      description: task.description || "",
      assigned_to: task.assigned_to || "",
      due_date:    task.due_date    || "",
        status:      task.status      || "",
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
        await updateTask(editTarget.id, {
          task:        form.task,
          description: form.description || null,
          due_date:    form.due_date    || null,
           status:      form.status      || undefined, 
        });
        setAlert({ type: "success", message: "Task updated successfully" });
      } else {
        await createTask({
          task:        form.task,
          description: form.description || null,
          assigned_to: form.assigned_to,
          due_date:    form.due_date    || null,
        });
        setAlert({ type: "success", message: "Task assigned successfully" });
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
      await deleteTask(confirmDelete.id);
      setAlert({ type: "success", message: "Task deleted" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (loading && !tasks.length) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Tasks</h4>
          <p className="text-muted small mb-0">{tasks.length} total tasks</p>
        </div>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            style={{ width: 140 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Button variant="primary" onClick={openCreate}>
            + Assign Task
          </Button>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Tasks table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 text-muted small text-uppercase fw-semibold">Task</th>
                  <th className="text-muted small text-uppercase fw-semibold">Assigned To</th>
                  <th className="text-muted small text-uppercase fw-semibold">Assigned By</th>
                  <th className="text-muted small text-uppercase fw-semibold">Status</th>
                  <th className="text-muted small text-uppercase fw-semibold">Due Date</th>
                  <th className="text-muted small text-uppercase fw-semibold">Start Date</th>
                  <th className="text-muted small text-uppercase fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-5">
                      No tasks found
                    </td>
                  </tr>
                )}
                {filtered.map((task) => (
                  <tr key={task.id}>
                    <td className="px-3">
                      <div className="fw-semibold">{task.task}</div>
                      {task.description && (
                        <div className="text-muted small">{task.description}</div>
                      )}
                    </td>
                    <td>
                      <div className="fw-medium">{task.assignee?.name || "—"}</div>
                      <div className="text-muted small">{task.assignee?.employee_id || ""}</div>
                    </td>
                    <td>
                      <span className="text-muted small">{task.assigner?.name || "—"}</span>
                    </td>
                    <td><Badge value={task.status} /></td>
                    <td><DueDateBadge dueDate={task.due_date} /></td>
                    <td>
                      <span className="text-muted small">
                        {task.start_date
                          ? new Date(task.start_date).toLocaleDateString()
                          : "—"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => openEdit(task)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => setConfirmDelete(task)}
                        >
                          Delete
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
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Edit Task" : "Assign Task"}
        size="lg"
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <Input
                label="Task Name"
                name="task"
                value={form.task}
                onChange={handleChange}
                error={fieldErrors.task}
                placeholder="e.g. Fix login bug"
                required
              />
            </div>
            <div className="col-12">
              <Textarea
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the task in detail..."
                rows={3}
              />
            </div>
            {editTarget && (
  <div className="col-md-6">
    <Select
      label="Status"
      name="status"
      value={form.status}
      onChange={handleChange}
      options={STATUS_OPTIONS}
      placeholder="Select status"
    />
  </div>
)}


            {/* only show assigned_to on create — can't reassign after creation */}
            {!editTarget && (
              <div className="col-md-6">
                <Select
                  label="Assign To"
                  name="assigned_to"
                  value={form.assigned_to}
                  onChange={handleChange}
                  options={employeeOptions}
                  error={fieldErrors.assigned_to}
                  placeholder="Select employee"
                  required
                />
              </div>
            )}
            <div className={editTarget ? "col-md-6" : "col-md-6"}>
  <Input
    label="Due Date"
    name="due_date"
    type="date"
    value={form.due_date}
    onChange={handleChange}
  />
</div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editTarget ? "Update Task" : "Assign Task"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`Delete task "${confirmDelete?.task}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Tasks;