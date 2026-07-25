// src/features/interns/pages/intern/InternProfile.jsx

import { useEffect, useState } from "react";
import { useIntern } from "../../context/InternContext";
import toast from "react-hot-toast";
import {
  MdPerson, MdEdit, MdClose, MdSchool,
  MdPhone, MdEmail, MdBadge, MdCalendarToday,
  MdUploadFile, MdLink,
} from "react-icons/md";
import { formatDate } from "../../../../utils/formatDate";
import api from "../../../../api/axiosInstance";
import { ENDPOINTS } from "../../../../api/endpoints";

// ── Constants ──────────────────────────────────────────────────────────────────

const DEGREE_OPTIONS = [
  { label: "Bachelor", value: "bachelor" },
  { label: "Master",   value: "master"   },
];

const INTERN_TYPE_OPTIONS = [
  { label: "Intern",   value: "intern"   },
  { label: "Trainee",  value: "trainee"  },
];

const REFERENCE_TYPE_OPTIONS = [
  { label: "Employee",     value: "employee"     },
  { label: "Intern",       value: "intern"       },
  { label: "College",      value: "college"      },
  { label: "Friend",       value: "friend"       },
  { label: "Social Media", value: "social_media" },
  { label: "Website",      value: "website"      },
  { label: "Other",        value: "other"        },
];

const DOCUMENT_TYPE_OPTIONS = [
  { label: "Aadhaar Card",    value: "aadhaar"          },
  { label: "Voter Card",      value: "voter_card"        },
  { label: "Passport",        value: "passport"          },
  { label: "Driving Licence", value: "driving_licence"   },
];

// ── Mentor chips ───────────────────────────────────────────────────────────────

const MentorChips = ({ mentors }) => {
  if (!mentors || mentors.length === 0) {
    return <p className="text-sm text-slate-400 font-medium italic">Not assigned yet.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {mentors.map((m) => (
        <div key={m.id} className="flex items-center gap-2 bg-[#132ea7]/10 px-3 py-1.5 rounded-full">
          <div className="w-5 h-5 rounded-full bg-[#132ea7] flex items-center justify-center text-white font-black text-[10px] shrink-0">
            {m.name?.charAt(0)}
          </div>
          <span className="text-xs font-black text-[#132ea7]">{m.name}</span>
          <span className="text-[10px] text-slate-400 font-semibold">{m.employee_id}</span>
        </div>
      ))}
    </div>
  );
};

// ── Component ──────────────────────────────────────────────────────────────────

const InternProfile = () => {
  const { profile, profileLoading, getMyProfile, updateMyProfile } = useIntern();

  // ── Profile edit modal ─────────────────────────────────────────────────────
  const [showEdit, setShowEdit]         = useState(false);
  const [form, setForm]                 = useState({});
  const [errors, setErrors]             = useState({});
  const [submitting, setSubmitting]     = useState(false);

  // ── Document edit modal ────────────────────────────────────────────────────
  const [showDocEdit, setShowDocEdit]   = useState(false);
  const [docForm, setDocForm]           = useState({
    document_type:      "",
    college_name:       "",
    college_address:    "",
    branch:             "",
    current_year:       "",
    id_proof:           null,
    photo:              null,
    resume:             null,
    last_sem_marksheet: null,
  });
  const [docSubmitting, setDocSubmitting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    getMyProfile();
  }, []);

  // ── Populate profile edit form ─────────────────────────────────────────────
  useEffect(() => {
    if (showEdit && profile) {
      const doc = profile.documents?.[0];
      setForm({
        name:              profile.name              || "",
        email:             profile.email             || "",
        mobile:            profile.mobile            || "",
        college_name:      profile.college_name      || "",
        enrollment_no:     profile.enrollment_no     || "",
        degree_type:       profile.degree_type       || "",
        intern_type:       profile.intern_type       || "",
        reference_type:    profile.reference_type    || "",
        reference_name:    profile.reference_name    || "",
        reference_contact: profile.reference_contact || "",
        // college detail from document
        college_address:   doc?.college_detail?.college_address || "",
        branch:            doc?.college_detail?.branch          || "",
        current_year:      doc?.college_detail?.current_year    || "",
      });
      setErrors({});
    }
  }, [showEdit, profile]);

  // ── Populate document edit form ────────────────────────────────────────────
  useEffect(() => {
    if (showDocEdit && profile) {
      const doc = profile.documents?.[0];
      setDocForm({
        document_type:      doc?.document_type      || "",
        college_name:       doc?.college_detail?.college_name    || "",
        college_address:    doc?.college_detail?.college_address || "",
        branch:             doc?.college_detail?.branch          || "",
        current_year:       doc?.college_detail?.current_year    || "",
        id_proof:           null,
        photo:              null,
        resume:             null,
        last_sem_marksheet: null,
      });
    }
  }, [showDocEdit, profile]);

  // ── Profile edit handlers ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name         = "Name is required.";
    if (!form.email.trim())        e.email        = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                   e.email        = "Enter a valid email.";
    if (!form.mobile.trim())       e.mobile       = "Mobile is required.";
    else if (!/^\d{10}$/.test(form.mobile))
                                   e.mobile       = "Enter a valid 10-digit mobile.";
    if (!form.college_name.trim()) e.college_name = "College name is required.";
    if (!form.enrollment_no.trim()) e.enrollment_no = "Enrollment number is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);

      // profile fields
      await updateMyProfile({
        name:              form.name.trim(),
        email:             form.email.trim(),
        mobile:            form.mobile.trim(),
        college_name:      form.college_name.trim(),
        enrollment_no:     form.enrollment_no.trim(),
        degree_type:       form.degree_type       || undefined,
        intern_type:       form.intern_type       || undefined,
        reference_type:    form.reference_type    || undefined,
        reference_name:    form.reference_name.trim()    || undefined,
        reference_contact: form.reference_contact.trim() || undefined,
      });

      // also update college_detail in document via PATCH /intern/documents
      if (form.college_address || form.branch || form.current_year) {
        const college_detail = JSON.stringify({
          college_name:    form.college_name.trim(),
          college_address: form.college_address.trim(),
          branch:          form.branch.trim(),
          current_year:    form.current_year.trim(),
        });
        const fd = new FormData();
        fd.append("college_detail", college_detail);
        await api.patch(ENDPOINTS.INTERNS.UPDATE_MY_DOCUMENTS, fd);
      }

      toast.success("Profile updated successfully!");
      setShowEdit(false);
      getMyProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Document edit handlers ─────────────────────────────────────────────────
  const handleDocChange = (e) => {
    const { name, value } = e.target;
    setDocForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocFileChange = (e) => {
    const { name, files } = e.target;
    setDocForm((prev) => ({ ...prev, [name]: files[0] || null }));
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    try {
      setDocSubmitting(true);

      const fd = new FormData();

      if (docForm.document_type) fd.append("document_type", docForm.document_type);
      if (docForm.id_proof)           fd.append("id_proof",           docForm.id_proof);
      if (docForm.photo)              fd.append("photo",              docForm.photo);
      if (docForm.resume)             fd.append("resume",             docForm.resume);
      if (docForm.last_sem_marksheet) fd.append("last_sem_marksheet", docForm.last_sem_marksheet);

      // college_detail
      const college_detail = JSON.stringify({
        college_name:    docForm.college_name.trim(),
        college_address: docForm.college_address.trim(),
        branch:          docForm.branch.trim(),
        current_year:    docForm.current_year.trim(),
      });
      fd.append("college_detail", college_detail);

      await api.patch(ENDPOINTS.INTERNS.UPDATE_MY_DOCUMENTS, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Documents updated successfully!");
      setShowDocEdit(false);
      getMyProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update documents.");
    } finally {
      setDocSubmitting(false);
    }
  };

  // ── Shared classes ─────────────────────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30 ${
      err ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
    }`;
  const labelCls  = "block text-xs font-black uppercase tracking-widest text-slate-500 mb-1";
  const errCls    = "text-xs text-red-500 font-semibold mt-1";
  const cardCls   = "bg-white rounded-2xl shadow-sm border border-slate-100 p-6";
  const fieldLbl  = "text-[10px] font-black uppercase tracking-widest text-slate-400";
  const fieldVal  = "text-sm font-semibold text-slate-700 mt-0.5";

  const doc = profile?.documents?.[0];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-400 font-medium mt-0.5">View and update your information</p>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-sm font-black uppercase tracking-widest hover:bg-[#0f2490] transition"
        >
          <MdEdit size={16} /> Edit Profile
        </button>
      </div>

      {profileLoading ? (
        <div className={`${cardCls} flex items-center justify-center h-48`}>
          <p className="text-sm text-slate-400 font-medium">Loading...</p>
        </div>
      ) : !profile ? (
        <div className={`${cardCls} flex items-center justify-center h-48`}>
          <p className="text-sm text-slate-400 font-medium">No profile data found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* ── Identity card ─────────────────────────────────────────────── */}
          <div className={cardCls}>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#132ea7] flex items-center justify-center text-white font-black text-2xl shrink-0">
                {profile.name?.charAt(0) || "I"}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{profile.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#132ea7] px-2.5 py-0.5 rounded-full">
                    {profile.intern_type}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {profile.display_id || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {[
                ["Email",          profile.email          || "—"],
                ["Mobile",         profile.mobile         || "—"],
                ["Enrollment No.", profile.enrollment_no  || "—"],
                ["Degree Type",    profile.degree_type ? profile.degree_type.charAt(0).toUpperCase() + profile.degree_type.slice(1) : "—"],
                ["Start Date",     profile.start_date ? formatDate(profile.start_date) : "—"],
                ["End Date",       profile.end_date   ? formatDate(profile.end_date)   : "—"],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className={fieldLbl}>{label}</p>
                  <p className={fieldVal}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Mentors card ───────────────────────────────────────────────── */}
          <div className={cardCls}>
            <div className="flex items-center gap-2 mb-4">
              <MdPerson size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Mentors</p>
            </div>
            <MentorChips mentors={profile.mentors} />
          </div>

          {/* ── College card ───────────────────────────────────────────────── */}
          <div className={cardCls}>
            <div className="flex items-center gap-2 mb-5">
              <MdSchool size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">College Details</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {[
                ["College Name",      profile.college_name                          || "—"],
                ["Address",           doc?.college_detail?.college_address          || "—"],
                ["Branch",            doc?.college_detail?.branch                   || "—"],
                ["Current Year/Sem",  doc?.college_detail?.current_year             || "—"],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className={fieldLbl}>{label}</p>
                  <p className={fieldVal}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Reference card ─────────────────────────────────────────────── */}
          {(profile.reference_type || profile.reference_name || profile.reference_contact) && (
            <div className={cardCls}>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Reference</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
                {[
                  ["Type",    profile.reference_type    || "—"],
                  ["Name",    profile.reference_name    || "—"],
                  ["Contact", profile.reference_contact || "—"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className={fieldLbl}>{label}</p>
                    <p className={fieldVal}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Documents card ─────────────────────────────────────────────── */}
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <MdUploadFile size={16} className="text-slate-400" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Documents</p>
              </div>
              <button
                onClick={() => setShowDocEdit(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition"
              >
                <MdEdit size={13} /> Update Documents
              </button>
            </div>

            {!doc ? (
              <p className="text-sm text-slate-400 font-medium">No documents found.</p>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <p className={fieldLbl}>ID Proof Type</p>
                  <p className={fieldVal}>
                    {doc.document_type
                      ? doc.document_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                      : "—"}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {[
                    ["ID Proof",   doc.id_proof],
                    ["Photo",      doc.photo],
                    ["Resume",     doc.resume],
                    ["Marksheet",  doc.last_sem_marksheet],
                  ].map(([label, url]) => (
                    <div key={label}>
                      <p className={fieldLbl}>{label}</p>
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-black text-[#132ea7] hover:underline uppercase tracking-widest mt-0.5 inline-flex items-center gap-1">
                          <MdLink size={12} /> View
                        </a>
                      ) : (
                        <p className="text-xs text-slate-300 font-semibold mt-0.5 italic">Not uploaded</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Last login */}
          {profile.last_login && (
            <p className="text-xs text-slate-300 font-semibold text-right">
              Last login: {formatDate(profile.last_login)}
            </p>
          )}
        </div>
      )}

      {/* ── Profile Edit Modal ───────────────────────────────────────────────── */}
      {showEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Edit Profile</h2>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-600 transition">
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">

              {/* Personal */}
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Personal Information</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                  <input name="name" value={form.name || ""} onChange={handleChange} className={inputCls(errors.name)} />
                  {errors.name && <p className={errCls}>{errors.name}</p>}
                </div>
                <div>
                  <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                  <input name="email" type="email" value={form.email || ""} onChange={handleChange} className={inputCls(errors.email)} />
                  {errors.email && <p className={errCls}>{errors.email}</p>}
                </div>
                <div>
                  <label className={labelCls}>Mobile <span className="text-red-400">*</span></label>
                  <input name="mobile" value={form.mobile || ""} onChange={handleChange} maxLength={10} className={inputCls(errors.mobile)} />
                  {errors.mobile && <p className={errCls}>{errors.mobile}</p>}
                </div>
                <div>
                  <label className={labelCls}>Enrollment No. <span className="text-red-400">*</span></label>
                  <input name="enrollment_no" value={form.enrollment_no || ""} onChange={handleChange} className={inputCls(errors.enrollment_no)} />
                  {errors.enrollment_no && <p className={errCls}>{errors.enrollment_no}</p>}
                </div>
                <div>
                  <label className={labelCls}>Degree Type</label>
                  <select name="degree_type" value={form.degree_type || ""} onChange={handleChange} className={inputCls(false)}>
                    <option value="">Select degree</option>
                    {DEGREE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Intern Type</label>
                  <select name="intern_type" value={form.intern_type || ""} onChange={handleChange} className={inputCls(false)}>
                    <option value="">Select type</option>
                    {INTERN_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* College */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">College Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>College Name <span className="text-red-400">*</span></label>
                    <input name="college_name" value={form.college_name || ""} onChange={handleChange} className={inputCls(errors.college_name)} />
                    {errors.college_name && <p className={errCls}>{errors.college_name}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>College Address</label>
                    <input name="college_address" value={form.college_address || ""} onChange={handleChange} className={inputCls(false)} />
                  </div>
                  <div>
                    <label className={labelCls}>Branch</label>
                    <input name="branch" value={form.branch || ""} onChange={handleChange} className={inputCls(false)} />
                  </div>
                  <div>
                    <label className={labelCls}>Current Year / Semester</label>
                    <input name="current_year" value={form.current_year || ""} onChange={handleChange} className={inputCls(false)} />
                  </div>
                </div>
              </div>

              {/* Reference */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                  Reference <span className="text-slate-300 font-medium normal-case tracking-normal">(optional)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Reference Type</label>
                    <select name="reference_type" value={form.reference_type || ""} onChange={handleChange} className={inputCls(false)}>
                      <option value="">Select type</option>
                      {REFERENCE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Reference Name</label>
                    <input name="reference_name" value={form.reference_name || ""} onChange={handleChange} className={inputCls(false)} />
                  </div>
                  <div>
                    <label className={labelCls}>Reference Contact</label>
                    <input name="reference_contact" value={form.reference_contact || ""} onChange={handleChange} className={inputCls(false)} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Document Edit Modal ──────────────────────────────────────────────── */}
      {showDocEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Update Documents</h2>
              <button onClick={() => setShowDocEdit(false)} className="text-slate-400 hover:text-slate-600 transition">
                <MdClose size={20} />
              </button>
            </div>
            <form onSubmit={handleDocSubmit} className="px-6 py-6 flex flex-col gap-5">

              <p className="text-xs text-slate-400 font-semibold bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                Only upload files you want to replace. Existing files will be kept if no new file is selected.
              </p>

              {/* Document type */}
              <div>
                <label className={labelCls}>ID Proof Type</label>
                <select name="document_type" value={docForm.document_type} onChange={handleDocChange} className={inputCls(false)}>
                  <option value="">Keep existing</option>
                  {DOCUMENT_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Files */}
              {[
                { name: "id_proof",           label: "ID Proof File",           accept: ".pdf,.doc,.docx,image/*" },
                { name: "photo",              label: "Photo",                   accept: "image/*"                 },
                { name: "resume",             label: "Resume",                  accept: ".pdf,.doc,.docx"         },
                { name: "last_sem_marksheet", label: "Last Semester Marksheet", accept: ".pdf,.doc,.docx,image/*" },
              ].map((f) => (
                <div key={f.name}>
                  <label className={labelCls}>
                    {f.label}{" "}
                    <span className="text-slate-400 font-medium normal-case tracking-normal">(leave empty to keep existing)</span>
                  </label>
                  <input type="file" name={f.name} accept={f.accept} onChange={handleDocFileChange} className={inputCls(false)} />
                  {docForm[f.name] && (
                    <p className="text-xs text-slate-500 font-medium mt-1">{docForm[f.name].name}</p>
                  )}
                </div>
              ))}

              {/* College detail */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">College Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "college_name",    label: "College Name"          },
                    { name: "college_address", label: "College Address"       },
                    { name: "branch",          label: "Branch"                },
                    { name: "current_year",    label: "Current Year / Sem"    },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className={labelCls}>{f.label}</label>
                      <input name={f.name} value={docForm[f.name]} onChange={handleDocChange} className={inputCls(false)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowDocEdit(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={docSubmitting}
                  className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
                  {docSubmitting ? "Saving..." : "Update Documents"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InternProfile;