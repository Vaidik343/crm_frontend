import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useRole } from "../../context/RoleContext";
import { usePassword } from "../../context/PasswordContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";

import { MdAdd, MdEdit, MdDelete, MdLockReset, MdContentCopy, MdCheckCircle, MdPerson, MdMail, MdAssignmentInd } from "react-icons/md";

const initialForm = { name: "", email: "", employee_id: "", role_id: "" };

const Employees = () => {
  const { users, loading, getAllUsers, createUser, updateUser, deleteUser } = useUser();
  const { roles, getAllRoles } = useRole();
  const { resetPassword } = usePassword();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getAllUsers();
    getAllRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.role_id) errors.role_id = "Role is required";
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
    setForm({
      name: user.name,
      email: user.email || "",
      employee_id: user.employee_id || "",
      role_id: user.role_id || "",
    });
    setFieldErrors({});
    setCredentials(null);
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
        await updateUser(editTarget.id, form);
        setAlert({ type: "success", message: "Profile updated successfully" });
        closeModal();
      } else {
        const res = await createUser(form);
        // show generated credentials inside modal
        setCredentials(res.credentials); 
        setAlert({ type: "success", message: "New Employee created successfully" });
      }
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Operation failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteUser(confirmDelete.id);
      setAlert({ type: "success", message: "Employee record purged" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Purge failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleResetPassword = async (user) => {
    try {
      setResetting(user.id);
      const res = await resetPassword(user.id);
      setCredentials(res.credentials);
      setShowModal(true);
      setAlert({ type: "success", message: "Access code reset complete" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Reset failed" });
    } finally {
      setResetting(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !users.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-medium animate-pulse">Syncing team records...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            Team <span className="text-[#132ea7]">Management</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Manage your workforce and access levels ({users.length} total)</p>
        </div>
        <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 py-3 px-8 rounded h-[52px] font-black uppercase tracking-widest text-sm" onClick={openCreate}>
          <MdAdd size={22} />
          Add New Employee
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Employee Info</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Access Type</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-16 font-medium italic text-lg">No active Employees found.</td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#132ea7]/20">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-lg leading-tight">{user.name}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{user.employee_id}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <MdAssignmentInd className="text-[#132ea7]" size={20} />
                      <span className="text-sm font-black text-slate-600 uppercase tracking-wider">{user.Role?.name || "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge value={user.role === "admin" ? "admin" : "employee"} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-[#132ea7] transition-colors cursor-pointer">
                      <MdMail size={18} />
                      {user.email || "—"}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEdit(user)}
                        title="Edit Profile"
                        className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
                      >
                        <MdEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        title="Reset Password"
                        disabled={resetting === user.id}
                        className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-500/10 hover:text-amber-500 transition-all disabled:opacity-50"
                      >
                        <MdLockReset size={20} className={resetting === user.id ? "animate-spin" : ""} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(user)}
                        title="Delete Employee"
                        className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
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
      </div>

      {/* Create / Edit / Credentials Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={credentials ? "Security Authorization" : (editTarget ? "Modify Profile" : "Create New Profile")}
        size={credentials ? "md" : "sm"}
      >
        {credentials ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-[1.5rem] p-8 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                <MdCheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-black text-emerald-900 text-xl leading-tight">Authorization Successful</h4>
                <p className="text-emerald-700/70 text-base mt-1 font-bold">Please share these unique credentials with the Employee immediately.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">ID</span>
                </div>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-14 py-5 font-black text-slate-800 text-2xl tracking-tight">
                  {credentials.employee_id}
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.employee_id)}
                  className="absolute inset-y-3 right-3 px-4 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#132ea7] transition-all shadow-sm hover:border-[#132ea7]"
                >
                  <MdContentCopy size={20} />
                </button>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">PW</span>
                </div>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-14 py-5 font-black text-[#132ea7] text-2xl tracking-tight">
                  {credentials.password}
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.password)}
                  className="absolute inset-y-3 right-3 px-4 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#132ea7] transition-all shadow-sm hover:border-[#132ea7]"
                >
                  <MdContentCopy size={20} />
                </button>
              </div>
            </div>

            <div className="pt-6 flex flex-col gap-4">
              <Button
                variant="primary"
                className="h-16 text-xl font-black rounded-2xl shadow-xl shadow-[#132ea7]/20"
                onClick={() => {
                  copyToClipboard(`Employee ID: ${credentials.employee_id}\nAccess Code: ${credentials.password}`);
                }}
              >
                {copied ? "Copied All Credentials!" : "Copy Full Access Package"}
              </Button>
              <Button variant="ghost" onClick={closeModal} className="text-slate-400 font-black uppercase tracking-widest text-sm">Close Secure Portal</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={fieldErrors.name}
                placeholder="e.g. John Doe"
                required
              />
              <Input
                label="Work Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={fieldErrors.email}
                placeholder="john@example.com"
                required
              />
              {/* <Input
                label="Employee ID (Auto-generated if empty)"
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
                error={fieldErrors.employee_id}
                placeholder="e.g. EMP001"
              /> */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Assigned Role</label>
                <select
                  name="role_id"

                  value={form.role_id}
                  onChange={handleChange}

                  className={`w-full bg-slate-50 border ${fieldErrors.role_id ? 'border-red-500' : 'border-slate-100'} rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none`}
                >
                  <option value="">Select Authority Level...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}

                </select>
                {fieldErrors.role_id && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{fieldErrors.role_id}</p>}
              </div>
            </div>

            <div className="flex gap-4 pt-8 border-t border-slate-50">
              <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>Abort</Button>
              <Button type="submit" variant="primary" className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-widest text-sm" loading={submitting}>
                {editTarget ? "Authorize Update" : "Create Employee"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`This action will permanently purge Employee "${confirmDelete?.name}" from the system archives. This cannot be reversed.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Employees;