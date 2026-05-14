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
  MdMenuOpen
} from "react-icons/md";

import { CgLogOut } from "react-icons/cg";
import { BsFillCaretLeftSquareFill } from "react-icons/bs"
import { BsFillCaretRightSquareFill } from "react-icons/bs";

const navItems = [
  { to: "/admin/dashboard",   label: "Dashboard",   icon: <MdDashboard size={20} /> },
  { to: "/admin/employees",   label: "Employees",   icon: <MdPeople size={20} /> },
  { to: "/admin/roles",       label: "Roles",       icon: <MdLabel size={20} /> },
  { to: "/admin/projects",    label: "Projects",    icon: <MdFolder size={20} /> },
  { to: "/admin/tasks",       label: "Tasks",       icon: <MdCheckCircle size={20} /> },
  { to: "/admin/calls",       label: "Calls",       icon: <MdPhone size={20} /> },
  { to: "/admin/permissions", label: "Permissions", icon: <MdLock size={20} /> },
  { to: "/admin/export",      label: "Export",      icon: <MdFileDownload size={20} /> },
];
const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {user, logout} = useAuth();

    return(
        <div className="d-flex vh-100 overflow-hidden">
            {/* sidebar */}
            <div
             className="d-flex flex-column bg-dark text-white flex-shrink-0"
             style={{
                width: collapsed ? 64 : 240,
                transition: "width 0.2 ease",
                overflowX: "hidden",
             }}            
            >
                  {/* logo + toggle */}
                  <div
                   className="d-flex align-items-center justify-content-between px-3 border-secondary"
                   style={{height: 60, minWidth: 0}}
                  >
                    {
                        !collapsed && (
                            <span className="fw-bold fs-6 text-white text-truncate">CRM Panel</span>
                        )
                    }
                    <button
                      className="btn btn-sm btn-outline-secondary ms-auto"
                      onClick={() => setCollapsed((prev) => !prev)}
                      title={collapsed ? "Expand" : "Collapse"}
                      
                    >
                        {collapsed ? <BsFillCaretRightSquareFill /> : <BsFillCaretLeftSquareFill />}
                    </button>
                  </div>

                  {/* Nav links */}
                  <nav className="flex-grow-1 py-3 overflow-y-auto">
                    {navItems.map((item) => ( 
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({isActive}) =>
                         `d-flex align-item-center gap-3 px-3 py-2 text-decoration-none text-white-50 ${isActive ? "bg-primary bg-opacity-25 text-white fw-semibold" : ""}      rounded mx-2 mb-1`
                        }
                        style={{whiteSpace: "nowrap", overflow:"hidden"}}
                        >
                            <span style={{fontSize:18, flexShrink: 0}}>{item.icon}</span>
                                {!collapsed && <span className="small">{item.label}</span>}
                        </NavLink>
                    ))}
                  </nav>

                    {/* User info + logout */}
                    <div className="border-top boarder-secondary px-3 py-3">
                        {!collapsed && (
                            <>
                            <p className="small text-white-50 mb-0 text-truncate">{user?.name}</p>
                            <p className="small text-white-50 mb-0 text-truncate">{user?.employee_id}</p>
                            </>
                        )}
                        <Button
                         className="btn btn-sm btn-outline w-100"
                         onClick={logout}
                         title="Logout"
                        >
                            
                            <CgLogOut /> {collapsed ? "" : "Logout"}
                        </Button>
                    </div>
            </div>

            {/* Main area */}
            <div className="d-flex flex-column flex-grow-1 overflow-hidden">

                {/* top navbar */}

                <div
                 className="d-flex align-item-center justify-content-between px-4 bg-white border-bottom shadow-sm flex-shrink-0"
                 style={{height:60}}
                >
                    <h6 className="mb-0 fw-semibold text-muted">Admin Dashboard</h6>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary">{user?.role || "Admin"}</span>
                        {/* later just display admin */}
                        <span className="small text-muted">{user?.name}</span>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-grow-1 overflow-auto p-4 bg-light">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout;