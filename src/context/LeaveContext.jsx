import { createContext, useCallback, useEffect, useState , useMemo, useContext} from "react";
import api from "../api/axiosInstance";
import { ENDPOINTS } from "../api/endpoints";
import { useSocket } from "./SocketContext";

export const LeaveContext = createContext(null);

export const LeaveProvider = ({children}) => {
    const [leaves, setLeaves] = useState([]);
    // console.log("🚀 ~ LeaveProvider ~ leaves:", leaves)
    const [loading, setLoading] = useState(false);

    // pagination states
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    const totalPages = Math.ceil(total / limit);

    const {socket} = useSocket();

    //real time socket listeners
    useEffect(() => {
        if(!socket) return;
    })


    // API


    // EMP

      
    const getMyLeaves = useCallback(async (
        pageNumber = 1,
        pageLimit = 10,
        filter = {}
    ) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({page: pageNumber, limit: pageLimit});

            if(filter.status)  params.set("status", filter.status);
            if(filter.leave_type) params.set("leave_type", filter.leave_type);
            if(filter.from) params.set("from", filter.from);
            if(filter.to)  params.set("to", filter.to);
            if(filter.search) params.set("search", filter.search);

             const { data } = await api.get(`${ENDPOINTS.LEAVES.MY}?${params.toString()}`);
             console.log("🚀 ~ LeaveProvider ~ data:", data)

             setLeaves(data.data || []);
             setPage(data.page || 1);
             setLimit(pageLimit);
             setTotal(data.total || 0);

             return data;
        } catch (error) {
            throw error;
              console.log("🚀 ~ LeaveProvider ~ error:", error)
        } finally {
            setLoading(false);
        }
    }, []);

const createLeave = useCallback(async (payload, medicalFile = null) => {
  try {
    let body;
    let headers = {};

    if (medicalFile) {
      // multipart/form-data when file is present
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      formData.append("medical_document", medicalFile);
      body = formData;
      // axios sets Content-Type automatically for FormData
    } else {
      body = payload;
    }

    const { data } = await api.post(ENDPOINTS.LEAVES.CREATE, body);
    setLeaves((prev) => {
      if (prev.some((l) => l.id === data.leave?.id)) return prev;
      return [data.leave, ...prev];
    });
    return data;
  } catch (error) {
    throw error;
  }
}, []);

const cancelLeave = useCallback(async (id) => {
    try {
      const { data } = await api.patch(ENDPOINTS.LEAVES.CANCEL(id));
      setLeaves((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "cancelled" } : l))
      );
      return data;
    } catch (error) {
      throw error;
    }
  }, []);


  
  // admin

 const getAllLeaves = useCallback(async (
    pageNumber = 1,
    pageLimit  = 10,
    filters    = {}
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pageNumber, limit: pageLimit });

      if (filters.status)     params.set("status",     filters.status);
      if (filters.leave_type) params.set("leave_type", filters.leave_type);
      if (filters.from)       params.set("from",       filters.from);
      if (filters.to)         params.set("to",         filters.to);
      if (filters.search)     params.set("search",     filters.search);
      if (filters.user_id)    params.set("user_id",    filters.user_id);
      if (filters.month)      params.set("month",      filters.month); 
      if (filters.year)       params.set("year",       filters.year);  

      
const { data } = await api.get(`${ENDPOINTS.LEAVES.ALL}?${params.toString()}`)

      setLeaves(data.data || []);
      setPage(data.page     || 1);
      setLimit(pageLimit);
      setTotal(data.total   || 0);

      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveLeave = useCallback(async (id) => {
    try {
      const { data } = await api.patch(ENDPOINTS.LEAVES.APPROVE(id));
      setLeaves((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "approved" } : l))
      );
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const rejectLeave = useCallback(async (id, rejection_reason) => {
    try {
      const { data } = await api.patch(ENDPOINTS.LEAVES.REJECT(id), {
        rejection_reason,
      });
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, status: "rejected", rejection_reason } : l
        )
      );
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  // ─────────────────────────────────────────────
  // LOGS
  // ─────────────────────────────────────────────

  const getLeaveLogs = useCallback(async (id) => {
    try {
      const { data } = await api.get(ENDPOINTS.LEAVES.LEAVES_LOGS(id));
      console.log("🚀 ~ LeaveProvider ~ data:", data)
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  // ─────────────────────────────────────────────
  // WORKED SATURDAYS
  // ─────────────────────────────────────────────

  const getWorkedSaturdays = useCallback(async (user_id) => {
    try {
      const { data } = await api.get(ENDPOINTS.LEAVES.GET_MARKED_SATURDAY(user_id));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

    
  const markWorkedSaturday = useCallback(async (payload) => {
    try {
      const { data } = await api.post(ENDPOINTS.LEAVES.SATURDAY_MARK, payload);
      console.log("🚀 ~ LeaveProvider ~ data:", data)
      
      return data;
    } catch (error) {
      console.log("🚀 ~ LeaveProvider ~ error:", error)
      throw error;
    }
  }, []);




  // ─────────────────────────────────────────────
// BALANCE
// ─────────────────────────────────────────────

  
const getMyBalance = useCallback(async () => {
  try {
    const { data } = await api.get(ENDPOINTS.LEAVES.BALANCE_MY);
    console.log("🚀 ~ LeaveProvider ~ data:", data)
    return data;
  } catch (error) {
    console.log("🚀 ~ LeaveProvider ~ error:", error)
    throw error;
  }
}, []);

const getEmployeeBalance = useCallback(async (user_id, month, year) => {
  try {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (year)  params.set('year',  year);
    const { data } = await api.get(
      `${ENDPOINTS.LEAVES.BALANCE(user_id)}?${params.toString()}`
    );
    return data;
  } catch (error) {
    throw error;
  }
}, []);

const getEmployeeBalanceHistory = useCallback(async (user_id) => {
  try {
    const { data } = await api.get(ENDPOINTS.LEAVES.BALANCE_HISTORY(user_id));
    return data;
  } catch (error) {
    throw error;
  }
}, []);


// ─────────────────────────────────────────────
// LEAVE CALCULATION
// ─────────────────────────────────────────────


const getLeaveCalculation = useCallback(async(filters = {}) => {

  try {

    const params = new URLSearchParams();


    if(filters.user_id)
      params.set("user_id", filters.user_id);


    if(filters.year)
      params.set("years", filters.year);


    if(filters.month)
      params.set("month", filters.month);


    const {data} = await api.get(
      `${ENDPOINTS.LEAVES.CALCULATION}?${params.toString()}`
    );


    return data;


  } catch(error){

    console.log(
      "Leave calculation error:",
      error
    );

    throw error;

  }

},[]);


// ─────────────────────────────────────────────
// PUBLIC HOLIDAYS
// ─────────────────────────────────────────────

const getPublicHolidays = useCallback(async (year) => {
  try {
    const params = new URLSearchParams();
    if (year) params.set('year', year);
    const { data } = await api.get(
      `${ENDPOINTS.LEAVES.HOLIDAYS}?${params.toString()}`
    );
    return data;
  } catch (error) {
    throw error;
  }
}, []);

const addPublicHoliday = useCallback(async (payload) => {
  try {
    const { data } = await api.post(ENDPOINTS.LEAVES.HOLIDAYS, payload);
    return data;
  } catch (error) {
    throw error;
  }
}, []);


const updatePublicHoliday = useCallback(async (id, payload) => {
  try {
    const { data } = await api.put(
      ENDPOINTS.LEAVES.HOLIDAY_UPDATE(id),
      payload
    );
    console.log("🚀 ~ LeaveProvider ~ data:", data)
    return data;
  } catch (error) {
    throw error;
  }
}, []);


const deletePublicHoliday = useCallback(async (id) => {
  try {
    const { data } = await api.delete(ENDPOINTS.LEAVES.HOLIDAY_DELETE(id));
    return data;
  } catch (error) {
    throw error;
  }
}, []);




const value = useMemo(() => ({
    leaves,
    loading,
    page,
    limit,
    total,
    totalPages,
    setPage,
    getMyLeaves,
    createLeave,
    cancelLeave,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    getLeaveLogs,
    getWorkedSaturdays,
    markWorkedSaturday,
     getMyBalance,
  getEmployeeBalance,
  getEmployeeBalanceHistory,
  getLeaveCalculation,
  getPublicHolidays,
  addPublicHoliday,
  updatePublicHoliday,
  deletePublicHoliday,
  }), [
    leaves,
    loading,
    page,
    limit,
    total,
    totalPages,
    getMyLeaves,
    createLeave,
    cancelLeave,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    getLeaveLogs,
    getWorkedSaturdays,
    markWorkedSaturday,
     getMyBalance,
  getEmployeeBalance,
  getEmployeeBalanceHistory,
  getLeaveCalculation,
  getPublicHolidays,
  addPublicHoliday,
  updatePublicHoliday,
  deletePublicHoliday,
  ]);
  return (
    <LeaveContext.Provider value={value}>{children}</LeaveContext.Provider>
  )
}

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) throw new Error("useLeave must be used inside LeaveProvider");
  return context;
};