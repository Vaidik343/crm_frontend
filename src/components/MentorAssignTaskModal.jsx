// MentorAssignTaskModal.jsx — add as a standalone component
// Props: onClose, onSuccess
const MentorAssignTaskModal = ({ onClose, onSuccess }) => {
  const [interns, setInterns]     = useState([]);
  const [form, setForm]           = useState({
    intern_id: "", task: "", description: "",
    due_date: "", remark: "",
  });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(ENDPOINTS.MY_MENTORED_INTERNS)
      .then(({ data }) => setInterns(data.interns || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.intern_id) errs.intern_id = "Select an intern.";
    if (!form.task.trim()) errs.task = "Task name is required.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setSubmitting(true);
      await api.post(ENDPOINTS.MENTOR_ASSIGN_TASK, {
        intern_id:    form.intern_id,
        task:         form.task.trim(),
        description:  form.description.trim() || null,
        due_date:     form.due_date || null,
        remark:       form.remark.trim() || null,
      });
      toast.success("Task assigned to intern.");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign task.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30 ${
      err ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
    }`;
  const labelCls = "block text-xs font-black uppercase tracking-widest text-slate-500 mb-1";
  const errCls   = "text-xs text-red-500 font-semibold mt-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Assign Task to Intern</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <MdClose size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">

          <div>
            <label className={labelCls}>Select Intern <span className="text-red-400">*</span></label>
            {interns.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold italic">No active interns assigned to you.</p>
            ) : (
              <select name="intern_id" value={form.intern_id} onChange={handleChange} className={inputCls(errors.intern_id)}>
                <option value="">Select intern...</option>
                {interns.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.display_id}) — {i.intern_type}
                  </option>
                ))}
              </select>
            )}
            {errors.intern_id && <p className={errCls}>{errors.intern_id}</p>}
          </div>

          <div>
            <label className={labelCls}>Task Name <span className="text-red-400">*</span></label>
            <input name="task" value={form.task} onChange={handleChange}
              placeholder="e.g. Build login page" className={inputCls(errors.task)} />
            {errors.task && <p className={errCls}>{errors.task}</p>}
          </div>

          <div>
            <label className={labelCls}>Description <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Brief description..." className={inputCls(false)} />
          </div>

          <div>
            <label className={labelCls}>Due Date <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
            <input name="due_date" type="date" value={form.due_date} onChange={handleChange} className={inputCls(false)} />
          </div>

          <div>
            <label className={labelCls}>Remark <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span></label>
            <textarea name="remark" value={form.remark} onChange={handleChange}
              rows={2} placeholder="Add a note..." className={inputCls(false)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting || interns.length === 0}
              className="flex-1 py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60">
              {submitting ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};