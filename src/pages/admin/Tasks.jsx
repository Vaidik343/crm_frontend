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
  import {
    MdAdd,
    MdAssignment,
    MdEdit,
    MdDelete,
    MdFolder,
    MdPerson,
    MdVisibility,
    MdSearch 
  } from "react-icons/md";

  const initialForm = {
    task: "",
    description: "",
    project_id: "",
    call_id: "",
    assigned_to: "",
    due_date: "",
    status: "open",
    remarks: "",
  };

  const Tasks = () => {
    const {
      tasks,
      loading,
      page,
      setPage,
      totalPages,
      getAllTasks,
      createTask,
      updateTask,
      deleteTask,
    } = useTask();
    const { users, getAllUsers } = useUser();
    const { projects, getAllProjects } = useProject();
    const { calls, getAllCalls } = useCall();

    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
      const [viewTarget, setViewTarget]       = useState(null);
    const [form, setForm] = useState(initialForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [filter, setFilter] = useState("");

      const [remarksTarget, setRemarksTarget] = useState(null);
    const [remarkText, setRemarkText]       = useState("");
    const [remarkSubmitting, setRemarkSubmitting] = useState(false);
    const [showNewRemark, setShowNewRemark] = useState(false);
    
    useEffect(() => {
      getAllTasks?.(page);
      getAllUsers?.();
      getAllProjects?.();
      getAllCalls?.();
    }, [page]);

    // filter
const search = filter.toLowerCase().trim();

const filtered = search
  ? (tasks || []).filter((t) =>
      t.task?.toLowerCase().includes(search) ||
      t.display_id?.toLowerCase().includes(search) ||
      // t.assignee?.name?.toLowerCase().includes(search) ||
      // t.assigner?.name?.toLowerCase().includes(search) ||
      t.project?.name?.toLowerCase().includes(search)
    )
  : (tasks || []);
    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    };


    const validate = () => {
      
      const errors = {};
      if (!form.task.trim()) errors.task = "Task name is required";
      
      return errors;
    };
    // console.log("🚀 ~ validate ~ validate:", validate)

    const openCreate = () => {
      setEditTarget(null);
      setForm(initialForm);
      setFieldErrors({});
      setShowModal(true);
    };
 
    const openEdit = (task) => {

  //     console.log("RAW TASK:", task);
  // console.log("RAW DUE DATE:", task.due_date);
  // console.log("PARSED:", new Date(task.due_date));

      setEditTarget(task);
      setForm({
        task: task.task || "",
        description: task.description || "",
        // team_id: task.team_id || "",
        project_id: task.project_id || "",
        call_id: task.call_id || "",
        assigned_to: task.assigned_to || "",
        due_date: task.due_date
          ? new Date(task.due_date).toISOString().split("T")[0]
          : null,
        status: task.status || "open",
        remarks:      "",
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
      console.log("🚀 ~ handleSubmit ~ errors:", errors)
      if (Object.keys(errors).length) {
        setFieldErrors(errors);
        return;
      }

      try {
        setSubmitting(true);
//         console.log("FORM BEFORE UPDATE:", form);
// console.log("FORM DUE DATE:", form.due_date);
// console.log("TYPE:", typeof form.due_date);

        if (editTarget) {
        const updated =  await updateTask(editTarget.id, form);
        console.log("🚀 ~ handleSubmit ~ updated:", updated)

          if(viewTarget?.id === editTarget.id)
          {
            setViewTarget(updated.task ||updated)
          }
          setAlert({ type: "success", message: "Task updated successfully" });
        } else {
          const payload = {
            task: form.task,
            description: form.description || null,
            team_id: form.team_id,
            project_id: form.project_id || null,
            call_id: form.call_id || null,
            assigned_to: form.assigned_to,
            due_date: form.due_date || null,
              remarks:      form.remarks || null,
          };
          await createTask(payload);
          setAlert({ type: "success", message: "Task created successfully" });
        }
        closeModal();
        getAllTasks?.(page);
      } catch (err) {
        setAlert({
          type: "danger",
          message: err?.response?.data?.message || "Operation failed",
        });
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
        setAlert({
          type: "danger",
          message: err?.response?.data?.message || "Delete failed",
        });
      } finally {
        setDeleting(false);
        setConfirmDelete(null);
      }
    };


    
    if (loading && !tasks.length)
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Spinner size="lg" />
          <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
            Loading tasks...
          </p>
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
            <p className="text-slate-500 font-bold text-base">
              Total Tasks: {tasks.length}
            </p>
          </div> 

          <div className="relative w-full md:w-95">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <MdSearch size={20} />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 focus:border-[#132ea7] transition-all shadow-sm"
                      placeholder="Search Tasks Display Id and Projects..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </div>
          <Button
            variant="primary"
            className="shadow-lg shadow-[#132ea7]/20 py-3 px-8 rounded h-[52px] font-black uppercase tracking-widest text-sm"
            onClick={openCreate}
          >
            <MdAdd size={22} /> Add New Task
          </Button>
        </div>

        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
        />

        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Display ID</th>
                    <th className="px-10 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Task
                    </th>
                    <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Status
                    </th>
                    <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Assigned By
                    </th>
                    <th className="px-6 py-5 text-md font-black text-slate-400 uppercase tracking-[0.2em]">Assigned To</th>


                    <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Project
                    </th>
                    <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Due Date
                    </th>
                    <th className="px-10 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest"
                      >
                        No tasks found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
  {/* Display ID */}
                      <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[11px] font-black uppercase tracking-widest font-mono">
                        {task.display_id || "—"}
                      </span>
                    </td> 

                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center font-black shadow-lg shadow-[#132ea7]/10">
                            <MdAssignment size={18} />
                          </div>
                          <div>
                            {/* task */}
                            <div className="font-black text-slate-800 text-lg leading-tight">
                              {task.task}
                            </div>
                            {task.description && (
                              <div className="text-xs font-bold text-slate-400 mt-1 truncate max-w-[200px] italic">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6">
                        <Badge value={task.status} />
                      </td>

                          {/* Assigned by */}
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px]">
                          {task.assigner?.name?.charAt(0) || "?"}
                        </div>
                        <div className="text-sm font-black text-slate-700">{task.assigner?.name || "—"}</div>
                      </div>
                    </td>


  {/* assign to */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px]">
                            {task.assignee?.name?.charAt(0) || "?"}
                          </div>
                          <div className="text-sm font-black text-slate-600">
                              {task.assignee?.name || "—"}
                            
                            < div className="text-[10px] font-bold text-slate-400 uppercase">
                              {task.assignee?.employee_id || ""}
                            </div>
                          </div>
                        </div>
                      </td>


                      {/* <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-600">
                          {task.team?.name || "—"}
                        </span>
                      </td> */}

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <MdFolder className="text-slate-300" size={18} />
                          {task.project?.name || "—"}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <DueDateBadge dueDate={task.due_date} />
                      </td>
 
                      
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                                          <button onClick={() => setViewTarget(task)} title="View" className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all">
                                          <MdVisibility size={18} />
                                        </button>
                          <button
                            onClick={() => openEdit(task)}
                            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
                          >
                            <MdEdit size={20} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(task)}
                            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                          >
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
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? "bg-[#132ea7] text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    {i + 1}
                  </button>
                ))}
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
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold">
              No tasks found.
            </div>
          ) : (
            filtered.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center shrink-0">
                      <MdAssignment size={18} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 leading-tight">{task.task}</p>
                      <p className="text-[10px] font-black text-slate-400 font-mono mt-0.5">{task.display_id}</p>
                    </div>
                  </div>
                  <Badge value={task.status} />
                </div>

                {task.description && (
                  <p className="text-xs text-slate-400 font-medium italic px-1 truncate">{task.description}</p>
                )}

                {/* Meta */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Assigned By</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[9px]">{task.assigner?.name?.charAt(0) || "?"}</div>
                      <span className="font-bold text-slate-700 text-xs">{task.assigner?.name || "—"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Assigned To</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[9px]">{task.assignee?.name?.charAt(0) || "?"}</div>
                      <span className="font-bold text-slate-700 text-xs">{task.assignee?.name || "—"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Project</span>
                    <div className="flex items-center gap-1.5">
                      <MdFolder className="text-slate-300" size={14} />
                      <span className="font-bold text-slate-700 text-xs">{task.project?.name || "—"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Due</span>
                    <DueDateBadge dueDate={task.due_date} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setViewTarget(task)} className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all">
                    <MdVisibility size={16} /> View
                  </button>
                  <button onClick={() => openEdit(task)} className="flex-1 h-10 rounded-xl bg-[#132ea7]/10 text-[#132ea7] font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/20 transition-all">
                    <MdEdit size={16} /> Edit
                  </button>
                  <button onClick={() => setConfirmDelete(task)} className="flex-1 h-10 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-red-100 transition-all">
                    <MdDelete size={16} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">Prev</button>
              <span className="text-sm font-bold text-slate-500">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">Next</button>
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
          <Modal show={showModal} onClose={closeModal} title={editTarget ? "Edit Task" : "New Task"} size="lg">

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Task name */}
              <div className="md:col-span-2">
                <Input label="Task Name" name="task" value={form.task} onChange={handleChange}
                  error={fieldErrors.task} placeholder="e.g. Fix login bug" required />
              </div>

              {/* Assign to — any employee, optional (blank = self) */}
              {!editTarget && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                    Assign To <span className="text-slate-300 font-bold normal-case tracking-normal">(blank = self)</span>
                  </label>
                  <select name="assigned_to" value={form.assigned_to} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all">
                    <option value="">Self Assign</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.employee_id})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Project */}
              {!editTarget && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Project</label>
                  <select name="project_id" value={form.project_id} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all">
                    <option value="">No Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} {p.code ? `(${p.code})` : ""}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Linked Call */}
              {!editTarget && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Linked Call (Optional)</label>
                  <select name="call_id" value={form.call_id} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all">
                    <option value="">No Linked Call</option>
                    {calls.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.display_id ? `[${c.display_id}] ` : ""}{c.caller_name} — {c.call_type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Due Date */}
              <Input label="Due Date" name="due_date" type="date" value={form.due_date} onChange={handleChange} />

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Status</label>
                <div className="flex flex-wrap gap-2">
                  {(editTarget ? ["open", "ongoing", "closed"] : ["open", "ongoing"]).map((s) => (
                    <button key={s} type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                        ${form.status === s ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <Textarea label="Description" name="description" value={form.description}
                  onChange={handleChange} placeholder="Scope and requirements..." rows={3} />
              </div>

                        {/* Remarks section in edit modal */}
  <div className="md:col-span-2 space-y-3">
    <div className="flex items-center justify-between ml-1">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
        Remarks
      </label>
      {/* + button to toggle new remark input */}
      <button
        type="button"
        onClick={() => setShowNewRemark((prev) => !prev)}
        className="flex items-center gap-1 px-3 py-1.5 bg-[#132ea7]/10 text-[#132ea7] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#132ea7]/20 transition-all"
      >
        <MdAdd size={14} />
        {showNewRemark ? "Cancel" : "Add Remark"}
      </button>
    </div>

    {/* Existing remarks log */}
    {Array.isArray(editTarget?.remarks) && editTarget.remarks.length > 0 ? (
      <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
        {[...editTarget.remarks].reverse().map((r, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm font-bold text-slate-700">{r.text}</p>
            <div className="flex justify-between mt-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {r.added_by_name}
              </p>
              <p className="text-[10px] font-bold text-slate-300">
                {new Date(r.created_at).toLocaleString("default", {
                  month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit"
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      editTarget && (
        <p className="text-xs font-bold text-slate-400 text-center py-3">No remarks yet</p>
      )
    )}

    {/* New remark input — shown when + is clicked */}
    {showNewRemark && (
      <Textarea
        name="remark"
        value={form.remark}
        onChange={handleChange}
        placeholder="Add a new remark..."
        rows={2}
      />
    )}

    {/* On create — always show the textarea */}
    {/* {!editTarget && (
      <Textarea
        label="Initial Remark (optional)"
        name="remark"
        value={form.remark}
        onChange={handleChange}
        placeholder="Add a remark..."
        rows={2}
      />
    )} */}
  </div>
            </div>

            {/* Self-assign info */}
            {!editTarget && !form.assigned_to && (
              <div className="bg-[#132ea7]/5 border border-[#132ea7]/10 rounded-2xl px-5 py-3">
                <p className="text-xs font-black text-[#132ea7] uppercase tracking-widest">
                  No assignee selected — task will be self-assigned. Display ID prefix: T
                </p>
              </div>
            )}
            {!editTarget && form.assigned_to && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3">
                <p className="text-xs font-black text-amber-600 uppercase tracking-widest">
                  Assigning to another employee. Display ID prefix: TA
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-5 border-t border-slate-50">
              <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm" loading={submitting}>
                {editTarget ? "Update Task" : "Create Task"}
                
              </Button>
            </div>
          </form>
        </Modal>

        {/* ── View Modal ───────────────────────────────────────────── */}
        <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Task Details" size="lg">
          {viewTarget && (
            <div className="space-y-6 py-2">

              {/* Header */}
              <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center shrink-0 shadow-xl shadow-[#132ea7]/20">
                  <MdAssignment size={26} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-black text-slate-800">{viewTarget.task}</h3>
                    <Badge value={viewTarget.status} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
                    {viewTarget.display_id || "No display ID"}
                  </p>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Assigned To", value: viewTarget.assignee?.name || "—" },
                  { label: "Assigned By", value: viewTarget.assigner?.name || "—" },
                  { label: "Project", value: viewTarget.project?.name || "—" },
                  { label: "Due Date", value: viewTarget.due_date ? new Date(viewTarget.due_date).toLocaleDateString() : "—" },
                  { label: "Start Date", value: viewTarget.start_date ? new Date(viewTarget.start_date).toLocaleDateString() : "—" },
                  // { label: "Created", value: new Date(viewTarget.createdAt).toLocaleDateString() },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-black text-slate-700 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {viewTarget.description && (
                <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Description</p>
                  <p className="font-medium leading-relaxed opacity-90">{viewTarget.description}</p>
                </div>
              )}

            {/* Remarks log */}
              {viewTarget.remarks && Array.isArray(viewTarget.remarks) && viewTarget.remarks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Remarks ({viewTarget.remarks.length})
                  </p>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                    {[...viewTarget.remarks].reverse().map((r, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm font-bold text-slate-700">{r.text}</p>
                        <div className="flex justify-between mt-1.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase">{r.added_by_name}</p>
                          <p className="text-[10px] font-bold text-slate-300">
                            {new Date(r.created_at).toLocaleString("default", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="ghost" onClick={() => setViewTarget(null)} className="font-black uppercase tracking-widest text-xs">Close</Button>
              </div>
            </div>
          )}
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
