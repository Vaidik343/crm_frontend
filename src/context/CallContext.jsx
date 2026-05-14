import React, { useState, useMemo, createContext, useContext, useCallback } from "react";
import { ENDPOINTS } from "../api/endpoints";
import api from "../api/axiosInstance";

export const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);

  const createCall = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.CALLS.CREATE, payload);
      setCalls((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const getAllCalls = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(ENDPOINTS.CALLS.ALL);
      setCalls(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCallById = useCallback(async (id) => {
    try {
      const { data } = await api.get(ENDPOINTS.CALLS.GET_BY_ID(id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateCall = useCallback(async (id, payload) => {
    try {
      const { data } = await api.patch(ENDPOINTS.CALLS.PATCH(id), payload); // was missing payload
      console.log("🚀 ~ CallProvider ~ data:", data)
      setCalls((prev) => prev.map((c) => (c.id === id ? data : c)));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteCall = useCallback(async (id) => {
    try {
      const { data } = await api.delete(ENDPOINTS.CALLS.DELETE(id));
      setCalls((prev) => prev.filter((c) => c.id !== id)); // remove from list, not soft delete
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ calls, loading, createCall, getAllCalls, getCallById, updateCall, deleteCall }),
    [calls, loading, createCall, getAllCalls, getCallById, updateCall, deleteCall]
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used inside CallProvider");
  return context; // was missing return
};