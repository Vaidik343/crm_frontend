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

import { MdAdd, MdBusinessCenter, MdCalendarToday, MdEdit, MdDelete, MdPerson, MdPowerSettingsNew, MdFolder } from "react-icons/md";

const initialForm = { name: "", description: "", remarks: "" };

const Projects = () => {
  const { projects, loading,  page,
  totalPages, getAllProjects, createProject, updateProject, deleteProject } = useProject();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getAllProjects(page);
  }, [page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Project name is required";
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
      remarks: project.remarks || "",
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
          remarks: form.remarks || null,
        });
        setAlert({ type: "success", message: "Project configuration updated" });
      } else {
        await createProject({
          name: form.name,
          description: form.description || null,
          remarks: form.remarks || null,
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
          <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Active Missions</h4>
          <p className="text-slate-400 font-bold mt-2">Establish your first project to begin logging data.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Project Designation</th>
                  <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Lead</th>
                  <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Date</th>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {projects.map((project) => (
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
              label="Remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Internal notes or special instructions..."
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