import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const ProbationContext = createContext(null);

export const ProbationProvider = ({ children }) => {
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(1);
  const [limit]                     = useState(10);
  const [total, setTotal]           = useState(0);
  const totalPages                  = Math.ceil(total / limit);

  const getProbationEmployees = useCallback(async (
    pageNumber = 1, search = "", probation_status = ""
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pageNumber, limit });
      if (search)           params.set("search", search);
      if (probation_status) params.set("probation_status", probation_status);
      const { data } = await api.get(
        `${ENDPOINTS.PROBATION.ALL}?${params.toString()}`
      );
      console.log("🚀 ~ ProbationProvider ~ data:", data)
      setEmployees(data.employees || []);
      setPage(data.page || 1);
      setTotal(data.total || 0);
      return data;
    } catch (err) { throw err; }
    finally { setLoading(false); }
  }, [limit]);


  const startProbation = useCallback(async (id, payload) => {
  try {
       const { data } = await api.post(ENDPOINTS.PROBATION.START(id), payload);
    console.log("🚀 ~ ProbationProvider ~ data:", data)
    return data;
  } catch (error) {
      console.log("🚀 ~ ProbationProvider ~ error:", error)
    throw error
  }
  }, []);

  const passProbation = useCallback(async (id) => {
    const { data } = await api.patch(ENDPOINTS.PROBATION.PASS(id));
    setEmployees((prev) =>
      prev.map((e) => e.id === id ? { ...e, probation_status: "passed", is_probation: false } : e)
    );
    return data;
  }, []);

  const terminateProbation = useCallback(async (id, reason) => {
    const { data } = await api.patch(ENDPOINTS.PROBATION.TERMINATE(id), { reason });
    setEmployees((prev) =>
      prev.map((e) => e.id === id ? { ...e, probation_status: "terminated", is_active: false } : e)
    );
    return data;
  }, []);

  const updateProbationDates = useCallback(async (id, payload) => {
    const { data } = await api.patch(ENDPOINTS.PROBATION.UPDATE_DATES(id), payload);
    return data;
  }, []);

  const value = useMemo(() => ({
    employees, loading, page, limit, total, totalPages, setPage,
    getProbationEmployees, startProbation, passProbation,
    terminateProbation, updateProbationDates,
  }), [
    employees, loading, page, limit, total, totalPages,
    getProbationEmployees, startProbation, passProbation,
    terminateProbation, updateProbationDates,
  ]);

  return (
    <ProbationContext.Provider value={value}>
      {children}
    </ProbationContext.Provider>
  );
};

export const useProbation = () => {
  const ctx = useContext(ProbationContext);
  if (!ctx) throw new Error("useProbation must be used inside ProbationProvider");
  return ctx;
};