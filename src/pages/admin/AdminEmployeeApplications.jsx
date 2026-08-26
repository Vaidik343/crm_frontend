// src/features/employeeApplications/pages/AdminEmployeeApplications.jsx

import { useState, useEffect, useCallback } from "react";
import { useEmployeeApplication } from "../../context/EmployeeApplicationContext";
import toast from "react-hot-toast";
import {
  MdPerson, MdEmail, MdPhone, MdLocationOn, MdAccountBalance,
  MdDescription, MdCheck, MdClose, MdArrowBack, MdSearch,
  MdRefresh, MdVisibility, MdDelete,
} from "react-icons/md";


import GenerateOfferLetter from '../../components/OfferLetter/GenerateOfferLetter';


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

// ── Refactored DetailView ─────────────────────────────────────────────────────

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
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#132ea7] transition-colors w-fit px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <MdArrowBack size={18} /> Back to Applications
        </button>

        <div className="flex items-center gap-3">
          <StatusBadge status={application.status} />

          {application.status === "pending" && (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={acting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-xs uppercase tracking-wider hover:bg-red-50 transition disabled:opacity-50"
              >
                <MdClose size={16} /> Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={acting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition disabled:opacity-50"
              >
                <MdCheck size={16} /> {acting ? "Processing..." : "Approve"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#132ea7] to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-100 shrink-0">
            {application.first_name?.[0]}{application.last_name?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-800">
                {application.first_name} {application.last_name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono font-bold">
                {application.display_id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Applied on {new Date(application.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Rejection Banner if applicable */}
      {application.status === "rejected" && application.rejection_reason && (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <div className="p-2 bg-red-100 text-red-600 rounded-xl">
            <MdClose size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">Rejection Reason</p>
            <p className="text-sm text-red-800 mt-0.5 font-medium">{application.rejection_reason}</p>
          </div>
        </div>
      )}

      {/* Grid Details (Personal & Bank) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2">
            <MdPerson className="text-[#132ea7]" size={18} />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Personal Information</h3>
          </div>
          <div className="p-6 divide-y divide-slate-100 flex-1">
            {[
              ["Email", application.email, <MdEmail className="text-slate-400" />],
              ["Phone", application.phone, <MdPhone className="text-slate-400" />],
              ["Gender", fmt(application.gender), null],
              ["Address", application.address, <MdLocationOn className="text-slate-400" />],
            ].map(([label, val, icon]) => (
              <div key={label} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-2 shrink-0">
                  {icon} {label}
                </span>
                <span className="text-xs font-bold text-slate-700 text-right break-all">{val || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2">
            <MdAccountBalance className="text-[#132ea7]" size={18} />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Bank Account Details</h3>
          </div>
          <div className="p-6 divide-y divide-slate-100 flex-1">
            {[
              ["Account Holder", application.account_holder_name],
              ["Bank Name", application.bank_name],
              ["Account No.", application.account_number],
              ["IFSC Code", application.ifsc_code],
            ].map(([label, val]) => (
              <div key={label} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-400 shrink-0">{label}</span>
                <span className="text-xs font-bold text-slate-700 text-right font-mono break-all">{val || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submitted Documents Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
          <MdDescription className="text-[#132ea7]" size={18} />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Uploaded Verification Documents</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => {
            const baseUrl = import.meta.env.VITE_API_URL
              ?.replace("/api/", "")
              .replace("/api", "");

            const filePath = doc.file_path || "";
            const docUrl = filePath.startsWith("/uploads/")
              ? `${baseUrl}${filePath}`
              : `${baseUrl}/uploads/employee-applications/${filePath.split("employee-applications")[1] || ""}`;

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:border-[#132ea7]/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center shrink-0 group-hover:bg-[#132ea7] group-hover:text-white transition-colors">
                    <MdDescription size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      {doc.document_subtype && (
                        <span className="font-semibold text-slate-500">
                          {SUBTYPE_LABELS[doc.document_subtype] || doc.document_subtype}
                        </span>
                      )}
                      {doc.document_subtype && <span>•</span>}
                      <span className="truncate max-w-[140px]">{doc.original_name}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-black uppercase tracking-wider text-[#132ea7] hover:bg-[#132ea7] hover:text-white hover:border-[#132ea7] transition-all shadow-sm shrink-0"
                >
                  <MdVisibility size={14} /> View
                </a>
              </div>
            );
          })}
        </div>
      </div>
{application.status === 'approved' && (
  <GenerateOfferLetter application={application} />
)}
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100">
            <h3 className="font-black text-slate-800 text-lg mb-1">Reject Application</h3>
            <p className="text-xs text-slate-500 mb-4">Provide a reason so the applicant understands why their request was declined.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="e.g. Bank proof document is unreadable or blurry..."
              className="w-full border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={acting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition shadow-sm disabled:opacity-50"
              >
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
