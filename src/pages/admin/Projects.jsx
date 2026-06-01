import { useEffect, useState } from "react";
import { useProject } from "../../context/ProjectContext";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";


import { MdAdd, MdGroup , MdChevronRight , MdBusinessCenter, MdCalendarToday, MdEdit, MdDelete, MdPerson, MdPowerSettingsNew, MdFolder, MdPersonAdd, MdPersonRemove, MdCheckCircle } from "react-icons/md";
import { useRole } from './../../context/RoleContext';
import Select from './../../components/ui/Select';
import { useUser } from './../../context/UserContext';
import { FaChevronDown } from "react-icons/fa";


const initialForm = {
  name: "",
  description: "",
  project_types: {},
  tech_details: "",
  development_status: "",
  remark: "",
    members: [],
};

const Projects = () => {
  const { projects, loading,  page,
  totalPages, getAllProjects, createProject, updateProject, deleteProject,
  addMemberToProject, removeMember: removeMemberFromProject } = useProject();
  
  const {roles,  getAllRoles}  = useRole();

  const { users, getAllUsers } = useUser();


  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);


    // Expanded rows (members inline)
  const [expandedRow, setExpandedRow] = useState(null);

  // Inline add-member state (mirrors Team.jsx)
  const [addingToProject, setAddingToProject] = useState(null);
  const [selectedUsers, setSelectedUsers]     = useState([]);
  const [addingMember, setAddingMember]       = useState(false);
  const [removingMember, setRemovingMember]   = useState(null);


  useEffect(() => {
    getAllProjects?.(page);
    getAllRoles?.();
     getAllUsers?.();
  }, [page]);


  // ── Inline Member Helpers (Team.jsx-style) ──────────────────────────────
  const getMemberUserIds = (project) =>
    (project.members || []).map((m) => m.user_id || m.user?.id);

  const getAvailableEmployees = (project) => {
    const memberIds = getMemberUserIds(project);
    return users.filter((u) => !memberIds.includes(u.id));
  };

  const toggleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddProjectMembers = async () => {
    if (!addingToProject || selectedUsers.length === 0) return;
    try {
      setAddingMember(true);
      await addMemberToProject(
        addingToProject.id,
        selectedUsers.map((user_id) => ({ user_id }))
      );
      setAlert({ type: "success", message: `${selectedUsers.length} member(s) added to project` });
      setAddingToProject(null);
      setSelectedUsers([]);
      await getAllProjects(page);
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Failed to add members" });
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveProjectMember = async (memberId, memberName, projectId) => {
    try {
      setRemovingMember(memberId);
      await removeMemberFromProject(memberId, projectId);
      setAlert({ type: "success", message: `${memberName} removed from project` });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Failed to remove member" });
    } finally {
      setRemovingMember(null);
    }
  };

  const PROJECT_TYPES = {
  web: ["static", "dynamic"],
  app: ["android", "ios", "native"],
  desktop: ["windows", "mac", "linux", "native"],
};

const STATUS_COLORS = {
  planning:  "bg-slate-100 text-slate-600",
  active:    "bg-emerald-100 text-emerald-700",
  on_hold:   "bg-amber-100 text-amber-700",
  testing:   "bg-purple-100 text-purple-700",
  completed: "bg-blue-100 text-blue-700",
};


const addMemberRow = () => {
  setForm((prev) => ({
    ...prev,
    members: [
      ...prev.members,
      {
        user_id: "",
        role_id: "",
      },
    ],
  }));
};

const updateMember = (
  index,
  field,
  value
) => {
  setForm((prev) => {
    const members = [...prev.members];

    members[index] = {
      ...members[index],
      [field]: value,
    };

    return {
      ...prev,
      members,
    };
  });
};

const removeMember = (index) => {
  setForm((prev) => ({
    ...prev,
    members: prev.members.filter(
      (_, i) => i !== index
    ),
  }));
};




const handleProjectTypeChange = (
  type,
  subtype,
  checked
) => {
  setForm((prev) => {
    const current = prev.project_types[type] || [];

    let updated;

    if (checked) {
      updated = [...current, subtype];
    } else {
      updated = current.filter(
        (item) => item !== subtype
      );
    }

    const project_types = {
      ...prev.project_types,
      [type]: updated,
    };

    // remove empty arrays
    if (updated.length === 0) {
      delete project_types[type];
    }

    return {
      ...prev,
      project_types,
    };
  });
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Project name is required";

    if(!form.tech_details.trim())
      errors.tech_details = "Technical details are required";

    if(!form.project_types || Object.keys(form.project_types).length === 0)
    {
      errors.project_types = "Select at least one project type"
    }
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
  name: project.name || "",
  description: project.description || "",
  project_types: project.project_types || {},
  tech_details: project.tech_details || "",
  development_status: project.development_status || "",
  remark: "",
});
    setFieldErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateProject(editTarget.id, {
  name: form.name,
  description: form.description || null,
  project_types: form.project_types,
  tech_details: form.tech_details,
  development_status: form.development_status || null,
  remark: form.remark || null,
});
        setAlert({ type: "success", message: "Project configuration updated" });
      } else {
await createProject({
  name: form.name,
  description: form.description || null,
  project_types: form.project_types,
  tech_details: form.tech_details,
  development_status: form.development_status || null,
  remark: form.remark || null,
});
        setAlert({ type: "success", message: "New project" });
      }
      closeModal();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Operation failed" });
    } finally {
      setSubmitting(false);
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
      <div className="flex flex-col lg:flex-row md:items-center justify-between gap-4">
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
          <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Active Missions</h4>
          <p className="text-slate-400 font-bold mt-2">Establish your first project to begin logging data.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Project </th>
                  <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Code </th>
                  <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Type </th>
                  <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Lead</th>
                  <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Members</th>
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
                          {expandedRow === project.id ? <FaChevronDown size={8} /> : <MdChevronRight size={14} />}
                        </button>
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
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>

                     {/* Expanded members row — Team.jsx-style */}
                    {expandedRow === project.id && (
                      <tr key={`${project.id}-members`} className="bg-slate-50/30">
                        <td colSpan={8} className="px-10 py-6">
                          <div className="space-y-5">

                            {/* Section header */}
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                Project Members ({project.members?.length || 0})
                              </h4>
                              <button
                                className="flex items-center gap-2 text-xs font-black text-[#132ea7] uppercase tracking-widest hover:bg-[#132ea7]/10 px-3 py-1.5 rounded-xl transition-all"
                                onClick={() => setAddingToProject(addingToProject?.id === project.id ? null : project)}
                              >
                                <MdPersonAdd size={16} />
                                Add Members
                              </button>
                            </div>

                            {/* Current members grid */}
                            {!project.members?.length ? (
                              <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-slate-200">
                                <MdGroup size={24} className="text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No members yet</p>
                                <p className="text-slate-300 text-xs mt-1">Click "Add Members" to get started</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {project.members.map((m) => (
                                  <div
                                    key={m.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 group shadow-sm"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-8 h-8 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-sm flex-shrink-0">
                                        {m.user?.name?.charAt(0) || "?"}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-700 truncate">{m.user?.name || "Unknown"}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{m.role?.name || m.user?.employee_id || "—"}</p>
                                      </div>
                                    </div>
                                    <button
                                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 ml-2"
                                      onClick={() => handleRemoveProjectMember(m.id, m.user?.name, project.id)}
                                      disabled={removingMember === m.id}
                                      title="Remove Member"
                                    >
                                      {removingMember === m.id ? <Spinner size="xs" /> : <MdPersonRemove size={16} />}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Inline Add Members Panel */}
                            {addingToProject?.id === project.id && (() => {
                              const availableEmps = getAvailableEmployees(project);
                              return (
                                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                                    Select Employees to Add
                                  </h4>
                                  {availableEmps.length === 0 ? (
                                    <p className="text-slate-400 font-medium text-sm text-center py-4">
                                      All employees are already in this project
                                    </p>
                                  ) : (
                                    <>
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-56 overflow-y-auto custom-scrollbar">
                                        {availableEmps.map((emp) => {
                                          const isSelected = selectedUsers.includes(emp.id);
                                          return (
                                            <button
                                              key={emp.id}
                                              onClick={() => toggleSelectUser(emp.id)}
                                              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                                                isSelected
                                                  ? "bg-[#132ea7] border-[#132ea7] text-white"
                                                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-[#132ea7]/30"
                                              }`}
                                            >
                                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                                                isSelected ? "bg-white/20 text-white" : "bg-white text-[#132ea7]"
                                              }`}>
                                                {emp.name?.charAt(0)}
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                <p className={`text-xs font-black truncate ${isSelected ? "text-white" : "text-slate-700"}`}>
                                                  {emp.name}
                                                </p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                                                  {emp.employee_id}
                                                </p>
                                              </div>
                                              {isSelected && <MdCheckCircle size={15} className="flex-shrink-0" />}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                          {selectedUsers.length} selected
                                        </p>
                                        <div className="flex gap-3">
                                          <button
                                            className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
                                            onClick={() => { setAddingToProject(null); setSelectedUsers([]); }}
                                          >
                                            Cancel
                                          </button>
                                          <Button
                                            variant="primary"
                                            className="px-5 py-2 text-xs font-black uppercase tracking-widest h-auto"
                                            onClick={handleAddProjectMembers}
                                            loading={addingMember}
                                            disabled={selectedUsers.length === 0}
                                          >
                                            Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
                                          </Button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })()}

                          </div>
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
              placeholder="e.g. Phoenix Protocol"
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


            <Textarea
  label="Technical Details"
  name="tech_details"
  value={form.tech_details}
  onChange={handleChange}
  error={fieldErrors.tech_details}
  rows={4}
  required
/>

<Select
  label="Development Status"
  name="development_status"
  value={form.development_status}
  onChange={handleChange}
  options={[
    { label: "Planning", value: "Planning" },
    { label: "In Progress", value: "In Progress" },
    { label: "Testing", value: "Testing" },
    { label: "Completed", value: "Completed" },
  ]}
/>


<div>
  <label className="block mb-3 font-bold text-slate-700">
    Project Types
  </label>

  <div className="space-y-6">
    {Object.entries(PROJECT_TYPES).map(
      ([type, subtypes]) => (
        <div
          key={type}
          className="border rounded-2xl p-4"
        >
          <h4 className="font-bold capitalize mb-3">
            {type}
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {subtypes.map((subtype) => (
              <label
                key={subtype}
                className="flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={
                    form.project_types?.[
                      type
                    ]?.includes(subtype) || false
                  }
                  onChange={(e) =>
                    handleProjectTypeChange(
                      type,
                      subtype,
                      e.target.checked
                    )
                  }
                />

                <span className="capitalize">
                  {subtype}
                </span>
              </label>
            ))}
          </div>
        </div>
      )
    )}
  </div>

  {fieldErrors.project_types && (
    <p className="text-red-500 text-sm mt-2">
      {fieldErrors.project_types}
    </p>
  )}
</div>


<div className="border rounded-2xl p-4">
  <h3 className="font-bold mb-4">
    Project Members
  </h3>

  <div className="space-y-3">
    {form.members.map((member, index) => (
      <div
        key={index}
        className="grid grid-cols-2 gap-3"
      >
        <Select
          value={member.user_id}
          onChange={(e) =>
            updateMember(index, "user_id", e.target.value)
          }
          options={[
            { label: "Select Employee", value: "" },

            ...users.map((u) => ({
              label: `${u.name} (${u.employee_id})`,
              value: u.id,
            })),
          ]}
        />

        <Select
          value={member.role_id}
          onChange={(e) =>
            updateMember(index, "role_id", e.target.value)
          }
          options={[
            { label: "Select Role", value: "" },

            ...roles.map((r) => ({
              label: r.name,
              value: r.id,
            })),
          ]}
        />
      </div>
    ))}
  </div>

  <Button
    type="button"
    onClick={addMemberRow}
    className="mt-4"
  >
    Add Member
  </Button>
</div>

           <Textarea
  label="Add Remark"
  name="remark"
  value={form.remark}
  onChange={handleChange}
  rows={2}
/>
          </div>
          <div className="flex gap-4 pt-8 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>Abort</Button>
            <Button type="submit" variant="primary" className="flex-[2] h-16 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm" loading={submitting}>
              {editTarget ? "Update" : "Deploy Project"}
            </Button>
          </div>
        </form>
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