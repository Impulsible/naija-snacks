import React, { createContext, useContext, useState, useEffect } from 'react';
import { type AuthUser } from '../types/auth';
import { authService } from '../services/authService';
import type { LoginFormData, RegisterFormData } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('naija-snacks-user');
    const token = localStorage.getItem('naija-snacks-token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (data: LoginFormData) => {
    const response = await authService.login(data);
    localStorage.setItem('naija-snacks-token', response.token);
    localStorage.setItem('naija-snacks-user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const register = async (data: RegisterFormData) => {
    const response = await authService.register(data);
    localStorage.setItem('naija-snacks-token', response.token);
    localStorage.setItem('naija-snacks-user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    localStorage.setItem('naija-snacks-user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};