import { useCallback, useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useRole } from "../../context/RoleContext";
import { usePassword } from "../../context/PasswordContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import ExportModal from "../../components/ui/ExportModal";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdLockReset,
  MdContentCopy,
  MdCheckCircle,
  MdPerson,
  MdMail,
  MdAssignmentInd,
  MdPhone,
  MdDownload,
  MdCalendarToday 
} from "react-icons/md";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from './../../api/endpoints';
import { useNavigate } from "react-router-dom";

import { useLeave } from "../../context/LeaveContext";
import { formatDate } from "../../utils/formatDate";
import { useProbation } from "../../context/ProbationContext";





const initialForm = {
  employee_id: "", 
   name: "",
   email: "",
   mobile:"",
  role_id: "" };

const Employees = () => {
  const { users, loading, setLoading, getAllUsers, createUser, updateUser, deleteUser } =
    useUser();
  const { roles, getAllRoles } = useRole();
  const { resetPassword } = usePassword();

  const navigate = useNavigate();

  const { startProbation, passProbation, terminateProbation, updateProbationDates  } = useProbation();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
const [exportTarget, setExportTarget] = useState(null);

const {  getWorkedSaturdays, markWorkedSaturday} = useLeave();

const [saturdayTarget, setSaturdayTarget] = useState(null);
const [saturdays, setSaturdays] = useState([]);
const [saturdaysLoading, setSaturdaysLoading] = useState(false);
const [saturdayDate,     setSaturdayDate]     = useState("");
const [saturdayError, setSaturdayError] = useState("");
const [markingSaturday, setMarkingSaturday] = useState(false);
const [saturdayAlert, setSaturdayAlert] = useState({type:"", message:""});


const [probationTarget, setProbationTarget] = useState(null);
const [probationForm, setProbationForm]     = useState({ probation_start: "", probation_end: "" });
const [probationErrors, setProbationErrors] = useState({});
const [startingProbation, setStartingProbation] = useState(false);


  useEffect(() => {
    getAllUsers();
    getAllRoles();
  }, []);

  const fetchSaturdays = async () => {
    setSaturdaysLoading(true);
    try {
      const res = await getWorkedSaturdays(saturdayTarget.id);
      console.log("🚀 ~ fetchSaturdays ~ res:", res)
      setSaturdays(res.saturdays || []);
    } catch (error) {
      setSaturdays([]);
    } finally {
        setSaturdaysLoading(false);
    }
  }
 
  useEffect(() => {
    fetchSaturdays();
  }, [saturdayTarget?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";

  const digitsOnly = (form.mobile || "").replace(/\D/g, "");
const isValid = digitsOnly.length === 10 || (digitsOnly.length === 12 && digitsOnly.startsWith("91"));
if (!isValid) {
  errors.mobile = "Enter a valid 10-digit mobile number (with or without +91)";
}

  if (!form.role_id) errors.role_id = "Role is required";
  if (form.email && !/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Invalid email";
  return errors;
};

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setCredentials(null);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setForm({
      name: user.name,
      email: user.email || "",
      employee_id: user.employee_id || "",
      mobile:user.mobile,
      role_id: user.role_id || "",
    });
    setFieldErrors({});
    setCredentials(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateUser(editTarget.id, form);
        setAlert({ type: "success", message: "Profile updated successfully" });
        closeModal();
      } else {
        const res = await createUser(form);
        // show generated credentials inside modal
        setCredentials(res.credentials);
        setAlert({
          type: "success",
          message: "New Employee created successfully",
        });
      }
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Operation failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteUser(confirmDelete.id);
      setAlert({ type: "success", message: "Employee record deleted" });
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Purge failed",
      });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleResetPassword = async (user) => {
    try {
      setResetting(user.id);
      const res = await resetPassword(user.id);
      setCredentials(res.credentials);
      setShowModal(true);
      setAlert({ type: "success", message: "Access code reset complete" });
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Reset failed",
      });
    } finally {
      setResetting(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


 
  const handleMarkSaturday = async () => {
  setSaturdayError("");

  if (!saturdayDate) {
    setSaturdayError("Please select a date.");
    return;
  }

  const day = new Date(saturdayDate).getDay();
  if (day !== 6) {
    setSaturdayError("Selected date must be a Saturday.");
    return;
  }

  try {
    setMarkingSaturday(true);
   const ms =  await markWorkedSaturday({
      user_id:       saturdayTarget.id,
      saturday_date: saturdayDate,
    });
    console.log("🚀 ~ handleMarkSaturday ~ ms:", ms)
    setSaturdayAlert({ type: "success", message: "Saturday marked as worked." });
    setSaturdayDate("");
    // refresh list
    const res = await getWorkedSaturdays(saturdayTarget.id);
    console.log("🚀 ~ handleMarkSaturday ~ res:", res)
    setSaturdays(res.saturdays || []);
  } catch (err) {
    setSaturdayAlert({
      type:    "danger",
      message: err?.response?.data?.message || "Failed to mark Saturday.",
      
    });
     console.log("🚀 ~ handleMarkSaturday ~ err:", err)
  } finally {
    setMarkingSaturday(false);
  }
};


const inputCls = (err) =>
  `w-full px-4 py-3 rounded-2xl border text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 ${
    err ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
  }`;
const labelCls = "block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1";
const errCls   = "text-xs text-red-500 font-bold mt-1 ml-1 uppercase";


  if (loading && !users.length)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-slate-400 font-medium animate-pulse">
          Syncing  records...
        </p>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            Team <span className="text-[#132ea7]">Management</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">
            Manage your workforce and access levels ({users.length} total)
          </p>
        </div>
        <Button
          variant="primary"
          className="shadow-lg shadow-[#132ea7]/20 py-3 px-8 rounded h-[52px] font-black uppercase tracking-widest text-sm"
          onClick={openCreate}
        >
          <MdAdd size={22} />
          Add New Employee
        </Button>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Desktop Table Container */}
      <div className="hidden md:block bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Employee Info
                </th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Role
                </th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Access Type
                </th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Contact
                </th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-slate-400 py-16 font-medium italic text-lg"
                  >
                    No active Employees found.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#132ea7]/20">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div
  onClick={() => navigate(`/admin/reports/${user.id}`)}
  className="font-black text-slate-800 text-lg leading-tight cursor-pointer hover:text-[#132ea7] transition-colors"
>
  {user.name}
</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {user.employee_id}
                          </span>

                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <MdAssignmentInd className="text-[#132ea7]" size={20} />
                      <span className="text-sm font-black text-slate-600 uppercase tracking-wider">
                        {user.Role?.name || "Unassigned"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge
                      value={user.role === "admin" ? "admin" : "employee"}
                    />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-[#132ea7] transition-colors cursor-pointer">
                      <MdMail size={18} />
                      {user.email || "—"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-[#132ea7] transition-colors cursor-pointer">
                      <MdPhone size={18} />
                      {user.mobile || "—"}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEdit(user)}
                        title="Edit Profile"
                        className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
                      >
                        <MdEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        title="Reset Password"
                        disabled={resetting === user.id}
                        className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-500/10 hover:text-amber-500 transition-all disabled:opacity-50"
                      >
                        <MdLockReset
                          size={20}
                          className={
                            resetting === user.id ? "animate-spin" : ""
                          }
                        />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(user)}
                        title="Delete Employee"
                        className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                      >
                        <MdDelete size={20} />
                      </button>
                                    <button
  onClick={() => setExportTarget(user)}
  title="Export Activity"
  className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all"
>
  <MdDownload size={18} />
</button>

<button
  onClick={() => {
    setSaturdayTarget(user);
    setSaturdayDate("");
    setSaturdayError("");
    setSaturdayAlert({ type: "", message: "" });
  }}
  title="Worked Saturdays"
  className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
>
  <MdCalendarToday size={20} />
</button>



{!user.is_admin && (
  <button
    onClick={() => {
      setProbationTarget(user);
      setProbationForm({ probation_start: "", probation_end: "" });
      setProbationErrors({});
    }}
    title={user.is_probation ? "Manage Probation" : "Start Probation"}
    className={`p-3 rounded-xl transition-all ${
      user.is_probation
        ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
        : "bg-slate-50 text-slate-400 hover:bg-amber-500/10 hover:text-amber-500"
    }`}
  >
    <MdPerson size={20} />
  </button>
)}


                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {users.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold">
            No active Employees found.
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#132ea7] text-white flex items-center justify-center font-black text-lg shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
               <p
  onClick={() => navigate(`/admin/reports/${user.id}`)}
  className="font-black text-slate-800 leading-tight truncate cursor-pointer hover:text-[#132ea7] transition-colors"
>
  {user.name}
</p>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                    {user.employee_id}
                  </span>
 
                </div>
                <Badge value={user.role === "admin" ? "admin" : "employee"} />
              </div>

              {/* Meta */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Role
                  </span>
                  <div className="flex items-center gap-1.5">
                    <MdAssignmentInd className="text-[#132ea7]" size={14} />
                    <span className="font-bold text-slate-700 text-xs">
                      {user.Role?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Email
                  </span>
                  <div className="flex items-center gap-1.5">
                    <MdMail className="text-slate-400" size={14} />
                    <span className="font-bold text-slate-700 text-xs">
                      {user.email || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MdPhone className="text-slate-400" size={14} />
                    <span className="font-bold text-slate-700 text-xs">
                      {user.mobile || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                       <button
  onClick={() => setExportTarget(user)}
  title="Export Activity"
  className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all"
>
  <MdDownload size={18} />
</button>
<button
  onClick={() => {
    setSaturdayTarget(user);
    setSaturdayDate("");
    setSaturdayError("");
    setSaturdayAlert({ type: "", message: "" });
  }}
  className="flex-1 h-10 rounded-xl bg-[#132ea7]/10 text-[#132ea7] font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/20 transition-all"
>
  <MdCalendarToday size={16} />
</button>
                <button
                  onClick={() => openEdit(user)}
                  className="flex-1 h-10 rounded-xl bg-[#132ea7]/10 text-[#132ea7] font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/20 transition-all"
                >
                  <MdEdit size={16} /> 
                </button>
                <button
                  onClick={() => handleResetPassword(user)}
                  disabled={resetting === user.id}
                  className="flex-1 h-10 rounded-xl bg-amber-50 text-amber-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-amber-100 transition-all disabled:opacity-50"
                >
                  <MdLockReset
                    size={16}
                    className={resetting === user.id ? "animate-spin" : ""}
                  />{" "}
                  
                </button>
                <button
                  onClick={() => setConfirmDelete(user)}
                  className="flex-1 h-10 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-red-100 transition-all"
                >
                  <MdDelete size={16} /> 
                </button>
         
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit / Credentials Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={
          credentials
            ? "Security Authorization"
            : editTarget
              ? "Modify Profile"
              : "Create New Profile"
        }
        size={credentials ? "md" : "lg"}
      >
        {credentials ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-[1.5rem] p-8 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                <MdCheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-black text-emerald-900 text-xl leading-tight">
                  Authorization Successful
                </h4>
                <p className="text-emerald-700/70 text-base mt-1 font-bold">
                  Please share these unique credentials with the Employee
                  immediately.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    ID
                  </span>
                </div>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-14 py-5 font-black text-slate-800 text-2xl tracking-tight">
                  {credentials.employee_id}
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.employee_id)}
                  className="absolute inset-y-3 right-3 px-4 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#132ea7] transition-all shadow-sm hover:border-[#132ea7]"
                >
                  <MdContentCopy size={20} />
                </button>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    PW
                  </span>
                </div>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-14 py-5 font-black text-[#132ea7] text-2xl tracking-tight">
                  {credentials.password}
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.password)}
                  className="absolute inset-y-3 right-3 px-4 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#132ea7] transition-all shadow-sm hover:border-[#132ea7]"
                >
                  <MdContentCopy size={20} />
                </button>
              </div>
            </div>

            <div className="pt-6 flex flex-col gap-4">
              <Button
                variant="primary"
                className="h-16 text-xl font-black rounded-2xl shadow-xl shadow-[#132ea7]/20"
                onClick={() => {
                  copyToClipboard(
                    `Employee ID: ${credentials.employee_id}\nAccess Code: ${credentials.password}`,
                  );
                }}
              >
                {copied
                  ? "Copied All Credentials!"
                  : "Copy Full Access Package"}
              </Button>
              <Button
                variant="ghost"
                onClick={closeModal}
                className="text-slate-400 font-black uppercase tracking-widest text-sm"
              >
                Close Secure Portal
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={fieldErrors.name}
                placeholder="e.g. John Doe"
                required
              />
              <Input
                label="Work Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={fieldErrors.email}
                placeholder="john@example.com"
                required
              />
<Input
  label="Mobile no."
  name="mobile"
  type="text"
  inputMode="numeric"
  value={form.mobile}
  onChange={handleChange}
  error={fieldErrors.mobile}
  placeholder="9911223344"
/>
              {/* <Input
                label="Employee ID (Auto-generated if empty)"
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
                error={fieldErrors.employee_id}
                placeholder="e.g. EMP001"
              /> */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                  Assigned Role
                </label>
                <select
                  name="role_id"
                  value={form.role_id}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${fieldErrors.role_id ? "border-red-500" : "border-slate-100"} rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none`}
                >
                  <option value="">Select Authority Level...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.role_id && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">
                    {fieldErrors.role_id}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-8 border-t border-slate-50">
              <Button
                variant="ghost"
                className="flex-1 font-black uppercase tracking-widest text-sm"
                onClick={closeModal}
                disabled={submitting}
              >
                Abort
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-widest text-sm"
                loading={submitting}
              >
                {editTarget ? "Authorize Update" : "Create Employee"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`This action will permanently purge Employee "${confirmDelete?.name}" from the system archives. This cannot be reversed.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
      <ExportModal
  show={!!exportTarget}
  onClose={() => setExportTarget(null)}
  employee={exportTarget}
/>

{/* ── Worked Saturdays Modal ── */}
<Modal
  show={!!saturdayTarget}
  onClose={() => setSaturdayTarget(null)}
  title="Worked Saturdays"
  size="md"
>
  {saturdayTarget && (
    <div className="space-y-5">

      {/* Employee info */}
      <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
        <div className="w-10 h-10 rounded-full bg-[#132ea7] text-white flex items-center justify-center font-black text-base shrink-0">
          {saturdayTarget.name?.charAt(0)}
        </div>
        <div>
          <p className="font-black text-slate-800">{saturdayTarget.name}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {saturdayTarget.employee_id} 
            {/* — Group {saturdayTarget.saturday_group || "Not Set"} */}
          </p>
        </div>
      </div>

      <Alert
        type={saturdayAlert.type}
        message={saturdayAlert.message}
        onClose={() => setSaturdayAlert({ type: "", message: "" })}
      />

      {/* Mark new saturday */}
      <div className="space-y-3">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
          Mark New Worked Saturday
        </label>
        <div className="flex gap-3 items-start">
          <div className="flex-1 space-y-1">
            <input
              type="date"
              value={saturdayDate}
              onChange={(e) => {
                setSaturdayDate(e.target.value);
                setSaturdayError("");
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 focus:border-[#132ea7] transition-all"
            />
            {saturdayError && (
              <p className="text-red-500 text-[10px] font-bold uppercase ml-1">
                {saturdayError}
              </p>
            )}
          </div>
          <Button
            variant="primary"
            className="h-[46px] px-6 font-black uppercase tracking-widest text-xs shrink-0 rounded-2xl shadow-lg shadow-[#132ea7]/20"
            onClick={handleMarkSaturday}
            loading={markingSaturday}
          >
            Mark
          </Button>
        </div>
        <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">
          Only Saturdays are accepted
        </p>
      </div>

      {/* Existing saturdays list */}
      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
          Worked Saturdays History
        </label>

        {saturdaysLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="sm" />
          </div>
        ) : saturdays.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-6 text-center">
            <p className="text-sm font-bold text-slate-400">
              No worked Saturdays marked yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
            {saturdays.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center">
                    <MdCalendarToday size={16} />
                  </div>
                  <div>
                    <p className="font-black text-slate-700 text-sm">
                      {formatDate(s.saturday_date)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Marked by {s.markedByAdmin?.name || "Admin"}
                    </p>
                  </div>
                </div>
                {s.is_exchanged ? (
                  <span className="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest bg-amber-100 text-amber-600">
                    Exchanged
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest bg-green-100 text-green-600">
                    Available
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-50">
        <Button
          variant="ghost"
          onClick={() => setSaturdayTarget(null)}
          className="font-black uppercase tracking-widest text-xs"
        >
          Close
        </Button>
      </div>
    </div>
  )}
</Modal>
<Modal
  show={!!probationTarget}
  onClose={() => {
    setProbationTarget(null);
    setProbationErrors({});
  }}
  title={
    !probationTarget
      ? ""
      : probationTarget.probation_status === "passed"
      ? "Probation Passed"
      : probationTarget.probation_status === "terminated"
      ? "Probation Terminated"
      : probationTarget.is_probation
      ? "Manage Probation"
      : "Start Probation"
  }
  size="sm"
>
  {probationTarget && (
    <div className="space-y-4">
      {/* Employee Info Card — Always Shown */}
      <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
        <div className="w-10 h-10 rounded-full bg-[#132ea7] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
          {probationTarget.name?.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800 text-sm truncate">
            {probationTarget.name}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {probationTarget.employee_id}
          </p>
        </div>
      </div>

      {/* ── CASE 1: Already passed or terminated ── */}
      {probationTarget.probation_status === "passed" ||
      probationTarget.probation_status === "terminated" ? (
        <div className="space-y-4 pt-1">
          <div
            className={`rounded-2xl p-5 text-center ${
              probationTarget.probation_status === "passed"
                ? "bg-emerald-50/80 border border-emerald-100"
                : "bg-rose-50/80 border border-rose-100"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-black text-lg ${
                probationTarget.probation_status === "passed"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {probationTarget.probation_status === "passed" ? "✓" : "✕"}
            </div>
            <p
              className={`font-extrabold text-xs uppercase tracking-wider ${
                probationTarget.probation_status === "passed"
                  ? "text-emerald-800"
                  : "text-rose-800"
              }`}
            >
              Probation{" "}
              {probationTarget.probation_status === "passed"
                ? "Passed"
                : "Terminated"}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {probationTarget.probation_status === "passed"
                ? "Employee is now a confirmed team member."
                : "Employee account has been deactivated."}
            </p>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <div className="bg-white/80 border border-slate-200/60 rounded-xl p-2.5 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Start
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {formatDate(probationTarget.probation_start)}
                </p>
              </div>
              <div className="bg-white/80 border border-slate-200/60 rounded-xl p-2.5 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  End
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {formatDate(probationTarget.probation_end)}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setProbationTarget(null)}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      ) : probationTarget.is_probation ? (
        /* ── CASE 2: Currently on probation ── */
        <div className="space-y-4">
          {/* Dates & Days Left Card */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Start
              </p>
              <p className="text-xs font-bold text-slate-700">
                {formatDate(probationTarget.probation_start)}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                End
              </p>
              <p className="text-xs font-bold text-slate-700">
                {formatDate(probationTarget.probation_end)}
              </p>
            </div>
            <div
              className={`border rounded-xl p-2.5 text-center ${(() => {
                const days = Math.ceil(
                  (new Date(probationTarget.probation_end) - new Date()) /
                    86400000
                );
                return days <= 7
                  ? "bg-rose-50 border-rose-100"
                  : days <= 14
                  ? "bg-amber-50 border-amber-100"
                  : "bg-emerald-50 border-emerald-100";
              })()}`}
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Days Left
              </p>
              <p
                className={`text-xs font-extrabold ${(() => {
                  const days = Math.ceil(
                    (new Date(probationTarget.probation_end) - new Date()) /
                      86400000
                  );
                  return days <= 7
                    ? "text-rose-600"
                    : days <= 14
                    ? "text-amber-600"
                    : "text-emerald-600";
                })()}`}
              >
                {Math.max(
                  0,
                  Math.ceil(
                    (new Date(probationTarget.probation_end) - new Date()) /
                      86400000
                  )
                )}
                d
              </p>
            </div>
          </div>

          {/* Edit Dates Accordion */}
          <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() =>
                setProbationForm((p) => ({
                  ...p,
                  showEditDates: !p.showEditDates,
                }))
              }
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              <span>Edit Probation Dates</span>
              <span className="text-[10px] text-slate-400">
                {probationForm.showEditDates ? "▲" : "▼"}
              </span>
            </button>

            {probationForm.showEditDates && (
              <div className="px-3.5 pb-3.5 pt-2 space-y-3 border-t border-slate-100 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelCls}>New Start Date</label>
                    <input
                      type="date"
                      value={
                        probationForm.edit_start ||
                        probationTarget.probation_start ||
                        ""
                      }
                      onChange={(e) =>
                        setProbationForm((p) => ({
                          ...p,
                          edit_start: e.target.value,
                        }))
                      }
                      className={inputCls(false)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>New End Date</label>
                    <input
                      type="date"
                      value={
                        probationForm.edit_end ||
                        probationTarget.probation_end ||
                        ""
                      }
                      onChange={(e) =>
                        setProbationForm((p) => ({
                          ...p,
                          edit_end: e.target.value,
                        }))
                      }
                      className={inputCls(false)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={startingProbation}
                  onClick={async () => {
                    if (!probationForm.edit_start && !probationForm.edit_end) {
                      toast.error("Change at least one date.");
                      return;
                    }
                    try {
                      setStartingProbation(true);
                      await updateProbationDates(probationTarget.id, {
                        probation_start:
                          probationForm.edit_start || undefined,
                        probation_end: probationForm.edit_end || undefined,
                      });
                      await getAllUsers();
                      toast.success("Probation dates updated.");
                      setProbationForm((p) => ({
                        ...p,
                        showEditDates: false,
                        edit_start: "",
                        edit_end: "",
                      }));
                      setProbationTarget((prev) => ({
                        ...prev,
                        probation_start:
                          probationForm.edit_start || prev.probation_start,
                        probation_end:
                          probationForm.edit_end || prev.probation_end,
                      }));
                    } catch (err) {
                      toast.error(
                        err?.response?.data?.message ||
                          "Failed to update dates."
                      );
                    } finally {
                      setStartingProbation(false);
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-[#132ea7] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#0f2490] transition disabled:opacity-60"
                >
                  {startingProbation ? "Saving..." : "Save Dates"}
                </button>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="space-y-3 pt-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Actions
            </p>

            {/* Option 1: Pass Card */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  Confirm Employee
                </p>
                <p className="text-[11px] text-emerald-700/80 font-medium">
                  Pass probation and promote to full team member.
                </p>
              </div>
              <button
                disabled={startingProbation}
                onClick={async () => {
                  try {
                    setStartingProbation(true);
                    await passProbation(probationTarget.id);
                    await getAllUsers();
                    toast.success(
                      `${probationTarget.name} has passed probation.`
                    );
                    setProbationTarget(null);
                    setProbationErrors({});
                  } catch (err) {
                    toast.error(err?.response?.data?.message || "Failed.");
                  } finally {
                    setStartingProbation(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition disabled:opacity-60 shadow-sm shrink-0"
              >
                {startingProbation ? "Processing..." : "✓ Pass Probation"}
              </button>
            </div>

            {/* Option 2: Terminate Card */}
            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2.5">
              <div>
                <p className="text-xs font-bold text-rose-950">
                  Terminate Probation
                </p>
                <p className="text-[11px] text-rose-700/80 font-medium">
                  Provide a mandatory reason to deactivate account.
                </p>
              </div>

              <textarea
                value={probationForm.terminate_reason || ""}
                onChange={(e) => {
                  setProbationForm((p) => ({
                    ...p,
                    terminate_reason: e.target.value,
                  }));
                  if (probationErrors.terminate_reason)
                    setProbationErrors((p) => ({
                      ...p,
                      terminate_reason: "",
                    }));
                }}
                rows={2}
                placeholder="Termination reason..."
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:border-rose-400 ${
                  probationErrors.terminate_reason
                    ? "border-rose-300 bg-rose-50/30"
                    : "border-slate-200"
                }`}
              />
              {probationErrors.terminate_reason && (
                <p className={errCls}>{probationErrors.terminate_reason}</p>
              )}

              <button
                disabled={startingProbation}
                onClick={async () => {
                  if (
                    !probationForm.terminate_reason?.trim() ||
                    probationForm.terminate_reason.trim().length < 5
                  ) {
                    setProbationErrors((p) => ({
                      ...p,
                      terminate_reason: "Reason required (min 5 chars).",
                    }));
                    return;
                  }
                  try {
                    setStartingProbation(true);
                    await terminateProbation(
                      probationTarget.id,
                      probationForm.terminate_reason.trim()
                    );
                    await getAllUsers();
                    toast.success(
                      `${probationTarget.name} has been terminated.`
                    );
                    setProbationTarget(null);
                    setProbationErrors({});
                  } catch (err) {
                    toast.error(err?.response?.data?.message || "Failed.");
                  } finally {
                    setStartingProbation(false);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition disabled:opacity-60 shadow-sm"
              >
                {startingProbation
                  ? "Processing..."
                  : "✕ Terminate Account"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setProbationTarget(null);
              setProbationErrors({});
            }}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      ) : (
        /* ── CASE 3: Not on probation → start form ── */
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const errs = {};
            if (!probationForm.probation_start) errs.probation_start = "Required.";
            if (!probationForm.probation_end) errs.probation_end = "Required.";
            else if (
              probationForm.probation_start >= probationForm.probation_end
            )
              errs.probation_end = "Must be after start date.";
            setProbationErrors(errs);
            if (Object.keys(errs).length) return;
            try {
              setStartingProbation(true);
              await startProbation(probationTarget.id, probationForm);
              await getAllUsers();
              toast.success(`${probationTarget.name} placed on probation.`);
              setProbationTarget(null);
              setProbationErrors({});
            } catch (err) {
              toast.error(err?.response?.data?.message || "Failed.");
            } finally {
              setStartingProbation(false);
            }
          }}
          className="space-y-4 pt-1"
        >
          <div>
            <label className={labelCls}>
              Start Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={probationForm.probation_start}
              onChange={(e) =>
                setProbationForm((p) => ({
                  ...p,
                  probation_start: e.target.value,
                }))
              }
              className={inputCls(probationErrors.probation_start)}
            />
            {probationErrors.probation_start && (
              <p className={errCls}>{probationErrors.probation_start}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>
              End Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={probationForm.probation_end}
              onChange={(e) =>
                setProbationForm((p) => ({
                  ...p,
                  probation_end: e.target.value,
                }))
              }
              className={inputCls(probationErrors.probation_end)}
            />
            {probationErrors.probation_end && (
              <p className={errCls}>{probationErrors.probation_end}</p>
            )}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setProbationTarget(null);
                setProbationErrors({});
              }}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={startingProbation}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-600 transition disabled:opacity-60 shadow-sm"
            >
              {startingProbation ? "Starting..." : "Start Probation"}
            </button>
          </div>
        </form>
      )}
    </div>
  )}
</Modal>
    </div>
  );
};

export default Employees;
