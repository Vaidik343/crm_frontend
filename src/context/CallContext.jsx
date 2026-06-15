import React, { useState, useMemo, createContext, useContext, useCallback, useEffect } from "react";
import { ENDPOINTS } from "../api/endpoints";
import api from "../api/axiosInstance";
import { useSocket } from "./SocketContext";

export const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const { socket } = useSocket();

  // ── Real-time socket listeners ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // A call was transferred (or created as a task/transfer)
    const handleCallTransferred = (call) => {
      setCalls((prev) => {
        if (prev.some((c) => c.id === call.id)) return prev;
        return [call, ...prev];
      });
      setTotal((prev) => prev + 1);
    };

    const handleCallUpdated = (updatedCall) => {
      setCalls((prev) =>
        prev.map((c) => (c.id === updatedCall.id ? updatedCall : c))
      );
    };

    const handleCallDeleted = ({ id }) => {
      setCalls((prev) => prev.filter((c) => c.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    };

    socket.on("CALL_TRANSFERRED", handleCallTransferred);
    socket.on("CALL_UPDATED", handleCallUpdated);
    socket.on("CALL_DELETED", handleCallDeleted);

    return () => {
      socket.off("CALL_TRANSFERRED", handleCallTransferred);
      socket.off("CALL_UPDATED", handleCallUpdated);
      socket.off("CALL_DELETED", handleCallDeleted);
    };
  }, [socket]);
  const createCall = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.CALLS.CREATE, payload);
      // console.log("🚀 ~ CallProvider ~ data:", data)
      setCalls((prev) => [data.call, ...prev]);
      return data;
    } catch (error) {
      // console.log("🚀 ~ CallProvider ~ error:", error)
      throw error;
    }
  }, []);

  const getAllCalls = useCallback(async (pageNumber = 1, from, to, pageLimit = 10, search = "") => {
    try {
      setLoading(true);

      const params = new URLSearchParams({ page: pageNumber, limit: pageLimit });
          if (search) params.set("search", search);

          
      if (from && to) {
        params.append("from", from);
        params.append("to", to);
      }


      const { data } = await api.get(
        `${ENDPOINTS.CALLS.ALL}?${params.toString()}`
      );
      console.log("🚀 ~ CallProvider ~ data:", data)

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
      // console.log("🚀 ~ CallProvider ~ response:", response)

      const updatedCall = response.data.call || response.data.data || response.data;
      // console.log("🚀 ~ CallProvider ~ updatedCall:", updatedCall)

      setCalls((prev) =>
        prev.map((c) =>
          c.id === id ? updatedCall : c
        )
      );

      await getAllCalls?.();

      return updatedCall;
    } catch (error) {
      //    console.log("🚀 ~ CallProvider ~ error:", error)
      //    console.log("ERROR RESPONSE", error.response?.data);
      // console.log("REQUEST PAYLOAD", payload);
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
    () => ({
      calls, loading, page,
      limit,
      total,
      totalPages, setPage, createCall, getAllCalls, getCallById, updateCall, deleteCall
    }),
    [calls, loading, page,
      limit,
      total,
      totalPages, setPage, createCall, getAllCalls, getCallById, updateCall, deleteCall]
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used inside CallProvider");
  return context;
};