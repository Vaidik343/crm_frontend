import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);

    // pagination states
  const [page, setPage]   = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);


  const getAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(ENDPOINTS.USERS.ALL);
      // console.log("🚀 ~ UserProvider ~ data:", data)
      setUsers(data.users);
      return data;
    } catch (error) {
      
    // console.log("🚀 ~ UserProvider ~ error:", error)
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id) => {
    try {
      const { data } = await api.get(ENDPOINTS.USERS.GET_BY_ID(id));
      return data;
    } catch (error) {
      throw error;
    } 
  }, []);

  const createUser = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.USERS.CREATE, payload);
      setUsers((prev) => [...prev, data.user]);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (id, payload) => {
    try {
      const { data } = await api.patch(ENDPOINTS.USERS.UPDATE(id), payload);
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    try {
      const { data } = await api.delete(ENDPOINTS.USERS.DELETE(id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);



const getEmployeeCallsReport = useCallback(async (employeeId, pageNumber = 1, from = "", to = "", pageLimit = 10, search = "", projectId = "") => {
  try {
    setLoading(true);
    const params = new URLSearchParams({ page: pageNumber, limit: pageLimit });
    if (from)   params.set("from", from);
    if (to)     params.set("to", to);
    if (search) params.set("search", search);
if (projectId) params.set("project_id", projectId);
    const { data } = await api.get(`${ENDPOINTS.REPORTS.CALLS(employeeId)}?${params.toString()}`);
    
    console.log("🚀 ~ UserProvider ~ getEmployeeCallsReport:", data)
    return data;
  } catch (error) {
      console.log("🚀 ~ UserProvider ~ error:", error)
    throw error;
  } finally {
    setLoading(false);
  }
}, []);

const getEmployeeTasksReport = useCallback(async (employeeId, pageNumber = 1, from = "", to = "", pageLimit = 10, search = "",  projectId = "") => {
  try {
    setLoading(true);
    const params = new URLSearchParams({ page: pageNumber, limit: pageLimit });
    if (from)   params.set("from", from);
    if (to)     params.set("to", to);
    if (search) params.set("search", search);
    if (projectId) params.set("project_id", projectId);

    const { data } = await api.get(`${ENDPOINTS.REPORTS.TASKS(employeeId)}?${params.toString()}`);
    console.log("🚀 ~ UserProvider ~ getEmployeeTasksReport:", data)
    return data;
  } catch (error) {
    throw error;
  } finally {
    setLoading(false);
  }
}, []);

const getEmployeeWorkLogsReport = useCallback(async (employeeId, pageNumber = 1, from = "", to = "", pageLimit = 10, search = "", projectId = "") => {
  try {
    setLoading(true);
    const params = new URLSearchParams({ page: pageNumber, limit: pageLimit });
    if (from)   params.set("from", from);
    if (to)     params.set("to", to);
    if (search) params.set("search", search);
    if (projectId) params.set("project_id", projectId);

    const { data } = await api.get(`${ENDPOINTS.REPORTS.WORKLOGS(employeeId)}?${params.toString()}`);
    console.log("🚀 ~ UserProvider ~ getEmployeeWorkLogsReport:", data)
    return data;
  } catch (error) {
    throw error;
  } finally {
    setLoading(false);
  }
}, []);
 const totalPages = Math.ceil(total / limit);



  const value = useMemo(
    () => ({ users, loading, page,
      limit,  totalPages,
      setPage, getAllUsers, getUserById, createUser, updateUser, deleteUser ,getEmployeeCallsReport, getEmployeeTasksReport, getEmployeeWorkLogsReport}),
    [users, loading, page,
      limit,  totalPages,
      setPage, getAllUsers, getUserById, createUser, updateUser, deleteUser, getEmployeeCallsReport, getEmployeeTasksReport, getEmployeeWorkLogsReport]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
};