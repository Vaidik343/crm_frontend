import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'
import { ENDPOINTS } from '../../api/endpoints'
import Badge from '../../components/ui/Badge'
import Spinner from "../../components/ui/Spinner";
import Alert from './../../components/ui/Alert';


const Dashboard = () => {
  const {user} = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

      const fetch = async () => {
      try {
        setLoading(true);
        const {data} = await api.get(ENDPOINTS.DASHBOARD.ALL);
        console.log("dashboard", data)
        setData(data);
      } catch (err) {
         setError(err?.response?.data?.message || "Failed to load dashboard");

      } finally {
        setLoading(false);
      }
    }
  useEffect(() => {
    fetch();
  },[])

  if(loading) return <Spinner />;

  return (
    <div>
      {/* page header */}
      <div className='mb-4'>
        <h4 className='fw-bold mb-1'> Welcome back, {user?.name}</h4>
        <p className='text-muted small mb-0'>Here's what's happing in your CRM today.</p>
      </div>
      <Alert type='danger' message={error} onClose={() => setError("")} />

        {/* total counts */}
        
    </div>
  )
}

export default Dashboard