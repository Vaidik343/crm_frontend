// src/features/interns/pages/public/InternLogin.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIntern } from "../../../../context/InternContext";
import { saveInternToken } from "../../hooks/useInternAuth";
import toast from "react-hot-toast";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";


import loginBg from '../../../../assets/login.png';


const InternLogin = () => {
  const navigate         = useNavigate();
  const { loginIntern }  = useIntern();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())
      e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email.";
    if (!form.password)
      e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const data = await loginIntern({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });

      saveInternToken(data.accessToken);
      toast.success(`Welcome, ${data.intern.name}!`);
      navigate("/intern/dashboard", { replace: true });

    } catch (error) {
      const status = error?.response?.status;
      const msg    = error?.response?.data?.message;

      // 403 — application not in a loginable state
      // show as a styled banner rather than just a toast
      // so the intern understands why they can't log in
      if (status === 403) {
        setErrors({ banner: msg });
        return;
      }

      // 401 — wrong credentials
      setErrors({ password: msg || "Invalid email or password." });
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
    <div
      className="min-h-screen bg-slate-100 bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-10 relative"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden relative z-10">

        {/* Header */}
        <div className="bg-[#132ea7] px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <img
              src="/Bluebell-Logo.webp"
              alt="Bluebell Logo"
              className="h-9 w-auto object-contain bg-white rounded-lg p-1 shrink-0"
            />
            <span className="font-black text-white text-lg uppercase tracking-tight">
              Intern Portal
            </span>
          </div>
          <p className="text-white/60 text-xs font-semibold mt-2">
            Sign in to your intern account
          </p>
        </div>

        <div className="px-8 py-10">

          {/* 403 banner — pending / rejected / completed */}
          {errors.banner && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-amber-700">{errors.banner}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

            {/* Email */}
            <div>
              <label className={labelCls}>
                Email <span className="text-red-400">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={inputCls(errors.email)}
                autoComplete="email"
              />
              {errors.email && <p className={errCls}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className={labelCls}>
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${inputCls(errors.password)} pr-10`}
                  autoComplete="current-password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#132ea7] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f2490] transition disabled:opacity-60 mt-2"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Register link */}
          <p className="text-center text-xs text-slate-400 font-semibold mt-8">
            Not registered yet?{" "}
            <Link
              to="/intern/register"
              className="text-[#132ea7] font-black hover:underline"
            >
              Apply here
            </Link>
          </p>

          {/* Check status link */}
          <p className="text-center text-xs text-slate-400 font-semibold mt-2">
            Already applied?{" "}
            <Link
              to="/intern/register"
              className="text-[#132ea7] font-black hover:underline"
              onClick={(e) => {
                e.preventDefault();
                const id = window.prompt("Enter your Application ID to check status:");
                if (id?.trim()) navigate(`/intern/status/${id.trim()}`);
              }}
            >
              Check your status
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default InternLogin;