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

import MyTasks         from "./pages/employee/MyTasks";
import MyCalls         from "./pages/employee/MyCalls";
import WorkLog         from "./pages/employee/WorkLog";
import ChangePassword  from "./pages/employee/ChangePassword";
import Calls from './pages/admin/Calls';


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
        element={<AdminRoute><AdminLayout /></AdminRoute>}
      >
        <Route path='dashboard' element={<AdminDashboard />}/>
        <Route path='employees' element={<Employees />} />
        <Route path='roles' element={<Roles />}/>
        <Route path='projects' element={<Projects />} />
        <Route path='tasks' element={<Tasks />}/>
        <Route path='calls' element={<Calls />} />
        <Route path='permissions' element={<Permissions />}/>
        <Route path="work-logs" element={<AdminWorkLogs />} />
        <Route index  element={<Navigate to="dashboard" replace />} />
      </Route>
     
      <Route
        path="/employee"
        element={<ProtectedRoute><EmployeeLayout /></ProtectedRoute>}
      >
        <Route path="tasks"     element={<MyTasks />} />
        <Route path="calls"     element={<MyCalls />} />
        <Route path="work-logs" element={<WorkLog />} />
        <Route path="password"  element={<ChangePassword />} />
        <Route index element={<Navigate to="tasks" replace />} />
      </Route>
    

  {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to={isAdmin ? "/admin/dashboard" : "/employee/tasks"} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default App