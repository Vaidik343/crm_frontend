import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import {BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

import { AuthProvider } from './context/AuthContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { RoleProvider } from './context/RoleContext.jsx';
import { ProjectProvider } from './context/ProjectContext.jsx';
import { TaskProvider } from './context/TaskContext.jsx';
import { CallProvider } from './context/CallContext.jsx';
import { WorkLogProvider } from './context/WorkLogContext.jsx';
import { PermissionProvider } from './context/PermissionContext.jsx';
import { PasswordProvider } from './context/PasswordContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
     <AuthProvider>
      <UserProvider>
        <RoleProvider>
          <ProjectProvider>
          <TaskProvider>
            <CallProvider>
              <WorkLogProvider>
                <PermissionProvider>
                  <PasswordProvider>
                    <App />
                  </PasswordProvider>
                </PermissionProvider>
              </WorkLogProvider>
            </CallProvider>
          </TaskProvider>
          </ProjectProvider>
        </RoleProvider>
      </UserProvider>
     </AuthProvider>
    </BrowserRouter>
    
  </StrictMode>,
)
