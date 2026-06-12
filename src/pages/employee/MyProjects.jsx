import { useEffect, useState  } from "react";
import { useProject } from "../../context/ProjectContext";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { MdFolder, MdGroup, MdChevronRight, MdPerson } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

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
                  <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Created By</th>
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
  <p className="text-xs font-bold text-slate-500 max-w-[160px] line-clamp-2">
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

                      
                      {/* Creator */}
<td className="px-6 py-6">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] uppercase">
      {project.creator?.name?.charAt(0) || "?"}  {/* ← was || <MdPerson /> */}
    </div>
    <div className="text-sm font-black text-slate-600">
      {project.creator?.name || "—"}
    </div>
  </div>
</td>
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
    </div>
  );
};

export default MyProjects;