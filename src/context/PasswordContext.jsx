import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const PasswordContext = createContext(null);

export const PasswordProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const changeOwnPassword = useCallback(async (payload) => {
    try {
      setLoading(true);
      const { data } = await api.patch(ENDPOINTS.PASSWORD.CHANGE, payload);
      console.log("🚀 ~ PasswordProvider ~ data:", data)
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (id) => {
    try {
      setLoading(true);
      const { data } = await api.patch(ENDPOINTS.PASSWORD.RESET(id));
      console.log("🚀 ~ PasswordProvider ~ data:", data)
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ loading, changeOwnPassword, resetPassword }),
    [loading, changeOwnPassword, resetPassword]
  );

  return <PasswordContext.Provider value={value}>{children}</PasswordContext.Provider>;
};

export const usePassword = () => {
  const context = useContext(PasswordContext);
  if (!context) throw new Error("usePassword must be used inside PasswordProvider");
  return context;
};