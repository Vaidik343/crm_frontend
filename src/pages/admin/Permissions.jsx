import { useEffect, useState } from "react";
import { usePermission } from "../../context/PermissionContext";
import { useUser } from "../../context/UserContext";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const FLAGS = [
  { key: "can_read",   label: "Read",   description: "View records" },
  { key: "can_write",  label: "Write",  description: "Create new records" },
  { key: "can_update", label: "Update", description: "Edit existing records" },
  { key: "can_delete", label: "Delete", description: "Delete records" },
];

const Permissions = () => {
  const { permissions, loading, getAllPermissions, updatePermission, resetPermission } = usePermission();
  const { users, getAllUsers } = useUser();

  const [alert, setAlert]               = useState({ type: "", message: "" });
  const [saving, setSaving]             = useState(null);
  const [confirmReset, setConfirmReset] = useState(null);
  const [resetting, setResetting]       = useState(false);

  useEffect(() => {
    getAllPermissions();
    getAllUsers();
  }, []);

  // merge permissions with user info for display
  const rows = permissions.map((perm) => {
  const user = users.find((u) => u.id === perm.user_id);
  return { ...perm, user };
});

  const handleToggle = async (perm, flag) => {
    try {
      setSaving(`${perm.user_id}-${flag}`);
     await updatePermission(perm.user_id, { [flag]: !perm[flag] });


      setAlert({ type: "success", message: "Permission updated" });
    } catch (err) {
       console.log("update error:", err.response); 
      setAlert({ type: "danger", message: err?.response?.data?.message || "Update failed" });
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async () => {
    if (!confirmReset) return;
    try {
      setResetting(true);
      const res = await resetPermission(confirmReset.user_id);
      setAlert({ type: "success", message: "Permissions reset to default" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Reset failed" });
    } finally {
      setResetting(false);
      setConfirmReset(null);
    }
  };

  if (loading && !permissions.length) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Permissions</h4>
        <p className="text-muted small mb-0">
          Control what each employee can do. Admins always have full access.
        </p>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* Legend */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3">
          <div className="row g-3">
            {FLAGS.map((f) => ( 
              <div key={f.key} className="col-6 col-md-3 ">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2">
                    {f.label}
                  </span>
                  <span className="text-muted small">{f.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 text-muted small text-uppercase fw-semibold">Employee</th>
                  <th className="text-muted small text-uppercase fw-semibold">Role</th>
                  {FLAGS.map((f) => (
                    <th key={f.key} className="text-muted small text-uppercase fw-semibold text-center ">
                      {f.label}
                    </th>
                  ))}
                  <th className="text-muted small text-uppercase fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-5">
                      No permissions found
                    </td>
                  </tr>
                )}
                {rows.map((perm) => (
                  <tr key={perm.id}>
                    <td className="px-3">
                      <div className="fw-semibold">{perm.user?.name || "—"}</div>
                      <div className="text-muted small">{perm.user?.employee_id || "—"}</div>
                    </td>
                    <td>
                      <span className="text-muted small">{perm.user?.Role?.name || "—"}</span>
                    </td>
                    {FLAGS.map((f) => {
                      const isSaving = saving === `${perm.user_id}-${f.key}`;
                      return (
                        <td key={f.key} className="text-center">
                          {isSaving ? (
                            <span
                              className="spinner-border spinner-border-sm text-primary"
                              role="status"
                            />
                          ) : (
                            <div className="form-check form-switch d-flex justify-content-center mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                checked={perm[f.key]}
                                onChange={() => handleToggle(perm, f.key)}
                                title={`Toggle ${f.label}`}
                                style={{ cursor: "pointer" }}
                              />
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setConfirmReset(perm)}
                      >
                        Reset
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reset confirm */}
      <ConfirmDialog
        show={!!confirmReset}
        message={`Reset "${confirmReset?.user?.name}'s" permissions to default? Read and Write will be enabled, Update and Delete will be disabled.`}
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(null)}
        loading={resetting}
      />
    </div>
  );
};

export default Permissions;