import { useEffect, useState, useMemo } from "react";
import { useTask } from "../../context/TaskContext";
import { useUser } from "../../context/UserContext";
import { useProject } from "../../context/ProjectContext";
import { useCall } from "../../context/CallContext";
import { useTeam } from "../../context/TeamContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Badge, { DueDateBadge } from "../../components/ui/Badge";
import { MdAdd, MdAssignment, MdEdit, MdDelete, MdFolder, MdPerson } from "react-icons/md";

const initialForm = {
  task:        "",
  description: "",
  team_id:     "",
  project_id:  "",
  call_id:     "",
  assigned_to: "",
  due_date:    "", 
  status:      "open",
};

const Tasks = () => {
  const { tasks, loading, page, setPage, totalPages, getAllTasks, createTask, updateTask, deleteTask } = useTask();
  const { users, getAllUsers } = useUser();
  const { projects, getAllProjects } = useProject();
  const { calls, getAllCalls } = useCall();
  const { teams, getAllTeams } = useTeam();
  console.log("🚀 ~ Tasks ~ teams:", teams)

  const [showModal, setShowModal]         = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [form, setForm]                   = useState(initialForm);
  const [fieldErrors, setFieldErrors]     = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [alert, setAlert]                 = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    getAllTasks?.(page);
    getAllUsers?.();
    getAllProjects?.();
    getAllCalls?.();
    getAllTeams?.(); 
  }, [page]);

  // ── Derived: selected team ────────────────────────────────────────────────
  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === form.team_id),
    [teams, form.team_id]
  );
  // console.log("🚀 ~ Tasks ~ selectedTeam:", selectedTeam)

  // Members of selected team
  const teamMembers = useMemo(() => {
    if (!selectedTeam) return [];
    const memberships = selectedTeam.team_memberships || selectedTeam.TeamMembers || [];
    return memberships
      .filter((m) => m.is_active !== false)
      .map((m) => m.user || m.User)
      .filter(Boolean);
  }, [selectedTeam]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "team_id") {
      // Reset project and assignee when team changes
      setForm((prev) => ({ ...prev, team_id: value, project_id: "", assigned_to: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.task.trim())   errors.task    = "Task name is required";
    if (!form.team_id)       errors.team_id = "Team is required";
    if (!form.assigned_to)   errors.assigned_to = "Assignee is required";
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
      task:        task.task || "",
      description: task.description || "",
      team_id:     task.team_id || "",
      project_id:  task.project_id || "",
      call_id:     task.call_id || "",
      assigned_to: task.assigned_to || "",
      due_date:    task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "",
      status:      task.status || "open",
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
          due_date:    form.due_date || null,
          status:      form.status,
        });
        setAlert({ type: "success", message: "Task updated successfully" });
      } else {
        const payload = {
          task:        form.task,
          description: form.description || null,
          team_id:     form.team_id,
          project_id:  form.project_id || null,
          call_id:     form.call_id || null,
          assigned_to: form.assigned_to,
          due_date:    form.due_date || null,
        };
        await createTask(payload);
        setAlert({ type: "success", message: "Task created successfully" });
      }
      closeModal();
      getAllTasks?.(page);
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
      setAlert({ type: "success", message: "Task deleted" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (loading && !tasks.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Loading tasks...</p>
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
          <p className="text-slate-500 font-bold text-base">Total Tasks: {tasks.length}</p>
        </div>
        <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 py-3 px-8 rounded h-[52px] font-black uppercase tracking-widest text-sm" onClick={openCreate}>
          <MdAdd size={22} /> Add New Task
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Table */}
      <div className="d-none d-md-block">
      <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Task</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Assigned To</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Team</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Project</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">No tasks found.</td>
                </tr>
              )}
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center font-black shadow-lg shadow-[#132ea7]/10">
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
                  <td className="px-8 py-6"><Badge value={task.status} /></td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px]">
                        {task.assignee?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-600">{task.assignee?.name || "—"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{task.assignee?.employee_id || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-600">{task.team?.name || "—"}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <MdFolder className="text-slate-300" size={18} />
                      {task.project?.name || "—"}
                    </div>
                  </td>
                  <td className="px-8 py-6"><DueDateBadge dueDate={task.due_date} /></td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(task)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all">
                        <MdEdit size={20} />
                      </button>
                      <button onClick={() => setConfirmDelete(task)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
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

        {/* Mobile Pagination */}
<div className="d-flex d-md-none justify-content-between align-items-center mt-4">
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
  >
    Prev
  </button>

  <span className="text-sm font-bold text-slate-500">
    {page} / {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
  >
    Next
  </button>
</div>

      </div>
      </div>


{/* Mobile Cards */}
<div className="d-block d-md-none space-y-4">
  {tasks.length === 0 ? (
    <div className="bg-white rounded-4 p-4 text-center text-slate-400 font-bold">
      No tasks found.
    </div>
  ) : (
    tasks.map((task) => (
      <div
        key={task.id}
        className="bg-white rounded-4 p-4 border border-slate-100 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-3 bg-[#132ea7] text-white flex items-center justify-center">
              <MdAssignment size={20} />
            </div>

            <div>
              <h4 className="font-black text-slate-800 text-base leading-tight">
                {task.task}
              </h4>

              {task.description && (
                <p className="text-xs text-slate-400 mt-1">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <Badge value={task.status} />
        </div>

        {/* Info */}
        <div className="space-y-3 text-sm">
          {/* Assignee */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase text-[10px]">
              Assigned
            </span>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px]">
                {task.assignee?.name?.charAt(0) || "?"}
              </div>

              <span className="font-bold text-slate-700">
                {task.assignee?.name || "—"}
              </span>
            </div>
          </div>

          {/* Team */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase text-[10px]">
              Team
            </span>

            <span className="font-bold text-slate-700">
              {task.team?.name || "—"}
            </span>
          </div>

          {/* Project */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase text-[10px]">
              Project
            </span>

            <span className="font-bold text-slate-700">
              {task.project?.name || "—"}
            </span>
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase text-[10px]">
              Due
            </span>

            <DueDateBadge dueDate={task.due_date} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => openEdit(task)}
            className="flex-1 h-11 rounded-3 bg-[#132ea7]/10 text-[#132ea7] font-bold flex items-center justify-center gap-2"
          >
            <MdEdit size={18} />
            Edit
          </button>

          <button
            onClick={() => setConfirmDelete(task)}
            className="flex-1 h-11 rounded-3 bg-red-50 text-red-500 font-bold flex items-center justify-center gap-2"
          >
            <MdDelete size={18} />
            Delete
          </button>
        </div>
      </div>
    ))
  )}
</div>



      {/* Create / Edit Modal */}
      <Modal show={showModal} onClose={closeModal} title={editTarget ? "Edit Task" : "Create New Task"} size="lg">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Task Name */}
            <div className="md:col-span-2">
              <Input label="Task Name" name="task" value={form.task} onChange={handleChange}
                error={fieldErrors.task} placeholder="e.g. Fix login bug" required />
            </div>

            {/* Team — only on create */}
            {!editTarget && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                  Team <span className="text-red-500">*</span>
                </label>
                <select name="team_id" value={form.team_id} onChange={handleChange}
                  className={`w-full bg-slate-50 border ${fieldErrors.team_id ? "border-red-500" : "border-slate-100"} rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none`}
                >
                  <option value="">Select Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {fieldErrors.team_id && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{fieldErrors.team_id}</p>}
              </div>
            )}

            {/* Assign To — filtered by team members */}
            {!editTarget && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <select name="assigned_to" value={form.assigned_to} onChange={handleChange}
                  disabled={!form.team_id}
                  className={`w-full bg-slate-50 border ${fieldErrors.assigned_to ? "border-red-500" : "border-slate-100"} rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none disabled:opacity-50`}
                >
                  <option value="">Select Team Member</option>
                  {teamMembers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.employee_id})</option>
                  ))}
                </select>
                {fieldErrors.assigned_to && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{fieldErrors.assigned_to}</p>}
                {form.team_id && teamMembers.length === 0 && (
                  <p className="text-amber-500 text-[10px] font-bold mt-1 ml-1 uppercase">No members in this team yet</p>
                )}
              </div>
            )}

            {/* Project — filtered by team's project */}
            {!editTarget && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Project</label>
                <select name="project_id" value={form.project_id} onChange={handleChange}
                  disabled={!form.team_id}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none disabled:opacity-50"
                >
                  <option value="">No Project</option>
                  {selectedTeam?.project_id && projects.filter((p) => p.id === selectedTeam.project_id).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {form.team_id && !selectedTeam?.project_id && (
                  <p className="text-amber-500 text-[10px] font-bold mt-1 ml-1 uppercase">This team has no linked project</p>
                )}
              </div>
            )}

            {/* Linked Call */}
            {!editTarget && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Linked Call (Optional)</label>
                <select name="call_id" value={form.call_id} onChange={handleChange}
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
            )}

            {/* Due Date */}
            <Input label="Due Date" name="due_date" type="date" value={form.due_date} onChange={handleChange} />

            {/* Status */}
            <div className={editTarget ? "" : ""}>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Status</label>
                <div className="flex flex-wrap gap-3">
                  {(editTarget ? ["open", "ongoing", "closed"] : ["open", "ongoing"]).map((s) => (
                    <button key={s} type="button" onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                      className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.status === s ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div> 
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Textarea label="Description" name="description" value={form.description} onChange={handleChange}
                placeholder="Define the scope and requirements..." rows={3} />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm" loading={submitting}>
              {editTarget ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </Modal>

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
