import React, { useState, useMemo, createContext, useContext, useCallback } from "react";
import { ENDPOINTS } from "../api/endpoints";
import api from "../api/axiosInstance";

export const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);

        // pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  
  const createCall = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.CALLS.CREATE, payload);
      console.log("🚀 ~ CallProvider ~ data:", data)
      setCalls((prev) => [data.call, ...prev]);
      return data;
    } catch (error) {
      console.log("🚀 ~ CallProvider ~ error:", error)
      throw error;
    }
  }, []); 

  const getAllCalls = useCallback(async (pageNumber = 1, pageLimit = 10) => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `${ENDPOINTS.CALLS.ALL}?page=${pageNumber}&limit=${pageLimit}`
      );

      setCalls(data.data || []);
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
    const response = await api.patch(
      ENDPOINTS.CALLS.PATCH(id),
      payload
    );

    const updatedCall = response.data.data || response.data;

    setCalls((prev) =>
      prev.map((c) =>
        c.id === id ? updatedCall : c
      )
    );

    return updatedCall;
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

     const totalPages = Math.ceil(total / limit);

  const value = useMemo(
    () => ({ calls, loading,page,
      limit,
      total,
      totalPages, setPage, createCall, getAllCalls, getCallById, updateCall, deleteCall }),
    [calls, loading, page,
      limit,
      total,
      totalPages, setPage,createCall, getAllCalls, getCallById, updateCall, deleteCall]
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used inside CallProvider");
  return context; 
};