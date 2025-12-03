"use client";

import { authApi } from "@/lib/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ==========================================
// Types
// ==========================================

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ==========================================
// Auth Context
// ==========================================

const AuthContext = createContext<AuthContextType | null>(null);

// ==========================================
// Auth Provider
// ==========================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      refresh().catch(() => {
        localStorage.removeItem("token");
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      localStorage.setItem("token", token);
      setUser(user as User);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      try {
        const { token, user } = await authApi.register({
          email,
          password,
          name,
        });
        localStorage.setItem("token", token);
        setUser(user as User);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { user } = await authApi.me();
      setUser(user as User);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      throw new Error("Session expired");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// Auth Hook
// ==========================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ==========================================
// Protected Route HOC
// ==========================================

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        window.location.href = "/login";
      }
    }, [isLoading, isAuthenticated]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

export default useAuth;
