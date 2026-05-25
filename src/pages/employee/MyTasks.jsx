import { useEffect, useState, useMemo } from "react";
import { useTask } from "../../context/TaskContext";
import { useProject } from "../../context/ProjectContext";
import { useCall } from "../../context/CallContext";
import { useTeam } from "../../context/TeamContext";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Badge, { DueDateBadge } from "../../components/ui/Badge";
import { MdAdd, MdAssignment, MdEdit, MdDelete, MdFolder, MdVisibility, MdCalendarToday, MdInfoOutline } from "react-icons/md";

const initialForm = {
  task:        "",
  description: "",
  team_id:     "",
  project_id:  "",
  call_id:     "",
  due_date:    "",
  status:      "ongoing",
};

const MyTasks = () => {
  const { tasks, loading, page, setPage, totalPages, getAllTasks, createTask, updateTask, deleteTask } = useTask();
  const { projects, getAllProjects } = useProject();
  const { calls, getAllCalls } = useCall();
  const { teams, getAllTeams } = useTeam();
  console.log("🚀 ~ MyTasks ~ getAllTeams:", getAllTeams)
  console.log("🚀 ~ MyTasks ~ teams:", teams)
  const { user } = useAuth();

  const [showModal, setShowModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [viewTarget, setViewTarget]   = useState(null);
  const [form, setForm]               = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [alert, setAlert]             = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    getAllTasks?.(page);
    getAllProjects?.();
    getAllCalls?.();
    getAllTeams?.();
  }, [page]);

  // ── Derived: project that belongs to selected team ────────────────────────
  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === form.team_id),
    [teams, form.team_id]
  );

  // Employee can only assign to themselves — no assigned_to field in employee layout
  // team members for selected team (for info only, not used in create)
  const teamMembers = useMemo(() => {
    if (!selectedTeam) return [];
    return selectedTeam.team_memberships || selectedTeam.TeamMembers || [];
  }, [selectedTeam]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    // When team changes, reset project
    if (name === "team_id") {
      setForm((prev) => ({ ...prev, team_id: value, project_id: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.task.trim()) errors.task    = "Task name is required";
    if (!form.team_id)     errors.team_id = "Team is required";
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
      due_date:    task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "",
      status:      task.status || "ongoing",
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
          due_date:    form.due_date || null,
          // assigned_to omitted → defaults to req.user.id (self-assign)
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
      <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Task</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Team</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Project</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">No tasks found.</td>
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
                      <button onClick={() => setViewTarget(task)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all" title="View Detail">
                        <MdVisibility size={20} />
                      </button>
                      <button onClick={() => openEdit(task)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all" title="Edit">
                        <MdEdit size={20} />
                      </button>
                      <button onClick={() => setConfirmDelete(task)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all" title="Delete">
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
      <Modal show={showModal} onClose={closeModal} title={editTarget ? "Edit Task" : "Create New Task"} size="lg">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Task Name */}
            <div className="md:col-span-2">
              <Input label="Task Name" name="task" value={form.task} onChange={handleChange}
                error={fieldErrors.task} placeholder="e.g. Fix login bug" required />
            </div>

            {/* Team — required, shown only on create */}
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

            {/* Project — filtered by selected team's project */}
            {!editTarget && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Project</label>
                <select name="project_id" value={form.project_id} onChange={handleChange}
                  disabled={!form.team_id}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none disabled:opacity-50"
                >
                  <option value="">No Project</option>
                  {/* Only show the project belonging to selected team */}
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

            {/* Status — only on edit */}
            {editTarget && (
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Status</label>
                <div className="flex flex-wrap gap-3">
                  {["ongoing", "closed"].map((s) => (
                    <button key={s} type="button" onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                      className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.status === s ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="md:col-span-2">
              <Textarea label="Description" name="description" value={form.description} onChange={handleChange}
                placeholder="Define the scope and requirements..." rows={3} />
            </div>
          </div>

          {/* Info box — self assign note */}
          {!editTarget && (
            <div className="bg-[#132ea7]/5 border border-[#132ea7]/10 rounded-2xl px-5 py-4">
              <p className="text-xs font-black text-[#132ea7] uppercase tracking-widest">
                This task will be self-assigned to you
              </p>
            </div>
          )}

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

      {/* View Details Modal */}
      <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Task Details" size="lg">
        {viewTarget && (() => {
          const linkedCall = viewTarget.call_id ? calls.find(c => c.id === viewTarget.call_id) : null;
          return (
            <div className="space-y-8 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-50">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-[2rem] bg-[#132ea7] text-white flex items-center justify-center font-black text-3xl shadow-2xl shadow-[#132ea7]/20">
                    <MdAssignment size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-tight">{viewTarget.task}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge value={viewTarget.status} />
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-2">
                        <MdCalendarToday size={16} className="text-slate-300" />
                        Due Date: <DueDateBadge dueDate={viewTarget.due_date} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <MdFolder size={16} /> Association details
                  </p>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Team: <span className="font-black text-slate-800">{viewTarget.team?.name || "—"}</span>
                  </p>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Project: <span className="font-black text-[#132ea7]">{viewTarget.project?.name || "—"}</span>
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <MdAssignment size={16} /> Assignment & Source
                  </p>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Assignee: <span className="font-black text-slate-800">{viewTarget.assignee?.name || user?.name || "Self"}</span>
                  </p>
                  {linkedCall && (
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-2 border-t border-slate-200/60 pt-2">
                      Linked Call: {linkedCall.caller_name} ({linkedCall.call_subtype})
                    </p>
                  )}
                </div>
              </div>

              {viewTarget.description && (
                <div className="p-10 bg-[#132ea7] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-6">
                    <div>
                      <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <MdInfoOutline size={18} className="text-white/30" /> Detailed Description
                      </p>
                      <p className="text-xl font-medium leading-relaxed opacity-95 italic whitespace-pre-wrap">
                        {viewTarget.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-[80px]" />
                </div>
              )}

              <div className="flex items-center justify-end pt-4">
                <Button variant="ghost" onClick={() => setViewTarget(null)} className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Close</Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default MyTasks;
