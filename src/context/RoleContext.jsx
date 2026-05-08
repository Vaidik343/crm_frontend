import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const [roles, setRoles]     = useState([]);
  const [loading, setLoading] = useState(false);

  const getAllRoles = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(ENDPOINTS.ROLES.ALL);
      setRoles(data.roles);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRoleById = useCallback(async (id) => {
    try {
      const { data } = await api.get(ENDPOINTS.ROLES.GET_BY_ID(id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const createRole = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.ROLES.CREATE, payload);
      setRoles((prev) => [...prev, data.role]);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateRole = useCallback(async (id, payload) => {
    try {
      const { data } = await api.patch(ENDPOINTS.ROLES.UPDATE(id), payload);
      setRoles((prev) => prev.map((r) => (r.id === id ? data.role : r)));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteRole = useCallback(async (id) => {
    try {
      const { data } = await api.delete(ENDPOINTS.ROLES.DELETE(id));
      setRoles((prev) => prev.filter((r) => r.id !== id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ roles, loading, getAllRoles, getRoleById, createRole, updateRole, deleteRole }),
    [roles, loading, getAllRoles, getRoleById, createRole, updateRole, deleteRole]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used inside RoleProvider");
  return context;
};