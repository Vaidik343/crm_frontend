import { createContext, useCallback, useContext, useState, useMemo } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const getAllEvents = useCallback(async (pageNumber = 1, pageLimit = 10, filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pageNumber, limit: pageLimit });
      if (filters.event_type) params.set("event_type", filters.event_type);
      if (filters.search) params.set("search", filters.search);
      const { data } = await api.get(`${ENDPOINTS.EVENTS.ADMIN_ALL}?${params.toString()}`);
      setEvents(data.data || []);
      setPage(data.page || 1);
      setLimit(pageLimit);
      setTotal(data.total || 0);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmployeeEvents = useCallback(async (pageNumber = 1, pageLimit = 10, filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pageNumber, limit: pageLimit });
      if (filters.event_type) params.set("event_type", filters.event_type);
      const { data } = await api.get(`${ENDPOINTS.EVENTS.EMPLOYEE_ALL}?${params.toString()}`);
      setEvents(data.data || []);
      setPage(data.page || 1);
      setLimit(pageLimit);
      setTotal(data.total || 0);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.EVENTS.CREATE, payload);
      setEvents((prev) => [data.event, ...prev]);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteEvent = useCallback(async (id) => {
    try {
      const { data } = await api.delete(ENDPOINTS.EVENTS.DELETE(id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const previewAICard = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.EVENTS.AI_PREVIEW, payload);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const exportPNG = useCallback(async (id, displayId) => {
    try {
      const response = await api.get(ENDPOINTS.EVENTS.EXPORT_PNG(id), {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `event-${displayId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    events,
    loading,
    page,
    limit,
    total,
    totalPages,
    setPage,
    getAllEvents,
    getEmployeeEvents,
    createEvent,
    deleteEvent,
    previewAICard,
    exportPNG,
  }), [
    events, loading, page, limit, total, totalPages,
    getAllEvents, getEmployeeEvents, createEvent, deleteEvent, previewAICard, exportPNG,
  ]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvent must be used inside EventProvider");
  return context;
};