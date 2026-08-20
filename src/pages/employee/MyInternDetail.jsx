import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api  from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import toast from "react-hot-toast";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_BADGE = {
  pending:    "bg-yellow-100 text-yellow-700",
  active:     "bg-green-100 text-green-700",
  completed:  "bg-gray-100 text-gray-600",
  terminated: "bg-red-100 text-red-700",
};

const TASK_STATUS_BADGE = {
  open:        "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  closed:      "bg-green-100 text-green-700",
  on_hold:     "bg-gray-100 text-gray-600",
};

const TASK_STATUS_LABELS = {
  open:        "Open",
  in_progress: "In Progress",
  closed:      "Closed",
  on_hold:     "On Hold",
};

const PRIORITY_BADGE = {
  low:    "bg-gray-100 text-gray-500",
  medium: "bg-blue-100 text-blue-600",
  high:   "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

// ─── sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 uppercase tracking-wide font-medium w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-700">{value || "—"}</span>
    </div>
  );
}

function AssignTaskModal({ internId, onClose, onCreated }) {
  const [form, setForm] = useState({
    task_name: "",
    description: "",
    priority: "medium",
    due_date: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.task_name.trim()) {
      toast.error("Task name is required");
      return;
    }
    try {
      setSubmitting(true);
      await api.post(ENDPOINTS.MENTOR_ASSIGN_TASK, {
        intern_id: internId,
        task_name: form.task_name.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Assign Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Task name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.task_name}
              onChange={(e) => set("task_name", e.target.value)}
              placeholder="e.g. Set up local dev environment"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional task details…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30 resize-none"
            />
          </div>

          {/* Priority + Due date side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-[#132ea7] text-white text-sm font-medium rounded-xl hover:bg-[#0f2490] disabled:opacity-50 transition-colors"
          >
            {submitting ? "Assigning…" : "Assign Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── tabs ────────────────────────────────────────────────────────────────────

function OverviewTab({ intern }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Personal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Personal Info</h3>
        <InfoRow label="Full Name"     value={intern.name} />
        <InfoRow label="Email"         value={intern.email} />
        <InfoRow label="Phone"         value={intern.phone} />
        <InfoRow label="College"       value={intern.college} />
        <InfoRow label="Department"    value={intern.department} />
        <InfoRow label="Type"          value={intern.intern_type === "intern" ? "Intern" : "Trainee"} />
      </div>

      {/* Internship */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Internship Details</h3>
        <InfoRow label="Display ID"   value={intern.display_id} />
        <InfoRow label="Status"       value={
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[intern.status] || "bg-gray-100 text-gray-600"}`}>
            {intern.status?.charAt(0).toUpperCase() + intern.status?.slice(1)}
          </span>
        } />
        <InfoRow label="Start Date"   value={formatDate(intern.start_date)} />
        <InfoRow label="End Date"     value={formatDate(intern.end_date)} />
        <InfoRow label="Stipend"      value={intern.stipend != null ? `₹${intern.stipend}` : "—"} />
        <InfoRow label="Joined"       value={formatDate(intern.created_at)} />
      </div>

      {/* About */}
      {intern.about && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{intern.about}</p>
        </div>
      )}
    </div>
  );
}

function ProjectTab({ project }) {
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No project assigned</p>
        <p className="text-gray-400 text-sm mt-1">An admin will assign a project to this intern.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-semibold text-gray-800 text-lg">{project.project_name}</p>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{project.display_id}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
            project.status === "active" ? "bg-green-100 text-green-700"
            : project.status === "completed" ? "bg-gray-100 text-gray-600"
            : "bg-yellow-100 text-yellow-700"
          }`}>
            {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
          </span>
        </div>

        {project.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">{project.description}</p>
        )}

        <div className="border-t border-gray-50 pt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Start Date</p>
            <p className="text-gray-700">{formatDate(project.start_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">End Date</p>
            <p className="text-gray-700">{formatDate(project.end_date)}</p>
          </div>
          {project.tech_stack && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {project.tech_stack.split(",").map((t) => (
                  <span key={t.trim()} className="text-xs bg-[#132ea7]/8 text-[#132ea7] px-2.5 py-0.5 rounded-full font-medium border border-[#132ea7]/15">
                    {t.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TasksTab({ internId, tasks, onTasksRefresh }) {
  const [showAssign, setShowAssign] = useState(false);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowAssign(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#132ea7] text-white text-sm font-medium rounded-xl hover:bg-[#0f2490] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Assign Task
        </button>
      </div>

      {/* Empty */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-[#132ea7]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No tasks yet</p>
          <p className="text-gray-400 text-sm mt-1">Assign the first task to get things moving.</p>
        </div>
      )}

      {/* Desktop table */}
      {tasks.length > 0 && (
        <>
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Task</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{task.display_id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{task.task_name}</p>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TASK_STATUS_BADGE[task.status] || "bg-gray-100 text-gray-600"}`}>
                        {TASK_STATUS_LABELS[task.status] || task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[task.priority] || "bg-gray-100 text-gray-500"}`}>
                        {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(task.due_date)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(task.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{task.task_name}</p>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{task.display_id}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TASK_STATUS_BADGE[task.status] || "bg-gray-100 text-gray-600"}`}>
                    {TASK_STATUS_LABELS[task.status] || task.status}
                  </span>
                </div>
                {task.description && (
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[task.priority] || "bg-gray-100 text-gray-500"}`}>
                    {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                  </span>
                  {task.due_date && (
                    <span className="text-xs text-gray-400">Due {formatDate(task.due_date)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showAssign && (
        <AssignTaskModal
          internId={internId}
          onClose={() => setShowAssign(false)}
          onCreated={onTasksRefresh}
        />
      )}
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "project",  label: "Project" },
  { key: "tasks",    label: "Tasks" },
];

export default function MyInternDetail() {
  const { intern_id } = useParams();
  const navigate = useNavigate();

  const [intern,  setIntern]  = useState(null);
  const [project, setProject] = useState(null);
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("overview");

  useEffect(() => {
    fetchAll();
  }, [intern_id]);

  async function fetchAll() {
    try {
      setLoading(true);
      const [internRes, tasksRes] = await Promise.all([
        api.get(ENDPOINTS.INTERN_BY_ID(intern_id)),
        api.get(ENDPOINTS.INTER_TASKS.GET_INTERN_TASKS(intern_id)),
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
      const res = await api.get(ENDPOINTS.INTER_TASKS.GET_INTERN_TASKS(intern_id));
      setTasks(res.data.tasks || []);
    } catch {
      // silent — toast already shown in assign modal
    }
  }

  // ── loading skeleton ──
  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-6" />
        <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-24 mb-6" />
        <div className="flex gap-3 mb-6">
          {[1,2,3].map(i => <div key={i} className="h-9 bg-gray-100 rounded-xl w-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-gray-500">Intern not found or you don't have access.</p>
        <button
          onClick={() => navigate("/employee/my-interns")}
          className="mt-4 text-sm text-[#132ea7] hover:underline"
        >
          ← Back to My Interns
        </button>
      </div>
    );
  }

  const statusMeta = STATUS_BADGE[intern.status] || "bg-gray-100 text-gray-600";

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate("/employee/my-interns")}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#132ea7] transition-colors mb-5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        My Interns
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-800">{intern.name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusMeta}`}>
              {intern.status?.charAt(0).toUpperCase() + intern.status?.slice(1)}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
              {intern.intern_type === "intern" ? "Intern" : "Trainee"}
            </span>
          </div>
          <p className="text-sm font-mono text-gray-400 mt-1">{intern.display_id}</p>
          {intern.college && (
            <p className="text-sm text-gray-500 mt-0.5">{intern.college}</p>
          )}
        </div>

        {/* Duration chip */}
        {intern.start_date && (
          <div className="shrink-0 bg-white border border-gray-100 rounded-xl px-4 py-2 text-center shadow-sm">
            <p className="text-xs text-gray-400">Duration</p>
            <p className="text-sm font-medium text-gray-700">
              {formatDate(intern.start_date)}
              {intern.end_date ? ` → ${formatDate(intern.end_date)}` : ""}
            </p>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-white text-[#132ea7] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.key === "tasks" && tasks.length > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                tab === "tasks" ? "bg-[#132ea7]/10 text-[#132ea7]" : "bg-gray-200 text-gray-500"
              }`}>
                {tasks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab intern={intern} />}
      {tab === "project"  && <ProjectTab project={project} />}
      {tab === "tasks"    && (
        <TasksTab
          internId={intern_id}
          tasks={tasks}
          onTasksRefresh={refreshTasks}
        />
      )}
    </div>
  );
}
