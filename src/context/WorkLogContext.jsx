import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const WorkLogContext = createContext(null);

export const WorkLogProvider = ({ children }) => {
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const page  = pagination.page;
  const limit = pagination.limit;
  const total = pagination.total;

  const setPage = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // ✅ Fixed signature: (pageNumber, from, to, search, pageLimit)
  // search moved before pageLimit so callers don't need to pass limit every time
  const getAllWorkLogs = useCallback(async (pageNumber = 1, from = "", to = "", search = "", pageLimit = 10) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pageNumber, limit: pageLimit });
      if (search) params.set("search", search);
      if (from && to) {
        params.append("from", from);
        params.append("to", to);
      }

      const { data } = await api.get(`${ENDPOINTS.WORKLOGS.ALL}?${params.toString()}`);

      setWorkLogs(data.data || []);
      setPagination({
        page:  data.page  || 1,
        limit: data.limit || 10,
        total: data.total || 0,
      });

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
      getAllWorkLogs();
      return data;
    } catch (error) {
      throw error;
    }
  }, [getAllWorkLogs]);

  const updateWorkLog = useCallback(async (id, payload) => {
    try {
      const response = await api.patch(ENDPOINTS.WORKLOGS.UPDATE(id), payload);
      const updatedWorkLog = response.data.workLog || response.data.data || response.data;
      setWorkLogs((prev) => prev.map((w) => w.id === id ? updatedWorkLog : w));
      getAllWorkLogs();
      return updatedWorkLog;
    } catch (error) {
      throw error;
    }
  }, [getAllWorkLogs]);

  const deleteWorkLog = useCallback(async (id) => {
    try {
      const { data } = await api.delete(ENDPOINTS.WORKLOGS.DELETE(id));
      setWorkLogs((prev) => prev.filter((w) => w.id !== id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const totalPages = Math.ceil(total / limit);

  const value = useMemo(
    () => ({
      workLogs, loading,
      page, limit, total, totalPages,
      setPage, getAllWorkLogs, getWorkLogById,
      createWorkLog, updateWorkLog, deleteWorkLog
    }),
    [workLogs, loading, pagination, totalPages,
      setPage, getAllWorkLogs, getWorkLogById,
      createWorkLog, updateWorkLog, deleteWorkLog]
  );

  return <WorkLogContext.Provider value={value}>{children}</WorkLogContext.Provider>;
};

export const useWorkLog = () => {
  const context = useContext(WorkLogContext);
  if (!context) throw new Error("useWorkLog must be used inside WorkLogProvider");
  return context;
};