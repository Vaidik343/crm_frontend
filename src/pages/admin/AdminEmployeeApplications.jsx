// src/features/employeeApplications/pages/AdminEmployeeApplications.jsx

import { useState, useEffect, useCallback } from "react";
import { useEmployeeApplication } from "../../context/EmployeeApplicationContext";
import toast from "react-hot-toast";
import {
  MdPerson, MdEmail, MdPhone, MdLocationOn, MdAccountBalance,
  MdDescription, MdCheck, MdClose, MdArrowBack, MdSearch,
  MdRefresh, MdVisibility, MdDelete,
} from "react-icons/md";

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_META = {
  pending:  { label: "Pending",  cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

const DOC_TYPE_LABELS = {
  photo_id:                 "Photo ID",
  address_id:               "Address ID",
  educational_certificate:  "Educational Certificate",
  bank_document:            "Bank Document",
};

const SUBTYPE_LABELS = {
  aadhaar:          "Aadhaar Card",
  voter_card:       "Voter Card",
  passport:         "Passport",
  driving_licence:  "Driving Licence",
  light_bill:       "Electricity Bill",
  gas_bill:         "Gas Bill",
};

const fmt = (val) =>
  val ? val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, " ") : "—";

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest ${meta.cls}`}>
      {meta.label}
    </span>
  );
};

// ── Detail view ───────────────────────────────────────────────────────────────

const DetailView = ({ application, onBack, onApprove, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [acting, setActing] = useState(false);

  const handleApprove = async () => {
    setActing(true);
    await onApprove(application.id);
    setActing(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return toast.error("Rejection reason is required.");
    setActing(true);
    await onReject(application.id, rejectionReason);
    setActing(false);
    setShowRejectModal(false);
  };

  const docs = application.documents || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[#132ea7] transition">
          <MdArrowBack size={16} /> Back
        </button>
        <div className="flex-1" />
        <StatusBadge status={application.status} />
      </div>

      {/* Name + display ID */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#132ea7]/10 flex items-center justify-center shrink-0">
          <MdPerson className="text-[#132ea7] text-2xl" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">
            {application.first_name} {application.last_name}
          </h2>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{application.display_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal Info */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <MdPerson className="text-slate-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Personal Info</p>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              ["Email",   application.email,   <MdEmail className="text-slate-400 text-sm" />],
              ["Phone",   application.phone,   <MdPhone className="text-slate-400 text-sm" />],
              ["Gender",  fmt(application.gender), null],
              ["Address", application.address, <MdLocationOn className="text-slate-400 text-sm" />],
              ["Applied", new Date(application.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), null],
            ].map(([label, val]) => (
              <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 px-5 py-3">
                <span className="text-[10px] font-bold text-slate-400 shrink-0 w-20">{label}</span>
                <span className="text-xs font-semibold text-slate-700 break-all">{val || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <MdAccountBalance className="text-slate-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bank Details</p>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              ["Account Holder", application.account_holder_name],
              ["Bank Name",      application.bank_name],
              ["Account No.",    application.account_number],
              ["IFSC Code",      application.ifsc_code],
            ].map(([label, val]) => (
              <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 px-5 py-3">
                <span className="text-[10px] font-bold text-slate-400 shrink-0 w-28">{label}</span>
                <span className="text-xs font-semibold text-slate-700 break-all">{val || "—"}</span>
              </div>
            ))}
          </div>
        </div> 

        {/* Documents */}
        {docs.map((doc) => {
  const baseUrl = import.meta.env.VITE_API_URL
    ?.replace("/api/", "")
    .replace("/api", "");

  const filePath = doc.file_path || "";

  const docUrl = filePath.startsWith("/uploads/")
    ? `${baseUrl}${filePath}`
    : `${baseUrl}/uploads/employee-applications/${filePath.split("employee-applications")[1] || ""}`;

  return (
    <div key={doc.id} className="flex items-center gap-3 px-5 py-4">
      <div className="w-9 h-9 rounded-xl bg-[#132ea7]/10 flex items-center justify-center shrink-0">
        <MdDescription className="text-[#132ea7]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-slate-700">
          {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
        </p>

        {doc.document_subtype && (
          <p className="text-[10px] text-slate-400 mt-0.5">
            {SUBTYPE_LABELS[doc.document_subtype] || doc.document_subtype}
          </p>
        )}

        <p className="text-[10px] text-slate-400 truncate">
          {doc.original_name}
        </p>
      </div>

      <a
        href={docUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] font-black uppercase tracking-widest text-[#132ea7] hover:underline shrink-0"
      >
        View
      </a>
    </div>
  );
})}

        {/* Rejection reason if rejected */}
        {application.status === "rejected" && application.rejection_reason && (
          <div className="lg:col-span-2 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Rejection Reason</p>
            <p className="text-sm text-red-700 font-medium">{application.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {application.status === "pending" && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={acting}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition disabled:opacity-50"
          >
            <MdClose size={16} /> Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={acting}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition disabled:opacity-50"
          >
            <MdCheck size={16} /> {acting ? "Processing..." : "Approve"}
          </button>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-black text-slate-800 mb-1">Reject Application</h3>
            <p className="text-xs text-slate-400 mb-4">Provide a reason so the applicant understands the decision.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Documents are incomplete or unclear..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#132ea7] resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleReject} disabled={acting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50">
                {acting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main list component ───────────────────────────────────────────────────────

const AdminEmployeeApplications = () => {
  const {
    getAllApplications,
    getApplicationById,
    approveApplication,
    rejectApplication,
    deleteApplication,
  } = useEmployeeApplication();

  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [selectedApp, setSelectedApp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Effect 1 — reset page on filter change ──
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // ── Effect 2 — fetch ──
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllApplications({ search, status: statusFilter, page, limit: 10 });
      setApplications(data.applications || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleView = async (id) => {
    setDetailLoading(true);
    try {
      const data = await getApplicationById(id);
      setSelectedApp(data.application);
    } catch {
      toast.error("Failed to load application details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveApplication(id);
      toast.success("Application approved.");
      setSelectedApp((prev) => prev ? { ...prev, status: "approved" } : prev);
      fetchApplications();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve.");
    }
  };

  const handleReject = async (id, rejection_reason) => {
    try {
      await rejectApplication(id, rejection_reason);
      toast.success("Application rejected.");
      setSelectedApp((prev) => prev ? { ...prev, status: "rejected", rejection_reason } : prev);
      fetchApplications();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    try {
      await deleteApplication(id);
      toast.success("Application deleted.");
      if (selectedApp?.id === id) setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  // ── Detail view ──
  if (selectedApp) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <DetailView
          application={selectedApp}
          onBack={() => setSelectedApp(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-black uppercase tracking-widest text-slate-800">Employee Applications</h1>
          <p className="text-xs text-slate-400 mt-0.5">{total} total application{total !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={fetchApplications}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition">
          <MdRefresh size={15} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email or EP ID..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#132ea7]"
            />
          </div>
          <button type="submit"
            className="px-4 py-2.5 bg-[#132ea7] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition">
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#132ea7] bg-white"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Desktop table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">No applications found.</div>
      ) : (
        <>
          <div className="hidden md:block bg-white border border-slate-100 rounded-2xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["EP ID", "Name", "Email", "Phone", "Gender", "Applied", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-black text-xs text-[#132ea7]">{app.display_id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{app.first_name} {app.last_name}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{app.email}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{app.phone}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs capitalize">{app.gender}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleView(app.id)}
                          className="p-1.5 rounded-lg hover:bg-[#132ea7]/10 text-[#132ea7] transition" title="View">
                          <MdVisibility size={16} />
                        </button>
                        <button onClick={() => handleDelete(app.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition" title="Delete">
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3 mb-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-black text-slate-800">{app.first_name} {app.last_name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#132ea7]">{app.display_id}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <p className="text-xs text-slate-500 mb-1">{app.email}</p>
                <p className="text-xs text-slate-500 mb-3">{app.phone} · {fmt(app.gender)}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleView(app.id)}
                    className="flex-1 py-2 rounded-xl bg-[#132ea7]/10 text-[#132ea7] font-black text-[11px] uppercase tracking-widest hover:bg-[#132ea7]/20 transition">
                    View Details
                  </button>
                  <button onClick={() => handleDelete(app.id)}
                    className="py-2 px-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition">
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition">
                  Prev
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminEmployeeApplications;
