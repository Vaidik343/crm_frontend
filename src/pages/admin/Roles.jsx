import { useEffect, useState } from "react";
import { useRole } from "../../context/RoleContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import { MdAdd, MdSecurity, MdEdit, MdDelete, MdShield } from "react-icons/md";

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
    if (!form.name.trim()) errors.name = "Authority level name is required";
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
        await updateRole(editTarget.id, form);
        setAlert({ type: "success", message: "Authority clearance updated" });
      } else {
        await createRole(form);
        setAlert({ type: "success", message: "New security tier established" });
      }
      closeModal();
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
      await deleteRole(confirmDelete.id);
      setAlert({ type: "success", message: "Authority tier purged" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Purge failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    } 
  }; 

  if (loading && !roles.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-medium animate-pulse">Syncing authority levels...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            <span className="text-[#132ea7]">Roles</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Total Roles:{roles.length}</p>
        </div>
        <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 py-3 px-8 rounded h-[52px] font-black uppercase tracking-widest text-sm" onClick={openCreate}>
          <MdAdd size={22} />
          Create New Role
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Roles grid */}
      {roles.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
             <MdSecurity size={32} />
          </div>
          <h4 className="text-lg font-bold text-slate-800">No Security Tiers Defined</h4>
          <p className="text-slate-400 font-medium">Establish a role to begin assigning permissions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 transition-all">
               <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 text-[#132ea7] flex items-center justify-center shadow-sm">
                     <MdShield size={28} />
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => openEdit(role)} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all"><MdEdit size={18} /></button>
                     <button onClick={() => setConfirmDelete(role)} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><MdDelete size={18} /></button>
                  </div>
               </div>

               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority Level</p>
                  <h3 className="text-xl font-black text-slate-800 leading-tight uppercase tracking-tight">{role.name}</h3>
               </div>


            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Modify Security Tier" : "Establish New Authority"}
        size="md"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <Input
            label="Authority Level Designation"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
            placeholder="e.g. Senior Field Employee"
            required
          />
          <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
             <p className="text-xs font-bold text-slate-500 italic">"Once established, you can fine-tune this tier's authorities in the Permissions Matrix module."</p>
          </div>
          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>Abort</Button>
            <Button type="submit" variant="primary" className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-widest text-sm" loading={submitting}>
              {editTarget ? "Authorize Update" : "Deploy Tier"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`This action will permanently purge the Security Tier "${confirmDelete?.name}" from the authorization system.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Roles;