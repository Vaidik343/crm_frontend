import { useState, useEffect, createContext, useContext, useCallback, useMemo } from "react";
import { ENDPOINTS } from "../api/endpoints";

export const TeamContext = createContext(null);


export const TeamProvider = ({children}) => {
    const [teams, setTeams] = useState([]);
    const [loading ,setLoading] = useState(false);



    const createTeam = useCallback( async (payload) => {

        try {
            const {data} = await api.post(ENDPOINTS.TEAMS.CRATE, payload);
        setTeams((prev) => [data, ...prev]);
        return data;
        } catch (error) {
            throw error;
        }
    }, [])

    const getAllTeams = useCallback(async () => {
            try {
                setLoading(true);
                const {data} = await api.get(ENDPOINTS.TEAMS.ALL);
                setTeams(data);
                return data;

            } catch (error) {
                throw error;
            } finally {
                setLoading(false);
            }
    }, []);

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
            const {data} = await api.put(ENDPOINTS.TEAMS.UPDATE(id), payload)

            setTeams((prev) => prev.map((t) =>(t.id === id ? data : t) ))
            return data;
        } catch (error) {
            throw error;
        }
    }, []);

    const deleteTeam = useCallback
}