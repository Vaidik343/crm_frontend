import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const WorkLogContext = createContext(null);

export const WorkLogProvider = ({ children }) => {
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading]   = useState(false);

      // pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const getAllWorkLogs = useCallback(async (pageNumber = 1, from, to,pageLimit = 10, search = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pageNumber, limit: pageLimit });
       if (search) params.set("search", search);

    if (from && to) {
      params.append("from", from);
      params.append("to", to);
    }

        const { data } = await api.get(
        `${ENDPOINTS.WORKLOGS.ALL}?${params.toString()}`
      );
        console.log("🚀 ~ WorkLogProvider ~ data:", data)

setWorkLogs(data.data || []);
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
      getAllWorkLogs?.()
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

const updateWorkLog = useCallback(async (id, payload) => {
  try {
    const response = await api.patch(
      ENDPOINTS.WORKLOGS.UPDATE(id),
      payload
    );

    console.log("UPDATE WORKLOG RESPONSE:", response.data);

    const updatedWorkLog =
      response.data.workLog ||
      response.data.data ||
      response.data;

    setWorkLogs((prev) =>
      prev.map((w) =>
        w.id === id ? updatedWorkLog : w
      )
    );

    return updatedWorkLog;
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

     const totalPages = Math.ceil(total / limit);


  const value = useMemo(
    () => ({ workLogs, loading, page,
      limit,
      total,
      totalPages,

      setPage, getAllWorkLogs, getWorkLogById, createWorkLog, updateWorkLog, deleteWorkLog }),
    [workLogs, loading, page,
      limit,
      total,
      totalPages,

      setPage, getAllWorkLogs, getWorkLogById, createWorkLog, updateWorkLog, deleteWorkLog]
  );

  return <WorkLogContext.Provider value={value}>{children}</WorkLogContext.Provider>;
};

export const useWorkLog = () => {
  const context = useContext(WorkLogContext);
  if (!context) throw new Error("useWorkLog must be used inside WorkLogProvider");
  return context;
};