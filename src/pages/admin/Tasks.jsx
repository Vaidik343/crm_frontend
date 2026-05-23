import { useEffect, useState } from "react";
import { useTask } from "../../context/TaskContext";
import { useUser } from "../../context/UserContext";
import { useProject } from "../../context/ProjectContext";
import { useCall } from "../../context/CallContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Badge, { DueDateBadge } from "../../components/ui/Badge";

import { MdAdd, MdAssignment, MdEdit, MdDelete, MdPerson, MdFolder, MdCalendarToday } from "react-icons/md";

const initialForm = {
  task: "",
  description: "",
  assigned_to: "",
  project_id: "",
  call_id: "",
  due_date: "",
  status: "open",
};

const Tasks = () => {
  const { tasks, loading, page,setPage,
  totalPages, getAllTasks, createTask, updateTask, deleteTask } = useTask();
  const { users, getAllUsers } = useUser();
  const { projects, getAllProjects } = useProject();
  const { calls, getAllCalls } = useCall();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getAllTasks?.(page);
    getAllUsers?.();
    getAllProjects?.();
    getAllCalls?.();
  }, [page]);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.task.trim()) errors.task = "Task name is required";
    if (!form.assigned_to) errors.assigned_to = "Employee assignment is required";
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
      task: task.task,
      description: task.description || "",
      assigned_to: task.assigned_to,
      project_id: task.project_id || "",
      call_id: task.call_id || "",
      due_date: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "" ,
      status: task.status,
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

  const payload = {
  ...form,
  due_date: form.due_date || null,
  assigned_to: form.assigned_to || null,
  call_id: form.call_id || null,
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateTask(editTarget.id, form);
        setAlert({ type: "success", message: "Task updated successfully" });
      } else {
        await createTask(payload);
        setAlert({ type: "success", message: "New task deployed" });
      }
      closeModal();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Operation failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteTask(confirmDelete.id);
      setAlert({ type: "success", message: "Task record purged" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Purge failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (loading && !tasks.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Syncing mission data...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            Task <span className="text-[#132ea7]">Board</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Total Tasks: {tasks.length} </p>
        </div>
        <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 py-3 px-8 rounded h-[52px] font-black uppercase tracking-widest text-sm" onClick={openCreate}>
          <MdAdd size={22} />
          Add New Task
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Tasks Table Container */}
      <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Task Objective</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Employee</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Project</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">No active tasks found.</td>
                </tr>
              )}
              {tasks.map((task) => {
                // Fix: Use == to ignore type mismatches between string IDs and number IDs
                const projectName = task.Project?.name || projects.find(p => p.id == task.project_id)?.name || "-";
                const employeeName = task.Assignee?.name || users.find(u => u.id == task.assigned_to)?.name || "—";

                return (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center font-black text-base shadow-lg shadow-[#132ea7]/10">
                          <MdAssignment size={18} />
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-lg leading-tight">{task.task}</div>
                          {task.description && (
                            <div className="text-xs font-bold text-slate-400 mt-1 truncate max-w-[200px] italic">{task.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge value={task.status} />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px] uppercase">
                          {employeeName.charAt(0)}
                        </div>
                        <span className="text-sm font-black text-slate-600">{employeeName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <MdFolder className="text-slate-300" size={18} />
                        {projectName}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {/* Fix: Restored the DueDateBadge usage to show 48h warning and hour countdown */}
                      <DueDateBadge dueDate={task.due_date} />
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(task)}
                          title="Edit Task"
                          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(task)}
                          title="Delete Task"
                          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            
          </table>

        </div>
          {/* pagination */}
          {/* Pagination */}
<div className="flex items-center justify-between px-4 py-6">
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
  >
    Previous
  </button>

  <div className="flex items-center gap-2">
    {[...Array(totalPages)].map((_, i) => {
      const pageNum = i + 1;

      return (
        <button
          key={pageNum}
          onClick={() => setPage(pageNum)}
          className={`w-10 h-10 rounded-xl font-bold transition-all ${
            page === pageNum
              ? "bg-[#132ea7] text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {pageNum}
        </button>
      );
    })}
  </div>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
  >
    Next
  </button>
</div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Modify Task Profile" : "Create New Task"}
        size="lg"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Task Name"
              name="task"
              value={form.task}
              onChange={handleChange}
              error={fieldErrors.task}
              placeholder="e.g. Database Synchronization"
              required
            />
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Assign TO</label>
              <select
                name="assigned_to"
                value={form.assigned_to}
                onChange={handleChange}
                className={`w-full bg-slate-50 border ${fieldErrors.assigned_to ? 'border-red-500' : 'border-slate-100'} rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none`}
              >
                <option value="">Select Employee</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.employee_id})</option>
                ))}
              </select>
              {fieldErrors.assigned_to && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{fieldErrors.assigned_to}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Parent Project</label>
              <select
                name="project_id"
                value={form.project_id}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none"
              >
                <option value="">No Associated Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Linked Call (Optional)</label>
              <select
                name="call_id"
                value={form.call_id}
                onChange={handleChange}
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
              label="Operational Deadline"
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
            />
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Current Status</label>
              <div className="flex flex-wrap gap-3">
                {["open", "ongoing", "closed",].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, status: s }))}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.status === s ? 'bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Textarea
            label="Task Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Define the scope and requirements..."
            rows={4}
          />

          <div className="flex gap-4 pt-8 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>Abort</Button>
            <Button type="submit" variant="primary" className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-widest text-sm" loading={submitting}>
              {editTarget ? "Authorize Update" : "Deploy Task"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`This action will permanently purge the task "${confirmDelete?.task}" from the system.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Tasks;