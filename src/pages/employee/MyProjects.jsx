import { useEffect, useState  } from "react";
import { useProject } from "../../context/ProjectContext";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { MdFolder, MdGroup, MdVisibility,MdDashboard ,MdAssignment , MdChevronRight, MdPerson } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";


const STATUS_COLORS = {
  planning:  "bg-slate-100 text-slate-600",
  active:    "bg-emerald-100 text-emerald-700",
  testing:   "bg-purple-100 text-purple-700",
  completed: "bg-blue-100 text-blue-700",
};

const MyProjects = () => {
  const { projects, loading, page, totalPages, getAllProjects } = useProject();
  // console.log("🚀 ~ MyProjects ~ projects:", projects)
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();
const [viewTarget, setViewTarget] = useState(null);
  useEffect(() => {
    getAllProjects?.(page);
  }, [page]);

  if (loading && !projects.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
        Loading projects...
      </p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
          My <span className="text-[#132ea7]">Projects</span>
        </h2>
        <p className="text-slate-500 font-bold text-base">
          Total Projects: {projects.length}
        </p>
      </div>


              
      {/* Empty */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200 shadow-2xl shadow-slate-200/40">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
            <MdFolder size={40} />
          </div>
          <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Projects Assigned</h4>
          <p className="text-slate-400 font-bold mt-2">You haven't been added to any projects yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Project</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Code</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Tech</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Members</th>
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {projects.map((project) => (
                  <>
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors group">

{/* Name */}
<td className="px-10 py-6 cursor-pointer" onClick={() => navigate(`/employee/projects/${project.id}/dashboard`)}>
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#132ea7] group-hover:bg-[#132ea7] group-hover:text-white flex items-center justify-center font-black text-lg shadow-inner transition-all">
      <MdFolder size={24} />
    </div>
    <div>
      <div className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight group-hover:text-[#132ea7] transition-colors">
        {project.name}
      </div>
      {project.description && (
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 line-clamp-1 italic max-w-[220px]">
          {project.description}
        </div>
      )}
    </div>
  </div>
</td>

                      {/* Code */}
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-xs font-black uppercase tracking-widest">
                          {project.code || "—"}
                        </span>
                      </td>

                      {/* Dev status */}
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[project.development_status] || "bg-slate-100 text-slate-600"}`}>
                          {project.development_status || "—"}
                        </span>
                      </td>

                      {/* Project types */}
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {project.project_types && Object.entries(project.project_types).length > 0
                            ? Object.entries(project.project_types).map(([type, subtypes]) => (
                              <div key={type} className="flex flex-col gap-0.5">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase">
                                  {type}
                                </span>
                                {subtypes.map((s) => (
                                  <span key={s} className="px-2 py-0.5 bg-[#132ea7]/10 text-[#132ea7] rounded-md text-[9px] font-bold">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ))
                            : <span className="text-slate-300 text-xs font-bold">—</span>
                          }
                        </div>
                      </td>

                    {/* Tech details */}
<td className="px-6 py-5">
  <p className="text-md font-bold text-slate-500 max-w-[160px] line-clamp-2">
    {typeof project.tech_details === "string"
      ? project.tech_details
      : Array.isArray(project.tech_details)
        ? project.tech_details.map((t) => `${t.name}${t.version ? ` ${t.version}` : ""}`).join(", ")
        : project.tech_details
          ? JSON.stringify(project.tech_details)
          : "—"
    }
  </p>
</td>

                      {/* Members toggle */}
                      <td className="px-6 py-5">
                        <button
                          onClick={() => setExpandedRow(expandedRow === project.id ? null : project.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[#132ea7]/10 hover:text-[#132ea7] text-slate-500 font-black text-xs transition-all"
                        >
                          <MdGroup size={16} />
                          {project.members?.length || 0}
                          {expandedRow === project.id
                            ? <FaChevronDown size={8} />
                            : <MdChevronRight size={14} />
                          }
                        </button>
                      </td>

    

  {/* Actions */}
      <div className="flex gap-4 px-4 py-5 border-t border-slate-100">
        <button
          onClick={() => setViewTarget(project)}
          className="flex-1 h-12 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
        >
          <MdVisibility size={20} /> 
        </button>
        <button
          onClick={() => navigate(`/employee/projects/${project.id}/dashboard`)}
          className="flex-1 h-12 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all"
        >
          <MdDashboard size={20} /> 
        </button>

      </div>

                    </tr>

                    {/* Expanded members */}
                    {expandedRow === project.id && (
                      <tr key={`${project.id}-members`} className="bg-slate-50/30">
                        <td colSpan={7} className="px-10 py-6">
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                              Team Members ({project.members?.length || 0})
                            </h4>
                            {!project.members?.length ? (
                              <p className="text-xs font-bold text-slate-400 text-center py-4">No members yet</p>
                            ) : (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {project.members.map((m) => (
                                  <div
                                    key={m.id}
                                    className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm"
                                  >
                                    <div className="w-8 h-8 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-sm flex-shrink-0">
                                      {m.user?.name?.charAt(0) || "?"}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-black text-slate-700 truncate">{m.user?.name || "Unknown"}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                        {m.role?.name || m.user?.employee_id || "—"}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-6 border-t border-slate-100">
            <button
              disabled={page === 1}
              onClick={() => getAllProjects(page - 1)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => getAllProjects(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${
                    page === i + 1 ? "bg-[#132ea7] text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => getAllProjects(page + 1)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

              {/* ── View Modal ───────────────────────────────────────────── */}
              <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Project Details" size="lg">
                {viewTarget && (
                  <div className="space-y-6 py-2">
      
                    {/* Header */}
                    <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                      <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center shrink-0 shadow-xl shadow-[#132ea7]/20">
                        <MdAssignment size={26} />
                      </div>
                      <div className="flex-1">
                        {/* <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-black text-slate-800">{viewTarget.task}</h3>
                          <Badge value={viewTarget.status} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
                          {viewTarget.display_id || "No display ID"}
                        </p> */}
      
                        <div className="flex items-center gap-3 flex-wrap">
                         <h3 className="text-xl font-black text-slate-800">
        {viewTarget.name}
      </h3>
      
                          <Badge value={viewTarget.development_status} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
        {viewTarget.code}
      </p>
                      </div>
                    </div>
      
                    <div className="bg-slate-50 rounded-2xl p-5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          Project Types
        </p>
      
        <div className="flex flex-wrap gap-2">
          {Object.entries(viewTarget.project_types || {}).map(
            ([type, subtypes]) =>
              subtypes.map((sub) => (
                <span
                  key={`${type}-${sub}`}
                  className="px-3 py-1 rounded-lg bg-[#132ea7]/10 text-[#132ea7] text-xs font-bold"
                >
                  {type} / {sub}
                </span>
              ))
          )}
        </div>
      </div>
      

      {/* Members */}
{viewTarget.members?.length > 0 && (
  <div className="space-y-3">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      Members ({viewTarget.members.length})
    </p>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {viewTarget.members.map((m) => (
        <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-sm flex-shrink-0">
            {m.user?.name?.charAt(0) || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-700 truncate">{m.user?.name || "Unknown"}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
              {m.role?.name || m.user?.employee_id || "—"}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
      
      
                    {/* Info grid */}
                    {/* <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Name", value: viewTarget.name || "—" },
                        { label: "Assigned By", value: viewTarget.assigner?.name || "—" },
                        { label: "Project", value: viewTarget.project?.name || "—" },
                        { label: "Due Date", value: viewTarget.due_date ? new Date(viewTarget.due_date).toLocaleDateString() : "—" },
                        { label: "Start Date", value: viewTarget.start_date ? new Date(viewTarget.start_date).toLocaleDateString() : "—" },
                        // { label: "Created", value: new Date(viewTarget.createdAt).toLocaleDateString() },
                      ].map((item) => (
                        <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                          <p className="font-black text-slate-700 text-sm">{item.value}</p>
                        </div>
                      ))}
                    </div> */}
      
      
                    {/* tech_details */}
      {viewTarget.tech_details && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Technical Details
          </p>
      
          {Array.isArray(viewTarget.tech_details) ? (
            <div className="space-y-2">
              {viewTarget.tech_details.map((tech, index) => (
                <div key={index} className="bg-[#132ea7] rounded-2xl p-4 text-white">
                  {/* Tech name + version */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="font-black text-sm">
                      {tech.name}
                      {tech.version ? (
                        <span className="ml-2 text-white/60 font-bold text-xs">v{tech.version}</span>
                      ) : null}
                    </span>
                  </div>
      
                  {/* Databases nested under this tech */}
                  {tech.databases?.length > 0 && (
                    <div className="mt-3 pl-7 space-y-1.5">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
                        Databases
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tech.databases.map((db, dbIndex) => (
                          <span
                            key={dbIndex}
                            className="px-3 py-1 rounded-lg bg-white/10 text-xs font-bold"
                          >
                            {db.name}
                            {db.version ? (
                              <span className="ml-1 text-white/50">v{db.version}</span>
                            ) : null}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Legacy string fallback
            <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
              <p className="font-medium opacity-90">{viewTarget.tech_details}</p>
            </div>
          )}
        </div>
      )}
      
                    {/* Description */}
                    {viewTarget.description && (
                      <div className="bg-[#132ea7] rounded-2xl p-6 text-white">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Description</p>
                        <p className="font-medium leading-relaxed opacity-90">{viewTarget.description}</p>
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
      
    </div>
  );
};

export default MyProjects;