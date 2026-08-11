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
import ExportModalMine from "../../components/ui/ExportModalMine";
import {
  MdAdd,
  MdAssignment,
  MdEdit,
  MdDelete,
  MdFolder,
  MdVisibility,
  MdCalendarToday,
  MdInfoOutline,
  MdComment,
  MdDownload,
  MdSave,
  MdClose,
} from "react-icons/md";
import { useUser } from "../../context/UserContext";
import LocalSearchableSelect from "../../components/ui/LocalSearchableSelect";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { ENDPOINTS } from "../../api/endpoints";
import SearchInput from "../../components/ui/SearchInput";

import { formatDate, formatDateTime } from "../../utils/formatDate";

import DataTable from "../../components/shared/table";

const initialForm = {
  task: "",
  description: "",
  project_id: "",
  call_id: "",
  assigned_to: "",
  due_date: "",
  status: "ongoing",
  remarks: [""], // Array supporting multiple remark inputs at once
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

const MyTasks = () => {
  const {
    tasks,
    loading,
    page,
    limit,
    setPage,
    total,
    totalPages,
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTask();
  const { projects, getAllProjects } = useProject();
  const { calls, getAllCalls } = useCall();
  const { user: authUser } = useAuth();
  const { users, getAllUsers } = useUser();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // States for inline remark editing
  const [editingRemarkId, setEditingRemarkId] = useState(null);
  //("🚀 ~ MyTasks ~ editingRemarkId:", editingRemarkId)
  const [editingRemarkText, setEditingRemarkText] = useState("");
  //("🚀 ~ MyTasks ~ editingRemarkText:", editingRemarkText)

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [dueFilter, setDueFilter] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  })();

  const [dateFrom, setDateFrom] = useState(sevenDaysAgo);
  const [dateTo, setDateTo] = useState(today);

  const [search, setSearch] = useState("");

  const assignableUsers = useMemo(() => {
    if (!selectedProject) return users;
    if (!selectedProject.members?.length) return [];
    const memberUserIds = selectedProject.members.map(
      (m) => m.user_id || m.user?.id
    );
    return users.filter((u) => memberUserIds.includes(u.id));
  }, [selectedProject, users]);

  const noSelf = assignableUsers.filter((u) => u.id !== authUser?.id);

  useEffect(() => {
    getAllTasks?.(page, dateFrom, dateTo, limit, search, dueFilter);
    getAllProjects?.();
    getAllCalls?.();
    getAllUsers?.();
  }, [page, dateFrom, dateTo, dueFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      getAllTasks?.(1, dateFrom, dateTo, limit, search, dueFilter);
    }, 300);

    return () => clearTimeout(debounce);
  }, [search]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "project_id") {
      setForm((prev) => ({ ...prev, project_id: value, assigned_to: "" }));
    }

    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Remark Array Handlers for Batch Adding
  const handleRemarkChange = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.remarks];
      updated[index] = value;
      return { ...prev, remarks: updated };
    });
  };

  const addRemarkField = () => {
    setForm((prev) => ({ ...prev, remarks: [...prev.remarks, ""] }));
  };

  const removeRemarkField = (index) => {
    setForm((prev) => ({
      ...prev,
      remarks: prev.remarks.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const errors = {};
    if (!form.task.trim()) errors.task = "Task name is required";
    if (!form.project_id) errors.project_id = "Project is required";
    return errors;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setSelectedProject(null);
    setSelectedCall(null);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTarget(task);
    setForm({
      task: task.task || "",
      description: task.description || "",
      assigned_to: task.assigned_to || "",
      project_id: task.project_id || "",
      call_id: task.call_id || "",
      due_date: task.due_date
        ? new Date(task.due_date).toISOString().split("T")[0]
        : "",
      status: task.status || "ongoing",
      remarks: [""],
    });
    setSelectedProject(task.project || null);
    setSelectedCall(task.call || null);
    setEditingRemarkId(null);
    setFieldErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setSelectedProject(null);
    setSelectedCall(null);
    setEditingRemarkId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

// ✅ Fixed — explicit string guard
const activeRemarks = form.remarks
  .filter((r) => typeof r === "string" && r.trim() !== "")
  .map((r) => r.trim());


    try {
      setSubmitting(true);
      if (editTarget) {
        await updateTask(editTarget.id, {
          task: form.task,
          description: form.description || null,
          assigned_to: form.assigned_to || "",
          due_date: form.due_date || null,
          project_id: form.project_id || null,
          status: form.status,
          remarks: activeRemarks.length ? activeRemarks : undefined,
        });
        setAlert({ type: "success", message: "Task updated successfully" });
      } else {
        const payload = {
          task: form.task,
          description: form.description || null,
          project_id: form.project_id || null,
          call_id: form.call_id || null,
          assigned_to: form.assigned_to || null,
          due_date: form.due_date || null,
          status: form.status || "ongoing",
          remarks: activeRemarks.length ? activeRemarks : undefined,
        };
        await createTask(payload);
        setAlert({ type: "success", message: "Task created successfully" });
      }
      closeModal();
      getAllTasks?.(page, dateFrom, dateTo);
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Operation failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Direct remark update submit
// ✅ Fixed
const handleSaveEditRemark = async (remarkId) => {
  if (!editingRemarkText.trim()) return;
  try {
    const updatedTask = await updateTask(editTarget.id, {
      edit_remark: {
        remark_id: remarkId,
        text: editingRemarkText.trim(),
      },
    });

    // updateTask context returns the task object directly (already unwrapped)
    setEditTarget((prev) => ({
      ...prev,
      remarks: updatedTask?.remarks ?? prev.remarks,  // ← correct path
    }));

    setEditingRemarkId(null);
    setEditingRemarkText("");
    setAlert({ type: "success", message: "Remark updated." });
  } catch (err) {
    setAlert({
      type: "danger",
      message: err?.response?.data?.message || "Failed to update remark.",
    });
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


  const columns = [
  {
    field: "createdAt",
    headerName: "Register At",
    width: 220,
    renderCell: ({ row }) => (
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#132ea7] flex items-center justify-center shadow-inner group-hover:bg-[#132ea7] group-hover:text-white transition-all">
          <MdCalendarToday size={18} />
        </div>
        <div>
          <div className="font-black text-slate-800 text-base">
            {formatDate(row.createdAt)}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {formatDateTime(row.createdAt).split(" ")[1]}
          </div>
        </div>
      </div>
    ),
  },
  {
    field: "display_id",
    headerName: "Display ID",
    width: 150,
    renderCell: ({ value }) => (
      <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[11px] font-black uppercase tracking-widest font-mono">
        {value || "—"}
      </span>
    ),
  },
  {
    field: "task",
    headerName: "Task",
    width: 300,
    renderCell: ({ row }) => (
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center font-black shadow-lg shadow-[#132ea7]/10 shrink-0">
          <MdAssignment size={18} />
        </div>
        <div className="min-w-0">
          <div className="font-black text-slate-800 text-lg truncate max-w-25 leading-tight">
            {row.task}
          </div>
          {row.description && (
            <div className="text-xs text-slate-400 mt-1 truncate max-w-50 italic">
              {row.description}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: ({ value }) => <Badge value={value} />,
  },
  {
    field: "assigner",
    headerName: "Assigned By",
    width: 200,
    renderCell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px]">
          {row.assigner?.name?.charAt(0) || "?"}
        </div>
        <div className="text-sm font-black text-slate-700">
          {row.assigner?.name || "—"}
        </div>
      </div>
    ),
  },
  {
    field: "project",
    headerName: "Project",
    width: 200,
    renderCell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
        <MdFolder className="text-slate-300" size={18} />
        {row.project?.name || "—"}
      </div>
    ),
  },
  {
    field: "due_date",
    headerName: "Due Date",
    width: 180,
    renderCell: ({ row }) => (
      <DueDateBadge
        dueDate={row.due_date}
        status={row.status}
        completedAt={row.completed_at}
      />
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 160,
    align: "right",
    renderCell: ({ row }) => (
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => setViewTarget(row)}
          title="View"
          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all"
        >
          <MdVisibility size={20} />
        </button>
        <button
          onClick={() => openEdit(row)}
          title="Edit"
          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
        >
          <MdEdit size={20} />
        </button>
      </div>
    ),
  },
];


  const Pagination = ({ compact = false }) => (
    <div
      className={`flex items-center justify-between px-6 py-6 ${
        !compact ? "border-t border-slate-100" : ""
      }`}
    >
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
      >
        {compact ? "Prev" : "Previous"}
      </button>

      {compact ? (
        <span className="text-sm font-bold text-slate-500">
          {page} / {totalPages}
        </span>
      ) : (
        <div className="flex items-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-bold transition-all ${
                page === i + 1
                  ? "bg-[#132ea7] text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

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
    <div className="space-y-8 px-4 animate-in fade-in duration-700">
      {/* Header & Controls Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1 uppercase">
              Task <span className="text-[#132ea7]">Board</span>
            </h2>
            <p className="text-slate-500 font-bold text-base">
              Total Tasks: {total}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="ghost"
              className="shadow-sm px-5 rounded-xl font-black uppercase tracking-widest text-xs whitespace-nowrap h-[48px] bg-white border border-slate-100"
              onClick={() => setShowExportModal(true)}
            >
              <MdDownload size={18} className="mr-1.5" /> Download
            </Button>
            <Button
              variant="primary"
              className="shadow-lg shadow-[#132ea7]/20 px-6 rounded-xl h-[48px] font-black uppercase tracking-widest text-xs whitespace-nowrap"
              onClick={openCreate}
            >
              <MdAdd size={20} className="mr-1.5" /> New Task
            </Button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 shrink-0">
            {[
              { value: "", label: "All" },
              { value: "due_soon", label: "Due Soon" },
              { value: "overdue", label: "Overdue" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setPage(1);
                  setDueFilter(opt.value);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  dueFilter === opt.value
                    ? "bg-[#132ea7] text-white shadow-md shadow-[#132ea7]/20"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex-1 max-w-md w-full">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search Tasks, Projects..."
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-3 py-2 shadow-sm shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                max={today}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-xl px-2 py-1 text-xs font-bold text-slate-700 outline-none focus:border-[#132ea7]"
              />
            </div>

            <span className="text-slate-300 font-bold">•</span>

            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                max={today}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-xl px-2 py-1 text-xs font-bold text-slate-700 outline-none focus:border-[#132ea7]"
              />
            </div>

            <button
              onClick={() => {
                setPage(1);
                setDateFrom(sevenDaysAgo);
                setDateTo(today);
              }}
              className="ml-1 text-[10px] font-black text-[#132ea7] uppercase tracking-widest hover:underline whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

    {/* Desktop Table */}
<div className="hidden md:block">
  <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
    <DataTable
      columns={columns}
      rows={tasks}
      rowKey="id"
      emptyMessage="No tasks found."
    />
    {totalPages > 1 && <Pagination />}
  </div>
</div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold">
            No tasks found.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-black text-slate-800 leading-tight">
                      {task.task}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 font-mono mt-0.5">
                      {task.display_id}
                    </p>
                  </div>
                </div>
              </div>

              {task.description && (
                <p className="text-xs text-slate-400 font-medium italic px-1 truncate">
                  {task.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Assigned By
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[9px]">
                      {task.assigner?.name?.charAt(0) || "?"}
                    </div>
                    <span className="font-bold text-slate-700 text-xs">
                      {task.assigner?.name || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Project
                  </span>
                  <div className="flex items-center gap-1.5">
                    <MdFolder className="text-slate-300" size={14} />
                    <span className="font-bold text-slate-700 text-sm">
                      {task.project?.name || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Status
                  </span>
                  <Badge value={task.status} />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Due
                  </span>
                  <DueDateBadge
                    dueDate={task.due_date}
                    status={task.status}
                    completedAt={task.completedAt}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setViewTarget(task)}
                  className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
                >
                  <MdVisibility size={16} /> View
                </button>
                <button
                  onClick={() => openEdit(task)}
                  className="flex-1 h-10 rounded-xl bg-[#132ea7]/10 text-[#132ea7] font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/20 transition-all"
                >
                  <MdEdit size={16} /> Edit
                </button>
              </div>
            </div>
          ))
        )}
        {totalPages > 1 && <Pagination compact />}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Edit Task" : "New Task"}
        size="lg"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
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

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                Project <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                endpoint={ENDPOINTS.PROJECTS.ALL}
                value={form.project_id}
                selectedLabel={
                  selectedProject
                    ? `${selectedProject.name}${
                        selectedProject.code ? ` (${selectedProject.code})` : ""
                      }`
                    : ""
                }
                onChange={(project) => {
                  setSelectedProject(project);
                  setForm((prev) => ({
                    ...prev,
                    project_id: project?.id || "",
                    assigned_to: "",
                    call_id: "",
                  }));
                }}
                getLabel={(p) => `${p.name}${p.code ? ` (${p.code})` : ""}`}
                placeholder="Search project by name or code..."
                emptyOptionLabel={editTarget ? undefined : "No Project"}
                required
                error={fieldErrors.project_id}
              />
              {fieldErrors.project_id && (
                <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1">
                  {fieldErrors.project_id}
                </p>
              )}
            </div>

            {!editTarget && (
              <div className="space-y-1.5">
                {form.project_id && (
                  <span className="text-[10px] font-bold text-[#132ea7] ml-1 mb-1 uppercase tracking-widest">
                    {assignableUsers.length === 0
                      ? "No members in this project"
                      : `Showing ${assignableUsers.length} member${
                          assignableUsers.length > 1 ? "s" : ""
                        } of selected project`}
                  </span>
                )}
                {!form.project_id && (
                  <span className="text-[10px] font-bold text-slate-400 ml-1 mb-1 uppercase tracking-widest">
                    Select a project to filter members
                  </span>
                )}
                <LocalSearchableSelect
                  options={noSelf}
                  value={form.assigned_to}
                  onChange={(id) =>
                    setForm((prev) => ({ ...prev, assigned_to: id }))
                  }
                  disabled={form.project_id && assignableUsers.length === 0}
                  emptyOptionLabel="Self Assign"
                  placeholder="Search employee by name or ID..."
                  getId={(u) => u.id}
                  getLabel={(u) => {
                    const membership = selectedProject?.members?.find(
                      (m) => (m.user_id || m.user?.id) === u.id
                    );
                    const roleLabel = membership?.role?.name;
                    return `${u.name} (${u.employee_id})${
                      roleLabel ? ` — ${roleLabel}` : ""
                    }`;
                  }}
                  getSearchText={(u) => `${u.name} ${u.employee_id}`}
                />
              </div>
            )}

            {!editTarget && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                  Linked Call{" "}
                  <span className="text-slate-300 font-bold normal-case tracking-normal">
                    (Optional)
                  </span>
                </label>
                <SearchableSelect
                  endpoint={ENDPOINTS.CALLS.ALL}
                  extraParams={
                    form.project_id ? { project_id: form.project_id } : {}
                  }
                  value={form.call_id}
                  selectedLabel={
                    selectedCall
                      ? `${
                          selectedCall.display_id
                            ? `[${selectedCall.display_id}] `
                            : ""
                        }${selectedCall.caller_name} — ${selectedCall.call_type}`
                      : ""
                  }
                  onChange={(call) => {
                    setSelectedCall(call);
                    setForm((prev) => ({ ...prev, call_id: call?.id || "" }));
                  }}
                  getLabel={(c) =>
                    `${c.display_id ? `[${c.display_id}] ` : ""}${
                      c.caller_name
                    } — ${c.call_type}`
                  }
                  placeholder={
                    form.project_id
                      ? "Search calls for this project..."
                      : "Select a project first, or search all calls..."
                  }
                  emptyOptionLabel="No Linked Call"
                />
              </div>
            )}

            <Input
              label="Due Date"
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
            />

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(editTarget ? ["hold", "closed"] : ["ongoing", "hold"]).map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, status: s }))
                      }
                      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        form.status === s
                          ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Scope and requirements..."
                rows={3}
              />
            </div>

            {/* Existing Remarks Timeline with Edit Support */}
            {editTarget && (
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">
                  Remarks History
                </label>

                {Array.isArray(editTarget?.remarks) &&
                editTarget.remarks.length > 0 ? (
                  <div className="relative pl-5 space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-2 py-1">
                    <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-200 rounded-full" />

                    {[...editTarget.remarks].reverse().map((r) => {
                      const isOwnerOrAdmin =
                        authUser?.is_admin || r.added_by === authUser?.id;
                      const isEditing = editingRemarkId === r.id;

                      return (
                        <div key={r.id || r.created_at} className="relative group">
                          <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-[#132ea7] ring-2 ring-[#132ea7]/20" />

                          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-white transition-all shadow-xs">
                            {isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingRemarkText}
                                  onChange={(e) =>
                                    setEditingRemarkText(e.target.value)
                                  }
                                  rows={2}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingRemarkId(null)}
                                    className="px-2 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditRemark(r.id)}
                                    className="px-2 py-1 bg-[#132ea7] text-white rounded-lg text-xs font-bold flex items-center gap-1"
                                  >
                                    <MdSave size={14} /> Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                  {r.text}
                                </p>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/80">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                      {r.added_by_name}
                                    </span>
                                    {r.updated_at && (
                                      <span className="text-[9px] text-slate-400 italic">
                                        (edited)
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-400">
                                      {formatTimelineDate(r.created_at)}
                                    </span>

                                    {isOwnerOrAdmin && r.id && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingRemarkId(r.id);
                                          setEditingRemarkText(r.text);
                                        }}
                                        className="text-slate-400 hover:text-[#132ea7] transition-colors"
                                        title="Edit Remark"
                                      >
                                        <MdEdit size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs font-bold text-slate-400">
                      No remarks yet
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Section: Add Multiple Remarks at Once */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  {editTarget ? "Add New Sub Tasks" : "Tasks"}
                </label>
                <button
                  type="button"
                  onClick={addRemarkField}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#132ea7]/10 text-[#132ea7] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#132ea7]/20 transition-all"
                >
                  <MdAdd size={14} /> Add Multiple Sub Tasks
                </button>
              </div>

              {form.remarks.map((remarkStr, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Textarea
                      value={remarkStr}
                      onChange={(e) => handleRemarkChange(idx, e.target.value)}
                      placeholder={`Sub task #${idx + 1}...`}
                      rows={2}
                    />
                  </div>
                  {form.remarks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRemarkField(idx)}
                      className="p-2.5 mt-1 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                      title="Remove field"
                    >
                      <MdClose size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!editTarget && (
            <div
              className={`rounded-2xl px-5 py-3 border ${
                form.assigned_to
                  ? "bg-amber-50 border-amber-100"
                  : "bg-[#132ea7]/5 border-[#132ea7]/10"
              }`}
            >
              <p
                className={`text-xs font-black uppercase tracking-widest ${
                  form.assigned_to ? "text-amber-600" : "text-[#132ea7]"
                }`}
              >
                {form.assigned_to
                  ? "Assigning to another employee — Display ID prefix: TA"
                  : "Self-assigning — Display ID prefix: T"}
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-5 border-t border-slate-50">
            <Button
              variant="ghost"
              className="flex-1 font-black uppercase tracking-widest text-sm"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm"
              loading={submitting}
            >
              {editTarget ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        show={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Task Details"
        size="lg"
      >
        {viewTarget && (
          <div className="space-y-5 py-2">
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

                 {/* Description */}
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
            {/* Tree Timeline Remarks in View Modal */}
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

      <ConfirmDialog
        show={!!confirmDelete}
        message={`Delete task "${confirmDelete?.task}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />

      <ExportModalMine
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        types={["tasks"]}
      />
    </div>
  );
};

export default MyTasks;