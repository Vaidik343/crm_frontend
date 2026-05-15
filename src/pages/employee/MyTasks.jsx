import { useEffect, useState } from "react";
import { useTask } from "../../context/TaskContext";
import { useProject } from "../../context/ProjectContext";
import { useCall } from "../../context/CallContext";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import Badge, { DueDateBadge } from "../../components/ui/Badge";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import { 
  MdAssignment, 
  MdInfoOutline, 
  MdFolder, 
  MdCheckCircle, 
  MdPlayArrow, 
  MdAdd, 
  MdFilterList,
  MdLink
} from "react-icons/md";

const initialForm = {
  task: "",
  description: "",
  due_date: "",
  project_id: "",
  call_id: "",
  status: "pending",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Missions" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "Active" },
  { value: "completed", label: "Completed" },
];

const MyTasks = () => {
  const { tasks, loading, getAllTasks, createTask, updateTask } = useTask();
  const { projects, getAllProjects } = useProject();
  const { calls, getAllCalls } = useCall();

  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    getAllTasks();
    getAllProjects();
    getAllCalls();
  }, []);

  const filtered = filter === "all"
    ? tasks
    : tasks.filter((t) => t.status === filter);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.task.trim()) errors.task = "Mission objective is required";
    return errors;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTarget(task);
    setForm({
      task: task.task,
      description: task.description || "",
      due_date: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "",
      project_id: task.project_id || "",
      call_id: task.call_id || "",
      status: task.status,
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
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateTask(editTarget.id, form);
        setAlert({ type: "success", message: "Mission updated" });
      } else {
        await createTask(form);
        setAlert({ type: "success", message: "New mission deployed" });
      }
      closeModal();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Operation failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusUpdate = async (taskId, newStatus) => {
    try {
      setSubmitting(true);
      await updateTask(taskId, { status: newStatus });
      setAlert({ type: "success", message: `Mission status set to ${newStatus}` });
    } catch (err) {
      setAlert({ type: "danger", message: "Status update failed" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !tasks.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Syncing mission coordinates...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            My <span className="text-[#132ea7]">Missions</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Personnel: {tasks.length} active assignments identified</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[#132ea7] transition-colors" size={20} />
            <select
              className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all appearance-none cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 py-3.5 px-8 rounded-2xl font-black uppercase tracking-widest text-xs" onClick={openCreate}>
            <MdAdd size={20} /> Deploy New Task
          </Button>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Grid Layout */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-slate-300 py-24 text-center">
          <MdAssignment size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No missions matching current encryption filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((task) => {
            const projectName = task.Project?.name || projects.find(p => p.id == task.project_id)?.name || "Global";
            
            return (
              <div key={task.id} className="group bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#132ea7] flex items-center justify-center font-black shadow-sm group-hover:bg-[#132ea7] group-hover:text-white transition-all duration-300">
                    <MdAssignment size={24} />
                  </div>
                  <Badge value={task.status} />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 group-hover:text-[#132ea7] transition-colors uppercase tracking-tight">{task.task}</h3>
                    <p className="text-slate-400 text-sm font-medium line-clamp-2 italic">
                      {task.description || "No specific briefing provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <MdFolder size={14} className="text-slate-300" />
                        {projectName}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</p>
                      <DueDateBadge dueDate={task.due_date} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 font-black uppercase tracking-widest text-[10px] h-10 rounded-xl"
                    onClick={() => setViewTarget(task)}
                  >
                    Briefing
                  </Button>
                  
                  {task.status === 'pending' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="flex-[1.5] font-black uppercase tracking-widest text-[10px] h-10 rounded-xl shadow-lg shadow-blue-500/20 bg-blue-500"
                      onClick={() => handleQuickStatusUpdate(task.id, 'in-progress')}
                      loading={submitting}
                    >
                      <MdPlayArrow size={16} /> Start Mission
                    </Button>
                  )}

                  {task.status === 'in-progress' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="flex-[1.5] font-black uppercase tracking-widest text-[10px] h-10 rounded-xl shadow-lg shadow-emerald-500/20 bg-emerald-500 border-emerald-500"
                      onClick={() => handleQuickStatusUpdate(task.id, 'completed')}
                      loading={submitting}
                    >
                      <MdCheckCircle size={16} /> Complete
                    </Button>
                  )}

                  {task.status === 'completed' && (
                    <div className="flex-[1.5] h-10 flex items-center justify-center text-emerald-500 font-black uppercase tracking-widest text-[10px]">
                      Verified <MdCheckCircle className="ml-1" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deploy/Modify Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Modify Mission Parameters" : "Deploy New Assignment"}
        size="lg"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Mission Objective"
              name="task"
              value={form.task}
              onChange={handleChange}
              error={fieldErrors.task}
              placeholder="Primary mission goal..."
              required
            />
            <Input
              label="Operational Deadline"
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
            />
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Parent Project</label>
              <select
                name="project_id"
                value={form.project_id}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none"
              >
                <option value="">Global / No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Link Communication (Optional)</label>
              <select
                name="call_id"
                value={form.call_id}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all outline-none"
              >
                <option value="">No Linked Call</option>
                {calls.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caller_name} — {c.call_type} ({new Date(c.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
            {editTarget && (
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Mission Status</label>
                <div className="flex flex-wrap gap-3">
                  {STATUS_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, status: o.value }))}
                      className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.status === o.value ? 'bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Textarea
            label="Detailed Briefing"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Operational details and requirements..."
            rows={4}
          />

          <div className="flex gap-4 pt-8 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>Abort</Button>
            <Button type="submit" variant="primary" className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-widest text-sm" loading={submitting}>
              {editTarget ? "Update Parameters" : "Deploy Mission"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Briefing Details Modal */}
      <Modal
        show={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Mission Briefing"
        size="lg"
      >
        {viewTarget && (
          <div className="space-y-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-50">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[1.5rem] bg-[#132ea7] text-white flex items-center justify-center font-black text-3xl shadow-2xl shadow-[#132ea7]/20">
                  <MdAssignment size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">{viewTarget.task}</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-1">Project: {projects.find(p => p.id == viewTarget.project_id)?.name || "Global"}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge value={viewTarget.status} className="text-sm px-4 py-1.5" />
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Authorized by: {viewTarget.Creator?.name || "System"}</div>
              </div>
            </div>

            <div className="p-10 bg-[#132ea7] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <MdInfoOutline size={18} className="text-white/30" /> Operational Objectives
                </p>
                <p className="text-xl font-medium leading-relaxed opacity-95 italic whitespace-pre-wrap">
                  "{viewTarget.description || "No specific instructions provided for this mission."}"
                </p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
            </div>

            <div className="flex items-center justify-center pt-4">
              <Button variant="ghost" onClick={() => setViewTarget(null)} className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Close Briefing</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyTasks;