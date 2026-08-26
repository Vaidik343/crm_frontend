export const ENDPOINTS = {
    AUTH: {
        LOGIN:"/auth/login",
        LOGOUT:"/auth/logout",
    },
    CALLS: {
        CREATE: "/calls",
        ALL: "/calls",
        GET_BY_ID: (id) => `/calls/${id}`,
        PATCH: (id) => `/calls/${id}`,
        DELETE: (id) => `/calls/${id}`
    },

    DASHBOARD: {
        ALL: "/dashboard"
    },
    EXPORT: {
        ALL: "/export",
        MINE: "/export/mine",
        
      LEAVES_EXCEL: "/export/leaves/excel",
  LEAVES_PDF:   "/export/leaves/pdf",
    },
    PERMISSIONS: {
        ALL: '/permissions',
        GET_BY_ID: (user_id) => `/permissions/${user_id}`,
        UPDATE: (user_id) => `/permissions/${user_id}`,  // patch
        RESET: (user_id) => `/permissions/${user_id}/reset`,
    },
    PROJECTS: {
        CREATE: "/projects",
        ALL: "/projects",
        GET_BY_ID: (id) => `/projects/${id}`,
        UPDATE: (id) => `/projects/${id}`,
        DELETE: (id) => `/projects/${id}`,

        // member routes
        ADD_MEMBERS: (id) =>   `/projects/${id}/members`,
        UPDATE_MEMBER_ROLE: (id) => `/projects/members/${id}`,
        REMOVE_MEMBER: (memberId)=> `projects/members/${memberId}`,

    },

    NOTIFICATION: {
        ALL: '/notifications',
        MARK_ALL_READ: 'notifications/read-all',
        MARK_READ_ID: (id) => `/notifications/${id}/read`
    },
    
    PASSWORD: {
        CHANGE: '/password/change', //PATCH
        RESET: (id) => `/password/reset/${id}`     // PATCH
    },
    ROLES: {
        CREATE: "/roles",
        ALL: "/roles",
        GET_BY_ID: (id) => `/roles/${id}`,
        UPDATE: (id) => `/roles/${id}`,
        DELETE: (id) => `/roles/${id}`
    },
    TASKS: {
        CREATE: "/tasks", 
        ALL: "/tasks", 
        GET_BY_ID: (id) => `/tasks/${id}`,
        UPDATE: (id) => `/tasks/${id}`,
        DELETE: (id) => `/tasks/${id}`,
        STATUS_LOGS: (id) => `/tasks/${id}/status-logs`,

    },
    TEAMS: {
        CRATE: "/teams",
        ALL: "/teams",
        GET_BY_ID: (id) => `/teams/${id}`,
        UPDATE: (id) => `/teams/${id}`,
        DELETE: (id) => `/teams/${id}`
    },
  
    TEAM_MEMBERS:{
        CREATE: '/team-members',
        ALL: '/team-members',
        GET_BY_ID: (id) => `/team-members/${id}`,
        UPDATE: (id) => `/team-members/${id}`,
        REMOVE: (id) => `/team-members/${id}`
    },
    
    USERS: {
        CREATE: '/users',
        ALL: '/users',
        GET_BY_ID: (id) => `/users/${id}`,
        UPDATE: (id) => `/users/${id}`,
        DELETE: (id) => `/users/${id}`,

    },
    WORKLOGS: {
        CREATE: '/work-logs',
        ALL: '/work-logs',
        GET_BY_ID: (id) => `/work-logs/${id}`,
        UPDATE: (id) => `/work-logs/${id}`,
        DELETE: (id) => `/work-logs/${id}`,
    },
    REPORTS: {
        CALLS: (id) => `/report/${id}/calls`,
        TASKS: (id) => `/report/${id}/tasks`,
        WORKLOGS: (id) => `/report/${id}/workLogs`,
    } ,

        LEAVES: {
      //EMP
      CREATE: '/leaves/request',
      MY: '/leaves/my',
      CANCEL: (id) => `/leaves/cancel/${id}`,

      //Admin
      ALL: '/leaves/all',
      APPROVE: (id) => `/leaves/approve/${id}`,
      REJECT: (id) => `/leaves/reject/${id}`,
      SATURDAY_MARK: '/leaves/saturday/mark',
      UPLOAD_DOCUMENT: (id) => `/leaves/${id}/upload-document`,

      
      //both
      GET_MARKED_SATURDAY : (user_id) => `/leaves/saturday/${user_id}`,
      SATURDAY_EXCHANGE: (user_id) => `/leaves/saturday/${user_id}`,


      LEAVES_LOGS: (id) => `/leaves/${id}/logs` ,

      ADJACENT_CHECK: '/leaves/adjacent-check',
REVERSE: (id) => `/leaves/${id}/reverse`,

    
    //   Balance
    BALANCE_MY:        '/leaves/balance/my',
    BALANCE:           (user_id) => `/leaves/balance/${user_id}`,
    BALANCE_HISTORY:   (user_id) => `/leaves/balance/${user_id}/history`,
    HOLIDAYS:          '/leaves/holidays',
    HOLIDAY_UPDATE:  (id) => `/leaves/holidays/${id}`,
    HOLIDAY_DELETE:    (id) =>      `/leaves/holidays/${id}`,
    CALCULATION: "/leaves/calculation"
      
    },

    
    INTERNS: {

        // PUBLIC ROUTES
        REGISTER: '/intern/register',
        CHECK_STATUS: (id) => `/intern/status/${id}`,
        SETUP_PASSWORD: '/intern/setup-password',
        LOGIN: '/intern/login',
        ME: '/intern/me',
         UPDATE_PROFILE:   '/intern/me', 
         UPDATE_MY_DOCUMENTS: '/intern/documents',
ADMIN_UPDATE: (id) => `/admin/interns/${id}`,

        //ADMIN ROUTES
        ALL:'/admin/interns',
        GET_BY_ID: (id) => `/admin/interns/${id}`,
        UPDATE: (id) => `/admin/interns/${id}/`,
        APPROVE: (id) => `/admin/interns/${id}/approve`,
        REJECT: (id) => `/admin/interns/${id}/reject`,
        EXTEND: (id) => `/admin/interns/${id}/extend`,
        DEACTIVATE: (id) => `/admin/interns/${id}/deactivate`,
        REGENERATE_TOKEN: (id) => `/admin/interns/${id}/regenerate-token`,


        
   
    },

    INTER_PROJECT: {
        CREATE: '/intern/project',
        MY: '/intern/project',
        UPDATE: '/intern/project',
        // NEED deactive too

        // ADMIN
        PROJECT: (intern_id) => `/admin/interns/${intern_id}/project`,
        // UPDATE_MENTOR : (intern_id) => `/admin/interns/${intern_id}/project`,


          // new
  ADMIN_CREATE:  (intern_id) => `/admin/interns/${intern_id}/project`,  // POST
  ADMIN_UPDATE:  (intern_id) => `/admin/interns/${intern_id}/project`,  // Put — same URL, different method
    },

        INTER_TASKS: {
        CREATE: '/intern/tasks',
        MY: '/intern/tasks',
        UPDATE: (id) => `/intern/tasks/${id}`,

        //ADMIN
        ADMIN_ASSIGN: '/admin/intern/tasks',
        GET_TASK_BY_ID: (intern_id) => `/admin/interns/${intern_id}/tasks`,
        UPDATE_TASKS : (id) => `/admin/intern/tasks/${id}`,
        
        DELETE_TASK: (id) => `/admin/intern/tasks/${id}`,

    },

    MY_MENTORED_INTERNS: '/interns/my-mentored',
MENTOR_ASSIGN_TASK:  '/intern-tasks/mentor-assign',
INTERN_MENTOR_VIEW:  (id) => `/interns/${id}/mentor-view`,
INTERN_MENTOR_TASKS: (id) => `/interns/${id}/mentor-tasks`,

        INTER_WORKLOGS: {
        CREATE: '/intern/worklogs',
        MY: '/intern/worklogs',
        UPDATE: (id) => `/intern/worklogs/${id}`,
        
        // ADMIN
        ADMIN_WORKLOGS: (intern_id) => `/admin/interns/${intern_id}/worklogs`,
    },

    EVENTS: {
  CREATE:      "/events",
  ADMIN_ALL:   "/events/admin/all",
  EMPLOYEE_ALL:"/events/shared",
  BY_ID:       (id) => `/events/${id}`,
  DELETE:      (id) => `/events/${id}`,
  EXPORT_PNG:  (id) => `/events/shared/${id}/export/png`,
  ANNOUNCE: (id) => `/events/${id}/announce`,
  AI_PREVIEW:  "/events/ai-preview",
  DESIGN_PREVIEWS: "/events/design-previews",
},


EMPLOYEE_APPLICATIONS: {
  REGISTER:   '/employee-applications/register',
  LIST:       '/employee-applications',
  BY_ID:      (id) => `/employee-applications/${id}`,
  APPROVE:    (id) => `/employee-applications/${id}/approve`,
  REJECT:     (id) => `/employee-applications/${id}/reject`,
  DELETE:     (id) => `/employee-applications/${id}`,
},


OFFER_LETTER: {
  POSITIONS:  '/offer-letter/positions',
  ADDRESSES:  '/offer-letter/addresses',
  GENERATE:   (id) => `/offer-letter/generate/${id}`,
},


    //probation
     PROBATION: {
        ALL: '/probation',
        GET_BY_ID: (id) => `/probation/${id}`,
        START: (id) => `/probation/${id}/start`,
        PASS: (id) => `/probation/${id}/pass`,
        TERMINATE: (id) => `/probation/${id}/terminate`,
        DATES: (id) => `/probation/${id}/dates`,

     } ,
     SETTINGS: {
  GET:    '/settings',
  UPDATE: '/settings',
},

}