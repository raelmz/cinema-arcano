// app/context/AuthContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
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

type Session = { token: string | null; user: Usuario | null };

function getStoredSession(): Session {
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
  // Estado inicial precisa ser IDÊNTICO no server e no client (sessão vazia,
  // carregando). Só depois de montar no client é que olhamos o localStorage —
  // isso evita o mismatch de hydration entre "Entrar" e "Meus Ingressos".
  const [session, setSession] = useState<Session>({ token: null, user: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      setSession(getStoredSession());
      setIsLoading(false);
    });
  }, []);

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
        isLoading,
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
