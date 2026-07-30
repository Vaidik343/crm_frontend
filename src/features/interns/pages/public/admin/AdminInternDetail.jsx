// src/pages/admin/AdminInternDetail.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useIntern } from '../../../../../context/InternContext';
import api from "../../../../../api/axiosInstance";
import { ENDPOINTS } from "../../../../../api/endpoints";
import toast from "react-hot-toast";
import LocalSearchableSelect from "../../../../../components/ui/LocalSearchableSelect";
import {
  MdArrowBack, MdClose, MdPerson, MdFolder,
  MdTask, MdBook, MdSearch, MdContentCopy,
  MdCheck,
} from "react-icons/md";
import { formatDate } from "../../../../../utils/formatDate";


// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  pending:   "bg-amber-100 text-amber-700",
  approved:  "bg-blue-100 text-blue-700",
  active:    "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-700",
  completed: "bg-slate-100 text-slate-500",
};

const TASK_STATUS_COLORS = {
  open:    "bg-blue-100 text-blue-700",
  ongoing: "bg-amber-100 text-amber-700",
  hold:    "bg-slate-100 text-slate-600",
  closed:  "bg-green-100 text-green-700",
};

const TABS = ["Documents", "Project", "Tasks", "Work Logs"];

// ── Helpers ────────────────────────────────────────────────────────────────────

const FileLink = ({ label, url }) => {
  const API_BASE =
    import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:7015";

  const fileUrl = url
    ? url.startsWith("http")
      ? url
      : `${API_BASE}${url}`
    : "";

  if (!url) {
    return (
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="text-xs text-slate-300 font-semibold mt-0.5 italic">
          Not uploaded
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-black text-[#132ea7] hover:underline uppercase tracking-widest mt-0.5 inline-block"
      >
        View File →
      </a>
    </div>
  );
};

const getMemberLabel = (u) => `${u.name} (${u.employee_id})`;


const MentorChips = ({ mentors }) => {
  if (!mentors || mentors.length === 0) {
    return <p className="text-sm text-slate-400 font-medium italic">Not assigned</p>;
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

const AdminInternDetail = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const {
    getInternById,
    approveIntern, rejectIntern, extendInternship,
    deactivateIntern: deactivateInternFn,
    regenerateSetupToken,
    adminAssignTask,
    getInternTasks,
    getInternWorkLogs,
    getInternProject,
    adminUpdateProject,
  } = useIntern();

  // ── Core data ──────────────────────────────────────────────────────────────
  const [intern, setIntern]         = useState(null);


  const [loading, setLoading]       = useState(true);

  // ── Tab ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]   = useState("Documents");

  // ── Users list (for mentor dropdown) ──────────────────────────────────────
  const [users, setUsers]           = useState([]);

  // ── Tab data ───────────────────────────────────────────────────────────────
  const [project, setProject]               = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);

  const [tasks, setTasks]                   = useState([]);
  const [tasksLoading, setTasksLoading]     = useState(false);
  const [tasksTotal, setTasksTotal]         = useState(0);
  const [tasksPage, setTasksPage]           = useState(1);
  const [tasksTotalPages, setTasksTotalPages] = useState(1);
  const [taskStatusFilter, setTaskStatusFilter] = useState("");

  const [workLogs, setWorkLogs]             = useState([]);
  const [workLogsLoading, setWorkLogsLoading] = useState(false);
  const [workLogsTotal, setWorkLogsTotal]   = useState(0);
  const [workLogsPage, setWorkLogsPage]     = useState(1);
  const [workLogsTotalPages, setWorkLogsTotalPages] = useState(1);
  const [wlFrom, setWlFrom]                 = useState("");
  const [wlTo, setWlTo]                     = useState("");

  // ── Modals ─────────────────────────────────────────────────────────────────

  // Approve
  const [showApprove, setShowApprove]   = useState(false);
  const [approveForm, setApproveForm]   = useState({ start_date: "", end_date: "", mentor_ids: [] });

  const [selectedApproveMentorIds, setSelectedApproveMentorIds] = useState([]);

  const [approveErrors, setApproveErrors] = useState({});
  const [approving, setApproving]       = useState(false);

  // Reject
  const [showReject, setShowReject]     = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError]   = useState("");
  const [rejecting, setRejecting]       = useState(false);

  // Extend
  const [showExtend, setShowExtend]     = useState(false);
  const [extendDate, setExtendDate]     = useState("");
  const [extendError, setExtendError]   = useState("");
  const [extending, setExtending]       = useState(false);

  // Deactivate confirm
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [deactivating, setDeactivating]     = useState(false);

  // Regenerate token
  const [showRegen, setShowRegen]       = useState(false);
  const [regenToken, setRegenToken]     = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [copied, setCopied]             = useState(false);

  // Assign task
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [taskForm, setTaskForm]             = useState({
    task: "", description: "", intern_project_id: "", due_date: "", remark: "",
  });
  const [taskFormErrors, setTaskFormErrors] = useState({});
  const [assigningTask, setAssigningTask]   = useState(false);

  // Update mentor
  const [showMentor, setShowMentor]     = useState(false);
  const [mentorId, setMentorId]         = useState("");
  const [updatingMentor, setUpdatingMentor] = useState(false);


  const [showAdminEdit, setShowAdminEdit]   = useState(false);
const [adminEditForm, setAdminEditForm]   = useState({});
const [adminEditErrors, setAdminEditErrors] = useState({});
const [adminEditing, setAdminEditing]     = useState(false);
// mentor_ids multi-select state
const [selectedMentorIds, setSelectedMentorIds] = useState([]);
// project mentor_ids
const [selectedProjectMentorIds, setSelectedProjectMentorIds] = useState([]);



const [verifying, setVerifying] = useState(false);
console.log("🚀 ~ AdminInternDetail ~ verifying:", verifying)



  // ── Fetch intern ───────────────────────────────────────────────────────────
  const fetchIntern = async () => {
    try {
      setLoading(true);
      const data = await getInternById(id);
      console.log("🚀 ~ fetchIntern ~ data:", data)
      
      setIntern(data.intern || data);
    } catch {
      toast.error("Failed to load intern.");
      navigate("/admin/interns");
    } finally {
      setLoading(false);
    }
  };



  // ── Fetch users for mentor dropdown ───────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const { data } = await api.get(ENDPOINTS.USERS.ALL);
      setUsers(data.users || []);
    } catch {
      // silent — mentor dropdown just won't populate
    }
  };

  // ── Tab fetchers ───────────────────────────────────────────────────────────
  const fetchProject = async () => {
    try {
      setProjectLoading(true);
      const data = await getInternProject(id);
      setProject(data.project || null);
    } catch {
      setProject(null);
    } finally {
      setProjectLoading(false);
    }
  };

  const fetchTasks = async (page = 1, status = "") => {
    try {
      setTasksLoading(true);
      const data = await getInternTasks(id, page, status);
      setTasks(data.tasks || []);
      setTasksTotal(data.total || 0);
      setTasksPage(data.page || 1);
      setTasksTotalPages(data.totalPages || 1);
    } catch {
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchWorkLogs = async (page = 1, from = "", to = "") => {
    try {
      setWorkLogsLoading(true);
      const data = await getInternWorkLogs(id, page, from, to);
      setWorkLogs(data.worklogs || []);
      setWorkLogsTotal(data.total || 0);
      setWorkLogsPage(data.page || 1);
      setWorkLogsTotalPages(data.totalPages || 1);
    } catch {
      setWorkLogs([]);
    } finally {
      setWorkLogsLoading(false);
    }
  };

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchIntern();
    fetchUsers();
    
  }, [id]);

  useEffect(() => {
  if (showAdminEdit && intern) {
    setAdminEditForm({
      name:              intern.name              || "",
      email:             intern.email             || "",
      mobile:            intern.mobile            || "",
      college_name:      intern.college_name      || "",
      enrollment_no:     intern.enrollment_no     || "",
      degree_type:       intern.degree_type       || "",
      intern_type:       intern.intern_type       || "",
      start_date:        intern.start_date        || "",
      end_date:          intern.end_date          || "",
      reference_type:    intern.reference_type    || "",
      reference_name:    intern.reference_name    || "",
      reference_contact: intern.reference_contact || "",
    });
    setSelectedMentorIds(intern.mentor_ids || []);
    setAdminEditErrors({});
  }
}, [showAdminEdit, intern]);

  // ── Tab switch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "Project")   fetchProject();
    if (activeTab === "Tasks")     fetchTasks(1, taskStatusFilter);
    if (activeTab === "Work Logs") fetchWorkLogs(1, wlFrom, wlTo);
  }, [activeTab]);

  // ── Tasks filter ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "Tasks") fetchTasks(1, taskStatusFilter);
  }, [taskStatusFilter]);

  // ── WorkLogs filter ───────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "Work Logs") fetchWorkLogs(1, wlFrom, wlTo);
  }, [wlFrom, wlTo]);


  

const handleAdminEdit = async (e) => {
  e.preventDefault();
  const errs = {};
  if (!adminEditForm.name.trim())     errs.name     = "Name is required.";
  if (!adminEditForm.email.trim())    errs.email    = "Email is required.";
  if (!adminEditForm.mobile.trim())   errs.mobile   = "Mobile is required.";
  else if (!/^\d{10}$/.test(adminEditForm.mobile)) errs.mobile = "Enter a valid 10-digit mobile.";
  setAdminEditErrors(errs);
  if (Object.keys(errs).length > 0) return;

  try {
    setAdminEditing(true);
    await api.patch(ENDPOINTS.INTERNS.ADMIN_UPDATE(id), {
      ...adminEditForm,
      mentor_ids: selectedMentorIds,
    });
    toast.success("Intern updated successfully!");
    setShowAdminEdit(false);
    fetchIntern();
     
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to update intern.");
  } finally {
    setAdminEditing(false);
  }
};
const toggleMentor = (userId) => {
  setSelectedMentorIds((prev) =>
    prev.includes(userId)
      ? prev.filter((id) => id !== userId)
      : [...prev, userId]
  );
};


  // ── Approve ────────────────────────────────────────────────────────────────
  const validateApprove = () => {
    const e = {};
    if (!approveForm.start_date) e.start_date = "Start date is required.";
    if (!approveForm.end_date)   e.end_date   = "End date is required.";
    else if (approveForm.start_date && approveForm.end_date <= approveForm.start_date)
      e.end_date = "End date must be after start date.";
    setApproveErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!validateApprove()) return;
    try {
      setApproving(true);
      await approveIntern(id, {
        start_date: approveForm.start_date,
        end_date:   approveForm.end_date,
        mentor_ids:  selectedApproveMentorIds
      });
      toast.success("Intern approved successfully!");
      setShowApprove(false);
      fetchIntern();
       
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve.");
    } finally {
      setApproving(false);
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      setRejectError("Reason must be at least 5 characters.");
      return;
    }
    try {
      setRejecting(true);
      await rejectIntern(id, { rejection_reason: rejectReason.trim() });
      toast.success("Intern application rejected.");
      setShowReject(false);
      setRejectReason("");
      fetchIntern();

    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject.");
    } finally {
      setRejecting(false);
    }
  };

  // ── Extend ─────────────────────────────────────────────────────────────────
  const handleExtend = async (e) => {
    e.preventDefault();
    if (!extendDate) { setExtendError("New end date is required."); return; }
    try {
      setExtending(true);
      await extendInternship(id, { end_date: extendDate });
      toast.success("Internship extended successfully!");
      setShowExtend(false);
      setExtendDate("");
      fetchIntern();

    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to extend.");
    } finally {
      setExtending(false);
    }
  };

  // ── Deactivate ─────────────────────────────────────────────────────────────
  const handleDeactivate = async () => {
    try {
      setDeactivating(true);
      await deactivateInternFn(id);
      toast.success("Intern deactivated.");
      setShowDeactivate(false);
      fetchIntern();
       
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to deactivate.");
    } finally {
      setDeactivating(false);
    }
  };

  // ── Regenerate token ───────────────────────────────────────────────────────
  const handleRegen = async () => {
    try {
      setRegenLoading(true);
      const data = await regenerateSetupToken(id);
      setRegenToken(data.setup_token || "");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to regenerate token.");
      setShowRegen(false);
    } finally {
      setRegenLoading(false);
    }
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/intern/setup-password/${regenToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Assign task ────────────────────────────────────────────────────────────
  const handleAssignTask = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!taskForm.task.trim()) errs.task = "Task name is required.";
    setTaskFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setAssigningTask(true);
      await adminAssignTask(id, {
        intern_id:         id,
        task:              taskForm.task.trim(),
        description:       taskForm.description.trim() || null,
        intern_project_id: taskForm.intern_project_id  || null,
        due_date:          taskForm.due_date            || null,
        remark:            taskForm.remark.trim()       || null,
      });
      toast.success("Task assigned successfully!");
      setShowAssignTask(false);
      setTaskForm({ task: "", description: "", intern_project_id: "", due_date: "", remark: "" });
      fetchTasks(1, taskStatusFilter);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to assign task.");
    } finally {
      setAssigningTask(false);
    }
  };

  // ── Update mentor ──────────────────────────────────────────────────────────

const handleUpdateMentor = async (e) => {
  e.preventDefault();
  try {
    setUpdatingMentor(true);
    await adminUpdateProject(id, { mentor_ids: selectedProjectMentorIds });
    toast.success("Mentors updated successfully!");
    setShowMentor(false);
    fetchProject();
  } catch (error) {
      console.log("🚀 ~ handleUpdateMentor ~ error:", error)
    toast.error(error?.response?.data?.message || "Failed to update mentors.");
  } finally {
    setUpdatingMentor(false);
  }
};


const handleVerifyDocuments = async (fields) => {
  try {
    setVerifying(true);
    await api.patch(ENDPOINTS.INTERNS.ADMIN_UPDATE(id), {
      verify_document_fields: fields,
    });
    toast.success('Documents verified.');
    fetchIntern(); // refresh so verified_fields updates in doc
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to verify.');
  } finally {
    setVerifying(false);
  }
};

  // ── Shared classes ─────────────────────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30 ${
      err ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
    }`;
  const labelCls = "block text-xs font-black uppercase tracking-widest text-slate-500 mb-1";
  const errCls   = "text-xs text-red-500 font-semibold mt-1";
  const cardCls  = "bg-white rounded-2xl shadow-sm border border-slate-100 p-6";
  const fieldLbl = "text-[10px] font-black uppercase tracking-widest text-slate-400";
  const fieldVal = "text-sm font-semibold text-slate-700 mt-0.5";

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-slate-400 font-medium">Loading...</p>
    </div>
  );

  if (!intern) return null;

  const doc = intern.documents;

  console.log("🚀 ~ AdminInternDetail ~ doc:", doc)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/interns")}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
        >
          <MdArrowBack size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Intern Detail
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            {intern.display_id || "—"}
          </p>
        </div>
      </div>

      {/* ── Profile card ────────────────────────────────────────────────────── */}
      <div className={cardCls}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">

          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-[#132ea7] flex items-center justify-center text-white font-black text-2xl shrink-0">
            {intern.name?.charAt(0) || "I"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  {intern.name}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5">{intern.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {intern.intern_type}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_COLORS[intern.status]}`}>
                  {intern.status}
                </span>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 mt-5">
              {[
                ["Mobile",        intern.mobile        || "—"],
                ["Enrollment No.", intern.enrollment_no || "—"],
                ["Degree",        intern.degree_type ? intern.degree_type.charAt(0).toUpperCase() + intern.degree_type.slice(1) : "—"],
                // ["College",       intern.college_name  || "—"],
                // ["Mentor",        intern.mentors?.name  || "Not assigned"],
                ["Start Date",    intern.start_date ? formatDate(intern.start_date) : "—"],
                ["End Date",      intern.end_date   ? formatDate(intern.end_date)   : "—"],
                ["Applied On",    intern.createdAt  ? formatDate(intern.createdAt)  : "—"],
                ["Reference Type",intern.reference_type  || "—"],
                ["Reference Name",    intern.reference_name  || "—"],
                ["Reference Contact",    intern.reference_contact  || "—"],

              ].map(([label, val]) => (
                <div key={label}>
                  <p className={fieldLbl}>{label}</p>
                  <p className={fieldVal}>{val}</p>
                </div>
              ))}
            </div>

{/* mentor */}
<div className="mt-4">
  <p className={fieldLbl}>Mentors</p>
  <div className="mt-2">
    <MentorChips mentors={intern.mentors} />
  </div>
</div>

            {/* Rejection reason */}
            {intern.status === "rejected" && intern.rejection_reason && (
              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">
                  Rejection Reason
                </p>
                <p className="text-sm font-semibold text-red-700">{intern.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Action buttons ─────────────────────────────────────────────────── */}
        {intern.status !== "rejected" && intern.status !== "completed" && (
          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100">

            {/* Pending actions */}
            {intern.status === "pending" && (
              <>
                <button
                  // where you call setShowApprove(true):
onClick={() => { setSelectedApproveMentorIds([]); setShowApprove(true); }}
                  className="px-4 py-2.5 rounded-xl bg-green-500 text-white text-xs font-black uppercase tracking-widest hover:bg-green-600 transition"
                >
                  Approve
                </button>
                <button
                  // where you call setShowApprove(true):
onClick={() => { setSelectedApproveMentorIds([]); setShowApprove(true); }}
                  className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition"
                >
                  Reject
                </button>

                
              </>
            )}

            {/* Approved actions */}
            {intern.status === "approved" && (
              <button
                onClick={() => { setRegenToken(""); setShowRegen(true); }}
                className="px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition"
              >
                Regenerate Setup Token
              </button>
            )}

            {/* Active actions */}
            {intern.status === "active" && (
              <>
                <button
                  onClick={() => setShowExtend(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition"
                >
                  Extend Internship
                </button>
                <button
                  onClick={() => setShowDeactivate(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition"
                >
                  Deactivate
                </button>
              </>
            )}

          </div>
        )}


        {/* Add this outside the status check — admin can always edit */}
<div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100">
  <button
    onClick={() => setShowAdminEdit(true)}
    className="px-4 py-2.5 rounded-xl border-2 border-[#132ea7] text-[#132ea7] text-xs font-black uppercase tracking-widest hover:bg-[#132ea7] hover:text-white transition"
  >
    Edit Intern
  </button>
  {/* existing status-based buttons below... */}
</div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        {/* Tab bar */}
        <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap transition border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#132ea7] text-[#132ea7]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">

          {/* ── Documents tab ─────────────────────────────────────────────── */}
        {activeTab === "Documents" && (
  <div className="flex flex-col gap-6">
    {!doc ? (
      <p className="text-sm text-slate-400 font-medium">No documents found.</p>
    ) : (
      <>
        {/* Verify summary + Verify All button */}
        <div className="flex items-center justify-between">
          <div>
            <p className={fieldLbl}>Verification Status</p>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">
              {(doc.verified_fields || []).length} of {(doc.verified_fields || []).length}   fields verified
            </p>
          </div>
          {(doc.verified_fields || []).length < 5 && (
            <button
              disabled={verifying}
              onClick={() => handleVerifyDocuments(['id_proof', 'photo', 'resume', 'last_sem_marksheet', 'document_type'])}
              className="px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-black uppercase tracking-widest hover:bg-green-600 transition disabled:opacity-60"
            >
              {verifying ? "Verifying..." : "✓ Verify All"}
            </button>
          )}
          {(doc.verified_fields || []).length === 5 && (
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-green-100 text-green-600">
              ✓ All Verified
            </span>
          )}
        </div>

        {/* ID proof type with verify button */}
        <div className="flex items-center justify-between">
          <div>
            <p className={fieldLbl}>ID Proof Type</p>
            <p className={fieldVal}>
              {doc.document_type
                ? doc.document_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                : "—"}
            </p>
          </div>
          {doc.verified_fields?.includes('document_type') ? (
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-green-100 text-green-600">
              ✓ Verified
            </span>
          ) : (
            <button
              disabled={verifying}
              onClick={() => handleVerifyDocuments(['document_type'])}
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 hover:border-green-500 hover:text-green-600 transition disabled:opacity-60"
            >
              Verify
            </button>
          )}
        </div>

        {/* Files grid with verify buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { field: 'id_proof',           label: 'ID Proof',  url: doc.id_proof },
            { field: 'photo',              label: 'Photo',     url: doc.photo },
            { field: 'resume',             label: 'Resume',    url: doc.resume },
            { field: 'last_sem_marksheet', label: 'Marksheet', url: doc.last_sem_marksheet },
          ].map(({ field, label, url }) => (
            <div key={field} className="flex flex-col gap-2">
              <FileLink label={label} url={url} />
              {url ? (
                doc.verified_fields?.includes(field) ? (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-100 text-green-600 w-fit">
                    ✓ Verified
                  </span>
                ) : (
                  <button
                    disabled={verifying}
                    onClick={() => handleVerifyDocuments([field])}
                    className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 hover:border-green-500 hover:text-green-600 transition w-fit disabled:opacity-60"
                  >
                    Verify
                  </button>
                )
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">
                  Not uploaded
                </span>
              )}
            </div>
          ))}
        </div>

        {/* College detail — unchanged */}
        {doc.college_detail && (
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
              College Details
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 bg-slate-50 rounded-xl p-4">
              {[
                ["College Name",  doc.college_detail.college_name],
                ["Address",       doc.college_detail.college_address],
                ["Branch",        doc.college_detail.branch],
                ["Current Year",  doc.college_detail.current_year],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className={fieldLbl}>{label}</p>
                  <p className={fieldVal}>{val || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    )}
  </div>
)}

          {/* ── Project tab ───────────────────────────────────────────────── */}
          {activeTab === "Project" && (
            <div className="flex flex-col gap-5">
              {projectLoading ? (
                <p className="text-sm text-slate-400 font-medium">Loading...</p>
              ) : !project ? (
                <p className="text-sm text-slate-400 font-medium italic">
                  No project defined yet.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                    <div>
                      <p className={fieldLbl}>Project Name</p>
                      <p className={fieldVal}>{project.name}</p>
                    </div>
                    <div>
                      <p className={fieldLbl}>Project ID</p>
                      <p className={fieldVal}>{project.display_id || "—"}</p>
                    </div>
                    {project.description && (
                      <div className="col-span-2">
                        <p className={fieldLbl}>Description</p>
                        <p className={fieldVal}>{project.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Tech stack */}
                  {project.tech_details && Object.values(project.tech_details).some(Boolean) && (
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                        Tech Stack
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 bg-slate-50 rounded-xl p-4">
                        {[
                          ["Languages",  project.tech_details.languages],
                          ["Frameworks", project.tech_details.frameworks],
                          ["Database",   project.tech_details.database],
                          ["Others",     project.tech_details.others],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <p className={fieldLbl}>{label}</p>
                            <p className={fieldVal}>{val || "—"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mentor */}
            {/* // in Project tab mentor section: */}
<div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
  <div className="flex-1">
    <p className={fieldLbl}>Mentors</p>
    <div className="mt-2">
      <MentorChips mentors={project.mentors} />
    </div>
  </div>
  <button
    onClick={() => {
      setSelectedProjectMentorIds(project.mentor_ids || []);
      setShowMentor(true);
    }}
    className="px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition shrink-0"
  >
    Update Mentors
  </button>
</div>
                </>
              )}
            </div>
          )}

          {/* ── Tasks tab ─────────────────────────────────────────────────── */}
          {activeTab === "Tasks" && (
            <div className="flex flex-col gap-4">

              {/* Tasks toolbar */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
                >
                  <option value="">All Statuses</option>
                  {["open", "ongoing", "hold", "closed"].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAssignTask(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition"
                >
                  + Assign Task
                </button>
              </div>

              {/* Tasks table */}
              {tasksLoading ? (
                <p className="text-sm text-slate-400 font-medium py-8 text-center">Loading...</p>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-slate-400 font-medium py-8 text-center">No tasks found.</p>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {["ID", "Task", "Project", "Due Date", "Status", "Type"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((t) => (
                          <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                            <td className="px-4 py-3 text-xs font-black text-slate-400">{t.display_id}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-700 truncate max-w-[180px]">{t.task}</p>
                              {t.description && <p className="text-xs text-slate-400 truncate max-w-[180px]">{t.description}</p>}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-slate-500">{t.project?.name || "—"}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{t.due_date ? formatDate(t.due_date) : "—"}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${TASK_STATUS_COLORS[t.status]}`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${t.assigned_by ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"}`}>
                                {t.assigned_by ? "Admin" : "Self"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden flex flex-col divide-y divide-slate-100">
                    {tasks.map((t) => (
                      <div key={t.id} className="py-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.display_id}</p>
                            <p className="font-black text-slate-700 mt-0.5">{t.task}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${TASK_STATUS_COLORS[t.status]}`}>
                            {t.status}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-wrap text-xs text-slate-400 font-semibold">
                          {t.project && <span>📁 {t.project.name}</span>}
                          {t.due_date && <span>📅 {formatDate(t.due_date)}</span>}
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${t.assigned_by ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"}`}>
                            {t.assigned_by ? "Admin" : "Self"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tasks pagination */}
                  {tasksTotalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-400">
                        Page {tasksPage} of {tasksTotalPages} — {tasksTotal} total
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => { const p = Math.max(1, tasksPage - 1); setTasksPage(p); fetchTasks(p, taskStatusFilter); }}
                          disabled={tasksPage === 1}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition">
                          Prev
                        </button>
                        <button onClick={() => { const p = Math.min(tasksTotalPages, tasksPage + 1); setTasksPage(p); fetchTasks(p, taskStatusFilter); }}
                          disabled={tasksPage === tasksTotalPages}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Work Logs tab ─────────────────────────────────────────────── */}
          {activeTab === "Work Logs" && (
            <div className="flex flex-col gap-4">

              {/* Filters */}
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={wlFrom} onChange={(e) => setWlFrom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30" />
                <input type="date" value={wlTo} onChange={(e) => setWlTo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30" />
              </div>

              {workLogsLoading ? (
                <p className="text-sm text-slate-400 font-medium py-8 text-center">Loading...</p>
              ) : workLogs.length === 0 ? (
                <p className="text-sm text-slate-400 font-medium py-8 text-center">No work logs found.</p>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {["ID", "Description", "Project", "Task", "Date", "Hours"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {workLogs.map((w) => (
                          <tr key={w.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                            <td className="px-4 py-3 text-xs font-black text-slate-400">{w.display_id}</td>
                            <td className="px-4 py-3 font-semibold text-slate-700 truncate max-w-[200px]">{w.description}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-slate-500">{w.project?.name || "—"}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-slate-500">{w.task?.display_id || "—"}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{formatDate(w.log_date)}</td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-black text-[#132ea7]">{parseFloat(w.hours).toFixed(1)} hrs</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden flex flex-col divide-y divide-slate-100">
                    {workLogs.map((w) => (
                      <div key={w.id} className="py-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{w.display_id}</p>
                            <p className="font-semibold text-slate-700 mt-0.5">{w.description}</p>
                          </div>
                          <span className="text-sm font-black text-[#132ea7] shrink-0">{parseFloat(w.hours).toFixed(1)} hrs</span>
                        </div>
                        <div className="flex gap-3 text-xs text-slate-400 font-semibold flex-wrap">
                          <span>📅 {formatDate(w.log_date)}</span>
                          {w.project && <span>📁 {w.project.name}</span>}
                          {w.task    && <span>✅ {w.task.display_id}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* WorkLogs pagination */}
                  {workLogsTotalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-400">
                        Page {workLogsPage} of {workLogsTotalPages} — {workLogsTotal} total
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => { const p = Math.max(1, workLogsPage - 1); setWorkLogsPage(p); fetchWorkLogs(p, wlFrom, wlTo); }}
                          disabled={workLogsPage === 1}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition">
                          Prev
                        </button>
                        <button onClick={() => { const p = Math.min(workLogsTotalPages, workLogsPage + 1); setWorkLogsPage(p); fetchWorkLogs(p, wlFrom, wlTo); }}
                          disabled={workLogsPage === workLogsTotalPages}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODALS */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      {/* ── Approve Modal ───────────────────────────────────────────────────── */}
      {showApprove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Approve Intern</h2>
              <button onClick={() => setShowApprove(false)} className="text-slate-400 hover:text-slate-600 transition"><MdClose size={20} /></button>
            </div>
            <form onSubmit={handleApprove} className="px-6 py-6 flex flex-col gap-5">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Start Date <span className="text-red-400">*</span></label>
                  <input type="date" value={approveForm.start_date}
                    onChange={(e) => setApproveForm((p) => ({ ...p, start_date: e.target.value }))}
                    className={inputCls(approveErrors.start_date)} />
                  {approveErrors.start_date && <p className={errCls}>{approveErrors.start_date}</p>}
                </div>
                <div>
                  <label className={labelCls}>End Date <span className="text-red-400">*</span></label>
                  <input type="date" value={approveForm.end_date}
                    onChange={(e) => setApproveForm((p) => ({ ...p, end_date: e.target.value }))}
                    className={inputCls(approveErrors.end_date)} />
                  {approveErrors.end_date && <p className={errCls}>{approveErrors.end_date}</p>}
                </div>
              </div>

          {/* Replace the existing single LocalSearchableSelect mentor block with this: */}
<div>
  <label className={labelCls}>
    Mentors{" "}
    <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span>
  </label>

  {/* Selected chips */}
  {selectedApproveMentorIds.length > 0 && (
    <div className="flex flex-wrap gap-2 mb-3">
      {users
        .filter((u) => selectedApproveMentorIds.includes(u.id))
        .map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-1.5 bg-[#132ea7]/10 text-[#132ea7] px-3 py-1 rounded-full text-xs font-black cursor-pointer hover:bg-red-100 hover:text-red-500 transition"
            onClick={() =>
              setSelectedApproveMentorIds((prev) => prev.filter((id) => id !== u.id))
            }
          >
            {u.name} <MdClose size={12} />
          </div>
        ))}
    </div>
  )}

  <LocalSearchableSelect
    options={users.filter((u) => !selectedApproveMentorIds.includes(u.id))}
    value=""
    onChange={(id) => {
      if (id) setSelectedApproveMentorIds((prev) => [...prev, id]);
    }}
    getId={(u) => u.id}
    getLabel={getMemberLabel}
    getSearchText={(u) => `${u.name} ${u.employee_id}`}
    placeholder="Search and add mentor..."
    emptyOptionLabel="None"
  />
</div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowApprove(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={approving}
                  className="flex-1 py-3 rounded-xl bg-green-500 text-white font-black text-sm uppercase tracking-widest hover:bg-green-600 transition disabled:opacity-60">
                  {approving ? "Approving..." : "Approve"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reject Modal ────────────────────────────────────────────────────── */}
      {showReject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Reject Application</h2>
              <button onClick={() => { setShowReject(false); setRejectReason(""); setRejectError(""); }}
                className="text-slate-400 hover:text-slate-600 transition"><MdClose size={20} /></button>
            </div>
            <form onSubmit={handleReject} className="px-6 py-6 flex flex-col gap-5">
              <div>
                <label className={labelCls}>Rejection Reason <span className="text-red-400">*</span></label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => { setRejectReason(e.target.value); setRejectError(""); }}
                  rows={4}
                  placeholder="Provide a clear reason for rejection (min. 5 characters)..."
                  className={inputCls(rejectError)}
                />
                {rejectError && <p className={errCls}>{rejectError}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowReject(false); setRejectReason(""); setRejectError(""); }}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={rejecting}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black text-sm uppercase tracking-widest hover:bg-red-600 transition disabled:opacity-60">
                  {rejecting ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Extend Modal ────────────────────────────────────────────────────── */}
      {showExtend && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Extend Internship</h2>
              <button onClick={() => { setShowExtend(false); setExtendDate(""); setExtendError(""); }}
                className="text-slate-400 hover:text-slate-600 transition"><MdClose size={20} /></button>
            </div>
            <form onSubmit={handleExtend} className="px-6 py-6 flex flex-col gap-5">
              <div>
                <label className={labelCls}>New End Date <span className="text-red-400">*</span></label>
                <p className="text-xs text-slate-400 font-semibold mb-2">
                  Current end date: {intern.end_date ? formatDate(intern.end_date) : "—"}
                </p>
                <input type="date" value={extendDate}
                  onChange={(e) => { setExtendDate(e.target.value); setExtendError(""); }}
                  className={inputCls(extendError)} />
                {extendError && <p className={errCls}>{extendError}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowExtend(false); setExtendDate(""); setExtendError(""); }}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={extending}
                  className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
                  {extending ? "Extending..." : "Extend"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Deactivate Confirm ───────────────────────────────────────────────── */}
      {showDeactivate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <MdPerson size={32} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Deactivate Intern</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Are you sure you want to deactivate <span className="font-black text-slate-700">{intern.name}</span>?
                This will mark their internship as completed.
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={() => setShowDeactivate(false)}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleDeactivate} disabled={deactivating}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black text-sm uppercase tracking-widest hover:bg-red-600 transition disabled:opacity-60">
                {deactivating ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Regenerate Token Modal ───────────────────────────────────────────── */}
      {showRegen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">

              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Regenerate Setup Token</h2>

           {/* Approved — only show regenerate if password not yet set */}
{intern.status === "approved" && !intern.password_hash && (
  <button
    onClick={() => { setRegenToken(""); setShowRegen(true); }}
    className="px-4 py-2.5 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition"
  >
    Resend Setup Link
  </button>
)}
            </div>

            {!regenToken ? (
              <>
                <p className="text-sm text-slate-500 font-medium">
                  This will generate a new one-time setup link for <span className="font-black text-slate-700">{intern.name}</span>.
                  The previous link will be invalidated.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowRegen(false); }}
                    className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button onClick={handleRegen} disabled={regenLoading}
                    className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
                    {regenLoading ? "Generating..." : "Generate"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-green-600 font-semibold">
                  Token generated successfully. Share this link with the intern:
                </p>
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 break-all flex-1">
                    {`${window.location.origin}/intern/setup-password/${regenToken}`}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 text-[#132ea7] hover:text-[#0f2490] transition"
                  >
                    {copied ? <MdCheck size={18} className="text-green-500" /> : <MdContentCopy size={18} />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-semibold">
                  This link expires in 24 hours.
                </p>
                <button
                  onClick={() => { setShowRegen(false); setRegenToken(""); setCopied(false); }}
                  className="w-full py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Assign Task Modal ────────────────────────────────────────────────── */}
      {showAssignTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Assign Task</h2>
              <button onClick={() => setShowAssignTask(false)} className="text-slate-400 hover:text-slate-600 transition">
                <MdClose size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignTask} className="px-6 py-6 flex flex-col gap-5">

              <div>
                <label className={labelCls}>Task Name <span className="text-red-400">*</span></label>
                <input name="task" value={taskForm.task}
                  onChange={(e) => { setTaskForm((p) => ({ ...p, task: e.target.value })); setTaskFormErrors((p) => ({ ...p, task: "" })); }}
                  placeholder="e.g. Build login API"
                  className={inputCls(taskFormErrors.task)} />
                {taskFormErrors.task && <p className={errCls}>{taskFormErrors.task}</p>}
              </div>

              <div>
                <label className={labelCls}>Description <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <textarea value={taskForm.description}
                  onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Brief description..."
                  className={inputCls(false)} />
              </div>

              {/* Project dropdown — intern's project if exists */}
              <div>
                <label className={labelCls}>Project <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <select value={taskForm.intern_project_id}
                  onChange={(e) => setTaskForm((p) => ({ ...p, intern_project_id: e.target.value }))}
                  className={inputCls(false)}>
                  <option value="">No project</option>
                  {project && <option value={project.id}>{project.name}</option>}
                </select>
              </div>

              <div>
                <label className={labelCls}>Due Date <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <input type="date" value={taskForm.due_date}
                  onChange={(e) => setTaskForm((p) => ({ ...p, due_date: e.target.value }))}
                  className={inputCls(false)} />
              </div>

              <div>
                <label className={labelCls}>Remark <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
                <textarea value={taskForm.remark}
                  onChange={(e) => setTaskForm((p) => ({ ...p, remark: e.target.value }))}
                  rows={2} placeholder="Add a note..."
                  className={inputCls(false)} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignTask(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={assigningTask}
                  className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
                  {assigningTask ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Update Mentor Modal ──────────────────────────────────────────────── */}
   {showMentor && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Update Mentors</h2>
        <button onClick={() => setShowMentor(false)} className="text-slate-400 hover:text-slate-600 transition">
          <MdClose size={20} />
        </button>
      </div>
      <form onSubmit={handleUpdateMentor} className="px-6 py-6 flex flex-col gap-4">

        {/* Selected mentor chips */}
        {selectedProjectMentorIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {users.filter((u) => selectedProjectMentorIds.includes(u.id)).map((u) => (
              <div key={u.id}
                className="flex items-center gap-1.5 bg-[#132ea7]/10 text-[#132ea7] px-3 py-1 rounded-full text-xs font-black cursor-pointer hover:bg-red-100 hover:text-red-500 transition"
                onClick={() => setSelectedProjectMentorIds((prev) => prev.filter((id) => id !== u.id))}
              >
                {u.name} <MdClose size={12} />
              </div>
            ))}
          </div>
        )}

        {/* Search + add */}
        <div>
          <label className={labelCls}>Add Mentor</label>
          <LocalSearchableSelect
            options={users.filter((u) => !selectedProjectMentorIds.includes(u.id))}
            value=""
            onChange={(id) => { if (id) setSelectedProjectMentorIds((prev) => [...prev, id]); }}
            getId={(u) => u.id}
            getLabel={getMemberLabel}
            getSearchText={(u) => `${u.name} ${u.employee_id}`}
            placeholder="Search employee..."
            emptyOptionLabel="None"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setShowMentor(false)}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={updatingMentor}
            className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
            {updatingMentor ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showAdminEdit && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Edit Intern</h2>
        <button onClick={() => setShowAdminEdit(false)} className="text-slate-400 hover:text-slate-600 transition">
          <MdClose size={20} />
        </button>
      </div>
      <form onSubmit={handleAdminEdit} className="px-6 py-6 flex flex-col gap-5">

        {/* Personal */}
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Personal Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: "name",          label: "Full Name",        type: "text",  required: true  },
            { name: "email",         label: "Email",            type: "email", required: true  },
            { name: "mobile",        label: "Mobile",           type: "text",  required: true  },
            { name: "enrollment_no", label: "Enrollment No.",   type: "text",  required: false },
          ].map((f) => (
            <div key={f.name}>
              <label className={labelCls}>{f.label} {f.required && <span className="text-red-400">*</span>}</label>
              <input
                name={f.name}
                type={f.type}
                value={adminEditForm[f.name] || ""}
                onChange={(e) => {
                  setAdminEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));
                  if (adminEditErrors[e.target.name]) setAdminEditErrors((p) => ({ ...p, [e.target.name]: "" }));
                }}
                className={inputCls(adminEditErrors[f.name])}
              />
              {adminEditErrors[f.name] && <p className={errCls}>{adminEditErrors[f.name]}</p>}
            </div>
          ))}

          <div>
            <label className={labelCls}>Degree Type</label>
            <select name="degree_type" value={adminEditForm.degree_type || ""}
              onChange={(e) => setAdminEditForm((p) => ({ ...p, degree_type: e.target.value }))}
              className={inputCls(false)}>
              <option value="">Select</option>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Intern Type</label>
            <select name="intern_type" value={adminEditForm.intern_type || ""}
              onChange={(e) => setAdminEditForm((p) => ({ ...p, intern_type: e.target.value }))}
              className={inputCls(false)}>
              <option value="">Select</option>
              <option value="intern">Intern</option>
              <option value="trainee">Trainee</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>College Name</label>
            <input name="college_name" value={adminEditForm.college_name || ""}
              onChange={(e) => setAdminEditForm((p) => ({ ...p, college_name: e.target.value }))}
              className={inputCls(false)} />
          </div>

          <div>
            <label className={labelCls}>Start Date</label>
            <input type="date" name="start_date" value={adminEditForm.start_date || ""}
              onChange={(e) => setAdminEditForm((p) => ({ ...p, start_date: e.target.value }))}
              className={inputCls(false)} />
          </div>

          <div>
            <label className={labelCls}>End Date</label>
            <input type="date" name="end_date" value={adminEditForm.end_date || ""}
              onChange={(e) => setAdminEditForm((p) => ({ ...p, end_date: e.target.value }))}
              className={inputCls(false)} />
          </div>
        </div>

        {/* Mentors */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Mentors</p>

          {/* Selected chips */}
          {selectedMentorIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {users.filter((u) => selectedMentorIds.includes(u.id)).map((u) => (
                <div key={u.id}
                  className="flex items-center gap-1.5 bg-[#132ea7]/10 text-[#132ea7] px-3 py-1 rounded-full text-xs font-black cursor-pointer hover:bg-red-100 hover:text-red-500 transition"
                  onClick={() => toggleMentor(u.id)}
                >
                  {u.name} <MdClose size={12} />
                </div>
              ))}
            </div>
          )}

          <LocalSearchableSelect
            options={users.filter((u) => !selectedMentorIds.includes(u.id))}
            value=""
            onChange={(id) => { if (id) toggleMentor(id); }}
            getId={(u) => u.id}
            getLabel={getMemberLabel}
            getSearchText={(u) => `${u.name} ${u.employee_id}`}
            placeholder="Search and add mentor..."
            emptyOptionLabel="None"
          />
        </div>

        {/* Reference */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
            Reference <span className="text-slate-300 font-medium normal-case tracking-normal">(optional)</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Reference Type</label>
              <select name="reference_type" value={adminEditForm.reference_type || ""}
                onChange={(e) => setAdminEditForm((p) => ({ ...p, reference_type: e.target.value }))}
                className={inputCls(false)}>
                <option value="">Select</option>
                {["employee","intern","college","friend","social_media","website","other"].map((v) => (
                  <option key={v} value={v}>{v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Reference Name</label>
              <input name="reference_name" value={adminEditForm.reference_name || ""}
                onChange={(e) => setAdminEditForm((p) => ({ ...p, reference_name: e.target.value }))}
                className={inputCls(false)} />
            </div>
            <div>
              <label className={labelCls}>Reference Contact</label>
              <input name="reference_contact" value={adminEditForm.reference_contact || ""}
                onChange={(e) => setAdminEditForm((p) => ({ ...p, reference_contact: e.target.value }))}
                className={inputCls(false)} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setShowAdminEdit(false)}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={adminEditing}
            className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
            {adminEditing ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminInternDetail;