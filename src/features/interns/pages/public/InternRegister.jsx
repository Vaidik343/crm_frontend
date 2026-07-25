// src/features/interns/pages/public/InternRegister.jsx

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIntern } from "../../../../context/InternContext";
import toast from "react-hot-toast";

const STEPS = [
  {
    label: "Personal Info",
    desc: "Your name, contact details and academic type",
  },
  {
    label: "Documents",
    desc: "ID proof, photo and college details",
  },
  {
    label: "Review & Submit",
    desc: "Confirm everything before sending",
  },
];

const DEGREE_OPTIONS = [
  { label: "Bachelor", value: "bachelor" },
  { label: "Master", value: "master" },
];

const DOCUMENT_TYPE_OPTIONS = [
  { label: "Aadhaar Card", value: "aadhaar" },
  { label: "Voter Card", value: "voter_card" },
  { label: "Passport", value: "passport" },
  { label: "Driving Licence", value: "driving_licence" },
];

const INTERN_TYPE_OPTIONS = [
  { label: "Intern", value: "intern" },
  { label: "Trainee", value: "trainee" },
];

const initialStep1 = {
  intern_type: "",
  name: "",
  email: "",
  mobile: "",
  enrollment_no: "",
  degree_type: "",

   reference_type: "",
  reference_name: "",
  reference_contact: "",
};

const initialStep2 = {
  document_type: "",
  id_proof: null,
  photo: null,
  resume: null,
  last_sem_marksheet: null,
  college_name: "",
  college_address: "",
  branch: "",
  current_year: "",
};


const REFERENCE_PLACEHOLDERS = {
  employee: "Employee name",
  intern: "Intern name",
  college: "College name",
  friend: "Friend's name",
  social_media: "Instagram / LinkedIn / Facebook",
  website: "Website name",
  other: "Reference name",
};


const formatLabel = (value) =>
  value
    ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ")
    : "—";

// ── Reusable field components ─────────────────────────────────────────────────

const Label = ({ children }) => (
  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
    {children}
  </label>
);

const Required = () => <span className="text-red-400 ml-0.5">*</span>;
const FieldError = ({ msg }) =>
  msg ? <p className="text-[11px] text-red-500 font-semibold mt-1">{msg}</p> : null;

const inputCls = (err) =>
  `w-full px-3 py-2.5 rounded-xl border-[1.5px] text-sm text-slate-800 font-medium bg-white transition focus:outline-none focus:border-[#132ea7] ${
    err ? "border-red-400 bg-red-50" : "border-slate-200"
  }`;

// ── Upload Dropzone (ID Proof) ─────────────────────────────────────────────────

const UploadDropzone = ({ file, onChange, error }) => {
  const ref = useRef();
  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        className="hidden"
        onChange={onChange}
      />
      <div
        onClick={() => ref.current.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          error
            ? "border-red-400 bg-red-50"
            : file
            ? "border-[#132ea7] bg-[#f0f3ff]"
            : "border-indigo-200 bg-[#f8f9ff] hover:border-[#132ea7] hover:bg-[#eef0ff]"
        }`}
      >
        <div className="text-3xl mb-1.5 text-[#132ea7]">☁</div>
        {file ? (
          <>
            <p className="text-sm font-bold text-[#132ea7]">{file.name}</p>
            <p className="text-xs text-slate-400 mt-1">Click to change file</p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-slate-700">Click to upload</p>
            <p className="text-xs text-slate-400 mt-1">PDF, PNG or JPG (max. 5MB)</p>
          </>
        )}
      </div>
      <FieldError msg={error} />
    </div>
  );
};

// ── Upload Mini Card (Photo / Resume / Marksheet) ─────────────────────────────

const UploadCard = ({ label, optional, accept, file, onChange, error, icon }) => {
  const ref = useRef();
  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onChange}
      />
      <div
        onClick={() => ref.current.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
          file
            ? "border-[#132ea7] border-solid bg-[#f0f3ff]"
            : "border-slate-200 bg-slate-50 hover:border-[#132ea7] hover:bg-[#f0f3ff]"
        }`}
      >
        <div className={`text-2xl mb-1 ${file ? "text-[#132ea7]" : "text-slate-400"}`}>
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {label}
          {!optional && <span className="text-red-400 ml-0.5">*</span>}
        </p>
        {optional && (
          <p className="text-[9px] text-slate-400 mt-0.5">Optional</p>
        )}
        {file ? (
          <p className="text-[9px] font-bold text-[#132ea7] mt-1 break-all leading-tight">
            {file.name}
          </p>
        ) : (
          <p className="text-[9px] text-slate-400 mt-1">Click to upload</p>
        )}
      </div>
      <FieldError msg={error} />
    </div>
  );
};

// ── Section header ─────────────────────────────────────────────────────────────

const SectionHead = ({ children }) => (
  <div className="flex items-center gap-2 mt-5 mb-3">
    <div className="w-1 h-4 bg-[#132ea7] rounded-full" />
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{children}</p>
  </div>
);

// ── Review file item ──────────────────────────────────────────────────────────

const FileItem = ({ name, sub, icon }) => (
  <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-3 py-2.5 mb-2">
    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-sm flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
      <p className="text-[10px] text-slate-400">{sub}</p>
    </div>
    <span className="text-green-500 font-bold text-base">✓</span>
  </div>
);

// ── Review section card ────────────────────────────────────────────────────────

const ReviewSection = ({ title, icon, onEdit, children }) => (
  <div className="bg-slate-50 rounded-xl p-4 mb-3">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {title}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="text-[11px] font-bold text-[#132ea7] hover:bg-indigo-50 px-2 py-1 rounded-lg transition"
      >
        ✏ Edit
      </button>
    </div>
    {children}
  </div>
);

const ReviewGrid = ({ items }) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
    {items.map(([label, val, span]) => (
      <div key={label} className={span ? "col-span-2" : ""}>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-700 mt-0.5">{val || "—"}</p>
      </div>
    ))}
  </div>
);

// ── Left panel ────────────────────────────────────────────────────────────────

const LeftPanel = ({ step }) => (
  <div className="bg-[#132ea7] w-[38%] flex-shrink-0 p-8 flex flex-col">
    {/* Brand */}
    <div className="flex items-center gap-2.5 mb-8">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
        <span className="text-[#132ea7] font-black text-[9px] tracking-tight">CRM</span>
      </div>
      <span className="text-white font-black text-sm uppercase tracking-wide">
        Intern Portal
      </span>
    </div>

    <p className="text-white font-black text-xl leading-snug mb-1">
      Start your journey with BBCSPL
    </p>
    <p className="text-white/60 text-xs leading-relaxed mb-8">
      Complete the registration form to apply for an internship or trainee position.
    </p>

    {/* Vertical stepper */}
    <div className="flex flex-col gap-0 flex-1">
      {STEPS.map((s, idx) => (
        <div key={idx} className="flex gap-3 relative">
          {/* connector line */}
          {idx < STEPS.length - 1 && (
            <div
              className={`absolute left-[14px] top-8 w-0.5 h-[calc(100%-12px)] ${
                idx < step ? "bg-[#e98937]" : "bg-white/15"
              }`}
            />
          )}
          {/* dot */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 mb-6 ${
              idx < step
                ? "bg-[#e98937] text-white"
                : idx === step
                ? "bg-white text-[#132ea7]"
                : "bg-white/15 text-white/50"
            }`}
          >
            {idx < step ? "✓" : idx + 1}
          </div>
          <div className="pt-1">
            <p
              className={`text-xs font-black uppercase tracking-widest ${
                idx === step ? "text-white" : "text-white/50"
              }`}
            >
              {s.label}
            </p>
            <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const InternRegister = () => {
  const navigate = useNavigate();
  const { registerIntern } = useIntern();

  const [step, setStep] = useState(0);
  const [step1, setStep1] = useState(initialStep1);
  const [step2, setStep2] = useState(initialStep2);
  const [errors1, setErrors1] = useState({});
  const [errors2, setErrors2] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleStep1Change = (e) => {
    const { name, value } = e.target;
    setStep1((p) => ({ ...p, [name]: value }));
    if (errors1[name]) setErrors1((p) => ({ ...p, [name]: "" }));
  };

  const handleStep2Change = (e) => {
    const { name, value } = e.target;
    setStep2((p) => ({ ...p, [name]: value }));
    if (errors2[name]) setErrors2((p) => ({ ...p, [name]: "" }));
  };

  const handleFileChange = (fieldName) => (e) => {
    const file = e.target.files[0] || null;
    setStep2((p) => ({ ...p, [fieldName]: file }));
    if (errors2[fieldName]) setErrors2((p) => ({ ...p, [fieldName]: "" }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!step1.intern_type) e.intern_type = "Please select intern type.";
    if (!step1.name.trim()) e.name = "Full name is required.";
    if (!step1.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.email))
      e.email = "Enter a valid email.";
    if (!step1.mobile.trim()) e.mobile = "Mobile number is required.";
    else if (!/^\d{10}$/.test(step1.mobile))
      e.mobile = "Enter a valid 10-digit mobile number.";
    if (!step1.enrollment_no.trim())
      e.enrollment_no = "Enrollment number is required.";
    if (!step1.degree_type) e.degree_type = "Please select degree type.";
    setErrors1(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!step2.document_type) e.document_type = "Please select an ID proof type.";
    if (!step2.id_proof) e.id_proof = "ID proof file is required.";
    if (!step2.photo) e.photo = "Photo is required.";
    if (!step2.college_name.trim()) e.college_name = "College name is required.";
    if (!step2.college_address.trim())
      e.college_address = "College address is required.";
    if (!step2.branch.trim()) e.branch = "Branch / Degree name is required.";
    if (!step2.current_year.trim())
      e.current_year = "Current year / semester is required.";
    setErrors2(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setStep((p) => p + 1);
  };

  const handleBack = () => setStep((p) => p - 1);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      Object.entries(step1).forEach(([k, v]) => formData.append(k, v));
      formData.append("document_type", step2.document_type);
      if (step2.id_proof) formData.append("id_proof", step2.id_proof);
      if (step2.photo) formData.append("photo", step2.photo);
      if (step2.resume) formData.append("resume", step2.resume);
      if (step2.last_sem_marksheet)
        formData.append("last_sem_marksheet", step2.last_sem_marksheet);
      formData.append(
        "college_detail",
        JSON.stringify({
          college_name: step2.college_name,
          college_address: step2.college_address,
          branch: step2.branch,
          current_year: step2.current_year,
        })
      );
      const data = await registerIntern(formData);
      toast.success("Registration submitted! Please wait for approval.");
      navigate(`/intern/status/${data.intern_id}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden">

        <LeftPanel step={step} />

        {/* Right panel */}
        <div className="bg-white flex-1 flex flex-col">
          <div className="flex-1 px-8 py-7 overflow-y-auto">

            {/* ── STEP 1 ── */}
            {step === 0 && (
              <>
                <h2 className="text-lg font-black text-slate-800 mb-0.5">Personal Information</h2>
                <p className="text-xs text-slate-400 mb-5">Tell us a bit about yourself to get started.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Intern Type <Required /></Label>
                    <select name="intern_type" value={step1.intern_type} onChange={handleStep1Change} className={inputCls(errors1.intern_type)}>
                      <option value="">Select type</option>
                      {INTERN_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <FieldError msg={errors1.intern_type} />
                  </div>
                  <div>
                    <Label>Full Name <Required /></Label>
                    <input name="name" value={step1.name} onChange={handleStep1Change} placeholder="e.g. Ravi Patel" className={inputCls(errors1.name)} />
                    <FieldError msg={errors1.name} />
                  </div>
                  <div>
                    <Label>Email <Required /></Label>
                    <input name="email" type="email" value={step1.email} onChange={handleStep1Change} placeholder="e.g. ravi@email.com" className={inputCls(errors1.email)} />
                    <FieldError msg={errors1.email} />
                  </div>
                  <div>
                    <Label>Mobile <Required /></Label>
                    <input name="mobile" value={step1.mobile} onChange={handleStep1Change} placeholder="10-digit number" maxLength={10} className={inputCls(errors1.mobile)} />
                    <FieldError msg={errors1.mobile} />
                  </div>
                  <div>
                    <Label>Enrollment Number <Required /></Label>
                    <input name="enrollment_no" value={step1.enrollment_no} onChange={handleStep1Change} placeholder="e.g. GTU123456" className={inputCls(errors1.enrollment_no)} />
                    <FieldError msg={errors1.enrollment_no} />
                  </div>
<div>
  <Label>Reference Type</Label>

  <select
    name="reference_type"
    value={step1.reference_type}
    onChange={handleStep1Change}
    className={inputCls(errors1.reference_type)}
  >
    <option value="">Select Reference</option>
    <option value="employee">Employee</option>
    <option value="intern">Intern</option>
    <option value="college">College</option>
    <option value="friend">Friend</option>
    <option value="social_media">Social Media</option>
    <option value="website">Website</option>
    <option value="other">Other</option>
  </select>

  <FieldError msg={errors1.reference_type} />
</div>

{step1.reference_type && (
  <>
    <div>
      <Label>Reference Name</Label>

      <input
        type="text"
        name="reference_name"
        value={step1.reference_name}
        onChange={handleStep1Change}
        className={inputCls(errors1.reference_name)}
        placeholder={
          REFERENCE_PLACEHOLDERS[step1.reference_type] ||
          "Reference Name"
        }
      />

      <FieldError msg={errors1.reference_name} />
    </div>

    <div>
      <Label>Reference Contact</Label>

      <input
        type="text"
        name="reference_contact"
        value={step1.reference_contact}
        onChange={handleStep1Change}
        className={inputCls(errors1.reference_contact)}
        placeholder="Mobile Number or Email (Optional)"
      />

      <FieldError msg={errors1.reference_contact} />
    </div>
  </>
)}
                  <div>
                    <Label>Degree Type <Required /></Label>
                    <select name="degree_type" value={step1.degree_type} onChange={handleStep1Change} className={inputCls(errors1.degree_type)}>
                      <option value="">Select degree</option>
                      {DEGREE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <FieldError msg={errors1.degree_type} />
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 1 && (
              <>
                <h2 className="text-lg font-black text-slate-800 mb-0.5">Documents & College Details</h2>
                <p className="text-xs text-slate-400 mb-5">Upload your ID and provide college information for verification.</p>

                <SectionHead>Identity Verification</SectionHead>
                <div className="mb-3">
                  <Label>ID Proof Type <Required /></Label>
                  <select name="document_type" value={step2.document_type} onChange={handleStep2Change} className={inputCls(errors2.document_type)}>
                    <option value="">Select ID type</option>
                    {DOCUMENT_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <FieldError msg={errors2.document_type} />
                </div>
                <UploadDropzone
                  file={step2.id_proof}
                  onChange={handleFileChange("id_proof")}
                  error={errors2.id_proof}
                />

                <SectionHead>Other Documents</SectionHead>
                <div className="grid grid-cols-3 gap-3">
                  <UploadCard
                    label="Photo"
                    icon="📷"
                    accept="image/*"
                    file={step2.photo}
                    onChange={handleFileChange("photo")}
                    error={errors2.photo}
                  />
                  <UploadCard
                    label="Resume"
                    icon="📄"
                    accept=".pdf,.doc,.docx"
                    file={step2.resume}
                    onChange={handleFileChange("resume")}
                    optional
                  />
                  <UploadCard
                    label="Marksheet"
                    icon="📋"
                    accept=".pdf,image/*"
                    file={step2.last_sem_marksheet}
                    onChange={handleFileChange("last_sem_marksheet")}
                    optional
                  />
                </div>

                <SectionHead>Academic Institution</SectionHead>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>College Name <Required /></Label>
                    <input name="college_name" value={step2.college_name} onChange={handleStep2Change} placeholder="e.g. Gujarat Technological University" className={inputCls(errors2.college_name)} />
                    <FieldError msg={errors2.college_name} />
                  </div>
                  <div className="col-span-2">
                    <Label>College Address <Required /></Label>
                    <input name="college_address" value={step2.college_address} onChange={handleStep2Change} placeholder="e.g. Chandkheda, Ahmedabad" className={inputCls(errors2.college_address)} />
                    <FieldError msg={errors2.college_address} />
                  </div>
                  <div>
                    <Label>Branch / Degree <Required /></Label>
                    <input name="branch" value={step2.branch} onChange={handleStep2Change} placeholder="e.g. Computer Engineering" className={inputCls(errors2.branch)} />
                    <FieldError msg={errors2.branch} />
                  </div>
                  <div>
                    <Label>Current Year / Sem <Required /></Label>
                    <input name="current_year" value={step2.current_year} onChange={handleStep2Change} placeholder="e.g. 3rd Year / Sem 6" className={inputCls(errors2.current_year)} />
                    <FieldError msg={errors2.current_year} />
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3 ── */}
            {step === 2 && (
              <>
                <h2 className="text-lg font-black text-slate-800 mb-0.5">Final Review</h2>
                <p className="text-xs text-slate-400 mb-5">
                  Confirm all details before submitting. You won't be able to edit after submission.
                </p>

                <ReviewSection title="Personal Information" icon="👤" onEdit={() => setStep(0)}>
                  <ReviewGrid items={[
                    ["Intern Type", formatLabel(step1.intern_type)],
                    ["Full Name", step1.name],
                    ["Email", step1.email],
                    ["Mobile", step1.mobile],
                    ["Enrollment No.", step1.enrollment_no],
                    ["Degree Type", formatLabel(step1.degree_type)],
                  ]} />
                </ReviewSection>

                <ReviewSection title="College Details" icon="🎓" onEdit={() => setStep(1)}>
                  <ReviewGrid items={[
                    ["College", step2.college_name, true],
                    ["Branch", step2.branch],
                    ["Current Year", step2.current_year],
                    ["Address", step2.college_address, true],
                  ]} />
                </ReviewSection>

                <ReviewSection title="Uploaded Documents" icon="📎" onEdit={() => setStep(1)}>
                  {step2.id_proof && (
                    <FileItem
                      name={step2.id_proof.name}
                      sub={formatLabel(step2.document_type)}
                      icon="📄"
                    />
                  )}
                  {step2.photo && (
                    <FileItem name={step2.photo.name} sub="Profile Photo" icon="📷" />
                  )}
                  {step2.resume && (
                    <FileItem name={step2.resume.name} sub="Resume" icon="📋" />
                  )}
                  {step2.last_sem_marksheet && (
                    <FileItem
                      name={step2.last_sem_marksheet.name}
                      sub="Last Semester Marksheet"
                      icon="📋"
                    />
                  )}
                </ReviewSection>

                <div className="border-l-4 border-[#132ea7] bg-indigo-50 rounded-r-xl px-4 py-3 mt-4">
                  <p className="text-xs text-indigo-800 leading-relaxed">
                    By submitting, you confirm that all information provided is accurate and complete.
                    Applications cannot be edited after submission.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-7 pt-4 border-t border-slate-100 flex gap-3">
            {step > 0 ? (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition disabled:opacity-50"
              >
                ← Back
              </button>
            ) : (
              <div className="flex-1" />
            )}
            {step < 2 ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-xs uppercase tracking-widest hover:bg-[#0f2490] transition"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-[#e98937] text-white font-black text-xs uppercase tracking-widest hover:bg-[#d4782a] transition disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Application →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternRegister;