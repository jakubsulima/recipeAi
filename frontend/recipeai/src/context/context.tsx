import { useCallback, useContext, useState, createContext, useEffect } from "react";
import { apiClient } from "../lib/hooks";

interface UserPreferences {
  diet: string;
  dislikedIngredients: string[];
}

interface UserProps {
  email: string;
  id: number;
  role: string;
  preferences: UserPreferences;
}

interface AuthContextType {
  user: UserProps | null;
  setUser: React.Dispatch<React.SetStateAction<UserProps | null>>;
  loading: boolean;
  isAdmin: boolean;
  getUserPreferences: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export const useUser = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN" || false;

  const clearAuthState = useCallback(() => {
    localStorage.removeItem("isLoggedIn");
    setUser(null);
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const userData = await apiClient("me");
      setUser(userData);
      localStorage.setItem("isLoggedIn", "true");
      return true;
    } catch (error: any) {
      if (error?.status === 401) {
        try {
          await apiClient("refresh", true);
          const userData = await apiClient("me");
          setUser(userData);
          localStorage.setItem("isLoggedIn", "true");
          return true;
        } catch {
          clearAuthState();
          return false;
        }
      }

      clearAuthState();
      return false;
    }
  }, [clearAuthState]);

  const logout = useCallback(async () => {
    try {
      await apiClient("logout", true);
    } catch {
      // Ignore logout endpoint failures and clear client auth state anyway.
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  const getUserPreferences = async () => {
    if (!user) return;
    try {
      const response: UserPreferences = await apiClient(
        "user/getPreferences",
        false
      );
      if (response) {
        setUser((prevUser) =>
          prevUser
            ? {
                ...prevUser,
                preferences: response,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to fetch user preferences:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      const shouldAttemptSession = localStorage.getItem("isLoggedIn") === "true";
      if (!shouldAttemptSession) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      await refreshSession();
      if (isMounted) {
        setLoading(false);
      }
    };

    initializeSession();

    const onSessionExpired = () => clearAuthState();
    window.addEventListener("auth:session-expired", onSessionExpired);

    return () => {
      isMounted = false;
      window.removeEventListener("auth:session-expired", onSessionExpired);
    };
  }, [clearAuthState, refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAdmin,
        getUserPreferences,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
