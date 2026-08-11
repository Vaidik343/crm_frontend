// src/features/interns/pages/public/InternRegister.jsx

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIntern } from "../../../../context/InternContext";
import toast from "react-hot-toast";
import {
  MdCloudUpload,
  MdPhotoCamera,
  MdDescription,
  MdAssignment,
  MdCheck,
  MdEdit,
  MdPerson,
  MdSchool,
  MdAttachFile,
  MdInfo,
  MdArrowForward,
  MdArrowBack,
  MdPriorityHigh,
  MdRemove,
} from "react-icons/md";

import loginBg from "../../../../assets/login.png";

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
  { label: "NOC", value: "noc" },
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
  noc: null,
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
  <label className="block text-xs font-bold text-slate-500 mb-1.5">
    {children}
  </label>
);

const Required = () => <span className="text-red-400 ml-0.5">*</span>;
const FieldError = ({ msg }) =>
  msg ? (
    <p className="text-[11px] text-red-500 font-semibold mt-1">{msg}</p>
  ) : null;

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border-[1.5px] text-sm text-slate-800 font-medium bg-white transition focus:outline-none focus:border-[#132ea7] ${
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
        className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
          error
            ? "border-red-400 bg-red-50"
            : file
              ? "border-[#132ea7] bg-[#f0f3ff]"
              : "border-indigo-200 bg-[#f8f9ff] hover:border-[#132ea7] hover:bg-[#eef0ff]"
        }`}
      >
        <MdCloudUpload className="text-3xl sm:text-4xl mb-1 text-[#132ea7]" />
        {file ? (
          <>
            <p className="text-xs sm:text-sm font-bold text-[#132ea7] break-all">
              {file.name}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click to change file
            </p>
          </>
        ) : (
          <>
            <p className="text-xs sm:text-sm font-bold text-slate-700">
              Click to upload
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              PDF, PNG or JPG (max. 5MB)
            </p>
          </>
        )}
      </div>
      <FieldError msg={error} />
    </div>
  );
};

// ── Upload Mini Card (Photo / Resume / Marksheet) ─────────────────────────────

const UploadCard = ({
  label,
  optional,
  accept,
  file,
  onChange,
  error,
  icon: Icon,
}) => {
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
        className={`border-2 border-dashed rounded-xl p-3.5 sm:p-4 text-center cursor-pointer transition flex flex-col items-center justify-center ${
          file
            ? "border-[#132ea7] border-solid bg-[#f0f3ff]"
            : "border-slate-200 bg-slate-50 hover:border-[#132ea7] hover:bg-[#f0f3ff]"
        }`}
      >
        <div
          className={`text-xl sm:text-2xl mb-1 ${file ? "text-[#132ea7]" : "text-slate-400"}`}
        >
          {Icon}
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
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
      {children}
    </p>
  </div>
);

// ── Left panel (Desktop Only) ──────────────────────────────────────────────────

const LeftPanel = ({ step }) => (
  <div className="hidden lg:flex bg-[#132ea7] w-[35%] xl:w-[32%] shrink-0 p-8 flex-col justify-between h-full">
    <div>
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-8">
        <img
          src="/Bluebell-Logo.webp"
          alt="Bluebell Logo"
          className="h-9 w-auto object-contain bg-white rounded-lg p-1 shrink-0"
        />
        <span className="text-white font-black text-sm uppercase tracking-wide">
          Intern Portal
        </span>
      </div>

      <p className="text-white font-black text-xl leading-snug mb-1">
        Start your journey with BBCSPL
      </p>
      <p className="text-white/60 text-xs leading-relaxed mb-8">
        Complete the registration form to apply for an internship or trainee
        position.
      </p>

      {/* Vertical stepper */}
      <div className="flex flex-col gap-0">
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
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mb-6 ${
                idx < step
                  ? "bg-[#e98937] text-white"
                  : idx === step
                    ? "bg-white text-[#132ea7]"
                    : "bg-white/15 text-white/50"
              }`}
            >
              {idx < step ? <MdCheck size={16} /> : idx + 1}
            </div>
            <div className="pt-0.5">
              <p
                className={`text-xs font-black uppercase tracking-widest ${
                  idx === step ? "text-white" : "text-white/50"
                }`}
              >
                {s.label}
              </p>
              <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
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
    if (!step2.document_type)
      e.document_type = "Please select an ID proof type.";
    if (!step2.id_proof) e.id_proof = "ID proof file is required.";
    if (!step2.photo) e.photo = "Photo is required.";
    // if (!step2.resume) e.resume = "Resume is required.";
    if (!step2.last_sem_marksheet)
      e.last_sem_marksheet = "Marksheet is required.";
    if (!step2.college_name.trim())
      e.college_name = "College name is required.";
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
      if (step2.noc) formData.append("noc", step2.noc);
      if (step2.last_sem_marksheet)
        formData.append("last_sem_marksheet", step2.last_sem_marksheet);
      formData.append(
        "college_detail",
        JSON.stringify({
          college_name: step2.college_name,
          college_address: step2.college_address,
          branch: step2.branch,
          current_year: step2.current_year,
        }),
      );
      const data = await registerIntern(formData);
      toast.success("Registration submitted! Please wait for approval.");
      navigate(`/intern/status/${data.intern_id}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-100 bg-cover bg-center bg-no-repeat flex items-center justify-center p-2 sm:p-4 lg:p-6 relative overflow-hidden"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" />

      {/* Main Container: Fixed height h-[92vh] sm:h-[90vh] forces accurate overflow calculation */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 h-[92vh] sm:h-[90vh] my-auto">
        {/* Desktop Left Sidebar */}
        <LeftPanel step={step} />

        {/* Form Main Area */}
        <div className="bg-white flex-1 flex flex-col h-full min-h-0 overflow-hidden">
          {/* Mobile & Tablet Header Progress Bar (Hidden on Desktop) */}
          <div className="lg:hidden bg-slate-50 border-b border-slate-100 p-4 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img
                  src="/Bluebell-Logo.webp"
                  alt="Logo"
                  className="h-6 w-auto object-contain bg-white rounded p-0.5 border border-slate-200"
                />
                <span className="font-black text-xs uppercase tracking-wide text-[#132ea7]">
                  Intern Portal
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                Step {step + 1} of 3
              </span>
            </div>

            {/* Mobile Horizontal Progress Indicator */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-[#132ea7] transition-all duration-300 rounded-full"
                style={{ width: `${((step + 1) / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 px-4 py-5 sm:px-8 sm:py-7 overflow-y-auto min-h-0 h-full">
            {/* ── STEP 1 ── */}
            {step === 0 && (
              <>
                <h2 className="text-base sm:text-lg font-black text-slate-800 mb-0.5">
                  Personal Information
                </h2>
                <p className="text-xs text-slate-400 mb-5">
                  Tell us a bit about yourself to get started.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label>
                      Intern Type <Required />
                    </Label>
                    <select
                      name="intern_type"
                      value={step1.intern_type}
                      onChange={handleStep1Change}
                      className={inputCls(errors1.intern_type)}
                    >
                      <option value="">Select type</option>
                      {INTERN_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <FieldError msg={errors1.intern_type} />
                  </div>

                  <div>
                    <Label>
                      Full Name <Required />
                    </Label>
                    <input
                      name="name"
                      value={step1.name}
                      onChange={handleStep1Change}
                      placeholder="e.g. Ravi Patel"
                      className={inputCls(errors1.name)}
                    />
                    <FieldError msg={errors1.name} />
                  </div>

                  <div>
                    <Label>
                      Email <Required />
                    </Label>
                    <input
                      name="email"
                      type="email"
                      value={step1.email}
                      onChange={handleStep1Change}
                      placeholder="e.g. ravi@email.com"
                      className={inputCls(errors1.email)}
                    />
                    <FieldError msg={errors1.email} />
                  </div>

                  <div>
                    <Label>
                      Mobile <Required />
                    </Label>
                    <input
                      name="mobile"
                      value={step1.mobile}
                      onChange={handleStep1Change}
                      placeholder="10-digit number"
                      maxLength={10}
                      className={inputCls(errors1.mobile)}
                    />
                    <FieldError msg={errors1.mobile} />
                  </div>

                  <div>
                    <Label>
                      Enrollment Number <Required />
                    </Label>
                    <input
                      name="enrollment_no"
                      value={step1.enrollment_no}
                      onChange={handleStep1Change}
                      placeholder="e.g. GTU123456"
                      className={inputCls(errors1.enrollment_no)}
                    />
                    <FieldError msg={errors1.enrollment_no} />
                  </div>

                  <div>
                    <Label>
                      Degree Type <Required />
                    </Label>
                    <select
                      name="degree_type"
                      value={step1.degree_type}
                      onChange={handleStep1Change}
                      className={inputCls(errors1.degree_type)}
                    >
                      <option value="">Select degree</option>
                      {DEGREE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <FieldError msg={errors1.degree_type} />
                  </div>

                  <div className="sm:col-span-2">
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
                          maxLength={10}
                          placeholder="Mobile Number or Email (Optional)"
                        />
                        <FieldError msg={errors1.reference_contact} />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 1 && (
              <>
                <h2 className="text-base sm:text-lg font-black text-slate-800 mb-0.5">
                  Documents & College Details
                </h2>
                <p className="text-xs text-slate-400 mb-5">
                  Upload your ID and provide college information for
                  verification.
                </p>

                <SectionHead>Identity Verification</SectionHead>
                <div className="mb-3">
                  <Label>
                    ID Proof Type <Required />
                  </Label>
                  <select
                    name="document_type"
                    value={step2.document_type}
                    onChange={handleStep2Change}
                    className={inputCls(errors2.document_type)}
                  >
                    <option value="">Select ID type</option>
                    {DOCUMENT_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={errors2.document_type} />
                </div>

                <UploadDropzone
                  file={step2.id_proof}
                  onChange={handleFileChange("id_proof")}
                  error={errors2.id_proof}
                />

                <SectionHead>Other Documents</SectionHead>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                  <UploadCard
                    label="Photo"
                    icon={<MdPhotoCamera />}
                    accept="image/*"
                    file={step2.photo}
                    onChange={handleFileChange("photo")}
                    error={errors2.photo}
                  />
                  <UploadCard
                    label="Resume"
                    icon={<MdDescription />}
                    accept=".pdf,.doc,.docx"
                    file={step2.resume}
                    onChange={handleFileChange("resume")}
                    // error={errors2.resume}
                    optional
                  />
                  <UploadCard
                    label="Marksheet"
                    icon={<MdAssignment />}
                    accept=".pdf,image/*"
                    file={step2.last_sem_marksheet}
                    onChange={handleFileChange("last_sem_marksheet")}
                    error={errors2.last_sem_marksheet}
                  />

                  <UploadCard
                    label="NOC"
                    icon={<MdAttachFile />}
                    accept=".pdf,.doc,.docx,image/*"
                    file={step2.noc}
                    onChange={handleFileChange("noc")}
                    optional
                  />
                </div>

                <SectionHead>Academic Institution</SectionHead>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <Label>
                      College Name <Required />
                    </Label>
                    <input
                      name="college_name"
                      value={step2.college_name}
                      onChange={handleStep2Change}
                      placeholder="e.g. Gujarat Technological University"
                      className={inputCls(errors2.college_name)}
                    />
                    <FieldError msg={errors2.college_name} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>
                      College Address <Required />
                    </Label>
                    <input
                      name="college_address"
                      value={step2.college_address}
                      onChange={handleStep2Change}
                      placeholder="e.g. Chandkheda, Ahmedabad"
                      className={inputCls(errors2.college_address)}
                    />
                    <FieldError msg={errors2.college_address} />
                  </div>
                  <div>
                    <Label>
                      Branch / Degree <Required />
                    </Label>
                    <input
                      name="branch"
                      value={step2.branch}
                      onChange={handleStep2Change}
                      placeholder="e.g. Computer Engineering"
                      className={inputCls(errors2.branch)}
                    />
                    <FieldError msg={errors2.branch} />
                  </div>
                  <div>
                    <Label>
                      Current Year / Sem <Required />
                    </Label>
                    <input
                      name="current_year"
                      value={step2.current_year}
                      onChange={handleStep2Change}
                      placeholder="e.g. 3rd Year / Sem 6"
                      className={inputCls(errors2.current_year)}
                    />
                    <FieldError msg={errors2.current_year} />
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3 ── */}
            {step === 2 && (
              <>
                <h2 className="text-base sm:text-lg font-black text-slate-800 mb-0.5">
                  Final Review
                </h2>
                <p className="text-xs text-slate-400 mb-5">
                  Confirm all details before submitting. You won't be able to
                  edit after submission.
                </p>

                {/* Personal Info Summary */}
                <div className="mb-4 border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <MdPerson className="text-slate-500 text-lg" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Personal Information
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(0)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#132ea7] hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition"
                    >
                      <MdEdit size={14} /> Edit
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      ["Intern Type", formatLabel(step1.intern_type)],
                      ["Full Name", step1.name],
                      ["Email", step1.email],
                      ["Mobile", step1.mobile],
                      ["Enrollment No.", step1.enrollment_no],
                      ["Degree Type", formatLabel(step1.degree_type)],
                      ...(step1.reference_type
                        ? [
                            [
                              "Reference Type",
                              formatLabel(step1.reference_type),
                            ],
                            ["Reference Name", step1.reference_name || "—"],
                            [
                              "Reference Contact",
                              step1.reference_contact || "—",
                            ],
                          ]
                        : []),
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-4 px-4 sm:px-5 py-2.5 sm:py-3"
                      >
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 shrink-0">
                          {label}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-700 sm:text-right break-all">
                          {val || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* College Details Summary */}
                <div className="mb-4 border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <MdSchool className="text-slate-500 text-lg" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        College Details
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#132ea7] hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition"
                    >
                      <MdEdit size={14} /> Edit
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      ["College Name", step2.college_name],
                      ["Address", step2.college_address],
                      ["Branch", step2.branch],
                      ["Current Year", step2.current_year],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-4 px-4 sm:px-5 py-2.5 sm:py-3"
                      >
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 shrink-0">
                          {label}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-700 sm:text-right break-all">
                          {val || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uploaded Documents Summary */}
                <div className="mb-4 border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <MdAttachFile className="text-slate-500 text-lg" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Uploaded Documents
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#132ea7] hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition"
                    >
                      <MdEdit size={14} /> Edit
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      {
                        file: step2.id_proof,
                        label: "ID Proof",
                        sub: formatLabel(step2.document_type),
                        icon: <MdDescription className="text-slate-500" />,
                        required: true,
                      },
                      {
                        file: step2.photo,
                        label: "Profile Photo",
                        sub: "Image file",
                        icon: <MdPhotoCamera className="text-slate-500" />,
                        required: true,
                      },
                      {
                        file: step2.resume,
                        label: "Resume",
                        sub: "PDF / DOC",
                        icon: <MdAssignment className="text-slate-500" />,
                        required: false,
                      },
                      {
                        file: step2.last_sem_marksheet,
                        label: "Last Sem Marksheet",
                        sub: "PDF / Image",
                        icon: <MdAssignment className="text-slate-500" />,
                        required: false,
                      },
                      {
  file: step2.noc,
  label: "NOC",
  sub: "PDF / Image",
  icon: <MdAttachFile className="text-slate-500" />,
  required: false,
},
                    ].map(({ file, label, sub, icon, required }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3"
                      >
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs sm:text-sm shrink-0 ${
                            file ? "bg-indigo-50" : "bg-slate-50"
                          }`}
                        >
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs sm:text-sm font-bold truncate ${
                              file ? "text-slate-800" : "text-slate-400"
                            }`}
                          >
                            {file ? file.name : label}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {file
                              ? sub
                              : required
                                ? "Required — not uploaded"
                                : "Optional — not uploaded"}
                          </p>
                        </div>
                        {file ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                            <MdCheck size={14} />
                          </span>
                        ) : required ? (
                          <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold shrink-0">
                            <MdPriorityHigh size={12} />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs shrink-0">
                            <MdRemove size={14} />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer Box */}
                <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 sm:px-5 py-3.5 mt-2">
                  <MdInfo className="text-[#132ea7] text-base sm:text-lg shrink-0 mt-0.5" />
                  <p className="text-[11px] sm:text-xs text-indigo-800 leading-relaxed font-medium">
                    By submitting, you confirm that all information provided is
                    accurate and complete.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Sticky Form Footer */}
          <div className="px-4 py-3.5 sm:px-8 sm:pb-7 sm:pt-4 border-t border-slate-100 flex gap-2 sm:gap-3 shrink-0 bg-white">
            {step > 0 ? (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-slate-50 transition disabled:opacity-50"
              >
                <MdArrowBack size={16} /> Back
              </button>
            ) : (
              <div className="hidden sm:block flex-1" />
            )}

            {step < 2 ? (
              <button
                onClick={handleNext}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl bg-[#132ea7] text-white font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-[#0f2490] transition shadow-sm"
              >
                Next <MdArrowForward size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl bg-[#e98937] text-white font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-[#d4782a] transition disabled:opacity-60 shadow-sm"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Application <MdArrowForward size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternRegister;
