import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

import { 
    MdDashboard,
    MdPeople,
    MdLabel,
    MdFolder,
    MdCheckCircle,
    MdPhone,
    MdLock,
    MdFileDownload,
    MdMenuOpen,
    MdBook,
    MdGroup,
    MdNotifications,
    MdLogout ,
    MdPerson 
} from "react-icons/md";
import { ImUserTie } from "react-icons/im";

import { CgLogOut } from "react-icons/cg";
import { BsFillCaretLeftSquareFill } from "react-icons/bs"
import { BsFillCaretRightSquareFill } from "react-icons/bs";
import NotificationBell from "../NotificationBell";
import { usePWAInstall } from "../../hooks/usePWAInstall";

import HeaderLogo from "../common/HeaderLogo";

const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <MdDashboard size={20} /> },
    { to: "/admin/employees", label: "Employees", icon: <MdPeople size={20} /> },
    { to: "/admin/roles", label: "Roles", icon: <MdLabel size={20} /> },
    { to: "/admin/calls", label: "Calls", icon: <MdPhone size={20} /> },
    { to: "/admin/projects", label: "Projects", icon: <MdFolder size={20} /> },
    { to: "/admin/tasks", label: "Tasks", icon: <MdCheckCircle size={20} /> },
    { to: "/admin/permissions", label: "Permissions", icon: <MdLock size={20} /> },
    { to: "/admin/work-logs", label: "Work Logs", icon: <MdBook size={20} /> },
    { to: "/admin/leaves", label: "Leaves", icon: <MdBook size={20} /> },
    { to: "/admin/holidays", label: "Public Holiday", icon: <MdBook size={20} /> },
    { to: "/admin/interns", label: "Interns", icon: <MdPerson size={18} /> },
    {to: "/admin/clients", label:"Clients", icon: <ImUserTie size={20}/>},
    //   { to: "/admin/notifications", label: "Notifications", icon: <MdNotifications size={20} /> },
    // { to: "/admin/teams", label: "Teams", icon: <MdGroup size={20} /> },
    
    // { to: "/admin/export", label: "Export", icon: <MdFileDownload size={20} /> },
];
const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();

    const [showLogoutModal, setShowLogoutModal] = useState(false);
 
//        const handleLogout = () => {
//   if (window.confirm('Are you sure you want to logout?')) {
//     logout()
//   }
// }

const handleLogout = () => setShowLogoutModal(true);
const confirmLogout = () => { setShowLogoutModal(false); logout(); };
const cancelLogout = () => setShowLogoutModal(false);

const { isInstallable, install } = usePWAInstall();
console.log("🚀 ~ AdminLayout ~ isInstallable:", isInstallable)


    return (

        
        <div className="flex h-screen overflow-hidden bg-slate-50">

            

{isInstallable && (
  <button
    onClick={install}
    className="flex items-center gap-2 px-4 py-2 bg-[#132ea7] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#0f2490] transition-all"
  >
    <MdDownload size={16} /> Install App
  </button>
)}
            {/* sidebar */}
            <div
                className={`flex flex-col text-white shrink-0 transition-all duration-300 ease-in-out shadow-xl z-20`}
                style={{
                    width: collapsed ? "64px" : "260px",
                    backgroundColor: "#132ea7"
                }}
            >
                {/* logo + toggle */}
                <div className="flex items-center justify-between h-[70px] px-4 border-b border-white/10 shrink-0">
                    {!collapsed && (
                        <HeaderLogo 
                          title="CRM Panel" 
                          logoClassName="h-8 w-auto object-contain bg-white rounded-lg p-1 shrink-0"
                          titleClassName="font-bold text-lg text-white tracking-tight whitespace-nowrap"
                        />
                    )}
                    <button
                        className={`p-2 rounded hover:bg-white/10 transition-colors flex items-center justify-center ${collapsed ? "mx-auto w-10 h-10" : ""}`}
                        onClick={() => setCollapsed((prev) => !prev)}
                        title={collapsed ? "Expand" : "Collapse"}
                    >
                        {collapsed ? <BsFillCaretRightSquareFill size={20} /> : <BsFillCaretLeftSquareFill size={20} />}
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1 px-3">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                title={collapsed ? item.label : ""}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center ${collapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "gap-4 px-3 py-3"} rounded transition-all duration-200 group text-decoration-none ${isActive
                                        ? "text-white font-bold shadow-lg shadow-orange-500/20 decoration-none"
                                        : "text-white hover:bg-white/10 hover:text-white"
                                    }`
                                }
                                style={({ isActive }) => ({
                                    backgroundColor: isActive ? "#E98937" : "transparent"
                                })}
                            >
                                <span className={`shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                                    {item.icon}
                                </span>
                                {!collapsed && (
                                    <span className="text-md tracking-wide transition-opacity duration-300">
                                        {item.label}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* User info + logout */}
                <div className="p-4 border-t border-white/10 bg-black/5 flex flex-col items-center">
                    {!collapsed && (
                        <div className="mb-4 px-2 w-full">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-white/50 truncate uppercase tracking-wider">{user?.employee_id}</p>
                        </div>
                    )}
                    <button
                        className={`flex items-center justify-center gap-2 py-2.5 rounded border border-white/20 hover:bg-red-500 hover:border-red-500 transition-all duration-200 group text-white/80 hover:text-white ${collapsed ? "w-10 h-10 p-0" : "w-full"}`}
                        onClick={handleLogout}
                    >
                        <CgLogOut size={collapsed ? 20 : undefined} className="group-hover:translate-x-0.5 transition-transform" />
                        {!collapsed && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* top navbar */}
                <header className="flex items-center justify-between h-[70px] px-8 bg-white border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden">
                            <MdMenuOpen size={24} className="text-slate-600" />
                        </div>
                        <h1 className="text-lg font-semibold text-slate-800 uppercase">Admin Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-sm font-medium text-slate-700 leading-none">{user?.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user?.role || "Administrator"}</span>
                        </div>
                        <NotificationBell />
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white" style={{ backgroundColor: "#132ea7" }}>
                            {user?.name?.charAt(0) || "A"}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-8">
                    <div className="max-w-6md mx-auto">
                        {/* try 6md */}
                        <Outlet />
                    </div>
                </main>
            </div>
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

export default AdminLayout;