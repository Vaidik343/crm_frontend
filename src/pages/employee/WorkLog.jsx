import { useEffect, useState } from "react";
import { useWorkLog } from "../../context/WorkLogContext";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import { MdAccessTime, MdOutlineSpeakerNotes, MdHistory, MdCalendarToday, MdAdd, MdEdit, MdDelete } from "react-icons/md";

const initialForm = {
  description: "",
  date: new Date().toISOString().split("T")[0], // today's date as default
};

const WorkLog = () => {
  const { workLogs, loading, getAllWorkLogs, createWorkLog, updateWorkLog, deleteWorkLog } = useWorkLog();
  const { can } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getAllWorkLogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.description.trim()) errors.description = "Description is required";
    if (!form.date) errors.date = "Date is required";
    return errors;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (log) => {
    setEditTarget(log);
    setForm({ description: log.description, date: log.date });
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
        await updateWorkLog(editTarget.id, form);
        setAlert({ type: "success", message: "Work log updated" });
      } else {
        await createWorkLog(form);
        setAlert({ type: "success", message: "Work log added" });
      }
      closeModal();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteWorkLog(confirmDelete.id);
      setAlert({ type: "success", message: "Work log deleted" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (loading && !workLogs.length) return <Spinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            Work <span className="text-[#132ea7]">Log</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Your daily work journal</p>
        </div>
        
          <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 py-3.5 px-8 rounded font-black uppercase tracking-widest text-xs" onClick={openCreate}>
            <MdAdd size={20} /> Add Work
          </Button>
        
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Work logs List */}
      {workLogs.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-slate-300 py-16 text-center shadow-sm">
          <MdOutlineSpeakerNotes size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No work logs yet. Add your first entry.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workLogs.map((log) => (
            <div key={log.id} className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Date pill */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#132ea7]/5 text-[#132ea7] border border-[#132ea7]/10 flex flex-col items-center justify-center font-black shadow-inner">
                    <span className="text-xl leading-none">{new Date(log.date).getDate()}</span>
                    <span className="text-[10px] uppercase tracking-widest">{new Date(log.date).toLocaleString("default", { month: "short" })}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="flex-grow">
                  <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {log.description}
                  </p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                    {new Date(log.date).toLocaleDateString("default", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                  {can("can_update") && (
                    <button
                      onClick={() => openEdit(log)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-black text-xs uppercase tracking-widest transition-all"
                    >
                      <MdEdit size={16} /> Edit
                    </button>
                  )}
                  {can("can_delete") && (
                    <button
                      onClick={() => setConfirmDelete(log)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest transition-all"
                    >
                      <MdDelete size={16} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Edit Work Log" : "Add Work Log"} >
        <form onSubmit={handleSubmit} noValidate className="space-y-6 pt-4" >
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              error={fieldErrors.date}
              required
            />
            <Textarea
              label="What did you do today?"
              name="description"
              value={form.description}
              onChange={handleChange}
              error={fieldErrors.description}
              placeholder="Describe your work for the day..."
              rows={5}
              className="text-sm font-bold leading-relaxed rounded-2xl border-slate-100 focus:ring-4 focus:ring-[#132ea7]/5"
              required
            />
          </div>
          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-[2] h-14 text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#132ea7]/20" loading={submitting}>
              {editTarget ? "Update" : "Save Entry"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message="Delete this work log entry? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default WorkLog;