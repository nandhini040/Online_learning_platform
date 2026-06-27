import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('skillsphere_user');
    const accessToken = localStorage.getItem('skillsphere_access');
    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('skillsphere_access', access);
    localStorage.setItem('skillsphere_refresh', refresh);
    localStorage.setItem('skillsphere_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('skillsphere_access');
    localStorage.removeItem('skillsphere_refresh');
    localStorage.removeItem('skillsphere_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('skillsphere_user', JSON.stringify(updatedUser));
  }, []);

  const isAdmin      = user?.role === 'ADMIN';
  const isInstructor = user?.role === 'INSTRUCTOR';
  const isStudent    = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAdmin, isInstructor, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
