import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(false);

  const getAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(ENDPOINTS.TASKS.ALL);
      setTasks(data.tasks);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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
      const { data } = await api.patch(ENDPOINTS.TASKS.UPDATE(id), payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      return data;
    } catch (error) {
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

  const value = useMemo(
    () => ({ tasks, loading, getAllTasks, getTaskById, createTask, updateTask, deleteTask }),
    [tasks, loading, getAllTasks, getTaskById, createTask, updateTask, deleteTask]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask must be used inside TaskProvider");
  return context;
};