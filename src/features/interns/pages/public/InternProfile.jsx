// src/features/interns/pages/intern/InternProfile.jsx
import { useEffect, useState } from "react";
import { useIntern } from "../../../../context/InternContext";
import toast from "react-hot-toast";
import {
  MdPerson,
  MdEdit,
  MdClose,
  MdSchool,
  MdPhone,
  MdEmail,
  MdBadge,
  MdCalendarToday,
  MdUploadFile,
  MdLink,
  MdCheckCircle,
  MdInsertDriveFile,
  MdPhoto,
  MdDescription,
  MdCloudUpload,
  MdBusiness,
  MdGroup,
} from "react-icons/md";
import { formatDate } from "../../../../utils/formatDate";
import api from "../../../../api/axiosInstance";
import { ENDPOINTS } from "../../../../api/endpoints";
import internApi from "../../../../api/internApi";

// ── Constants ──────────────────────────────────────────────────────────────────

const DEGREE_OPTIONS = [
  { label: "Bachelor", value: "bachelor" },
  { label: "Master", value: "master" },
];

const INTERN_TYPE_OPTIONS = [
  { label: "Intern", value: "intern" },
  { label: "Trainee", value: "trainee" },
];

const REFERENCE_TYPE_OPTIONS = [
  { label: "Employee", value: "employee" },
  { label: "Intern", value: "intern" },
  { label: "College", value: "college" },
  { label: "Friend", value: "friend" },
  { label: "Social Media", value: "social_media" },
  { label: "Website", value: "website" },
  { label: "Other", value: "other" },
];

const DOCUMENT_TYPE_OPTIONS = [
  { label: "Aadhaar Card", value: "aadhaar" },
  { label: "Voter Card", value: "voter_card" },
  { label: "Passport", value: "passport" },
  { label: "Driving Licence", value: "driving_licence" },
];

// ── Mentor Chips Sub-component ───────────────────────────────────────────────

const MentorChips = ({ mentors }) => {
  if (!mentors || mentors.length === 0) {
    return (
      <p className="text-xs text-slate-400 font-medium italic">
        No mentors assigned yet.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2.5">
      {mentors.map((m) => (
        <div
          key={m.id}
          className="flex items-center gap-2.5 bg-indigo-50/80 border border-indigo-100 px-3.5 py-2 rounded-xl transition hover:bg-indigo-100/60"
        >
          <div className="w-7 h-7 rounded-full bg-[#132ea7] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
            {m.name?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800 leading-tight">
              {m.name}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {m.employee_id}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Styled File Upload Field ──────────────────────────────────────────────────

const CustomFileUpload = ({ label, name, accept, file, onChange, existingUrl }) => {
  // extract filename from URL path
  const existingName = existingUrl
    ? existingUrl.split("/").pop()
    : null;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <label className="relative flex items-center justify-between p-3.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-[#132ea7]/50 cursor-pointer transition group">
        <input type="file" name={name} accept={accept} onChange={onChange} className="sr-only" />
        <div className="flex items-center gap-3 truncate">
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${file ? "bg-[#132ea7] border-[#132ea7]" : existingName ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
            <MdCloudUpload size={18} className={file ? "text-white" : existingName ? "text-emerald-500" : "text-slate-400"} />
          </div>
          <div className="truncate">
            {file ? (
              <>
                <p className="text-xs font-bold text-[#132ea7] truncate">{file.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">{(file.size / 1024).toFixed(1)} KB · New file</p>
              </>
            ) : existingName ? (
              <>
                <p className="text-xs font-bold text-slate-600 truncate">{existingName}</p>
                <p className="text-[10px] text-emerald-600 font-medium">✓ Currently uploaded · click to replace</p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-slate-400 truncate">No file uploaded</p>
                <p className="text-[10px] text-slate-400 font-medium">Click to upload</p>
              </>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 ${file ? "bg-[#132ea7] text-white" : "bg-indigo-50 text-[#132ea7]"}`}>
          {file ? "Change" : existingName ? "Replace" : "Browse"}
        </span>
      </label>
    </div>
  );
};
// ── Main Component ─────────────────────────────────────────────────────────────

const InternProfile = () => {
  const { profile, profileLoading, getMyProfile, updateMyProfile, updateMyDocuments  } = useIntern();

  // ── Modals State ──
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({});
  
  const [errors, setErrors] = useState({});
  //("🚀 ~ InternProfile ~ errors:", errors)
  
  const [submitting, setSubmitting] = useState(false);

  const [showDocEdit, setShowDocEdit] = useState(false);
  const [docForm, setDocForm] = useState({
    document_type: "",
    college_name: "",
    college_address: "",
    branch: "",
    current_year: "",
    id_proof: null,
    photo: null,
    resume: null,
    last_sem_marksheet: null,
  });
  //("🚀 ~ InternProfile ~ docForm:", docForm)
  const [docSubmitting, setDocSubmitting] = useState(false);

  // ── Fetch Profile ──
  useEffect(() => {
    getMyProfile();
  }, []);

  // ── Populate Profile Form ──
  useEffect(() => {
    if (showEdit && profile) {
      const doc = profile.documents?.[0];
      setForm({
        name: profile.name || "",
        email: profile.email || "",
        mobile: profile.mobile || "",
        college_name: profile.college_name || "",
        enrollment_no: profile.enrollment_no || "",
        degree_type: profile.degree_type || "",
        intern_type: profile.intern_type || "",
        reference_type: profile.reference_type || "",
        reference_name: profile.reference_name || "",
        reference_contact: profile.reference_contact || "",
        college_address: doc?.college_detail?.college_address || "",
        branch: doc?.college_detail?.branch || "",
        current_year: doc?.college_detail?.current_year || "",
      });
      setErrors({});
    }
  }, [showEdit, profile]);

  // ── Populate Document Form ──
  useEffect(() => {
    if (showDocEdit && profile) {
      const doc = profile.documents?.[0];
      //("🚀 ~ InternProfile ~ doc:", doc)
      setDocForm({
        document_type: doc?.document_type || "",
        college_name: doc?.college_detail?.college_name || "",
        college_address: doc?.college_detail?.college_address || "",
        branch: doc?.college_detail?.branch || "",
        current_year: doc?.college_detail?.current_year || "",
        id_proof: null,
        photo: null,
        resume: null,
        last_sem_marksheet: null,
      });
    }
  }, [showDocEdit, profile]);

  // ── Handlers ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email.";
    if (!form.mobile.trim()) e.mobile = "Mobile is required.";
    else if (!/^\d{10}$/.test(form.mobile))
      e.mobile = "Enter a valid 10-digit mobile.";
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

      await updateMyProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        college_name: form.college_name.trim(),
        enrollment_no: form.enrollment_no.trim(),
        degree_type: form.degree_type || undefined,
        intern_type: form.intern_type || undefined,
        reference_type: form.reference_type || undefined,
        reference_name: form.reference_name.trim() || undefined,
        reference_contact: form.reference_contact.trim() || undefined,
      });

      if (form.college_address || form.branch || form.current_year) {
        const college_detail = JSON.stringify({
          college_name: form.college_name.trim(),
          college_address: form.college_address.trim(),
          branch: form.branch.trim(),
          current_year: form.current_year.trim(),
        });
        const fd = new FormData();
        fd.append("college_detail", college_detail);
     await updateMyDocuments(fd);
      }

      toast.success("Profile updated successfully!");
      setShowEdit(false);
      getMyProfile();
    } catch (error) {
          //("🚀 ~ handleSubmit ~ error:", error)
      toast.error(error?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

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
      //("🚀 ~ handleDocSubmit ~ fd:", fd)

      if (docForm.document_type) fd.append("document_type", docForm.document_type);
      if (docForm.id_proof) fd.append("id_proof", docForm.id_proof);
      if (docForm.photo) fd.append("photo", docForm.photo);
      if (docForm.resume) fd.append("resume", docForm.resume);
      if (docForm.last_sem_marksheet)
        fd.append("last_sem_marksheet", docForm.last_sem_marksheet);

      const college_detail = JSON.stringify({
        college_name: docForm.college_name.trim(),
        college_address: docForm.college_address.trim(),
        branch: docForm.branch.trim(),
        current_year: docForm.current_year.trim(),
      });
      fd.append("college_detail", college_detail);

   await updateMyDocuments(fd); 

      toast.success("Documents updated successfully!");
      setShowDocEdit(false);
      getMyProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update documents.");
    } finally {
      setDocSubmitting(false);
    }
  };

  // ── Class Names ──
  const inputCls = (err) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 ${
      err
        ? "border-red-300 bg-red-50/50 focus:border-red-500"
        : "border-slate-200 bg-slate-50/30 focus:border-[#132ea7] focus:bg-white"
    }`;
  const labelCls = "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5";
  const errCls = "text-xs text-red-500 font-semibold mt-1";
  const cardCls = "bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 transition hover:shadow-md";

  const doc = profile?.documents?.[0];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-[#132ea7] rounded-xl">
            <MdBadge size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Intern Profile
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Manage your personal credentials, contact details, and documents
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0f2490] active:scale-95 transition shadow-sm shadow-indigo-200"
        >
          <MdEdit size={16} /> Edit Profile
        </button>
      </div>

      {profileLoading ? (
        <div className={`${cardCls} flex flex-col items-center justify-center py-20 gap-3`}>
          <div className="w-8 h-8 border-4 border-indigo-100 border-t-[#132ea7] rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Loading profile details...</p>
        </div>
      ) : !profile ? (
        <div className={`${cardCls} flex flex-col items-center justify-center py-16 text-center`}>
          <p className="text-sm text-slate-500 font-semibold">No profile data found.</p>
          <p className="text-xs text-slate-400 mt-1">Please reach out to administration if this is an error.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Identity & Contact (1 col on desktop) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Identity Card */}
            <div className={cardCls}>
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#132ea7] to-indigo-500 flex items-center justify-center text-white font-black text-3xl shadow-md">
                    {profile.name?.charAt(0) || "I"}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Active"></span>
                </div>
                <h2 className="text-lg font-black text-slate-800">{profile.name}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#132ea7] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    {profile.intern_type || "Intern"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {profile.display_id || "—"}
                  </span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="pt-5 flex flex-col gap-3.5">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <MdEmail size={18} className="text-slate-400 shrink-0" />
                  <span className="font-semibold truncate">{profile.email || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <MdPhone size={18} className="text-slate-400 shrink-0" />
                  <span className="font-semibold">{profile.mobile || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <MdCalendarToday size={18} className="text-slate-400 shrink-0" />
                  <span className="font-medium">
                    {profile.start_date ? formatDate(profile.start_date) : "—"} to{" "}
                    {profile.end_date ? formatDate(profile.end_date) : "Ongoing"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mentors Card */}
            <div className={cardCls}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-indigo-50 text-[#132ea7] rounded-lg">
                  <MdPerson size={16} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Assigned Mentors
                </p>
              </div>
              <MentorChips mentors={profile.mentors} />
            </div>

            {/* Reference Card */}
            {(profile.reference_type || profile.reference_name || profile.reference_contact) && (
              <div className={cardCls}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-indigo-50 text-[#132ea7] rounded-lg">
                    <MdGroup size={16} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Reference
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Type</p>
                    <p className="text-xs font-semibold text-slate-700 capitalize">
                      {profile.reference_type || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Name</p>
                    <p className="text-xs font-semibold text-slate-700">
                      {profile.reference_name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Contact</p>
                    <p className="text-xs font-semibold text-slate-700">
                      {profile.reference_contact || "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Academic & Document Details (2 cols on desktop) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* General & Academic Details */}
            <div className={cardCls}>
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                <div className="p-1.5 bg-indigo-50 text-[#132ea7] rounded-lg">
                  <MdSchool size={18} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Academic & Registration Info
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Enrollment No.
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {profile.enrollment_no || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Degree Type
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">
                    {profile.degree_type || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    College Name
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {profile.college_name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Branch / Field
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {doc?.college_detail?.branch || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current Year / Sem
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {doc?.college_detail?.current_year || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    College Address
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
                    {doc?.college_detail?.college_address || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded Documents Card */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-[#132ea7] rounded-lg">
                    <MdUploadFile size={18} />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Uploaded Documents
                  </h3>
                </div>
                <button
                  onClick={() => setShowDocEdit(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-[#132ea7] text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 transition"
                >
                  <MdEdit size={14} /> Update Docs
                </button>
              </div>

              {!doc ? (
                <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-medium">No documents uploaded yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="bg-indigo-50/50 border border-indigo-100/80 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Selected ID Proof Type
                      </p>
                      <p className="text-xs font-bold text-[#132ea7] mt-0.5">
                        {doc.document_type
                          ? doc.document_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                          : "Not Specified"}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      <MdCheckCircle size={12} /> Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "ID Proof", url: doc.id_proof, icon: MdBadge },
                      { label: "Photo", url: doc.photo, icon: MdPhoto },
                      { label: "Resume", url: doc.resume, icon: MdDescription },
                      { label: "Marksheet", url: doc.last_sem_marksheet, icon: MdInsertDriveFile },
                    ].map(({ label, url, icon: Icon }) => (
                      <div
                        key={label}
                        className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/30 flex items-center justify-between hover:bg-white hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">{label}</p>
                            <p className="text-[10px] font-medium text-slate-400">
                              {url ? "Available" : "Not uploaded"}
                            </p>
                          </div>
                        </div>

                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#132ea7] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#0f2490] transition shrink-0"
                          >
                            <MdLink size={12} /> View
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold italic px-2 py-1">
                            Missing
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {profile.last_login && (
              <p className="text-xs text-slate-400 font-medium text-right pr-2">
                Last active login: {formatDate(profile.last_login)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Profile Modal ──────────────────────────────────────────────── */}
      {showEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <MdEdit className="text-[#132ea7]" size={20} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Edit Profile Information
                </h2>
              </div>
              <button
                onClick={() => setShowEdit(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-6">
              {/* Personal Info */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#132ea7] mb-3 pb-1 border-b border-indigo-50">
                  Personal Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name || ""}
                      onChange={handleChange}
                      className={inputCls(errors.name)}
                    />
                    {errors.name && <p className={errCls}>{errors.name}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email || ""}
                      onChange={handleChange}
                      className={inputCls(errors.email)}
                    />
                    {errors.email && <p className={errCls}>{errors.email}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="mobile"
                      value={form.mobile || ""}
                      onChange={handleChange}
                      maxLength={10}
                      className={inputCls(errors.mobile)}
                    />
                    {errors.mobile && <p className={errCls}>{errors.mobile}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>
                      Enrollment No. <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="enrollment_no"
                      value={form.enrollment_no || ""}
                      onChange={handleChange}
                      className={inputCls(errors.enrollment_no)}
                    />
                    {errors.enrollment_no && <p className={errCls}>{errors.enrollment_no}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Degree Type</label>
                    <select
                      name="degree_type"
                      value={form.degree_type || ""}
                      onChange={handleChange}
                      className={inputCls(false)}
                    >
                      <option value="">Select degree</option>
                      {DEGREE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Intern Type</label>
                    <select
                      name="intern_type"
                      value={form.intern_type || ""}
                      onChange={handleChange}
                      className={inputCls(false)}
                    >
                      <option value="">Select type</option>
                      {INTERN_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* College Details */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#132ea7] mb-3 pb-1 border-b border-indigo-50">
                  College Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      College Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="college_name"
                      value={form.college_name || ""}
                      onChange={handleChange}
                      className={inputCls(errors.college_name)}
                    />
                    {errors.college_name && <p className={errCls}>{errors.college_name}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Branch</label>
                    <input
                      name="branch"
                      value={form.branch || ""}
                      onChange={handleChange}
                      className={inputCls(false)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Current Year / Sem</label>
                    <input
                      name="current_year"
                      value={form.current_year || ""}
                      onChange={handleChange}
                      className={inputCls(false)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>College Address</label>
                    <input
                      name="college_address"
                      value={form.college_address || ""}
                      onChange={handleChange}
                      className={inputCls(false)}
                    />
                  </div>
                </div>
              </div>

              {/* Reference */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#132ea7] mb-3 pb-1 border-b border-indigo-50">
                  Reference Information <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Reference Type</label>
                    <select
                      name="reference_type"
                      value={form.reference_type || ""}
                      onChange={handleChange}
                      className={inputCls(false)}
                    >
                      <option value="">Select type</option>
                      {REFERENCE_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Reference Name</label>
                    <input
                      name="reference_name"
                      value={form.reference_name || ""}
                      onChange={handleChange}
                      className={inputCls(false)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Reference Contact</label>
                    <input
                      name="reference_contact"
                      value={form.reference_contact || ""}
                      onChange={handleChange}
                      className={inputCls(false)}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#132ea7] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#0f2490] transition disabled:opacity-60 shadow-sm"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Document Edit Modal ──────────────────────────────────────────────── */}
      {showDocEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <MdUploadFile className="text-[#132ea7]" size={20} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Update Documents & College Details
                </h2>
              </div>
              <button
                onClick={() => setShowDocEdit(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleDocSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/60 rounded-xl flex items-start gap-3">
                <span className="text-amber-500 font-bold text-sm">💡</span>
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  Only choose files you wish to update or replace. Previously uploaded files will remain unchanged.
                </p>
              </div>

              {/* ID Proof Type Select */}
              <div>
                <label className={labelCls}>ID Proof Type</label>
                <select
                  name="document_type"
                  value={docForm.document_type}
                  onChange={handleDocChange}
                  className={inputCls(false)}
                >
                  <option value="">Keep existing selection</option>
                  {DOCUMENT_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomFileUpload
                  label="ID Proof File"
                  name="id_proof"
                  accept=".pdf,.doc,.docx,image/*"
                  file={docForm.id_proof}
                  onChange={handleDocFileChange}
                   existingUrl={doc?.id_proof}
                />
                <CustomFileUpload
                  label="Profile Photo"
                  name="photo"
                  accept="image/*"
                  file={docForm.photo}
                  onChange={handleDocFileChange}
                    existingUrl={doc?.photo}
                />
                <CustomFileUpload
                  label="Resume / CV"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  file={docForm.resume}
                  onChange={handleDocFileChange}
                    existingUrl={doc?.resume}
                />
                <CustomFileUpload
                  label="Last Sem Marksheet"
                  name="last_sem_marksheet"
                  accept=".pdf,.doc,.docx,image/*"
                  file={docForm.last_sem_marksheet}
                  onChange={handleDocFileChange}
                    existingUrl={doc?.last_sem_marksheet}
                />
              </div>

              {/* College detail */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  College Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "college_name", label: "College Name" },
                    { name: "branch", label: "Branch" },
                    { name: "current_year", label: "Current Year / Sem" },
                    { name: "college_address", label: "College Address" },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className={labelCls}>{f.label}</label>
                      <input
                        name={f.name}
                        value={docForm[f.name]}
                        onChange={handleDocChange}
                        className={inputCls(false)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDocEdit(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={docSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#132ea7] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#0f2490] transition disabled:opacity-60 shadow-sm"
                >
                  {docSubmitting ? "Updating..." : "Update Documents"}
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