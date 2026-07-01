import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(false);

      // pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

const getAllProjects = useCallback(async (pageNumber = 1, pageLimit = 10, search = "", includeInactive = false) => {
  try {
    setLoading(true);
    const params = new URLSearchParams({ page: pageNumber, limit: pageLimit });
    if (search) params.set("search", search);
    if (includeInactive) params.set("include_inactive", "true");

    const { data } = await api.get(`${ENDPOINTS.PROJECTS.ALL}?${params.toString()}`);
    console.log("🚀 ~ ProjectProvider ~ data:", data)

    setProjects(data.data || []);
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
      // console.log("🚀 ~ ProjectProvider ~ data:", data)
      
      setProjects((prev) => [data.project, ...prev]);
      return data;
    } catch (error) {
      //  console.log("🚀 ~ ProjectProvider ~ error:", error)
      throw error;
    }
  }, []);

const updateProject = useCallback(async (id, payload) => {
  try {
    const response = await api.patch(
      ENDPOINTS.PROJECTS.UPDATE(id),
      payload
    );

    // console.log("UPDATE PROJECT RESPONSE:", response.data);

    const updatedProject =
      response.data.project ||
      response.data.data ||
      response.data;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? updatedProject : p
      )
    );

    return updatedProject;
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

  const addMemberToProject = useCallback(async (projectId, members) => {
    try {
      const {data} = await api.post(ENDPOINTS.PROJECTS.ADD_MEMBERS(projectId), {members});
      setProjects( (prev) => prev.map( (p) => p.id === projectId ? data.project : p));
      return data;
    } catch (error) {
      throw error;
    }
  }, [])

  const updateMemberRole = useCallback(async (memberId, role_id) => {
    try {
      const {data} = await api.patch(ENDPOINTS.PROJECTS.UPDATE_MEMBER_ROLE(memberId),{role_id})
      return data;
    } catch (error) {
      throw error
    }
  }, []);


  const removeMember = useCallback( async (memberId, projectId) => {
    try {
      const {data} = await api.delete(ENDPOINTS.PROJECTS.REMOVE_MEMBER(memberId));
      // console.log("🚀 ~ ProjectProvider ~ data:", data)

      // refresh that project in state
      setProjects((prev) => prev.map( (p) => {
        if(p.id !== projectId) return p;
        return {...p, members: p.members.filter( (m) => m.id !== memberId)};
      }));

    } catch (error) {
          // console.log("🚀 ~ ProjectProvider ~ error:", error)
      throw error      
    }

  }, [])
    const totalPages = Math.ceil(total / limit);

  const value = useMemo(
    () => ({ projects, loading,page,
      limit,
      total,
      totalPages, setPage, getAllProjects, getProjectById, createProject, updateProject, deleteProject, addMemberToProject, updateMemberRole, removeMember }),
    [projects, loading,  page,
      limit,
      total,
      totalPages,

      setPage, getAllProjects, getProjectById, createProject, updateProject, deleteProject, addMemberToProject, updateMemberRole, removeMember]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used inside ProjectProvider");
  return context;
};