import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const WorkLogContext = createContext(null);

export const WorkLogProvider = ({ children }) => {
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading]   = useState(false);

  const getAllWorkLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(ENDPOINTS.WORKLOGS.ALL);
      setWorkLogs(data.workLogs);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWorkLogById = useCallback(async (id) => {
    try {
      const { data } = await api.get(ENDPOINTS.WORKLOGS.GET_BY_ID(id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const createWorkLog = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.WORKLOGS.CREATE, payload);
      setWorkLogs((prev) => [data.workLog, ...prev]);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateWorkLog = useCallback(async (id, payload) => {
    try {
      const { data } = await api.patch(ENDPOINTS.WORKLOGS.UPDATE(id), payload);
      setWorkLogs((prev) => prev.map((w) => (w.id === id ? data.workLog : w)));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteWorkLog = useCallback(async (id) => {
    try {
      const { data } = await api.delete(ENDPOINTS.WORKLOGS.DELETE(id));
      setWorkLogs((prev) => prev.filter((w) => w.id !== id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ workLogs, loading, getAllWorkLogs, getWorkLogById, createWorkLog, updateWorkLog, deleteWorkLog }),
    [workLogs, loading, getAllWorkLogs, getWorkLogById, createWorkLog, updateWorkLog, deleteWorkLog]
  );

  return <WorkLogContext.Provider value={value}>{children}</WorkLogContext.Provider>;
};

export const useWorkLog = () => {
  const context = useContext(WorkLogContext);
  if (!context) throw new Error("useWorkLog must be used inside WorkLogProvider");
  return context;
};