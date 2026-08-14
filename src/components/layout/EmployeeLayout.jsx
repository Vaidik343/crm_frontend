import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import Button from "../ui/Button";

import {  
   MdLogout, MdTask, MdPhone, MdBook, MdLock, MdDashboard, MdMenu,MdClose, MdFolder, MdNotifications,       MdEventAvailable,
  MdHistory,
  MdCelebration, } from "react-icons/md";
import { useState } from "react";
import NotificationBell from "../NotificationBell";
import HeaderLogo from "../common/HeaderLogo";
import AnnouncementBell from "../ui/AnnouncementBell";
import AnnouncementPopup from "../ui/AnnouncementPopup";

const navItems = [
    { to: "/employee/myDashboard", label: "Dashboard", icon: <MdDashboard size={18} /> },
    { to: "/employee/tasks", label: "My Tasks", icon: <MdTask size={18} /> },
    { to: "/employee/calls", label: "My Calls", icon: <MdPhone size={18} /> },
    { to: "/employee/work-logs", label: "Work Log", icon: <MdBook size={18} /> },
    // { to: "/employee/password", label: "Password", icon: <MdLock size={18} /> },
    { to: "/employee/projects", label: "Projects", icon: <MdFolder size={18} /> },
    { to: "/employee/leaves", label: "Leaves", icon: <MdEventAvailable size={18} /> },
    { to: "/employee/holiday", label: "Holidays", icon: <MdCelebration size={18} /> },
    { to: "/employee/events", label: "Events", icon: <MdCelebration size={20} /> }
    //   { to: "/employee/notifications", label: "Notifications", icon: <MdNotifications size={18} /> },
    //   {to: "/Team", label:"Team", }
];

const EmployeeLayout = () => {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Add this handler
const handleLogout = () => setShowLogoutModal(true);
const confirmLogout = () => { setShowLogoutModal(false); logout(); };
const cancelLogout = () => setShowLogoutModal(false);

//     const handleLogout = () => {
//   if (window.confirm('Are you sure you want to logout?')) {
//     logout()
//   }
// }

    return (
        <div className="h-screen    bg-slate-50  flex flex-col   ">
            {/* Top Navbar - Modernized Horizontal Layout */}
         <nav className="bg-[#132ea7] border-b   border-slate-200 sticky top-0 z-50 shadow-sm">

    {/* TOP BAR */}
    <div className="h-[70px] px-4 md:px-6 md:mb-4 flex items-center justify-between gap-4 max-w-full">


        {/* LEFT */}
 <div className="flex items-center gap-4 lg:gap-8 min-w-0 flex-1">

            {/* Brand */}
            <HeaderLogo
              title="Portal"
              logoClassName="h-8 w-auto object-contain bg-white rounded-lg p-1 shrink-0 shadow-lg"
              titleClassName="font-black text-lg text-white tracking-tight uppercase"
            />

            {/* Desktop Nav */}
            <ul className="hidden min-[1180px]:flex   items-center gap-1 lg:gap-2 flex flex-wrap mt-4 p-1 no-scrollbar min-w-0">
                {navItems.map((item) => (
                    <li key={item.to} className="shrink-0">
                        <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 uppercase text-decoration-none  tracking-widest 
                                ${
                                    isActive
                                        ? "bg-[#e98937] text-white shadow-lg "
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

        {/* RIGHT */}
        <div className="flex items-center gap-2  lg:gap-6 shrink-0">

            {/* Desktop User Info */}
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-white leading-none uppercase tracking-tight">
                    {user?.name}
                </span>

                 <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] mt-1">
        {user?.role || "Employee"} {user?.employee_id ? `• ${user.employee_id}` : ""}
    </span>
            </div>

            {/* Avatar */}
            <AnnouncementBell isEmployee={true} />
            <NotificationBell />
          <NavLink
    to="/employee/profile"
    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#132ea7] font-black shadow-inner hover:ring-2 hover:ring-white/50 transition-all no-underline "
    title="My Profile"
    style={{ textDecoration: "none" }}
>
    {user?.name?.charAt(0) || "E"}
</NavLink>
            {/* Desktop Logout */}
            {/* <div className="hidden  min-[1180px]:block">
                <Button
                    // variant="white"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white rounded  hover:text-red-500 font-black uppercase tracking-widest text-xs gap-2"
                >
                    <MdLogout size={18} />
                    Logout
                </Button>
            </div> */}

            {/* Mobile Toggle */}
            {/* <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="min-[1180px]:hidden text-white p-2 rounded-lg hover:bg-white/10 transition"
            >
                {mobileOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
            </button> */}
        </div>
    </div>

    {/* MOBILE MENU */}
    <div
        className={`min-[1180px]:hidden  overflow-hidden transition-all duration-300  text-decoration-none ${
            mobileOpen ? "max-h-[500px] border-t border-white/10 " : "max-h-0"
        }`}
    >
        <div className="px-4 py-4 flex flex-col  gap-2 bg-[#132ea7]">

            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all text-decoration-none
                        ${
                            isActive
                                ? "bg-[#e98937] text-white"
                                : "text-white hover:bg-[#e2832f]"
                        }`
                    }
                >
                    {item.icon}
                    {item.label}
                </NavLink>
            ))}

            {/* Mobile Logout */}
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

            {/* Page Content */}
            <main className="flex-1 p-8  overflow-x-hidden ">
                <div className="max-w-auto mx-auto">
                    <Outlet />
                </div>
                <AnnouncementPopup isEmployee={true} />
            </main>


            {/* Logout Confirmation Modal */}
{showLogoutModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-4">
      
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <MdLogout size={32} className="text-red-500" />
      </div>

      {/* Text */}
      <div className="text-center">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">
          Logout
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Are you sure you want to logout?
        </p>
      </div>

      {/* Buttons */}
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

export default EmployeeLayout;