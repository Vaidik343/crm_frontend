export const ENDPOINTS = {
    AUTH: {
        LOGIN:"/auth/login"
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
        ALL: "/export"
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
        CHANGE: (id) => '/password/change', //PATCH
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
        DELETE: (id) => `/tasks/${id}`

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
    }
}