  import { useEffect, useState, useMemo } from "react";
  import { useTask } from "../../context/TaskContext";
  import { useProject } from "../../context/ProjectContext";
  import { useCall } from "../../context/CallContext";
  import { useTeam } from "../../context/TeamContext";
  import { useAuth } from "../../context/AuthContext";

  import Input from "../../components/ui/Input";
  import Button from "../../components/ui/Button";
  import Modal from "../../components/ui/Modal";
  import Alert from "../../components/ui/Alert";
  import Textarea from "../../components/ui/Textarea";
  import ConfirmDialog from "../../components/ui/ConfirmDialog";
  import Spinner from "../../components/ui/Spinner";
  import Badge, { DueDateBadge } from "../../components/ui/Badge";
  import ExportModalMine from "../../components/ui/ExportModalMine";
  import {
    MdAdd,
    MdAssignment,
    MdEdit,
    MdDelete,
    MdFolder,
    MdVisibility,
    MdCalendarToday,
    MdInfoOutline,
    MdComment,
    MdDownload 
  } from "react-icons/md";
  import { useUser } from "../../context/UserContext";
  import LocalSearchableSelect from "../../components/ui/LocalSearchableSelect";
  import SearchableSelect from "../../components/ui/SearchableSelect";
  import { ENDPOINTS } from "../../api/endpoints";
  import SearchInput from "../../components/ui/SearchInput";
  // import ExportBar from "../../components/ui/ExportBar";


  const initialForm = {
    task: "",
    description: "",
    // team_id:     "",
    project_id: "",
    call_id: "",
    assigned_to: "",
    due_date: "",
    status: "ongoing",
    remark: "",
  }; 

  const MyTasks = () => {
    const {
      tasks,
      loading,
      page,
      limit,  
      setPage,
      totalPages,
      getAllTasks,
      createTask,
      updateTask,
      deleteTask,
    } = useTask();
    const { projects, getAllProjects } = useProject();
    const { calls, getAllCalls } = useCall();
    // const { teams, getAllTeams } = useTeam();
    const {user: authUser} = useAuth();
    const { users, getAllUsers } = useUser();
    // console.log("🚀 ~ MyTasks ~ users:", users);

    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [viewTarget, setViewTarget] = useState(null);
    // console.log("🚀 ~ MyTasks ~ viewTarget:", viewTarget);
    const [form, setForm] = useState(initialForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showNewRemark, setShowNewRemark] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

      const [selectedProject, setSelectedProject] = useState(null);
      const [selectedCall, setSelectedCall] = useState(null);
      const [dueFilter, setDueFilter] = useState(""); // "" | "overdue" | "due_soon"
      console.log("🚀 ~ Tasks ~ dueFilter:", dueFilter)


      
      const today = new Date().toISOString().split("T")[0];
      const sevenDaysAgo = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split("T")[0];
      })();
      
      const [dateFrom, setDateFrom] = useState(sevenDaysAgo);
      const [dateTo, setDateTo] = useState(today);
      
      
const [search, setSearch] = useState("");


      // Members of the selected project — falls back to all users if no project selected
  const assignableUsers = useMemo(() => {
    if (!selectedProject) return users;
    if (!selectedProject.members?.length) return [];
    const memberUserIds = selectedProject.members.map((m) => m.user_id || m.user?.id);
    return users.filter((u) => memberUserIds.includes(u.id));
  }, [selectedProject, users]);

const noSelf = assignableUsers.filter((u) => u.id !== authUser?.id)

    useEffect(() => {
  getAllTasks?.(page, dateFrom, dateTo, limit, search, dueFilter);
      getAllProjects?.();
      getAllCalls?.();
      // getAllTeams?.();
      getAllUsers?.();
    }, [page, dateFrom, dateTo, dueFilter]);



      useEffect(() => {
          const debounce = setTimeout(() => {
            setPage(1);
            getAllTasks?.(1, dateFrom, dateTo, limit, search,dueFilter);
          }, 300);
        
          return () => clearTimeout(debounce);
        }, [search]);
        
    const filtered = tasks || [];

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));

      if (name === "project_id") {
      // reset assignee when project changes — old assignee may not be in new project
      setForm((prev) => ({ ...prev, project_id: value, assigned_to: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

      if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
      const errors = {};
      if (!form.task.trim()) errors.task = "Task name is required";
      return errors;
      if ( !editTarget && !form.project_id) errors.project_id = "Project is required";
    };

    const openCreate = () => {
      setEditTarget(null);
      setForm(initialForm);
      setFieldErrors({});
        setSelectedProject(null);
    setSelectedCall(null);
      setShowModal(true);
    };

    const openEdit = (task) => {
      setEditTarget(task);
      setForm({
        task: task.task || "",
        description: task.description || "",
        assigned_to: task.assigned_to || "",
        // team_id:     task.team_id || "",
        project_id: task.project_id || "",
        call_id: task.call_id || "",
        due_date: task.due_date
          ? new Date(task.due_date).toISOString().split("T")[0]
          : "",
        status: task.status || "ongoing",
        remark: "",
      });
      setSelectedProject(task.project || null);
    setSelectedCall(task.call || null);
      setFieldErrors({});
      setShowModal(true);
    };

    const closeModal = () => {
      setShowModal(false);
      setEditTarget(null);
      setForm(initialForm);
      setFieldErrors({});
      setShowNewRemark(false);
      setSelectedProject(null);
      setSelectedCall(null);
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
          await updateTask(editTarget.id, {
            task: form.task,
            description: form.description || null,
            assigned_to: form.assigned_to || "",
            due_date: form.due_date || null,
            status: form.status,
            remark: form.remark || undefined,
          });
          setAlert({ type: "success", message: "Task updated successfully" });
        } else {
          const payload = {
            task: form.task,
            description: form.description || null,
            project_id: form.project_id || null,
            call_id: form.call_id || null,
            assigned_to: form.assigned_to || null,
            due_date: form.due_date || null,
            status: form.status || "ongoing",
            remarks: form.remark || undefined,
          };
          await createTask(payload);
          // await createTask(payload);
          setAlert({ type: "success", message: "Task created successfully" });
        }
        closeModal();
        getAllTasks?.(page, dateFrom, dateTo);
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
        await deleteTask(confirmDelete.id);
        setAlert({ type: "success", message: "Task deleted" });
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

    // ── Shared pagination UI ─────────────────────────────────────────────────
    const Pagination = ({ compact = false }) => (
      <div
        className={`flex items-center justify-between px-6 py-6 ${!compact ? "border-t border-slate-100" : ""}`}
      >
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
        >
          {compact ? "Prev" : "Previous"}
        </button>

        {compact ? (
          <span className="text-sm font-bold text-slate-500">
            {page} / {totalPages}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  page === i + 1
                    ? "bg-[#132ea7] text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );

    // loading state
    if (loading && !tasks.length)
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4 ">
          <Spinner size="lg" />
          <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
            Loading tasks...
          </p>
        </div>
      );

    return (
      <div className="space-y-8 px-4 animate-in fade-in duration-700">
        {/* Header */}

  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
    <div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
        Task <span className="text-[#132ea7]">Board</span>
      </h2>
      <p className="text-slate-500 font-bold text-base">
        Total Tasks: {tasks.length}
      </p>
    </div>

    <div className="flex flex-col lg:flex-row flex-wrap rounded items-stretch w-full lg:items-center gap-3">
      {/* Filter buttons */}
      <div className="flex items-center gap-3">
        {[
          { value: "", label: "All" },
          { value: "due_soon", label: "Due Soon" },
          { value: "overdue", label: "Overdue" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setPage(1); setDueFilter(opt.value); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              dueFilter === opt.value
                ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

               <div className="w-[19dvw] flex">                                                                                                                                                 
  <SearchInput 
    value={search}
  onChange={setSearch}
    placeholder="Search Tasks, Projects..."
  />
  </div>
  
      {/* Date range */}
      <div className="flex items-center max-w-[48dvw]  gap-2 bg-white  border flex-wrap border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
        <label className="text-xs font-black text-slate-400 uppercase">From</label>
        <input
          type="date"
          value={dateFrom}
          max={today}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 text-sm font-bold"
        />
        <label className="text-xs font-black text-slate-400 uppercase">To</label>
        <input
          type="date"
          value={dateTo}
          max={today}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 text-sm font-bold"
        />
        <button
          onClick={() => { setDateFrom(sevenDaysAgo); setDateTo(today); }}
          className="text-[10px] font-black text-[#132ea7] uppercase tracking-widest hover:underline whitespace-nowrap"
        >
          Reset
        </button>
      </div>

  
      {/* Action buttons */}
      <div className="flex gap-3">
    
        <Button
          variant="ghost"
          className="shadow-sm px-6 rounded-xl font-black uppercase tracking-widest text-sm whitespace-nowrap h-[52px] bg-white border border-slate-100"
          onClick={() => setShowExportModal(true)}
        >
          <MdDownload size={20} className="mr-1" /> Download
        </Button>
        <Button
          variant="primary"
          className="shadow-lg shadow-[#132ea7]/20 px-8 rounded-xl h-[52px] font-black uppercase tracking-widest text-sm whitespace-nowrap"
          onClick={openCreate}
        >
          <MdAdd size={22} className="mr-1" /> New Task
        </Button>
      </div>
    </div>
  </div>

        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
        />

        {/* Table */}
        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200/50">
                      <th className="px-6 py-5 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Register At
                    </th>
                    <th className="px-6 py-5 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Display ID
                    </th>
                    <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Task
                    </th>
                    <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Status
                    </th>
                    <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Assigned By
                    </th>
                    {/* <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Assigned To
                    </th> */}
                    <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Project
                    </th>
                    <th className="px-8 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em]">
                      Due Date
                    </th>
                    <th className="px-15 py-6 text-md font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tasks.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest"
                      >
                        No tasks found.
                      </td>
                    </tr>
                  )}
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
  <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#132ea7] flex items-center justify-center shadow-inner group-hover:bg-[#132ea7] group-hover:text-white transition-all">
                            <MdCalendarToday size={18} />
                          </div>
                          <div>
                            <div className="font-black text-slate-800 text-base">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {new Date(task.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Display ID */}
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[11px] font-black uppercase tracking-widest font-mono">
                          {task.display_id || "—"}
                        </span>
                      </td>

                      {/* Task */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center font-black shadow-lg shadow-[#132ea7]/10 shrink-0">
                            <MdAssignment size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-slate-800 text-lg truncate max-w-25 leading-tight">
                              {task.task}
                            </div>
                            {task.description && (
                              <div className="text-xs  text-slate-400 mt-1 truncate max-w-50 italic">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-6">
                        <Badge value={task.status} />
                      </td>

                      {/* Assigned by */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px]">
                            {task.assigner?.name?.charAt(0) || "?"}
                          </div>
                          <div className="text-sm font-black text-slate-700">
                            {task.assigner?.name || "—"}
                          </div>
                        </div>
                      </td>
                                          {/* Assigned to */}
                      {/* <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[10px]">
                            {task.assignee?.name?.charAt(0) || "?"}
                          </div>
                          <div className="text-sm font-black text-slate-600">
                            {task.assignee?.name || "—"}
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              {task.assignee?.employee_id || ""}
                            </div>
                          </div>
                        </div>
                      </td> */}

                      {/* Project */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <MdFolder className="text-slate-300" size={18} />
                          {task.project?.name || "—"}
                        </div>
                      </td>



                      {/* Due */}
                      <td className="px-8 py-6">
                              <DueDateBadge
    dueDate={task.due_date}
    status={task.status}
    completedAt={task.completed_at}
  />
                                </td>
                      {/* Actions */}
                      <td className="px-5 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setViewTarget(task)}
                            title="View"
                            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all"
                          >
                            <MdVisibility size={20} />
                          </button>
                          <button
                            onClick={() => openEdit(task)}
                            title="Edit"
                            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
                          >
                            <MdEdit size={20} />
                          </button>
                          {/* <button
                            onClick={() => setConfirmDelete(task)}
                            title="Delete"
                            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                          >
                            <MdDelete size={20} />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* pagination */}

            <Pagination />
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {tasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold">
              No tasks found.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {/* <div className="w-10 h-10 rounded-xl bg-[#132ea7] text-white flex items-center justify-center shrink-0">
                      <MdAssignment size={18} />
                    </div> */}
                    <div>
                      <p className="font-black text-slate-800 leading-tight">
                        {task.task}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 font-mono mt-0.5">
                        {task.display_id}
                      </p>
                    </div>
                  </div>
                  
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-xs text-slate-400 font-medium italic px-1 truncate">
                    {task.description}
                  </p>
                )}

                  {/* mete row */}
                <div className="space-y-2 text-sm ">
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Assigned By
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[9px]">
                        {task.assigner?.name?.charAt(0) || "?"}
                      </div>
                      <span className="font-bold text-slate-700 text-xs">
                        {task.assigner?.name || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Assigned To
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black text-[9px]">
                        {task.assignee?.name?.charAt(0) || "?"}
                      </div>
                      <span className="font-bold text-slate-700 text-xs">
                        {task.assignee?.name || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Project
                    </span>
                    <div className="flex items-center gap-1.5">
                      <MdFolder className="text-slate-300" size={14} />
                    <span className="font-bold text-slate-700 text-sm">
                      {task.project?.name || "—"}
                    </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      status
                    </span>
                <Badge value={task.status} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Due
                    </span>
                            <DueDateBadge
    dueDate={task.due_date}
    status={task.status}
    completedAt={task.completed_at}
  />
                  </div>

                  
                  {task.call?.display_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">
                        From Call
                      </span>
                      <span className="font-black text-orange-500 font-mono text-xs">
                        ← {task.call.display_id}
                      </span>
                    </div>
                  )}
                </div>

                {/* action */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setViewTarget(task)}
                    className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
                  >
                    <MdVisibility size={16} /> View
                  </button>
                  <button
                    onClick={() => openEdit(task)}
                    className="flex-1 h-10 rounded-xl  bg-[#132ea7]/10 text-[#132ea7] font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/20 transition-all"
                  >
                    <MdEdit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(task)}
                    className="flex-1 h-10 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-1.5 text-xs  hover:bg-red-100 transition-all"
                  >
                    <MdDelete size={16} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
            {/* Mobile pagination */}
        {totalPages > 1 && <Pagination compact />}
        </div>



        {/* Create / Edit Modal */}
        <Modal
          show={showModal}
          onClose={closeModal}
          title={editTarget ? "Edit Task" : "New Task"}
          size="lg"
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input
                  label="Task Name"
                  name="task"
                  value={form.task}
                  onChange={handleChange}
                  error={fieldErrors.task}
                  placeholder="e.g. Fix login bug"
                  required
                />
              </div>

                    

              {/* Project — only on create */}
              {!editTarget && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                    Project
                  </label>
      <SearchableSelect
        endpoint={ENDPOINTS.PROJECTS.ALL}
        value={form.project_id}
        selectedLabel={selectedProject ? `${selectedProject.name}${selectedProject.code ? ` (${selectedProject.code})` : ""}` : ""}
        onChange={(project) => {
          setSelectedProject(project);
          setForm((prev) => ({
            ...prev,
            project_id: project?.id || "",
            assigned_to: "",
            call_id: "",
          }));
        }}
        getLabel={(p) => `${p.name}${p.code ? ` (${p.code})` : ""}`}
        placeholder="Search project by name or code..."
        emptyOptionLabel="No Project"

          required
    error={fieldErrors.project_id}
      />
       {fieldErrors.project_id && (
      <p className="text-red-500 text-[10px] font-bold uppercase ml-1 mt-1">{fieldErrors.project_id}</p>
    )}
                </div>
              )} 



                {/* Assign to — any employee, optional-  filtered by selected project (blank = self) */}
                {!editTarget && (
                  <div className="space-y-1.5">
                    {/* <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                      Assign To <span className="text-slate-300 font-bold normal-case tracking-normal">(blank = self)</span>
                    </label> */}
                    {/* Helper text showing filter context */}
    {form.project_id && (
      <span className="text-[10px] font-bold text-[#132ea7] ml-1 mb-1 uppercase tracking-widest">
        {assignableUsers.length === 0
          ? "No members in this project"
          : `Showing ${assignableUsers.length} member${assignableUsers.length > 1 ? "s" : ""} of selected project`}
      </span>
    )}
    {!form.project_id && (
      <span className="text-[10px] font-bold text-slate-400 ml-1 mb-1 uppercase tracking-widest">
        Select a project to filter members
      </span>
    )}
    <LocalSearchableSelect
    options={noSelf}
    value={form.assigned_to}
    onChange={(id) => setForm((prev) => ({ ...prev, assigned_to: id }))}
    disabled={form.project_id && assignableUsers.length === 0}
    emptyOptionLabel="Self Assign"
    placeholder="Search employee by name or ID..."
    getId={(u) => u.id}
    getLabel={(u) => {
      const membership = selectedProject?.members?.find((m) => (m.user_id || m.user?.id) === u.id);
      const roleLabel = membership?.role?.name;
      return `${u.name} (${u.employee_id})${roleLabel ? ` — ${roleLabel}` : ""}`;
    }}
    getSearchText={(u) => `${u.name} ${u.employee_id}`}
  />             </div>
                )}


              {/* Linked call — only on create */}
              {!editTarget &&
               (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                    Linked Call{" "}
                    <span className="text-slate-300 font-bold normal-case tracking-normal">
                    Linked Call (Optional)
                      
                    </span>
                  </label>
        <SearchableSelect
        endpoint={ENDPOINTS.CALLS.ALL}
        extraParams={form.project_id ? { project_id: form.project_id } : {}}
        value={form.call_id}
        selectedLabel={
          selectedCall
            ? `${selectedCall.display_id ? `[${selectedCall.display_id}] ` : ""}${selectedCall.caller_name} — ${selectedCall.call_type}`
            : ""
        }
        onChange={(call) => {
          setSelectedCall(call);
          setForm((prev) => ({ ...prev, call_id: call?.id || "" }));
        }}
        getLabel={(c) => `${c.display_id ? `[${c.display_id}] ` : ""}${c.caller_name} — ${c.call_type}`}
        placeholder={form.project_id ? "Search calls for this project..." : "Select a project first, or search all calls..."}
        emptyOptionLabel="No Linked Call"
      />
                </div>
              )}

              <Input
                label="Due Date"
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={handleChange}
              />

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(editTarget
                    ? [  "closed"]
                    : ["open", "ongoing"]
                  ).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                        ${form.status === s ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

        {/* Description */}
                <div className="md:col-span-2">
                  <Textarea label="Description" name="description" value={form.description}
                    onChange={handleChange} placeholder="Scope and requirements..." rows={3} />
                </div>


              {/* Remarks section in edit modal */}
              <div className="md:col-span-2    space-y-3">
                <div className="flex items-center  justify-between ml-1">
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
                {Array.isArray(editTarget?.remarks) &&
                editTarget.remarks.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {[...editTarget.remarks].reverse().map((r, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <p className="text-sm font-bold text-slate-700">
                          {r.text}
                        </p>
                        <div className="flex justify-between mt-1.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                ) : (
                  editTarget && (
                    <p className="text-xs font-bold text-slate-400 text-center py-3">
                      No remarks yet
                    </p>
                  )
                )}

                {/* New remark input — shown when + is clicked, or always on create */}
                {(showNewRemark || !editTarget )&& (
                  <Textarea
                    name="remark"
                    value={form.remark || ""}
                    onChange={handleChange}
                    placeholder={editTarget ? "Add a new remark..." : "Add an remark..."}
                    rows={2}
                  />
                )}
              </div>
            </div>

            {/* Prefix info */}
            {!editTarget && (
              <div
                className={`rounded-2xl px-5 py-3 border ${form.assigned_to ? "bg-amber-50 border-amber-100" : "bg-[#132ea7]/5 border-[#132ea7]/10"}`}
              >
                <p
                  className={`text-xs font-black uppercase tracking-widest ${form.assigned_to ? "text-amber-600" : "text-[#132ea7]"}`}
                >
                  {form.assigned_to
                    ? "Assigning to another employee — Display ID prefix: TA"
                    : "Self-assigning — Display ID prefix: T"}
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-5 border-t border-slate-50">
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
                {editTarget ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Details Modal */}
        <Modal
          show={!!viewTarget}
          onClose={() => setViewTarget(null)}
          title="Task Details"
          size="lg"
        >
          {viewTarget && (
            <div className="space-y-5 py-2">
              <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center shrink-0 shadow-xl shadow-[#132ea7]/20">
                  <MdAssignment size={26} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-black text-slate-800">
                      {viewTarget.task}
                    </h3>
                    <Badge value={viewTarget.status} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
                    {viewTarget.display_id || "—"}
                  </p>
                  {viewTarget.call?.display_id && (
                    <p className="text-[10px] font-black text-orange-500 font-mono mt-0.5">
                      ← from call: {viewTarget.call.display_id}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1  sm:grid-cols-2  gap-3">
                {[
                  {
                    label: "Assigned To",
                    value: viewTarget.assignee?.name || "—",
                  },
                  {
                    label: "Assigned By",
                    value: viewTarget.assigner?.name || "—",
                  },
                  { label: "Project", value: viewTarget.project?.name || "—" },
                  {
                    label: "Due Date",
                    value: viewTarget.due_date
                      ? new Date(viewTarget.due_date).toLocaleDateString()
                      : "—",
                  },
                  {
                    label: "Start Date",
                    value: viewTarget.start_date
                      ? new Date(viewTarget.start_date).toLocaleDateString()
                      : "—",
                  },
                  {
                    label: "Update Date",
                    value: viewTarget.start_date
                      ? new Date(viewTarget.updatedAt).toLocaleDateString()
                      : "—",
                  },
                  { label: "Completed",      value: viewTarget.completedAt ? new Date(viewTarget.completedAt).toLocaleDateString()
                      : "—", },
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

              {viewTarget.description && (
                <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
                    Description
                  </p>
                  <p className="font-medium leading-relaxed opacity-90">
                    {viewTarget.description}
                  </p>
                </div>
              )}
              {/* Remarks log */}
              {viewTarget.remarks &&
                Array.isArray(viewTarget.remarks) &&
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
          message={`Delete task "${confirmDelete?.task}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
          loading={deleting}
        />

          <ExportModalMine show={showExportModal} onClose={() => setShowExportModal(false)} types={["tasks"]} />
      </div>
    );
  };

  export default MyTasks;
