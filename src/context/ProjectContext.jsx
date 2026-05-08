import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(false);

  const getAllProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(ENDPOINTS.PROJECTS.ALL);
      setProjects(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectById = useCallback(async (id) => {
    try {
      const { data } = await api.get(ENDPOINTS.PROJECTS.GET_BY_ID(id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const createProject = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.PROJECTS.CREATE, payload);
      setProjects((prev) => [data.project, ...prev]);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (id, payload) => {
    try {
      const { data } = await api.patch(ENDPOINTS.PROJECTS.UPDATE(id), payload);
      setProjects((prev) => prev.map((p) => (p.id === id ? data.project : p)));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    try {
      const { data } = await api.delete(ENDPOINTS.PROJECTS.DELETE(id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ projects, loading, getAllProjects, getProjectById, createProject, updateProject, deleteProject }),
    [projects, loading, getAllProjects, getProjectById, createProject, updateProject, deleteProject]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used inside ProjectProvider");
  return context;
};