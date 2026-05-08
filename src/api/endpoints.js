export const ENDPOINTS = {
    AUTH: {
        LOGIN:"/auth/login"
    },
    CALLs: {
        CREATE: "/calls",
        ALL: "/calls",
        GET_BY_ID: (id) => `/calls/${id}`,
        PATCH: (id) => `/calls/${id}`,
        DELETE: (id) => `/calls/${id}`
    },
    EXPORT: {
        ALL: "/export"
    },
    PERMISSION: {
        ALL: '/permissions',
        GET_BY_ID: (id) => `/permissions/${user_id}`,
        UPDATE: (id) => `/permissions/${user_id}`,  // patch
        DELETE: (id) => `/permissions/${user_id}/reset`,
    },
    PROJECTS: {
        CREATE: "/projects",
        ALL: "/projects",
        GET_BY_ID: (id) => `/projects/${id}`,
        UPDATE: (id) => `/projects/${id}`,
        DELETE: (id) => `/projects/${id}`

    },
    PASSWORD: {
        CHANGE: (id) => '/password/change', //PATCH
        RESET: (id) => `/projects/reset/${id}`     // PATCH
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