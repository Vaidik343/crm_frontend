import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useRole } from "../../context/RoleContext";
import { usePassword } from "../../context/PasswordContext";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";

import { MdEdit, MdDelete, MdLockReset, MdVisibility } from "react-icons/md";

const initialForm = { name: "", email: "", role_id: "", is_admin: false };

const Employees = () => {
  const { users, loading, getAllUsers, createUser, updateUser, deleteUser } = useUser();
  const { roles, getAllRoles } = useRole();
  const { resetPassword } = usePassword();

  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [form, setForm]                 = useState(initialForm);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [submitting, setSubmitting]     = useState(false);
  const [alert, setAlert]               = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [resetting, setResetting]       = useState(null);
  const [credentials, setCredentials]   = useState(null);


  useEffect(() => {
    getAllUsers();
    getAllRoles();
  }, []);

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));
  // console.log("🚀 ~ Employees ~ roleOptions:", roleOptions)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const validate = () => {
    const errors = {};
    if (!form.name.trim())    errors.name    = "Name is required";
    if (!form.role_id)        errors.role_id = "Role is required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errors.email = "Invalid email";
    return errors;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setCredentials(null);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setForm({ name: user.name, email: user.email || "", role_id: user.role_id, is_admin: user.is_admin });
    setFieldErrors({});
    setCredentials(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setCredentials(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateUser(editTarget.id, {
          name: form.name,
          email: form.email || undefined,
          role_id: form.role_id,
          is_admin: form.is_admin,
        });
        setAlert({ type: "success", message: "Employee updated successfully" });
        closeModal();
      } else {
        const res = await createUser({
          name: form.name,
          email: form.email || undefined,
          role_id: form.role_id,
          is_admin: form.is_admin,
        });
        // show generated credentials inside modal
        setCredentials(res.credentials);
        await getAllUsers();
      }
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
      await deleteUser(confirmDelete.id);
      setAlert({ type: "success", message: "Employee deleted" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleResetPassword = async (user) => {
    try {
      setResetting(user.id);
      const res = await resetPassword(user.id);
      console.log("🚀 ~ handleResetPassword ~ res:", res)
      setCredentials(res.credentials);
      setShowModal(true);
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Reset failed" });
    } finally {
      setResetting(null);
    }
  };

  if (loading && !users.length) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1 valorant-text">Employees</h4>
          <p className="text-muted small mb-0">{users.length} total employees</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + Add Employee
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 text-muted small text-uppercase fw-semibold">Employee</th>
                  <th className="text-muted small text-uppercase fw-semibold">ID</th>
                  <th className="text-muted small text-uppercase fw-semibold">Role</th>
                  <th className="text-muted small text-uppercase fw-semibold">Type</th>
                  <th className="text-muted small text-uppercase fw-semibold">Email</th>
                  <th className="text-muted small text-uppercase fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-5">
                      No employees found
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-3">
                      <div className="fw-semibold">{user.name}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{user.employee_id}</span>
                    </td>
                    <td>
                      <span className="text-muted small">{user.Role?.name || "—"}</span>
                    </td>
                    <td>
                      {user.is_admin
                        ? <Badge value="Admin" overrideColor="danger" />
                        : <Badge value="Employee" overrideColor="secondary" />
                      }
                    </td>
                    <td>
                      <span className="text-muted small">{user.email || "—"}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-primary" onClick={() => openEdit(user)}>
                            <MdEdit size={14} className="me-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-warning"
                          loading={resetting === user.id}
                          onClick={() => handleResetPassword(user)}
                        >
                           <MdLockReset size={14} className="me-1" /> Reset Pass
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => setConfirmDelete(user)}
                        >
                            <MdDelete size={14} className="me-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={credentials ? "Employee Credentials" : editTarget ? "Edit Employee" : "Add Employee"}
        size="lg"
      >
        {/* Show credentials after create or reset */}
        {credentials ? (
          <div>
    <Alert type="success" message="Employee created. Share these credentials." />
    <div className="bg-light rounded p-4 mb-3">

      <div className="mb-3">
        <p className="text-muted small mb-1">Employee ID</p>
        <div className="d-flex align-items-center gap-2">
          <h5 className="fw-bold mb-0">{credentials.employee_id}</h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              navigator.clipboard.writeText(credentials.employee_id);
            }}
          >
            Copy
          </button>
        </div>
      </div>

      <div>
        <p className="text-muted small mb-1">Password</p>
        <div className="d-flex align-items-center gap-2">
          <h5 className="fw-bold mb-0 text-danger">{credentials.password}</h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              navigator.clipboard.writeText(credentials.password);
            }}
          >
            Copy
          </button>
        </div>
      </div>

    </div>

    {/* Copy both at once */}
    <button
      className="btn btn-outline-primary w-100 mb-3"
      onClick={() => {
        navigator.clipboard.writeText(
          `Employee ID: ${credentials.employee_id}\nPassword: ${credentials.password}`
        );
      }}
    >
      Copy All Credentials
    </button>

    <p className="text-muted small">
      Share these with the employee. They can change their password after login.
    </p>
    <div className="d-flex justify-content-end">
      <Button variant="primary" onClick={closeModal}>Done</Button>
    </div>
  </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  error={fieldErrors.name}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div className="col-md-6">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={fieldErrors.email}
                  placeholder="e.g. john@company.com"
                  required
                />
              </div>
              <div className="col-md-6">
                <Select
                  label="Role"
                  name="role_id"
                  value={form.role_id}
                  onChange={handleChange}
                  options={roleOptions}
                  error={fieldErrors.role_id}
                  placeholder="Select a role"
                  required
                />
              </div>
              <div className="col-md-6 d-flex align-items-center mt-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="is_admin"
                    name="is_admin"
                    checked={form.is_admin}
                    onChange={handleChange}
                  />
                  <label className="form-check-label fw-medium" htmlFor="is_admin">
                    Grant Admin Access
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
              <Button variant="secondary" onClick={closeModal} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                {editTarget ? "Update Employee" : "Create Employee"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Employees;