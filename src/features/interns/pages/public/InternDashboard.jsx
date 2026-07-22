// src/features/interns/pages/intern/InternDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntern } from "../../../../context/InternContext";
import { useInternAuth } from "../../hooks/useInternAuth";
import toast from "react-hot-toast";
import {
  MdPerson, MdFolder, MdTask, MdEdit, MdAdd,
  MdCalendarToday, MdSchool, MdClose
} from "react-icons/md";
import { formatDate } from "../../../../utils/formatDate";

// ── Helpers ────────────────────────────────────────────────────────────────────

const statusColors = {
  open:    "bg-blue-100 text-blue-700",
  ongoing: "bg-amber-100 text-amber-700",
  hold:    "bg-slate-100 text-slate-600",
  closed:  "bg-green-100 text-green-700",
};

const calcProgress = (start, end) => {
  if (!start || !end) return 0;
  const s   = new Date(start).getTime();
  const e   = new Date(end).getTime();
  const now = Date.now();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
};

const daysRemaining = (end) => {
  if (!end) return null;
  const diff = new Date(end).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const initialProjectForm = {
  name:        "",
  description: "",
  languages:   "",
  frameworks:  "",
  database:    "",
  others:      "",
};

// ── Component ──────────────────────────────────────────────────────────────────

const InternDashboard = () => {
  const navigate               = useNavigate();
  const { internName }         = useInternAuth();
  const {
    profile, profileLoading, getMyProfile,
    project, projectLoading,  getMyProject,
    tasks,   tasksLoading,    getMyTasks,
    createTask: _createTask, // not used on dashboard
  } = useIntern();

  // ── Project modal state ────────────────────────────────────────────────────
  const { createProject, updateProject } = useIntern?.() ?? {};
  // we pull these separately to avoid a long destructure above
  const internContext = useIntern();
  const createProjectFn = internContext.createProject;
  const updateProjectFn = internContext.updateProject;

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm]           = useState(initialProjectForm);
  const [projectErrors, setProjectErrors]       = useState({});
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const isEditingProject = !!project;

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    getMyProfile();
    getMyProject();
    getMyTasks(1); // limit 5 handled in context but we show first page
  }, []);

  // ── Populate form when editing ─────────────────────────────────────────────
  useEffect(() => {
    if (showProjectModal && isEditingProject && project) {
      setProjectForm({
        name:        project.name        || "",
        description: project.description || "",
        languages:   project.tech_details?.languages  || "",
        frameworks:  project.tech_details?.frameworks || "",
        database:    project.tech_details?.database   || "",
        others:      project.tech_details?.others     || "",
      });
    }
    if (!showProjectModal) {
      setProjectForm(initialProjectForm);
      setProjectErrors({});
    }
  }, [showProjectModal, isEditingProject, project]);

  // ── Project form handlers ──────────────────────────────────────────────────
  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
    if (projectErrors[name]) setProjectErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateProject = () => {
    const e = {};
    if (!projectForm.name.trim()) e.name = "Project name is required.";
    setProjectErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!validateProject()) return;

    const payload = {
      name:        projectForm.name.trim(),
      description: projectForm.description.trim() || null,
      tech_details: {
        languages:  projectForm.languages.trim()  || null,
        frameworks: projectForm.frameworks.trim() || null,
        database:   projectForm.database.trim()   || null,
        others:     projectForm.others.trim()     || null,
      },
    };

    try {
      setProjectSubmitting(true);
      if (isEditingProject) {
        await updateProjectFn(payload);
        toast.success("Project updated successfully!");
      } else {
        await createProjectFn(payload);
        toast.success("Project created successfully!");
      }
      setShowProjectModal(false);
      getMyProject(); // refresh
    } catch (error) {
      const msg = error?.response?.data?.message || "Something went wrong.";
      toast.error(msg);
    } finally {
      setProjectSubmitting(false);
    }
  };

  // ── Shared classes ─────────────────────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30 ${
      err ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
    }`;
  const labelCls  = "block text-xs font-black uppercase tracking-widest text-slate-500 mb-1";
  const errCls    = "text-xs text-red-500 font-semibold mt-1";
  const cardCls   = "bg-white rounded-2xl shadow-sm border border-slate-100 p-6";
  const sectionHd = "text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2";

  const progress  = calcProgress(profile?.start_date, profile?.end_date);
  const remaining = daysRemaining(profile?.end_date);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Welcome bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Welcome, {internName} 👋
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            Here's an overview of your internship
          </p>
        </div>
      </div>

      {/* ── Row 1: Profile + Project ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Profile card */}
        <div className={cardCls}>
          <p className={sectionHd}><MdPerson size={14} /> Profile</p>

          {profileLoading ? (
            <div className="h-32 flex items-center justify-center">
              <p className="text-sm text-slate-400 font-medium">Loading...</p>
            </div>
          ) : profile ? (
            <div className="flex flex-col gap-4">

              {/* Name + type */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#132ea7] flex items-center justify-center text-white font-black text-lg shrink-0">
                  {profile.name?.charAt(0) || "I"}
                </div>
                <div>
                  <p className="font-black text-slate-800 uppercase tracking-tight">
                    {profile.name}
                  </p>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#132ea7] px-2 py-0.5 rounded-full">
                    {profile.intern_type}
                  </span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-1">
                {[
                  ["Degree",      profile.degree_type ? profile.degree_type.charAt(0).toUpperCase() + profile.degree_type.slice(1) : "—"],
                  ["College",     profile.college_name || "—"],
                  ["Start Date",  profile.start_date ? formatDate(profile.start_date) : "—"],
                  ["End Date",    profile.end_date   ? formatDate(profile.end_date)   : "—"],
                  ["Mentor",      profile.mentor?.name || "Not assigned yet"],
                  ["Display ID",  profile.display_id  || "—"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{val}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              {profile.start_date && profile.end_date && (
                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Internship Progress
                    </p>
                    <p className="text-[10px] font-black text-slate-500">
                      {remaining !== null ? `${remaining} days remaining` : ""}
                    </p>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#132ea7] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">{progress}% completed</p>
                </div>
              )}

            </div>
          ) : (
            <p className="text-sm text-slate-400 font-medium">No profile data found.</p>
          )}
        </div>

        {/* Project card */}
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-4">
            <p className={sectionHd}><MdFolder size={14} /> Project Definition</p>
            <button
              onClick={() => setShowProjectModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition"
            >
              {isEditingProject ? <><MdEdit size={13} /> Edit</> : <><MdAdd size={13} /> Add Project</>}
            </button>
          </div>

          {projectLoading ? (
            <div className="h-32 flex items-center justify-center">
              <p className="text-sm text-slate-400 font-medium">Loading...</p>
            </div>
          ) : project ? (
            <div className="flex flex-col gap-4">

              {/* Project name */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Name</p>
                <p className="text-base font-black text-slate-800 mt-0.5">{project.name}</p>
              </div>

              {/* Description */}
              {project.description && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</p>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">{project.description}</p>
                </div>
              )}

              {/* Tech details */}
              {project.tech_details && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Tech Stack
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      ["Languages",  project.tech_details.languages],
                      ["Frameworks", project.tech_details.frameworks],
                      ["Database",   project.tech_details.database],
                      ["Others",     project.tech_details.others],
                    ].filter(([, v]) => v).map(([label, val]) => (
                      <div key={label}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentor — read only */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mentor</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {project.mentor?.name || profile?.mentor?.name || "Will be assigned by admin"}
                </p>
              </div>

            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center gap-3 text-center">
              <MdFolder size={32} className="text-slate-200" />
              <p className="text-sm text-slate-400 font-semibold">
                No project defined yet.
              </p>
              <p className="text-xs text-slate-300 font-medium">
                Click "Add Project" to define your internship project.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ── Row 2: Recent Tasks ──────────────────────────────────────────────── */}
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <p className={sectionHd}><MdTask size={14} /> Recent Tasks</p>
          <button
            onClick={() => navigate("/intern/tasks")}
            className="text-xs font-black text-[#132ea7] hover:underline uppercase tracking-widest"
          >
            View All →
          </button>
        </div>

        {tasksLoading ? (
          <div className="h-20 flex items-center justify-center">
            <p className="text-sm text-slate-400 font-medium">Loading...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="h-20 flex flex-col items-center justify-center gap-2 text-center">
            <MdTask size={28} className="text-slate-200" />
            <p className="text-sm text-slate-400 font-semibold">No tasks yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-700 truncate">{t.task}</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-widest">
                    {t.display_id}
                    {t.project ? ` • ${t.project.name}` : ""}
                    {t.due_date ? ` • Due ${formatDate(t.due_date)}` : ""}
                  </p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${statusColors[t.status] || "bg-slate-100 text-slate-500"}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Project Modal ────────────────────────────────────────────────────── */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                {isEditingProject ? "Edit Project" : "Add Project"}
              </h2>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleProjectSubmit} className="px-6 py-6 flex flex-col gap-5">

              {/* Name */}
              <div>
                <label className={labelCls}>Project Name <span className="text-red-400">*</span></label>
                <input
                  name="name"
                  value={projectForm.name}
                  onChange={handleProjectChange}
                  placeholder="e.g. Inventory Management System"
                  className={inputCls(projectErrors.name)}
                />
                {projectErrors.name && <p className={errCls}>{projectErrors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>
                  Description{" "}
                  <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={projectForm.description}
                  onChange={handleProjectChange}
                  rows={3}
                  placeholder="Brief description of your project..."
                  className={inputCls(false)}
                />
              </div>

              {/* Tech stack */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                  Tech Stack{" "}
                  <span className="text-slate-300 font-medium normal-case tracking-normal">(optional)</span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "languages",  placeholder: "e.g. JavaScript, Python" },
                    { name: "frameworks", placeholder: "e.g. React, Express"     },
                    { name: "database",   placeholder: "e.g. PostgreSQL, MongoDB" },
                    { name: "others",     placeholder: "e.g. Docker, Redis"      },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className={labelCls}>
                        {f.name.charAt(0).toUpperCase() + f.name.slice(1)}
                      </label>
                      <input
                        name={f.name}
                        value={projectForm[f.name]}
                        onChange={handleProjectChange}
                        placeholder={f.placeholder}
                        className={inputCls(false)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentor — read only */}
              <div className="border-t border-slate-100 pt-4">
                <label className={labelCls}>Mentor</label>
                <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
                  {project?.mentor?.name || profile?.mentor?.name || "Will be assigned by admin"}
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Mentor is assigned by admin and cannot be changed here.
                </p>
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={projectSubmitting}
                  className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60"
                >
                  {projectSubmitting
                    ? isEditingProject ? "Saving..." : "Creating..."
                    : isEditingProject ? "Save Changes" : "Create Project"
                  }
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InternDashboard;