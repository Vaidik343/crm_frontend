import { createContext, useContext, useCallback, useMemo } from 'react';
import api from '../api/axiosInstance';
import { ENDPOINTS } from '../api/endpoints';
import toast from 'react-hot-toast';
import { useState } from 'react';

const EmployeeApplicationContext = createContext(null);

export const EmployeeApplicationProvider = ({ children }) => {

    const [positions, setPositions] = useState([]);
    const [addresses, setAddresses] = useState([]);

  const submitApplication = useCallback(async (formData) => {
      try {
            const { data } = await api.post(ENDPOINTS.EMPLOYEE_APPLICATIONS.REGISTER, formData);
    return data;
      } catch (error) {
         throw error
      }
  }, []);

  const getAllApplications = useCallback(async (params = {}) => {
       try {
            const { data } = await api.get(ENDPOINTS.EMPLOYEE_APPLICATIONS.LIST, { params });
    return data;
       } catch (error) {
         throw error
       }
  }, []);

  const getApplicationById = useCallback(async (id) => {
       try {
            const { data } = await api.get(ENDPOINTS.EMPLOYEE_APPLICATIONS.BY_ID(id));
    return data;
       } catch (error) {
         throw error
       }
  }, []);

  const approveApplication = useCallback(async (id) => {

    try {
          const { data } = await api.patch(ENDPOINTS.EMPLOYEE_APPLICATIONS.APPROVE(id));
    return data;
    } catch (error) {
       throw error
    }

  }, []);

  const rejectApplication = useCallback(async (id, rejection_reason) => {

    try {
          const { data } = await api.patch(ENDPOINTS.EMPLOYEE_APPLICATIONS.REJECT(id), { rejection_reason });
    return data;
    } catch (error) {
       throw error
    }

  }, []);

  const deleteApplication = useCallback(async (id) => {
    try {
        const { data } = await api.delete(ENDPOINTS.EMPLOYEE_APPLICATIONS.DELETE(id));
    return data;
    } catch (error) {
      throw error
    }
  
  }, []);


//   const fetchLookUps = useCallback(async () => {
//     try {
//       const [posRes, addRes] = await Promise.all([
//         api.get(ENDPOINTS.OFFER_LETTER.POSITIONS),
//         api.get(ENDPOINTS.OFFER_LETTER.ADDRESSES)
//       ])

//       setAddresses(posRes.data.positions || []);
//       setPositions(addRes.data.addresses || []);
//     } catch (error) {
//       toast.error('Failed to load lookup data.');
//       throw error
//     }
//   }, []);

// const createPosition = async (name) => {
//  try {
//      const {data} = await api.post(ENDPOINTS.OFFER_LETTER.POSITIONS, {name});
//    setPositions((prev) => [...prev, data.position]);
//    return data.position;
//  } catch (error) {
//    throw error;
//  }
// }

// const createAddress = async (name) => {
//      try {
//          const {data} = await api.post(ENDPOINTS.OFFER_LETTER.ADDRESSES, {name});
//    setAddresses((prev) => [...prev, data.address]);
//    return data.address;
//      } catch (error) {
//       throw error;
//      }
// }



  const value = useMemo(() => ({
    submitApplication,
    getAllApplications,
    getApplicationById,
    approveApplication,
    rejectApplication,
    deleteApplication,
    // fetchLookUps,
    // createPosition,
    // createAddress
  }), [
    submitApplication,
    getAllApplications,
    getApplicationById,
    approveApplication,
    rejectApplication,
    deleteApplication,
    // fetchLookUps,
    // createPosition,
    // createAddress,
  ]);

  return (
    <EmployeeApplicationContext.Provider value={value}>
      {children}
    </EmployeeApplicationContext.Provider>
  );
};

export const useEmployeeApplication = () => {
  const context = useContext(EmployeeApplicationContext);
  if (!context) throw new Error('useEmployeeApplication must be used inside EmployeeApplicationProvider');
  return context;
};