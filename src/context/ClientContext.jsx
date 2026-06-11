import { createContext, useContext, useState } from "react";
import api from "../api/axiosInstance";


const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAllClients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/clients");
      setClients(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (data) => {
    const res = await api.post("/clients", data);
    setClients((prev) => [...prev, res.data.client]);
    return res.data.client;
  };

  const updateClient = async (id, data) => {
    const res = await api.patch(`/clients/${id}`, data);
    setClients((prev) => prev.map((c) => (c.id === id ? res.data.client : c)));
    return res.data.client;
  };

  const deleteClient = async (id) => {
    await api.delete(`/clients/${id}`);
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ClientContext.Provider value={{ clients, loading, getAllClients, createClient, updateClient, deleteClient }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
    const context =  useContext(ClientContext);
    if(!context) throw new Error("useClient must be used inside Client Provider")
    return context;
}