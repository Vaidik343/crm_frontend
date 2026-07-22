// src/features/interns/pages/intern/InternProfile.jsx

import { useEffect, useState } from "react";
import { useIntern } from "../../../../context/InternContext";
import toast from "react-hot-toast";
import {
  MdPerson, MdEdit, MdClose, MdSchool,
  MdPhone, MdEmail, MdBadge, MdCalendarToday,
} from "react-icons/md";
import { formatDate } from "../../../../utils/formatDate";

// ── Component ──────────────────────────────────────────────────────────────────

const InternProfile = () => {
  const {
    profile, profileLoading,
    getMyProfile, updateMyProfile,
  } = useIntern();

  // ── Edit modal ─────────────────────────────────────────────────────────────
  const [showEdit, setShowEdit]     = useState(false);
  const [form, setForm]             = useState({
    name:         "",
    mobile:       "",
    college_name: "",
  });
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    getMyProfile();
  }, []);

  // ── Populate form when modal opens ─────────────────────────────────────────
  useEffect(() => {
    if (showEdit && profile) {
      setForm({
        name:         profile.name         || "",
        mobile:       profile.mobile       || "",
        college_name: profile.college_name || "",
      });
      setErrors({});
    }
  }, [showEdit, profile]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())
      e.name = "Name is required.";
    if (!form.mobile.trim())
      e.mobile = "Mobile is required.";
    else if (!/^\d{10}$/.test(form.mobile))
      e.mobile = "Enter a valid 10-digit mobile number.";
    if (!form.college_name.trim())
      e.college_name = "College name is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      await updateMyProfile({
        name:         form.name.trim(),
        mobile:       form.mobile.trim(),
        college_name: form.college_name.trim(),
      });
      toast.success("Profile updated successfully!");
      setShowEdit(false);
      getMyProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
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
  const lockedVal = "text-sm font-semibold text-slate-400 mt-0.5 italic";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            My Profile
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            View and update your personal information
          </p>
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

            {/* Avatar + name row */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#132ea7] flex items-center justify-center text-white font-black text-2xl shrink-0">
                {profile.name?.charAt(0) || "I"}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  {profile.name}
                </h2>
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

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">

              {/* Editable fields */}
              <div>
                <p className={fieldLbl}><MdPhone size={11} className="inline mr-1" />Mobile</p>
                <p className={fieldVal}>{profile.mobile || "—"}</p>
              </div>

              {/* Locked fields */}
              <div>
                <p className={fieldLbl}><MdEmail size={11} className="inline mr-1" />Email</p>
                <p className={fieldVal}>{profile.email || "—"}</p>
                <p className="text-[10px] text-slate-300 font-semibold mt-0.5">Cannot be changed</p>
              </div>

              <div>
                <p className={fieldLbl}><MdBadge size={11} className="inline mr-1" />Enrollment No.</p>
                <p className={lockedVal}>{profile.enrollment_no || "—"}</p>
                <p className="text-[10px] text-slate-300 font-semibold mt-0.5">Cannot be changed</p>
              </div>

              <div>
                <p className={fieldLbl}>Degree Type</p>
                <p className={fieldVal}>
                  {profile.degree_type
                    ? profile.degree_type.charAt(0).toUpperCase() + profile.degree_type.slice(1)
                    : "—"}
                </p>
              </div>

              <div>
                <p className={fieldLbl}><MdCalendarToday size={11} className="inline mr-1" />Start Date</p>
                <p className={lockedVal}>{profile.start_date ? formatDate(profile.start_date) : "—"}</p>
                <p className="text-[10px] text-slate-300 font-semibold mt-0.5">Set by admin</p>
              </div>

              <div>
                <p className={fieldLbl}><MdCalendarToday size={11} className="inline mr-1" />End Date</p>
                <p className={lockedVal}>{profile.end_date ? formatDate(profile.end_date) : "—"}</p>
                <p className="text-[10px] text-slate-300 font-semibold mt-0.5">Set by admin</p>
              </div>

            </div>
          </div>

          {/* ── College card ───────────────────────────────────────────────── */}
          <div className={cardCls}>
            <div className="flex items-center gap-2 mb-5">
              <MdSchool size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                College Details
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <p className={fieldLbl}>College Name</p>
                <p className={fieldVal}>{profile.college_name || "—"}</p>
              </div>
              {profile.documents?.[0]?.college_detail && (
                <>
                  <div>
                    <p className={fieldLbl}>Address</p>
                    <p className={fieldVal}>{profile.documents[0].college_detail.college_address || "—"}</p>
                  </div>
                  <div>
                    <p className={fieldLbl}>Branch</p>
                    <p className={fieldVal}>{profile.documents[0].college_detail.branch || "—"}</p>
                  </div>
                  <div>
                    <p className={fieldLbl}>Current Year / Sem</p>
                    <p className={fieldVal}>{profile.documents[0].college_detail.current_year || "—"}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Mentor card ────────────────────────────────────────────────── */}
          <div className={cardCls}>
            <div className="flex items-center gap-2 mb-5">
              <MdPerson size={16} className="text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Mentor
              </p>
            </div>
            {profile.mentor ? (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#132ea7] flex items-center justify-center text-white font-black shrink-0">
                  {profile.mentor.name?.charAt(0) || "M"}
                </div>
                <div>
                  <p className="font-black text-slate-700">{profile.mentor.name}</p>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                    {profile.mentor.employee_id}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-medium italic">
                Mentor will be assigned by admin.
              </p>
            )}
          </div>

          {/* ── Last login ─────────────────────────────────────────────────── */}
          {profile.last_login && (
            <p className="text-xs text-slate-300 font-semibold text-right">
              Last login: {formatDate(profile.last_login)}
            </p>
          )}

        </div>
      )}

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      {showEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                Edit Profile
              </h2>
              <button
                onClick={() => setShowEdit(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">

              {/* Name */}
              <div>
                <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputCls(errors.name)}
                />
                {errors.name && <p className={errCls}>{errors.name}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className={labelCls}>Mobile <span className="text-red-400">*</span></label>
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={inputCls(errors.mobile)}
                />
                {errors.mobile && <p className={errCls}>{errors.mobile}</p>}
              </div>

              {/* College name */}
              <div>
                <label className={labelCls}>College Name <span className="text-red-400">*</span></label>
                <input
                  name="college_name"
                  value={form.college_name}
                  onChange={handleChange}
                  placeholder="Your college name"
                  className={inputCls(errors.college_name)}
                />
                {errors.college_name && <p className={errCls}>{errors.college_name}</p>}
              </div>

              {/* Locked fields note */}
              <p className="text-xs text-slate-400 font-semibold bg-slate-50 rounded-xl px-4 py-3">
                Email, enrollment number, start/end dates and degree type cannot be changed. Contact admin if needed.
              </p>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Changes"}
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