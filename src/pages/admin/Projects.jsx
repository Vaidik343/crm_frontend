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

const initialForm = { name: "", description: "", remarks: "" };

const Projects = () => {
  const { projects, loading, getAllProjects, createProject, updateProject, deleteProject } = useProject();

  const [showModal, setShowModal]         = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [form, setForm]                   = useState(initialForm);
  const [fieldErrors, setFieldErrors]     = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [alert, setAlert]                 = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    getAllProjects();
  }, []);

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
      name:        project.name        || "",
      description: project.description || "",
      remarks:     project.remarks     || "",
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
          name:        form.name,
          description: form.description || null,
          remarks:     form.remarks     || null,
        });
        setAlert({ type: "success", message: "Project updated successfully" });
      } else {
        await createProject({
          name:        form.name,
          description: form.description || null,
          remarks:     form.remarks     || null,
        });
        setAlert({ type: "success", message: "Project created successfully" });
      }
      closeModal();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (project) => {
    try {
      await updateProject(project.id, { is_active: !project.is_active });
      setAlert({
        type: "success",
        message: `Project ${project.is_active ? "deactivated" : "activated"} successfully`,
      });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Update failed" });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteProject(confirmDelete.id);
      setAlert({ type: "success", message: "Project deleted" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (loading && !projects.length) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Projects</h4>
          <p className="text-muted small mb-0">{projects.length} total projects</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + New Project
        </Button>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="mb-0">No projects found. Create one to get started.</p>
        </div>
      ) : (
        <div className="row g-3">
          {projects.map((project) => (
            <div key={project.id} className="col-md-6 col-lg-4">
              <div className={`card border-0 shadow-sm h-100 ${!project.is_active ? "opacity-75" : ""}`}>
                <div className="card-body">

                  {/* Status badge */}
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <Badge
                      value={project.is_active ? "active" : "inactive"}
                    />
                    <span className="text-muted small">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Name */}
                  <h6 className="fw-bold mb-1">{project.name}</h6>

                  {/* Description */}
                  {project.description && (
                    <p className="text-muted small mb-1">{project.description}</p>
                  )}

                  {/* Remarks */}
                  {project.remarks && (
                    <p className="text-muted small mb-1">
                      <span className="fw-medium">Remarks:</span> {project.remarks}
                    </p>
                  )}

                  {/* Created by */}
                  <p className="text-muted small mb-0 mt-2">
                    Created by:{" "}
                    <span className="fw-medium text-dark">
                      {project.creator?.name || "—"}
                    </span>
                  </p>

                </div>

                {/* Actions */}
                <div className="card-footer bg-white border-top d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="flex-grow-1"
                    onClick={() => openEdit(project)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={project.is_active ? "outline-warning" : "outline-success"}
                    className="flex-grow-1"
                    onClick={() => handleToggleActive(project)}
                  >
                    {project.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => setConfirmDelete(project)}
                  >
                    Del
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Edit Project" : "New Project"}
      >
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Project Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
            placeholder="e.g. Client Portal v2"
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description of the project..."
            rows={3}
          />
          <Textarea
            label="Remarks"
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            placeholder="Any additional remarks..."
            rows={2}
          />
          <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editTarget ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`Delete "${confirmDelete?.name}"? This cannot be undone and will fail if calls are linked to this project.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Projects;