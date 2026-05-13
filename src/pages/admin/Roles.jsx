import { useEffect, useState } from "react";
import { useRole } from "../../context/RoleContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";

const initialForm = { name: "" };

const Roles = () => {
  const { roles, loading, getAllRoles, createRole, updateRole, deleteRole } = useRole();

  const [showModal, setShowModal]         = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [form, setForm]                   = useState(initialForm);
  const [fieldErrors, setFieldErrors]     = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [alert, setAlert]                 = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    getAllRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Role name is required";
    return errors;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (role) => {
    setEditTarget(role);
    setForm({ name: role.name });
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
        await updateRole(editTarget.id, { name: form.name });
        setAlert({ type: "success", message: "Role updated successfully" });
      } else {
        await createRole({ name: form.name });
        setAlert({ type: "success", message: "Role created successfully" });
      }
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong";
      setAlert({ type: "danger", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteRole(confirmDelete.id);
      setAlert({ type: "success", message: "Role deleted successfully" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed. Role may be assigned to employees." });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (loading && !roles.length) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Roles</h4>
          <p className="text-muted small mb-0">{roles.length} total roles</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + Add Role
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Roles grid */}
      {roles.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="mb-0">No roles found. Create one to get started.</p>
        </div>
      ) : (
        <div className="row g-3">
          {roles.map((role) => (
            <div key={role.id} className="col-md-4 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-2"
                      style={{ width: 36, height: 36, fontSize: 16 }}
                    >
                      🏷️
                    </div>
                    <span className="fw-semibold">{role.name}</span>
                  </div>
                  <div className="d-flex gap-1">
                    <Button size="sm" variant="outline-primary" onClick={() => openEdit(role)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => setConfirmDelete(role)}>
                      Del
                    </Button>
                  </div>
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
        title={editTarget ? "Edit Role" : "Add Role"}
        size="sm"
      >
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Role Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
            placeholder="e.g. Project Manager"
            required
          />
          <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editTarget ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This will fail if employees are assigned to this role.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Roles;