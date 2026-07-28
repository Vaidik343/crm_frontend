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
  MdSearch,
  MdViewList,
  MdGridView,
  MdOutlineHourglassEmpty,
  MdAccessTime,
  MdCelebration,
  MdTrendingUp,
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
  const [year, setYear] = useState(currentYear);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Views
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'upcoming' | 'past'
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", type: "NATIONAL" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

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
    if (!form.date) errors.date = "Date is required.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await addPublicHoliday({
        name: form.name.trim(),
        date: form.date,
        type: form.type,
      });
      setAlert({ type: "success", message: "Holiday added successfully." });
      setShowModal(false);
      setForm({ name: "", date: "", type: "NATIONAL" });
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

  // --- Calculations for Top Stat Cards ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalHolidays = holidays.length;

  const upcomingHolidays = holidays
    .filter((h) => {
      const d = new Date(h.date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const remainingHolidays = upcomingHolidays.length;
  const nextHoliday = upcomingHolidays[0] || null;

  let daysToNextHoliday = 0;
  if (nextHoliday) {
    const nextDate = new Date(nextHoliday.date);
    nextDate.setHours(0, 0, 0, 0);
    const diffTime = nextDate.getTime() - today.getTime();
    daysToNextHoliday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // --- Filtering Logic ---
  const filteredHolidays = holidays.filter((h) => {
    const hDate = new Date(h.date);
    hDate.setHours(0, 0, 0, 0);

    // Tab filter
    if (activeTab === "upcoming" && hDate < today) return false;
    if (activeTab === "past" && hDate >= today) return false;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const nameMatch = h.name.toLowerCase().includes(term);
      const dateMatch = formatDate(h.date).toLowerCase().includes(term);
      const typeMatch = (h.type || "").toLowerCase().includes(term);
      if (!nameMatch && !dateMatch && !typeMatch) return false;
    }

    return true;
  });

  // Group filtered holidays by month
  const grouped = filteredHolidays.reduce((acc, h) => {
    const month = new Date(h.date).getMonth() + 1;
    if (!acc[month]) acc[month] = [];
    acc[month].push(h);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Public <span className="text-primary">Holidays</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage company-wide holidays and working schedules for the fiscal year.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year selector dropdown */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Add Holiday Button */}
          <Button
            variant="primary"
            className="bg-[#132ea7]  text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center gap-2 text-sm transition-all"
            onClick={() => {
              setShowModal(true);
              setForm({ name: "", date: "", type: "NATIONAL" });
              setFieldErrors({});
            }}
          >
            <MdAdd className="w-5 h-5 bg-white/20 rounded-full p-0.5" /> Add Holiday
          </Button>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Top 3 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Holidays */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Holidays</p>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-bold text-slate-800">
                {String(totalHolidays).padStart(2, "0")}
              </span>
              <span className="text-xs font-medium text-slate-400">days</span>
            </div>
            {/* <p className="text-[11px] text-emerald-600 font-semibold mt-3 flex items-center gap-1">
              <MdTrendingUp className="w-3.5 h-3.5" /> +2 from last year
            </p> */}
          </div>
          <div className="p-3 bg-indigo-50 text-primary rounded-xl">
            <MdCalendarToday className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        {/* Card 2: Remaining in Year */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
          <div className="w-full pr-2">
            <p className="text-xs font-semibold text-slate-400">Remaining in {year}</p>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-bold text-slate-800">
                {String(remainingHolidays).padStart(2, "0")}
              </span>
              <span className="text-xs font-medium text-slate-400">days left</span>
            </div>
            {/* Progress bar */}
            <div className="w-full max-w-[140px] bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    totalHolidays > 0 ? (remainingHolidays / totalHolidays) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-primary rounded-xl shrink-0">
            <MdOutlineHourglassEmpty className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        {/* Card 3: Next Holiday */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-slate-400">Next Holiday</p>
            <p className="text-base font-bold text-slate-800 mt-2 truncate max-w-[170px]">
              {nextHoliday ? nextHoliday.name : "None upcoming"}
            </p>
            {nextHoliday ? (
              <p className="text-xs text-primary font-medium mt-3 flex items-center gap-1">
                <MdAccessTime className="w-3.5 h-3.5" /> In {daysToNextHoliday} days
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-medium mt-3">No pending leaves</p>
            )}
          </div>
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
            <MdCelebration className="w-6 h-6 text-rose-300" />
          </div>
        </div>
      </div>

      {/* Filter and Search Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Tabs */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto">
          {[
            { id: "all", label: "All Holidays" },
            { id: "upcoming", label: "Upcoming" },
            { id: "past", label: "Past" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input & List/Grid toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search holidays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100/80 border-none rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex bg-slate-100/80 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-[#132ea7] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <MdViewList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-[#132ea7] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <MdGridView className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Holiday Content List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[30vh] gap-3">
          <Spinner size="lg" />
          <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider">
            Loading holidays...
          </p>
        </div>
      ) : filteredHolidays.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <MdCalendarToday className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold text-sm">No holidays found</p>
          <p className="text-slate-400 text-xs mt-1">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(grouped)
            .sort((a, b) => a - b)
            .map((month) => (
              <div key={month} className="space-y-3">
                {/* Month header with year */}
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  {MONTH_NAMES[month]} {year}
                </p>

                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-3"
                      : "space-y-3"
                  }
                >
                  {grouped[month].map((holiday) => {
                    const hDate = new Date(holiday.date);
                    hDate.setHours(0, 0, 0, 0);
                    const isUpcoming = hDate >= today;

                    return (
                      <div
                        key={holiday.id}
                        className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Date box */}
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50/70 flex flex-col items-center justify-center shrink-0">
                            <span className="text-lg font-extrabold text-primary leading-none">
                              {new Date(holiday.date).getDate()}
                            </span>
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider mt-1">
                              {new Date(holiday.date).toLocaleString("default", {
                                weekday: "short",
                              })}
                            </span>
                          </div>

                          {/* Holiday info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 text-sm">
                                {holiday.name}
                              </h4>
                              {/* Holiday Tag */}
                              {/* <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                                {holiday.type || "OPTIONAL"}
                              </span> */}
                            </div>
                            <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
                              <MdCalendarToday className="w-3 h-3 text-slate-400" />
                              {formatDate(holiday.date)}
                            </p>
                          </div>
                        </div>

                        {/* Status badge & Actions */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 ${
                              isUpcoming
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isUpcoming ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            {isUpcoming ? "Upcoming" : "Completed"}
                          </span>

                          <button
                            onClick={() => setConfirmDelete(holiday)}
                            className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete holiday"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add Holiday Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Add Public Holiday"
        size="sm"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Holiday Name"
            name="name"
            value={form.name}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, name: e.target.value }));
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="e.g. Independence Day"
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

          
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              className="flex-1 text-xs font-semibold"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-[2] bg-[#132ea7] text-white text-xs font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-100"
              loading={submitting}
            >
              Add Holiday
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`Delete "${confirmDelete?.name}" (${
          confirmDelete ? formatDate(confirmDelete.date) : ""
        })? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default PublicHolidays;