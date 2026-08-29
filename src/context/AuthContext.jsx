import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const AuthContext = createContext(null);

const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(getUserFromStorage);
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = useCallback(async (employee_id, password) => {
    try {
      setLoading(true);
      const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, { employee_id, password });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.accessToken);
      setUser(data.user);

      // redirect based on role
      if (data.user.is_admin) {
     navigate("/admin/dashboard");
      // console.log("🚀 ~ AuthProvider ~ nv:", nv)
      } else {
        navigate("/employee/myDashboard");
      }

      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);


  const logout = useCallback(async () => {
    try {
   const lo =  await api.post(ENDPOINTS.AUTH.LOGOUT);
  //  console.log("🚀 ~ AuthProvider ~ lo:", lo)

    } catch (error) {
      // even if backend fails, clear frontend
          // console.log("🚀 ~ AuthProvider ~ error:", error)
      throw error
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);

      
    navigate("/login");
    
    }
  }, [navigate]);

  // check if user has a specific permission flag
  const can = useCallback((flag) => {
    if (!user) return false;
    if (user.is_admin) return true;
    return user.permissions?.[flag] === true;
  }, [user]);

  const isAdmin = user?.is_admin === true;
  const isAuthenticated = !!token && !!user;

  const updateStoredUser = useCallback((updatedUser) => {
  const merged = { ...user, ...updatedUser };
  localStorage.setItem("user", JSON.stringify(merged));
  setUser(merged);
}, [user]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAdmin,
    isAuthenticated,
    login,
    logout,
    can,
      setUser,           // ← add this
  updateStoredUser,
  }), [user, token, loading, isAdmin, isAuthenticated, login, logout, can, updateStoredUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};