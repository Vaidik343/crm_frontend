// src/features/interns/layout/InternLayout.jsx

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  MdDashboard, MdTask, MdBook, MdFolder, MdPerson,
  MdLogout, MdMenu, MdClose,
} from "react-icons/md";
import { clearInternToken, useInternAuth } from "../../features/interns/hooks/useInternAuth";

import HeaderLogo from "../common/HeaderLogo";

const navItems = [
  { to: "/intern/dashboard", label: "Dashboard", icon: <MdDashboard size={18} /> },
  { to: "/intern/project",   label: "Project",   icon: <MdFolder size={18} /> },
  { to: "/intern/tasks",     label: "Tasks",     icon: <MdTask size={18} /> },
  { to: "/intern/worklogs",  label: "Work Logs", icon: <MdBook size={18} /> },
  { to: "/intern/profile",   label: "Profile",   icon: <MdPerson size={18} /> },
];

const InternLayout = () => {
  const { internName, internType } = useInternAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen]       = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => setShowLogoutModal(true);
  const cancelLogout  = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    clearInternToken();
    navigate("/intern/login", { replace: true });
  };

  // Capitalise first letter for display — "intern" → "Intern"
  const typeLabel = internType
    ? internType.charAt(0).toUpperCase() + internType.slice(1)
    : "Intern";

  return (
    <div className="h-screen bg-slate-50 flex flex-col">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="bg-[#132ea7] border-b border-slate-200 sticky top-0 z-50 shadow-sm">

        {/* TOP BAR */}
        <div className="h-[70px] px-4 md:px-6 md:mb-4 flex items-center justify-between gap-4 max-w-full">

          {/* LEFT — brand + nav links */}
          <div className="flex items-center gap-4 lg:gap-8 min-w-0 flex-1">

            {/* Brand */}
            <HeaderLogo
              title="Intern"
              logoClassName="h-8 w-auto object-contain bg-white rounded-lg p-1 shrink-0 shadow-lg"
              titleClassName="font-black text-lg text-white tracking-tight uppercase"
            />

            {/* Desktop nav */}
            <ul className="hidden min-[1180px]:flex items-center gap-1 lg:gap-2 flex flex-wrap mt-4 p-1 no-scrollbar min-w-0">
              {navItems.map((item) => (
                <li key={item.to} className="shrink-0">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 uppercase tracking-widest
                      ${isActive
                        ? "bg-[#e98937] text-white shadow-lg"
                        : "text-white hover:bg-[#e2832f]"
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — user info + logout + mobile toggle */}
          <div className="flex items-center gap-2 lg:gap-6 shrink-0">

            {/* Desktop user info */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-black text-white leading-none uppercase tracking-tight">
                {internName}
              </span>
              <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] mt-1">
                {typeLabel}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#132ea7] font-black shadow-inner shrink-0">
              {internName?.charAt(0) || "I"}
            </div>

            {/* Desktop logout */}
            <button
              onClick={handleLogout}
              className="hidden min-[1180px]:flex items-center gap-2 text-white hover:text-red-400 font-black uppercase tracking-widest text-xs transition"
            >
              <MdLogout size={18} />
              Logout
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="min-[1180px]:hidden text-white p-2 rounded-lg hover:bg-white/10 transition"
            >
              {mobileOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`min-[1180px]:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? "max-h-[500px] border-t border-white/10" : "max-h-0"
          }`}
        >
          <div className="px-4 py-4 flex flex-col gap-2 bg-[#132ea7]">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all
                  ${isActive
                    ? "bg-[#e98937] text-white"
                    : "text-white hover:bg-[#e2832f]"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            {/* Mobile logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <MdLogout size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="max-w-auto mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ── Logout confirmation modal ────────────────────────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-4">

            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <MdLogout size={32} className="text-red-500" />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                Logout
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Are you sure you want to logout?
              </p>
            </div>

            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={cancelLogout}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black text-sm uppercase tracking-widest hover:bg-red-600 transition"
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

export default InternLayout;