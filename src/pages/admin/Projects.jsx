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


import { MdAdd, MdGroup , MdAssignment , MdVisibility, MdSearch, MdChevronRight , MdBusinessCenter, MdCalendarToday, MdEdit, MdDelete, MdPerson, MdPowerSettingsNew, MdFolder, MdPersonAdd, MdPersonRemove, MdCheckCircle } from "react-icons/md";
import { useRole } from './../../context/RoleContext';
import Select from './../../components/ui/Select';
import { useUser } from './../../context/UserContext';
import { FaChevronDown } from "react-icons/fa";


const initialForm = {
  name: "",
  description: "",
  project_types: {},
  tech_details: [],
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
  const [viewTarget, setViewTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState("");

    // Expanded rows (members inline)
  const [expandedRow, setExpandedRow] = useState(null);

  // Inline add-member state (mirrors Team.jsx)
  const [addingToProject, setAddingToProject] = useState(null);
  const [selectedUsers, setSelectedUsers]     = useState({}); // { userId: roleId }
  const [addingMember, setAddingMember]       = useState(false);
  const [removingMember, setRemovingMember]   = useState(null);


    const [remarksTarget, setRemarksTarget] = useState(null);
    const [remarkText, setRemarkText]       = useState("");
    const [remarkSubmitting, setRemarkSubmitting] = useState(false);
    const [showNewRemark, setShowNewRemark] = useState(false);


  useEffect(() => {
    getAllProjects?.(page);
    getAllRoles?.();
     getAllUsers?.();
  }, [page]);


  // filter
const search = filter.toLowerCase().trim()

const filtered = search 
? (projects || []).filter((p) =>
  p.name?.toLowerCase().includes(search) ||
  p.code?.toLowerCase().includes(search)
) 
 : (projects || [])


  // ── Inline Member Helpers (Team.jsx-style) ──────────────────────────────
  const getMemberUserIds = (project) =>
    (project.members || []).map((m) => m.user_id || m.user?.id);

  const getAvailableEmployees = (project) => {
    const memberIds = getMemberUserIds(project);
    return users.filter((u) => !memberIds.includes(u.id));
  };

  const toggleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      const next = { ...prev };
      if (next[userId] !== undefined) {
        delete next[userId];
      } else {
        next[userId] = "";
      }
      return next;
    });
  };

  const handleUserRoleChange = (userId, roleId) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [userId]: roleId,
    }));
  };

    
  const handleAddProjectMembers = async () => {
    const userIds = Object.keys(selectedUsers);
    if (!addingToProject || userIds.length === 0) return;
    try {
      setAddingMember(true);
      await addMemberToProject(
        addingToProject.id,
        userIds.map((user_id) => ({ user_id, role_id: selectedUsers[user_id] || null }))
      );
      setAlert({ type: "success", message: `${userIds.length} member(s) added to project` });
      setAddingToProject(null);
      setSelectedUsers({});
      await getAllProjects(page);
    } catch (err) {
      console.log("🚀 ~ handleAddProjectMembers ~ err:", err)
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
  // on_hold:   "bg-amber-100 text-amber-700",
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


const addTechRow = () => {
  setForm((prev) => ({
    ...prev,
    tech_details: [...prev.tech_details, { name: "", version: "" }],
  }));
};

const updateTech = (index, field, value) => {
  setForm((prev) => {
    const tech_details = [...prev.tech_details];
    tech_details[index] = { ...tech_details[index], [field]: value };
    return { ...prev, tech_details };
  });
};

const removeTech = (index) => {
  setForm((prev) => ({
    ...prev,
    tech_details: prev.tech_details.filter((_, i) => i !== index),
  }));
};


// ── Database helpers (nested inside a tech row) ──────────────────

const addDbRow = (techIndex) => {
  setForm((prev) => {
    const tech_details = [...prev.tech_details];
    tech_details[techIndex] = {
      ...tech_details[techIndex],
      databases: [
        ...(tech_details[techIndex].databases || []),
        { name: "", version: "" },
      ],
    };
    return { ...prev, tech_details };
  });
};

const updateDb = (techIndex, dbIndex, field, value) => {
  setForm((prev) => {
    const tech_details = [...prev.tech_details];
    const databases = [...(tech_details[techIndex].databases || [])];
    databases[dbIndex] = { ...databases[dbIndex], [field]: value };
    tech_details[techIndex] = { ...tech_details[techIndex], databases };
    return { ...prev, tech_details };
  });
};

const removeDb = (techIndex, dbIndex) => {
  setForm((prev) => {
    const tech_details = [...prev.tech_details];
    tech_details[techIndex] = {
      ...tech_details[techIndex],
      databases: tech_details[techIndex].databases.filter((_, i) => i !== dbIndex),
    };
    return { ...prev, tech_details };
  });
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

  // Handle both array and string safely
  const techIsEmpty = Array.isArray(form.tech_details)
    ? form.tech_details.length === 0
    : !form.tech_details;

  if (techIsEmpty) {
    errors.tech_details = "Add at least one technology";
  }

  if (!form.project_types || Object.keys(form.project_types).length === 0) {
    errors.project_types = "Select at least one project type";
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
     setShowNewRemark(false);
     // Normalize tech_details → always array of {name, version}
  let tech_details = project.tech_details || [];
if (typeof tech_details === "string") {
  tech_details = tech_details
    .split(/[\n,]+/)
    .map((s) => s.replace(/^[a-z\s]+:\s*/i, "").trim())
    .filter(Boolean)
    .map((name) => ({ name, version: "", databases: [] }));  // ← add databases: []
} else if (Array.isArray(tech_details)) {
  // Existing array records — ensure databases field exists
  tech_details = tech_details.map((t) => ({
    ...t,
    databases: t.databases || [],
  }));
} else {
  tech_details = [];
}
   setForm({
  name: project.name || "",
  description: project.description || "",
  project_types: project.project_types || {},
  // tech_details: project.tech_details || "",
  tech_details,
  development_status: project.development_status || "",
  remark: "",
   members: [], 
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
     console.log("UPDATE PAYLOAD", form);
    const errors = validate();
    console.log("🚀 ~ handleSubmit ~ errors:", errors)
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSubmitting(true);
      if (editTarget) {
      const updated = await updateProject(editTarget.id, {
  name: form.name,
  description: form.description || null,
  project_types: form.project_types,
  tech_details: form.tech_details,
  development_status: form.development_status || "active",
  remark: form.remark || null,
});
      console.log("🚀 ~ handleSubmit ~ updated:", updated)

if(viewTarget?.id === editTarget.id)
{
  setViewTarget(updated.name || updated)
}
        setAlert({ type: "success", message: "Project updated successfully" });
      } else {
await createProject({
  name: form.name,
  description: form.description || null,
  project_types: form.project_types,
  tech_details: form.tech_details,
  development_status: form.development_status || "active" ,
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
    const upm = await updateProject(project.id, { is_active: !project.is_active });
      console.log("🚀 ~ handleToggleActive ~ upm:", upm)
      setAlert({
        type: "success",
        message: `Project ${project.is_active ? "taken offline" : "restored online"}`,
      });
    } catch (err) {
       console.log("🚀 ~ handleToggleActive ~ err:", err)
      setAlert({ type: "danger", message: err?.response?.data?.message || "Status update failed" });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteProject(confirmDelete.id);
      setAlert({ type: "success", message: "Project record deleted" });
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

        <div className="relative w-full md:w-95">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <MdSearch size={20} />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 focus:border-[#132ea7] transition-all shadow-sm"
                      placeholder="Search Project name and Code..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
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
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200 shadow-2xl shadow-slate-200/40">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
            <MdBusinessCenter size={40} />
          </div>
          <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Active Missions</h4>
          <p className="text-slate-400 font-bold mt-2">Establish your first project to begin logging data.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table Container */}
          <div className="hidden md:block bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
            <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Project </th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Code </th>
                  {/* <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Type </th> */}
                  {/* <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Lead</th> */}
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Members</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Created By</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Date</th>
                  <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((project) => (
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
                      {/* <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(project.project_type) ? project.project_type : []).map((t) => (
                            <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase">{t}</span>
                          ))}
                          {(!project.project_type || !project.project_type.length) && <span className="text-slate-300 text-xs font-bold">—</span>}
                        </div>
                      </td> */}

                      {/* Tech */}
                      {/* <td className="px-6 py-5">
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
                      </td> */}

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

                    {/* project created */}
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
                          <button onClick={() => setViewTarget(project)} title="View" className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all">
                                                                  <MdVisibility size={18} />
                                                                </button>
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
                                          const isSelected = selectedUsers[emp.id] !== undefined;
                                          return (
                                            <div
                                              key={emp.id}
                                              className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${
                                                isSelected
                                                  ? "bg-slate-50 border-[#132ea7]/30 shadow-sm"
                                                  : "bg-white border-slate-200 hover:border-[#132ea7]/30"
                                              }`}
                                            >
                                              <div 
                                                className="flex items-center gap-2 cursor-pointer"
                                                onClick={() => toggleSelectUser(emp.id)}
                                              >
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                                                  isSelected ? "bg-[#132ea7] text-white" : "bg-slate-100 text-[#132ea7]"
                                                }`}>
                                                  {emp.name?.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                  <p className={`text-xs font-black truncate ${isSelected ? "text-[#132ea7]" : "text-slate-700"}`}>
                                                    {emp.name}
                                                  </p>
                                                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                    {emp.employee_id}
                                                  </p>
                                                </div>
                                                {isSelected ? (
                                                  <MdCheckCircle size={18} className="text-[#132ea7] flex-shrink-0" />
                                                ) : (
                                                  <div className="w-[18px] h-[18px] border-2 border-slate-200 rounded-full flex-shrink-0" />
                                                )}
                                              </div>
                                              
                                              {isSelected && (
                                                <div className="mt-1 animate-in fade-in slide-in-from-top-1 duration-200" onClick={(e) => e.stopPropagation()}>
                                                  <Select
                                                    value={selectedUsers[emp.id]}
                                                    onChange={(e) => handleUserRoleChange(emp.id, e.target.value)}
                                                    options={[
                                                      { label: "Select Role", value: "" },
                                                      ...roles.map(r => ({ label: r.name, value: r.id }))
                                                    ]}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                          {Object.keys(selectedUsers).length} selected
                                        </p>
                                        <div className="flex gap-3">
                                          <button
                                            className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
                                            onClick={() => { setAddingToProject(null); setSelectedUsers({}); }}
                                          >
                                            Cancel
                                          </button>
                                          <Button
                                            variant="primary"
                                            className="px-5 py-2 text-xs font-black uppercase tracking-widest h-auto"
                                            onClick={handleAddProjectMembers}
                                            loading={addingMember}
                                            disabled={Object.keys(selectedUsers).length === 0}
                                          >
                                            Add {Object.keys(selectedUsers).length > 0 ? `(${Object.keys(selectedUsers).length})` : ""}
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
                         <td className="px-10 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                                  <button onClick={() => setViewTarget(project)} title="View" className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all">
                                                                  <MdVisibility size={18} />
                                                                </button>
                                                  <button
                                                    onClick={() => openEdit(project)}
                                                    className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
                                                  >
                                                    <MdEdit size={20} />
                                                  </button>
                                                  <button
                                                    onClick={() => setConfirmDelete(project)}
                                                    className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                  >
                                                    <MdDelete size={20} />
                                                  </button>
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

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filtered.map((project) => (
              <div key={project.id} className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3 ${!project.is_active ? "opacity-60" : ""}`}>
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 shadow-inner ${project.is_active ? 'bg-[#132ea7]/10 text-[#132ea7]' : 'bg-slate-100 text-slate-400'}`}>
                    <MdFolder size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 leading-tight uppercase truncate">{project.name}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#132ea7]/10 text-[#132ea7] rounded-md text-[10px] font-black uppercase tracking-widest">{project.code || "—"}</span>
                  </div>
                  <Badge value={project.is_active ? "active" : "inactive"} />
                </div>

                {project.description && (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Meta Info */}
                <div className="space-y-2 text-sm pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Dev Status</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[project.development_status] || "bg-slate-100 text-slate-600"}`}>
                      {project.development_status || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Created By</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[9px] uppercase">
                        {project.creator?.name?.charAt(0) || <MdPerson size={10} />}
                      </div>
                      <span className="font-bold text-slate-600 text-xs">{project.creator?.name || "—"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Members</span>
                    <button
                      onClick={() => setExpandedRow(expandedRow === project.id ? null : project.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-[#132ea7]/10 hover:text-[#132ea7] text-slate-500 font-black text-[10px] transition-all"
                    >
                      <MdGroup size={12} />
                      {project.members?.length || 0}
                      {expandedRow === project.id ? <FaChevronDown size={8} /> : <MdChevronRight size={12} />}
                    </button>
                  </div>
                </div>

                {/* Mobile Expanded Members */}
                {expandedRow === project.id && (
                  <div className="mt-3 bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Project Members ({project.members?.length || 0})
                      </h4>
                      <button
                        onClick={() => setAddingToProject(addingToProject?.id === project.id ? null : project)}
                        className="text-[#132ea7] hover:text-[#132ea7]/70 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                      >
                        {addingToProject?.id === project.id ? "Cancel Add" : <><MdPersonAdd size={12} /> Add</>}
                      </button>
                    </div>

                    {addingToProject?.id === project.id && (
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 space-y-3">
                        <div className="space-y-2 max-h-[150px] overflow-y-auto">
                          {getAvailableEmployees(project).length === 0 ? (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-2">No available employees</p>
                          ) : (
                            getAvailableEmployees(project).map(u => (
                              <div key={u.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers[u.id] !== undefined}
                                  onChange={() => toggleSelectUser(u.id)}
                                  className="w-3 h-3 text-[#132ea7] rounded border-slate-300"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black text-slate-700 truncate">{u.name}</p>
                                </div>
                                {selectedUsers[u.id] !== undefined && (
                                  <select
                                    value={selectedUsers[u.id]}
                                    onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                                    className="w-24 text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded px-1 py-0.5"
                                  >
                                    <option value="">Role</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                  </select>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                        {Object.keys(selectedUsers).length > 0 && (
                          <Button variant="primary" onClick={handleAddProjectMembers} loading={addingMember} className="w-full py-1.5 text-[10px]">
                            Confirm Add
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      {project.members?.map((m) => (
                        <div key={m.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-[9px]">
                              {m.user?.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-700">{m.user?.name}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{m.role?.name || "Member"}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveProjectMember(m.id, m.user?.name, project.id)}
                            disabled={removingMember === m.id}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                          >
                            <MdPersonRemove size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setViewTarget(project)} className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all">
                    <MdVisibility size={16} /> View
                  </button>
                  <button onClick={() => openEdit(project)} className="flex-1 h-10 rounded-xl bg-[#132ea7]/10 text-[#132ea7] font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/20 transition-all">
                    <MdEdit size={16} /> Edit
                  </button>
                  <button onClick={() => handleToggleActive(project)} className={`flex-1 h-10 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-all ${project.is_active ? "bg-amber-50 text-amber-500 hover:bg-amber-100" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"}`}>
                    <MdPowerSettingsNew size={16} /> {project.is_active ? "Off" : "On"}
                  </button>
                  <button onClick={() => setConfirmDelete(project)} className="w-10 h-10 shrink-0 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center text-xs hover:bg-red-100 transition-all">
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
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


            {/* <Textarea
  label="Technical Details"
  name="tech_details"
  value={form.tech_details}
  onChange={handleChange}
  error={fieldErrors.tech_details}
  rows={4}
  required
/> */}

<div>
  <div className="flex items-center justify-between mb-3">
    <label className="font-bold text-slate-700">Technical Details</label>
    <button
      type="button"
      onClick={addTechRow}
      className="flex items-center gap-1 px-3 py-1.5 bg-[#132ea7]/10 text-[#132ea7] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#132ea7]/20 transition-all"
    >
      <MdAdd size={14} /> Add Tech
    </button>
  </div>

  {form.tech_details.length === 0 ? (
    <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
        No technologies added yet
      </p>
    </div>
  ) : (
    <div className="space-y-4">
      {form.tech_details.map((tech, techIndex) => (
        <div
          key={techIndex}
          className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/50"
        >
          {/* ── Tech row ── */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#132ea7] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
              {techIndex + 1}
            </div>
            <Input
              placeholder="Technology (e.g. React.js)"
              value={tech.name}
              onChange={(e) => updateTech(techIndex, "name", e.target.value)}
              className="flex-[2]"
            />
            <Input
              placeholder="Version (optional)"
              value={tech.version || ""}
              onChange={(e) => updateTech(techIndex, "version", e.target.value)}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => removeTech(techIndex)}
              className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
            >
              <MdDelete size={18} />
            </button>
          </div>

          {/* ── Databases for this tech ── */}
          <div className="pl-8 space-y-2">
            {(tech.databases || []).map((db, dbIndex) => (
              <div key={dbIndex} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                <Input
                  placeholder="Database (e.g. MSSQL)"
                  value={db.name}
                  onChange={(e) => updateDb(techIndex, dbIndex, "name", e.target.value)}
                  className="flex-[2]"
                />
                <Input
                  placeholder="Version (optional)"
                  value={db.version || ""}
                  onChange={(e) => updateDb(techIndex, dbIndex, "version", e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeDb(techIndex, dbIndex)}
                  className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                >
                  <MdDelete size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addDbRow(techIndex)}
              className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#132ea7] transition-all mt-1"
            >
              <MdAdd size={12} /> Add Database
            </button>
          </div>

        </div>
      ))}
    </div>
  )}

  {fieldErrors.tech_details && (
    <p className="text-red-500 text-sm mt-2">{fieldErrors.tech_details}</p>
  )}
</div>
<Select
  label="Development Status"
  name="development_status"
  value={form.development_status}
  onChange={handleChange}
  options={[
    
    { label: "Active", value: "active" },
    { label: "Planning", value: "planning" },
    { label: "Testing", value: "testing" },
    { label: "Completed", value: "completed" },
  ]}
  required
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


{/* <div className="border rounded-2xl p-4">
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
</div> */}

                   {/* Remarks section in edit modal */}
  <div className="md:col-span-2 space-y-3">
    <div className="flex items-center justify-between ml-1">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
        Remarks
      </label>
      {/* + button to toggle new remark input */}
      <button
        type="button"
        onClick={() => setShowNewRemark((prev) => !prev)}
        className="flex items-center gap-1 px-3 py-1.5 bg-[#132ea7]/10 text-[#132ea7] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#132ea7]/20 transition-all"
      >
        <MdAdd size={14} />
        {showNewRemark ? "Cancel" : "Add Remark"}
      </button>
    </div>

    {/* Existing remarks log */}
    {Array.isArray(editTarget?.remarks) && editTarget.remarks.length > 0 ? (
      <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
        {[...editTarget.remarks].reverse().map((r, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm font-bold text-slate-700">{r.text}</p>
            <div className="flex justify-between mt-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {r.added_by_name}
              </p>
              <p className="text-[10px] font-bold text-slate-300">
                {new Date(r.created_at).toLocaleString("default", {
                  month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit"
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      editTarget && (
        <p className="text-xs font-bold text-slate-400 text-center py-3">No remarks yet</p>
      )
    )}

    {/* New remark input — shown when + is clicked */}
    {showNewRemark && (
      <Textarea
        name="remark"
        value={form.remark}
        onChange={handleChange}
        placeholder="Add a new remark..."
        rows={2}
      />
    )}

    {/* On create — always show the textarea */}
    {/* {!editTarget && (
      <Textarea
        label="Initial Remark (optional)"
        name="remark"
        value={form.remark}
        onChange={handleChange}
        placeholder="Add a remark..."
        rows={2}
      />
    )} */}
  </div>
          </div>
          <div className="flex gap-4 pt-8 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>Abort</Button>
            <Button type="submit" variant="primary" className="flex-[2] h-16 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm" loading={submitting}>
              {editTarget ? "Update" : "Deploy Project"}
            </Button>
          </div>
        </form>
      </Modal>


        {/* ── View Modal ───────────────────────────────────────────── */}
        <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Project Details" size="lg">
          {viewTarget && (
            <div className="space-y-6 py-2">

              {/* Header */}
              <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center shrink-0 shadow-xl shadow-[#132ea7]/20">
                  <MdAssignment size={26} />
                </div>
                <div className="flex-1">
                  {/* <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-black text-slate-800">{viewTarget.task}</h3>
                    <Badge value={viewTarget.status} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
                    {viewTarget.display_id || "No display ID"}
                  </p> */}

                  <div className="flex items-center gap-3 flex-wrap">
                   <h3 className="text-xl font-black text-slate-800">
  {viewTarget.name}
</h3>

                    <Badge value={viewTarget.development_status} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
  {viewTarget.code}
</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5">
  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
    Project Types
  </p>

  <div className="flex flex-wrap gap-2">
    {Object.entries(viewTarget.project_types || {}).map(
      ([type, subtypes]) =>
        subtypes.map((sub) => (
          <span
            key={`${type}-${sub}`}
            className="px-3 py-1 rounded-lg bg-[#132ea7]/10 text-[#132ea7] text-xs font-bold"
          >
            {type} / {sub}
          </span>
        ))
    )}
  </div>
</div>



              {/* Info grid */}
              {/* <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Name", value: viewTarget.name || "—" },
                  { label: "Assigned By", value: viewTarget.assigner?.name || "—" },
                  { label: "Project", value: viewTarget.project?.name || "—" },
                  { label: "Due Date", value: viewTarget.due_date ? new Date(viewTarget.due_date).toLocaleDateString() : "—" },
                  { label: "Start Date", value: viewTarget.start_date ? new Date(viewTarget.start_date).toLocaleDateString() : "—" },
                  // { label: "Created", value: new Date(viewTarget.createdAt).toLocaleDateString() },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-black text-slate-700 text-sm">{item.value}</p>
                  </div>
                ))}
              </div> */}


              {/* tech_details */}
{viewTarget.tech_details && (
  <div className="space-y-3">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      Technical Details
    </p>

    {Array.isArray(viewTarget.tech_details) ? (
      <div className="space-y-2">
        {viewTarget.tech_details.map((tech, index) => (
          <div key={index} className="bg-[#132ea7] rounded-2xl p-4 text-white">
            {/* Tech name + version */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                {index + 1}
              </div>
              <span className="font-black text-sm">
                {tech.name}
                {tech.version ? (
                  <span className="ml-2 text-white/60 font-bold text-xs">v{tech.version}</span>
                ) : null}
              </span>
            </div>

            {/* Databases nested under this tech */}
            {tech.databases?.length > 0 && (
              <div className="mt-3 pl-7 space-y-1.5">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
                  Databases
                </p>
                <div className="flex flex-wrap gap-2">
                  {tech.databases.map((db, dbIndex) => (
                    <span
                      key={dbIndex}
                      className="px-3 py-1 rounded-lg bg-white/10 text-xs font-bold"
                    >
                      {db.name}
                      {db.version ? (
                        <span className="ml-1 text-white/50">v{db.version}</span>
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      // Legacy string fallback
      <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
        <p className="font-medium opacity-90">{viewTarget.tech_details}</p>
      </div>
    )}
  </div>
)}

              {/* Description */}
              {viewTarget.description && (
                <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Description</p>
                  <p className="font-medium leading-relaxed opacity-90">{viewTarget.description}</p>
                </div>
              )}

            {/* Remarks log */}
              {viewTarget.remarks && Array.isArray(viewTarget.remarks) && viewTarget.remarks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Remarks ({viewTarget.remarks.length})
                  </p>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                    {[...viewTarget.remarks].reverse().map((r, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm font-bold text-slate-700">{r.text}</p>
                        <div className="flex justify-between mt-1.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase">{r.added_by_name}</p>
                          <p className="text-[10px] font-bold text-slate-300">
                            {new Date(r.created_at).toLocaleString("default", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="ghost" onClick={() => setViewTarget(null)} className="font-black uppercase tracking-widest text-xs">Close</Button>
              </div>
            </div>
          )}
        </Modal>



      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`This action will delete "${confirmDelete?.name}" . This will fail if there are active intelligence logs (calls) linked to this project.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Projects;