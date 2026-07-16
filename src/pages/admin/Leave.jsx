import { useEffect, useState } from "react";
import { useLeave } from "../../context/LeaveContext";
import { useUser } from "../../context/UserContext";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import {
  MdBeachAccess,
  MdVisibility,
  MdCheck,
  MdClose,
  MdSearch,
  MdTimeline,
  MdPerson,
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

const DURATION_LABELS = {
  full_day:    "Full Day",
  first_half:  "First Half",
  second_half: "Second Half",
};

// Maps to Badge colorMap keys via overrideColor
const STATUS_BADGE_MAP = {
  pending:   "pending",
  approved:  "active",     // green
  rejected:  "danger",     // red
  cancelled: "inactive",   // grey
};

const LEAVE_TYPE_BADGE_MAP = {
  paid:     "primary",
  unpaid:   "secondary",
  exchange: "ongoing",
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const Leaves = () => {
  const {
    leaves,
    loading,
    page,
    limit,
    total,
    totalPages,
    setPage,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    getLeaveLogs,
  } = useLeave();

  const { users, getAllUsers } = useUser();

  // ── Modal state ──
  const [viewTarget,      setViewTarget]      = useState(null);
  const [rejectTarget,    setRejectTarget]    = useState(null);
  const [confirmApprove,  setConfirmApprove]  = useState(null);

  // ── Action state ──
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError,  setRejectionError]  = useState("");
  const [approving,       setApproving]       = useState(false);
  const [rejecting,       setRejecting]       = useState(false);
  const [alert,           setAlert]           = useState({ type: "", message: "" });

  // ── Logs state ──
  const [logs,        setLogs]        = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // ── Filters ──
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [userFilter,   setUserFilter]   = useState("");

  // ── Effects ──
  useEffect(() => {
    getAllLeaves(page, limit, {
      status:     statusFilter,
      leave_type: typeFilter,
      user_id:    userFilter,
      search,
    });
  }, [page, statusFilter, typeFilter, userFilter]);

  useEffect(() => {
    getAllUsers?.();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      getAllLeaves(1, limit, {
        status:     statusFilter,
        leave_type: typeFilter,
        user_id:    userFilter,
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

  // ── Approve ──
  const handleApprove = async () => {
    if (!confirmApprove) return;
    try {
      setApproving(true);
      await approveLeave(confirmApprove.id);
      setAlert({ type: "success", message: `Leave ${confirmApprove.display_id} approved.` });
      // update viewTarget if open
      if (viewTarget?.id === confirmApprove.id) {
        setViewTarget((prev) => ({ ...prev, status: "approved" }));
      }
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Failed to approve.",
      });
    } finally {
      setApproving(false);
      setConfirmApprove(null);
    }
  };

  // ── Reject ──
  const openReject = (leave) => {
    setRejectTarget(leave);
    setRejectionReason("");
    setRejectionError("");
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError("Rejection reason is required.");
      return;
    }
    if (rejectionReason.trim().length < 5) {
      setRejectionError("Rejection reason must be at least 5 characters.");
      return;
    }
    try {
      setRejecting(true);
      await rejectLeave(rejectTarget.id, rejectionReason.trim());
      setAlert({ type: "success", message: `Leave ${rejectTarget.display_id} rejected.` });
      if (viewTarget?.id === rejectTarget.id) {
        setViewTarget((prev) => ({
          ...prev,
          status: "rejected",
          rejection_reason: rejectionReason.trim(),
        }));
      }
      setRejectTarget(null);
      setRejectionReason("");
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Failed to reject.",
      });
    } finally {
      setRejecting(false);
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
              className={`w-10 h-10 rounded-xl font-bold transition-all ${
                page === i + 1 ? "bg-[#132ea7] text-white" : "bg-slate-100 text-slate-700"
              }`}>
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

  if (loading && !leaves.length)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
          Loading leaves...
        </p>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* ── Header ── */}
      <div className="space-y-4">
       <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1 uppercase">
              Leave <span className="text-[#132ea7]">Requests</span>
            </h2>
            <p className="text-slate-500 font-bold text-base">Total: {total}</p>
          </div>
        </div>

<div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
        {/* ── Filters ── */}
         <div className="flex flex-col lg:flex-row gap-6 flex-1">

          {/* Status filter */}
          <div className="flex flex-wrap gap-2">
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
          <div className="flex items-center gap-2 flex-wrap">
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
</div>

<div className="flex flex-col sm:flex-row gap-4 shrink-0">
          {/* Employee filter dropdown */}
             <div className="w-full sm:w-[300px]">
                        
           
            <select
              value={userFilter}
              onChange={(e) => { setPage(1); setUserFilter(e.target.value); }}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 focus:border-[#132ea7] transition-all shadow-sm appearance-none"
            >
              <option value="">All Employees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
            <div className="w-full sm:w-[320px]">
           <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search Tasks, Projects..."
        
            />
            </div>
        </div>
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
                  {[
                    "Requested On",
                    "Display ID",
                    "Employee",
                    "Leave Type",
                    "Duration",
                    "From",
                    "To",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th key={h}
                      className="px-6 py-5 text-md font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Spinner size="lg" />
                        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
                          Loading...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan={9}
                      className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors group">

                      {/* Requested On */}
                      <td className="px-6 py-5">
                        <div className="font-black text-slate-800 text-base">
                          {formatDate(leave.createdAt)}
                        </div>
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

                      {/* Employee */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px]">
                            {leave.employee?.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-700">
                              {leave.employee?.name || "—"}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              {leave.employee?.employee_id || ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Leave Type */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <Badge
                            value={LEAVE_TYPE_LABELS[leave.leave_type]}
                            overrideColor={LEAVE_TYPE_BADGE_MAP[leave.leave_type]}
                          />
                          {leave.reason_type === "emergency" && (
                            <Badge value="Emergency" overrideColor="danger" />
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
                        <span className="text-sm font-black text-slate-700">
                          {formatDate(leave.start_date)}
                        </span>
                      </td>

                      {/* To */}
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-slate-700">
                          {formatDate(leave.end_date)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <Badge
                          value={leave.status}
                          overrideColor={STATUS_BADGE_MAP[leave.status]}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {/* View */}
                          <button onClick={() => setViewTarget(leave)} title="View"
                            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all">
                            <MdVisibility size={20} />
                          </button>

                          {/* Approve — only if pending */}
                          {leave.status === "pending" && (
                            <button onClick={() => setConfirmApprove(leave)} title="Approve"
                              className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-600 transition-all">
                              <MdCheck size={20} />
                            </button>
                          )}

                          {/* Reject — only if pending */}
                          {leave.status === "pending" && (
                            <button onClick={() => openReject(leave)} title="Reject"
                              className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                              <MdClose size={20} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
          leaves.map((leave) => (
            <div key={leave.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">

              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-sm">
                    {leave.employee?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 leading-tight">
                      {leave.employee?.name || "—"}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 font-mono mt-0.5">
                      {leave.display_id}
                    </p>
                  </div>
                </div>
                <Badge
                  value={leave.status}
                  overrideColor={STATUS_BADGE_MAP[leave.status]}
                />
              </div>

              {/* Meta */}
              <div className="space-y-2 text-sm">
                {[
                  { label: "Leave Type", value: LEAVE_TYPE_LABELS[leave.leave_type] },
                  { label: "Duration",   value: DURATION_LABELS[leave.duration]     },
                  { label: "From",       value: formatDate(leave.start_date)         },
                  { label: "To",         value: formatDate(leave.end_date)           },
                  { label: "Requested",  value: formatDate(leave.createdAt)          },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">{item.label}</span>
                    <span className="font-bold text-slate-700 text-xs">{item.value}</span>
                  </div>
                ))}
                {leave.reason_type === "emergency" && (
                  <div className="flex justify-end">
                    <Badge value="Emergency" overrideColor="danger" />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button onClick={() => setViewTarget(leave)}
                  className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all">
                  <MdVisibility size={16} /> View
                </button>
                {leave.status === "pending" && (
                  <>
                    <button onClick={() => setConfirmApprove(leave)}
                      className="flex-1 h-10 rounded-xl bg-green-50 text-green-600 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-green-100 transition-all">
                      <MdCheck size={16} /> Approve
                    </button>
                    <button onClick={() => openReject(leave)}
                      className="flex-1 h-10 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-red-100 transition-all">
                      <MdClose size={16} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
        {totalPages > 1 && <Pagination compact />}
      </div>

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
                  <Badge
                    value={viewTarget.status}
                    overrideColor={STATUS_BADGE_MAP[viewTarget.status]}
                  />
                  {viewTarget.reason_type === "emergency" && (
                    <Badge value="Emergency" overrideColor="danger" />
                  )}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
                  {viewTarget.display_id || "—"}
                </p>
              </div>
            </div>

            {/* Employee info */}
            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
              <div className="w-12 h-12 rounded-full bg-[#132ea7]/10 flex items-center justify-center text-[#132ea7] font-black text-lg">
                {viewTarget.employee?.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-black text-slate-800">{viewTarget.employee?.name || "—"}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {viewTarget.employee?.employee_id || ""}
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
                { label: "Approved At", value: viewTarget.approved_at
                    ? formatDate(viewTarget.approved_at) : "—"                            },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {item.label}
                  </p>
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
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">
                  Rejection Reason
                </p>
                <p className="font-bold text-red-600 text-sm">{viewTarget.rejection_reason}</p>
              </div>
            )}

            {/* Approve / Reject actions inside view modal if still pending */}
            {viewTarget.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <Button variant="ghost"
                  className="flex-1 h-12 font-black uppercase tracking-widest text-sm border border-red-200 text-red-500 hover:bg-red-50"
                  onClick={() => {
                    openReject(viewTarget);
                    setViewTarget(null);
                  }}>
                  <MdClose size={18} className="mr-1" /> Reject
                </Button>
                <Button variant="primary"
                  className="flex-[2] h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 font-black uppercase tracking-widest text-sm"
                  onClick={() => {
                    setConfirmApprove(viewTarget);
                    setViewTarget(null);
                  }}>
                  <MdCheck size={18} className="mr-1" /> Approve
                </Button>
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
                        <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 z-10 ring-2 ring-white ${
                          log.action === "approved"  ? "bg-green-500"  :
                          log.action === "rejected"  ? "bg-red-500"    :
                          log.action === "cancelled" ? "bg-slate-400"  :
                          "bg-[#132ea7]"
                        }`} />
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
              <Button variant="ghost" onClick={() => setViewTarget(null)}
                className="font-black uppercase tracking-widest text-xs">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal show={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Leave Request" size="sm">
        {rejectTarget && (
          <div className="space-y-5">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Leave Request</p>
              <p className="font-black text-slate-800">{rejectTarget.display_id}</p>
              <p className="text-sm font-bold text-slate-500 mt-1">
                {rejectTarget.employee?.name} — {LEAVE_TYPE_LABELS[rejectTarget.leave_type]}
              </p>
            </div>

            <Textarea
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (rejectionError) setRejectionError("");
              }}
              placeholder="Explain why this leave is being rejected..."
              rows={4}
              required
            />
            {rejectionError && (
              <p className="text-red-500 text-[10px] font-bold uppercase ml-1 -mt-3">
                {rejectionError}
              </p>
            )}

            <div className="flex gap-4 pt-2 border-t border-slate-50">
              <Button variant="ghost"
                className="flex-1 font-black uppercase tracking-widest text-sm"
                onClick={() => setRejectTarget(null)}
                disabled={rejecting}>
                Cancel
              </Button>
              <Button
                className="flex-[2] h-14 bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20 font-black uppercase tracking-[0.2em] text-sm rounded-2xl"
                onClick={handleReject}
                loading={rejecting}>
                Confirm Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Approve Confirm ── */}
      <ConfirmDialog
        show={!!confirmApprove}
        message={`Approve leave request "${confirmApprove?.display_id}" for ${confirmApprove?.employee?.name}?`}
        onConfirm={handleApprove}
        onCancel={() => setConfirmApprove(null)}
        loading={approving}
      />
    </div>
  );
};

export default Leaves;