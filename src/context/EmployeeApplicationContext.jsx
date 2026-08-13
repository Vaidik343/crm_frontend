import { createContext, useContext, useCallback, useMemo } from 'react';
import api from '../api/axiosInstance';
import { ENDPOINTS } from '../api/endpoints';

const EmployeeApplicationContext = createContext(null);

export const EmployeeApplicationProvider = ({ children }) => {

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

  const value = useMemo(() => ({
    submitApplication,
    getAllApplications,
    getApplicationById,
    approveApplication,
    rejectApplication,
    deleteApplication,
  }), [
    submitApplication,
    getAllApplications,
    getApplicationById,
    approveApplication,
    rejectApplication,
    deleteApplication,
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