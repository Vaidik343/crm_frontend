import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { usePassword } from "../../context/PasswordContext";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import {
  MdPerson,
  MdLock,
  MdLogout,
  MdEdit,
  MdSave,
  MdClose,
  MdPhone,
  MdEmail,
  MdCake,
  MdLocationOn,
  MdBadge,
  MdShield,
  MdVisibility,
  MdVisibilityOff,
  MdVerifiedUser,
} from "react-icons/md";

const TAB_PROFILE = "profile";
const TAB_PASSWORD = "password";

const INPUT_CLS =
  "w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 focus:border-[#132ea7] transition-all placeholder:text-slate-400 placeholder:font-normal disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed";

const INPUT_ICON_CLS =
  "w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 focus:border-[#132ea7] transition-all placeholder:text-slate-400 placeholder:font-normal";

const LABEL_CLS =
  "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block";

const EmployeeProfile = () => {
  const { user, logout, setUser } = useAuth();
  const { updateUser } = useUser();
  const { changeOwnPassword } = usePassword();

  const [tab, setTab] = useState(TAB_PROFILE);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // ── Profile state ──
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    date_of_birth: "",
    address: "",
  });
  const [profileError, setProfileError] = useState("");

  // ── Password state ──
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Seed profile from auth user ──
  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      date_of_birth: user.date_of_birth || "",
      address: user.address || "",
    });
  }, [user]);

  // Password strength logic
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const pwStrength = getPasswordStrength(pwForm.next);

  // ── Profile save ──
  const handleProfileSave = async () => {
    if (!profile.name.trim()) { setProfileError("Name is required."); return; }
    if (!profile.email.trim()) { setProfileError("Email is required."); return; }
    if (profile.mobile && !/^(\d{10}|\d{12})$/.test(profile.mobile.replace(/\s/g, ""))) {
      setProfileError("Mobile must be 10 or 12 digits.");
      return;
    }
    try {
      setSaving(true);
      setProfileError("");
      const res = await updateUser(user.id, {
        name: profile.name.trim(),
        email: profile.email.trim(),
        mobile: profile.mobile.trim() || null,
        date_of_birth: profile.date_of_birth || null,
        address: profile.address.trim() || null,
      });
      if (setUser && res?.user) setUser((prev) => ({ ...prev, ...res.user }));
      setAlert({ type: "success", message: "Profile updated successfully." });
      setEditing(false);
    } catch (err) {
      setProfileError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setProfileError("");
    setProfile({
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      date_of_birth: user?.date_of_birth || "",
      address: user?.address || "",
    });
  };

  // ── Password save ──
  const handlePasswordSave = async () => {
    if (!pwForm.current.trim()) { setPwError("Current password is required."); return; }
    if (!pwForm.next.trim()) { setPwError("New password is required."); return; }
    if (pwForm.next.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    try {
      setPwSaving(true);
      setPwError("");
      await changeOwnPassword({ current_password: pwForm.current, new_password: pwForm.next });
      setAlert({ type: "success", message: "Password updated. Logging you out..." });
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => logout(), 2000);
    } catch (err) {
      setPwError(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  };

  // ── Read-only Card Item ──
  const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5 hover:bg-slate-50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-[#132ea7]/10 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-[#132ea7]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{value || "—"}</p>
      </div>
    </div>
  );

  // ── Password eye button ──
  const EyeBtn = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
    >
      {show ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">

  
      {/* ── Header Card ── */}
      <div className="bg-[#132ea7] rounded-[2rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-[1.5rem] bg-white text-[#132ea7] flex items-center justify-center font-black text-3xl shadow-2xl shrink-0">
            {user?.name?.charAt(0) || "?"}
          </div>
          <div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">{user?.employee_id}</p>
            <h1 className="text-2xl font-black tracking-tight">{user?.name}</h1>
            <p className="text-white/70 font-bold text-sm mt-1">{user?.role?.name || user?.role || "Employee"}</p>
          </div>
        </div>
      </div>
      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* ── Navigation Tabs Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: TAB_PROFILE, label: "Profile Details", icon: MdPerson },
            { id: TAB_PASSWORD, label: "Security & Password", icon: MdLock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                tab === id
                  ? "bg-[#132ea7] text-white shadow-md shadow-[#132ea7]/25"
                  : "text-slate-500 hover:text-[#132ea7] hover:bg-slate-50"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Logout button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all duration-200 ml-auto"
        >
          <MdLogout size={16} />
          Logout
        </button>
      </div>

      {/* ════════════════════════
          PROFILE TAB
      ════════════════════════ */}
      {tab === TAB_PROFILE && (
        <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xl shadow-slate-100 overflow-hidden transition-all">

          {/* Card Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/40">
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Personal Details</h2>
              <p className="text-xs text-slate-400 font-medium">Manage and view your official profile information</p>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#132ea7]/10 text-[#132ea7] text-xs font-black uppercase tracking-wider hover:bg-[#132ea7] hover:text-white transition-all shadow-sm"
              >
                <MdEdit size={15} /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-all"
                >
                  <MdClose size={15} /> Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#132ea7] text-white text-xs font-black uppercase tracking-wider hover:bg-[#132ea7]/90 transition-all shadow-md shadow-[#132ea7]/20 disabled:opacity-60"
                >
                  {saving ? <Spinner size="sm" /> : <MdSave size={15} />}
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="p-8">
            {profileError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{profileError}</p>
              </div>
            )}

            {/* Read-only View (Grid layout) */}
            {!editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard icon={MdBadge} label="Employee ID" value={user?.employee_id} />
                <InfoCard icon={MdPerson} label="Full Name" value={user?.name} />
                <InfoCard icon={MdEmail} label="Email Address" value={user?.email} />
                <InfoCard icon={MdPhone} label="Mobile Phone" value={user?.mobile} />
                <InfoCard icon={MdCake} label="Date of Birth" value={user?.date_of_birth} />
                <InfoCard icon={MdLocationOn} label="Residential Address" value={user?.address} />
              </div>
            ) : (
              /* Editable Form View */
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className={LABEL_CLS}>Full Name *</label>
                    <div className="relative">
                      <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your full name"
                        className={INPUT_ICON_CLS}
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className={LABEL_CLS}>Email Address *</label>
                    <div className="relative">
                      <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                        placeholder="your@email.com"
                        className={INPUT_ICON_CLS}
                      />
                    </div>
                  </div>

                  {/* Mobile Phone */}
                  <div>
                    <label className={LABEL_CLS}>Mobile Phone</label>
                    <div className="relative">
                      <MdPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="tel"
                        value={profile.mobile}
                        onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))}
                        placeholder="10 or 12 digit number"
                        className={INPUT_ICON_CLS}
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className={LABEL_CLS}>Date of Birth</label>
                    <div className="relative">
                      <MdCake className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="date"
                        value={profile.date_of_birth}
                        onChange={(e) => setProfile((p) => ({ ...p, date_of_birth: e.target.value }))}
                        className={INPUT_ICON_CLS}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className={LABEL_CLS}>Residential Address</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Enter your street address..."
                    rows={3}
                    className={`${INPUT_CLS} resize-none`}
                  />
                </div>

                {/* Read-only reference Metadata */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLS}>Employee ID (Locked)</label>
                    <input type="text" value={user?.employee_id || ""} disabled className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Role (Locked)</label>
                    <input type="text" value={user?.role?.name || user?.role || ""} disabled className={INPUT_CLS} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════
          PASSWORD TAB
      ════════════════════════ */}
      {tab === TAB_PASSWORD && (
        <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xl shadow-slate-100 overflow-hidden">
          
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#132ea7]/10 flex items-center justify-center shrink-0">
              <MdShield size={20} className="text-[#132ea7]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Change Password</h2>
              <p className="text-xs text-slate-400 font-medium">Keep your account secure with a strong password</p>
            </div>
          </div>

          <div className="p-8 max-w-xl mx-auto space-y-5">
            {pwError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{pwError}</p>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className={LABEL_CLS}>Current Password</label>
              <div className="relative">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showCurrent ? "text" : "password"}
                  value={pwForm.current}
                  onChange={(e) => { setPwForm((p) => ({ ...p, current: e.target.value })); setPwError(""); }}
                  placeholder="Enter current password"
                  className={`${INPUT_ICON_CLS} pr-11`}
                />
                <EyeBtn show={showCurrent} onToggle={() => setShowCurrent((s) => !s)} />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className={LABEL_CLS}>New Password</label>
              <div className="relative">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showNew ? "text" : "password"}
                  value={pwForm.next}
                  onChange={(e) => { setPwForm((p) => ({ ...p, next: e.target.value })); setPwError(""); }}
                  placeholder="Enter new password (min. 6 chars)"
                  className={`${INPUT_ICON_CLS} pr-11`}
                />
                <EyeBtn show={showNew} onToggle={() => setShowNew((s) => !s)} />
              </div>

              {/* Password Strength Indicator */}
              {pwForm.next.length > 0 && (
                <div className="mt-2.5 space-y-1">
                  <div className="flex gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          pwStrength >= level
                            ? pwStrength <= 1
                              ? "bg-red-400"
                              : pwStrength <= 3
                              ? "bg-amber-400"
                              : "bg-emerald-500"
                            : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    {pwStrength <= 1 ? "Weak" : pwStrength <= 3 ? "Moderate" : "Strong"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className={LABEL_CLS}>Confirm New Password</label>
              <div className="relative">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={pwForm.confirm}
                  onChange={(e) => { setPwForm((p) => ({ ...p, confirm: e.target.value })); setPwError(""); }}
                  placeholder="Re-enter new password"
                  className={`${INPUT_ICON_CLS} pr-11`}
                />
                <EyeBtn show={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3">
              <MdShield className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                For security reasons, updating your password will automatically log you out of all active sessions.
              </p>
            </div>

            <button
              onClick={handlePasswordSave}
              disabled={pwSaving}
              className="w-full py-3.5 bg-[#132ea7] text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-[#132ea7]/90 transition-all shadow-xl shadow-[#132ea7]/20 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {pwSaving ? <Spinner size="sm" /> : <MdShield size={18} />}
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-red-500">
              <MdLogout size={30} />
            </div>
            
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Sign Out?</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              Are you sure you want to log out of your employee portal?
            </p>

            <div className="flex gap-3 w-full mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutModal(false); logout(); }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black text-xs uppercase tracking-wider hover:bg-red-600 transition shadow-lg shadow-red-500/25"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeProfile;