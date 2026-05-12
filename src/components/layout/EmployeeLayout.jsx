import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import Button from "../ui/Button";

const navItems = [
    {to: "/employee/tasks", labe: "My Tasks"},
    {to: "/employee/calls", labe: "My Calls"},
    {to: "/employee/work-logs", labe: "Work log"},
    {to: "/employee/tasks", labe: "Password"},
];

const EmployeeLayout = () => {
    const {user, logout} = useAuth();

    return(
        <div>
            {/* Top navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 flex-shrink-0">
                <span className="navbar-brand fw-bold">CRM</span>
                <button
                 className="navbar-toggler"
                 type="button"
                 data-bs-toggle="collapse"
                 data-bs-target="#empNav"
                >
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="empNav">
                    <ul className="navbar-nav me-auto gap-1">
                        {navItems.map( (item) => (
                            <li key={item.to} className="nav-item">
                                  <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link px-3 rounded ${isActive ? "active bg-primary bg-opacity-25 fw-semibold" : ""}`
                  }
                >
                  {item.label}
                </NavLink>

                            </li>
                        ))}

                    </ul>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-white-50 small">{user?.name}</span>
                        <span className="badge bg-secondary">{user?.role || "Employee"}</span>

                        <Button variant="outline-danger" size="sm" onClick={logout}>Logout</Button>
                        {/* change it to just role or just employee */}

                    </div>
                </div>
            </nav>

            {/* page content */}
         <main className="flex-grow-1 overflow-y-auto p-4 bg-light">
            <Outlet />
         </main>
        </div>
    )
}

export default EmployeeLayout;