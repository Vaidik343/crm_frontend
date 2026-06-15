import { useEffect, useMemo, useState } from "react";
import { useCall } from "../../context/CallContext";
import { useProject } from "../../context/ProjectContext";
import { useTask } from './../../context/TaskContext';
import { useAuth } from './../../context/AuthContext';
import { useUser } from './../../context/UserContext';
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
import { MdEdit, MdDelete, MdSearch,MdComment, MdAssignment , MdVisibility, MdTransferWithinAStation ,MdPhone, MdFolder, MdCalendarToday, MdInfoOutline, MdAdd } from "react-icons/md";

const CALL_TYPES = {
  inquiry:   ["inquiry", "follow-back"],
  request:   ["other", "update", "new development"],
  complaint: ["bug", "error solve"],
};

const RECEIVE_OPTIONS = [
  { value: "call",    label: "Call" },
  { value: "msg",     label: "Message" },
  { value: "email",   label: "Email" },
  { value: "meeting", label: "Meeting" },
];

const FILTER_OPTIONS = [
  { value: "all",       label: "All" },
  { value: "inquiry",   label: "Inquiry" },
  { value: "request",   label: "Request" },
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
  caller_name:   "",
  caller_number: "",
  client_id: "",
  project_id:    "",
  call_type:     "",
  call_subtype:  "",
  receive_type:  "",
  call_summary:  "",
  remarks:       "",
  is_task:       false,
  transfer_to:      "",
  task_assigned_to: "",
  is_follow_up: false,
  parent_call_id:   "",
};


// -Derive expected display id prefix from..

const getExpectedPrefix = (form) => {
  if(form.transfer_to)  return "CTR";
  if(form.is_task && form.task_assigned_to) return "CTA";
  if(form.is_task) return "CT";
   if (form.is_follow_up && form.parent_call_id) return "CFB";
  return "C";
};


const Calls = () => {
  const { calls, loading, page, limit, setPage, totalPages, getAllCalls, createCall, updateCall, deleteCall } = useCall();
  const { projects, getAllProjects } = useProject();
  const {getAllTasks, page: taskPage} = useTask()
const { clients, getAllClients } = useClient();

  const {users, getAllUsers} = useUser(); 
  const {user: authUser} = useAuth();

  const [filter, setFilter]               = useState("all");
  const [showModal, setShowModal]         = useState(false);
  const [viewTarget, setViewTarget]       = useState(null);
  const [editTarget, setEditTarget]       = useState(null);
  const [form, setForm]                   = useState(initialForm);
  const [fieldErrors, setFieldErrors]     = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [alert, setAlert]                 = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);
  const [search, setSearch] = useState("");

  const [remarksTarget, setRemarksTarget] = useState(null);
const [remarkText, setRemarkText]       = useState("");
const [remarkSubmitting, setRemarkSubmitting] = useState(false);
const [showNewRemark, setShowNewRemark] = useState(false);


const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");
const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    getAllCalls?.(page, dateFrom, dateTo, limit, search);
    getAllProjects?.();
    getAllUsers?.();
    getAllClients?.()
  }, [page, dateFrom, dateTo]);

useEffect(() => {
  const debounce = setTimeout(() => {
    setPage(1);
    getAllCalls?.(1, dateFrom, dateTo, limit, search);
  }, 300);

  return () => clearTimeout(debounce);
}, [search]);
      // Members of the selected project — falls back to all users if no project selected
  const assignableUsers = useMemo(() => {
    if (!form.project_id) return users;
    const project = projects.find((p) => p.id === form.project_id);
    if (!project?.members?.length) return [];
    const memberUserIds = project.members.map((m) => m.user_id || m.user?.id);
    return users.filter((u) => memberUserIds.includes(u.id));
  }, [form.project_id, projects, users]);
  
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));

  const callTypeOptions = Object.keys(CALL_TYPES).map((t) => ({
    value: t, label: t.charAt(0).toUpperCase() + t.slice(1),
  }));

  const subtypeOptions = form.call_type
    ? CALL_TYPES[form.call_type].map((s) => ({ value: s, label: s }))
    : [];

    // Own calls for parent_call_id dropdown (follow-up);
    const otherUsers = users.filter((u) => u.id !== authUser?.id);

    //Own calls for parent_call_id dropdown (follow up)
    const ownCalls = calls.filter( (c) => !c.parent_call_id && !c.transfer_to)

  const filtered = filter === "all" ? calls : calls.filter((c) => c.call_type === filter);

  const expectedPrefix = getExpectedPrefix(form);

//filter

const searchData = search.toLowerCase().trim();

const filteredCalls = (calls || []).filter((c) => {
  const matchesType =
    filter === "all" || c.call_type === filter;

  const matchesSearch =
    !searchData ||
    c.caller_name?.toLowerCase().includes(searchData) ||
    c.display_id?.toLowerCase().includes(searchData) ||
    c.project?.name?.toLowerCase().includes(searchData);

  return matchesType && matchesSearch;
});


  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
 if (name === "call_type") {
    setForm((prev) => ({ ...prev, call_type: newValue, call_subtype: "" }));
  } else if (name === "transfer_to") {
    setForm((prev) => ({ ...prev, transfer_to: newValue, is_task: false, task_assigned_to: "", is_follow_up: false, parent_call_id: "" }));
  } else if (name === "is_task" && !checked) {
    setForm((prev) => ({ ...prev, is_task: false, task_assigned_to: "" }));
  } else if (name === "is_follow_up" && !checked) {
    setForm((prev) => ({ ...prev, is_follow_up: false, parent_call_id: "" }));
  } else {
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
  if (form.is_follow_up && !form.parent_call_id) errors.parent_call_id = "Select the original call";
    // if (form.transfer_to === authUser?.id)           errors.transfer_to   = "Cannot transfer to yourself";
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
      caller_name:   call.caller_name   || "",
      caller_number: call.caller_number || "",
      client_id:     call.client_id     || "", 
      project_id:    call.project_id    || null,
      call_type:     call.call_type     || "",
      call_subtype:  call.call_subtype  || "",
      receive_type:  call.receive_type  || "",
      call_summary:  call.call_summary  || "",
      remarks:       "",
      is_task:       call.is_task       || false,
       transfer_to:      "",
      task_assigned_to: "",
      follow_up:   "",
      parent_call_id:   "",
    });
    setFieldErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
     setShowNewRemark(false); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //  console.log("UPDATE PAYLOAD", form);
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSubmitting(true);
      if (editTarget) {
         const updated =  await updateCall(editTarget.id, form);
          // console.log("🚀 ~ handleSubmit ~ updated:", updated)
          if (viewTarget?.id === editTarget.id) {
        setViewTarget(updated.call || updated);
      }
        setAlert({ type: "success", message: "Call updated successfully" });
      } else {
        const payload = {
          ...form,
          project_id:    form.project_id    || null,
          caller_number: form.caller_number || null,
          call_summary:  form.call_summary  || null,
          remarks:       form.remarks       || null,
           is_task:          form.is_task          || false,
          transfer_to:      form.transfer_to      || null,
          task_assigned_to: form.task_assigned_to || null,
         parent_call_id:   form.is_follow_up ? (form.parent_call_id || null) : null,
        };
        const cc = await createCall(payload);
       
        if (cc?.task) {
           await getAllTasks(taskPage); // ← refresh task list
          setAlert({ type: "success", message: "Call logged and task auto-created successfully" });
        } else {
          setAlert({ type: "success", message: "Call logged successfully" });
        }
      }
      closeModal();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Something went wrong" });
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
      setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };


  // Handler — when client selected, auto-fill name + number
const handleClientSelect = (e) => {
  const clientId = e.target.value;
  const client = clients.find((c) => c.id === clientId);
  setForm((prev) => ({
    ...prev,
    client_id: clientId,
    caller_name: client?.name || prev.caller_name,
    caller_number: client?.phone || prev.caller_number,
  }));
};


  if (loading && !calls.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Accessing comms archives...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            CALL <span className="text-[#132ea7]">Logs</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Total calls: {calls.length}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <select
            className="bg-white border border-slate-100 text-slate-600 text-sm font-bold rounded px-3 focus:outline-none focus:border-[#132ea7]/30 focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none shadow-sm cursor-pointer h-[52px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

 <div className="flex flex-wrap items-center gap-3">
{/* Date range filter */}
    <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm">



        
      <label className="text-xs font-black text-slate-400 uppercase">From</label>
      <input type="date" value={dateFrom} max={today} onChange={(e) => setDateFrom(e.target.value)}
        className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold" />
        

              <label className="text-xs font-black text-slate-400 uppercase">To</label>
      <input type="date" value={dateTo} max={today} onChange={(e) => setDateTo(e.target.value)}
        className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold" />

      {(dateFrom || dateTo) && (
        <button
          onClick={() => { setDateFrom(""); setDateTo(""); }}
          className="text-[10px] font-black text-[#132ea7] uppercase tracking-widest hover:underline whitespace-nowrap"
        >
          Show All
        </button>
      )}
    </div>

{/* search */}
            <div className="relative w-full md:w-95">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <MdSearch size={20} />
                              </div>
                              <input
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 focus:border-[#132ea7] transition-all shadow-sm"
                                placeholder="Search Tasks Display Id and Projects..."
                                value={search}
onChange={(e) => setSearch(e.target.value)}
                              />
                            </div>
          <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 px-6 rounded font-black uppercase tracking-widest text-sm whitespace-nowrap h-[52px]" onClick={openCreate}>
            <MdAdd size={20} className="mr-1" /> Log New Call
          </Button>
        </div>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Display ID</th>
                {/* <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Register Time</th> */}
                <th className="px-10 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Caller Info</th>
                <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Project</th>
                <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">Medium</th>
                <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-10 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>


            <tbody className="divide-y divide-slate-50">
              {filteredCalls.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">No communication logs archived.</td>
                </tr>
              )}
              {filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-slate-50/80 transition-colors group">

                  {/* Display ID */}
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[11px] font-black uppercase tracking-widest font-mono">
                      {call.display_id || "—"}
                    </span>
                  </td>

{/* <td className="px-10 py-6">
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
                  </td> */}
                  {/* Caller */}
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center font-black shadow-lg shadow-[#132ea7]/10">
                        {call.caller_name?.charAt(0) || <MdPhone size={18} />}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-lg leading-tight">{call.caller_name}</div>
                        {call.caller_number && (
                          <div className="text-xs font-bold text-slate-400 mt-1">
                            {call.caller_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  {/* Employee */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px]">
                        {call.caller?.name?.charAt(0) || call.User?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700">{call.caller?.name || call.User?.name || "—"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{call.caller?.employee_id || call.User?.employee_id || ""}</p>
                      </div>
                    </div>
                  </td>

                  {/* Project */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <MdFolder className="text-slate-300" size={18} />
                      {call.project?.name || call.Project?.name || "—"}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div>
                        <Badge value={call.call_type} />
                      </div>
                      {/* Flags */}
                      <div className="flex gap-1.5 flex-wrap">
                        {call.is_task && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                            <MdAssignment size={12} /> Task
                          </span>
                        )}
                        {call.transfer_to && (
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                            <MdTransferWithinAStation size={12} /> Transfer
                          </span>
                        )}
                        {call.parent_call_id && (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[10px] font-black uppercase">
                            Follow-up
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Medium */}
                  <td className="px-8 py-6">
                    <Badge value={call.receive_type} />
                  </td>

                  {/* Date */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                      <MdCalendarToday className="text-slate-300" size={16} />
                      {new Date(call.createdAt).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => setViewTarget(call)} title="View" className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all">
                        <MdVisibility size={20} />
                      </button>
                      <button onClick={() => openEdit(call)} title="Edit" className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all">
                        <MdEdit size={20} />
                      </button>
                      <button onClick={() => setConfirmDelete(call)} title="Delete" className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
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
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">Previous</button>
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i+1} onClick={() => setPage(i+1)} className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i+1 ? "bg-[#132ea7] text-white" : "bg-slate-100 text-slate-700"}`}>{i+1}</button>
            ))}
          </div>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredCalls.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
            No communication logs archived.
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div key={call.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              {/* Card Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center font-black shrink-0">
                  {call.caller_name?.charAt(0) || <MdPhone size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 leading-tight truncate">{call.caller_name}</p>
                  {call.caller_number && <p className="text-xs font-bold text-slate-400">{call.caller_number}</p>}
                </div>
                <span className="shrink-0 px-2 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[10px] font-black uppercase tracking-widest font-mono">
                  {call.display_id || "—"}
                </span>
              </div>

              {/* Meta rows */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Employee</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[9px]">
                      {call.caller?.name?.charAt(0) || call.User?.name?.charAt(0) || "?"}
                    </div>
                    <span className="font-bold text-slate-700 text-xs">{call.caller?.name || call.User?.name || "—"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Project</span>
                  <div className="flex items-center gap-1.5">
                    <MdFolder className="text-slate-300" size={14} />
                    <span className="font-bold text-slate-700 text-xs">{call.project?.name || call.Project?.name || "—"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Type</span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <Badge value={call.call_type} />
                    {call.is_task && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                        <MdAssignment size={10} /> Task
                      </span>
                    )}
                    {call.transfer_to && (
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                        <MdTransferWithinAStation size={10} /> Transfer
                      </span>
                    )}
                    {call.parent_call_id && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[10px] font-black uppercase">Follow-up</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Medium</span>
                  <Badge value={call.receive_type} />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Date</span>
                  <div className="flex items-center gap-1.5">
                    <MdCalendarToday className="text-slate-300" size={13} />
                    <span className="font-bold text-slate-700 text-xs">
                      {new Date(call.createdAt).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setViewTarget(call)}
                  className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
                >
                  <MdVisibility size={16} /> View
                </button>
                <button
                  onClick={() => openEdit(call)}
                  className="flex-1 h-10 rounded-xl bg-[#132ea7]/10 text-[#132ea7] font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/20 transition-all"
                >
                  <MdEdit size={16} /> Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(call)}
                  className="flex-1 h-10 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-red-100 transition-all"
                >
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
      <Modal show={showModal} onClose={closeModal} title={editTarget ? "Edit Call Log" : "Log New Call"} size="lg">

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Client selector  */}
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
      onClick={() => setForm((prev) => ({ ...prev, client_id: "", }))}
      className="mt-1 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest"
    >
      ✕ Clear client
    </button>
  )}
</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Input label="Caller Name" name="caller_name" value={form.caller_name}
              onChange={handleChange} error={fieldErrors.caller_name}
              placeholder="e.g. Rahul Shah" required />

            <Input label="Caller Number" name="caller_number" value={form.caller_number}
              onChange={handleChange} placeholder="e.g. +91 98765 43210" />

            <div className="md:col-span-2">
              <Select label="Project" name="project_id" value={form.project_id}
                onChange={handleChange} options={projectOptions}
                error={fieldErrors.project_id} placeholder="Select associated project..." />
            </div>

            <Select label="Call Type" name="call_type" value={form.call_type}
              onChange={handleChange} options={callTypeOptions}
              error={fieldErrors.call_type} placeholder="Select core classification..." required />

            <Select label="Call Subtype" name="call_subtype" value={form.call_subtype}
              onChange={handleChange} options={subtypeOptions}
              error={fieldErrors.call_subtype}
              placeholder={form.call_type ? "Select specific subtype..." : "Select type first"}
              disabled={!form.call_type} required />

            <div className="md:col-span-2">
              <Select label="Communication Medium" name="receive_type" value={form.receive_type}
                onChange={handleChange} options={RECEIVE_OPTIONS}
                error={fieldErrors.receive_type} placeholder="Select medium..." required />
            </div>

            <div className="md:col-span-2">
              <Textarea label="Executive Summary" name="call_summary" value={form.call_summary}
                onChange={handleChange} placeholder="Brief summary of the contact objectives..." rows={3} />
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

            {/* ── New fields — only on create ────────────────────── */}
            {!editTarget && (
  <>
    {/* Transfer To */}
    <div className="md:col-span-2 space-y-1.5">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
        Transfer Call To <span className="text-slate-300 font-bold normal-case">(optional)</span>
      </label>
      <select name="transfer_to" value={form.transfer_to} onChange={handleChange}
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all">
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
      </select>
    </div>

    {/* Follow-up toggle — only when no transfer */}
    {!form.transfer_to && (
      <div className="md:col-span-2">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Follow-Back Call</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              {form.is_follow_up
                ? "Calling client back after resolving their request"
                : "Mark if this is a callback after completing a previous request"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="is_follow_up" checked={form.is_follow_up}
              onChange={handleChange} className="sr-only peer" />
            <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#132ea7]" />
          </label>
        </div>
      </div>
    )}

    {/* Original call selector — shown when is_follow_up */}
    {form.is_follow_up && !form.transfer_to && (
      <div className="md:col-span-2 space-y-1.5">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
          Original Call <span className="text-red-500">*</span>
        </label>
        <select name="parent_call_id" value={form.parent_call_id} onChange={handleChange}
          className={`w-full bg-slate-50 border ${fieldErrors.parent_call_id ? "border-red-400" : "border-slate-100"} rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all`}>
          <option value="">Select the call where client made the request...</option>
          {ownCalls.map((c) => (
            <option key={c.id} value={c.id}>
              {c.display_id ? `[${c.display_id}] ` : ""}{c.caller_name} — {c.call_subtype} ({new Date(c.createdAt).toLocaleDateString()})
            </option>
          ))}
        </select>
        {fieldErrors.parent_call_id && (
          <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{fieldErrors.parent_call_id}</p>
        )}
        {/* <p className="text-[10px] font-bold text-slate-400 ml-1">
          e.g. Jay Shah called about banner change — select that call here
        </p> */}
      </div>
    )}

    {/* is_task toggle — no transfer */}
    {!form.transfer_to && (
      <div className="md:col-span-2">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Auto-Create Task</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              {form.is_task ? "A task will be auto-created from this call" : "Log call only"}
            </p>
            {form.is_task && !form.project_id && (
              <p className="text-xs font-bold text-amber-500 mt-1">⚠ Select a project to enable task creation</p>
            )}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="is_task" checked={form.is_task}
              onChange={handleChange} className="sr-only peer" />
            <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#132ea7]" />
          </label>
        </div>
      </div>
    )}

    {/* Assign task to */}
    {form.is_task && !form.transfer_to && (
      <div className="md:col-span-2 space-y-1.5">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
          Assign Task To <span className="text-slate-300 font-bold normal-case">(blank = self)</span>
        </label>
        <select name="task_assigned_to" value={form.task_assigned_to} onChange={handleChange}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all">
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

    {/* Follow-up + task combined info */}
    {form.is_follow_up && form.is_task && (
      <div className="md:col-span-2 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3">
        <p className="text-xs font-black text-amber-600 uppercase tracking-widest">
          Follow-Back call with new task — prefix: {form.task_assigned_to ? "CTA" : "CT"}
        </p>
        <p className="text-xs font-bold text-amber-500 mt-1">
          Link to original call is preserved
        </p>
      </div>
    )}
  </>
)}
          </div>

  {/* Prefix info banner */}
          {!editTarget && (
            <div className="bg-[#132ea7]/5 border border-[#132ea7]/10 rounded-2xl px-5 py-3">
              <p className="text-xs font-black text-[#132ea7] uppercase tracking-widest">
                Display ID prefix: <span className="text-[#e98937]">{expectedPrefix}</span>
                <span className="text-slate-400 font-bold normal-case tracking-normal ml-2">— {PREFIX_INFO[expectedPrefix]}</span>
              </p>
            </div>
          )}
          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm" loading={submitting}>
              {editTarget ? "Authorize Update" : "Archive Call Log"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Call Details" size="lg">
       {viewTarget && (
          <div className="space-y-6 py-2">

            {/* Header */}
            <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-[#132ea7]/20 shrink-0">
                {viewTarget.caller_name?.charAt(0) || <MdPhone size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-black text-slate-800">{viewTarget.caller_name}</h3>
                  <Badge value={viewTarget.call_type} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
                  {viewTarget.display_id || "No display ID"}
                </p>
                {viewTarget.caller_number && (
                  <p className="text-xs font-bold text-slate-400 mt-1">{viewTarget.caller_number}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-xs font-black text-slate-400 uppercase">Logged By</label>
                  <Badge value={viewTarget.caller?.name || viewTarget.User?.name || "—"} />
                </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Subtype",    value: viewTarget.call_subtype || "—" },
                { label: "Medium",     value: viewTarget.receive_type || "—" },
                { label: "Project",    value: viewTarget.project?.name || viewTarget.Project?.name || "—" },
                // { label: "Logged By",  value: viewTarget.caller?.name || viewTarget.User?.name || "—" },
                { label: "Date",       value: new Date(viewTarget.createdAt).toLocaleDateString() },
                { label: "Has Call Transfer",   value: viewTarget.transfer_to ? "Yes" : "No" },
                { label: "Has Task",   value: viewTarget.is_task ? "Yes" : "No" },
                { label: "Has Task Assigned",   value: viewTarget.task_assigned_to ? "Yes" : "No" },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="font-black text-slate-700 text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Transfer info */}
            {viewTarget.transfer_to && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <MdTransferWithinAStation size={20} className="text-orange-500 shrink-0" />
                <div>
                  <p className="text-xs font-black text-orange-600 uppercase tracking-widest">Call Transferred</p>
                  <p className="text-sm font-bold text-orange-700 mt-0.5">
                    {users.find((u) => u.id === viewTarget.transfer_to)?.name || viewTarget.transfer_to}
                  </p>
                </div>
              </div>
            )}

            {/* Task assign info */}
            {viewTarget.task_assigned_to && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <MdTransferWithinAStation size={20} className="text-blue-500 shrink-0" />
                <div>
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Task Assigned To</p>
                  <p className="text-sm font-bold text-blue-700 mt-0.5">
                    {users.find((u) => u.id === viewTarget.task_assigned_to)?.name || viewTarget.task_assigned_to}
                  </p>
                </div>
              </div>
            )}

            {/* Follow-up info */}
            {/* {viewTarget.follow_up_date && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <MdCalendarToday size={20} className="text-purple-500 shrink-0" />
                <div>
                  <p className="text-xs font-black text-purple-600 uppercase tracking-widest">Follow-up Scheduled</p>
                  <p className="text-sm font-bold text-purple-700 mt-0.5">
                    {new Date(viewTarget.follow_up_date).toLocaleString("default", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )} */}

            {/* Parent call */}
            {viewTarget.parent_call_id && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <MdPhone size={18} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Follow-Back for original call</p>
                  <p className="text-xs font-bold text-[#132ea7] mt-0.5 font-mono">
                    {calls.find((c) => c.id === viewTarget.parent_call_id)?.display_id || viewTarget.parent_call_id}
                  </p>
                </div>
              </div>
            )}

            {/* Summary */}
            {viewTarget.call_summary && (
              <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MdInfoOutline size={14} /> Summary
                </p>
                <p className="font-medium leading-relaxed opacity-90 italic">"{viewTarget.call_summary}"</p>
              </div>
            )}

            {/* Remarks log */}
            {viewTarget.remarks && Array.isArray(viewTarget.remarks) && viewTarget.remarks.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Remarks ({viewTarget.remarks.length})
                </p>
                <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                  {[...viewTarget.remarks].reverse().map((r, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-sm font-bold text-slate-700">{r.text}</p>
                      <div className="flex justify-between mt-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase">{r.added_by_name}</p>
                        <p className="text-[10px] font-bold text-slate-300">
                          {new Date(r.created_at).toLocaleString("default", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setViewTarget(null)} className="font-black uppercase tracking-widest text-xs">Close</Button>
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

    
    </div>
  );
};

export default Calls;
