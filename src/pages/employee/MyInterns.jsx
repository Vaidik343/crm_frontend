import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api  from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import toast from "react-hot-toast";

const TYPE_LABELS = {
  intern: { label: "Intern", color: "bg-blue-100 text-blue-700" },
  trainee: { label: "Trainee", color: "bg-purple-100 text-purple-700" },
};

const STATUS_LABELS = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  active: { label: "Active", color: "bg-green-100 text-green-700" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-600" },
  terminated: { label: "Terminated", color: "bg-red-100 text-red-700" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MyInterns() {
  const navigate = useNavigate();
  const [interns, setInterns] = useState([]);
  console.log("🚀 ~ MyInterns ~ interns:", interns)
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMyInterns();
  }, []);

  async function fetchMyInterns() {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.INTER_TASKS.MENTOR_ASSIGN_TASK);
      console.log("🚀 ~ fetchMyInterns ~ res:", res)
      setInterns(res.data.interns || []);
    } catch (err) {
      toast.error("Failed to load your interns");
    } finally {
      setLoading(false);
    }
  }

  const filtered = interns.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.name?.toLowerCase().includes(q) ||
      i.display_id?.toLowerCase().includes(q) ||
      i.college?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Interns</h1>
          <p className="text-gray-500 text-sm mt-1">Interns assigned to you as mentor</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Interns</h1>
          <p className="text-gray-500 text-sm mt-1">
            {interns.length > 0
              ? `${interns.length} intern${interns.length !== 1 ? "s" : ""} assigned to you`
              : "Interns assigned to you as mentor"}
          </p>
        </div>
        {interns.length > 0 && (
          <input
            type="text"
            placeholder="Search by name, ID, college…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30"
          />
        )}
      </div>

      {/* Empty — not a mentor */}
      {interns.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#132ea7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-gray-700 font-semibold text-lg">No interns assigned</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-xs">
            You haven't been assigned as a mentor to any intern yet.
          </p>
        </div>
      )}

      {/* No search results */}
      {interns.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          No interns match "<span className="font-medium text-gray-600">{search}</span>"
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((intern) => {
          const typeMeta = TYPE_LABELS[intern.intern_type] || { label: intern.intern_type, color: "bg-gray-100 text-gray-600" };
          const statusMeta = STATUS_LABELS[intern.status] || { label: intern.status, color: "bg-gray-100 text-gray-600" };

          return (
            <div
              key={intern.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md hover:border-[#132ea7]/20 transition-all"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{intern.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{intern.display_id}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeMeta.color}`}>
                    {typeMeta.label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusMeta.color}`}>
                    {statusMeta.label}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-1.5 text-sm text-gray-500">
                {intern.college && (
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 14l6.16-3.422A12.083 12.083 0 0121 13.5c0 3.314-4.03 6-9 6s-9-2.686-9-6c0-.538.09-1.06.254-1.56L12 14z" />
                    </svg>
                    <span className="truncate">{intern.college}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {formatDate(intern.start_date)}
                    {intern.end_date ? ` → ${formatDate(intern.end_date)}` : ""}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-auto pt-1">
                <button
                  onClick={() => navigate(`/employee/my-interns/${intern.id}`)}
                  className="w-full text-center text-sm font-medium text-[#132ea7] border border-[#132ea7]/30 rounded-xl py-2 hover:bg-[#132ea7] hover:text-white transition-colors"
                >
                  View Detail →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
