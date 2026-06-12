import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";
import { useSocket } from "./SocketContext";

export const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination states
  const [page, setPage]   = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const { socket } = useSocket();

  // ── Real-time socket listeners ────────────────────────────────────────────────
  useEffect(() => {
    // console.log("TaskContext: socket available?", !!socket);
    if (!socket) return;
    
    // console.log("TaskContext: Setting up socket listeners on socket ID:", socket.id);

    // A new task was assigned to this user → prepend it to the list
    const handleTaskCreated = (task) => {
      // console.log("TaskContext: Received TASK_CREATED event", task);
      setTasks((prev) => {
        // Avoid duplicate if the creator's own optimistic update already added it
        if (prev.some((t) => t.id === task.id)) return prev;
        return [task, ...prev];
      });
      setTotal((prev) => prev + 1);
    };

    // A task this user can see was updated
    const handleTaskUpdated = (updatedTask) => {
      // console.log("TaskContext: Received TASK_UPDATED event", updatedTask);
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    };

    // A task was deleted
    const handleTaskDeleted = ({ id }) => {
      // console.log("TaskContext: Received TASK_DELETED event", id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    };

    socket.on("TASK_CREATED", handleTaskCreated);
    socket.on("TASK_UPDATED", handleTaskUpdated);
    socket.on("TASK_DELETED", handleTaskDeleted);

    return () => {
      socket.off("TASK_CREATED", handleTaskCreated);
      socket.off("TASK_UPDATED", handleTaskUpdated);
      socket.off("TASK_DELETED", handleTaskDeleted);
    };
  }, [socket]);

  // ── API methods ───────────────────────────────────────────────────────────────
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
      // Optimistically add to local state for the creator.
      // Assigned user will get it via the TASK_CREATED socket event.
      setTasks((prev) => {
        if (prev.some((t) => t.id === data.task.id)) return prev;
        return [data.task, ...prev];
      });
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    try {
      const response = await api.patch(ENDPOINTS.TASKS.UPDATE(id), payload);
      const updatedTask = response.data.task || response.data.data || response.data;
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updatedTask : t))
      );
      return updatedTask;
    } catch (error) {
      console.error("updateTask error:", error);
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
    () => ({
      tasks,
      loading,
      page,
      limit,
      total,
      totalPages,
      setPage,
      getAllTasks,
      getTaskById,
      createTask,
      updateTask,
      deleteTask,
    }),
    [tasks, loading, page, limit, total, totalPages, setPage, getAllTasks, getTaskById, createTask, updateTask, deleteTask]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask must be used inside TaskProvider");
  return context;
};