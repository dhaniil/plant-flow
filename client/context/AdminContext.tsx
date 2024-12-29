import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

interface AdminContextType {
  isAdmin: boolean;
  username: string | null;
  setAdmin: (value: boolean, username: string | null, token: string | null) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Periksa apakah token sudah ada di localStorage saat aplikasi dimuat
    const storedToken = localStorage.getItem("adminToken");
    const storedUsername = localStorage.getItem("adminUsername");

    if (storedToken) {
      setIsAdmin(true);
      setUsername(storedUsername || null);
      setToken(storedToken);
    }
  }, []);

  const setAdmin = (value: boolean, username: string | null, token: string | null) => {
    setIsAdmin(value);
    setUsername(username);
    setToken(token);

    if (value && token) {
      localStorage.setItem("adminToken", token);
      if (username) {
        localStorage.setItem("adminUsername", username);
      }
    } else {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUsername");
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setUsername(null);
    setToken(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
  };

  return (
    <AdminContext.Provider value={{ isAdmin, username, setAdmin, logout }}>
      {children}
    </AdminContext.Provider>
  );
};
