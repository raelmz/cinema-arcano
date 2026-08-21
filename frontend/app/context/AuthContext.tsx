// app/context/AuthContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import type { Usuario } from '../services/api';

type AuthContextType = {
  user: Usuario | null;
  token: string | null;
  login: (token: string, user: Usuario) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredSession(): { token: string | null; user: Usuario | null } {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  const storedToken = localStorage.getItem('arcano_token');
  const storedUser = localStorage.getItem('arcano_user');

  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }

  try {
    return { token: storedToken, user: JSON.parse(storedUser) as Usuario };
  } catch {
    localStorage.removeItem('arcano_token');
    localStorage.removeItem('arcano_user');
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(getStoredSession);

  const login = (newToken: string, newUser: Usuario) => {
    localStorage.setItem('arcano_token', newToken);
    localStorage.setItem('arcano_user', JSON.stringify(newUser));
    setSession({ token: newToken, user: newUser });
  };

  const logout = () => {
    localStorage.removeItem('arcano_token');
    localStorage.removeItem('arcano_user');
    setSession({ token: null, user: null });
  };

  return (
    <AuthContext.Provider
      value={{
        user: session.user,
        token: session.token,
        login,
        logout,
        isLoading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider');
  }
  return context;
}
