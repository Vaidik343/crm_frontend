// src/pages/admin/AdminInterns.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntern } from "../../../../../context/InternContext";
import {
  MdSearch, MdPerson, MdFilterList,
} from "react-icons/md";
import { formatDate } from "../../../../../utils/formatDate";

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "All Statuses",  value: ""          },
  { label: "Pending",       value: "pending"   },
  { label: "Approved",      value: "approved"  },
  { label: "Active",        value: "active"    },
  { label: "Rejected",      value: "rejected"  },
  { label: "Completed",     value: "completed" },
];

const TYPE_OPTIONS = [
  { label: "All Types", value: ""         },
  { label: "Intern",    value: "intern"   },
  { label: "Trainee",   value: "trainee"  },
];

const statusColors = {
  pending:   "bg-amber-100 text-amber-700",
  approved:  "bg-blue-100 text-blue-700",
  active:    "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-700",
  completed: "bg-slate-100 text-slate-500",
};

// ── Component ──────────────────────────────────────────────────────────────────

const AdminInterns = () => {
  const navigate = useNavigate();
  const {
    interns, internsLoading, internsPage, internsLimit,
    internsTotal, internsTotalPages, setInternsPage,
    getAllInterns,
  } = useIntern();

  // ── Filters ────────────────────────────────────────────────────────────────
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("");
  const [typeFilter, setType]         = useState("");

  // ── Two-effect pagination pattern ─────────────────────────────────────────
  // Effect 1 — filters change → reset to page 1
  useEffect(() => {
    setInternsPage(1);
  }, [search, statusFilter, typeFilter]);

  // Effect 2 — page or filters → fetch
  useEffect(() => {
    getAllInterns(internsPage, search, statusFilter, typeFilter);
  }, [internsPage, search, statusFilter, typeFilter]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Interns
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            {internsTotal} intern{internsTotal !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* Search */}
          <div className="relative">
            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, enrollment..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

        </div>
      </div>

      {/* ── List ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        {internsLoading ? (
          <div className="p-12 flex items-center justify-center">
            <p className="text-sm text-slate-400 font-medium">Loading...</p>
          </div>
        ) : interns.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
            <MdPerson size={32} className="text-slate-200" />
            <p className="text-sm text-slate-400 font-semibold">No interns found.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      "Name", "Email", "Type",
                      "Enrollment No.", "College",
                      "Mentor", "Status", "Applied On", "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interns.map((intern) => (
                    <tr
                      key={intern.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition"
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#132ea7] flex items-center justify-center text-white font-black text-xs shrink-0">
                            {intern.name?.charAt(0) || "I"}
                          </div>
                          <div>
                            <p className="font-black text-slate-700">{intern.name}</p>
                            {intern.display_id && (
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {intern.display_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {intern.email}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                          {intern.intern_type}
                        </span>
                      </td>

                      {/* Enrollment */}
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {intern.enrollment_no}
                      </td>

                      {/* College */}
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 max-w-[140px] truncate">
                        {intern.college_name || "—"}
                      </td>

                      {/* Mentor */}
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {intern.mentor?.name || (
                          <span className="text-slate-300 italic">Not assigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${statusColors[intern.status] || "bg-slate-100 text-slate-500"}`}>
                          {intern.status}
                        </span>
                      </td>

                      {/* Applied on */}
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {intern.createdAt ? formatDate(intern.createdAt) : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/admin/interns/${intern.id}`)}
                          className="text-xs font-black text-[#132ea7] hover:underline uppercase tracking-widest whitespace-nowrap"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {interns.map((intern) => (
                <div key={intern.id} className="p-4 flex flex-col gap-3">

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#132ea7] flex items-center justify-center text-white font-black shrink-0">
                        {intern.name?.charAt(0) || "I"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-700 truncate">{intern.name}</p>
                        <p className="text-xs text-slate-400 font-semibold truncate">{intern.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${statusColors[intern.status] || "bg-slate-100 text-slate-500"}`}>
                      {intern.status}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold flex-wrap">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                      {intern.intern_type}
                    </span>
                    <span>{intern.enrollment_no}</span>
                    {intern.college_name && <span>🏫 {intern.college_name}</span>}
                    {intern.mentor?.name && <span>👤 {intern.mentor.name}</span>}
                    {intern.createdAt && <span>📅 {formatDate(intern.createdAt)}</span>}
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => navigate(`/admin/interns/${intern.id}`)}
                    className="self-start text-xs font-black text-[#132ea7] hover:underline uppercase tracking-widest"
                  >
                    View Details →
                  </button>

                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {internsTotalPages > 1 && (
          <div className="px-4 py-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-semibold text-slate-400">
              Page {internsPage} of {internsTotalPages} — {internsTotal} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setInternsPage((p) => Math.max(1, p - 1))}
                disabled={internsPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Prev
              </button>
              <button
                onClick={() => setInternsPage((p) => Math.min(internsTotalPages, p + 1))}
                disabled={internsPage === internsTotalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminInterns;