
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api  from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import toast from "react-hot-toast";

import DataTable from "../../components/shared/table";


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

  async function fetchMyInterns() {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.MY_MENTORED_INTERNS);
      console.log("🚀 ~ fetchMyInterns ~ res:", res)
      setInterns(res.data.interns || []);
    } catch (err) {
          console.log("🚀 ~ fetchMyInterns ~ err:", err)
      toast.error("Failed to load your interns");
    } finally {
      setLoading(false);
    }
  }

  
  useEffect(() => {
    fetchMyInterns();
  }, []);

  const filtered = interns.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.name?.toLowerCase().includes(q) ||
      i.display_id?.toLowerCase().includes(q) ||
      i.college_name?.toLowerCase().includes(q)
    );
  });


  const columns = [
    {
      field: "display_id",
      headerName: "ID",
      width: 120,
      renderCell: ({ value }) => (
        <span className="font-mono text-xs text-gray-400">{value}</span>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      width: 220,
      renderCell: ({ value }) => (
        <span className="font-semibold text-gray-800">{value}</span>
      ),
    },
    {
      field: "college_name",
      headerName: "College",
      width: 250,
      renderCell: ({ value }) => value || "—",
    },
    {
      field: "intern_type",
      headerName: "Type",
      width: 140,
      renderCell: ({ value }) => {
        const typeMeta = TYPE_LABELS[value] || { label: value, color: "bg-gray-100 text-gray-600" };
        return (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeMeta.color}`}>
            {typeMeta.label}
          </span>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: ({ value }) => {
        const statusMeta = STATUS_LABELS[value] || { label: value, color: "bg-gray-100 text-gray-600" };
        return (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusMeta.color}`}>
            {statusMeta.label}
          </span>
        );
      },
    },
    {
      field: "actions",
      headerName: "Action",
      width: 150,
      align: "center",
      renderCell: ({ row }) => (
        <button
          onClick={() => navigate(`/employee/my-interns/${row.id}`)}
          className="text-xs font-semibold text-[#132ea7] border border-[#132ea7]/30 rounded-lg px-3 py-1.5 hover:bg-[#132ea7] hover:text-white transition-colors"
        >
          View Detail →
        </button>
      ),
    },
  ];

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
{/* Table Display */}
      <DataTable
        columns={columns}
        rows={filtered}
        emptyMessage={
          search
            ? `No interns match "${search}"`
            : "You haven't been assigned as a mentor to any intern yet."
        }
      />
    </div>
  );
}
