import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import { MdPeople, MdPhone, MdCheckCircle, MdBook } from "react-icons/md";
import Export from "./Export";

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data: res } = await api.get(ENDPOINTS.DASHBOARD.ALL);
        setData(res);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Welcome back, {user?.name} 👋</h4>
        <p className="text-muted small mb-0">Here's what's happening in your CRM today.</p>
        
          
        
      </div>

{/*  */}
      <Alert type="danger" message={error} onClose={() => setError("")} />

      {/* ── Total counts ───────────────────────────────── */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Employees", value: data?.totals?.employees, icon: <MdPeople size={24} />,      color: "primary" },
          { label: "Total Calls",     value: data?.totals?.calls,     icon: <MdPhone size={24} />,       color: "info"    },
          { label: "Total Tasks",     value: data?.totals?.tasks,     icon: <MdCheckCircle size={24} />, color: "success" },
          { label: "Total Work Logs", value: data?.totals?.work_logs, icon: <MdBook size={24} />,        color: "warning" },
        ].map((stat) => (
          <div key={stat.label} className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div className={`d-flex align-items-center justify-content-center rounded-3 bg-${stat.color} bg-opacity-10 text-${stat.color}`}
                  style={{ width: 52, height: 52, flexShrink: 0 }}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-muted small mb-0">{stat.label}</p>
                  <h3 className="fw-bold mb-0">{stat.value ?? 0}</h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Last 7 days ────────────────────────────────── */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom">
          <h6 className="fw-semibold mb-0">Last 7 Days Activity</h6>
        </div>
        <div className="card-body">
          <div className="row g-3 text-center">
            <div className="col-4">
              <p className="text-muted small mb-1">Calls</p>
              <h4 className="fw-bold text-info mb-0">{data?.last_7_days?.calls ?? 0}</h4>
            </div>
            <div className="col-4 border-start border-end">
              <p className="text-muted small mb-1">Tasks</p>
              <h4 className="fw-bold text-success mb-0">{data?.last_7_days?.tasks ?? 0}</h4>
            </div>
            <div className="col-4">
              <p className="text-muted small mb-1">Work Logs</p>
              <h4 className="fw-bold text-warning mb-0">{data?.last_7_days?.work_logs ?? 0}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* ── Breakdowns ─────────────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h6 className="fw-semibold mb-0">Task Status Breakdown</h6>
            </div>
            <div className="card-body">
              {Object.entries(data?.task_status_breakdown || {}).map(([status, count]) => (
                <div key={status} className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <Badge value={status} />
                    <span className="text-capitalize small">{status}</span>
                  </div>
                  <span className="fw-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h6 className="fw-semibold mb-0">Call Type Breakdown</h6>
            </div>
            <div className="card-body">
              {Object.entries(data?.call_type_breakdown || {}).map(([type, count]) => (
                <div key={type} className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <Badge value={type} />
                    <span className="text-capitalize small">{type}</span>
                  </div>
                  <span className="fw-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Export />

      {/* ── Employee breakdown ─────────────────────────── */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="fw-semibold mb-0">Employee Activity</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 fw-semibold text-muted small text-uppercase">Employee</th>
                  <th className="fw-semibold text-muted small text-uppercase">Role</th>
                  <th className="fw-semibold text-muted small text-uppercase text-center">Calls</th>
                  <th className="fw-semibold text-muted small text-uppercase text-center">Tasks</th>
                  <th className="fw-semibold text-muted small text-uppercase text-center">Work Logs</th>
                </tr>
              </thead>
              <tbody>
                {!data?.employee_breakdown?.length && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">No employees found</td>
                  </tr>
                )}
                {data?.employee_breakdown?.map((emp) => (
                  <tr key={emp.id}>
                    <td className="px-3">
                      <div className="fw-semibold">{emp.name}</div>
                      <div className="text-muted small">{emp.employee_id}</div>
                    </td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-secondary">
                        {emp.role || "—"}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-info bg-opacity-10 text-info fw-bold">{emp.calls}</span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold">{emp.tasks}</span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-warning bg-opacity-10 text-warning fw-bold">{emp.work_logs}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;