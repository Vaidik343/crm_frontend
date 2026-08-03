import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
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
import { TeamProvider } from './context/TeamContext.jsx'
import { TeamMemberContext, TeamMemberProvider } from './context/TeamMemberContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx';
import { ClientProvider } from './context/ClientContext.jsx'
import { LeaveProvider } from './context/LeaveContext.jsx'
import { ProbationProvider } from './context/ProbationContext.jsx'
import { InternProvider } from './context/InternContext.jsx'
import { NotificationProvider } from './context/NotificationContext';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
     <AuthProvider>
      <SocketProvider>
          <NotificationProvider>
      <UserProvider>
        <RoleProvider>
          <ProjectProvider>
          <TaskProvider>
            <CallProvider>
              <ClientProvider>
              <WorkLogProvider>
                <LeaveProvider>
                  <ProbationProvider>
                    <InternProvider>
                  
                <TeamProvider>
                  <TeamMemberProvider>
                <PermissionProvider>
                  <PasswordProvider>

                    <App />
                  </PasswordProvider>
                </PermissionProvider>
                </TeamMemberProvider>
                </TeamProvider>

</InternProvider>
                </ProbationProvider>
                </LeaveProvider>
              </WorkLogProvider>
              </ClientProvider>
            </CallProvider>
          </TaskProvider>
          </ProjectProvider>
        </RoleProvider>
      </UserProvider>
      </NotificationProvider>
     </SocketProvider>
     </AuthProvider>
    </BrowserRouter>
    
  </StrictMode>,
)
