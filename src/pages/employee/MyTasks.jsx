import { useEffect, useState } from "react";
import { useTask } from "../../context/TaskContext";
import { useUser } from "../../context/UserContext";
import Badge, { DueDateBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";


const initialForm = {
  task:        "",
  description: "",

  due_date:    "",
    status:      ""
};

const STATUS_OPTIONS = [
  { value: "open",    label: "Open" },
  { value: "ongoing", label: "Ongoing" },
  { value: "closed",  label: "Closed" },
];

const FILTER_OPTIONS = [
  { value: "all",     label: "All" },
  { value: "open",    label: "Open" },
  { value: "ongoing", label: "Ongoing" },
  { value: "closed",  label: "Closed" },
];

const MyTasks = () => {
  const { tasks, loading, getAllTasks, updateTask, createTask  } = useTask();

  const [filter, setFilter]           = useState("all");
  const [editTarget, setEditTarget]   = useState(null);
  const [newStatus, setNewStatus]     = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [alert, setAlert]             = useState({ type: "", message: "" });
    const [showModal, setShowModal]         = useState(false);
const [form, setForm]                   = useState(initialForm);
const [fieldErrors, setFieldErrors]     = useState({});
  // const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);
const [statusTarget, setStatusTarget] = useState(null);


  useEffect(() => {
    getAllTasks();
    
  }, []);

  
  // const employeeOptions = users.map((u) => ({
  //   value: u.id,
  //   label: `${u.name} (${u.employee_id})`,
  // }));
  // console.log("🚀 ~ MyTasks ~ employeeOptions:", employeeOptions)


  const filtered = filter === "all"
    ? tasks
    : tasks.filter((t) => t.status === filter);

// update status open/close
const openStatusModal = (task) => {
  setStatusTarget(task);
  setNewStatus(task.status);
};
const closeStatusModal = () => {
  setStatusTarget(null);
  setNewStatus("");
};

const handleStatusUpdate = async (e) => {
  e.preventDefault();
  try {
    setSubmitting(true);
    await updateTask(statusTarget.id, { status: newStatus });
    await getAllTasks();
    setAlert({ type: "success", message: "Task status updated" });
    closeStatusModal();
  } catch (err) {
    setAlert({ type: "danger", message: err?.response?.data?.message || "Update failed" });
  } finally {
    setSubmitting(false);
  }
};
  // create task
   const openCreateTask = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEditTask = (task) => {
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

  const closeModalTask = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
  };

  const validate = () => {
    const errors = {};
    if (!form.task.trim())   errors.task        = "Task name is required";
   
    return errors;
  };
  const handleSubmitTask = async (e) => {
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

          due_date:    form.due_date    || null,
        });
        setAlert({ type: "success", message: "Task assigned successfully" });
      }
        await getAllTasks(); 
      closeModalTask();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

   const handleChangeTask = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // const handleDeleteTask = async () => {
  //   if (!confirmDelete) return;
  //   try {
  //     setDeleting(true);
  //     await deleteTask(confirmDelete.id);
  //     setAlert({ type: "success", message: "Task deleted" });
  //   } catch (err) {
  //     setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed" });
  //   } finally {
  //     setDeleting(false);
  //     setConfirmDelete(null);
  //   }
  // };



  if (loading && !tasks.length) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">My Tasks</h4>
          <p className="text-muted small mb-0">{tasks.length} total tasks assigned to you</p>
        </div>
        {/* Filter */}
        <div className="d-flex gap-2 align-items-center">
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
  <Button variant="primary" onClick={openCreateTask}>
    + New Task
  </Button>
</div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Tasks */}
      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="mb-0">No tasks found</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((task) => (
            <div key={task.id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">

                  {/* Status + due date */}
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <Badge value={task.status} />
                    <DueDateBadge dueDate={task.due_date} />
                  </div>

                  {/* Task name */}
                  <h6 className="fw-semibold mb-1">{task.task}</h6>

                  {/* Description */}
                  {task.description && (
                    <p className="text-muted small mb-2">{task.description}</p>
                  )}

                  {/* Assigned by */}
                  <p className="text-muted small mb-0">
                    Assigned by:{" "}
                    <span className="fw-medium text-dark">
                      {task.assigner?.name || "—"}
                    </span>
                  </p>

                  {/* Start date */}
                  <p className="text-muted small mb-3">
                    Started: {task.start_date
                      ? new Date(task.start_date).toLocaleDateString()
                      : "—"}
                  </p>

                </div>

                {/* Footer — update status button */}
                {task.status !== "closed" && (
                  <div className="card-footer bg-white border-top">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="w-100"
                      onClick={() => openStatusModal(task)}
                    >
                      Update Status
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        show={showModal}
        onClose={closeModalTask}
        title={editTarget ? "Edit Task" : "Assign Task"}
        size="lg"
      >
        <form onSubmit={handleSubmitTask} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <Input
                label="Task Name"
                name="task"
                value={form.task}
                onChange={handleChangeTask}
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
                onChange={handleChangeTask}
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
      onChange={handleChangeTask}
      options={STATUS_OPTIONS}
      placeholder="Select status"
    />
  </div>
)}


            {/* only show assigned_to on create — can't reassign after creation */}
            {/* {!editTarget && (
              <div className="col-md-6">
                <Select
                  label="Assign To"
                  name="assigned_to"
                  value={form.assigned_to}
                  onChange={handleChangeTask}
                  options={employeeOptions}
                  error={fieldErrors.assigned_to}
                  placeholder="Select employee"
                  required
                />
              </div>
            )} */}

            <div className="col-md-6">
  <Input
    label="Due Date"
    name="due_date"
    type="date"
    value={form.due_date}
    onChange={handleChangeTask}
  />
</div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
            <Button variant="secondary" onClick={closeModalTask} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editTarget ? "Update Task" : "Assign Task"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update status modal */}
      <Modal show={!!statusTarget} onClose={closeStatusModal} title="Update Task Status" size="sm">
  <form onSubmit={handleStatusUpdate} noValidate>
    <p className="fw-semibold mb-3">{statusTarget?.task}</p>
    <Select
      label="Status"
      value={newStatus}
      onChange={(e) => setNewStatus(e.target.value)}
      options={STATUS_OPTIONS.filter((o) =>
        statusTarget?.status === "ongoing" ? o.value !== "open" : true
      )}
      required
    />
    <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
      <Button variant="secondary" onClick={closeStatusModal} disabled={submitting}>Cancel</Button>
      <Button type="submit" variant="primary" loading={submitting}>Update</Button>
    </div>
  </form>
</Modal>
    </div>
  );
};

export default MyTasks;