import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface ERPUser {
  id: string;
  name: string;
  role: 'admin' | 'student';
  institution_id: string;
}

interface AppContext {
  user: ERPUser | null;
  token: string | null;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  login: (token: string, user: ERPUser, institutionId: string) => void;
  logout: () => void;
}

const ERPContext = createContext<AppContext | undefined>(undefined);

export function ERPProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ERPUser | null>(() => {
    const saved = localStorage.getItem('erp_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || null;
  });

  const [academicYear, setAcademicYearState] = useState<string>(() => {
    return localStorage.getItem('x-academic-year') || '2024-2025';
  });

  const setAcademicYear = (year: string) => {
    setAcademicYearState(year);
    localStorage.setItem('x-academic-year', year);
    window.location.reload(); // Reload to refetch everything with new year
  };

  const login = (newToken: string, newUser: ERPUser, newInstitutionId: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('erp_user', JSON.stringify(newUser));
    localStorage.setItem('x-institution-id', newInstitutionId);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('erp_user');
    localStorage.removeItem('x-institution-id');
  };

  return (
    <ERPContext.Provider value={{
      user,
      token,
      academicYear,
      setAcademicYear,
      login,
      logout
    }}>
      {children}
    </ERPContext.Provider>
  );
}

export function useERPContext() {
  const context = useContext(ERPContext);
  if (context === undefined) {
    throw new Error('useERPContext must be used within an ERPProvider');
  }
  return context;
}
