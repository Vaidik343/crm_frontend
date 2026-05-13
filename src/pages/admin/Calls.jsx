import { useEffect, useState } from "react";
import { useCall } from "../../context/CallContext";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";

import { MdEdit, MdDelete, MdLockReset, MdVisibility } from "react-icons/md";


const FILTER_OPTIONS = [
  { value: "all",       label: "All" },
  { value: "inquiry",   label: "Inquiry" },
  { value: "request",   label: "Request" },
  { value: "complaint", label: "Complaint" },
];

const Calls = () => {
  const { calls, loading, getAllCalls } = useCall();

  const [filter, setFilter]       = useState("all");
  const [viewTarget, setViewTarget] = useState(null);
  const [alert, setAlert]         = useState({ type: "", message: "" });

  useEffect(() => {
    getAllCalls();
  }, []);

  const filtered = filter === "all"
    ? calls
    : calls.filter((c) => c.call_type === filter);

  if (loading && !calls.length) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">All Calls</h4>
          <p className="text-muted small mb-0">{calls.length} total call logs</p>
        </div>
        <select
          className="form-select form-select-sm"
          style={{ width: 160 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Calls table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 text-muted small text-uppercase fw-semibold">Caller</th>
                  <th className="text-muted small text-uppercase fw-semibold">Employee</th>
                  <th className="text-muted small text-uppercase fw-semibold">Project</th>
                  <th className="text-muted small text-uppercase fw-semibold">Type</th>
                  <th className="text-muted small text-uppercase fw-semibold">Subtype</th>
                  <th className="text-muted small text-uppercase fw-semibold">Received Via</th>
                  <th className="text-muted small text-uppercase fw-semibold">Date</th>
                  <th className="text-muted small text-uppercase fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-5">
                      No calls found
                    </td>
                  </tr>
                )}
                {filtered.map((call) => (
                  <tr key={call.id}>
                    <td className="px-3">
                      <div className="fw-semibold">{call.caller_name}</div>
                      {call.caller_number && (
                        <div className="text-muted small">{call.caller_number}</div>
                      )}
                    </td>
                    <td>
                      <div className="fw-medium">{call.User?.name || "—"}</div>
                      <div className="text-muted small">{call.User?.employee_id || ""}</div>
                    </td>
                    <td>
                      <span className="text-muted small">{call.Project?.name || "—"}</span>
                    </td>
                    <td><Badge value={call.call_type} /></td>
                    <td>
                      <span className="text-muted small">{call.call_subtype}</span>
                    </td>
                    <td><Badge value={call.receive_type} /></td>
                    <td>
                      <span className="text-muted small">
                        {new Date(call.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => setViewTarget(call)}
                      >
                          <MdVisibility size={14} className="me-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View call detail modal */}
      <Modal
        show={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Call Details"
        size="lg"
      >
        {viewTarget && (
          <div className="row g-3">
            <div className="col-md-6">
              <p className="text-muted small mb-1">Caller Name</p>
              <p className="fw-semibold mb-0">{viewTarget.caller_name}</p>
            </div>
            <div className="col-md-6">
              <p className="text-muted small mb-1">Caller Number</p>
              <p className="fw-semibold mb-0">{viewTarget.caller_number || "—"}</p>
            </div>
            <div className="col-md-6">
              <p className="text-muted small mb-1">Logged By</p>
              <p className="fw-semibold mb-0">
                {viewTarget.User?.name || "—"}{" "}
                <span className="text-muted small">({viewTarget.User?.employee_id})</span>
              </p>
            </div>
            <div className="col-md-6">
              <p className="text-muted small mb-1">Project</p>
              <p className="fw-semibold mb-0">{viewTarget.Project?.name || "—"}</p>
            </div>
            <div className="col-md-4">
              <p className="text-muted small mb-1">Call Type</p>
              <Badge value={viewTarget.call_type} />
            </div>
            <div className="col-md-4">
              <p className="text-muted small mb-1">Subtype</p>
              <p className="fw-semibold mb-0">{viewTarget.call_subtype}</p>
            </div>
            <div className="col-md-4">
              <p className="text-muted small mb-1">Received Via</p>
              <Badge value={viewTarget.receive_type} />
            </div>
            {viewTarget.call_summary && (
              <div className="col-12">
                <p className="text-muted small mb-1">Summary</p>
                <p className="mb-0">{viewTarget.call_summary}</p>
              </div>
            )}
            {viewTarget.remarks && (
              <div className="col-12">
                <p className="text-muted small mb-1">Remarks</p>
                <p className="mb-0">{viewTarget.remarks}</p>
              </div>
            )}
            <div className="col-12">
              <p className="text-muted small mb-1">Logged At</p>
              <p className="fw-semibold mb-0">
                {new Date(viewTarget.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Calls;