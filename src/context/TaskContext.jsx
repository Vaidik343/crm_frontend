import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(false);

    // pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const getAllTasks = useCallback(async (pageNumber = 1, pageLimit = 10) => {
    try {
  setLoading(true);

      const { data } = await api.get(
        `${ENDPOINTS.TASKS.ALL}?page=${pageNumber}&limit=${pageLimit}`
      );

      setTasks(data.data || []);
      setPage(data.page || 1);
      setLimit(data.limit || 10);
      setTotal(data.total || 0);

      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
   
  // useEffect( ()=> {
  //   getAllTasks();
  // }, [])

  const getTaskById = useCallback(async (id) => {
    try {
      const { data } = await api.get(ENDPOINTS.TASKS.GET_BY_ID(id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const createTask = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.TASKS.CREATE, payload);
      setTasks((prev) => [data.task, ...prev]);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

const updateTask = useCallback(async (id, payload) => {
  try {
    const response = await api.patch(
      ENDPOINTS.TASKS.UPDATE(id),
      payload
    );
    console.log("🚀 ~ TaskProvider ~ response:", response)

    console.log("UPDATE TASK RESPONSE:", response.data);

    const updatedTask =
      response.data.task || response.data.data || response.data;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? updatedTask : t
      )
    );

    return updatedTask;
  } catch (error) {
    
  console.log("🚀 ~ TaskProvider ~ error:", error)
    throw error;
  }
}, []);

  const deleteTask = useCallback(async (id) => {
    try {
      const { data } = await api.delete(ENDPOINTS.TASKS.DELETE(id));
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []); 

   const totalPages = Math.ceil(total / limit);

   
  const value = useMemo(
    () => ({ tasks, loading, page,
      limit,
      total,
      totalPages,

      setPage,
      getAllTasks, getTaskById, createTask, updateTask, deleteTask }),
    [tasks, loading,  page,
      limit,
      total,
      totalPages,

      setPage,
      getAllTasks, getTaskById, createTask, updateTask, deleteTask]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask must be used inside TaskProvider");
  return context;
};