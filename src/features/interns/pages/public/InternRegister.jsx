// src/features/interns/pages/public/InternRegister.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntern } from "../../../../context/InternContext";
import toast from "react-hot-toast";

// ── Step indicators ────────────────────────────────────────────────────────────
const STEPS = ["Personal Info", "Documents", "Review & Submit"];

const DEGREE_OPTIONS = [
  { label: "Bachelor", value: "bachelor" },
  { label: "Master",   value: "master"  },
];

const DOCUMENT_TYPE_OPTIONS = [
  { label: "Aadhaar Card",      value: "aadhaar"          },
  { label: "Voter Card",        value: "voter_card"        },
  { label: "Passport",          value: "passport"          },
  { label: "Driving Licence",   value: "driving_licence"   },
];

const INTERN_TYPE_OPTIONS = [
  { label: "Intern",   value: "intern"   },
  { label: "Trainee",  value: "trainee"  },
];

// ── Initial state ──────────────────────────────────────────────────────────────
const initialStep1 = {
  intern_type:   "",
  name:          "",
  email:         "",
  mobile:        "",
  enrollment_no: "",
  degree_type:   "",

};

const initialStep2 = {
  document_type:  "",
  // files
  id_proof:            null,
  photo:               null,
  resume:              null,
  last_sem_marksheet:  null,
  // college_detail fields
  college_name:    "",
  college_address: "",
  branch:          "",
  current_year:    "",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatLabel = (value) =>
  value
    ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ")
    : "—";

const InternRegister = () => {
  const navigate = useNavigate();
  const { registerIntern } = useIntern();

  const [step, setStep]         = useState(0); // 0, 1, 2
  const [step1, setStep1]       = useState(initialStep1);
  console.log("🚀 ~ InternRegister ~ step1:", step1)
  const [step2, setStep2]       = useState(initialStep2);
  console.log("🚀 ~ InternRegister ~ step2:", step2)
  const [errors1, setErrors1]   = useState({});
  console.log("🚀 ~ InternRegister ~ errors1:", errors1)
  const [errors2, setErrors2]   = useState({});
  console.log("🚀 ~ InternRegister ~ errors2:", errors2)
  const [submitting, setSubmitting] = useState(false);

  // ── Step 1 handlers ──────────────────────────────────────────────────────────
  const handleStep1Change = (e) => {
    const { name, value } = e.target;
    setStep1((prev) => ({ ...prev, [name]: value }));
    if (errors1[name]) setErrors1((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep1 = () => {
    
    const e = {};
    if (!step1.intern_type)   e.intern_type   = "Please select intern type.";
    if (!step1.name.trim())   e.name          = "Full name is required.";
    if (!step1.email.trim())  e.email         = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.email))
                              e.email         = "Enter a valid email.";
    if (!step1.mobile.trim()) e.mobile        = "Mobile number is required.";
    else if (!/^\d{10}$/.test(step1.mobile))
                              e.mobile        = "Enter a valid 10-digit mobile number.";
    if (!step1.enrollment_no.trim()) e.enrollment_no = "Enrollment number is required.";
    if (!step1.degree_type)   e.degree_type   = "Please select degree type.";
;
    setErrors1(e);
    return Object.keys(e).length === 0;
  };
  

  // ── Step 2 handlers ──────────────────────────────────────────────────────────
  const handleStep2Change = (e) => {

    const { name, value } = e.target;
    setStep2((prev) => ({ ...prev, [name]: value }));
    if (errors2[name]) setErrors2((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setStep2((prev) => ({ ...prev, [name]: files[0] || null }));
    if (errors2[name]) setErrors2((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep2 = () => {
    const e = {};
    if (!step2.document_type)  e.document_type  = "Please select an ID proof type.";
    if (!step2.id_proof)       e.id_proof        = "ID proof file is required.";
    if (!step2.photo)          e.photo           = "Photo is required.";
    if (!step2.college_name.trim())    e.college_name    = "College name is required.";
    if (!step2.college_address.trim()) e.college_address = "College address is required.";
    if (!step2.branch.trim())          e.branch          = "Branch / Degree name is required.";
    if (!step2.current_year.trim())    e.current_year    = "Current year / semester is required.";
    setErrors2(e);
    return Object.keys(e).length === 0;
  };

  // ── Navigation ───────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const formData = new FormData();

      // Step 1 fields
      Object.entries(step1).forEach(([key, val]) => formData.append(key, val));

      // Step 2 — files
      formData.append("document_type", step2.document_type);
      if (step2.id_proof)           formData.append("id_proof",           step2.id_proof);
      if (step2.photo)              formData.append("photo",              step2.photo);
      if (step2.resume)             formData.append("resume",             step2.resume);
      if (step2.last_sem_marksheet) formData.append("last_sem_marksheet", step2.last_sem_marksheet);

      // Step 2 — college_detail as JSONB string
      const college_detail = {
        college_name:    step2.college_name,
        college_address: step2.college_address,
        branch:          step2.branch,
        current_year:    step2.current_year,
      };
      formData.append("college_detail", JSON.stringify(college_detail));

      const data = await registerIntern(formData);
      console.log("🚀 ~ handleSubmit ~ data:", data)

      toast.success("Registration submitted successfully!");

      // Redirect to status polling page using the token returned by backend
      const token = data?.token || data?.data?.token || data?.setup_token;
      console.log("🚀 ~ handleSubmit ~ token:", token)
      if (token) {
        // navigate(`/intern/status/${token}`);
        navigate(`/intern/status/${data.intern_id}`);
      } else {
        // fallback — show success and let them go to login
        navigate("/intern/login");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared input class ───────────────────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30 ${
      err ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
    }`;

  const labelCls = "block text-xs font-black uppercase tracking-widest text-slate-500 mb-1";
  const errCls   = "text-xs text-red-500 font-semibold mt-1";

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10 ">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#132ea7] px-8 py-6  ">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#132ea7] font-black text-xs">CRM</span>
            </div>
            <span className="font-black text-white text-lg uppercase tracking-tight">
              Intern Registration
            </span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {STEPS.map((label, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      idx < step
                        ? "bg-[#e98937] text-white"
                        : idx === step
                        ? "bg-white text-[#132ea7]"
                        : "bg-white/20 text-white/60"
                    }`}
                  >
                    {idx < step ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-black uppercase tracking-widest hidden sm:block ${
                      idx === step ? "text-white" : "text-white/50"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded ${idx < step ? "bg-[#e98937]" : "bg-white/20"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">

          {/* ── STEP 1 — Personal Info ── */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-black text-slate-700 uppercase tracking-wide">
                Personal Information
              </h2>

              {/* Intern Type */}
              <div>
                <label className={labelCls}>Intern Type <span className="text-red-400">*</span></label>
                <select name="intern_type" value={step1.intern_type} onChange={handleStep1Change} className={inputCls(errors1.intern_type)}>
                  <option value="">Select type</option>
                  {INTERN_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors1.intern_type && <p className={errCls}>{errors1.intern_type}</p>}
              </div>

              {/* Name */}
              <div>
                <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                <input name="name" value={step1.name} onChange={handleStep1Change} placeholder="e.g. Ravi Patel" className={inputCls(errors1.name)} />
                {errors1.name && <p className={errCls}>{errors1.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                <input name="email" type="email" value={step1.email} onChange={handleStep1Change} placeholder="e.g. ravi@email.com" className={inputCls(errors1.email)} />
                {errors1.email && <p className={errCls}>{errors1.email}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className={labelCls}>Mobile <span className="text-red-400">*</span></label>
                <input name="mobile" value={step1.mobile} onChange={handleStep1Change} placeholder="10-digit mobile number" maxLength={10} className={inputCls(errors1.mobile)} />
                {errors1.mobile && <p className={errCls}>{errors1.mobile}</p>}
              </div>

              {/* Enrollment No */}
              <div>
                <label className={labelCls}>Enrollment Number <span className="text-red-400">*</span></label>
                <input name="enrollment_no" value={step1.enrollment_no} onChange={handleStep1Change} placeholder="e.g. GTU123456" className={inputCls(errors1.enrollment_no)} />
                {errors1.enrollment_no && <p className={errCls}>{errors1.enrollment_no}</p>}
              </div>

              {/* Degree Type */}
              <div>
                <label className={labelCls}>Degree Type <span className="text-red-400">*</span></label>
                <select name="degree_type" value={step1.degree_type} onChange={handleStep1Change} className={inputCls(errors1.degree_type)}>
                  <option value="">Select degree</option>
                  {DEGREE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors1.degree_type && <p className={errCls}>{errors1.degree_type}</p>}
              </div>

              {/* Start & End Date */}
              {/* <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Start Date <span className="text-red-400">*</span></label>
                  <input name="start_date" type="date" value={step1.start_date} onChange={handleStep1Change} className={inputCls(errors1.start_date)} />
                  {errors1.start_date && <p className={errCls}>{errors1.start_date}</p>}
                </div>
                <div>
                  <label className={labelCls}>End Date <span className="text-red-400">*</span></label>
                  <input name="end_date" type="date" value={step1.end_date} onChange={handleStep1Change} className={inputCls(errors1.end_date)} />
                  {errors1.end_date && <p className={errCls}>{errors1.end_date}</p>}
                </div>
              </div> */}
            </div>
          )}

          {/* ── STEP 2 — Documents ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-black text-slate-700 uppercase tracking-wide">
                Documents & College Details
              </h2>

              {/* ID Proof Type */}
              <div>
                <label className={labelCls}>ID Proof Type <span className="text-red-400">*</span></label>
                <select name="document_type" value={step2.document_type} onChange={handleStep2Change} className={inputCls(errors2.document_type)}>
                  <option value="">Select ID type</option>
                  {DOCUMENT_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors2.document_type && <p className={errCls}>{errors2.document_type}</p>}
              </div>

              {/* ID Proof File */}
              <div>
                <label className={labelCls}>ID Proof File <span className="text-red-400">*</span></label>
                <input name="id_proof" type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleFileChange} className={inputCls(errors2.id_proof)} />
                {step2.id_proof && <p className="text-xs text-slate-500 mt-1 font-medium">{step2.id_proof.name}</p>}
                {errors2.id_proof && <p className={errCls}>{errors2.id_proof}</p>}
              </div>

              {/* Photo */}
              <div>
                <label className={labelCls}>Photo <span className="text-red-400">*</span></label>
                <input name="photo" type="file" accept="image/*" onChange={handleFileChange} className={inputCls(errors2.photo)} />
                {step2.photo && <p className="text-xs text-slate-500 mt-1 font-medium">{step2.photo.name}</p>}
                {errors2.photo && <p className={errCls}>{errors2.photo}</p>}
              </div>

              {/* Resume (optional) */}
              <div>
                <label className={labelCls}>Resume <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <input name="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className={inputCls(false)} />
                {step2.resume && <p className="text-xs text-slate-500 mt-1 font-medium">{step2.resume.name}</p>}
              </div>

              {/* Last Sem Marksheet (optional) */}
              <div>
                <label className={labelCls}>Last Semester Marksheet <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <input name="last_sem_marksheet" type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleFileChange} className={inputCls(false)} />
                {step2.last_sem_marksheet && <p className="text-xs text-slate-500 mt-1 font-medium">{step2.last_sem_marksheet.name}</p>}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                  College Details
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls}>College Name <span className="text-red-400">*</span></label>
                    <input name="college_name" value={step2.college_name} onChange={handleStep2Change} placeholder="e.g. Gujarat Technological University" className={inputCls(errors2.college_name)} />
                    {errors2.college_name && <p className={errCls}>{errors2.college_name}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>College Address <span className="text-red-400">*</span></label>
                    <input name="college_address" value={step2.college_address} onChange={handleStep2Change} placeholder="e.g. Chandkheda, Ahmedabad" className={inputCls(errors2.college_address)} />
                    {errors2.college_address && <p className={errCls}>{errors2.college_address}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Branch / Degree Name <span className="text-red-400">*</span></label>
                    <input name="branch" value={step2.branch} onChange={handleStep2Change} placeholder="e.g. Computer Engineering" className={inputCls(errors2.branch)} />
                    {errors2.branch && <p className={errCls}>{errors2.branch}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Current Year / Semester <span className="text-red-400">*</span></label>
                    <input name="current_year" value={step2.current_year} onChange={handleStep2Change} placeholder="e.g. 3rd Year / Sem 6" className={inputCls(errors2.current_year)} />
                    {errors2.current_year && <p className={errCls}>{errors2.current_year}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3 — Review & Submit ── */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-base font-black text-slate-700 uppercase tracking-wide">
                Review & Submit
              </h2>

              {/* Personal Info review */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                  Personal Information
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    ["Intern Type",       formatLabel(step1.intern_type)],
                    ["Full Name",         step1.name],
                    ["Email",             step1.email],
                    ["Mobile",            step1.mobile],
                    ["Enrollment No.",    step1.enrollment_no],
                    ["Degree Type",       formatLabel(step1.degree_type)],
                    ["Start Date",        step1.start_date],
                    ["End Date",          step1.end_date],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{val || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents review */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                  Documents
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    ["ID Proof Type",       formatLabel(step2.document_type)],
                    ["ID Proof File",       step2.id_proof?.name || "—"],
                    ["Photo",               step2.photo?.name || "—"],
                    ["Resume",              step2.resume?.name || "Not uploaded"],
                    ["Marksheet",           step2.last_sem_marksheet?.name || "Not uploaded"],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* College Details review */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                  College Details
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    ["College Name",    step2.college_name],
                    ["Address",         step2.college_address],
                    ["Branch",          step2.branch],
                    ["Current Year",    step2.current_year],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{val || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-400 font-medium text-center">
                Please review all details before submitting. You won't be able to edit after submission.
              </p>
            </div>
          )}

        </div>

        {/* Footer — navigation buttons */}
        <div className="px-8 pb-8 flex justify-between gap-4">
          {step > 0 ? (
            <button
              onClick={handleBack}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition disabled:opacity-50"
            >
              Back
            </button>
          ) : (
            <div className="flex-1" /> // spacer
          )}

          {step < 2 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[#e98937] text-white font-black text-sm uppercase tracking-widest hover:bg-[#d4782a] transition disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Registration"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default InternRegister;