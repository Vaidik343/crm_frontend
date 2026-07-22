// src/features/interns/pages/intern/InternWorkLogs.jsx

import { useEffect, useState } from "react";
import { useIntern } from "../../../../context/InternContext";
import toast from "react-hot-toast";
import { MdAdd, MdClose, MdBook, MdSearch } from "react-icons/md";
import { formatDate } from "../../../../utils/formatDate";

// ── Initial state ──────────────────────────────────────────────────────────────

const initialForm = {
  description:       "",
  hours:             "",
  log_date:          "",
  intern_project_id: "",
  intern_task_id:    "",
};

// ── Component ──────────────────────────────────────────────────────────────────

const InternWorkLogs = () => {
  const {
    workLogs, workLogsLoading, workLogsPage, workLogsLimit,
    workLogsTotal, workLogsTotalPages, setWorkLogsPage,
    getMyWorkLogs, createWorkLog, updateWorkLog,
    project, getMyProject,
    tasks,   getMyTasks,
  } = useIntern();

  // ── Filters ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [from, setFrom]     = useState("");
  const [to, setTo]         = useState("");

  // ── Create modal ───────────────────────────────────────────────────────────
  const [showCreate, setShowCreate]   = useState(false);
  const [form, setForm]               = useState(initialForm);
  const [formErrors, setFormErrors]   = useState({});
  const [creating, setCreating]       = useState(false);

  // ── Edit modal ─────────────────────────────────────────────────────────────
  const [showEdit, setShowEdit]       = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [editForm, setEditForm]       = useState(initialForm);
  const [editErrors, setEditErrors]   = useState({});
  const [editing, setEditing]         = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  // Effect 1 — filters reset page
  useEffect(() => {
    setWorkLogsPage(1);
  }, [search, from, to]);

  // Effect 2 — fetch
  useEffect(() => {
    getMyWorkLogs(workLogsPage, from, to, search);
  }, [workLogsPage, search, from, to]);

  // fetch project + tasks for dropdowns
  useEffect(() => {
    getMyProject();
    getMyTasks(1);
  }, []);

  // ── Total hours from current page (client-side) ────────────────────────────
  const totalHoursOnPage = workLogs.reduce((sum, w) => sum + parseFloat(w.hours || 0), 0);

  // ── Create handlers ────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateCreate = () => {
    const e = {};
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.hours)              e.hours        = "Hours is required.";
    else if (isNaN(parseFloat(form.hours)) || parseFloat(form.hours) <= 0)
                                  e.hours        = "Enter a valid positive number.";
    if (!form.log_date)           e.log_date     = "Log date is required.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (ev) => {
    ev.preventDefault();
    if (!validateCreate()) return;
    try {
      setCreating(true);
      await createWorkLog({
        description:       form.description.trim(),
        hours:             parseFloat(form.hours),
        log_date:          form.log_date,
        intern_project_id: form.intern_project_id || null,
        intern_task_id:    form.intern_task_id    || null,
      });
      toast.success("Work log created successfully!");
      setShowCreate(false);
      setForm(initialForm);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create work log.");
    } finally {
      setCreating(false);
    }
  };

  // ── Edit handlers ──────────────────────────────────────────────────────────
  const openEdit = (w) => {
    setEditTarget(w);
    setEditForm({
      description:       w.description                  || "",
      hours:             w.hours?.toString()            || "",
      log_date:          w.log_date                     || "",
      intern_project_id: w.intern_project_id            || "",
      intern_task_id:    w.intern_task_id               || "",
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
    if (!editForm.description.trim()) e.description = "Description is required.";
    if (!editForm.hours)              e.hours        = "Hours is required.";
    else if (isNaN(parseFloat(editForm.hours)) || parseFloat(editForm.hours) <= 0)
                                      e.hours        = "Enter a valid positive number.";
    if (!editForm.log_date)           e.log_date     = "Log date is required.";
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = async (ev) => {
    ev.preventDefault();
    if (!validateEdit()) return;
    try {
      setEditing(true);
      await updateWorkLog(editTarget.id, {
        description:       editForm.description.trim(),
        hours:             parseFloat(editForm.hours),
        log_date:          editForm.log_date,
        intern_project_id: editForm.intern_project_id || null,
        intern_task_id:    editForm.intern_task_id    || null,
      });
      toast.success("Work log updated successfully!");
      setShowEdit(false);
      setEditTarget(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update work log.");
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

  // ── Shared modal form fields ───────────────────────────────────────────────
  const WorkLogFormFields = ({ values, onChange, errors }) => (
    <>
      {/* Description */}
      <div>
        <label className={labelCls}>Description <span className="text-red-400">*</span></label>
        <textarea
          name="description"
          value={values.description}
          onChange={onChange}
          rows={3}
          placeholder="What did you work on?"
          className={inputCls(errors.description)}
        />
        {errors.description && <p className={errCls}>{errors.description}</p>}
      </div>

      {/* Hours + Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Hours <span className="text-red-400">*</span></label>
          <input
            name="hours"
            type="number"
            step="0.5"
            min="0.5"
            value={values.hours}
            onChange={onChange}
            placeholder="e.g. 2.5"
            className={inputCls(errors.hours)}
          />
          {errors.hours && <p className={errCls}>{errors.hours}</p>}
        </div>
        <div>
          <label className={labelCls}>Log Date <span className="text-red-400">*</span></label>
          <input
            name="log_date"
            type="date"
            value={values.log_date}
            onChange={onChange}
            className={inputCls(errors.log_date)}
          />
          {errors.log_date && <p className={errCls}>{errors.log_date}</p>}
        </div>
      </div>

      {/* Project */}
      <div>
        <label className={labelCls}>Project <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
        <select name="intern_project_id" value={values.intern_project_id} onChange={onChange} className={inputCls(false)}>
          <option value="">No project</option>
          {project && <option value={project.id}>{project.name}</option>}
        </select>
      </div>

      {/* Task */}
      <div>
        <label className={labelCls}>Task <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
        <select name="intern_task_id" value={values.intern_task_id} onChange={onChange} className={inputCls(false)}>
          <option value="">No task</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>{t.display_id} — {t.task}</option>
          ))}
        </select>
      </div>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Work Logs
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            {workLogsTotal} log{workLogsTotal !== 1 ? "s" : ""} total
            {workLogs.length > 0 && (
              <span className="ml-2 text-[#132ea7] font-black">
                • {totalHoursOnPage.toFixed(1)} hrs this page
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-sm font-black uppercase tracking-widest hover:bg-[#0f2490] transition"
        >
          <MdAdd size={16} /> Log Work
        </button>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
            />
          </div>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
          />
        </div>
      </div>

      {/* ── Work log list ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        {workLogsLoading ? (
          <div className="p-12 flex items-center justify-center">
            <p className="text-sm text-slate-400 font-medium">Loading...</p>
          </div>
        ) : workLogs.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
            <MdBook size={32} className="text-slate-200" />
            <p className="text-sm text-slate-400 font-semibold">No work logs found.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["ID", "Description", "Project", "Task", "Date", "Hours", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workLogs.map((w) => (
                    <tr key={w.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-xs font-black text-slate-400 whitespace-nowrap">
                        {w.display_id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-700 truncate max-w-[200px]">{w.description}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {w.project?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {w.task?.task ? `${w.task.display_id}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {formatDate(w.log_date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-black text-[#132ea7]">
                          {parseFloat(w.hours).toFixed(1)} hrs
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEdit(w)}
                          className="text-xs font-black text-[#e98937] hover:underline uppercase tracking-widest"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {workLogs.map((w) => (
                <div key={w.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{w.display_id}</p>
                      <p className="font-semibold text-slate-700 mt-0.5">{w.description}</p>
                    </div>
                    <span className="text-sm font-black text-[#132ea7] shrink-0">
                      {parseFloat(w.hours).toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold flex-wrap">
                    <span>📅 {formatDate(w.log_date)}</span>
                    {w.project && <span>📁 {w.project.name}</span>}
                    {w.task    && <span>✅ {w.task.display_id}</span>}
                  </div>
                  <button
                    onClick={() => openEdit(w)}
                    className="self-start text-xs font-black text-[#e98937] hover:underline uppercase tracking-widest"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {workLogsTotalPages > 1 && (
          <div className="px-4 py-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-semibold text-slate-400">
              Page {workLogsPage} of {workLogsTotalPages} — {workLogsTotal} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setWorkLogsPage((p) => Math.max(1, p - 1))}
                disabled={workLogsPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Prev
              </button>
              <button
                onClick={() => setWorkLogsPage((p) => Math.min(workLogsTotalPages, p + 1))}
                disabled={workLogsPage === workLogsTotalPages}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Log Work</h2>
              <button onClick={() => { setShowCreate(false); setForm(initialForm); setFormErrors({}); }}
                className="text-slate-400 hover:text-slate-600 transition">
                <MdClose size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-6 flex flex-col gap-5">
              <WorkLogFormFields values={form} onChange={handleFormChange} errors={formErrors} />
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setShowCreate(false); setForm(initialForm); setFormErrors({}); }}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
                  {creating ? "Saving..." : "Save Log"}
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
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Edit Work Log</h2>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-600 transition">
                <MdClose size={20} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="px-6 py-6 flex flex-col gap-5">
              <WorkLogFormFields values={editForm} onChange={handleEditChange} errors={editErrors} />
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

    </div>
  );
};

export default InternWorkLogs;