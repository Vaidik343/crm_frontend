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
  MdUndo ,
  MdTimeline,MdDownload, MdPictureAsPdf, MdTableChart  
} from "react-icons/md";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import LeaveCalculation from "../../components/leaves/LeaveCalculation";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const LEAVE_TYPE_LABELS = {
  paid:     "Casual",
  unpaid:   "Casual",
  exchange: "Exchange",
};


const DURATION_LABELS = {
  full_day: "Full Day",
  first_half: "First Half",
  second_half: "Second Half",
};

const STATUS_BADGE_MAP = {
  pending: "pending",
  approved: "active",
  rejected: "danger",
  cancelled: "inactive",
};

const LEAVE_TYPE_BADGE_MAP = {
  paid: "primary",
  unpaid: "secondary",
  exchange: "ongoing",
};

const MONTHS = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = [
  { value: "", label: "All Years" },
  { value: String(currentYear), label: String(currentYear) },
  { value: String(currentYear - 1), label: String(currentYear - 1) },
  { value: String(currentYear - 2), label: String(currentYear - 2) },
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
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
    getLeaveCalculation,
    reverseLeave
  } = useLeave();

  const { users, getAllUsers } = useUser();

  // ── Modal state ──
  const [viewTarget, setViewTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [confirmApprove, setConfirmApprove] = useState(null);

  // ── Action state ──
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // ── Logs state ──
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // ── Left panel filters ──
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // ── Right panel state (Multi-Year calculation) ──
  const currentYear = new Date().getFullYear();
  const [calculationData, setCalculationData] = useState([]);
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [calcEmployee, setCalcEmployee] = useState("");
  const [calcYears, setCalcYears] = useState([String(currentYear)]);
  const [calcMonth, setCalcMonth] = useState("");


const [downloading, setDownloading] = useState(false);
console.log("🚀 ~ Leaves ~ downloading:", downloading)


const [reverseTarget, setReverseTarget] = useState(null);
console.log("🚀 ~ Leaves ~ reverseTarget:", reverseTarget)
const [reverseReason, setReverseReason] = useState('');
const [reverseError, setReverseError]   = useState('');
console.log("🚀 ~ Leaves ~ reverseError:", reverseError)
const [reversing, setReversing]         = useState(false);
console.log("🚀 ~ Leaves ~ reversing:", reversing)




const handleDownloadExcel = async () => {
  try {
    setDownloading("excel");
    const params = new URLSearchParams();
    console.log("🚀 ~ handleDownloadExcel ~ calcEmployee:", calcEmployee)
    if (calcEmployee) params.set("user_id", calcEmployee);

    const response = await api.get(
      `${ENDPOINTS.EXPORT.LEAVES_EXCEL}?${params.toString()}`,
      { responseType: "blob" }
    );
    const url  = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href  = url;
    const empLabel = calcEmployee
      ? users.find((u) => u.id === calcEmployee)?.employee_id || "employee"
      : "all_employees";
    link.setAttribute("download", `${empLabel}_leaves.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Excel downloaded!");
  } catch (err) {
  console.log("🚀 ~ handleDownloadExcel ~ err:", err)
    toast.error("Failed to download Excel.");
  } finally {
    setDownloading(false);
  }
};

const handleDownloadPDF = async () => {
  try {
    setDownloading("pdf");
    const params = new URLSearchParams();
    if (calcEmployee) params.set("user_id", calcEmployee);

    const response = await api.get(
      `${ENDPOINTS.EXPORT.LEAVES_PDF}?${params.toString()}`,
      { responseType: "blob" }
    );
    const url  = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href  = url;
    const empLabel = calcEmployee
      ? users.find((u) => u.id === calcEmployee)?.employee_id || "employee"
      : "all_employees";
    link.setAttribute("download", `${empLabel}_leaves.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success("PDF downloaded!");
  } catch {
    toast.error("Failed to download PDF.");
  } finally {
    setDownloading(false);
  }
};

  const handleAddYear = (yr) => {
    if (!yr) return;
    setCalcYears((prev) => (prev.includes(String(yr)) ? prev : [...prev, String(yr)]));
  };

  const handleRemoveYear = (yr) => {
    setCalcYears((prev) => (prev.length > 1 ? prev.filter((y) => y !== String(yr)) : prev));
  };

  // ── Helpers ──
  const buildFilters = () => ({
    status: statusFilter,
    leave_type: typeFilter,
    month: monthFilter,
    year: yearFilter,
  });

  const SELECT_CLS =
    "bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] transition-all appearance-none cursor-pointer";

  // ── Effects ──
  useEffect(() => {
    getAllLeaves(page, limit, buildFilters());
  }, [page, statusFilter, typeFilter, monthFilter, yearFilter]);

  useEffect(() => {
    getAllUsers?.();
  }, []);

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!calcYears || calcYears.length === 0) return;
      try {
        setCalculationLoading(true);
        const results = await Promise.all(
          calcYears.map(async (yr) => {
            try {
              const response = await getLeaveCalculation({
                user_id: calcEmployee,
                year: yr,
                month: calcMonth,
              });
              const item = response.result?.[0] || {};
              return {
                year: yr,
                employees: item.employees || [],
                totals: item.totals || {},
                type: item.type || "yearly",
              };
            } catch (err) {
              return { year: yr, employees: [], totals: {}, type: "yearly" };
            }
          })
        );
        setCalculationData(results);
      } catch (error) {
        console.log(error);
      } finally {
        setCalculationLoading(false);
      }
    };
    fetchCalculation();
  }, [calcEmployee, calcYears, calcMonth]);

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
    const result = await approveLeave(confirmApprove.id);
    const sandwichMsg = result?.sandwich_days > 0
      ? ` (+ ${result.sandwich_days} sandwich day(s) charged)`
      : '';
    setAlert({ type: 'success', message: `Leave ${confirmApprove.display_id} approved.${sandwichMsg}` });
    if (viewTarget?.id === confirmApprove.id)
      setViewTarget((prev) => ({ ...prev, status: 'approved' }));
  } catch (err) {
    setAlert({ type: 'danger', message: err?.response?.data?.message || 'Failed to approve.' });
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
    if (!rejectionReason.trim()) { setRejectionError("Rejection reason is required."); return; }
    if (rejectionReason.trim().length < 5) { setRejectionError("Must be at least 5 characters."); return; }
    try {
      setRejecting(true);
     const rl =  await rejectLeave(rejectTarget.id, rejectionReason.trim());
      console.log("🚀 ~ handleReject ~ rl:", rl)
      setAlert({ type: "success", message: `Leave ${rejectTarget.display_id} rejected.` });
      if (viewTarget?.id === rejectTarget.id)
        setViewTarget((prev) => ({ ...prev, status: "rejected", rejection_reason: rejectionReason.trim() }));
      setRejectTarget(null);
      setRejectionReason("");
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Failed to reject." });
    } finally {
      setRejecting(false);
    }
  };

  // ── Pagination ──
  const Pagination = ({ compact = false }) => (
    <div className={`flex items-center justify-between px-4 py-4 ${!compact ? "border-t border-slate-100" : ""}`}>
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs disabled:opacity-50"
      >
        {compact ? "Prev" : "Previous"}
      </button>
      {compact ? (
        <span className="text-xs font-bold text-slate-500">{page} / {totalPages}</span>
      ) : (
        <div className="flex items-center gap-1.5">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                page === i + 1 ? "bg-[#132ea7] text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="space-y-5 animate-in fade-in duration-700">

      {/* ── Header ── */}
      
<div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
  <div>
    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1 uppercase">
      Leave <span className="text-[#132ea7]">Requests</span>
    </h2>
    <p className="text-slate-500 font-bold text-base">Total: {total}</p>
  </div>

  {/* ← ADD THIS */}
  <div className="flex items-center gap-2">
    <button
      onClick={handleDownloadExcel}
      disabled={downloading}
      className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-green-600/20"
    >
      <MdTableChart size={16} />
      {downloading ? "Downloading..." : "Excel"}
    </button>
    {/* <button
      onClick={handleDownloadPDF}
      disabled={downloading}
      className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
    >
      <MdPictureAsPdf size={16} />
      {downloading ? "Downloading..." : "PDF"}
    </button> */}
  </div>
</div>
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* ── TWO PANEL LAYOUT (Top Aligned) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ════════════════════════════════════
            LEFT PANEL — Leave Requests Table
        ════════════════════════════════════ */}
        <div className="lg:col-span-7 xl:col-span-6">

          {/* ── Desktop Table Card ── */}
          <div className="hidden md:block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/40">

            {/* Header inside Left Card (Filters on Left Side) */}
            <div className="p-3.5 px-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                All Requests
              </span>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
                  className={SELECT_CLS}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => { setPage(1); setTypeFilter(e.target.value); }}
                  className={SELECT_CLS}
                >
                  <option value="">All Types</option>
                  {/* <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option> */}
                    <option value="paid">Casual</option>
                  <option value="exchange">Exchange</option>
                </select>

                {(statusFilter || typeFilter || monthFilter || yearFilter) && (
                  <button
                    onClick={() => { setStatusFilter(""); setTypeFilter(""); setMonthFilter(""); setYearFilter(""); setPage(1); }}
                    className="px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80">
                    <th className="w-32 px-3.5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Requested On
                    </th>
                    <th className="w-44 px-3.5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Employee
                    </th>
                    <th className="w-28 px-3.5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Leave Type
                    </th>
                    <th className="w-28 px-3.5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="w-24 px-3.5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Spinner size="lg" />
                          <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading...</p>
                        </div>
                      </td>
                    </tr>
                  ) : leaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-400 py-12 font-medium italic uppercase tracking-widest text-sm">
                        No leave requests found.
                      </td>
                    </tr>
                  ) : (
                    leaves.filter(Boolean).map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors group">

                        {/* Requested On */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 text-xs">{formatDate(leave.created_at || leave.createdAt)}</div>
                          <div className="text-[10px] font-medium text-slate-400">
                            {formatDateTime(leave.created_at || leave.createdAt).split(" ")[1]}
                          </div>
                        </td>

                        {/* Employee */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-xs shrink-0">
                              {leave.employee?.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800 leading-tight">{leave.employee?.name || "—"}</div>
                              <div className="text-[10px] font-semibold text-slate-400 uppercase font-mono">{leave.employee?.employee_id || ""}</div>
                            </div>
                          </div>
                        </td>

                      {/* Leave Type cell */}
{/* <td className="px-4 py-3">
  <div className="flex flex-col gap-0.5 items-start">
    <Badge
      value={leave.reason_type === "emergency" ? "Emergency" : "Casual"}
      overrideColor={leave.reason_type === "emergency" ? "danger" : "primary"}
    />
    {leave.leave_type === "exchange" && (
      <Badge value="Exchange" overrideColor="ongoing" />
    )}
  </div>
</td> */}

<td className="px-4 py-3">
  <div className="flex flex-col gap-0.5 items-start">
    <Badge
      value={leave.reason_type === "emergency" ? "Emergency" : "Casual"}
      overrideColor={leave.reason_type === "emergency" ? "danger" : "primary"}
    />
    {leave.leave_type === "exchange" && (
      <Badge value="Exchange" overrideColor="ongoing" />
    )}
    {/* {leave.leave_type !== "exchange" && leave.status === "approved" && (
      <Badge
        value={leave.leave_type === "unpaid" ? "Unpaid" : "Paid"}
        overrideColor={leave.leave_type === "unpaid" ? "secondary" : "primary"}
      />
    )} */}
  </div>
</td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge value={leave.status} overrideColor={STATUS_BADGE_MAP[leave.status]} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewTarget(leave)}
                              title="View"
                              className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all"
                            >
                              <MdVisibility size={16} />
                            </button>

                            {leave.status === 'approved' && (
  <button
    onClick={() => { setReverseTarget(leave); setReverseReason(''); setReverseError(''); }}
    title="Reverse Approval"
    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-all"
  >
    <MdUndo size={16} />
  </button>
)}

                            {leave.status === "pending" && (
                              <>
                                <button
                                  onClick={() => setConfirmApprove(leave)}
                                  title="Approve"
                                  className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-600 transition-all"
                                >
                                  <MdCheck size={16} />
                                </button>
                                <button
                                  onClick={() => openReject(leave)}
                                  title="Reject"
                                  className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                >
                                  <MdClose size={16} />
                                </button>
                              </>
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

          {/* ── Mobile Cards ── */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : leaves.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold text-sm">No leave requests found.</div>
            ) : (
              leaves.filter(Boolean).map((leave) => (
                <div key={leave.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-xs">
                        {leave.employee?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm leading-tight">{leave.employee?.name || "—"}</p>
                        <p className="text-[10px] font-black text-slate-400 font-mono mt-0.5">{leave.display_id}</p>
                      </div>
                    </div>
                    <Badge value={leave.status} overrideColor={STATUS_BADGE_MAP[leave.status]} />
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {[
                      
{
  label: "Leave Type",
  value: leave.leave_type === "exchange"
    ? "Exchange"
    : leave.status === "approved"
      ? (leave.leave_type === "paid" ? "Paid" : "Unpaid")
      : "—"
},
                      { label: "Duration", value: DURATION_LABELS[leave.duration] },
                      { label: "From", value: formatDate(leave.start_date) },
                      { label: "To", value: formatDate(leave.end_date) },
                      { label: "Requested", value: formatDate(leave.created_at || leave.createdAt) },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">{item.label}</span>
                        <span className="font-bold text-slate-700 text-xs">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button onClick={() => setViewTarget(leave)} className="flex-1 h-9 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all">
                      <MdVisibility size={14} /> View
                    </button>
                    {leave.status === "pending" && (
                      <>
                        <button onClick={() => setConfirmApprove(leave)} className="flex-1 h-9 rounded-xl bg-green-50 text-green-600 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-green-100 transition-all">
                          <MdCheck size={14} /> Approve
                        </button>
                        <button onClick={() => openReject(leave)} className="flex-1 h-9 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-red-100 transition-all">
                          <MdClose size={14} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            {totalPages > 1 && <Pagination compact />}
          </div>

        </div>
        {/* END LEFT PANEL */}

        {/* ════════════════════════════════════
            RIGHT PANEL — Leave Calculation
        ════════════════════════════════════ */}
        <div className="lg:col-span-5 xl:col-span-6">
          <LeaveCalculation
            users={users}
            months={MONTHS}
            years={YEARS}
            calculationData={calculationData}
            loading={calculationLoading}
            employee={calcEmployee}
            selectedYears={calcYears}
            month={calcMonth}
            onEmployeeChange={setCalcEmployee}
            onAddYear={handleAddYear}
            onRemoveYear={handleRemoveYear}
            onMonthChange={setCalcMonth}
          />
        </div>
        {/* END RIGHT PANEL */}

      </div>
      {/* END TWO PANEL LAYOUT */}


      {/* ══════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════ */}

      {/* ── View / Detail Modal ── */}
      <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Leave Details" size="lg">
        {viewTarget && (
          <div className="space-y-6 py-2">
            <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center shrink-0 shadow-xl shadow-[#132ea7]/20">
                <MdBeachAccess size={26} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-black text-slate-800">
  {viewTarget.reason_type === "emergency" ? "Emergency" : "Casual"} Leave
</h3>
                  <Badge value={viewTarget.status} overrideColor={STATUS_BADGE_MAP[viewTarget.status]} />
                  {viewTarget.reason_type === "emergency" && <Badge value="Emergency" overrideColor="danger" />}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">{viewTarget.display_id || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
              <div className="w-12 h-12 rounded-full bg-[#132ea7]/10 flex items-center justify-center text-[#132ea7] font-black text-lg">
                {viewTarget.employee?.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-black text-slate-800">{viewTarget.employee?.name || "—"}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{viewTarget.employee?.employee_id || ""}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Reason Type", value: viewTarget.reason_type === "emergency" ? "Emergency" : "Casual" },
{ label: "Leave Type",  value: viewTarget.leave_type === "exchange" ? "Exchange" : "System Assigned (Paid / Unpaid)" },
                { label: "Duration", value: DURATION_LABELS[viewTarget.duration] },
                { label: "From", value: formatDate(viewTarget.start_date) },
                { label: "To", value: formatDate(viewTarget.end_date) },
                { label: "Requested", value: formatDate(viewTarget.created_at || viewTarget.createdAt) },
                { label: "Approved By", value: viewTarget.approver?.name || "—" },
                { label: "Approved At", value: viewTarget.approved_at ? formatDate(viewTarget.approved_at) : "—" },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="font-black text-slate-700 text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Reason</p>
              <p className="font-medium leading-relaxed opacity-90">{viewTarget.reason}</p>
            </div>


  {viewTarget?.reason_type === "emergency" && (
  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
    <div>
      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
        Emergency Type
      </p>
      <p className="font-black text-red-600 text-sm capitalize">
        {viewTarget.emergency_sub_type === "medical" ? "Medical" : "Other"}
      </p>
    </div>

    {(() => {
      const docUrl = typeof viewTarget.medical_document === "string"
        ? viewTarget.medical_document
        : viewTarget.medical_document?.url || null;

      const baseUrl = import.meta.env.VITE_API_URL?.replace("/api/", "").replace("/api", "");

      return docUrl ? (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
              Medical Document
            </p>
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
              ✓ Submitted
            </p>
          </div>
          
          <a
            href={`${baseUrl}${docUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-black text-[#132ea7] hover:underline flex items-center gap-1.5"
          >
            View Document
          </a>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
            ⚠️ Document not yet uploaded by employee
          </p>
        </div>
      );
    })()}
  </div>
)}

            {viewTarget.status === "rejected" && viewTarget.rejection_reason && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Rejection Reason</p>
                <p className="font-bold text-red-600 text-sm">{viewTarget.rejection_reason}</p>
              </div>
            )}

            {viewTarget.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1 h-12 font-black uppercase tracking-widest text-sm border border-red-200 text-red-500 hover:bg-red-50"
                  onClick={() => { openReject(viewTarget); setViewTarget(null); }}>
                  <MdClose size={18} className="mr-1" /> Reject
                </Button>
                <Button variant="primary" className="flex-[2] h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 font-black uppercase tracking-widest text-sm"
                  onClick={() => { setConfirmApprove(viewTarget); setViewTarget(null); }}>
                  <MdCheck size={18} className="mr-1" /> Approve
                </Button>
              </div>
            )}


            {viewTarget.status === 'approved' && (
  <div className="flex gap-3 pt-2">
    <Button
      variant="ghost"
      className="flex-1 h-12 font-black uppercase tracking-widest text-sm border border-orange-200 text-orange-500 hover:bg-orange-50"
      onClick={() => { setReverseTarget(viewTarget); setReverseReason(''); setReverseError(''); setViewTarget(null); }}
    >
      <MdUndo size={18} className="mr-1" /> Reverse Approval
    </Button>
  </div>
)}

            {/* Activity Logs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MdTimeline size={16} className="text-slate-400" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</p>
              </div>
              {logsLoading ? (
                <p className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest text-center py-4">Loading...</p>
              ) : logs.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 text-center py-3">No activity yet.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-100" />
                  <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-4 relative">
                        <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 z-10 ring-2 ring-white ${
                          log.action === "approved" ? "bg-green-500" :
                          log.action === "rejected" ? "bg-red-500" :
                          log.action === "cancelled" ? "bg-slate-400" : "bg-[#132ea7]"
                        }`} />
                        <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <p className="text-xs font-black text-slate-700 capitalize">{log.action}</p>
                            <p className="text-[10px] font-bold text-slate-400">{formatDateTime(log.created_at)}</p>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">By {log.user?.name || "—"}</p>
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
              <Button variant="ghost" onClick={() => setViewTarget(null)} className="font-black uppercase tracking-widest text-xs">Close</Button>
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
              onChange={(e) => { setRejectionReason(e.target.value); if (rejectionError) setRejectionError(""); }}
              placeholder="Explain why this leave is being rejected..."
              rows={4}
              required
            />
            {rejectionError && (
              <p className="text-red-500 text-[10px] font-bold uppercase ml-1 -mt-3">{rejectionError}</p>
            )}
            <div className="flex gap-4 pt-2 border-t border-slate-50">
              <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={() => setRejectTarget(null)} disabled={rejecting}>
                Cancel
              </Button>
              <Button className="flex-[2] h-14 bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20 font-black uppercase tracking-[0.2em] text-sm rounded-2xl" onClick={handleReject} loading={rejecting}>
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