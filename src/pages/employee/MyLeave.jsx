import { useEffect, useState, useMemo } from "react";
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
  MdInfoOutline 
} from "react-icons/md";
import { FaBriefcaseMedical } from "react-icons/fa";

import { formatDate, formatDateTime } from "../../utils/formatDate";
import SearchInput from "../../components/ui/SearchInput";
import DataTable from "../../components/shared/table";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const LEAVE_TYPE_LABELS = {
  paid: "Paid",
  unpaid: "Unpaid",
  exchange: "Exchange",
};

const REASON_TYPE_LABELS = {
  casual: "Casual",
  emergency: "Emergency",
};

const DURATION_LABELS = {
  full_day: "Full Day",
  first_half: "First Half",
  second_half: "Second Half",
};

const STATUS_CONFIG = {
  pending: { label: "Pending", classes: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", classes: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", classes: "bg-red-100 text-red-600" },
  cancelled: { label: "Cancelled", classes: "bg-slate-100 text-slate-500" },
};

const initialBlock = {
  start_date: '',
  end_date:   '',
  duration:   'full_day',
};

const initialForm = {
  leave_type:  'paid',
  reason_type: 'casual',
  reason:      '',
  worked_saturday_id: '',
};

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${cfg.classes}`}
    >
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
  const entitled = parseFloat(balance.entitled_paid);
  const usedPaid = parseFloat(balance.used_paid);
  const usedUnpaid = parseFloat(balance.used_unpaid);
  const usedExchange = parseFloat(balance.used_exchange);

  const percentage = Math.min((usedPaid / entitled) * 100, 100);

  const MONTH_NAMES = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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
              percentage >= 100
                ? "bg-red-500"
                : percentage >= 50
                  ? "bg-amber-500"
                  : "bg-[#132ea7]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <p className="text-[10px] font-bold text-slate-400">0</p>
          <p
            className={`text-[10px] font-black uppercase tracking-widest ${
              remaining <= 0 ? "text-red-500" : "text-[#132ea7]"
            }`}
          >
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
            color:
              usedUnpaid > 0
                ? "bg-red-50 text-red-500"
                : "bg-slate-50 text-slate-400",
          },
          {
            label: "Exchange",
            value: usedExchange,
            color: "bg-amber-50 text-amber-600",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`${item.color} rounded-2xl p-4 text-center`}
          >
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
            ⚠️ {usedUnpaid} day{usedUnpaid !== 1 ? "s" : ""} unpaid this month —
            salary will be deducted
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
    uploadLeaveDocument,
    checkAdjacentLeaves
  } = useLeave();
  console.log("🚀 ~ MyLeaves ~ leaves:", leaves);

  const { getMyBalance, ...rest } = useLeave();

  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // ── Modal state ──
  const [showForm, setShowForm] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  // ── Form state ──
const [form, setForm]             = useState(initialForm);
const [leaveBlocks, setLeaveBlocks] = useState([{ ...initialBlock }]);
const [fieldErrors, setFieldErrors] = useState({});
const [blockErrors, setBlockErrors] = useState([]); // per-block errors
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // ── Logs state ──
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // ── Saturdays state ──
  const [saturdays, setSaturdays] = useState([]);
  const [saturdaysLoading, setSaturdaysLoading] = useState(false);

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // emrg - media
  const [emergencySubType, setEmergencySubType] = useState("");
  const [medicalFile, setMedicalFile] = useState(null);
  // console.log("🚀 ~ MyLeaves ~ medicalFile:", medicalFile)
  const [medicalFileError, setMedicalFileError] = useState("");
  // console.log("🚀 ~ MyLeaves ~ medicalFileError:", medicalFileError)

  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  console.log("🚀 ~ MyLeaves ~ uploadError:", uploadError);
  const [uploading, setUploading] = useState(false);

const [sandwichWarnings, setSandwichWarnings] = useState([]);

  // ── Effects ──
  useEffect(() => {
    getMyLeaves(page, limit, {
      status: statusFilter,
      leave_type: typeFilter,
      search,
    });
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      getMyLeaves(1, limit, {
        status: statusFilter,
        leave_type: typeFilter,
        search,
      });
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  // Fetch logs when view modal opens
  useEffect(() => {
    if (!viewTarget?.id) {
      setLogs([]);
      return;
    }
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


useEffect(() => {
  setSandwichWarnings([]);
  const firstBlock = leaveBlocks[0];
  if (!firstBlock?.start_date || !firstBlock?.end_date || !firstBlock?.duration) return;
  const timer = setTimeout(async () => {
    try {
      const result = await checkAdjacentLeaves({
        start_date: firstBlock.start_date,
        end_date:   firstBlock.end_date,
        duration:   firstBlock.duration,
      });
      if (result.has_warning) setSandwichWarnings(result.warnings);
    } catch {
      // silently ignore
    }
  }, 600);
  return () => clearTimeout(timer);
}, [leaveBlocks[0]?.start_date, leaveBlocks[0]?.end_date, leaveBlocks[0]?.duration]);


  // ── Form handlers ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // when leave_type changes away from exchange, clear worked_saturday_id
    if (name === "leave_type" && value !== "exchange") {
      setForm((prev) => ({
        ...prev,
        leave_type: value,
        worked_saturday_id: "",
      }));
    }

    // when duration changes to half day, sync end_date = start_date
    if (
      name === "duration" &&
      (value === "first_half" || value === "second_half")
    ) {
      setForm((prev) => ({
        ...prev,
        duration: value,
        end_date: prev.start_date,
      }));
    }

    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };


  const handleBlockChange = (idx, field, value) => {
  setLeaveBlocks((prev) => {
    const updated = [...prev];
    updated[idx] = { ...updated[idx], [field]: value };

    // If duration becomes half-day, sync end_date to start_date
    if (
      field === 'duration' &&
      (value === 'first_half' || value === 'second_half')
    ) {
      updated[idx].end_date = updated[idx].start_date;
    }

    // If start_date changes and duration is half-day, sync end_date too
    if (field === 'start_date' && updated[idx].duration !== 'full_day') {
      updated[idx].end_date = value;
    }

    return updated;
  });

  // Clear block error for this field
  setBlockErrors((prev) => {
    const updated = [...prev];
    if (updated[idx]) updated[idx] = { ...updated[idx], [field]: '' };
    return updated;
  });
};

const addBlock = () => {
  setLeaveBlocks((prev) => [...prev, { ...initialBlock }]);
  setBlockErrors((prev) => [...prev, {}]);
};

const removeBlock = (idx) => {
  if (leaveBlocks.length === 1) return; // always keep at least one
  setLeaveBlocks((prev) => prev.filter((_, i) => i !== idx));
  setBlockErrors((prev) => prev.filter((_, i) => i !== idx));
};



const validate = () => {
  const errors = {};
  if (!form.reason.trim()) errors.reason = 'Reason is required.';
  if (form.leave_type === 'exchange' && !form.worked_saturday_id)
    errors.worked_saturday_id = 'Please select a Saturday to exchange.';
  if (form.reason_type === 'emergency' && !emergencySubType)
    errors.emergency_sub_type = 'Please select Medical or Other.';

  const bErrors = leaveBlocks.map((block) => {
    const e = {};
    if (!block.start_date) e.start_date = 'Start date is required.';
    if (!block.end_date)   e.end_date   = 'End date is required.';
    return e;
  });

  setBlockErrors(bErrors);
  const hasBlockErrors = bErrors.some((e) => Object.keys(e).length > 0);

  return { formErrors: errors, hasBlockErrors };
};


const openForm = () => {
  setForm(initialForm);
  setLeaveBlocks([{ ...initialBlock }]);
  setFieldErrors({});
  setBlockErrors([]);
  setSandwichWarnings([]);
  setShowForm(true);
};

const closeForm = () => {
  setShowForm(false);
  setForm(initialForm);
  setLeaveBlocks([{ ...initialBlock }]);
  setFieldErrors({});
  setBlockErrors([]);
  setEmergencySubType('');
  setMedicalFile(null);
  setMedicalFileError('');
  setSandwichWarnings([]);
};




  const handleSubmit = async (e) => {
  e.preventDefault();
  const { formErrors, hasBlockErrors } = validate();
  if (Object.keys(formErrors).length || hasBlockErrors) {
    setFieldErrors(formErrors);
    return;
  }

  try {
    setSubmitting(true);
    const results = [];

    for (let i = 0; i < leaveBlocks.length; i++) {
      const block = leaveBlocks[i];
      const payload = {
        leave_type:   form.leave_type,
        reason_type:  form.reason_type,
        reason:       form.reason,
        start_date:   block.start_date,
        end_date:     block.end_date,
        duration:     block.duration,
        ...(form.leave_type === 'exchange' && {
          worked_saturday_id: form.worked_saturday_id,
        }),
        ...(form.reason_type === 'emergency' && {
          emergency_sub_type: emergencySubType,
        }),
      };

      try {
        const result = await createLeave(
          payload,
          // only attach file to first block for emergency
          i === 0 && form.reason_type === 'emergency' ? medicalFile : null
        );
        results.push({ index: i, success: true, display_id: result?.leave?.display_id });
      } catch (err) {
        results.push({
          index: i,
          success: false,
          error: err?.response?.data?.message || 'Failed to submit.',
          block,
        });
      }
    }

    const succeeded = results.filter((r) => r.success);
    const failed    = results.filter((r) => !r.success);

    if (succeeded.length > 0 && failed.length === 0) {
      setAlert({
        type: 'success',
        message: leaveBlocks.length > 1
          ? `${succeeded.length} leave request(s) submitted successfully.`
          : 'Leave request submitted successfully.',
      });
      closeForm();
      getMyLeaves(1, limit, {});
    } else if (succeeded.length > 0 && failed.length > 0) {
      // Partial success
      setAlert({
        type: 'danger',
        message: `${succeeded.length} submitted, ${failed.length} failed: ${failed.map((f) => f.error).join('; ')}`,
      });
      // Remove succeeded blocks, keep failed ones for retry
      setLeaveBlocks(failed.map((f) => f.block));
      setBlockErrors(failed.map(() => ({})));
      getMyLeaves(1, limit, {});
    } else {
      setAlert({
        type: 'danger',
        message: failed.map((f) => f.error).join('; '),
      });
    }
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

  //   const handleUploadDocument = async () => {
  //   if (!uploadFile) { setUploadError("Please select a file."); return; }
  //   if (uploadFile.size > 10 * 1024 * 1024) { setUploadError("File must be under 10MB."); return; }

  //   try {
  //     setUploading(true);
  //   const uld = await uploadLeaveDocument(uploadTarget.id, uploadFile);
  //     console.log("🚀 ~ handleUploadDocument ~ uld:", uld)
  //     setAlert({ type: "success", message: "Document uploaded successfully. Admin has been notified." });

  //     // If view modal is open for the same leave, update viewTarget too
  //   if (viewTarget?.id === uploadTarget.id) {
  //   setViewTarget((prev) => ({
  //     ...prev,
  //     medical_document: data.medical_document,
  //     document_uploaded_at:
  //       data.document_uploaded_at || new Date().toISOString(),
  //   }));
  // }
  //     setUploadTarget(null);
  //     setUploadFile(null);
  //     setUploadError("");
  //   } catch (err) {
  //       console.log("🚀 ~ handleUploadDocument ~ err:", err)
  //     setUploadError(err?.response?.data?.message || "Upload failed. Please try again.");
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const handleUploadDocument = async () => {
    if (!uploadFile) {
      setUploadError("Please select a file.");
      return;
    }
    if (uploadFile.size > 10 * 1024 * 1024) {
      setUploadError("File must be under 10MB.");
      return;
    }

    try {
      setUploading(true);
      const result = await uploadLeaveDocument(uploadTarget.id, uploadFile);

      // result.medical_document is the URL string from backend
      const docUrl = result?.medical_document;
      const uploadedAt = new Date().toISOString();

      // Update viewTarget BEFORE closing upload modal
      if (viewTarget?.id === uploadTarget.id) {
        setViewTarget((prev) => ({
          ...prev,
          medical_document: docUrl, // string URL — matches the check below
          document_uploaded_at: uploadedAt,
        }));
      }

      setUploadTarget(null);
      setUploadFile(null);
      setUploadError("");
      setAlert({
        type: "success",
        message: "Document uploaded successfully. Admin has been notified.",
      });

      getMyLeaves(page, limit, {
        status: statusFilter,
        leave_type: typeFilter,
        search,
      });
    } catch (err) {
      setUploadError(
        err?.response?.data?.message || "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };
  const columns = useMemo(
    () => [
      {
        field: "createdAt",
        headerName: "Requested On",
        width: 180,
        renderCell: ({ row }) => (
          <div>
            <div className="font-black text-slate-800 text-base">
              {formatDate(row.createdAt)}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {formatDateTime(row.createdAt).split(" ")[1]}
            </div>
          </div>
        ),
      },
      {
        field: "display_id",
        headerName: "Display ID",
        width: 140,
        renderCell: ({ row }) => (
          <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[11px] font-black uppercase tracking-widest font-mono">
            {row.display_id || "—"}
          </span>
        ),
      },
      {
        field: "leave_type",
        headerName: "Leave Type",
        width: 160,
        renderCell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <LeaveBadge type={row.leave_type} />
            {row.reason_type === "emergency" && (
              <span className="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest bg-red-100 text-red-600 w-fit">
                Emergency
              </span>
            )}
          </div>
        ),
      },
      {
        field: "duration",
        headerName: "Duration",
        width: 140,
        renderCell: ({ row }) => (
          <span className="text-sm font-black text-slate-600">
            {DURATION_LABELS[row.duration] || row.duration}
          </span>
        ),
      },
      {
        field: "start_date",
        headerName: "From",
        width: 140,
        renderCell: ({ row }) => (
          <span className="text-sm font-black text-slate-700">
            {formatDate(row.start_date)}
          </span>
        ),
      },
      {
        field: "end_date",
        headerName: "To",
        width: 140,
        renderCell: ({ row }) => (
          <span className="text-sm font-black text-slate-700">
            {formatDate(row.end_date)}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        renderCell: ({ row }) => <StatusBadge status={row.status} />,
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 140,
        align: "right",
        renderCell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setViewTarget(row)}
              title="View"
              className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all"
            >
              <MdVisibility size={20} />
            </button>

            {/* Upload document button — emergency leaves with no doc yet */}
            {row.reason_type === "emergency" && !row.medical_document && (
              <button
                onClick={() => {
                  setUploadTarget(row);
                  setUploadFile(null);
                  setUploadError("");
                }}
                title="Upload Document"
                className="p-3 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
              >
                <FaBriefcaseMedical size={18} />
              </button>
            )}

            {row.status === "pending" && (
              <button
                onClick={() => setConfirmCancel(row)}
                title="Cancel"
                className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <MdCancel size={20} />
              </button>
            )}



            
{/* {false && leave.status === 'approved' && (() => {
  const now = new Date(); now.setHours(0,0,0,0);
  const leaveStart = new Date(leave.start_date); leaveStart.setHours(0,0,0,0);
  return now < leaveStart;
})() && (
  <button
    onClick={() => setConfirmCancel(leave)}
    title="Cancel Approved Leave"
    className="p-3 rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-100 transition-all"
  >
    <MdCancel size={20} />
  </button>
)} */}
          </div>
        ),
      },
    ],
    [],
  );

  // ── Pagination ──
  const Pagination = ({ compact = false }) => (
    <div
      className={`flex items-center justify-between px-6 py-6 ${!compact ? "border-t border-slate-100" : ""}`}
    >
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
      >
        {compact ? "Prev" : "Previous"}
      </button>
      {compact ? (
        <span className="text-sm font-bold text-slate-500">
          {page} / {totalPages}
        </span>
      ) : (
        <div className="flex items-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? "bg-[#132ea7] text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
      >
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
          <Button
            variant="primary"
            className="shadow-lg shadow-[#132ea7]/20 px-8 rounded-xl h-[52px] font-black uppercase tracking-widest text-sm"
            onClick={openForm}
          >
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
              { value: "", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "cancelled", label: "Cancelled" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setPage(1);
                  setStatusFilter(opt.value);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  statusFilter === opt.value
                    ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Leave type filter */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {[
              { value: "", label: "All Types" },
              // { value: "paid",     label: "Paid"      },
              // { value: "unpaid",   label: "Unpaid"    },
              { value: "exchange", label: "Exchange" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setPage(1);
                  setTypeFilter(opt.value);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  typeFilter === opt.value
                    ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Display Id...."
          />
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* ── Desktop Table ── */}
      <div className="hidden md:block">
        <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
          {leaves.length === 0 ? (
            <div className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">
              No leave requests found.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={leaves.filter(Boolean)}
              rowKey="id"
            />
          )}
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
            <div
              key={leave.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-800 leading-tight">
                    {LEAVE_TYPE_LABELS[leave.leave_type]} —{" "}
                    {DURATION_LABELS[leave.duration]}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 font-mono mt-0.5">
                    {leave.display_id}
                  </p>
                </div>
                <StatusBadge status={leave.status} />
              </div>

              <div className="space-y-2 text-sm">
                {[
                  { label: "From", value: formatDate(leave.start_date) },
                  { label: "To", value: formatDate(leave.end_date) },
                  { label: "Requested", value: formatDate(leave.createdAt) },
                  {
                    label: "Type",
                    value:
                      leave.reason_type === "emergency"
                        ? "Emergency"
                        : "Casual",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center"
                  >
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      {item.label}
                    </span>
                    <span className="font-bold text-slate-700 text-xs">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setViewTarget(leave)}
                  className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
                >
                  <MdVisibility size={16} /> View
                </button>
                {leave.status === "pending" && (
                  <button
                    onClick={() => setConfirmCancel(leave)}
                    className="flex-1 h-10 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-red-100 transition-all"
                  >
                    <MdCancel size={16} /> Cancel
                  </button>
                )}

   {/* remove {false && when needed */}
{/* {false && leave.status === 'approved' && (
  <button
    onClick={() => setConfirmCancel(leave)}
    className="flex-1 h-10 rounded-xl bg-orange-50 text-orange-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-orange-100 transition-all"
  >
    <MdCancel size={16} /> Cancel Leave
  </button>
)} */}
                {/* {leave.reason_type === "emergency" && !leave.medical_document && (
  <button
    onClick={() => { setUploadTarget(leave); setUploadFile(null); setUploadError(""); }}
    className="flex-1 h-10 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-amber-100 transition-all"
  >
    <FaBriefcaseMedical size={14} /> Upload Doc
  </button>
)} */}

                {leave.reason_type === "emergency" &&
                !leave.medical_document ? (
                  <p>
                    Please upload the supporting document for this emergency
                    leave.
                  </p>
                ) : leave.reason_type === "emergency" &&
                  leave.medical_document ? (
                  <p>Supporting document has been uploaded.</p>
                ) : null}
              </div>
            </div>
          ))
        )}
        {totalPages > 1 && <Pagination compact />}
      </div>

      {/* ── Request Leave Modal ── */}
      <Modal
        show={showForm}
        onClose={closeForm}
        title="Request Leave"
        size="lg"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Leave Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                Leave Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "leave_type",
                        value:
                          form.leave_type === "exchange" ? "paid" : "exchange",
                      },
                    })
                  }
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    form.leave_type === "exchange"
                      ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  Exchange
                </button>
              </div>
              <p className="text-[10px] font-bold text-slate-400 ml-1">
                Leave this unselected for regular leave. Select Exchange only if
                using a worked Saturday.
              </p>
            </div>

            {/* Reason Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                Reason Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "casual", label: "Casual" },
                  { value: "emergency", label: "Emergency" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      handleChange({
                        target: { name: "reason_type", value: opt.value },
                      })
                    }
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      form.reason_type === opt.value
                        ? opt.value === "emergency"
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                          : "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {/* Emergency Sub-type — only shown when emergency is selected */}
              {/* Emergency document upload — shown when emergency is selected */}
              {form.reason_type === "emergency" && (
                <div className="md:col-span-2 space-y-3">
                  {/* Sub-type selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                      Emergency Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {["medical", "other"].map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => {
                            setEmergencySubType(sub);
                            setFieldErrors((prev) => ({
                              ...prev,
                              emergency_sub_type: "",
                            }));
                          }}
                          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            emergencySubType === sub
                              ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          {sub === "medical" ? "Medical" : "Other"}
                        </button>
                      ))}
                    </div>
                    {fieldErrors.emergency_sub_type && (
                      <p className="text-red-500 text-[10px] font-bold uppercase ml-1">
                        {fieldErrors.emergency_sub_type}
                      </p>
                    )}
                  </div>

                  {/* Document upload — always required for emergency */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                      Supporting Document{" "}
                      <span className="text-slate-400 font-bold normal-case tracking-normal">
                        (Optional — can be uploaded later)
                      </span>
                      <span className="text-slate-400 font-bold normal-case tracking-normal">
                        (PDF, JPG, PNG — max 10MB)
                      </span>
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-2xl p-4 transition-all ${
                        fieldErrors.medical_file
                          ? "border-red-300 bg-red-50/30"
                          : "border-slate-200 hover:border-[#132ea7]/40"
                      }`}
                    >
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            setMedicalFileError("File must be under 10MB.");
                            return;
                          }
                          setMedicalFile(file);
                          setMedicalFileError("");
                          setFieldErrors((prev) => ({
                            ...prev,
                            medical_file: "",
                          }));
                        }}
                        className="w-full text-xs font-bold text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#132ea7]/10 file:text-[#132ea7] file:font-black file:text-xs file:uppercase file:tracking-widest hover:file:bg-[#132ea7]/20 cursor-pointer"
                      />
                      {medicalFile && (
                        <p className="text-xs font-bold text-green-600 mt-2">
                          ✓ {medicalFile.name}
                        </p>
                      )}
                      {(medicalFileError || fieldErrors.medical_file) && (
                        <p className="text-xs font-bold text-red-500 mt-2">
                          {medicalFileError || fieldErrors.medical_file}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "full_day", label: "Full Day" },
                  { value: "first_half", label: "First Half" },
                  { value: "second_half", label: "Second Half" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      handleChange({
                        target: { name: "duration", value: opt.value },
                      })
                    }
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      form.duration === opt.value
                        ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {(form.duration === "first_half" ||
                form.duration === "second_half") && (
                <p className="text-[10px] font-black text-[#132ea7] uppercase tracking-widest ml-1 mt-1">
                  Half day — start and end date must be the same
                </p>
              )}
            </div>

            {/* Start Date */}
            {/* <div>
              <Input
                label="Start Date"
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => {
                  handleChange(e);
                  // for half day, keep end_date in sync
                  if (form.duration !== "full_day") {
                    setForm((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                      end_date: e.target.value,
                    }));
                  }
                }}
                error={fieldErrors.start_date}
                required
              />
            </div> */}

            {/* End Date */}
            {/* <div>
              <Input
                label="End Date"
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={handleChange}
                disabled={
                  form.duration === "first_half" ||
                  form.duration === "second_half"
                }
                error={fieldErrors.end_date}
                required
              />
              {(form.duration === "first_half" ||
                form.duration === "second_half") && (
                <p className="text-[10px] font-bold text-slate-400 ml-1 mt-1">
                  Auto-set to match start date for half day
                </p>
              )}
            </div> */}


            {/* ── Leave Date Blocks ── */}
<div className="md:col-span-2 space-y-4">
  <div className="flex items-center justify-between">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
      Leave Dates
    </label>
    <button
      type="button"
      onClick={addBlock}
      className="flex items-center gap-1 px-3 py-1.5 bg-[#132ea7]/10 text-[#132ea7] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#132ea7]/20 transition-all"
    >
      <MdAdd size={14} /> Add Date Block
    </button>
  </div>

  {leaveBlocks.map((block, idx) => (
    <div
      key={idx}
      className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/50 relative"
    >
      {/* Block header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {leaveBlocks.length > 1 ? `Block ${idx + 1}` : 'Date Range'}
        </span>
        {leaveBlocks.length > 1 && (
          <button
            type="button"
            onClick={() => removeBlock(idx)}
            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <MdClose size={14} />
          </button>
        )}
      </div>

      {/* Duration selector per block */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">
          Duration
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'full_day',    label: 'Full Day' },
            { value: 'first_half',  label: 'First Half' },
            { value: 'second_half', label: 'Second Half' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleBlockChange(idx, 'duration', opt.value)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                block.duration === opt.value
                  ? 'bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20'
                  : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            label="Start Date"
            name={`start_date_${idx}`}
            type="date"
            value={block.start_date}
            onChange={(e) => handleBlockChange(idx, 'start_date', e.target.value)}
            error={blockErrors[idx]?.start_date}
            required
          />
        </div>
        <div>
          <Input
            label="End Date"
            name={`end_date_${idx}`}
            type="date"
            value={block.end_date}
            onChange={(e) => handleBlockChange(idx, 'end_date', e.target.value)}
            disabled={block.duration === 'first_half' || block.duration === 'second_half'}
            error={blockErrors[idx]?.end_date}
            required
          />
        </div>
      </div>

      {(block.duration === 'first_half' || block.duration === 'second_half') && (
        <p className="text-[10px] font-black text-[#132ea7] uppercase tracking-widest">
          Half day — end date auto-set to match start date
        </p>
      )}
    </div>
  ))}
</div>

            {/* Exchange Saturday picker */}
            {form.leave_type === "exchange" && (
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                  Select Saturday to Exchange{" "}
                  <span className="text-red-500">*</span>
                </label>

                {(() => {
                  const currentMonthSaturdays = saturdays.filter((s) => {
                    const satDate = new Date(s.saturday_date);
                    const now = new Date();
                    return (
                      satDate.getMonth() === now.getMonth() &&
                      satDate.getFullYear() === now.getFullYear()
                    );
                  });

                  if (saturdaysLoading) {
                    return (
                      <p className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                        Loading available Saturdays...
                      </p>
                    );
                  }

                  if (currentMonthSaturdays.length === 0) {
                    return (
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3">
                        <p className="text-xs font-black text-amber-600 uppercase tracking-widest">
                          No worked Saturdays available this month. Ask admin to
                          mark your worked Saturdays first.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-wrap gap-2">
                      {currentMonthSaturdays.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              worked_saturday_id: s.id,
                            }))
                          }
                          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            form.worked_saturday_id === s.id
                              ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          {formatDate(s.saturday_date)}
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {fieldErrors.worked_saturday_id && (
                  <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1">
                    {fieldErrors.worked_saturday_id}
                  </p>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="md:col-span-2">
              <Textarea
                label="Reason"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Briefly describe the reason for leave..."
                rows={3}
                error={fieldErrors.reason}
                required
              />
            </div>
          </div>


          {sandwichWarnings.length > 0 && (
  <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 space-y-2">
    <p className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
      <MdInfoOutline size={14} /> Sandwich Rule Warning
    </p>
    {sandwichWarnings.map((w, i) => (
      <p key={i} className="text-xs font-bold text-amber-600 leading-relaxed">
        {w.message}
      </p>
    ))}
    <p className="text-[10px] font-bold text-amber-500">
      These days will be automatically deducted when this leave is approved.
    </p>
  </div>
)}



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
            <Button
              variant="ghost"
              className="flex-1 font-black uppercase tracking-widest text-sm"
              onClick={closeForm}
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
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── View / Detail Modal ── */}
      <Modal
        show={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Leave Details"
        size="lg"
      >
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
                {
                  label: "Leave Type",
                  value:
                    viewTarget.leave_type === "exchange"
                      ? "Exchange"
                      : viewTarget.status === "approved"
                        ? LEAVE_TYPE_LABELS[viewTarget.leave_type]
                        : "—",
                },
                {
                  label: "Duration",
                  value: DURATION_LABELS[viewTarget.duration],
                },
                { label: "From", value: formatDate(viewTarget.start_date) },
                { label: "To", value: formatDate(viewTarget.end_date) },
                { label: "Requested", value: formatDate(viewTarget.createdAt) },
                {
                  label: "Approved By",
                  value: viewTarget.approver?.name || "—",
                },
                {
                  label: "Approved At",
                  value: viewTarget.approved_at
                    ? formatDate(viewTarget.approved_at)
                    : "—",
                },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {item.label}
                  </p>
                  <p className="font-black text-slate-700 text-sm">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Reason */}
            <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
                Reason
              </p>
              <p className="font-medium leading-relaxed opacity-90">
                {viewTarget.reason}
              </p>
            </div>

            {/* Rejection reason */}
            {viewTarget.status === "rejected" &&
              viewTarget.rejection_reason && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">
                    Rejection Reason
                  </p>
                  <p className="font-bold text-red-600 text-sm">
                    {viewTarget.rejection_reason}
                  </p>
                </div>
              )}

            {viewTarget?.reason_type === "emergency" && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
                <div>
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
                    Emergency Type
                  </p>
                  <p className="font-black text-red-600 text-sm capitalize">
                    {viewTarget.emergency_sub_type === "medical"
                      ? "Medical"
                      : "Other"}
                  </p>
                </div>

                {/* Normalize: medical_document can be a string URL or { url: string } object */}
                {(() => {
                  const docUrl =
                    typeof viewTarget.medical_document === "string"
                      ? viewTarget.medical_document
                      : viewTarget.medical_document?.url || null;

                  const baseUrl = import.meta.env.VITE_API_URL?.replace(
                    "/api/",
                    "",
                  ).replace("/api", "");

                  return docUrl ? (
                    <div className="bg-white rounded-xl p-3 border border-red-100 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                          Supporting Document
                        </p>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
                          ✓ Uploaded{" "}
                          {viewTarget.document_uploaded_at
                            ? formatDate(viewTarget.document_uploaded_at)
                            : ""}
                        </p>
                      </div>

                      <a
                        href={`${baseUrl}${docUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#132ea7]/10 text-[#132ea7] text-xs font-black uppercase tracking-widest hover:bg-[#132ea7]/20 transition-all whitespace-nowrap"
                      >
                        View Doc
                      </a>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-3 border border-amber-200 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                          Supporting Document
                        </p>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                          ⚠️ Not uploaded yet
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setViewTarget(null);
                          setUploadTarget(viewTarget);
                          setUploadFile(null);
                          setUploadError("");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all whitespace-nowrap"
                      >
                        Upload Now
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Activity Logs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MdTimeline size={16} className="text-slate-400" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Activity
                </p>
              </div>
              {logsLoading ? (
                <p className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest text-center py-4">
                  Loading...
                </p>
              ) : logs.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 text-center py-3">
                  No activity yet.
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-100" />
                  <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-4 relative">
                        <div
                          className={`w-4 h-4 rounded-full shrink-0 mt-0.5 z-10 ring-2 ring-white ${
                            log.action === "approved"
                              ? "bg-green-500"
                              : log.action === "rejected"
                                ? "bg-red-500"
                                : log.action === "cancelled"
                                  ? "bg-slate-400"
                                  : "bg-[#132ea7]"
                          }`}
                        />
                        <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <p className="text-xs font-black text-slate-700 capitalize">
                              {log.action}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {formatDateTime(log.created_at)}
                            </p>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            By {log.user?.name || "—"}
                          </p>
                          {log.remarks?.rejection_reason && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Reason
                              </p>
                              <p className="text-xs font-bold text-slate-600 mt-0.5">
                                {log.remarks.rejection_reason}
                              </p>
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
              <Button
                variant="ghost"
                onClick={() => setViewTarget(null)}
                className="font-black uppercase tracking-widest text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Cancel Confirm ── */}

      {/* <ConfirmDialog
  show={!!confirmCancel}
  message={
    confirmCancel?.status === 'approved'
      ? `Cancel your approved leave "${confirmCancel?.display_id}"? Your balance will be restored automatically.`
      : `Cancel leave request "${confirmCancel?.display_id}"? This cannot be undone.`
  }
  onConfirm={handleCancel}
  onCancel={() => setConfirmCancel(null)}
  loading={cancelling}
/> */}
      <ConfirmDialog
        show={!!confirmCancel}
        message={`Cancel leave request "${confirmCancel?.display_id}"? This cannot be undone.`}
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(null)}
        loading={cancelling}
      />

      {/* ── Upload Document Modal ── */}
      <Modal
        show={!!uploadTarget}
        onClose={() => {
          setUploadTarget(null);
          setUploadFile(null);
          setUploadError("");
        }}
        title="Upload Supporting Document"
        size="sm"
      >
        {uploadTarget && (
          <div className="space-y-5">
            {/* Leave info */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Leave Request
              </p>
              <p className="font-black text-slate-800">
                {uploadTarget.display_id}
              </p>
              <p className="text-xs font-bold text-slate-500 mt-1">
                {formatDate(uploadTarget.start_date)} —{" "}
                {formatDate(uploadTarget.end_date)}
                {" · "}
                {DURATION_LABELS[uploadTarget.duration]}
              </p>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
              <p className="text-xs font-black text-amber-700 uppercase tracking-widest">
                Admin will be notified by email with this document attached.
              </p>
            </div>

            {/* File picker */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                Document <span className="text-red-500">*</span>{" "}
                <span className="text-slate-400 font-bold normal-case tracking-normal">
                  (PDF, JPG, PNG — max 10MB)
                </span>
              </label>
              <div
                className={`border-2 border-dashed rounded-2xl p-4 transition-all ${
                  uploadError
                    ? "border-red-300 bg-red-50/30"
                    : "border-slate-200 hover:border-[#132ea7]/40"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                      setUploadError("File must be under 10MB.");
                      return;
                    }
                    setUploadFile(file);
                    setUploadError("");
                  }}
                  className="w-full text-xs font-bold text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#132ea7]/10 file:text-[#132ea7] file:font-black file:text-xs file:uppercase file:tracking-widest hover:file:bg-[#132ea7]/20 cursor-pointer"
                />
                {uploadFile && (
                  <p className="text-xs font-bold text-green-600 mt-2">
                    ✓ {uploadFile.name}
                  </p>
                )}
              </div>
              {uploadError && (
                <p className="text-red-500 text-[10px] font-bold uppercase ml-1">
                  {uploadError}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2 border-t border-slate-50">
              <Button
                variant="ghost"
                className="flex-1 font-black uppercase tracking-widest text-sm"
                onClick={() => {
                  setUploadTarget(null);
                  setUploadFile(null);
                  setUploadError("");
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm"
                onClick={handleUploadDocument}
                loading={uploading}
              >
                Upload & Notify Admin
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyLeaves;
