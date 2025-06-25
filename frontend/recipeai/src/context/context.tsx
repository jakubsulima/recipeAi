import { useContext, useState, createContext, useEffect } from "react";
import { apiClient } from "../lib/hooks";

interface UserProps {
  email: string;
  id: number;
  role: string; // Changed from isAdmin to role
}

interface AuthContextType {
  user: UserProps | null;
  setUser: React.Dispatch<React.SetStateAction<UserProps | null>>;
  loading: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType>(null!);

export const useUser = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN" || false;
  console.log("isAdmin:", isAdmin);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    // Only attempt authentication if user was previously logged in
    if (isLoggedIn === "true") {
      // First try to get current user data
      apiClient("me")
        .then((userData) => {
          setUser(userData);
          setLoading(false);
        })
        .catch((error) => {
          // If 401, try to refresh the token
          if (error.status === 401) {
            apiClient("refresh")
              .then((userData) => {
                setUser(userData);
                setLoading(false);
              })
              .catch(() => {
                // Refresh failed, clear authentication state
                localStorage.removeItem("isLoggedIn");
                setUser(null);
                setLoading(false);
              });
          } else {
            // Other errors, clear authentication state
            localStorage.removeItem("isLoggedIn");
            setUser(null);
            setLoading(false);
          }
        });
    } else {
      // User is not logged in, set loading to false immediately
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
