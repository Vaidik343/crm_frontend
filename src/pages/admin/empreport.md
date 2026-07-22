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
import api from '../../api/axiosInstance';

import { useLeave } from '../../context/LeaveContext';
import { MdBeachAccess } from 'react-icons/md';
import { formatDate } from '../../utils/formatDate';
import Spinner from '../../components/ui/Spinner';



const EmployeeReport = () => {
    
    const { id } = useParams();
    const {users, loading,   getUserById, getEmployeeCallsReport, getEmployeeTasksReport, getEmployeeWorkLogsReport} = useUser();
const { getAllProjects } = useProject();

const {
  getEmployeeBalance,
  getEmployeeBalanceHistory,
  getAllLeaves,
} = useLeave();

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
// console.log("🚀 ~ EmployeeReport ~ selectedProject:", selectedProject)


const [showExportModal, setShowExportModal] = useState(false);


const [leaveBalance,  setLeaveBalance]  = useState(null);
const [leaveHistory,  setLeaveHistory]  = useState([]);
const [leaveRequests, setLeaveRequests] = useState([]);
const [leaveLoading,  setLeaveLoading]  = useState(false);


const [employeeStats, setEmployeeStats] = useState({
  calls: 0,
  tasks: 0,
  logs: 0,
  projects: 0,
});
// console.log("🚀 ~ EmployeeReport ~ employeeStats:", employeeStats)

useEffect(() => {
  if (!employee?.id) return;


 
  // Fetch counts for this specific employee using existing report endpoints
  // pass limit=1 so response is fast, we only need the total field
  Promise.all([
   getEmployeeCallsReport(employee.id, 1, from, to, 1, "", projectId),
    getEmployeeTasksReport(employee.id, 1, from, to, 1, "", projectId),
    getEmployeeWorkLogsReport(employee.id, 1, from, to, 1, "", projectId),
    // getAllProjects({ user_id: employee.id, limit: 100 }),
    api.get(`${ENDPOINTS.PROJECTS.ALL}?user_id=${employee.id}&limit=100`).then(r => r.data),
  ]).then(([calls, tasks, logs,projects ]) => {
    setEmployeeStats({
      calls: calls.total || 0,
      tasks: tasks.total || 0,
      logs: logs.total || 0,
      projects: projects.total || 0,
    });
    setProjects(projects.data || []);
  }).catch(console.error);

}, [employee, from, to, projectId]);


useEffect(() => {
    if (!employee?.id) return;
    getAllProjects({ user_id: employee.id, limit: 100 }).then(res => {
        // console.log("projects response:", res);
    });
}, [employee?.id]);

useEffect(() => {
  getUserById(id)
    .then(res => setEmployee(res.user || res))
    .catch(console.error);
}, [id]);


useEffect(() => {
  if (activeTab !== 'leave' || !employee?.id) return;

  setLeaveLoading(true);

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  Promise.all([
    getEmployeeBalance(employee.id, month, year),
    getEmployeeBalanceHistory(employee.id),
    getAllLeaves(1, 50, { user_id: employee.id }),
  ])
    .then(([balanceRes, historyRes, leavesRes]) => {
      setLeaveBalance(balanceRes.balance   || null);
      setLeaveHistory(historyRes.history   || []);
      setLeaveRequests(leavesRes.leaves    || []);
    })
    .catch(console.error)
    .finally(() => setLeaveLoading(false));

}, [activeTab, employee?.id]);

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
              // console.log("🚀 ~ loadReport ~ response:", response)
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
    placeholder=""
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
          { label: "Projects", value: employeeStats.projects },
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

    {["calls","tasks","worklogs", "leave"].map(tab => (

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
             {tab === "calls"    ? "Calls"     :
     tab === "tasks"    ? "Tasks"     :
     tab === "worklogs" ? "Work Logs" :
     "Leave"}
        </button>

    ))}

</div>


  {/* table */}
<div>
    {activeTab === "calls" && <EmployeeCallsTable rows={rows} />}
    {activeTab === "tasks" && <EmployeeTasksTable rows={rows} />}
    {activeTab === "worklogs" && <EmployeeWorkLogsTable rows={rows} />}
    {activeTab === "leave" && (
  <div className="space-y-6">
    {leaveLoading ? (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Spinner size="lg" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
          Loading leave data...
        </p>
      </div>
    ) : (
      <>
        {/* ── Current Month Balance Card ── */}
        {leaveBalance && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Current Month Balance
                </p>
                <p className="text-lg font-black text-slate-700">
                  {new Date().toLocaleString("default", { month: "long" })}{" "}
                  {new Date().getFullYear()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#132ea7]/10 flex items-center justify-center">
                <MdBeachAccess size={24} className="text-[#132ea7]" />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Paid Leaves
                </p>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  {parseFloat(leaveBalance.used_paid)} / {parseFloat(leaveBalance.entitled_paid)} used
                </p>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    parseFloat(leaveBalance.used_paid) >= parseFloat(leaveBalance.entitled_paid)
                      ? "bg-red-500"
                      : parseFloat(leaveBalance.used_paid) >= 1
                      ? "bg-amber-500"
                      : "bg-[#132ea7]"
                  }`}
                  style={{
                    width: `${Math.min(
                      (parseFloat(leaveBalance.used_paid) /
                        parseFloat(leaveBalance.entitled_paid)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label:  "Entitled",
                  value:  parseFloat(leaveBalance.entitled_paid),
                  color:  "bg-slate-50 text-slate-600",
                },
                {
                  label:  "Paid Used",
                  value:  parseFloat(leaveBalance.used_paid),
                  color:  "bg-[#132ea7]/5 text-[#132ea7]",
                },
                {
                  label:  "Unpaid",
                  value:  parseFloat(leaveBalance.used_unpaid),
                  color:  parseFloat(leaveBalance.used_unpaid) > 0
                    ? "bg-red-50 text-red-500"
                    : "bg-slate-50 text-slate-400",
                },
                {
                  label:  "Exchange",
                  value:  parseFloat(leaveBalance.used_exchange),
                  color:  "bg-amber-50 text-amber-600",
                },
              ].map((item) => (
                <div key={item.label}
                  className={`${item.color} rounded-2xl p-4 text-center`}>
                  <p className="text-2xl font-black">{item.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Unpaid warning */}
            {parseFloat(leaveBalance.used_unpaid) > 0 && (
              <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <p className="text-xs font-black text-red-500 uppercase tracking-widest">
                  ⚠️ {parseFloat(leaveBalance.used_unpaid)} day
                  {parseFloat(leaveBalance.used_unpaid) !== 1 ? "s" : ""} unpaid
                  this month — salary deduction applies
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Balance History ── */}
        {leaveHistory.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Balance History
              </p>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    {["Month", "Entitled", "Paid Used", "Unpaid", "Exchange", "Remaining"].map((h) => (
                      <th key={h}
                        className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaveHistory.map((b) => {
                    const remaining = parseFloat(b.entitled_paid) - parseFloat(b.used_paid);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-black text-slate-700 text-sm">
                            {new Date(b.year, b.month - 1).toLocaleString("default", {
                              month: "long",
                            })}{" "}
                            {b.year}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-slate-600 text-sm">
                            {parseFloat(b.entitled_paid)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-[#132ea7] text-sm">
                            {parseFloat(b.used_paid)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-black text-sm ${
                            parseFloat(b.used_unpaid) > 0 ? "text-red-500" : "text-slate-400"
                          }`}>
                            {parseFloat(b.used_unpaid)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-amber-600 text-sm">
                            {parseFloat(b.used_exchange)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${
                            remaining <= 0
                              ? "bg-red-100 text-red-600"
                              : remaining < parseFloat(b.entitled_paid)
                              ? "bg-amber-100 text-amber-600"
                              : "bg-green-100 text-green-600"
                          }`}>
                            {remaining}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Leave Requests List ── */}
        {leaveRequests.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Leave Requests
              </p>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    {["Display ID", "Type", "Duration", "From", "To", "Days", "Status"].map((h) => (
                      <th key={h}
                        className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaveRequests.map((leave) => {
                    const start = new Date(leave.start_date);
                    const end   = new Date(leave.end_date);
                    const days  =
                      leave.duration === "first_half" ||
                      leave.duration === "second_half"
                        ? 0.5
                        : Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

                    const STATUS_COLOR = {
                      pending:   "pending",
                      approved:  "active",
                      rejected:  "danger",
                      cancelled: "inactive",
                    };

                    const LEAVE_TYPE_COLOR = {
                      paid:     "primary",
                      unpaid:   "secondary",
                      exchange: "ongoing",
                    };

                    const DURATION_LABELS = {
                      full_day:    "Full Day",
                      first_half:  "First Half",
                      second_half: "Second Half",
                    };

                    return (
                      <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[11px] font-black uppercase tracking-widest font-mono">
                            {leave.display_id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <Badge
                              value={leave.leave_type}
                              overrideColor={LEAVE_TYPE_COLOR[leave.leave_type]}
                            />
                            {leave.reason_type === "emergency" && (
                              <Badge value="Emergency" overrideColor="danger" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-slate-600">
                            {DURATION_LABELS[leave.duration] || leave.duration}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-slate-700">
                            {formatDate(leave.start_date)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-slate-700">
                            {formatDate(leave.end_date)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-slate-600">
                            {days} day{days !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            value={leave.status}
                            overrideColor={STATUS_COLOR[leave.status]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!leaveBalance && leaveHistory.length === 0 && leaveRequests.length === 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center">
            <MdBeachAccess size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
              No leave data for this employee
            </p>
          </div>
        )}
      </>
    )}
  </div>
)}
</div>
  {totalPages > 1 && activeTab !== "leave" && <Pagination />}




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