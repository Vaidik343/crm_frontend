// src/features/interns/pages/intern/InternProject.jsx

import { useEffect, useState } from "react";
import { useIntern } from "../../../../context/InternContext";
import { useInternAuth } from "../../hooks/useInternAuth";
import toast from "react-hot-toast";
import {
  MdFolder, MdEdit, MdAdd, MdClose,
  MdCode, MdStorage, MdPerson, MdInfo,
} from "react-icons/md";
import { formatDate } from "../../../../utils/formatDate";

// ── Helpers ────────────────────────────────────────────────────────────────────

const initialProjectForm = {
  name:        "",
  description: "",
  languages:   "",
  frameworks:  "",
  database:    "",
  others:      "",
};

const TechChip = ({ value }) => {
  if (!value) return null;
  return (
    <span className="inline-block bg-[#132ea7]/10 text-[#132ea7] text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
      {value}
    </span>
  );
};

// ── Component ──────────────────────────────────────────────────────────────────

const InternProject = () => {
  const { internName }  = useInternAuth();
const {
  profile, profileLoading, getMyProfile,
  project, projectLoading, getMyProject,
  createProject: createProjectFn,
  updateProject: updateProjectFn,
} = useIntern();

  const isEditingProject = !!project;

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showModal, setShowModal]         = useState(false);
  const [form, setForm]                   = useState(initialProjectForm);
  const [errors, setErrors]               = useState({});
  const [submitting, setSubmitting]       = useState(false);

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    getMyProfile();
    getMyProject();
  }, []);

  // ── Populate form when modal opens ─────────────────────────────────────────
  useEffect(() => {
    if (showModal && isEditingProject && project) {
      setForm({
        name:        project.name                        || "",
        description: project.description                 || "",
        languages:   project.tech_details?.languages     || "",
        frameworks:  project.tech_details?.frameworks    || "",
        database:    project.tech_details?.database      || "",
        others:      project.tech_details?.others        || "",
      });
    }
    if (!showModal) {
      setForm(initialProjectForm);
      setErrors({});
    }
  }, [showModal, isEditingProject, project]);

  // ── Form handlers ──────────────────────────────────────────────────────────
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
      name:        form.name.trim(),
      description: form.description.trim() || null,
      tech_details: {
        languages:  form.languages.trim()  || null,
        frameworks: form.frameworks.trim() || null,
        database:   form.database.trim()   || null,
        others:     form.others.trim()     || null,
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
            My Project
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            Define and manage your internship project
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-sm font-black uppercase tracking-widest hover:bg-[#0f2490] transition"
        >
          {isEditingProject
            ? <><MdEdit size={16} /> Edit Project</>
            : <><MdAdd  size={16} /> Add Project</>
          }
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {projectLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex items-center justify-center">
          <p className="text-sm text-slate-400 font-medium">Loading...</p>
        </div>
      ) : !project ? (
        /* Empty state */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <MdFolder size={32} className="text-slate-300" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-700 uppercase tracking-wide">
              No Project Yet
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1 max-w-xs">
              Define your internship project so your mentor and admin can track your progress.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#132ea7] text-white text-sm font-black uppercase tracking-widest hover:bg-[#0f2490] transition mt-2"
          >
            <MdAdd size={16} /> Add Project
          </button>
        </div>
      ) : (
        /* Project detail */
        <div className="flex flex-col gap-6">

          {/* ── Main info card ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

            {/* Header row */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#132ea7]/10 flex items-center justify-center shrink-0">
                  <MdFolder size={24} className="text-[#132ea7]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                    {project.name}
                  </h2>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-0.5">
                    {project.display_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <MdInfo size={14} className="text-slate-400" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Description
                  </p>
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-slate-100 my-4" />

            {/* Tech stack */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MdCode size={14} className="text-slate-400" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Tech Stack
                </p>
              </div>

              {project.tech_details &&
              Object.values(project.tech_details).some(Boolean) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    ["Languages",  project.tech_details.languages],
                    ["Frameworks", project.tech_details.frameworks],
                    ["Database",   project.tech_details.database],
                    ["Others",     project.tech_details.others],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        {label}
                      </p>
                      {val ? (
                        <div className="flex flex-wrap gap-2">
                          {val.split(",").map((v) => v.trim()).filter(Boolean).map((v) => (
                            <TechChip key={v} value={v} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-300 font-semibold">Not specified</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-medium">
                  No tech stack defined yet.
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-4" />

            {/* Mentor */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MdPerson size={14} className="text-slate-400" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Mentor
                </p>
              </div>
              {project.mentor ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#132ea7] flex items-center justify-center text-white font-black text-sm shrink-0">
                    {project.mentor.name?.charAt(0) || "M"}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">{project.mentor.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      {project.mentor.employee_id}
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

          {/* ── Meta card ──────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              Project Info
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
              {[
                ["Project ID",    project.display_id || "—"],
                ["Created",       project.createdAt  ? formatDate(project.createdAt) : "—"],
                ["Last Updated",  project.updatedAt  ? formatDate(project.updatedAt) : "—"],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── Project Modal ────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                {isEditingProject ? "Edit Project" : "Add Project"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">

              {/* Name */}
              <div>
                <label className={labelCls}>
                  Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Inventory Management System"
                  className={inputCls(errors.name)}
                />
                {errors.name && <p className={errCls}>{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>
                  Description{" "}
                  <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
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
                    { name: "languages",  placeholder: "e.g. JavaScript, Python"  },
                    { name: "frameworks", placeholder: "e.g. React, Express"       },
                    { name: "database",   placeholder: "e.g. PostgreSQL, MongoDB"  },
                    { name: "others",     placeholder: "e.g. Docker, Redis"        },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className={labelCls}>
                        {f.name.charAt(0).toUpperCase() + f.name.slice(1)}
                      </label>
                      <input
                        name={f.name}
                        value={form[f.name]}
                        onChange={handleChange}
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

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60"
                >
                  {submitting
                    ? isEditingProject ? "Saving..."   : "Creating..."
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

export default InternProject;