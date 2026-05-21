import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
  createContext,
} from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const TeamMemberContext = createContext(null);

export const TeamMemberProvider = ({ children }) => {
  const [member, setMember] = useState([]);
  const [loading, setLoading] = useState(false);


    const getAllMembers = useCallback ( async () => {
    try {
        const {data} = await api.get(ENDPOINTS.TEAM_MEMBERS.ALL);
        setMember(data);

        return data;
    } catch (error) {
        throw error
    }
  }, []);


  const addTeamMember = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.TEAM_MEMBERS.CREATE, payload);
      setMember((prev) => [...prev, data]);
     await getAllMembers?.();
      return data;
    } catch (error) {
      
    console.log("🚀 ~ TeamMemberProvider ~ error:", error)
      throw error;
    }
  }, []);


  const getMemberById = useCallback( async (id) => {
    try {
        const {data} = await api.get(ENDPOINTS.TEAM_MEMBERS.GET_BY_ID(id));
        setMember(data);
        return data
    } catch (error) {
        throw error
    }
  }, [])

  const updateMember = useCallback(async(id, payload) => {
    try {
        const {data} = await api.patch(ENDPOINTS.TEAM_MEMBERS.UPDATE(id), payload);
                setMember((prev)=> prev.map((m)=>m.id === id ? data : m));
                return data;
    } catch (error) {
        throw error;
    }
  }, []);


  const removeMember = useCallback(async(id) => {
    try {
        const {data} = await api.delete(ENDPOINTS.TEAM_MEMBERS.REMOVE(id));
        setMember((prev) => prev.filter((m) => m.id !== id));
        return data;
    } catch (error) {
        throw error;
    }
  }, []);


  const value = useMemo( () => ({member, loading, addTeamMember, getAllMembers, getMemberById, updateMember, removeMember}),
  [member, loading, addTeamMember, getAllMembers, getMemberById, updateMember, removeMember])


  return <TeamMemberContext.Provider value={value}>{children}</TeamMemberContext.Provider>
};

export const useMember = () => {
      const context = useContext(TeamMemberContext);
    if (!context) throw new Error("useMember must be used inside MemberProvider");
  return context;
}