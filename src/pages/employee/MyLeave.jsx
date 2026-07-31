import { useEffect, useState } from "react";
import { useLeave } from "../../context/LeaveContext";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Spinner from "../../components/ui/Spinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import {
  MdAdd,
  MdBeachAccess,
  MdVisibility,
  MdCancel,
  
  MdClose,
  MdTimeline,
} from "react-icons/md";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import SearchInput from "../../components/ui/SearchInput";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const LEAVE_TYPE_LABELS = {
  paid:     "Paid",
  unpaid:   "Unpaid",
  exchange: "Exchange",
};

const REASON_TYPE_LABELS = {
  normal:    "Normal",
  emergency: "Emergency",
};

const DURATION_LABELS = {
  full_day:    "Full Day",
  first_half:  "First Half",
  second_half: "Second Half",
};

const STATUS_CONFIG = {
  pending:   { label: "Pending",   classes: "bg-amber-100 text-amber-700"   },
  approved:  { label: "Approved",  classes: "bg-green-100 text-green-700"   },
  rejected:  { label: "Rejected",  classes: "bg-red-100 text-red-600"       },
  cancelled: { label: "Cancelled", classes: "bg-slate-100 text-slate-500"   },
};

const initialForm = {
  leave_type:          "paid",
  reason_type:         "normal",
  start_date:          "",
  end_date:            "",
  duration:            "full_day",
  reason:              "",
  worked_saturday_id:  "",
};

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
};

const LeaveBadge = ({ type }) => (
  <span className="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest bg-[#132ea7]/10 text-[#132ea7]">
    {LEAVE_TYPE_LABELS[type] || type}
  </span>
);


const BalanceCard = ({ balance }) => { 
  if (!balance) return null;

  const remaining = parseFloat(balance.remaining_paid);
  const entitled  = parseFloat(balance.entitled_paid);
  const usedPaid  = parseFloat(balance.used_paid);
  const usedUnpaid  = parseFloat(balance.used_unpaid);
  const usedExchange = parseFloat(balance.used_exchange);

  const percentage = Math.min((usedPaid / entitled) * 100, 100);

  const MONTH_NAMES = [
    "", "January", "February", "March", "April",
    "May", "June", "July", "August", "September",
    "October", "November", "December",
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Leave Balance
          </p>
          <p className="text-lg font-black text-slate-700">
            {MONTH_NAMES[balance.month]} {balance.year}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#132ea7]/10 flex items-center justify-center">
          <MdBeachAccess size={24} className="text-[#132ea7]" />
        </div>
      </div>

      {/* Paid leave progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Paid Leaves
          </p>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
            {usedPaid} / {entitled} used
          </p>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage >= 100 ? "bg-red-500" :
              percentage >= 50  ? "bg-amber-500" :
              "bg-[#132ea7]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <p className="text-[10px] font-bold text-slate-400">0</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${
            remaining <= 0 ? "text-red-500" : "text-[#132ea7]"
          }`}>
            {remaining <= 0 ? "No paid leaves left" : `${remaining} remaining`}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Paid Used",
            value: usedPaid,
            color: "bg-[#132ea7]/5 text-[#132ea7]",
          },
          {
            label: "Unpaid",
            value: usedUnpaid,
            color: usedUnpaid > 0 ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400",
          },
          {
            label: "Exchange",
            value: usedExchange,
            color: "bg-amber-50 text-amber-600",
          },
        ].map((item) => (
          <div key={item.label}
            className={`${item.color} rounded-2xl p-4 text-center`}>
            <p className="text-2xl font-black">{item.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Warning if unpaid leaves exist */}
      {usedUnpaid > 0 && (
        <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <p className="text-xs font-black text-red-500 uppercase tracking-widest">
            ⚠️ {usedUnpaid} day{usedUnpaid !== 1 ? "s" : ""} unpaid this month — salary will be deducted
          </p>
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const MyLeaves = () => {
  const { user: authUser } = useAuth();
  const {
    leaves,
    loading,
    page,
    limit,
    total,
    totalPages,
    setPage,
    getMyLeaves,
    createLeave,
    cancelLeave,
    getLeaveLogs,
    getWorkedSaturdays,
  } = useLeave();
    console.log("🚀 ~ MyLeaves ~ leaves:", leaves)

    const { getMyBalance, ...rest } = useLeave();

const [balance, setBalance] = useState(null);
const [balanceLoading, setBalanceLoading] = useState(false);


  // ── Modal state ──
  const [showForm,   setShowForm]   = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  // ── Form state ──
  const [form,        setForm]        = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [cancelling,  setCancelling]  = useState(false);
  const [alert,       setAlert]       = useState({ type: "", message: "" });

  // ── Logs state ──
  const [logs,       setLogs]       = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // ── Saturdays state ──
  const [saturdays,        setSaturdays]        = useState([]);
  const [saturdaysLoading, setSaturdaysLoading] = useState(false);

  // ── Filters ──
  const [search,     setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");

  // ── Effects ──
  useEffect(() => {
    getMyLeaves(page, limit, {
      status:     statusFilter,
      leave_type: typeFilter,
      search,
    });
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      getMyLeaves(1, limit, {
        status:     statusFilter,
        leave_type: typeFilter,
        search,
      });
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  // Fetch logs when view modal opens
  useEffect(() => {
    if (!viewTarget?.id) { setLogs([]); return; }
    setLogsLoading(true);
    getLeaveLogs(viewTarget.id)
      .then((res) => setLogs(res.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLogsLoading(false));
  }, [viewTarget?.id]);

  // Fetch available saturdays when exchange is selected
  useEffect(() => {
    if (form.leave_type !== "exchange" || !authUser?.id) {
      setSaturdays([]);
      return;
    }
    setSaturdaysLoading(true);
    getWorkedSaturdays(authUser.id)
      .then((res) => setSaturdays(res.saturdays || []))
      .catch(() => setSaturdays([]))
      .finally(() => setSaturdaysLoading(false));
  }, [form.leave_type]);


  useEffect(() => {
  setBalanceLoading(true);
  getMyBalance()
    .then((res) => setBalance(res.balance))
    .catch(() => setBalance(null))
    .finally(() => setBalanceLoading(false));
}, []);



  // ── Form handlers ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // when leave_type changes away from exchange, clear worked_saturday_id
    if (name === "leave_type" && value !== "exchange") {
      setForm((prev) => ({ ...prev, leave_type: value, worked_saturday_id: "" }));
    }

    // when duration changes to half day, sync end_date = start_date
    if (name === "duration" && (value === "first_half" || value === "second_half")) {
      setForm((prev) => ({ ...prev, duration: value, end_date: prev.start_date }));
    }

    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.start_date)  errors.start_date = "Start date is required.";
    if (!form.end_date)    errors.end_date   = "End date is required.";
    if (!form.reason.trim()) errors.reason   = "Reason is required.";
    if (form.leave_type === "exchange" && !form.worked_saturday_id) {
      errors.worked_saturday_id = "Please select a Saturday to exchange.";
    }
    return errors;
  };

  const openForm = () => {
    setForm(initialForm);
    setFieldErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
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
        leave_type:  form.leave_type,
        reason_type: form.reason_type,
        start_date:  form.start_date,
        end_date:    form.end_date,
        duration:    form.duration,
        reason:      form.reason,
        ...(form.leave_type === "exchange" && { worked_saturday_id: form.worked_saturday_id }),
      };
      await createLeave(payload);
      setAlert({ type: "success", message: "Leave request submitted successfully." });
      closeForm();
      getMyLeaves(1, limit, {});
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Failed to submit leave request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirmCancel) return;
    try {
      setCancelling(true);
      await cancelLeave(confirmCancel.id);
      setAlert({ type: "success", message: "Leave request cancelled." });
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Failed to cancel.",
      });
    } finally {
      setCancelling(false);
      setConfirmCancel(null);
    }
  };

  // ── Pagination ──
  const Pagination = ({ compact = false }) => (
    <div className={`flex items-center justify-between px-6 py-6 ${!compact ? "border-t border-slate-100" : ""}`}>
      <button disabled={page === 1} onClick={() => setPage(page - 1)}
        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">
        {compact ? "Prev" : "Previous"}
      </button>
      {compact ? (
        <span className="text-sm font-bold text-slate-500">{page} / {totalPages}</span>
      ) : (
        <div className="flex items-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? "bg-[#132ea7] text-white" : "bg-slate-100 text-slate-700"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">
        Next
      </button>
    </div>
  );

  // if (loading && !leaves.length)
  //   return (
  //     <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
  //       <Spinner size="lg" />
  //       <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
  //         Loading leaves...
  //       </p>
  //     </div>
  //   );

  return (
    <div className="space-y-8 px-4 animate-in fade-in duration-700">

      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1 uppercase">
              My <span className="text-[#132ea7]">Leaves</span>
            </h2>
            <p className="text-slate-500 font-bold text-base">Total: {total}</p>
          </div>
          <Button variant="primary"
            className="shadow-lg shadow-[#132ea7]/20 px-8 rounded-xl h-[52px] font-black uppercase tracking-widest text-sm"
            onClick={openForm}>
            <MdAdd size={22} className="mr-1" /> Request Leave
          </Button>
        </div>

{/* Balance Card */}
{balanceLoading ? (
  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 flex items-center justify-center">
    <Spinner size="sm" />
  </div>
) : (
  <BalanceCard balance={balance} />
)}

        {/* ── Filters ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_380px] gap-6 items-start">

          {/* Status filter */}
          <div className="flex  gap-2 flex-wrap">
            {[
              { value: "",          label: "All"       },
              { value: "pending",   label: "Pending"   },
              { value: "approved",  label: "Approved"  },
              { value: "rejected",  label: "Rejected"  },
              { value: "cancelled", label: "Cancelled" },
            ].map((opt) => (
              <button key={opt.value}
                onClick={() => { setPage(1); setStatusFilter(opt.value); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  statusFilter === opt.value
                    ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Leave type filter */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {[
              { value: "",         label: "All Types" },
              { value: "paid",     label: "Paid"      },
              { value: "unpaid",   label: "Unpaid"    },
              { value: "exchange", label: "Exchange"  },
            ].map((opt) => (
              <button key={opt.value}
                onClick={() => { setPage(1); setTypeFilter(opt.value); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  typeFilter === opt.value
                    ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>

             {/* Search */}
    <SearchInput
      value={search}
      onChange={setSearch}
      placeholder="Search Tasks, Projects..."

    />
        </div>
      </div>

      <Alert type={alert.type} message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })} />

      {/* ── Desktop Table ── */}
      <div className="hidden md:block">
        <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200/50">
                  {["Requested On", "Display ID", "Leave Type", "Duration", "From", "To", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-5 text-md font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">
                      No leave requests found.
                    </td>
                  </tr>
                )}
                {leaves.filter(Boolean).map((leave) => (

                  
                  <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors group">

                    {/* Requested On */}
                    <td className="px-6 py-5">
                      <div className="font-black text-slate-800 text-base">{formatDate(leave.createdAt)}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {formatDateTime(leave.createdAt).split(" ")[1]}
                      </div>
                    </td>

                    {/* Display ID */}
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[11px] font-black uppercase tracking-widest font-mono">
                        {leave.display_id || "—"}
                      </span>
                    </td>

                    {/* Leave Type + Emergency badge */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <LeaveBadge type={leave.leave_type} />
                        {leave.reason_type === "emergency" && (
                          <span className="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest bg-red-100 text-red-600 w-fit">
                            Emergency
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-600">
                        {DURATION_LABELS[leave.duration] || leave.duration}
                      </span>
                    </td>

                    {/* From */}
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-700">{formatDate(leave.start_date)}</span>
                    </td>

                    {/* To */}
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-700">{formatDate(leave.end_date)}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <StatusBadge status={leave.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewTarget(leave)} title="View"
                          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all">
                          <MdVisibility size={20} />
                        </button>
                        {leave.status === "pending" && (
                          <button onClick={() => setConfirmCancel(leave)} title="Cancel"
                            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                            <MdCancel size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <Pagination />}
        </div>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-4">
        {leaves.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold">
            No leave requests found.
          </div>
        ) : (
          leaves.filter(Boolean).map((leave) => (
            <div key={leave.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-800 leading-tight">
                    {LEAVE_TYPE_LABELS[leave.leave_type]} — {DURATION_LABELS[leave.duration]}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 font-mono mt-0.5">{leave.display_id}</p>
                </div>
                <StatusBadge status={leave.status} />
              </div>

              <div className="space-y-2 text-sm">
                {[
                  { label: "From",      value: formatDate(leave.start_date) },
                  { label: "To",        value: formatDate(leave.end_date)   },
                  { label: "Requested", value: formatDate(leave.createdAt)  },
                  { label: "Type",      value: leave.reason_type === "emergency" ? "Emergency" : "Normal" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">{item.label}</span>
                    <span className="font-bold text-slate-700 text-xs">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button onClick={() => setViewTarget(leave)}
                  className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all">
                  <MdVisibility size={16} /> View
                </button>
                {leave.status === "pending" && (
                  <button onClick={() => setConfirmCancel(leave)}
                    className="flex-1 h-10 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-red-100 transition-all">
                    <MdCancel size={16} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {totalPages > 1 && <Pagination compact />}
      </div>

      {/* ── Request Leave Modal ── */}
      <Modal show={showForm} onClose={closeForm} title="Request Leave" size="lg">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Leave Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                Leave Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "paid",     label: "Paid"     },
                  { value: "unpaid",   label: "Unpaid"   },
                  { value: "exchange", label: "Exchange" },
                ].map((opt) => (
                  <button key={opt.value} type="button"
                    onClick={() => handleChange({ target: { name: "leave_type", value: opt.value } })}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      form.leave_type === opt.value
                        ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                Reason Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "normal",    label: "Normal"    },
                  { value: "emergency", label: "Emergency" },
                ].map((opt) => (
                  <button key={opt.value} type="button"
                    onClick={() => handleChange({ target: { name: "reason_type", value: opt.value } })}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      form.reason_type === opt.value
                        ? opt.value === "emergency"
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                          : "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {form.reason_type === "emergency" && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1 mt-1">
                  Emergency — no notice period required
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "full_day",    label: "Full Day"    },
                  { value: "first_half",  label: "First Half"  },
                  { value: "second_half", label: "Second Half" },
                ].map((opt) => (
                  <button key={opt.value} type="button"
                    onClick={() => handleChange({ target: { name: "duration", value: opt.value } })}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      form.duration === opt.value
                        ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {(form.duration === "first_half" || form.duration === "second_half") && (
                <p className="text-[10px] font-black text-[#132ea7] uppercase tracking-widest ml-1 mt-1">
                  Half day — start and end date must be the same
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <Input label="Start Date" name="start_date" type="date"
                value={form.start_date}
                onChange={(e) => {
                  handleChange(e);
                  // for half day, keep end_date in sync
                  if (form.duration !== "full_day") {
                    setForm((prev) => ({ ...prev, start_date: e.target.value, end_date: e.target.value }));
                  }
                }}
                error={fieldErrors.start_date}
                required
              />
            </div>

            {/* End Date */}
            <div>
              <Input label="End Date" name="end_date" type="date"
                value={form.end_date}
                onChange={handleChange}
                disabled={form.duration === "first_half" || form.duration === "second_half"}
                error={fieldErrors.end_date}
                required
              />
              {(form.duration === "first_half" || form.duration === "second_half") && (
                <p className="text-[10px] font-bold text-slate-400 ml-1 mt-1">
                  Auto-set to match start date for half day
                </p>
              )}
            </div>

            {/* Exchange Saturday picker */}
            {form.leave_type === "exchange" && (
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                  Select Saturday to Exchange <span className="text-red-500">*</span>
                </label>
                {saturdaysLoading ? (
                  <p className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                    Loading available Saturdays...
                  </p>
                ) : saturdays.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3">
                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest">
                      No available worked Saturdays. Ask admin to mark your worked Saturdays first.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {saturdays.map((s) => (
                      <button key={s.id} type="button"
                        onClick={() => setForm((prev) => ({ ...prev, worked_saturday_id: s.id }))}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          form.worked_saturday_id === s.id
                            ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}>
                        {formatDate(s.saturday_date)}
                      </button>
                    ))}
                  </div>
                )}
                {fieldErrors.worked_saturday_id && (
                  <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1">
                    {fieldErrors.worked_saturday_id}
                  </p>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="md:col-span-2">
              <Textarea label="Reason" name="reason" value={form.reason}
                onChange={handleChange} placeholder="Briefly describe the reason for leave..."
                rows={3} error={fieldErrors.reason} required />
            </div>
          </div>

          {/* Notice period info banner */}
          {form.reason_type !== "emergency" && (
            <div className="bg-[#132ea7]/5 border border-[#132ea7]/10 rounded-2xl px-5 py-3">
              <p className="text-xs font-black text-[#132ea7] uppercase tracking-widest">
                {form.duration === "full_day"
                  ? "Full day leave must be requested at least 36 hours before 9 AM of the leave date."
                  : "Half day leave must be requested at least 16 hours before 9 AM of the leave date."}
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-5 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm"
              onClick={closeForm} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary"
              className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm"
              loading={submitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── View / Detail Modal ── */}
      <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Leave Details" size="lg">
        {viewTarget && (
          <div className="space-y-6 py-2">

            {/* Header */}
            <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center shrink-0 shadow-xl shadow-[#132ea7]/20">
                <MdBeachAccess size={26} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-black text-slate-800">
                    {LEAVE_TYPE_LABELS[viewTarget.leave_type]} Leave
                  </h3>
                  <StatusBadge status={viewTarget.status} />
                  {viewTarget.reason_type === "emergency" && (
                    <span className="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest bg-red-100 text-red-600">
                      Emergency
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
                  {viewTarget.display_id || "—"}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Leave Type",  value: LEAVE_TYPE_LABELS[viewTarget.leave_type]   },
                { label: "Duration",    value: DURATION_LABELS[viewTarget.duration]        },
                { label: "From",        value: formatDate(viewTarget.start_date)           },
                { label: "To",          value: formatDate(viewTarget.end_date)             },
                { label: "Requested",   value: formatDate(viewTarget.createdAt)            },
                { label: "Approved By", value: viewTarget.approver?.name || "—"           },
                { label: "Approved At", value: viewTarget.approved_at ? formatDate(viewTarget.approved_at) : "—" },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="font-black text-slate-700 text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Reason */}
            <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Reason</p>
              <p className="font-medium leading-relaxed opacity-90">{viewTarget.reason}</p>
            </div>

            {/* Rejection reason */}
            {viewTarget.status === "rejected" && viewTarget.rejection_reason && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Rejection Reason</p>
                <p className="font-bold text-red-600 text-sm">{viewTarget.rejection_reason}</p>
              </div>
            )}

            {/* Activity Logs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MdTimeline size={16} className="text-slate-400" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</p>
              </div>
              {logsLoading ? (
                <p className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest text-center py-4">
                  Loading...
                </p>
              ) : logs.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 text-center py-3">No activity yet.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-100" />
                  <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-4 relative">
                        <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 z-10 ring-2 ring-white ${
                          log.action === "approved"  ? "bg-green-500"  :
                          log.action === "rejected"  ? "bg-red-500"    :
                          log.action === "cancelled" ? "bg-slate-400"  :
                          "bg-[#132ea7]"
                        }`} />
                        <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <p className="text-xs font-black text-slate-700 capitalize">{log.action}</p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {formatDateTime(log.created_at)}
                            </p>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            By {log.user?.name || "—"}
                          </p>
                          {log.remarks?.rejection_reason && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</p>
                              <p className="text-xs font-bold text-slate-600 mt-0.5">{log.remarks.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setViewTarget(null)}
                className="font-black uppercase tracking-widest text-xs">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Cancel Confirm ── */}
      <ConfirmDialog
        show={!!confirmCancel}
        message={`Cancel leave request "${confirmCancel?.display_id}"? This cannot be undone.`}
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(null)}
        loading={cancelling}
      />
    </div>
  );
};

export default MyLeaves;