import { useEffect, useState, useMemo } from "react";
import { useCall } from "../../context/CallContext";
import { useProject } from "../../context/ProjectContext";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { useTask } from "../../context/TaskContext";
import { useClient } from "../../context/ClientContext";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
// import ExportBar from "../../components/ui/ExportBar";
import ExportModalMine from "../../components/ui/ExportModalMine";


import {
  MdPhone,
  MdAdd,
  MdCalendarToday,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdFolder,
  MdInfoOutline,
  MdHistory,
  MdDownload ,
  MdTransferWithinAStation 
} from "react-icons/md";
import LocalSearchableSelect from "../../components/ui/LocalSearchableSelect";

const CALL_TYPES = {
  inquiry: ["inquiry", "follow-back"],
  request: ["other", "update", "new development"],
  complaint: ["bug", "error solve"],
};

const RECEIVE_OPTIONS = [
  { value: "call", label: "Call" },
  { value: "msg", label: "Message" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "inquiry", label: "Inquiry" },
  { value: "request", label: "Request" },
  { value: "complaint", label: "Complaint" },
];

const PREFIX_INFO = {
  C: "Call",
  CT: "Call + Task(Self)",
  CTA: "Call + Task (Assigned to Other)",
  CTR: "Call Transfer",
  CFB: "Call follow-back",
};

const initialForm = {
  caller_name: "",
  caller_number: "",
    client_id: "",  
  project_id: "",
  call_type: "",
  call_subtype: "",
  receive_type: "",
  call_summary: "",
  remarks: "",
  is_task: false,
  is_follow_up: false,
  transfer_to: "",
  task_assigned_to: "",
  parent_call_id: "",
};

  const getExpectedPrefix = (form) => {
    if (form.transfer_to) return "CTR";
    if (form.is_task && form.task_assigned_to) return "CTA";
    if (form.is_task) return "CT";
    if (form.is_follow_up && form.parent_call_id) return "CFB";
    return "C";
  };


const MyCalls = () => {
  const {
    calls,
    loading,
    page,
    setPage,
    totalPages,
    getAllCalls,
    createCall,
    updateCall,
    deleteCall,
  } = useCall();
    // console.log("🚀 ~ MyCalls ~ calls:", calls)
  const { projects, getAllProjects } = useProject();
  const {users, getAllUsers} = useUser();
  const {getAllTasks, page: taskPage} = useTask();
  const {user: authUser} = useAuth();
  const {clients, getAllClients} = useClient();

  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);


  const today = new Date().toISOString().split("T")[0];
const [dateFrom, setDateFrom] = useState(today);
const [dateTo, setDateTo] = useState(today)



    const [remarksTarget, setRemarksTarget] = useState(null);
  const [remarkText, setRemarkText]       = useState("");
  const [remarkSubmitting, setRemarkSubmitting] = useState(false);
  const [showNewRemark, setShowNewRemark] = useState(false);
  


  useEffect(() => {
    getAllCalls?.(page, dateFrom, dateTo);
    getAllProjects?.();
    getAllUsers?.();
    getAllClients?.();
  }, [page, dateFrom, dateTo]);


        // Members of the selected project — falls back to all users if no project selected
    const assignableUsers = useMemo(() => {
      if (!form.project_id) return users;
      const project = projects.find((p) => p.id === form.project_id);
      if (!project?.members?.length) return [];
      const memberUserIds = project.members.map((m) => m.user_id || m.user?.id);
      return users.filter((u) => memberUserIds.includes(u.id));
    }, [form.project_id, projects, users]);
    


  // right now its just display name which is good but if code needs then use claudes code
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  // console.log("🚀 ~ MyCalls ~ projectOptions:", projectOptions);

  const callTypeOptions = Object.keys(CALL_TYPES).map((t) => ({
    value: t,
    label: t.charAt(0).toUpperCase() + t.slice(1),
  }));
  // console.log("🚀 ~ MyCalls ~ callTypeOptions:", callTypeOptions);

  const subtypeOptions = form.call_type
    ? CALL_TYPES[form.call_type].map((s) => ({ value: s, label: s }))
    : [];

     // Own calls for parent_call_id dropdown (follow-up);
    const otherUsers = users.filter((u) => u.id !== authUser?.id);

    //Own calls for parent_call_id dropdown (follow up)
    const ownCalls = calls.filter( (c) => !c.parent_call_id && !c.transfer_to)

  const filtered = filter === "all" ? calls : calls.filter((c) => c.call_type === filter);

  const expectedPrefix = getExpectedPrefix(form);


  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (name === "call_type") {
      setForm((prev) => ({ ...prev, call_type: newValue, call_subtype: "" }));
    } 
    else if (name === "transfer_to") 
    {
      //transfer to clears task fields
      setForm((prev) => ({... prev, transfer_to: newValue, is_task: false, task_assigned_to: ""}));
    }
    else if (name === "is_task" && !checked)
    {
      setForm((prev) => ({...prev, is_task:false, task_assigned_to: ""}))
    }
    else if (name === "follow_up" && !checked)
    {
      setForm((prev) => ({...prev, follow_up:"" , parent_call_id:""}));
    }
    else {
      setForm((prev) => ({ ...prev, [name]: newValue }));
    }
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.caller_name.trim()) errors.caller_name  = "Caller name is required";
    if (!form.call_type)          errors.call_type    = "Call type is required";
    if (!form.call_subtype)       errors.call_subtype = "Call subtype is required";
    if (!form.receive_type)       errors.receive_type = "Receive type is required";
    if (form.is_task && !form.project_id) errors.project_id = "Project is required when creating a task";
    if (form.follow_up_date && !form.parent_call_id) errors.parent_call_id = "Select the original call for follow-up";
    if (form.transfer_to === authUser?.id)           errors.transfer_to   = "Cannot transfer to yourself";
    return errors;
  };


  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (call) => {
    setEditTarget(call);
    setForm({
      caller_name: call.caller_name || "",
      caller_number: call.caller_number || "",
          client_id:       call.client_id       || "",
      project_id: call.project_id || "",
      call_type: call.call_type || "",
      call_subtype: call.call_subtype || "",
      receive_type: call.receive_type || "",
      call_summary: call.call_summary || "",
      remarks: "",
      is_task: call.is_task || false,
      is_follow_up: false,
      transfer_to: "",
      task_assigned_to: "",
      parent_call_id: "",

    });
    setFieldErrors({});
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
        await updateCall(editTarget.id, form);
        setAlert({ type: "success", message: "Call updated successfully" });
      } else {
        const payload = {
          ...form,
          project_id: form.project_id || null,
          caller_number: form.caller_number || null,
          call_summary: form.call_summary || null,
          remarks: form.remarks || null,
           is_task:          form.is_task          || false,
          transfer_to:      form.transfer_to      || null,
          task_assigned_to: form.task_assigned_to || null,
          follow_up_date:   form.follow_up_date   || null,
          parent_call_id:   form.parent_call_id   || null,
        };
        const cc = await createCall(payload);
        if (cc?.task) {
 setAlert({
          type: "success",
          message: result?.task
            ? "Call logged and task auto-created"
            : form.transfer_to
              ? "Call logged and transferred"
              : "Call logged",
        });
        } else {
          setAlert({ type: "success", message: "Call logged successfully" });
        }
      }
      closeModal();
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteCall(confirmDelete.id);
      setAlert({ type: "success", message: "Call deleted" });
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Delete failed",
      });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleClientSelect = (e) => {
  const clientId = e.target.value;
  const client = clients.find((c) => c.id === clientId);
  setForm((prev) => ({
    ...prev,
    client_id: clientId,
    caller_name:   client?.name  || prev.caller_name,
    caller_number: client?.phone || prev.caller_number,
  }));
};

  if (loading && !calls.length)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
          Accessing comms archives...
        </p>
      </div>
    ); 

  return (
    <div className="space-y-10 px-5  animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            CALL <span className="text-[#132ea7]">Logs</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">
            Total calls: {calls.length}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <select
            className="bg-white border border-slate-100 text-slate-600 text-sm font-bold rounded px-3 focus:outline-none focus:border-[#132ea7]/30 focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none shadow-sm cursor-pointer h-[52px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          
        </div>

        <div className="flex items-center gap-3 bg-white border flex-wrap border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
  <label className="text-xs font-black text-slate-400 uppercase ">From</label>
  <input type="date" value={dateFrom} max={today} onChange={(e) => setDateFrom(e.target.value)}
    className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold" />
  <label className="text-xs font-black text-slate-400 uppercase">To</label>
  <input type="date" value={dateTo} max={today} onChange={(e) => setDateTo(e.target.value)}
    className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold" />
  <button
    onClick={() => { setDateFrom(today); setDateTo(today); }}
    className="text-[10px] font-black text-[#132ea7] uppercase tracking-widest hover:underline"
  >
    Reset to Today
  </button>
</div>


        <Button
  variant="ghost"
  className="shadow-sm px-6 rounded font-black uppercase tracking-widest text-sm whitespace-nowrap h-[52px] bg-white border border-slate-100"
  onClick={() => setShowExportModal(true)}
>
  <MdDownload size={20} className="mr-1" /> Download
</Button>
          <Button
            variant="primary"
            className="shadow-lg shadow-[#132ea7]/20 px-6 rounded font-black uppercase tracking-widest text-sm whitespace-nowrap h-[52px]"
            onClick={openCreate}
          >
            <MdAdd size={20} className="mr-1" /> New Call
          </Button>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Stats */}
      <div className="grid grid-cols-1  md:grid-cols-3 gap-6">
        <div className="bg-white p-8  rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
            <MdPhone size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              Total Calls
            </p>
            <p className="text-3xl font-black text-slate-800">{calls.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <MdHistory size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              Today's Contacts
            </p>
            <p className="text-3xl font-black text-slate-800">
              {
                calls.filter(
                  (c) =>
                    new Date(c.createdAt).toDateString() ===
                    new Date().toDateString(),
                ).length
              }
            </p>
          </div>
        </div>
        <div className="bg-[#132ea7] p-8 rounded-[2rem] shadow-2xl shadow-[#132ea7]/20 flex items-center gap-6 text-white relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center relative z-10">
            <MdInfoOutline size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">
              Last Submission
            </p>
            <p className="text-lg font-black">
              {calls[0]
                ? new Date(calls[0].createdAt).toLocaleDateString()
                : "No Records"}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white  rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">

              <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Timestamp
                </th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Display ID
                </th>
                  
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Caller
                </th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Project
                </th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Type
                </th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Medium
                </th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-slate-400 py-16 font-bold italic text-lg uppercase tracking-widest"
                  >
                    No logs archived yet.
                  </td>
                </tr>
              )}
              {filtered.map((call) => (
                <tr
                  key={call.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#132ea7] flex items-center justify-center shadow-inner group-hover:bg-[#132ea7] group-hover:text-white transition-all">
                        <MdCalendarToday size={18} />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-base">
                          {new Date(call.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(call.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </td>

                   <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[12px] font-black font-mono">
                      {call.display_id || "—"}
                    </span>
                  </td>

                  <td className="px-8 py-6">
                    <div className="font-black text-slate-700 text-sm">
                      {call.caller_name || <MdPhone size={16} />}
                    </div>
                    {call.caller_number && (
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {call.caller_number}
                      </div>
                    )}
                  </td>

                  
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-600">
                      <MdFolder className="text-[#132ea7]" size={16} />
                      {call.project?.name || "—"}
                    </div>
                  </td>
<td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <Badge value={call.call_type} />
                      {/* <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {call.call_subtype}
                      </span> */}
                      <div className="flex gap-1 flex-wrap mt-0.5">
                        {call.is_task && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase flex items-center gap-1">
                            <MdAssignment size={10} /> Task
                          </span>
                        )}
                        {call.transfer_to && (
                          <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded text-[9px] font-black uppercase flex items-center gap-1">
                            <MdTransferWithinAStation size={10} /> Transfer
                          </span>
                        )}
                        {call.parent_call_id && (
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black uppercase">
                            Follow-up
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      {call.receive_type}
                    </span>
                  </td>

                  {/* <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                      <MdCalendarToday className="text-slate-300" size={14} />
                      {new Date(call.createdAt).toLocaleDateString("default", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </td> */}


                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all"
                        onClick={() => setViewTarget(call)}
                        title="View"
                      >
                        <MdVisibility size={20} />
                      </button>
                      <button
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                        onClick={() => openEdit(call)}
                        title="Edit"
                      >
                        <MdEdit size={20} />
                      </button>
                      <button
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        onClick={() => setConfirmDelete(call)}
                        title="Delete"
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-6 border-t border-slate-100">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? "bg-[#132ea7] text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
            No logs archived yet.
          </div>
        ) : (
          filtered.map((call) => (
            <div key={call.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#132ea7] flex items-center justify-center font-black shrink-0 shadow-inner">
                  <MdCalendarToday size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 leading-tight truncate">{new Date(call.createdAt).toLocaleDateString()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(call.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className="shrink-0 px-2 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[10px] font-black uppercase tracking-widest font-mono">
                  {call.display_id || "—"}
                </span>
              </div>

              {/* Meta Rows */}
              <div className="space-y-2 text-sm pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Caller</span>
                  <div className="flex flex-col items-end">
                    <span className="font-black text-slate-700 text-xs">{call.caller_name || <MdPhone size={12} />}</span>
                    {call.caller_number && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{call.caller_number}</span>}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Project</span>
                  <div className="flex items-center gap-1.5">
                    <MdFolder className="text-[#132ea7]" size={14} />
                    <span className="font-bold text-slate-700 text-xs">{call.project?.name || "—"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px] mt-1">Type</span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <Badge value={call.call_type} />
                    {call.is_task && (
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase flex items-center gap-1">
                        <MdAssignment size={10} /> Task
                      </span>
                    )}
                    {call.transfer_to && (
                      <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded text-[9px] font-black uppercase flex items-center gap-1">
                        <MdTransferWithinAStation size={10} /> Transfer
                      </span>
                    )}
                    {call.parent_call_id && (
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black uppercase">Follow-up</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Medium</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                    {call.receive_type}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button onClick={() => setViewTarget(call)} className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all">
                  <MdVisibility size={16} /> View
                </button>
                <button onClick={() => openEdit(call)} className="flex-1 h-10 rounded-xl bg-[#132ea7]/10 text-[#132ea7] font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/20 transition-all">
                  <MdEdit size={16} /> Edit
                </button>
                <button onClick={() => setConfirmDelete(call)} className="flex-1 h-10 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-red-100 transition-all">
                  <MdDelete size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">Prev</button>
            <span className="text-sm font-bold text-slate-500">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Edit Call Log" : "Log New Call"}
        size="lg"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
           {/* Client Selector */}
    <div>
      <label className="block mb-2 font-bold text-slate-700 text-sm">
        Select Client <span className="text-slate-400 font-normal">(optional)</span>
      </label>
      <Select
        name="client_id"
        value={form.client_id}
        onChange={handleClientSelect}
        options={[
          { label: "-- Select existing client --", value: "" },
          ...clients.map((c) => ({
            label: c.company ? `${c.name} — ${c.company}` : c.name,
            value: c.id,
          })),
        ]}
      />
      {form.client_id && (
        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, client_id: "" }))}
          className="mt-1 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest"
        >
          ✕ Clear client
        </button>
      )}
    </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Caller Name"
              name="caller_name"
              value={form.caller_name}
              onChange={handleChange}
              error={fieldErrors.caller_name}
              placeholder="e.g. Rahul Shah"
              required
            />

            <Input
              label="Caller Number"
              name="caller_number"
              value={form.caller_number}
              onChange={handleChange}
              placeholder="e.g. +91 98765 43210"
            />

            <div className="md:col-span-2">
              <Select
                label="Project"
                name="project_id"
                value={form.project_id}
                onChange={handleChange}
                options={projectOptions}
                error={fieldErrors.project_id}
                placeholder="Select associated project..."
              />
            </div>

            <Select
              label="Call Type"
              name="call_type"
              value={form.call_type}
              onChange={handleChange}
              options={callTypeOptions}
              error={fieldErrors.call_type}
              placeholder="Select core classification..."
              required
            />

            <Select
              label="Call Subtype"
              name="call_subtype"
              value={form.call_subtype}
              onChange={handleChange}
              options={subtypeOptions}
              error={fieldErrors.call_subtype}
              placeholder={
                form.call_type
                  ? "Select specific subtype..."
                  : "Select type first"
              }
              disabled={!form.call_type}
              required
            />

            <div className="md:col-span-2">
              <Select
                label="Communication Medium"
                name="receive_type"
                value={form.receive_type}
                onChange={handleChange}
                options={RECEIVE_OPTIONS}
                error={fieldErrors.receive_type}
                placeholder="Select medium..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="Executive Summary"
                name="call_summary"
                value={form.call_summary}
                onChange={handleChange}
                placeholder="Brief summary of the contact objectives..."
                rows={3}
              />
            </div>

                      {/* Remarks section in edit modal */}
<div className="md:col-span-2 space-y-3">
  <div className="flex items-center justify-between ml-1">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
      Remarks
    </label>
    {/* + button to toggle new remark input */}
    <button
      type="button"
      onClick={() => setShowNewRemark((prev) => !prev)}
      className="flex items-center gap-1 px-3 py-1.5 bg-[#132ea7]/10 text-[#132ea7] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#132ea7]/20 transition-all"
    >
      <MdAdd size={14} />
      {showNewRemark ? "Cancel" : "Add Remark"}
    </button>
  </div>

  {/* Existing remarks log */}
  {Array.isArray(editTarget?.remarks) && editTarget.remarks.length > 0 ? (
    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
      {[...editTarget.remarks].reverse().map((r, i) => (
        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-sm font-bold text-slate-700">{r.text}</p>
          <div className="flex justify-between mt-1.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {r.added_by_name}
            </p>
            <p className="text-[10px] font-bold text-slate-300">
              {new Date(r.created_at).toLocaleString("default", {
                month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit"
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    editTarget && (
      <p className="text-xs font-bold text-slate-400 text-center py-3">No remarks yet</p>
    )
  )}

  {/* New remark input — shown when + is clicked */}
  {showNewRemark && (
    <Textarea
      name="remark"
      value={form.remark}
      onChange={handleChange}
      placeholder="Add a new remark..."
      rows={2}
    />
  )}

  {/* On create — always show the textarea */}
  {/* {!editTarget && (
    <Textarea
      label="Initial Remark (optional)"
      name="remark"
      value={form.remark}
      onChange={handleChange}
      placeholder="Add a remark..."
      rows={2}
    />
  )} */}
</div>


            {/* New fields — create only */}
            {!editTarget && (
              <>
                {/* Transfer To */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                    Transfer To{" "}
                    <span className="text-slate-300 font-bold normal-case tracking-normal">
                      (optional)
                    </span>
                  </label>
                  {/* <select
                    name="transfer_to"
                    value={form.transfer_to}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all"
                  >
                    <option value="">No Transfer</option>
                            {assignableUsers.map((u) => {
      // find their role in this project if project is selected
      const project = projects.find((p) => p.id === form.project_id);
      const membership = project?.members?.find(
        (m) => (m.user_id || m.user?.id) === u.id
      );
      const roleLabel = membership?.role?.name;
      return (
        <option key={u.id} value={u.id}>
          {u.name} ({u.employee_id}){roleLabel ? ` — ${roleLabel}` : ""}
        </option>
      );
    })}
                  </select> */}

                   <LocalSearchableSelect
      options={assignableUsers}
                          value={form.transfer_to}
      onChange={(id) => setForm((prev) => ({ ...prev, transfer_to: id }))}
      disabled={form.project_id && assignableUsers.length === 0}
      emptyOptionLabel="Self Assign"
      placeholder="Search employee by name or ID..."
      getId={(u) => u.id}
      getLabel={(u) => {
        const project = projects.find((p) => p.id === form.project_id);
        const membership = project?.members?.find((m) => (m.user_id || m.user?.id) === u.id);
        const roleLabel = membership?.role?.name;
        return `${u.name} (${u.employee_id})${roleLabel ? ` — ${roleLabel}` : ""}`;
      }}
      getSearchText={(u) => `${u.name} ${u.employee_id}`}
    />
                </div>

                {/* Follow-up toggle — only when no transfer */}
                {!form.transfer_to && (
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-sm font-black text-slate-700 uppercase tracking-widest">
                          Follow-up Call
                        </p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                          {form.is_follow_up
                            ? "This call follows up on a previous request"
                            : "Mark if calling client back after resolving their request"}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_follow_up"
                          checked={form.is_follow_up}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#132ea7]" />
                      </label>
                    </div>
                  </div>
                )}

                {/* Original call selector */}
                {form.is_follow_up && !form.transfer_to && (
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                      Original Call <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="parent_call_id"
                      value={form.parent_call_id}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 border ${fieldErrors.parent_call_id ? "border-red-400" : "border-slate-100"} rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all`}
                    >
                      <option value="">Select the original call...</option>
                      {ownCalls.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.display_id ? `[${c.display_id}] ` : ""}
                          {c.caller_name} — {c.call_subtype} (
                          {new Date(c.createdAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.parent_call_id && (
                      <p className="text-red-500 text-[10px] font-bold uppercase ml-1">
                        {fieldErrors.parent_call_id}
                      </p>
                    )}
                    <p className="text-[10px] font-bold text-slate-400 ml-1">
                      Select the call where the client originally made the
                      request
                    </p>
                  </div>
                )}

                {/* is_task toggle — no transfer */}
                {!form.transfer_to && (
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-sm font-black text-slate-700 uppercase tracking-widest">
                          Auto-Create Task
                        </p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                          {form.is_task
                            ? "A task will be auto-created from this call"
                            : "Log call only"}
                        </p>
                        {form.is_task && !form.project_id && (
                          <p className="text-xs font-bold text-amber-500 mt-1">
                            ⚠ Select a project to enable task creation
                          </p>
                        )}
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_task"
                          checked={form.is_task}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#132ea7]" />
                      </label>
                    </div>
                  </div>
                )}

                {/* Assign task to */}
                {form.is_task && !form.transfer_to && (
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                      Assign Task To{" "}
                      <span className="text-slate-300 font-bold normal-case tracking-normal">
                        (blank = self)
                      </span>
                    </label>
                    <select
                      name="task_assigned_to"
                      value={form.task_assigned_to}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all"
                    >
                      <option value="">Self Assign</option>
                              {assignableUsers.map((u) => {
      // find their role in this project if project is selected
      const project = projects.find((p) => p.id === form.project_id);
      const membership = project?.members?.find(
        (m) => (m.user_id || m.user?.id) === u.id
      );
      const roleLabel = membership?.role?.name;
      return (
        <option key={u.id} value={u.id}>
          {u.name} ({u.employee_id}){roleLabel ? ` — ${roleLabel}` : ""}
        </option>
      );
    })}
                    </select>
                  </div>
                )}

                {/* Follow-up + is_task combined banner */}
                {form.is_follow_up && form.is_task && (
                  <div className="md:col-span-2 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3">
                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest">
                      Follow-up call with new task — prefix:{" "}
                      {form.task_assigned_to ? "CTA" : "CT"}
                    </p>
                    <p className="text-xs font-bold text-amber-500 mt-1">
                      Link to original call is preserved
                    </p>
                  </div>
                )}
              </>
            )}
          </div>


 {/* Prefix banner */}
          {!editTarget && (
            <div className="bg-[#132ea7]/5 border border-[#132ea7]/10 rounded-2xl px-5 py-3">
              <p className="text-xs font-black text-[#132ea7] uppercase tracking-widest">
                Display ID prefix:{" "}
                <span className="text-[#e98937]">{expectedPrefix}</span>
                <span className="text-slate-400 font-bold normal-case tracking-normal ml-2">
                  — {PREFIX_INFO[expectedPrefix]}
                </span>
              </p>
            </div>
          )}


          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Button
              variant="ghost"
              className="flex-1 font-black uppercase tracking-widest text-sm"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm"
              loading={submitting}
            >
              {editTarget ? "Authorize Update" : "Create Call Log"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        show={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Call Details"
        size="lg"
      >
        {viewTarget && (
          <div className="space-y-5 py-2">
            <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-[#132ea7]/20 shrink-0">
                {viewTarget.caller_name?.charAt(0) || <MdPhone size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-black text-slate-800">
                    {viewTarget.caller_name}
                  </h3>
                  <Badge value={viewTarget.call_type} />
                </div>
                <p className="text-[10px] font-black text-slate-400 font-mono mt-1">
                  {viewTarget.display_id || "—"}
                </p>
                {viewTarget.caller_number && (
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    {viewTarget.caller_number}
                  </p>
                )}
                
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                              <label className="text-xs font-black text-slate-400 uppercase">Logged By</label>
                                <Badge value={viewTarget.caller?.name || viewTarget.User?.name || "—"} />
                              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Subtype", value: viewTarget.call_subtype || "—" },
                { label: "Medium", value: viewTarget.receive_type || "—" },
                { label: "Project", value: viewTarget.project?.name || "—" },
                {
                  label: "Date",
                  value: new Date(viewTarget.createdAt).toLocaleDateString(),
                },
                { label: "Has Task", value: viewTarget.is_task ? "Yes" : "No" },
                {
                  label: "Updated",
                  value: new Date(viewTarget.updatedAt).toLocaleDateString(),
                },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {item.label}
                  </p>
                  <p className="font-black text-slate-700 text-sm">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {viewTarget.transfer_to && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <MdTransferWithinAStation
                  size={20}
                  className="text-orange-500 shrink-0"
                />
                <div>
                  <p className="text-xs font-black text-orange-600 uppercase tracking-widest">
                    Transferred To
                  </p>
                  <p className="text-sm font-bold text-orange-700 mt-0.5">
                    {users.find((u) => u.id === viewTarget.transfer_to)?.name ||
                      viewTarget.transfer_to}
                  </p>
                </div>
              </div>
            )}

            {viewTarget.parent_call_id && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <MdPhone size={18} className="text-purple-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">
                    Follow-up for original call
                  </p>
                  <p className="text-xs font-bold text-purple-700 font-mono mt-0.5">
                    {calls.find((c) => c.id === viewTarget.parent_call_id)
                      ?.display_id || viewTarget.parent_call_id}
                  </p>
                </div>
              </div>
            )}

            {viewTarget.call_summary && (
              <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MdInfoOutline size={14} /> Summary
                </p>
                <p className="font-medium leading-relaxed opacity-90 italic">
                  "{viewTarget.call_summary}"
                </p>
              </div>
            )}

            {viewTarget.remarks &&
              Array.isArray(viewTarget?.remarks) &&
              viewTarget.remarks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Remarks ({viewTarget.remarks.length})
                  </p>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                    {[...viewTarget.remarks].reverse().map((r, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <p className="text-sm font-bold text-slate-700">
                          {r.text}
                        </p>
                        <div className="flex justify-between mt-1.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase">
                            {r.added_by_name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-300">
                            {new Date(r.created_at).toLocaleString("default", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                onClick={() => setViewTarget(null)}
                className="font-black uppercase tracking-widest text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        show={!!confirmDelete}
        message={`Permanently delete call record for "${confirmDelete?.caller_name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
      <ExportModalMine show={showExportModal} onClose={() => setShowExportModal(false)} types={["calls"]} />
    </div>
  );
};

export default MyCalls;
