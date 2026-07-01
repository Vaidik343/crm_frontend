import { useEffect, useState } from "react";
import { useWorkLog } from "../../context/WorkLogContext";
import { useProject } from "../../context/ProjectContext";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Spinner from "../../components/ui/Spinner";
import {MdBook, MdVisibility, MdCalendarToday, MdPerson, MdAccessTime, MdDownload ,MdOutlineSpeakerNotes, MdAdd, MdEdit } from "react-icons/md";
import Select from "../../components/ui/Select";
// import ExportBar from "../../components/ui/ExportBar";
import ExportModalMine from "../../components/ui/ExportModalMine";
import LocalSearchableSelect from "../../components/ui/LocalSearchableSelect";
import SearchInput from "../../components/ui/SearchInput";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { ENDPOINTS } from "../../api/endpoints";




const initialForm = { 
  description: "",
  project_id: "", 
  remarks: "",
  date: new Date().toISOString().split("T")[0], // today's date as default
};

const WorkLog = () => {
  const { workLogs = [], loading,page, total, 
      totalPages,
      setPage, getAllWorkLogs, createWorkLog, updateWorkLog } = useWorkLog();
const {projects, getAllProjects} = useProject();
// console.log("🚀 ~ WorkLog ~ projects:", projects)


  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  
    const [remarksTarget, setRemarksTarget] = useState(null);
  const [remarkText, setRemarkText]       = useState("");
  const [remarkSubmitting, setRemarkSubmitting] = useState(false);
  const [showNewRemark, setShowNewRemark] = useState(false);

  const today = new Date().toISOString().split("T")[0];
        const sevenDaysAgo = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split("T")[0];
      })();
      

const [dateFrom, setDateFrom] = useState(sevenDaysAgo);
const [dateTo, setDateTo] = useState(today);
const [showExportModal, setShowExportModal] = useState(false);

const [search, setSearch] = useState("");


 const [selectedProject, setSelectedProject] = useState(null);


  //project options
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  // console.log("🚀 ~ WorkLog ~ projectOptions:", projectOptions)
useEffect(() => {
  const debounce = setTimeout(() => {
    getAllWorkLogs(search ? 1 : page, dateFrom, dateTo, search);
  }, 300);
  return () => clearTimeout(debounce);
}, [page, dateFrom, dateTo, search]);

useEffect(() => {
  if (search && page !== 1) setPage(1);
}, [search]);

useEffect(() => {
  getAllProjects?.();
}, []);



  const filtered = workLogs || [];

  const totalEntries =  total;
  console.log("🚀 ~ WorkLog ~ totalEntries:", totalEntries)
  
  const currentMonthEntries = workLogs.filter((log) => {
    const logDate = new Date(log.date);
    const today = new Date();
    return logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear();
  }).length;
  
  const hasLoggedToday = workLogs.some((log) => {
    const logDate = new Date(log.date);
    const today = new Date();
    return logDate.getDate() === today.getDate() && 
           logDate.getMonth() === today.getMonth() && 
           logDate.getFullYear() === today.getFullYear();
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.description.trim()) errors.description = "Description is required";
    if (!form.project_id) errors.project_id = "Project is required";
    if (!form.date) errors.date = "Date is required";
    return errors;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
      setSelectedProject(null); 
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (log) => {
    setEditTarget(log);
    setForm({ description: log.description, date: log.date, project_id:log.project_id, remarks:log.remarks });
     setSelectedProject(log.Project || null); 
    setFieldErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(initialForm);
     setSelectedProject(null); 
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateWorkLog(editTarget.id, form);
        setAlert({ type: "success", message: "Work log updated" });
      } else {
        await createWorkLog(form);
        setAlert({ type: "success", message: "Work log added" });
      }
      closeModal();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !workLogs.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Accessing daily archives...</p>
    </div>
  );

  return (
    <div className="space-y-8 px-5 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            Work <span className="text-[#132ea7]">Log</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Your daily work journal</p>
        </div>
        

    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center max-w-[48dvw] gap-2 bg-white flex-wrap border border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
        <label className="text-xs font-black text-slate-400 uppercase">From</label>
        <input type="date" value={dateFrom} max={today} onChange={(e) => setDateFrom(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold" />
        <label className="text-xs font-black text-slate-400 uppercase">To</label>
        <input type="date" value={dateTo} max={today} onChange={(e) => setDateTo(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold" />
        <button
          onClick={() => { setDateFrom(sevenDaysAgo); setDateTo(today); }}
          className="text-[10px] font-black text-[#132ea7] uppercase tracking-widest hover:underline whitespace-nowrap"
        >
          Reset
        </button>
      </div>


<SearchInput 
    value={search}
  onChange={setSearch}
    placeholder="Search  Projects and Employee "
  />


      <Button
        variant="ghost"
        className="shadow-sm px-6 rounded font-black uppercase tracking-widest text-sm whitespace-nowrap h-[52px] bg-white border border-slate-100"
        onClick={() => setShowExportModal(true)}
      >
        <MdDownload size={20} className="mr-1" /> Download
      </Button>

      <Button variant="primary" className="shadow-lg shadow-[#132ea7]/20 py-3 px-8 rounded h-[52px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2" onClick={openCreate}>
        <MdAdd size={22} /> Add Work
      </Button>
    </div>
  </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
            <MdBook size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Entries</p>
            <p className="text-3xl font-black text-slate-800">{totalEntries}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#132ea7]/5 text-[#132ea7] flex items-center justify-center">
            <MdCalendarToday size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">This Month</p>
            <p className="text-3xl font-black text-slate-800">{currentMonthEntries}</p>
          </div>
        </div>
        <div className={`p-8 rounded-[2rem] shadow-2xl flex items-center gap-6 text-white relative overflow-hidden transition-all duration-300 ${hasLoggedToday ? "bg-emerald-600 shadow-emerald-600/20" : "bg-[#132ea7] shadow-[#132ea7]/20"}`}>
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center relative z-10">
            <MdAccessTime size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Today's Status</p>
            <p className="text-xl font-black uppercase tracking-widest">{hasLoggedToday ? "Submitted" : "Pending"}</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Operational Date</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Work Briefing</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Projects</th>
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {workLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">No work logs logged yet.</td>
                </tr>
              )}
              {workLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#132ea7] flex items-center justify-center shadow-inner group-hover:bg-[#132ea7] group-hover:text-white transition-all">
                          <MdCalendarToday size={18} />
                       </div>
                       <span className="text-sm font-black text-slate-700 uppercase tracking-wider">{new Date(log.date).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold  truncate max-w-[500px]">
                      {log.description}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold  uppercase tracking-widest mt-0.5">
   {log.Project?.name || "No Project Assigned"}
</p>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all shadow-sm"
                        onClick={() => setViewTarget(log)}
                        title="View Full Log"
                      >
                        <MdVisibility size={20} />
                      </button>
                      <button
                        onClick={() => openEdit(log)}
                        className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all shadow-sm"
                        title="Edit"
                      >
                        <MdEdit size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


{/* Pagination */}
{ totalPages > 1 && (

          
        <div className="flex items-center justify-between px-6 py-6 border-t border-slate-100">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${
                    page === pageNum
                      ? "bg-[#132ea7] text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
          >
            Next
          </button>
        </div>
)}

      </div>
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editTarget ? "Edit Work Log" : "Add Work Log"} >
        <form onSubmit={handleSubmit} noValidate className="space-y-6 pt-4" >
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              error={fieldErrors.date}
              required
            />

              <div className="md:col-span-2">

  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1 mb-1.5">
    Project
  </label>
  <SearchableSelect
    endpoint={ENDPOINTS.PROJECTS.ALL}
    value={form.project_id}
    selectedLabel={selectedProject ? `${selectedProject.name}${selectedProject.code ? ` (${selectedProject.code})` : ""}` : ""}
    onChange={(project) => {
      setSelectedProject(project);
      setForm((prev) => ({ ...prev, project_id: project?.id || "" }));
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

               {/* <LocalSearchableSelect
               
      value={form.project_id}
                onChange={handleChange}
                options={projectOptions}
       error={fieldErrors.project_id}
                placeholder="Select associated project..."
      //           required
      // getId={(u) => u.id}
      // // getLabel={(u) => {
      // //   const project = projects.find((p) => p.id === form.project_id);
        
      // // }}
      // getSearchText={(u) => `${u.Project?.name } ${u.display_id}`}
    />
           */}
            </div>
            <Textarea
              label="What did you do today?"
              name="description"
              value={form.description}
              onChange={handleChange}
              error={fieldErrors.description}
              placeholder="Describe your work for the day..."
              rows={5}
              className="text-sm font-bold leading-relaxed rounded-2xl border-slate-100 focus:ring-4 focus:ring-[#132ea7]/5"
              required
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

          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <Button variant="ghost" className="flex-1 font-black uppercase tracking-widest text-sm" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-[2] h-14 text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#132ea7]/20" loading={submitting}>
              {editTarget ? "Update" : "Save Entry"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Log Detail Modal */}
      <Modal
        show={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Operational Report Details"
        size="lg"
      >
        {viewTarget && (
          <div className="space-y-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-50">
               <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-[2rem] bg-[#132ea7] text-white flex items-center justify-center font-black text-3xl shadow-2xl shadow-[#132ea7]/20">
                     {viewTarget.User?.name?.charAt(0) || <MdPerson size={32} />}
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-800 leading-tight">{viewTarget.User?.name || "Your Work Log"}</h3>
     <p className="text-sm font-bold text-[#132ea7] uppercase tracking-widest mt-0.5">
   {viewTarget.Project?.name || "No Project Assigned"}
</p>
                     <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-1">Status: Logged successfully</p>
                  </div>
                  
               </div>
               <div className="flex items-center gap-4 bg-slate-50 p-4 px-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                  <MdAccessTime size={24} className="text-[#132ea7]" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Operational Date</p>
                    <p className="text-base font-black text-slate-800 uppercase tracking-widest">{new Date(viewTarget.date).toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-[#132ea7] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <MdOutlineSpeakerNotes size={20} className="text-white/30" /> Mission Activity Briefing
                 </p>
                 <p className="text-xl font-medium leading-relaxed opacity-95 italic whitespace-pre-wrap">
                    "{viewTarget.description}"
                 </p>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-[80px]" />
            </div>

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

            <div className="flex items-center justify-end pt-4">
               <Button variant="ghost" onClick={() => setViewTarget(null)} className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Close</Button>
            </div>
          </div>
        )}
      </Modal>
<ExportModalMine show={showExportModal} onClose={() => setShowExportModal(false)} types={["work-logs"]} />
    </div>
  );
};

export default WorkLog;