import { useEffect, useState } from "react";
import { useLeave } from "../../context/LeaveContext";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import {
  MdAdd,
  MdDelete,
  MdCalendarToday,
} from "react-icons/md";
import { formatDate } from "../../utils/formatDate";

const MONTH_NAMES = [
  "", "January", "February", "March", "April",
  "May", "June", "July", "August", "September",
  "October", "November", "December",
];

const PublicHolidays = () => {
  const { getPublicHolidays, addPublicHoliday, deletePublicHoliday } = useLeave();

  const currentYear = new Date().getFullYear();
  const [year,     setYear]     = useState(currentYear);
  const [holidays, setHolidays] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState({ name: "", date: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting]  = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const [alert,      setAlert]      = useState({ type: "", message: "" });

  const fetchHolidays = (y) => {
    setLoading(true);
    getPublicHolidays(y)
      .then((res) => setHolidays(res.holidays || []))
      .catch(() => setHolidays([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHolidays(year);
  }, [year]);

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Holiday name is required.";
    if (!form.date)        errors.date = "Date is required.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSubmitting(true);
      await addPublicHoliday({ name: form.name.trim(), date: form.date });
      setAlert({ type: "success", message: "Holiday added successfully." });
      setShowModal(false);
      setForm({ name: "", date: "" });
      fetchHolidays(year);
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Failed to add holiday.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deletePublicHoliday(confirmDelete.id);
      setAlert({ type: "success", message: "Holiday deleted." });
      fetchHolidays(year);
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Failed to delete.",
      });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  // group holidays by month for display
  const grouped = holidays.reduce((acc, h) => {
    const month = new Date(h.date).getMonth() + 1;
    if (!acc[month]) acc[month] = [];
    acc[month].push(h);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1 uppercase">
            Public <span className="text-[#132ea7]">Holidays</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">
            {holidays.length} holiday{holidays.length !== 1 ? "s" : ""} in {year}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Year switcher */}
          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="text-slate-400 hover:text-[#132ea7] font-black transition-colors px-1">
              ‹
            </button>
            <span className="text-sm font-black text-slate-700 min-w-[3rem] text-center">
              {year}
            </span>
            <button
              onClick={() => setYear((y) => y + 1)}
              className="text-slate-400 hover:text-[#132ea7] font-black transition-colors px-1">
              ›
            </button>
          </div>

          <Button variant="primary"
            className="shadow-lg shadow-[#132ea7]/20 px-8 rounded-xl h-[52px] font-black uppercase tracking-widest text-sm"
            onClick={() => { setShowModal(true); setForm({ name: "", date: "" }); setFieldErrors({}); }}>
            <MdAdd size={22} className="mr-1" /> Add Holiday
          </Button>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })} />

      {/* Holiday list grouped by month */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
          <Spinner size="lg" />
          <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
            Loading holidays...
          </p>
        </div>
      ) : holidays.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center">
          <MdCalendarToday size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
            No holidays added for {year}
          </p>
          <p className="text-slate-300 font-bold text-xs mt-2">
            Click "Add Holiday" to get started
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(grouped).sort((a, b) => a - b).map((month) => (
            <div key={month}>
              {/* Month header */}
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                {MONTH_NAMES[month]}
              </p>

              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                {grouped[month].map((holiday, idx) => (
                  <div key={holiday.id}
                    className={`flex items-center justify-between px-6 py-5 hover:bg-slate-50/80 transition-colors ${
                      idx !== 0 ? "border-t border-slate-50" : ""
                    }`}>

                    <div className="flex items-center gap-4">
                      {/* Date box */}
                      <div className="w-14 h-14 rounded-2xl bg-[#132ea7]/5 flex flex-col items-center justify-center shrink-0">
                        <span className="text-lg font-black text-[#132ea7] leading-none">
                          {new Date(holiday.date).getDate()}
                        </span>
                        <span className="text-[9px] font-black text-[#132ea7]/60 uppercase tracking-widest">
                          {new Date(holiday.date).toLocaleString("default", { weekday: "short" })}
                        </span>
                      </div>

                      <div>
                        <p className="font-black text-slate-800 text-base">{holiday.name}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                          {formatDate(holiday.date)}
                        </p>
                      </div>
                    </div>

                    <button onClick={() => setConfirmDelete(holiday)}
                      className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                      <MdDelete size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Holiday Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title="Add Public Holiday" size="sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Holiday Name"
            name="name"
            value={form.name}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, name: e.target.value }));
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="e.g. Diwali, Independence Day"
            error={fieldErrors.name}
            required
          />
          <Input
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, date: e.target.value }));
              if (fieldErrors.date) setFieldErrors((prev) => ({ ...prev, date: "" }));
            }}
            error={fieldErrors.date}
            required
          />

          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <Button variant="ghost"
              className="flex-1 font-black uppercase tracking-widest text-sm"
              onClick={() => setShowModal(false)}
              disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary"
              className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm"
              loading={submitting}>
              Add Holiday
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`Delete "${confirmDelete?.name}" (${confirmDelete ? formatDate(confirmDelete.date) : ""})? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default PublicHolidays;