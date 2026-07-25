// src/features/interns/pages/intern/InternProject.jsx

import { useEffect, useState, useCallback } from "react";
import { useIntern } from "../../../../context/InternContext";
import { useInternAuth } from "../../hooks/useInternAuth";
import toast from "react-hot-toast";
import {
  MdFolder,
  MdEdit,
  MdAdd,
  MdClose,
  MdCode,
  MdPerson,
  MdInfo,
  MdContentCopy,
  MdCheck,
} from "react-icons/md";
import { formatDate } from "../../../../utils/formatDate";

// ── Helpers & Constants ────────────────────────────────────────────────────────

const INITIAL_PROJECT_FORM = {
  name: "",
  description: "",
  languages: "",
  frameworks: "",
  database: "",
  others: "",
};

const TechChip = ({ value }) => {
  if (!value) return null;
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#132ea7]/10 text-[#132ea7]">
      {value}
    </span>
  );
};

// ── Component ──────────────────────────────────────────────────────────────────

const InternProject = () => {
  const { internName } = useInternAuth();
  const {
    profile,
    getMyProfile,
    project,
    projectLoading,
    getMyProject,
    createProject: createProjectFn,
    updateProject: updateProjectFn,
  } = useIntern();

  const isEditingProject = !!project;

  // ── Modal & Form State ────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_PROJECT_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // ── Fetch on Mount ────────────────────────────────────────────────────────────
  useEffect(() => {
    getMyProfile();
    getMyProject();
  }, []);

  // ── Modal Keyboard & Scroll Lock ──────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false);
      }
    },
    [showModal]
  );

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal, handleKeyDown]);

  // ── Populate Form on Modal Open ───────────────────────────────────────────────
  useEffect(() => {
    if (showModal && isEditingProject && project) {
      setForm({
        name: project.name || "",
        description: project.description || "",
        languages: project.tech_details?.languages || "",
        frameworks: project.tech_details?.frameworks || "",
        database: project.tech_details?.database || "",
        others: project.tech_details?.others || "",
      });
    }
    if (!showModal) {
      setForm(INITIAL_PROJECT_FORM);
      setErrors({});
    }
  }, [showModal, isEditingProject, project]);

  // ── Form Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Project name is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      tech_details: {
        languages: form.languages.trim() || null,
        frameworks: form.frameworks.trim() || null,
        database: form.database.trim() || null,
        others: form.others.trim() || null,
      },
    };

    try {
      setSubmitting(true);
      if (isEditingProject) {
        await updateProjectFn(payload);
        toast.success("Project updated successfully!");
      } else {
        await createProjectFn(payload);
        toast.success("Project created successfully!");
      }
      setShowModal(false);
      getMyProject();
    } catch (error) {
      const msg = error?.response?.data?.message || "Something went wrong.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("Project ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  // ── Shared UI Style Classes ──────────────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 ${
      err
        ? "border-red-400 bg-red-50/50 text-red-900"
        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
    }`;
  const labelCls =
    "block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5";
  const errCls = "text-xs text-red-500 font-semibold mt-1";

  // Helper for splitting comma-separated tech items
  const renderTechBadges = (val) => {
    if (!val)
      return <p className="text-xs text-slate-300 font-medium">Not specified</p>;
    const tags = val
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, idx) => (
          <TechChip key={`${tag}-${idx}`} value={tag} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            My Project
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Define and manage your internship project details
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] active:scale-[0.98] transition shadow-sm"
        >
          {isEditingProject ? (
            <>
              <MdEdit size={16} /> Edit Project
            </>
          ) : (
            <>
              <MdAdd size={16} /> Add Project
            </>
          )}
        </button>
      </div>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      {projectLoading ? (
        /* Skeleton Loading State */
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="bg-white rounded-2xl border border-slate-100 p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-200" />
              <div className="space-y-2">
                <div className="w-48 h-5 bg-slate-200 rounded" />
                <div className="w-32 h-3 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="w-full h-16 bg-slate-100 rounded-xl" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="h-12 bg-slate-100 rounded-lg" />
              <div className="h-12 bg-slate-100 rounded-lg" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-10 bg-slate-100 rounded-lg" />
              <div className="h-10 bg-slate-100 rounded-lg" />
              <div className="h-10 bg-slate-100 rounded-lg" />
            </div>
          </div>
        </div>
      ) : !project ? (
        /* Empty State */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 sm:p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#132ea7]/10 flex items-center justify-center mb-4 text-[#132ea7]">
            <MdFolder size={32} />
          </div>
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wide">
            No Project Added Yet
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1.5 max-w-sm leading-relaxed">
            Specify your internship project details so mentors and administrators can monitor your progress.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] active:scale-[0.98] transition shadow-md shadow-[#132ea7]/20"
          >
            <MdAdd size={18} /> Create Project
          </button>
        </div>
      ) : (
        /* Main Project Card Display */
        <div className="flex flex-col gap-6">
          {/* Primary Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 transition-all">
            {/* Folder & Name Section */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#132ea7]/10 flex items-center justify-center shrink-0">
                  <MdFolder size={24} className="text-[#132ea7]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {project.name}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    {project.display_id || "ID Pending"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className="flex items-center gap-1.5 mb-2">
                <MdInfo size={15} className="text-slate-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Description
                </span>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-relaxed pl-5">
                {project.description || (
                  <span className="text-slate-300 italic">No description provided.</span>
                )}
              </p>
            </div>

            {/* Tech Stack */}
            <div className="pt-2 mb-6">
              <div className="flex items-center gap-1.5 mb-4">
                <MdCode size={16} className="text-slate-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Tech Stack
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 pl-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    Languages
                  </p>
                  {renderTechBadges(project.tech_details?.languages)}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    Frameworks
                  </p>
                  {renderTechBadges(project.tech_details?.frameworks)}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    Database
                  </p>
                  {renderTechBadges(project.tech_details?.database)}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    Others
                  </p>
                  {renderTechBadges(project.tech_details?.others)}
                </div>
              </div>
            </div>

            {/* Mentor Information */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 mb-3 mt-4">
                <MdPerson size={16} className="text-slate-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Mentor
                </span>
              </div>

              <div className="pl-5">
                {project.mentor ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#132ea7] text-white font-black text-xs flex items-center justify-center shrink-0">
                      {project.mentor.name?.charAt(0).toUpperCase() || "M"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {project.mentor.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {project.mentor.employee_id || "Assigned Mentor"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 font-medium italic">
                    Mentor will be assigned by admin.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Project Metadata Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
              Project Info
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Project ID block with Copy option */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Project ID
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-slate-800">
                    {project.display_id || "—"}
                  </span>
                  {project.display_id && (
                    <button
                      onClick={() => handleCopyId(project.display_id)}
                      className="text-slate-400 hover:text-[#132ea7] transition"
                      title="Copy ID"
                    >
                      {copiedId ? <MdCheck size={16} className="text-green-600" /> : <MdContentCopy size={15} />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Created
                </p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {project.createdAt ? formatDate(project.createdAt) : "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Last Updated
                </p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {project.updatedAt ? formatDate(project.updatedAt) : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Project Modal ───────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">
                {isEditingProject ? "Edit Project" : "Add Project"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              {/* Name */}
              <div>
                <label className={labelCls}>
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Learning Management System (LMS)"
                  className={inputCls(errors.name)}
                />
                {errors.name && <p className={errCls}>{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>
                  Description{" "}
                  <span className="text-slate-400 font-medium normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Briefly describe your internship project goals..."
                  className={inputCls(false)}
                />
              </div>

              {/* Tech Stack Fields */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">
                  Tech Stack{" "}
                  <span className="text-slate-400 font-medium normal-case tracking-normal">
                    (comma separated)
                  </span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Languages</label>
                    <input
                      name="languages"
                      value={form.languages}
                      onChange={handleChange}
                      placeholder="e.g. JS, TypeScript, Python"
                      className={inputCls(false)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Frameworks</label>
                    <input
                      name="frameworks"
                      value={form.frameworks}
                      onChange={handleChange}
                      placeholder="e.g. React, Express, Node"
                      className={inputCls(false)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Database</label>
                    <input
                      name="database"
                      value={form.database}
                      onChange={handleChange}
                      placeholder="e.g. PostgreSQL, MongoDB"
                      className={inputCls(false)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Others</label>
                    <input
                      name="others"
                      value={form.others}
                      onChange={handleChange}
                      placeholder="e.g. Docker, Redis, Tailwind"
                      className={inputCls(false)}
                    />
                  </div>
                </div>
              </div>

              {/* Read-only Mentor Info */}
              <div className="border-t border-slate-100 pt-4">
                <label className={labelCls}>Mentor</label>
                <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
                  {project?.mentor?.name ||
                    profile?.mentor?.name ||
                    "Will be assigned by admin"}
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Mentors are assigned by managers or administrators.
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#132ea7] text-white font-black text-xs uppercase tracking-widest hover:bg-[#0f2490] active:scale-[0.98] transition disabled:opacity-60 shadow-md shadow-[#132ea7]/20"
                >
                  {submitting
                    ? isEditingProject
                      ? "Saving..."
                      : "Creating..."
                    : isEditingProject
                    ? "Save Changes"
                    : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternProject;