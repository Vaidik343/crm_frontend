import { useEffect, useState } from "react";
import { useClient } from "../../context/ClientContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdPerson,
  MdPhone, MdEmail, MdBusiness, MdContactPage,
} from "react-icons/md";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  company: "",
};

const Clients = () => {
  const { clients, loading, getAllClients, createClient, updateClient, deleteClient } = useClient();

  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [form, setForm]                 = useState(initialForm);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [submitting, setSubmitting]     = useState(false);
  const [alert, setAlert]               = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [filter, setFilter]             = useState("");

  useEffect(() => { getAllClients(); }, []);

  const search = filter.toLowerCase().trim();
const filtered = search
  ? clients.filter((c) =>
      c.names?.some((n) =>
        n?.toLowerCase().includes(search)
      ) ||
      c.company?.toLowerCase().includes(search) ||
      c.phone?.includes(search)
    )
  : clients;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Client name is required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Enter a valid email";
    }
    return errors;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (client) => {
    setEditTarget(client);
    setForm({
      name:    client.name?.[0] || "",
      phone:   client.phone   || "",
      email:   client.email   || "",
      company: client.company || "",
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
      const payload = {
        name:    form.name.trim(),
        phone:   form.phone.trim()   || null,
        email:   form.email.trim()   || null,
        company: form.company.trim() || null,
      };

      if (editTarget) {
        await updateClient(editTarget.id, payload);
        setAlert({ type: "success", message: "Client updated successfully" });
      } else {
        await createClient(payload);
        setAlert({ type: "success", message: "Client added successfully" });
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
      await deleteClient(confirmDelete.id);
      setAlert({ type: "success", message: "Client removed" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (loading && !clients.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
        Loading clients...
      </p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col lg:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            <span className="text-[#132ea7]">Clients</span>
          </h2>
          {/* <p className="text-slate-500 font-bold text-base">
            Total Clients: {clients.length}
          </p> */}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <MdSearch size={20} />
          </div>
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 focus:border-[#132ea7] transition-all shadow-sm"
            placeholder="Search name, company, phone..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <Button
          variant="primary"
          className="shadow-lg shadow-[#132ea7]/20 py-3.5 px-8 rounded h-[52px] font-black uppercase tracking-widest text-sm"
          onClick={openCreate}
        >
          <MdAdd size={22} /> Add Client
        </Button>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200 shadow-2xl shadow-slate-200/40">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
            <MdContactPage size={40} />
          </div>
          <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            No Clients Yet
          </h4>
          <p className="text-slate-400 font-bold mt-2">
            Add your first client to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Phone</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Email</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Company</th>
                  {/* <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Added By</th> */}
                  <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-50 text-[#132ea7] group-hover:bg-[#132ea7] group-hover:text-white flex items-center justify-center font-black text-lg shadow-inner transition-all flex-shrink-0">
                          {client.names?.[0]?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-base leading-tight uppercase tracking-tight">
                            {client.names?.[0] || "Unnamed Client"}
                            {client.names?.length > 1 && (
  <div className="flex flex-wrap gap-1 mt-2">
    {client.names.slice(1).map((name) => (
      <span
        key={name}
        className="px-2 py-1 text-[10px] bg-slate-100 rounded-full font-bold text-slate-500"
      >
        {name}
      </span>
    ))}
  </div>
)}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Added {new Date(client.createdAt).toLocaleDateString("default", {
                              month: "short", day: "numeric", year: "numeric"
                            })}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-6">
                      {client.phone ? (
                        <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                          <MdPhone className="text-slate-300" size={16} />
                          {client.phone}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold text-sm">—</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-6">
                      {client.email ? (
                        <div className="flex items-center gap-2 text-sm font-black text-slate-600">
                          <MdEmail className="text-slate-300" size={16} />
                          {client.email}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold text-sm">—</span>
                      )}
                    </td>

                    {/* Company */}
                    <td className="px-6 py-6">
                      {client.company ? (
                        <div className="flex items-center gap-2 text-sm font-black text-slate-600">
                          <MdBusiness className="text-slate-300" size={16} />
                          {client.company}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold text-sm">—</span>
                      )}
                    </td>

                    {/* Added By */}
                    {/* <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] uppercase">
                          {client.creator?.name?.charAt(0) || <MdPerson size={12} />}
                        </div>
                        <span className="text-sm font-black text-slate-600">
                          {client.creator?.name || "—"}
                        </span>
                      </div>
                    </td> */}

                    {/* Actions */}
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(client)}
                          title="Edit"
                          className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all shadow-sm"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(client)}
                          title="Delete"
                          className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Edit Client" : "Add New Client"}
        size="md"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Client Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
            placeholder="e.g. Rajesh Patel"
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            error={fieldErrors.phone}
            placeholder="e.g. 9876543210"
          />
          <Input
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="e.g. rajesh@company.com"
          />
          <Input
            label="Company"
            name="company"
            value={form.company}
            onChange={handleChange}
            error={fieldErrors.company}
            placeholder="e.g. Patel Enterprises"
          />

          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <Button
              variant="ghost"
              className="flex-1 font-black uppercase tracking-widest text-sm"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm"
              loading={submitting}
            >
              {editTarget ? "Update Client" : "Add Client"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`Remove "${confirmDelete?.names?.[0]}" from clients? This won't affect existing calls.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Clients;