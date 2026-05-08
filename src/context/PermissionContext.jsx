import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading]         = useState(false);

  const getAllPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(ENDPOINTS.PERMISSIONS.ALL);
      setPermissions(data.permissions);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPermissionByUserId = useCallback(async (user_id) => {
    try {
      const { data } = await api.get(ENDPOINTS.PERMISSIONS.GET_BY_ID(user_id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updatePermission = useCallback(async (user_id, payload) => {
    try {
      const { data } = await api.patch(ENDPOINTS.PERMISSIONS.UPDATE(user_id), payload);
      setPermissions((prev) =>
        prev.map((p) => (p.user_id === user_id ? data.permission : p))
      );
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const resetPermission = useCallback(async (user_id) => {
    try {
      const { data } = await api.patch(ENDPOINTS.PERMISSIONS.RESET(user_id));
      setPermissions((prev) =>
        prev.map((p) => (p.user_id === user_id ? data.permission : p))
      );
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ permissions, loading, getAllPermissions, getPermissionByUserId, updatePermission, resetPermission }),
    [permissions, loading, getAllPermissions, getPermissionByUserId, updatePermission, resetPermission]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) throw new Error("usePermission must be used inside PermissionProvider");
  return context;
};