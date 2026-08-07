import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";

import { io } from 'socket.io-client';
import { ENDPOINTS } from "../api/endpoints";
import api from "../api/axiosInstance";
import internApi from "../api/internApi";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:7015";
export const InternContext = createContext(null);

export const InternProvider = ({children}) => {

    // socket 
    const [socket, setSocket] = useState(null);


  
    // intern task state

    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [tasksPage, setTasksPage] = useState(1);
    const [tasksLimit] = useState(10);
    const [tasksTotal, setTasksTotal] = useState(0)

    // inter worklogs state

    const [workLogs, setWorkLogs] = useState([]);
    const [workLogsLoading, setWorkLogsLoading] = useState(false);
    const [workLogsPage, setWorkLogsPage] = useState(1);
    const [workLogsLimit] = useState(10);
    const [workLogsTotal, setWorkLogsTotal] = useState(0);


    const handleTaskAssigned = (task) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === task.id)) return prev;
        return [task, ...prev];
      });
      setTasksTotal((prev) => prev + 1);
    };

    // A task was updated (status change, etc.)
    const handleTaskUpdated = (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    };

    // Intern application status changed (approved / rejected)
    const handleStatusUpdated = ({ status }) => {
      // Pages can listen to this via context or re-fetch profile
      setProfile((prev) => (prev ? { ...prev, status } : prev));
    };


     // ── Profile state (dashboard + profile page) ──────────────────────────────
  const [profile, setProfile]           = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Project state ─────────────────────────────────────────────────────────
  const [project, setProject]           = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);

    useEffect(() => {
  const token = localStorage.getItem('intern_token');
  if (!token || !profile?.id) return;

  const newSocket = io(SOCKET_URL, { auth: { token } });
  newSocket.emit('join_intern', { intern_id: profile.id });
  setSocket(newSocket);

  newSocket.on('TASK_ASSIGNED',       handleTaskAssigned);
  newSocket.on('TASK_UPDATED',        handleTaskUpdated);
  newSocket.on('INTERN_STATUS_UPDATED', handleStatusUpdated);

  return () => newSocket.disconnect();
}, [profile?.id]);

  // ─────────────────────────────────────────────────────────────────────────
  // API — Auth (public, no token needed, uses plain fetch or api without auth)
  // ─────────────────────────────────────────────────────────────────────────

    
  const registerIntern = useCallback(async (formData) => {
    // multipart/form-data — let axios set content-type automatically
    try {
      const { data } = await internApi.post(ENDPOINTS.INTERNS.REGISTER, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // //("🚀 ~ InternProvider ~ data:", data)
      return data;
    } catch (error) {
      //("🚀 ~ InternProvider ~ error:", error)
      throw error;
    }
  }, []);

 const checkStatus = useCallback(async (token) => {
    try {
      const { data } = await internApi.get(
    ENDPOINTS.INTERNS.CHECK_STATUS(token)
);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const setupPassword = useCallback(async (payload) => {
    // payload: { token, password }
    try {
      const { data } = await internApi.post(ENDPOINTS.INTERNS.SETUP_PASSWORD, payload);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const loginIntern = useCallback(async (payload) => {
    // payload: { email, password }
    try {
      const { data } = await internApi.post(ENDPOINTS.INTERNS.LOGIN, payload);
      //("🚀 ~ InternProvider ~ data:", data)
      
      return data; // caller saves token via saveInternToken
    } catch (error) {
      throw error;
    }
  }, []);


  // ─────────────────────────────────────────────────────────────────────────
  // API — Intern-authenticated
  // ─────────────────────────────────────────────────────────────────────────

  const getMyProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const { data } = await internApi.get(ENDPOINTS.INTERNS.ME);
      setProfile(data.intern || data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }, []);


  // confirm is this exist of not
  const updateMyProfile = useCallback(async (payload) => {
    try {
      const { data } = await internApi.patch(ENDPOINTS.INTERNS.UPDATE_PROFILE, payload);
      setProfile(data.intern || data);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);


  const updateMyDocuments = useCallback(async (formData) => {
 
    try {
       const { data } = await internApi.patch(
    ENDPOINTS.INTERNS.UPDATE_MY_DOCUMENTS,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
    } catch (error) {
       throw error;
    }
}, []);

  const getMyProject = useCallback(async () => {
    try {
      setProjectLoading(true);
      const { data } = await internApi.get(ENDPOINTS.INTER_PROJECT.MY);
      //("🚀 ~ InternProvider ~ data:", data)
      setProject(data.project || data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setProjectLoading(false);
    }
  }, []);

const getMyTasks = useCallback(async (
  pageNumber   = 1,
  from         = "",
  to           = "",
  pageLimit    = 10,
  search       = "",
  statusFilter = ""
) => {
  try {
    setTasksLoading(true);
    const params = new URLSearchParams({ page: pageNumber, limit: pageLimit });
    if (from)         params.set("from",   from);
    if (to)           params.set("to",     to);
    if (search)       params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const { data } = await internApi.get(`${ENDPOINTS.INTER_TASKS.MY}?${params.toString()}`);
    setTasks(data.tasks || []);
    setTasksPage(data.page || 1);
    setTasksTotal(data.total || 0);
    return data;
  } catch (error) {
    throw error;
  } finally {
    setTasksLoading(false);
  }
}, [tasksLimit]);

  const createTask = useCallback(async (payload) => {
    try {
      const { data } = await internApi.post(ENDPOINTS.INTER_TASKS.CREATE, payload);
      setTasks((prev) => [data.tasks  || data.task, ...prev]);
      setTasksTotal((prev) => prev + 1);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    try {
      const { data } = await internApi.patch(ENDPOINTS.INTER_TASKS.UPDATE(id), payload);
      const updated = data.tasks  || data.task;
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

const getMyWorkLogs = useCallback(async (
  pageNumber = 1,
  from       = "",
  to         = "",
  search     = ""
) => {
  try {
    setWorkLogsLoading(true);
    const params = new URLSearchParams({ page: pageNumber, limit: workLogsLimit });
    if (from)   params.set("from",   from);
    if (to)     params.set("to",     to);
    if (search) params.set("search", search);

    const { data } = await internApi.get(`${ENDPOINTS.INTER_WORKLOGS.MY}?${params.toString()}`);
    setWorkLogs(data.worklogs || []);
    setWorkLogsPage(data.page || 1);
    setWorkLogsTotal(data.total || 0);
    return data;
  } catch (error) {
    throw error;
  } finally {
    setWorkLogsLoading(false);
  }
}, [workLogsLimit]);
  const createWorkLog = useCallback(async (payload) => {
    try {
      const { data } = await internApi.post(ENDPOINTS.INTER_WORKLOGS.CREATE, payload);
      setWorkLogs((prev) => [data.worklogs  || data.workLog, ...prev]);
      setWorkLogsTotal((prev) => prev + 1);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateWorkLog = useCallback(async (id, payload) => {
    try {
      const { data } = await internApi.patch(ENDPOINTS.INTER_WORKLOGS.UPDATE(id), payload);
      const updated = data.data || data.workLog;
      setWorkLogs((prev) => prev.map((w) => (w.id === id ? updated : w)));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);


  // ─────────────────────────────────────────────────────────────────────────
  // API — Admin
  // ─────────────────────────────────────────────────────────────────────────

  const [interns, setInterns]           = useState([]);
  const [internsLoading, setInternsLoading] = useState(false);
  const [internsPage, setInternsPage]   = useState(1);
  const [internsLimit]                  = useState(10);
  const [internsTotal, setInternsTotal] = useState(0);

  const getAllInterns = useCallback(async (pageNumber = 1, search = "", status = "", intern_type = "") => {
    try {
      setInternsLoading(true);
      const params = new URLSearchParams({ page: pageNumber, limit: internsLimit });
      if (search)      params.set("search", search);
      if (status)      params.set("status", status);
      if (intern_type) params.set("intern_type", intern_type);
      const { data } = await api.get(`${ENDPOINTS.INTERNS.ALL}?${params.toString()}`);
      //("🚀 ~ InternProvider ~ data:", data)
      
      setInterns(data.interns || []);
      setInternsPage(data.page || 1);
      setInternsTotal(data.total || 0);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setInternsLoading(false);
    }
  }, [internsLimit]);

  const getInternById = useCallback(async (id) => {
    try {
      const { data } = await api.get(ENDPOINTS.INTERNS.GET_BY_ID(id));
      //("🚀 ~ InternProvider ~ data:", data)
      
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const approveIntern = useCallback(async (id, payload) => {
    // payload: { mentor_id }
    try {
      const { data } = await api.patch(ENDPOINTS.INTERNS.APPROVE(id), payload);
      setInterns((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "approved" } : i))
      );
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const rejectIntern = useCallback(async (id, payload) => {
    // payload: { rejection_reason }
    try {
      const { data } = await api.patch(ENDPOINTS.INTERNS.REJECT(id), payload);
      setInterns((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "rejected" } : i))
      );
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const extendInternship = useCallback(async (id, payload) => {
    // payload: { end_date }
    try {
      const { data } = await api.patch(ENDPOINTS.INTERNS.EXTEND(id), payload);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const regenerateSetupToken = useCallback(async (id) => {
    try {
      const { data } = await api.post(ENDPOINTS.INTERNS.REGENERATE_TOKEN(id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const adminAssignTask = useCallback(async (internId, payload) => {
    try {
  const { data } = await api.post(ENDPOINTS.INTER_TASKS.ADMIN_ASSIGN, {
    ...payload,
    intern_id: internId,  
  });
  return data;
    } catch (error) {
      throw error;
    }
  }, []);

    
  const getInternTasks = useCallback(async (internId) => {
    try {
     const { data } = await api.get(ENDPOINTS.INTER_TASKS.GET_TASK_BY_ID(internId));
      //("🚀 ~ InternProvider ~ data:", data)
      return data;
    } catch (error) {
      //("🚀 ~ InternProvider ~ error:", error)
      throw error;
    }
  }, []);


  const deleteInternTask = useCallback(async (taskId) => {
  try {
    const { data } = await api.delete(ENDPOINTS.INTER_TASKS.DELETE_TASK(taskId));
    //("🚀 ~ InternProvider ~ data:", data)
    
    return data;
  } catch (error) {
    
  //("🚀 ~ InternProvider ~ error:", error)
    throw error;
  }
}, []);



  const createProject = useCallback(async (payload) => {
  const { data } = await internApi.post(ENDPOINTS.INTER_PROJECT.CREATE, payload);
  setProject(data.project || null);
  return data;
}, []);

const updateProject = useCallback(async (payload) => {
  const { data } = await internApi.patch(ENDPOINTS.INTER_PROJECT.UPDATE, payload);
  setProject(data.project || null);
  return data;
}, []);




// and add adminUpdateProject too:
const adminUpdateProject = useCallback(async (internId, payload) => {
  const { data } = await api.patch(ENDPOINTS.INTER_PROJECT.UPDATE_MENTOR(internId), payload);
  return data;
}, []);

  const getInternWorkLogs = useCallback(async (internId) => {
    try {
      const { data } = await api.get(ENDPOINTS.INTER_WORKLOGS.ADMIN_WORKLOGS(internId));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  // const getInternTasks = useCallback(async (internId) => {
  //   try {
  //     const { data } = await internApi.get(ENDPOINTS.INTER_TASKS.GET_TASK_BY_ID(internId));
  //     return data;
  //   } catch (error) {
  //     throw error;
  //   }
  // }, []);

  const getInternProject = useCallback(async (internId) => {
    try {
      const { data } = await api.get(ENDPOINTS.INTER_PROJECT.PROJECT(internId));
      //("🚀 ~ InternProvider ~ data:", data)
      return data;
    } catch (error) {
      throw error;
    }
  }, []);


  const deactivateIntern = useCallback(async (id) => {
  const { data } = await api.patch(ENDPOINTS.INTERNS.DEACTIVATE(id));
  setInterns((prev) =>
    prev.map((i) => (i.id === id ? { ...i, status: 'completed' } : i))
  );
  return data;
}, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Memoized value
  // ─────────────────────────────────────────────────────────────────────────

  const tasksTotalPages    = Math.ceil(tasksTotal / tasksLimit);
  const workLogsTotalPages = Math.ceil(workLogsTotal / workLogsLimit);
  const internsTotalPages  = Math.ceil(internsTotal / internsLimit);

    //("🚀 ~ InternProvider ~ tasks:", tasks)
  const value = useMemo(() => ({
    // Socket
    socket,

    // Profile
    profile, profileLoading,
    getMyProfile, updateMyProfile, updateMyDocuments ,

    // Project
    project, projectLoading,
    getMyProject,
createProject, updateProject,
    // Tasks (intern-side)
    tasks, tasksLoading, tasksPage, tasksLimit, tasksTotal, tasksTotalPages,
    setTasksPage,
    getMyTasks, createTask, updateTask,deleteInternTask,

    // WorkLogs (intern-side)
    workLogs, workLogsLoading, workLogsPage, workLogsLimit, workLogsTotal, workLogsTotalPages,
    setWorkLogsPage,
    getMyWorkLogs, createWorkLog, updateWorkLog,

    // Admin
    interns, internsLoading, internsPage, internsLimit, internsTotal, internsTotalPages,
    setInternsPage,
    getAllInterns, getInternById,
    approveIntern, rejectIntern, extendInternship,
    regenerateSetupToken, adminAssignTask,
    getInternTasks, getInternWorkLogs, getInternProject, adminUpdateProject,deactivateIntern,

    // Public auth
    registerIntern, checkStatus, setupPassword, loginIntern,
  }), [
    socket,
    profile, profileLoading, getMyProfile, updateMyProfile, updateMyDocuments ,
    project, projectLoading, getMyProject,
    tasks, tasksLoading, tasksPage, tasksLimit, tasksTotal, tasksTotalPages,
    getMyTasks, createTask, updateTask,deleteInternTask,
    workLogs, workLogsLoading, workLogsPage, workLogsLimit, workLogsTotal, workLogsTotalPages,
    getMyWorkLogs, createWorkLog, updateWorkLog,
    interns, internsLoading, internsPage, internsLimit, internsTotal, internsTotalPages,
    getAllInterns, getInternById,
    approveIntern, rejectIntern, extendInternship,
    regenerateSetupToken, adminAssignTask,
    getInternTasks, getInternWorkLogs, getInternProject,
    registerIntern, checkStatus, setupPassword, loginIntern,createProject, updateProject, adminUpdateProject, deactivateIntern
  ]);

  return (
    <InternContext.Provider value={value}>
      {children}
    </InternContext.Provider>
  );

}


export const useIntern = () => {
  const context = useContext(InternContext);
  if (!context) throw new Error("useIntern must be used inside InternProvider");
  return context;
};