import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import Button from "../ui/Button";

import {  
   MdLogout, MdTask, MdPhone, MdBook, MdLock, MdDashboard, MdMenu,MdClose, MdFolder} from "react-icons/md";
import { useState } from "react";
import NotificationBell from "../NotificationBell";

const navItems = [
    { to: "/employee/MyDashboard", label: "Dashboard", icon: <MdDashboard size={18} /> },
    { to: "/employee/tasks", label: "My Tasks", icon: <MdTask size={18} /> },
    { to: "/employee/calls", label: "My Calls", icon: <MdPhone size={18} /> },
    { to: "/employee/work-logs", label: "Work Log", icon: <MdBook size={18} /> },
    { to: "/employee/password", label: "Password", icon: <MdLock size={18} /> },
    { to: "/employee/projects", label: "Projects", icon: <MdFolder size={18} /> },
    //   {to: "/Team", label:"Team", }
];

const EmployeeLayout = () => {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="h-screen    bg-slate-50  flex flex-col   ">
            {/* Top Navbar - Modernized Horizontal Layout */}
         <nav className="bg-[#132ea7] border-b   border-slate-200 sticky top-0 z-50 shadow-sm">

    {/* TOP BAR */}
    <div className="h-[70px] px-4 md:px-6 flex items-center justify-between gap-4 max-w-full">


        {/* LEFT */}
 <div className="flex items-center gap-4 lg:gap-8 min-w-0 flex-1">

            {/* Brand */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-[#132ea7] font-black text-xs">CRM</span>
                </div>

                <span className="font-black text-lg text-white tracking-tight uppercase">
                    Portal
                </span>
            </div>

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
            <NotificationBell />
            <div className="w-10 h-10 rounded-full bg-white flex items-center truncate max-w-[120px] lg:max-w-none justify-center text-[#132ea7] font-black shadow-inner">
                {user?.name?.charAt(0) || "E"}
            </div>

            {/* Desktop Logout */}
            <div className="hidden  min-[1180px]:block">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-red-200 hover:bg-red-50 hover:text-red-500 font-black uppercase tracking-widest text-xs gap-2"
                >
                    <MdLogout size={18} />
                    Logout
                </Button>
            </div>

            {/* Mobile Toggle */}
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
        className={`min-[1180px]:hidden  overflow-hidden transition-all duration-300 ${
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
                onClick={logout}
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
                <div className="max-w-8xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default EmployeeLayout;