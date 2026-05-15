import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import Button from "../ui/Button";
import { MdLogout, MdTask, MdPhone, MdBook, MdLock } from "react-icons/md";

const navItems = [
  { to: "/employee/tasks",     label: "My Tasks",  icon: <MdTask size={18} /> },
  { to: "/employee/calls",     label: "My Calls",  icon: <MdPhone size={18} /> },
  { to: "/employee/work-logs", label: "Work Log",  icon: <MdBook size={18} /> },
  { to: "/employee/password",  label: "Password",  icon: <MdLock size={18} /> },
];

const EmployeeLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Top Navbar - Modernized Horizontal Layout */}
            <nav className="h-[70px] bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-10">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#132ea7] rounded-lg flex items-center justify-center shadow-lg shadow-[#132ea7]/20">
                            <span className="text-white font-black text-xs">CRM</span>
                        </div>
                        <span className="font-black text-lg text-slate-800 tracking-tight uppercase valorant-text">Portal</span>
                    </div>

                    {/* Navigation Items */}
                    <ul className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 uppercase tracking-widest ${
                                            isActive 
                                            ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20" 
                                            : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
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

                {/* Right Actions */}
                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-black text-slate-800 leading-none uppercase tracking-tight">{user?.name}</span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5">{user?.role || "Employee"}</span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#132ea7] font-black shadow-inner border border-slate-200">
                        {user?.name?.charAt(0) || "E"}
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-1"></div>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={logout}
                        className="text-red-500 hover:bg-red-50 font-black uppercase tracking-widest text-xs gap-2"
                    >
                        <MdLogout size={18} />
                        Logout
                    </Button>
                </div>
            </nav>

            {/* Page Content */}
            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default EmployeeLayout;