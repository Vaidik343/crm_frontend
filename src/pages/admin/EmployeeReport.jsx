import React, { useState, useEffect } from 'react'
import { useUser } from '../../context/UserContext'
import { useParams, useNavigate } from "react-router-dom";
import Badge, { DueDateBadge } from "../../components/ui/Badge";
import SearchInput from "../../components/ui/SearchInput";
import EmployeeCallsTable from '../../components/EmployeeCallsTable';
import EmployeeTasksTable from '../../components/EmployeeTasksTable';
import EmployeeWorkLogsTable from '../../components/EmployeeWorkLogsTable';



import {
  MdArrowBack, MdPerson, MdPhone, MdTask,
  MdBook, MdCalendarToday, MdFolder, MdAssignment,MdDownload 
} from "react-icons/md";
import SearchableSelect from '../../components/ui/SearchableSelect';
import { ENDPOINTS } from '../../api/endpoints';
import { useProject } from './../../context/ProjectContext';
import Button from '../../components/ui/Button';
import ExportModal from '../../components/ui/ExportModal';
import { useCall } from '../../context/CallContext';
import { useTask } from '../../context/TaskContext';
import { useWorkLog } from './../../context/WorkLogContext';
import Modal from '../../components/ui/Modal';





const EmployeeReport = () => {
    
    const { id } = useParams();
    const {users, loading,   getUserById, getEmployeeCallsReport, getEmployeeTasksReport, getEmployeeWorkLogsReport} = useUser();
const { getAllProjects } = useProject();



  const navigate = useNavigate();

const [limit] = useState(10);
const [total, setTotal] = useState(0);

const totalPages = Math.ceil(total / limit);
   
const defaultFrom = new Date();
defaultFrom.setDate(defaultFrom.getDate() - 7);

const today = new Date().toISOString().split("T")[0];
const sevenDaysAgo = defaultFrom.toISOString().split("T")[0];


const [activeTab, setActiveTab] = useState("calls");

const [employee, setEmployee] = useState(null);

const [from, setFrom] = useState(sevenDaysAgo);
const [to, setTo] = useState(today);

const [search, setSearch] = useState("");

const [page, setPage] = useState(1);

const [rows, setRows] = useState([]);


const [projectId, setProjectId] = useState("");

const [projects, setProjects] = useState([]);

const [selectedProject, setSelectedProject] = useState(null);
console.log("🚀 ~ EmployeeReport ~ selectedProject:", selectedProject)


const [showExportModal, setShowExportModal] = useState(false);



const [employeeStats, setEmployeeStats] = useState({
  calls: 0,
  tasks: 0,
  logs: 0,
  projects: 0,
});
console.log("🚀 ~ EmployeeReport ~ employeeStats:", employeeStats)

useEffect(() => {
  if (!employee?.id) return;


 
  // Fetch counts for this specific employee using existing report endpoints
  // pass limit=1 so response is fast, we only need the total field
  Promise.all([
    getEmployeeCallsReport(employee.id, 1, "", "", 1, ""),
    getEmployeeTasksReport(employee.id, 1, "", "", 1, ""),
    getEmployeeWorkLogsReport(employee.id, 1, "", "", 1, ""),
    // getAllProjects({ user_id: employee.id, limit: 100 }),
  ]).then(([calls, tasks, logs, ]) => {
    setEmployeeStats({
      calls: calls.total || 0,
      tasks: tasks.total || 0,
      logs: logs.total || 0,
      // projects: projects.total || 0,
    });
    // setProjects(projects.data || []);
  }).catch(console.error);

}, [employee]);


useEffect(() => {
    if (!employee?.id) return;
    getAllProjects({ user_id: employee.id, limit: 100 }).then(res => {
        console.log("projects response:", res);
    });
}, [employee?.id]);

useEffect(() => {
  getUserById(id)
    .then(res => setEmployee(res.user || res))
    .catch(console.error);
}, [id]);


const loadReport = async (pageNo = 1) => {
    if (!employee?.id) return;

    let response;

    switch (activeTab) {
        case "calls":
            response = await getEmployeeCallsReport(
                employee.id,
                pageNo,
                from,
                to,
                10,
                search,
                   projectId
            );
            break;

        case "tasks":
          
            response = await getEmployeeTasksReport(
                employee.id,
                pageNo,
                from,
                to,
                10,
                search,
                   projectId
            );
              console.log("🚀 ~ loadReport ~ response:", response)
            break;

        case "worklogs":
            response = await getEmployeeWorkLogsReport(
                employee.id,
                pageNo,
                from,
                to,
                10,
                search,
                 projectId
            );
            break;
    }

    setRows(response.data);
    setTotal(response.total);
    setPage(response.page);
};

useEffect(() => {
    const timer = setTimeout(() => {
        loadReport(page);
    },300);

    return () => clearTimeout(timer);
}, [page, activeTab, from, to, search, employee, projectId]);
      

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(initialForm);
    setFieldErrors({});
        getAllClients?.()
    setShowNewRemark(false);
  };

  
  const closeViewModal = () => {
  setViewTarget(null);
  setViewHistory([]);
};


const Pagination = ({compact = false}) => (
    <div  className={`flex items-center justify-between px-6 py-6 ${!compact ? "border-t border-slate-100" : ""}`}>
        <button 
         disabled={page == 1}
         onClick={() => setPage(page - 1)}
         className='px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled: opacity-50'
        >
            {compact ? "prev" : "Previous"}
        </button>

        {compact ? (
            <span className='text-sm font-bold text-slate-500'>
                {page} / {totalPages}
            </span>
        ) : (
            <div className='flex items-center gap-2'>
                {[...Array(totalPages)].map((_,i) => (
                    <button
                      key={i + 1}
                      onClick={ () => setPage(i + 1)}
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
         className='px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50'        
        >Next</button>
    </div>
);

  return (
    <div className='space-y-8 px-4 animate-in fade-in duration-700'>
        {/* header */}
        
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-2'>
         
 <button
          onClick={() => navigate(-1)}
          className="mt-1 p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-[#132ea7] hover:border-[#132ea7]/20 transition-all shadow-sm"
        >
          <MdArrowBack size={20} />
        </button>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight  uppercase">
        Employee <span className="text-[#132ea7]">Reports</span>
      </h2>
<SearchInput
    value={search}
  onChange={setSearch}
    placeholder="Search  Projects and Employee "
  />

      {/* Date range */}
      <div className="flex items-center max-w-[48dvw]  gap-2 bg-white  border flex-wrap border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
        <label className="text-xs font-black text-slate-400 uppercase">From</label>
          <input
          type="date"
          value={from}
onChange={(e) => setFrom(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 text-sm font-bold"
          max={today}
        />
  
        <label className="text-xs font-black text-slate-400 uppercase">To</label>
              <input
  type="date"
  value={to}
  onChange={(e) => setTo(e.target.value)}
  className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 text-sm font-bold"
  max={today}
/>
        <button
          onClick={() => { setFrom(sevenDaysAgo); setTo(today); }}
          className="text-[10px] font-black text-[#132ea7] uppercase tracking-widest hover:underline whitespace-nowrap"
        >
          Reset
        </button>
      </div>
      
        </div>

  {employee && (
  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
    <div className="flex flex-col md:flex-row md:items-center gap-6">

      {/* Avatar + Info */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#132ea7] text-white flex items-center justify-center font-black text-xl shrink-0">
          {employee.name?.charAt(0)}
        </div>
        <div>
          <p className="text-xl font-black text-slate-800">{employee.name}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {employee.employee_id} • {employee.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 md:ml-auto">
        {[
          // { label: "Projects", value: employeeStats.projects },
          { label: "Calls", value: employeeStats.calls },
          { label: "Tasks", value: employeeStats.tasks },
          { label: "Logs", value: employeeStats.logs },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-center min-w-[80px]">
            <p className="text-2xl font-black text-[#132ea7]">{value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
          </div>
        ))}
      </div>

    </div>
  </div>
)}


<div className='flex flex-wrap gap-2  '>
<SearchableSelect
    endpoint={ENDPOINTS.PROJECTS.ALL}
    extraParams={{
        user_id: employee?.id,
    }}
    value={projectId}
    selectedLabel={selectedProject?.name || ""}
    getLabel={(p) => `${p.name}${p.code ? ` (${p.code})` : ""}`}
    placeholder="All Projects"
    emptyOptionLabel="All Projects"
    onChange={(project) => {
        setSelectedProject(project);
        setProjectId(project?.id || "");
         setPage(1);
    }}
/>

<button onClick={() => setShowExportModal(true)}
className="flex items-center gap-2 px-4 py-2 bg-[#132ea7] text-white rounded text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition-all disabled:opacity-50"

>
  <MdDownload size={18} /> Export
</button>

</div>
<div className="flex gap-2  mb-6">

    {["calls","tasks","worklogs"].map(tab => (

        <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-t-lg font-bold transition

            ${
                activeTab === tab
                    ? "bg-[#132ea7] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
        >
            {tab === "calls"
                ? "Calls"
                : tab === "tasks"
                ? "Tasks"
                : "Work Logs"}
        </button>

    ))}

</div>


  {/* table */}

  <div className='hidden md:block'>
    <div className='bg-white rounded overflow-hidden border border-slate-100 shadow-slate-200/40'>
    <div className='overflow-x-auto custom-scrollbar'>
       
    </div>
        {activeTab === "calls" && (
    <EmployeeCallsTable rows={rows} />
)}

{activeTab === "tasks" && (
    <EmployeeTasksTable rows={rows}  />
)}

{activeTab === "worklogs" && (
    <EmployeeWorkLogsTable rows={rows}  />
)}
    </div>

  </div>
  {totalPages > 1 && <Pagination />}




  <ExportModal
  show={showExportModal}
  onClose={() => setShowExportModal(false)}
  employee={employee}
  projectId={projectId}
  fixedDateRange={{ from, to }}
/>
    </div>
  )
}
    

export default EmployeeReport