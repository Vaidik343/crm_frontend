import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import Leaves from "./pages/admin/Leave"
import PublicHolidays  from "./pages/admin/PublicHolidays"
import Clients from "./pages/admin/Clients"
import Holiday from "./pages/employee/Holidays"

import MyTasks         from "./pages/employee/MyTasks";
import MyCalls         from "./pages/employee/MyCalls";
import WorkLog         from "./pages/employee/WorkLog";
import ChangePassword  from "./pages/employee/ChangePassword";


import { InternProvider } from "./context/InternContext";

import InternRouter from "./features/interns/router/InternRouter";

import Calls from './pages/admin/Calls';
import MyDashboard from './pages/employee/MyDashboard';
import ProjectDashboard from "./pages/employee/ProjectDashboard";
import MyLeaves from "./pages/employee/MyLeave"
// import Teams from './pages/Team';
// import TeamDashboard from './pages/TeamDashboard';
// import MyTeams from './pages/employee/MyTeam';

// import MyProject from './pages/employee/MyProjects';
import MyProjects from './pages/employee/MyProjects';

import NotificationsPage from "./components/NotificationsPage"; 
import NotFound from './components/NotFound';
import EmployeeReport from './pages/admin/EmployeeReport';
import AdminInterns from './features/interns/pages/public/admin/AdminInterns';
import AdminInternDetail from './features/interns/pages/public/admin/AdminInternDetail';

const App = () => {

  const {isAuthenticated, isAdmin} = useAuth();
  return (
    <>

     <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            fontWeight: 700,
            fontSize: "14px",
            borderRadius: "12px",

          },
        }}
      />
    <Routes>
    {/* public */}
    
    <Route
     path="/login"
      element = {
        isAuthenticated ? <Navigate to={isAdmin ? "/admin/dashboard" : "/employee/myDashboard"}  replace/> : <Login />
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
  <Route path='leaves' element={<Leaves />} />
  <Route path="holidays"  element={<PublicHolidays />} />
  <Route
    path="interns"
    element={
      <InternProvider>
        <AdminInterns />
      </InternProvider>
    }
  />
  <Route
    path="interns/:id"
    element={
      <InternProvider>
        <AdminInternDetail />
      </InternProvider>
    }
  />

  <Route path ='clients' element={<Clients />} />
  <Route path='notifications' element={<NotificationsPage />} />

  {/* Employee Report */}
  <Route path="reports/:id" element={<EmployeeReport />} />
  {/* Teams */}
  {/* <Route path='teams' element={<Teams />} />
  <Route path='teams/:id/dashboard' element={<TeamDashboard />} /> */}

  <Route index element={<Navigate to='dashboard' replace />} />
</Route>

<Route
  path="/intern/*"
  element={
    <InternProvider>
      <InternRouter />
    </InternProvider>
  }
/>
     
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
  <Route path="leaves" element={<MyLeaves />} />
  <Route path="holiday" element={<Holiday />} />

  <Route path="password" element={<ChangePassword />} />

  {/* Dashboard */}
  <Route path="myDashboard" element={<MyDashboard />} />

<Route path="projects/:id/dashboard" element={<ProjectDashboard />} />
  {/* Teams */}
  {/* <Route path="teams" element={<MyTeams />} />
  <Route path="teams/:id/dashboard" element={<TeamDashboard />} /> */}
 
   {/* project */}
   <Route path="projects" element={<MyProjects />} />
   <Route path="notifications" element={<NotificationsPage />} />

  <Route index element={<Navigate to="myDashboard" replace />} />
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
      <Route path="*" element={<NotFound />} />

    </Routes>
    </>
  )
}

export default App