import { useEffect, useState } from "react";
import { useProject } from "../../context/ProjectContext";
import {useRole} from "../../context/RoleContext"
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";

import { MdAdd,MdGroup, MdBusinessCenter, MdCalendarToday, MdEdit, MdDelete, MdPerson, MdPowerSettingsNew, MdFolder } from "react-icons/md";

// constants

const PROJECT_TYPES = {
  web:     ["static", "dynamic"],
  app:     ["android", "ios", "native"],
  desktop: ["windows", "mac", "linux", "native"],
};

const TECH_OPTIONS = [
  ".NET Core", ".NET MVC", ".NET WebForm",
  "React", "Vue", "Angular",
  "Node.js", "Laravel", "Django",
  "Flutter", "React Native",
  "MSSQL", "PostgreSQL", "MySQL", "MongoDB",
];

const DEV_STATUS = ["planning", "active", "on_hold", "testing", "completed"];

const STATUS_COLORS = {
  planning:  "bg-slate-100 text-slate-600",
  active:    "bg-emerald-100 text-emerald-700",
  on_hold:   "bg-amber-100 text-amber-700",
  testing:   "bg-purple-100 text-purple-700",
  completed: "bg-blue-100 text-blue-700",
};

const initialForm = {
  name: "", description: "",
  project_type: [], project_subtype: [],
  tech: [],          // [{ name, version }]
  development_status: "planning",
  remark: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const validSubtypes = (types) =>
  [...new Set(types.flatMap((t) => PROJECT_TYPES[t] || []))];


const Projects = () => {
  const { projects, loading,  page,
  totalPages, getAllProjects, createProject, updateProject, deleteProject,  addProjectMembers, updateMemberRole, removeMember } = useProject();

  const {roles,  getAllRoles,} = useRole()
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);


  // members panel status
      const [membersProject, setMembersProject] = useState(null); // project being managed
      const [memberForm, setMemberForm] = useState({user_id:"", role_id:""});
      const [memberSubmitting, setMemberSubmitting] = useState(false);
      const [memberAlert, setMemberAlert] = useState({type:"", message:""});


  // Tech input state
  const [techInput, setTechInput] = useState("");  // custom tech name being typed
  const [techVersion, setTechVersion] = useState(""); // version for tech being added

  // Expanded rows (members inline)
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    getAllProjects?.(page);
    getAllRoles?.();
  }, [page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleType = () => {
    setForm((prev) => {
      const types = prev.project_subtype.includes(type)
      ? prev.project_type.filter((t) => t !== type)
      : [...prev.project_type, type];

      // Remove subtypes that are no longer valid

      const valid = validSubtypes(types);
      return {
        ...prev,
        project_type: types,
        project_subtype: prev.project_subtype.filter( (s) => valid.includes(s)),
      };
    });
  };

  const toggleSubType = (sub) => {
      setForm( (prev) => ({
        ...prev,
        project_subtype: prev.project_subtype.includes(sub)
        ? prev.project_subtype.filter((s) => s !== sub)
        : [...prev.project_subtype, sub]
      }));
  }

  const addTech = (name) => {
    if(!name.trim()) return;

    //prevent duplicate
    if(form.tech.find((t) => t.name.toLowerCase() === name.toLowerCase())) return;
    setForm((prev) => ({...prev, tech: [...prev.tech, {name: name.trim(), version: techVersion.trim() || undefined}]}));
    setTechInput("");
    setTechVersion("");
  };

  const removeTech = (name) => {
    setForm((prev) => ({...prev, tech: prev.tech.filter((t) => t.name !== name)}));
  }

   const validate = () => {
    const errors = {};
    if (!form.name.trim())             errors.name             = "Project name is required";
    if (!form.project_type.length)     errors.project_type     = "Select at least one type";
    if (!form.project_subtype.length)  errors.project_subtype  = "Select at least one subtype";
    if (!form.tech.length)             errors.tech             = "Add at least one technology";
    if (!form.development_status)      errors.development_status = "Status is required";
    return errors;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setShowModal(true);
  };

 const openEdit = (project) => {
    setEditTarget(project);
    setForm({
      name:               project.name || "",
      description:        project.description || "",
      project_type:       Array.isArray(project.project_type) ? project.project_type : [],
      project_subtype:    Array.isArray(project.project_subtype) ? project.project_subtype : [],
      tech:               Array.isArray(project.tech) ? project.tech : [],
      development_status: project.development_status || "planning",
      remark:             "",
    });
    setFieldErrors({});
    setShowModal(true);
  };



   const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setTechInput("");
    setTechVersion("");
  };


   const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    try {
      setSubmitting(true);
      const payload = {
        name:               form.name,
        description:        form.description || null,
        project_type:       form.project_type,
        project_subtype:    form.project_subtype,
        tech:               form.tech,
        development_status: form.development_status,
        remark:             form.remark || undefined,
      };
      if (editTarget) {
        await updateProject(editTarget.id, payload);
        setAlert({ type: "success", message: "Project updated" });
      } else {
        await createProject(payload);
        setAlert({ type: "success", message: "Project created" });
      }
      closeModal();
      getAllProjects(page);
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Operation failed" });
    } finally {
      setSubmitting(false);
    }
  };



  
  // ── Member handlers ───────────────────────────────────────────

  const handleAddMember = async () => {
    if (!memberForm.user_id) {
      setMemberAlert({ type: "danger", message: "Select a user" });
      return;
    }
    try {
      setMemberSubmitting(true);
      await addProjectMembers(membersProject.id, [
        { user_id: memberForm.user_id, role_id: memberForm.role_id || undefined }
      ]);
      setMemberAlert({ type: "success", message: "Member added" });
      setMemberForm({ user_id: "", role_id: "" });
      await getAllProjects(page);
      // refresh membersProject from updated list
      setMembersProject((prev) => {
        const updated = projects.find((p) => p.id === prev.id);
        return updated || prev;
      });
    } catch (err) {
      setMemberAlert({ type: "danger", message: err?.response?.data?.message || "Failed to add member" });
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMember(memberId, membersProject.id);
      setMemberAlert({ type: "success", message: "Member removed" });
      await getAllProjects(page);
      setMembersProject((prev) => {
        const updated = projects.find((p) => p.id === prev.id);
        return updated || prev;
      });
    } catch (err) {
      setMemberAlert({ type: "danger", message: "Failed to remove member" });
    }
  };

  const handleUpdateMemberRole = async (memberId, role_id) => {
    try {
      await updateMemberRole(memberId, role_id);
      setMemberAlert({ type: "success", message: "Role updated" });
    } catch (err) {
      setMemberAlert({ type: "danger", message: "Failed to update role" });
    }
  };


  const handleToggleActive = async (project) => {
    try {
      await updateProject(project.id, { is_active: !project.is_active });
      setAlert({
        type: "success",
        message: `Project ${project.is_active ? "taken offline" : "restored online"}`,
      });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Status update failed" });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteProject(confirmDelete.id);
      setAlert({ type: "success", message: "Project record purged" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Purge failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (loading && !projects.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Initializing project modules...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            <span className="text-[#132ea7]">Projects</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Total Projects: {projects.length} </p>
        </div>

        <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 py-3.5 px-8 rounded h-[52px] font-black uppercase tracking-widest text-sm" onClick={openCreate}>
          <MdAdd size={22} />
          New Project
        </Button>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Projects Display */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200 shadow-2xl shadow-slate-200/40">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
            <MdBusinessCenter size={40} />
          </div>
          <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Projects Yet</h4>
          <p className="text-slate-400 font-bold mt-2">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Project </th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Code</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Tech</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Members</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Created</th>
                  
                  <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Lead</th>
                  <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Date</th>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {projects.map((project) => (
                  <>
                  <tr key={project.id} className={`hover:bg-slate-50/80 transition-colors group ${!project.is_active ? "opacity-60" : ""}`}>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner transition-all ${project.is_active ? 'bg-slate-50 text-[#132ea7] group-hover:bg-[#132ea7] group-hover:text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <MdFolder size={24} />
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight">{project.name}</div>
                          {project.description && (
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 line-clamp-1 italic max-w-[250px]">{project.description}</div>
                          )}
                        </div>
                      </div>
                    </td>

                       {/* Code */}
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-xs font-black uppercase tracking-widest">
                          {project.code || "—"}
                        </span>
                      </td>


  {/* Type */}
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(project.project_type) ? project.project_type : []).map((t) => (
                            <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase">{t}</span>
                          ))}
                          {(!project.project_type || !project.project_type.length) && <span className="text-slate-300 text-xs font-bold">—</span>}
                        </div>
                      </td>

                      {/* Tech */}
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(Array.isArray(project.tech) ? project.tech : []).slice(0, 3).map((t) => (
                            <span key={t.name} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black">
                              {t.name}{t.version ? ` ${t.version}` : ""}
                            </span>
                          ))}
                          {project.tech?.length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-black">+{project.tech.length - 3}</span>
                          )}
                          {(!project.tech || !project.tech.length) && <span className="text-slate-300 text-xs font-bold">—</span>}
                        </div>
                      </td>

                      {/* Dev status */}
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[project.development_status] || "bg-slate-100 text-slate-600"}`}>
                          {project.development_status || "—"}
                        </span>
                      </td>

                      {/* Members count */}
                      <td className="px-6 py-5">
                        <button
                          onClick={() => setExpandedRow(expandedRow === project.id ? null : project.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[#132ea7]/10 hover:text-[#132ea7] text-slate-500 font-black text-xs transition-all"
                        >
                          <MdGroup size={16} />
                          {project.members?.length || 0}
                          {expandedRow === project.id ? <MdChevronDown size={14} /> : <MdChevronRight size={14} />}
                        </button>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                          <MdCalendarToday className="text-slate-300" size={14} />
                          {new Date(project.createdAt).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </td>


                    <td className="px-6 py-6">
                      <Badge value={project.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] uppercase">
                          {project.creator?.name?.charAt(0) || <MdPerson size={14} />}
                        </div>
                        <div className="text-sm font-black text-slate-600">{project.creator?.name || "—"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <MdCalendarToday className="text-slate-300" size={16} />
                        {new Date(project.createdAt).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </td>

                    {/* action */}
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(project)}
                          title="Edit Project"
                          className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all shadow-sm"
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(project)}
                          title={project.is_active ? "Deactivate" : "Activate"}
                          className={`p-2.5 rounded-xl bg-slate-50 transition-all shadow-sm ${project.is_active ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"}`}
                        >
                          <MdPowerSettingsNew size={20} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(project)}
                          title="Delete Record"
                          className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                     {/* Expanded members row */}
                    {expandedRow === project.id && (
                      <tr key={`${project.id}-members`} className="bg-slate-50/50">
                        <td colSpan={8} className="px-10 py-4">
                          {project.members?.length === 0 ? (
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No members yet</p>
                          ) : (
                            <div className="flex flex-wrap gap-3">
                              {project.members.map((m) => (
                                <div key={m.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                                  <div className="w-7 h-7 rounded-full bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-[10px]">
                                    {m.user?.name?.charAt(0) || "?"}
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-slate-700">{m.user?.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{m.role?.name || "No role"}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                    </>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
<div className="flex items-center justify-between px-6 py-6 border-t border-slate-100">
  
  <button
    disabled={page === 1}
    onClick={() => getAllProjects(page - 1)}
    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
  >
    Previous
  </button>

  <div className="flex items-center gap-2">
    {[...Array(totalPages)].map((_, i) => {
      const pageNum = i + 1;

      return (
        <button
          key={pageNum}
          onClick={() => getAllProjects(pageNum)}
          className={`w-10 h-10 rounded-xl font-bold transition-all ${
            page === pageNum
              ? "bg-[#132ea7] text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {pageNum}
        </button>
      );
    })}
  </div>

  <button
    disabled={page === totalPages}
    onClick={() => getAllProjects(page + 1)}
    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
  >
    Next
  </button>

</div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Modify Project Record" : "Launch Mission Project"}
        size="lg"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          <div className="space-y-6">
            <Input
              label="Project Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={fieldErrors.name}
              placeholder=""
              required
            />
            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Define the scope and core objectives of this project..."
              rows={4}
            />
            
          {/* Project Type — multi select buttons */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
              Project Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(PROJECT_TYPES).map((type) => (
                <button key={type} type="button" onClick={() => toggleType(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                    ${form.project_type.includes(type) ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                  {type}
                </button>
              ))}
            </div>
            {fieldErrors.project_type && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{fieldErrors.project_type}</p>}
          </div>

          {/* Project Subtype — shown based on selected types */}
          {form.project_type.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                Subtype <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {validSubtypes(form.project_type).map((sub) => (
                  <button key={sub} type="button" onClick={() => toggleSubtype(sub)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                      ${form.project_subtype.includes(sub) ? "bg-[#e98937] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                    {sub}
                  </button>
                ))}
              </div>
              {fieldErrors.project_subtype && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{fieldErrors.project_subtype}</p>}
            </div>
          )}

          {/* Tech Stack */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
              Tech Stack <span className="text-red-500">*</span>
            </label>

            {/* Selected tech tags */}
            {form.tech.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tech.map((t) => (
                  <span key={t.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-black">
                    <MdCode size={12} />
                    {t.name}{t.version ? ` ${t.version}` : ""}
                    <button type="button" onClick={() => removeTech(t.name)} className="hover:text-red-500 transition ml-1">
                      <MdClose size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Predefined options */}
            <div className="flex flex-wrap gap-2">
              {TECH_OPTIONS.filter((o) => !form.tech.find((t) => t.name === o)).map((opt) => (
                <button key={opt} type="button" onClick={() => addTech(opt)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  + {opt}
                </button>
              ))}
            </div>

            {/* Custom tech input */}
            <div className="flex gap-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(techInput); } }}
                placeholder="Custom tech name..."
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20"
              />
              <input
                value={techVersion}
                onChange={(e) => setTechVersion(e.target.value)}
                placeholder="Version (optional)"
                className="w-36 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20"
              />
              <button type="button" onClick={() => addTech(techInput)}
                className="px-4 py-2.5 bg-[#132ea7] text-white rounded-xl font-black text-sm hover:bg-[#132ea7]/90 transition">
                Add
              </button>
            </div>
            {fieldErrors.tech && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{fieldErrors.tech}</p>}
          </div>

          {/* Development Status */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
              Development Status <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DEV_STATUS.map((s) => (
                <button key={s} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, development_status: s }))}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                    ${form.development_status === s
                      ? `${STATUS_COLORS[s]} ring-2 ring-offset-1 ring-current`
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
            {fieldErrors.development_status && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{fieldErrors.development_status}</p>}
          </div>

          {/* Initial remark — only on create */}
          {!editTarget && (
            <Textarea label="Initial Remark (optional)" name="remark" value={form.remark}
              onChange={handleChange} placeholder="Add a note about this project..." rows={2} />
          )}
          </div>
          <div className="flex gap-4 pt-8 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-[2] h-16 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm" loading={submitting}>
              {editTarget ? "Update" : "Deploy Project"}
            </Button>
          </div>
        </form>
      </Modal>

        {/* ── Manage Members Modal ────────────────────────────────── */}
      <Modal show={!!membersProject} onClose={() => { setMembersProject(null); setMemberForm({ user_id: "", role_id: "" }); }} title={`Members — ${membersProject?.name}`} size="lg">
        {membersProject && (
          <div className="space-y-6">

            <Alert type={memberAlert.type} message={memberAlert.message} onClose={() => setMemberAlert({ type: "", message: "" })} />

            {/* Add member form */}
            <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Add Member</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select value={memberForm.user_id} onChange={(e) => setMemberForm((p) => ({ ...p, user_id: e.target.value }))}
                  className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20">
                  <option value="">Select User</option>
                  {users.filter((u) => !membersProject.members?.find((m) => m.user_id === u.id && m.is_active)).map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.employee_id})</option>
                  ))}
                </select>
                <select value={memberForm.role_id} onChange={(e) => setMemberForm((p) => ({ ...p, role_id: e.target.value }))}
                  className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20">
                  <option value="">No Role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <Button variant="primary" onClick={handleAddMember} loading={memberSubmitting} className="font-black uppercase tracking-widest text-xs h-12">
                  <MdAdd size={18} /> Add
                </Button>
              </div>
            </div>

            {/* Current members list */}
            <div className="space-y-3">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Current Members ({membersProject.members?.filter((m) => m.is_active).length || 0})
              </p>
              {!membersProject.members?.length ? (
                <p className="text-sm font-bold text-slate-400 text-center py-6">No members yet</p>
              ) : (
                membersProject.members.filter((m) => m.is_active).map((m) => (
                  <div key={m.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black">
                      {m.user?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-800 text-sm">{m.user?.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.user?.employee_id}</p>
                    </div>
                    {/* Role selector */}
                    <select
                      defaultValue={m.role_id || ""}
                      onChange={(e) => handleUpdateMemberRole(m.id, e.target.value)}
                      className="bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-black text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20"
                    >
                      <option value="">No Role</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    {/* Remove */}
                    <button onClick={() => handleRemoveMember(m.id)}
                      className="p-2 rounded-xl bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100">
                      <MdClose size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`This action will permanently purge "${confirmDelete?.name}" from the central database. This will fail if there are active intelligence logs (calls) linked to this project.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Projects;