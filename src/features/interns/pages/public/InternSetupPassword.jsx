// src/features/interns/pages/public/InternSetupPassword.jsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useIntern } from "../../../../context/InternContext";
import toast from "react-hot-toast";
import { MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle } from "react-icons/md";

const InternSetupPassword = () => {
  const { token: setup_token } = useParams();
  const navigate               = useNavigate();
  const { setupPassword }      = useIntern();

  const [form, setForm] = useState({
    password:         "",
    confirm_password: "",
  });
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]         = useState(false);

  // toggle visibility per field
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.password)
      e.password = "Password is required.";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters.";

    if (!form.confirm_password)
      e.confirm_password = "Please confirm your password.";
    else if (form.password !== form.confirm_password)
      e.confirm_password = "Passwords do not match.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await setupPassword({
        setup_token,
        password:         form.password,
        confirm_password: form.confirm_password,
      });
      setDone(true);
    } catch (error) {
      const msg = error?.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared classes ─────────────────────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#132ea7]/30 ${
      err ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
    }`;

  const labelCls = "block text-xs font-black uppercase tracking-widest text-slate-500 mb-1";
  const errCls   = "text-xs text-red-500 font-semibold mt-1";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#132ea7] px-8 py-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[#132ea7] font-black text-xs">CRM</span>
          </div>
          <span className="font-black text-white text-lg uppercase tracking-tight">
            Set Your Password
          </span>
        </div>

        <div className="px-8 py-10">

          {/* ── Success state ── */}
          {done ? (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                <MdCheckCircle size={40} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                  Password Set Successfully
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-2">
                  Your account is ready. You can now login to the intern portal.
                </p>
              </div>
              <button
                onClick={() => navigate("/intern/login", { replace: true })}
                className="w-full py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition"
              >
                Go to Login
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <div className="flex flex-col items-center gap-3 mb-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#132ea7]/10 flex items-center justify-center">
                  <MdLock size={28} className="text-[#132ea7]" />
                </div>
                <p className="text-sm text-slate-500 font-medium max-w-xs">
                  This is a one-time setup. Choose a strong password for your intern account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

                {/* Password */}
                <div>
                  <label className={labelCls}>
                    New Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 6 characters"
                      className={`${inputCls(errors.password)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className={errCls}>{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={labelCls}>
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="confirm_password"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className={`${inputCls(errors.confirm_password)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      tabIndex={-1}
                    >
                      {showConfirm ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    </button>
                  </div>
                  {errors.confirm_password && <p className={errCls}>{errors.confirm_password}</p>}
                </div>

                {/* Password strength hint */}
                {form.password.length > 0 && form.password.length < 6 && (
                  <p className="text-xs text-amber-500 font-semibold -mt-2">
                    Password is too short ({form.password.length}/6 characters)
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60 mt-2"
                >
                  {submitting ? "Setting Password..." : "Set Password"}
                </button>

              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default InternSetupPassword;