import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import EmployeeLayout from './components/layout/EmployeeLayout';

import Login           from "./pages/Login";
import AdminDashboard  from "./pages/admin/Dashboard";
import Employees       from "./pages/admin/Employees";
import Roles           from "./pages/admin/Roles";
import Projects        from "./pages/admin/Projects";
import Tasks           from "./pages/admin/Tasks";
import AdminCalls      from "./pages/admin/Calls";
import Permissions     from "./pages/admin/Permissions";
import AdminWorkLogs from "./pages/admin/WorkLogs";
import Clients from "./pages/admin/Clients"

import MyTasks         from "./pages/employee/MyTasks";
import MyCalls         from "./pages/employee/MyCalls";
import WorkLog         from "./pages/employee/WorkLog";
import ChangePassword  from "./pages/employee/ChangePassword";

import Calls from './pages/admin/Calls';
import MyDashboard from './pages/employee/MyDashboard';
import ProjectDashboard from "./pages/employee/ProjectDashboard";
// import Teams from './pages/Team';
// import TeamDashboard from './pages/TeamDashboard';
// import MyTeams from './pages/employee/MyTeam';

// import MyProject from './pages/employee/MyProjects';
import MyProjects from './pages/employee/MyProjects';

const App = () => {

  const {isAuthenticated, isAdmin} = useAuth();
  return (
    <Routes>
    {/* public */}
    
    <Route
     path="/login"
      element = {
        isAuthenticated ? <Navigate to={isAdmin ? "/admin/dashboard" : "/employee/tasks"}  replace/> : <Login />
      }
      />

      {/* Admin - nested user AdminLayout */}
      <Route
  path='/admin'
  element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  }
>
  <Route path='dashboard' element={<AdminDashboard />} />
  <Route path='employees' element={<Employees />} />
  <Route path='roles' element={<Roles />} />
  <Route path='projects' element={<Projects />} />
  <Route path='projects/:id/dashboard' element={<ProjectDashboard />} /> 
  <Route path='calls' element={<Calls />} />
  <Route path='tasks' element={<Tasks />} />
  <Route path='permissions' element={<Permissions />} />
  <Route path='work-logs' element={<AdminWorkLogs />} />
  <Route path ='clients' element={<Clients />} />

  {/* Teams */}
  {/* <Route path='teams' element={<Teams />} />
  <Route path='teams/:id/dashboard' element={<TeamDashboard />} /> */}

  <Route index element={<Navigate to='dashboard' replace />} />
</Route>
     
<Route
  path="/employee"
  element={
    <ProtectedRoute>
      <EmployeeLayout />
    </ProtectedRoute>
  }
>
  <Route path="calls" element={<MyCalls />} />
  <Route path="tasks" element={<MyTasks />} />
  <Route path="work-logs" element={<WorkLog />} />
  <Route path="password" element={<ChangePassword />} />

  {/* Dashboard */}
  <Route path="myDashboard" element={<MyDashboard />} />

<Route path="projects/:id/dashboard" element={<ProjectDashboard />} />
  {/* Teams */}
  {/* <Route path="teams" element={<MyTeams />} />
  <Route path="teams/:id/dashboard" element={<TeamDashboard />} /> */}
 
   {/* project */}
   <Route path="projects" element={<MyProjects />} />

  <Route index element={<Navigate to="tasks" replace />} />
</Route>

  {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to={isAdmin ? "/admin/dashboard" : "/employee/myDashboard"} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default App