// src/features/interns/pages/intern/InternTasks.jsx

import { useEffect, useState } from "react";
import { useIntern } from "../../../../context/InternContext";
import toast from "react-hot-toast";
import {
  MdAdd, MdClose, MdEdit, MdTask,
  MdSearch, MdFilterList,MdAssignment 
} from "react-icons/md";
import { formatDate } from "../../../../utils/formatDate";
import Modal from "../../../../components/ui/Modal";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["open", "ongoing", "hold", "closed"];

const statusColors = {
  open:    "bg-blue-100 text-blue-700",
  ongoing: "bg-amber-100 text-amber-700",
  hold:    "bg-slate-100 text-slate-600",
  closed:  "bg-green-100 text-green-700",
};

const initialForm = {
  task:              "",
  description:       "",
  intern_project_id: "",
  due_date:          "",
  remark:            "",
};

const initialEditForm = {
  task:        "",
  description: "",
  status:      "",
  due_date:    "",
  remark:      "",
};


const formatTimelineDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Today • ${timeStr}`;
  if (isYesterday) return `Yesterday • ${timeStr}`;

  const monthDayStr = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  return `${monthDayStr} • ${timeStr}`;
};
// ── Component ──────────────────────────────────────────────────────────────────

const InternTasks = () => {
  const {
    tasks, tasksLoading, tasksPage, tasksLimit,
    tasksTotal, tasksTotalPages, setTasksPage,
    getMyTasks, createTask, updateTask,
    project, getMyProject,
  } = useIntern();

  // ── Filters ────────────────────────────────────────────────────────────────
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [from, setFrom]             = useState("");
  const [to, setTo]                 = useState("");

  // ── Create modal ───────────────────────────────────────────────────────────
  const [showCreate, setShowCreate]     = useState(false);
  const [form, setForm]                 = useState(initialForm);
  const [formErrors, setFormErrors]     = useState({});
  const [creating, setCreating]         = useState(false);

  // ── Edit modal ─────────────────────────────────────────────────────────────
  const [showEdit, setShowEdit]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [editForm, setEditForm]         = useState(initialEditForm);
  const [editErrors, setEditErrors]     = useState({});
  const [editing, setEditing]           = useState(false);

  // ── View modal (remarks timeline) ─────────────────────────────────────────
  const [showView, setShowView]         = useState(false);
  const [viewTarget, setViewTarget]     = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  // Effect 1 — filters change → reset to page 1
  useEffect(() => {
    setTasksPage(1);
  }, [search, statusFilter, from, to]);

  // Effect 2 — page or filters → fetch
  useEffect(() => {
    getMyTasks(tasksPage, from, to, tasksLimit, search, statusFilter);
  }, [tasksPage, search, statusFilter, from, to]);

  // fetch project for dropdown
  useEffect(() => {
    getMyProject();
  }, []);

  // ── Create handlers ────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateCreate = () => {
    const e = {};
    if (!form.task.trim()) e.task = "Task name is required.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (ev) => {
    ev.preventDefault();
    if (!validateCreate()) return;
    try {
      setCreating(true);
      await createTask({
        task:              form.task.trim(),
        description:       form.description.trim() || null,
        intern_project_id: form.intern_project_id  || null,
        due_date:          form.due_date            || null,
        remark:            form.remark.trim()       || null,
      });
      toast.success("Task created successfully!");
      setShowCreate(false);
      setForm(initialForm);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create task.");
    } finally {
      setCreating(false);
    }
  };

  // ── Edit handlers ──────────────────────────────────────────────────────────
  const openEdit = (t) => {
    setEditTarget(t);
    setEditForm({
      task:        t.task        || "",
      description: t.description || "",
      status:      t.status      || "",
      due_date:    t.due_date    || "",
      remark:      "",
    });
    setEditErrors({});
    setShowEdit(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEdit = () => {
    const e = {};
    if (!editForm.task.trim()) e.task = "Task name is required.";
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = async (ev) => {
    ev.preventDefault();
    if (!validateEdit()) return;
    try {
      setEditing(true);
      await updateTask(editTarget.id, {
        task:        editForm.task.trim(),
        description: editForm.description.trim() || null,
        status:      editForm.status             || undefined,
        due_date:    editForm.due_date           || null,
        remark:      editForm.remark.trim()      || null,
      });
      toast.success("Task updated successfully!");
      setShowEdit(false);
      setEditTarget(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update task.");
    } finally {
      setEditing(false);
    }
  };

  // ── Shared classes ─────────────────────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30 ${
      err ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
    }`;
  const labelCls = "block text-xs font-black uppercase tracking-widest text-slate-500 mb-1";
  const errCls   = "text-xs text-red-500 font-semibold mt-1";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            My Tasks
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            {tasksTotal} task{tasksTotal !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-sm font-black uppercase tracking-widest hover:bg-[#0f2490] transition"
        >
          <MdAdd size={16} /> Add Task
        </button>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Search */}
          <div className="relative">
            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {/* From */}
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
          />

          {/* To */}
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
          />

        </div>
      </div>

      {/* ── Task list ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        {tasksLoading ? (
          <div className="p-12 flex items-center justify-center">
            <p className="text-sm text-slate-400 font-medium">Loading...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
            <MdTask size={32} className="text-slate-200" />
            <p className="text-sm text-slate-400 font-semibold">No tasks found.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["ID", "Task", "Project", "Due Date", "Status", "Type", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-xs font-black text-slate-400 whitespace-nowrap">
                        {t.display_id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-700 truncate max-w-[180px]">{t.task}</p>
                        {t.description && (
                          <p className="text-xs text-slate-400 truncate max-w-[180px] mt-0.5">{t.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {t.project?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {t.due_date ? formatDate(t.due_date) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${statusColors[t.status]}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {t.assigned_by ? (
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                            Admin
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                            Self
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setViewTarget(t); setShowView(true); }}
                            className="text-xs font-black text-[#132ea7] hover:underline uppercase tracking-widest"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEdit(t)}
                            className="text-xs font-black text-[#e98937] hover:underline uppercase tracking-widest"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {tasks.map((t) => (
                <div key={t.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.display_id}</p>
                      <p className="font-black text-slate-700 mt-0.5">{t.task}</p>
                      {t.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                      )}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${statusColors[t.status]}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold flex-wrap">
                    {t.project && <span>📁 {t.project.name}</span>}
                    {t.due_date && <span>📅 {formatDate(t.due_date)}</span>}
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${t.assigned_by ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"}`}>
                      {t.assigned_by ? "Admin" : "Self"}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setViewTarget(t); setShowView(true); }}
                      className="text-xs font-black text-[#132ea7] hover:underline uppercase tracking-widest"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      className="text-xs font-black text-[#e98937] hover:underline uppercase tracking-widest"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {tasksTotalPages > 1 && (
          <div className="px-4 py-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-semibold text-slate-400">
              Page {tasksPage} of {tasksTotalPages} — {tasksTotal} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setTasksPage((p) => Math.max(1, p - 1))}
                disabled={tasksPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Prev
              </button>
              <button
                onClick={() => setTasksPage((p) => Math.min(tasksTotalPages, p + 1))}
                disabled={tasksPage === tasksTotalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Modal ─────────────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[100vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Add Task</h2>
              <button onClick={() => { setShowCreate(false); setForm(initialForm); setFormErrors({}); }} className="text-slate-400 hover:text-slate-600 transition">
                <MdClose size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-6 flex flex-col gap-5">

              {/* Task name */}
              <div>
                <label className={labelCls}>Task Name <span className="text-red-400">*</span></label>
                <input name="task" value={form.task} onChange={handleFormChange} placeholder="e.g. Build login page" className={inputCls(formErrors.task)} />
                {formErrors.task && <p className={errCls}>{formErrors.task}</p>}
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <textarea name="description" value={form.description} onChange={handleFormChange} rows={3} placeholder="Brief description..." className={inputCls(false)} />
              </div>

              {/* Project */}
              <div>
                <label className={labelCls}>Project <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <select name="intern_project_id" value={form.intern_project_id} onChange={handleFormChange} className={inputCls(false)}>
                  <option value="">No project</option>
                  {project && <option value={project.id}>{project.name}</option>}
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className={labelCls}>Due Date <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <input name="due_date" type="date" value={form.due_date} onChange={handleFormChange} className={inputCls(false)} />
              </div>

              {/* Initial remark */}
              <div>
                <label className={labelCls}>Remark <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <textarea name="remark" value={form.remark} onChange={handleFormChange} rows={2} placeholder="Add a note..." className={inputCls(false)} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setForm(initialForm); setFormErrors({}); }}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      {showEdit && editTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Edit Task</h2>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-600 transition">
                <MdClose size={20} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="px-6 py-6 flex flex-col gap-5">

              {/* Task name */}
              <div>
                <label className={labelCls}>Task Name <span className="text-red-400">*</span></label>
                <input name="task" value={editForm.task} onChange={handleEditChange} className={inputCls(editErrors.task)} />
                {editErrors.task && <p className={errCls}>{editErrors.task}</p>}
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} rows={3} className={inputCls(false)} />
              </div>

              {/* Status */}
              <div>
                <label className={labelCls}>Status</label>
                <select name="status" value={editForm.status} onChange={handleEditChange} className={inputCls(false)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className={labelCls}>Due Date <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <input name="due_date" type="date" value={editForm.due_date} onChange={handleEditChange} className={inputCls(false)} />
              </div>

              {/* Add remark */}
              <div>
                <label className={labelCls}>Add Remark <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <textarea name="remark" value={editForm.remark} onChange={handleEditChange} rows={2} placeholder="Add a note..." className={inputCls(false)} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={editing}
                  className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
                  {editing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Modal (remarks timeline) ────────────────────────────────────── */}
  {/* View Details Modal */}
<Modal
  show={!!viewTarget}
  onClose={() => setViewTarget(null)}
  title="Task Details"
  size="lg"
>
  {viewTarget && (
    <div className="space-y-5 py-2">
      {/* Header Info */}
      <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center shrink-0 shadow-xl shadow-[#132ea7]/20">
          <MdAssignment size={26} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-black text-slate-800">
              {viewTarget.task}
            </h3>
            <Badge value={viewTarget.status} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
            {viewTarget.display_id || "—"}
          </p>
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            label: "Assigned To",
            value: viewTarget.assignee?.name || "—",
          },
          {
            label: "Assigned By",
            value: viewTarget.assigner?.name || "—",
          },
          { label: "Project", value: viewTarget.project?.name || "—" },
          {
            label: "Due Date",
            value: formatDate(viewTarget.due_date),
          },
          {
            label: "Start Date",
            value: formatDate(viewTarget.start_date),
          },
          {
            label: "Update Date",
            value: formatDate(viewTarget.updatedAt),
          },
          {
            label: "Completed",
            value: formatDate(viewTarget.completedAt),
          },
        ].map((item) => (
          <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {item.label}
            </p>
            <p className="font-black text-slate-700 text-sm">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Description List */}
      {viewTarget.description && (
        <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
            Description
          </p>
          <ul className="space-y-1 list-disc list-inside opacity-90">
            {viewTarget.description
              .split("\n")
              .filter((line) => line.trim() !== "")
              .map((line, i) => (
                <li key={i} className="font-medium leading-relaxed">
                  {line}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Sub Tasks / Remarks History Timeline */}
      {viewTarget?.remarks &&
        Array.isArray(viewTarget.remarks) &&
        viewTarget.remarks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Sub Tasks History ({viewTarget.remarks.length})
              </p>
            </div>

            <div className="relative pl-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 py-1">
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-slate-200 rounded-full" />

              {[...viewTarget.remarks].reverse().map((r, i) => {
                const isLatest = i === 0;
                return (
                  <div key={i} className="relative mb-3.5 last:mb-0 group">
                    <div className="flex items-center gap-2 z-10 relative">
                      <div
                        className={`w-3 h-3 rounded-full border-2 border-white ring-2 transition-transform duration-200 group-hover:scale-125 ${
                          isLatest
                            ? "bg-indigo-600 ring-indigo-200"
                            : "bg-slate-400 ring-slate-100"
                        }`}
                      />
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider ${
                          isLatest ? "text-indigo-600" : "text-slate-500"
                        }`}
                      >
                        {formatTimelineDate(r.created_at)}
                      </span>
                    </div>

                    <div className="pl-6 pt-1.5 relative">
                      <div className="absolute left-[11px] -top-1 w-3.5 h-5 border-l-2 border-b-2 border-slate-200 rounded-bl-md" />

                      <div
                        className={`p-3.5 rounded-xl transition-all duration-200 ${
                          isLatest
                            ? "bg-indigo-50/50 border border-indigo-100 shadow-xs"
                            : "bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold text-slate-800 tracking-wide">
                            {r.added_by_name}
                          </span>
                          {r.updated_at && (
                            <span className="text-[9px] text-slate-400 italic">
                              (edited)
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-700 leading-relaxed font-medium break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
                          {r.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Modal Actions */}
      <div className="flex justify-end pt-2">
        <Button
          variant="ghost"
          onClick={() => setViewTarget(null)}
          className="font-black uppercase tracking-widest text-xs"
        >
          Close
        </Button>
      </div>
    </div>
  )}
</Modal>

    </div>
  );
};

export default InternTasks;