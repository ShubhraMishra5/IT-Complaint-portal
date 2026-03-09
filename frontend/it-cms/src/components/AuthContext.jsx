import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from './api'; // uses baseURL and withCredentials=true

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Call this to login
  const login = (userData) => setUser(userData);

  // Call this to logout
  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
  };

  // Call this to check current user from cookie/session
  const checkAuth = async () => {
    try {
      const res = await axios.get('/auth/whoami');
      const data = res.data;
      setUser({
        employeeId: data.user_id,
        role: data.role,
        email: data.email,
      });
    } catch (err) {
      console.log('Not authenticated');
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
