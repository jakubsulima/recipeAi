import { useContext, useState, createContext, useEffect } from "react";
import { AJAX } from "../lib/hooks";

interface UserProps {
  login: string;
  firstName: string;
  lastName: string;
  id: number;
}

interface AuthContextType {
  user: UserProps | null;
  setUser: React.Dispatch<React.SetStateAction<UserProps | null>>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useUser = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      AJAX("me")
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          try {
            AJAX("refresh")
              .then((userData) => {
                setUser(userData);
                return;
              })
              .catch(() => {
                throw new Error("Failed to refresh user data");
              });
          } catch (error) {
            localStorage.removeItem("isLoggedIn");
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
