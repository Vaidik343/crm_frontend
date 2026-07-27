// src/features/interns/pages/intern/InternDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntern } from "../../../../context/InternContext";
import { useInternAuth } from "../../hooks/useInternAuth";
import toast from "react-hot-toast";
import {
  MdPerson, MdFolder, MdTask, MdEdit, MdAdd, MdClose
} from "react-icons/md";
import { formatDate } from "../../../../utils/formatDate";

const statusColors = {
  open:    "bg-blue-50 text-blue-700 border border-blue-200",
  ongoing: "bg-amber-50 text-amber-700 border border-amber-200",
  hold:    "bg-slate-50 text-slate-600 border border-slate-200",
  closed:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const calcProgress = (start, end) => {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
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
  name: "", description: "",
  languages: "", frameworks: "", database: "", others: "",
};

const InternDashboard = () => {
  const navigate = useNavigate();
  const { internName } = useInternAuth();
  const {
    profile, profileLoading, getMyProfile,
    project, projectLoading, getMyProject,
    tasks, tasksLoading, getMyTasks,
    createProject, updateProject,
  } = useIntern();

  const [showProjectModal, setShowProjectModal]   = useState(false);
  const [projectForm, setProjectForm]             = useState(initialProjectForm);
  const [projectErrors, setProjectErrors]         = useState({});
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const isEditingProject = !!project;

  useEffect(() => {
    getMyProfile();
    getMyProject();
    getMyTasks(1);
  }, []);

  useEffect(() => {
    if (showProjectModal && isEditingProject && project) {
      setProjectForm({
        name:        project.name                    || "",
        description: project.description             || "",
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
        await updateProject(payload);
        toast.success("Project updated!");
      } else {
        await createProject(payload);
        toast.success("Project created!");
      }
      setShowProjectModal(false);
      getMyProject();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setProjectSubmitting(false);
    }
  };

  // ── Shared classes ──────────────────────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-3 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30 ${
      err ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
    }`;
  const labelCls = "block text-xs font-black uppercase tracking-widest text-slate-500 mb-1";
  const errCls   = "text-xs text-red-500 font-semibold mt-1";
  const cardCls  = "bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden";
  const cardHead = "flex items-center justify-between px-5 py-3.5 border-b border-slate-100";
  const cardTitle = "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400";

  const progress  = calcProgress(profile?.start_date, profile?.end_date);
  const remaining = daysRemaining(profile?.end_date);

  return (
    <div className="space-y-5">

      {/* ── Welcome Row ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Welcome, {internName || "Intern"} 👋
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Here's an overview of your active project and internship progress.
          </p>
        </div>
        <button
          onClick={() => navigate("/intern/tasks")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition"
        >
          <MdTask size={14} /> View All Tasks
        </button>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Project Card */}
          <div className={cardCls}>
            <div className={cardHead}>
              <span className={cardTitle}>
                <MdFolder size={13} /> Project Definition
              </span>
              <button
                onClick={() => setShowProjectModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                {isEditingProject ? <><MdEdit size={11} /> Edit</> : <><MdAdd size={11} /> Add Project</>}
              </button>
            </div>

            {projectLoading ? (
              <div className="py-10 text-center text-xs text-slate-400 font-bold">Loading...</div>
            ) : project ? (
              <div className="divide-y divide-slate-50">
                {/* Name */}
                <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                    Project Name
                  </span>
                  <span className="text-sm font-black text-slate-800">{project.name}</span>
                </div>

                {/* Description */}
                {project.description && (
                  <div className="flex items-start justify-between gap-4 px-5 py-3.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                      Description
                    </span>
                    <span className="text-xs font-medium text-slate-600 text-right leading-relaxed max-w-xs">
                      {project.description}
                    </span>
                  </div>
                )}

                {/* Tech Stack */}
                {project.tech_details && (
                  <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                      Tech Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {project.tech_details.languages && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70">
                          {project.tech_details.languages}
                        </span>
                      )}
                      {project.tech_details.frameworks && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                          {project.tech_details.frameworks}
                        </span>
                      )}
                      {project.tech_details.database && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                          {project.tech_details.database}
                        </span>
                      )}
                      {project.tech_details.others && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {project.tech_details.others}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Mentor */}
                <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                    Assigned Mentor
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {project.mentor?.name || profile?.mentor?.name || "Will be assigned by admin"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <MdFolder size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">No project defined yet</p>
                <p className="text-[11px] text-slate-300 mt-1 font-medium">
                  Click "Add Project" to define your project scope.
                </p>
              </div>
            )}
          </div>

          {/* Recent Tasks Card */}
          <div className={cardCls}>
            <div className={cardHead}>
              <span className={cardTitle}>
                <MdTask size={13} /> Recent Tasks
              </span>
              <button
                onClick={() => navigate("/intern/tasks")}
                className="text-[10px] font-black uppercase tracking-widest text-[#132ea7] hover:underline"
              >
                View All →
              </button>
            </div>

            {tasksLoading ? (
              <div className="py-10 text-center text-xs text-slate-400 font-bold">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="py-12 text-center">
                <MdTask size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">No active tasks</p>
                <p className="text-[11px] text-slate-300 mt-1 font-medium">
                  Tasks assigned to you will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {tasks.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{t.task}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                        {t.display_id}
                        {t.project ? ` · ${t.project.name}` : ""}
                        {t.due_date ? ` · Due ${formatDate(t.due_date)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {t.created_by_admin ? (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                          Admin
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Self
                        </span>
                      )}
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${statusColors[t.status] || "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Right Column: Profile (1/3) ── */}
        <div className={`${cardCls} self-start`}>
          <div className={cardHead}>
            <span className={cardTitle}>
              <MdPerson size={13} /> Profile
            </span>
          </div>

          {profileLoading ? (
            <div className="py-10 text-center text-xs text-slate-400 font-bold">Loading...</div>
          ) : profile ? (
            <div className="p-5 space-y-4">

              {/* Identity */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-[#132ea7] text-white font-black text-lg flex items-center justify-center shrink-0">
                  {profile.name?.charAt(0) || "I"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{profile.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e8ecfb] text-[#132ea7]">
                      {profile.intern_type}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{profile.display_id || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="divide-y divide-slate-50 text-xs">
                {[
                  ["Degree",     profile.degree_type ? profile.degree_type.charAt(0).toUpperCase() + profile.degree_type.slice(1) : "—"],
                  ["College",    profile.college_name || "—"],
                  ["Start Date", profile.start_date ? formatDate(profile.start_date) : "—"],
                  ["End Date",   profile.end_date   ? formatDate(profile.end_date)   : "—"],
                  ["Mentor",     profile.mentor?.name || "Not assigned"],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between gap-2 py-2.5">
                    <span className="font-bold text-slate-400 shrink-0">{label}</span>
                    <span className="font-semibold text-slate-700 text-right truncate max-w-[130px]">{val}</span>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {profile.start_date && profile.end_date && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Progress
                    </span>
                    <span className="text-[10px] font-bold text-[#132ea7]">
                      {remaining !== null ? `${remaining} days left` : ""}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#132ea7] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 text-right">
                    {progress}% completed
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="p-5">
              <p className="text-xs text-slate-400 font-medium">No profile data found.</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Project Modal ── */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">
                {isEditingProject ? "Edit Project Definition" : "Add Project Definition"}
              </h2>
              <button onClick={() => setShowProjectModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="px-6 py-6 flex flex-col gap-4">

              <div>
                <label className={labelCls}>Project Name <span className="text-red-400">*</span></label>
                <input name="name" value={projectForm.name} onChange={handleProjectChange}
                  placeholder="e.g. Inventory Management System" className={inputCls(projectErrors.name)} />
                {projectErrors.name && <p className={errCls}>{projectErrors.name}</p>}
              </div>

              <div>
                <label className={labelCls}>Description <span className="text-slate-300 font-medium normal-case tracking-normal">(optional)</span></label>
                <textarea name="description" value={projectForm.description} onChange={handleProjectChange}
                  rows={3} placeholder="Brief description..." className={inputCls(false)} />
              </div>

              <div className="pt-1">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                  Tech Stack <span className="text-slate-300 font-medium normal-case tracking-normal">(optional)</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "languages",  placeholder: "e.g. JavaScript, Python" },
                    { name: "frameworks", placeholder: "e.g. React, Express"     },
                    { name: "database",   placeholder: "e.g. PostgreSQL"         },
                    { name: "others",     placeholder: "e.g. Docker, Redis"      },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className={labelCls}>{f.name.charAt(0).toUpperCase() + f.name.slice(1)}</label>
                      <input name={f.name} value={projectForm[f.name]} onChange={handleProjectChange}
                        placeholder={f.placeholder} className={inputCls(false)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <label className={labelCls}>Mentor</label>
                <div className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                  {project?.mentor?.name || profile?.mentor?.name || "Will be assigned by admin"}
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Assigned by admin — cannot be changed here.</p>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowProjectModal(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={projectSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#132ea7] text-white font-black text-xs uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
                  {projectSubmitting
                    ? (isEditingProject ? "Saving..." : "Creating...")
                    : (isEditingProject ? "Save Changes" : "Create Project")}
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