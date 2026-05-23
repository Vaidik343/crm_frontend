import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);

  const getAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(ENDPOINTS.USERS.ALL);
      console.log("🚀 ~ UserProvider ~ data:", data)
      setUsers(data.users);
      return data;
    } catch (error) {
      
    console.log("🚀 ~ UserProvider ~ error:", error)
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id) => {
    try {
      const { data } = await api.get(ENDPOINTS.USERS.GET_BY_ID(id));
      return data;
    } catch (error) {
      throw error;
    } 
  }, []);

  const createUser = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.USERS.CREATE, payload);
      setUsers((prev) => [...prev, data.user]);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (id, payload) => {
    try {
      const { data } = await api.patch(ENDPOINTS.USERS.UPDATE(id), payload);
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    try {
      const { data } = await api.delete(ENDPOINTS.USERS.DELETE(id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ users, loading, getAllUsers, getUserById, createUser, updateUser, deleteUser }),
    [users, loading, getAllUsers, getUserById, createUser, updateUser, deleteUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
};