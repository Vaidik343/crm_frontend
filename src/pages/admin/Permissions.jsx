import { useEffect, useState } from "react";
import { usePermission } from "../../context/PermissionContext";
import { useUser } from "../../context/UserContext";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import { MdSecurity, MdHistory, MdInfoOutline, MdPerson } from "react-icons/md";

const FLAGS = [
  { key: "can_read",   label: "Read",   description: "Access & View" },
  { key: "can_write",  label: "Write",  description: "Create New" },
  { key: "can_update", label: "Update", description: "Edit Existing" },
  { key: "can_delete", label: "Delete", description: "Remove Permanent" },
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

  const rows = permissions.map((perm) => {
    const user = users.find((u) => u.id === perm.user_id);
    return { ...perm, user };
  });

  const handleToggle = async (perm, flag) => {
    try {
      setSaving(`${perm.user_id}-${flag}`);
      await updatePermission(perm.user_id, { [flag]: !perm[flag] });
      setAlert({ type: "success", message: "Security protocol updated" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Operation failed" });
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async () => {
    if (!confirmReset) return;
    try {
      setResetting(true);
      await resetPermission(confirmReset.user_id);
      setAlert({ type: "success", message: "Employee permissions reverted to baseline" });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Reset failed" });
    } finally {
      setResetting(false);
      setConfirmReset(null);
    }
  };

  if (loading && !permissions.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-medium animate-pulse">Initializing security matrix...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            Access <span className="text-[#132ea7]">Matrix</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Fine-tune individual Employee authorities across the CRM system</p>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Legend / Briefing */}
      <div className="bg-[#132ea7] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          {FLAGS.map((f) => (
            <div key={f.key} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
                 <MdInfoOutline size={20} />
              </div>
              <div>
                 <p className="text-sm font-black uppercase tracking-widest text-white mb-1">{f.label}</p>
                 <p className="text-xs text-white/50 font-bold uppercase tracking-wider leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px]" />
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Employee Identity</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Security Tier</th>
                {FLAGS.map((f) => (
                  <th key={f.key} className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                    {f.label}
                  </th>
                ))}
                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Overrides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-16 font-medium italic text-lg">No security records found.</td>
                </tr>
              )}
              {rows.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#132ea7]/20">
                        <MdPerson size={24} />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-lg leading-tight">{perm.user?.name || "—"}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{perm.user?.employee_id || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                       {perm.user?.Role?.name || "Unassigned"}
                     </span>
                  </td>
                  {FLAGS.map((f) => {
                    const isSaving = saving === `${perm.user_id}-${f.key}`;
                    const isActive = perm[f.key];
                    return (
                      <td key={f.key} className="px-6 py-6">
                         <div className="flex justify-center">
                           {isSaving ? (
                             <div className="w-6 h-6 border-2 border-slate-200 border-t-[#132ea7] rounded-full animate-spin" />
                           ) : (
                             <div className="form-check form-switch mb-0">
                               <input
                                 className="form-check-input w-10 h-5"
                                 type="checkbox"
                                 role="switch"
                                 checked={isActive}
                                 onChange={() => handleToggle(perm, f.key)}
                                 style={{ cursor: "pointer" }}
                               />
                             </div>
                           )}
                         </div>
                      </td>
                    );
                  })}
                  <td className="px-10 py-6 text-right">
                    <button
                      onClick={() => setConfirmReset(perm)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/5 rounded-xl transition-all"
                    >
                      <MdHistory size={18} /> Reset Clearances
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset confirm */}
      <ConfirmDialog
        show={!!confirmReset}
        message={`This action will revert "${confirmReset?.user?.name}'s" security clearance to baseline defaults. Overrides will be purged.`}
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(null)}
        loading={resetting}
      />
    </div>
  );
};

export default Permissions;