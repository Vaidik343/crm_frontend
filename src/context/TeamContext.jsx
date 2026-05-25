import { useState, useEffect, createContext, useContext, useCallback, useMemo } from "react";
import { ENDPOINTS } from "../api/endpoints";
import api from "../api/axiosInstance";

export const TeamContext = createContext(null);


export const TeamProvider = ({children}) => {
    const [teams, setTeams] = useState([]);
    const [loading ,setLoading] = useState(false);



       const getAllTeams = useCallback(async () => {
            try {
                setLoading(true);
                const {data} = await api.get(ENDPOINTS.TEAMS.ALL);
                console.log("🚀 ~ TeamProvider ~ data:", data)
                setTeams(data.teams || []);
                return data;

            } catch (error) {
                    console.log("🚀 ~ TeamProvider ~ error:", error)
                throw error;
            } finally {
                setLoading(false);
            }
    }, []);
      
    const createTeam = useCallback( async (payload) => {

        try {
            const {data} = await api.post(ENDPOINTS.TEAMS.CRATE, payload);
            console.log("🚀 ~ TeamProvider ~ data:", data)
        setTeams((prev) => [data, ...prev]);
       await getAllTeams?.();
        return data;
        } catch (error) {
              console.log("🚀 ~ TeamProvider ~ error:", error)
            throw error;
        }
    }, [])

            
 

    const getTeamById = useCallback( async (id) => {
        try {
            const {data} = await api.get(ENDPOINTS.TEAMS.GET_BY_ID(id));
            return data
        } catch (error) {
            throw error;            
        }
    }, []);


    const updateTeam = useCallback( async (payload, id) => {
        try {
            const {data} = await api.patch(ENDPOINTS.TEAMS.UPDATE(id), payload)

            // setTeams((prev) => prev.map((t) =>(t.id === id ? data : t) ))
            setTeams((prev) => prev.map((t) => (t.id === id ? data.team || data : t)));
            return data;
        } catch (error) {
            throw error;
        }
    }, []);

    const deleteTeam = useCallback( async(id) => {
        try {
            const {data} = await api.delete(ENDPOINTS.TEAMS.DELETE(id));
            setTeams((prev) => prev.filter((t) => t.id !== id))
            return data;
        } catch (error) {
            throw error;
        }
    }, [])

    const value = useMemo( () => ({
        teams, loading, setTeams, createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam
    }),[teams, loading, setTeams, createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam]);
    

    return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export const useTeam = () => {
    const context = useContext(TeamContext);
    if(!context) throw new Error("useTeam must be inside TeamProvider");
    return context;
}