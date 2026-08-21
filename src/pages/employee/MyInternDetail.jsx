import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import toast from "react-hot-toast";
import DataTable from "../../components/shared/table";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_BADGE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  terminated: "bg-rose-50 text-rose-700 border-rose-200",
};

const TASK_STATUS_BADGE = {
  open: "bg-sky-50 text-sky-700 border-sky-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  on_hold: "bg-slate-100 text-slate-700 border-slate-200",
};

const TASK_STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
  on_hold: "On Hold",
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-slate-800 mt-1 sm:mt-0">{value || "—"}</span>
    </div>
  );
}

function AssignTaskModal({ internId, onClose, onCreated }) {
  const [form, setForm] = useState({ task: "", description: "", due_date: "" });
  const [submitting, setSubmitting] = useState(false);

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.task.trim()) {
      toast.error("Task name is required");
      return;
    }
    try {
      setSubmitting(true);
      await api.post(ENDPOINTS.MENTOR_ASSIGN_TASK, {
        intern_id: internId,
        task: form.task.trim(),
        description: form.description.trim() || null,
        due_date: form.due_date || null,
      });
      toast.success("Task assigned successfully");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Assign New Task</h2>
            <p className="text-xs text-slate-500">Add a task item for this intern.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Task Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.task}
              onChange={(e) => set("task", e.target.value)}
              placeholder="e.g. Set up local dev environment"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Provide context or instructions for this task..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => set("due_date", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] transition-all text-slate-700"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-[#132ea7] hover:bg-[#0f2490] text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50 transition-all"
          >
            {submitting ? "Assigning..." : "Assign Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

function OverviewTab({ intern }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#132ea7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-base font-bold text-slate-800">Personal Information</h3>
        </div>
        <InfoRow label="Full Name" value={intern.name} />
        <InfoRow label="Email Address" value={intern.email} />
        <InfoRow label="Phone Number" value={intern.mobile} />
        <InfoRow label="College" value={intern.college_name} />
        <InfoRow label="Department" value={intern.department} />
        <InfoRow label="Role Type" value={intern.intern_type === "intern" ? "Intern" : "Trainee"} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#132ea7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-base font-bold text-slate-800">Internship Details</h3>
        </div>
        <InfoRow label="Display ID" value={intern.display_id} />
        <InfoRow
          label="Status"
          value={
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${STATUS_BADGE[intern.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {intern.status ? intern.status.charAt(0).toUpperCase() + intern.status.slice(1) : "—"}
            </span>
          }
        />
        <InfoRow label="Start Date" value={formatDate(intern.start_date)} />
        <InfoRow label="End Date" value={formatDate(intern.end_date)} />
      </div>

      {intern.about && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 mb-2">About</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{intern.about}</p>
        </div>
      )}
    </div>
  );
}

function ProjectTab({ project }) {
  if (!project) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <h4 className="text-base font-semibold text-slate-800">No Project Assigned</h4>
        <p className="text-xs text-slate-500 mt-1">An administrator will assign a project to this intern.</p>
      </div>
    );
  }

  const projStatus = project.status ? project.status.toLowerCase() : "pending";
  const badgeClass =
    projStatus === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : projStatus === "completed"
      ? "bg-slate-100 text-slate-700 border-slate-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  // Parse tech stack list safely if provided as string or array
  const techStackList = Array.isArray(project.tech_stack)
    ? project.tech_stack
    : typeof project.tech_stack === "string"
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{project.name || "Unnamed Project"}</h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{project.display_id || "—"}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${badgeClass}`}>
            {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : "Pending"}
          </span>
        </div>

        {project.description && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </div>
        )}

        {techStackList.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {techStackList.map((tech, index) => (
                <span
                  key={index}
                  className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional Details Section if present */}
      {project.tech_details && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Technical Details</p>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {typeof project.tech_details === "object"
              ? project.tech_details.details || JSON.stringify(project.tech_details, null, 2)
              : project.tech_details}
          </p>
        </div>
      )}
    </div>
  );
}
function TasksTab({ internId, tasks, onTasksRefresh }) {
  const [showAssign, setShowAssign] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks.filter(
    (t) =>
      t.task?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.display_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      field: "display_id",
      headerName: "Task ID",
      width: 140,
      renderCell: ({ value }) => <span className="font-mono text-xs font-medium text-slate-500">{value}</span>,
    },
    {
      field: "task",
      headerName: "Task Detail",
      width: 380,
      renderCell: ({ row, value }) => (
        <div className="py-1">
          <p className="font-semibold text-slate-800 text-sm">{value}</p>
          {row.description && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.description}</p>}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: ({ value }) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${TASK_STATUS_BADGE[value] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
          {TASK_STATUS_LABELS[value] || value}
        </span>
      ),
    },
    {
      field: "due_date",
      headerName: "Due Date",
      width: 160,
      renderCell: ({ value }) => <span className="text-slate-600 text-xs font-medium">{formatDate(value)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] transition-all"
          />
        </div>

        <button
          onClick={() => setShowAssign(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#132ea7] hover:bg-[#0f2490] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Assign Task
        </button>
      </div>

      <div className="hidden md:block">
        <DataTable columns={columns} rows={filteredTasks} emptyMessage="No tasks found matching your filter." />
      </div>

      <div className="md:hidden space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
            No tasks found.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{task.task}</p>
                  <p className="text-xs font-mono text-slate-400">{task.display_id}</p>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${TASK_STATUS_BADGE[task.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {TASK_STATUS_LABELS[task.status] || task.status}
                </span>
              </div>
              {task.description && <p className="text-xs text-slate-500">{task.description}</p>}
              {task.due_date && <p className="text-xs text-slate-400 pt-1 border-t border-slate-100">Due {formatDate(task.due_date)}</p>}
            </div>
          ))
        )}
      </div>

      {showAssign && (
        <AssignTaskModal internId={internId} onClose={() => setShowAssign(false)} onCreated={onTasksRefresh} />
      )}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "project", label: "Project" },
  { key: "tasks", label: "Tasks" },
];

export default function MyInternDetail() {
  const { intern_id } = useParams();
  const navigate = useNavigate();

  const [intern, setIntern] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    fetchAll();
  }, [intern_id]);

  async function fetchAll() {
    try {
      setLoading(true);
      const [internRes, tasksRes] = await Promise.all([
        api.get(ENDPOINTS.INTERN_MENTOR_VIEW(intern_id)),
        api.get(ENDPOINTS.INTERN_MENTOR_TASKS(intern_id)),
      ]);

      const internData = internRes.data.intern || internRes.data;
      setIntern(internData);
      setProject(internData.project || null);
      setTasks(tasksRes.data.tasks || []);
    } catch (err) {
      toast.error("Failed to load intern details");
    } finally {
      setLoading(false);
    }
  }

  async function refreshTasks() {
    try {
      const res = await api.get(ENDPOINTS.INTERN_MENTOR_TASKS(intern_id));
      setTasks(res.data.tasks || []);
    } catch {
      // Handled in modal
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-28" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-10 bg-slate-200 rounded-xl w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-2xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <p className="text-slate-600 font-medium">Intern not found or access restricted.</p>
        <button
          onClick={() => navigate("/employee/my-interns")}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#132ea7] text-white text-xs font-semibold rounded-xl"
        >
          Back to My Interns
        </button>
      </div>
    );
  }

  const statusMeta = STATUS_BADGE[intern.status] || "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <div className="p-6 max-w-[90%] mx-auto space-y-6">
      <button
        onClick={() => navigate("/employee/my-interns")}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#132ea7] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to My Interns
      </button>

      {/* Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#132ea7]/10 text-[#132ea7] font-bold text-xl flex items-center justify-center shrink-0 border border-[#132ea7]/20">
            {intern.name?.charAt(0).toUpperCase() || "I"}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{intern.name}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusMeta}`}>
                {intern.status ? intern.status.charAt(0).toUpperCase() + intern.status.slice(1) : "—"}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                {intern.intern_type === "intern" ? "Intern" : "Trainee"}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">{intern.display_id}</p>
            {intern.college_name && <p className="text-xs font-medium text-slate-500 mt-0.5">{intern.college_name}</p>}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                tab === t.key ? "text-[#132ea7]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{t.label}</span>
                {t.key === "tasks" && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    tab === "tasks" ? "bg-[#132ea7] text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {tasks.length}
                  </span>
                )}
              </div>
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#132ea7] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Rendering */}
      <div>
        {tab === "overview" && <OverviewTab intern={intern} />}
        {tab === "project" && <ProjectTab project={project} />}
        {tab === "tasks" && <TasksTab internId={intern_id} tasks={tasks} onTasksRefresh={refreshTasks} />}
      </div>
    </div>
  );
}