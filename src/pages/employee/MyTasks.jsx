import { useEffect, useState } from "react";
import { useTask } from "../../context/TaskContext";
import Badge, { DueDateBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Spinner from "../../components/ui/Spinner";
import { MdAssignment, MdEdit, MdAdd } from "react-icons/md";
import { useCall } from "../../context/CallContext";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "ongoing", label: "Ongoing" },
  { value: "closed", label: "Closed" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "ongoing", label: "Ongoing" },
  { value: "closed", label: "Closed" },
];

const initialCreateForm = {
  task: "",
  description: "",
  call_id: "",
  due_date: "",
  status: "ongoing",
};

const MyTasks = () => {
  const { tasks, loading, getAllTasks, updateTask, createTask } = useTask();
  const { calls, getAllCalls } = useCall();

  const [filter, setFilter] = useState("all");
  const [editTarget, setEditTarget] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [fieldErrors, setFieldErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    getAllTasks?.();
    getAllCalls?.();
  }, []);

  const filtered = filter === "all"
    ? tasks
    : tasks.filter((t) => t.status === filter);

  const openEdit = (task) => {
    setEditTarget(task);
    setNewStatus(task.status);
  };

  const closeModal = () => {
    setEditTarget(null);
    setNewStatus("");
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updateTask(editTarget.id, { status: newStatus });
      setAlert({ type: "success", message: "Task status updated" });
      closeModal();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Update failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    console.log("🚀 ~ handleCreateChange ~ name, value :", name, value )
    setCreateForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

 
  const handleCreateSubmit = async (e) => {
  e.preventDefault();

  const errors = {};

  if (!createForm.task.trim()) {
    errors.task = "Task name is required";
  }

  if (Object.keys(errors).length) {
    setFieldErrors(errors);
    return;
  }

  try {
    setSubmitting(true);

    const payload = {
      ...createForm,
      due_date: createForm.due_date || null,
    };

   const ct = await createTask(payload);
   console.log("🚀 ~ handleCreateSubmit ~ ct:", ct)

    setAlert({
      type: "success",
      message: "New task deployed successfully",
    });

    setShowCreateModal(false);
    setCreateForm(initialCreateForm);

  } catch (err) {
     console.log("🚀 ~ handleCreateSubmit ~ err:", err)
    setAlert({
      type: "danger",
      message:
        err?.response?.data?.message ||
        "Failed to deploy task",
    });
  } finally {
    setSubmitting(false);
  }
};
  if (loading && !tasks.length) return <Spinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            My <span className="text-[#132ea7]">Tasks</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">{tasks.length} total tasks assigned to you</p>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="w-40">
            <select
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 transition-all shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 py-3.5 px-8 rounded font-black uppercase tracking-widest text-xs" onClick={() => setShowCreateModal(true)}>
            <MdAdd size={20} /> Create Task
          </Button>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Tasks List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-slate-300 py-16 text-center shadow-sm">
          <MdAssignment size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => (
            <div key={task.id} className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6">

                {/* Main Content */}
                <div className="flex-grow space-y-3">
                  {/* Status + due date */}
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Badge value={task.status} />
                    <DueDateBadge dueDate={task.due_date} />
                  </div>

                  {/* Task name */}
                  <h6 className="text-xl font-black text-slate-800 leading-tight">{task.task}</h6>

                  {/* Description */}
                  {task.description && (
                    <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap">
                      {task.description}
                    </p>
                  )}

                  {/* Meta Details */}
                  <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Assigned by: <span className="text-[#132ea7]">{task.assigner?.name || "—"}</span>
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Started: <span className="text-slate-600">{task.start_date ? new Date(task.start_date).toLocaleDateString() : "—"}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {task.status !== "closed" && (
                  <div className="flex items-start md:items-center md:flex-col gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
                    <button
                      onClick={() => openEdit(task)}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-[#132ea7]/5 text-[#132ea7] hover:bg-[#132ea7] hover:text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                    >
                      <MdEdit size={16} /> Update Status
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update status modal */}
      <Modal
        show={!!editTarget}
        onClose={closeModal}
        title="Update Task Status"
        size="sm"
      >
        <form onSubmit={handleStatusUpdate} noValidate className="space-y-6 pt-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-sm font-black text-slate-700">{editTarget?.task}</p>
          </div>

          <Select
            label="Status"
            name="status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={STATUS_OPTIONS.filter((o) =>
              // can't go back to open once ongoing
              editTarget?.status === "ongoing" ? o.value !== "open" : true
            )}
            required
          />
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-50">
            <Button variant="ghost" className="font-black uppercase tracking-widest text-xs" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-black uppercase tracking-widest text-xs shadow-lg shadow-[#132ea7]/20" loading={submitting}>
              Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Deploy New Task"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} noValidate className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Task Objective"
                name="task"
                value={createForm.task}
                onChange={handleCreateChange}
                error={fieldErrors.task}
                placeholder="Brief title for the task..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="Detailed Description"
                name="description"
                value={createForm.description}
                onChange={handleCreateChange}
                placeholder="Operational instructions and details..."
                rows={4}
              />
            </div>

            <div className="md:col-span-2 space-y-2.5 mb-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Current Status</label>
              <div className="flex flex-wrap gap-3">
                {["open", "ongoing", "closed",].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCreateForm(prev => ({ ...prev, status: s }))}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${createForm.status === s ? 'bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Linked Call (Optional)</label>
              <select
                name="call_id"
                value={createForm.call_id}
                onChange={handleCreateChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none"
              >
                <option value="">No Linked Call</option>
                {calls.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caller_name} — {c.call_type} ({new Date(c.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Deadline (Optional)"
              name="due_date"
              type="date"
              value={createForm.due_date}
              onChange={handleCreateChange}
            />

            
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-50">
            <Button variant="ghost" className="font-black uppercase tracking-widest text-xs" onClick={() => setShowCreateModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-black uppercase tracking-widest text-xs shadow-lg shadow-[#132ea7]/20" loading={submitting}>
              Deploy Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyTasks;