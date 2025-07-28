import { useContext, useState, createContext, useEffect } from "react";
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
  updateUserPreferences: (
    newPreferences: Partial<UserPreferences>
  ) => Promise<void>;
  getUserPreferences: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export const useUser = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN" || false;
  console.log("isAdmin:", isAdmin);

  const updateUserPreferences = async (
    newPreferences: Partial<UserPreferences>
  ) => {
    if (!user) return;
    try {
      if (!newPreferences.dislikedIngredients) {
        newPreferences.dislikedIngredients = [];
      }
      console.log("Updating user preferences:", newPreferences);
      await apiClient("user/updatePreferences", true, {
        diet: newPreferences.diet,
        dislikedIngredients: newPreferences.dislikedIngredients.join(","),
      });
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              preferences: {
                ...prevUser.preferences,
                ...newPreferences,
              },
            }
          : null
      );
    } catch (error) {
      console.error("Failed to update user preferences:", error);
    }
  };

  const getUserPreferences = async () => {
    if (!user) return;
    try {
      const response: UserPreferences = await apiClient(
        "user/getPreferences",
        false
      );
      console.log("Fetched user preferences:", response);
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
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
      apiClient("me")
        .then((userData) => {
          setUser(userData);
          setLoading(false);
        })
        .catch((error) => {
          if (error.status === 401) {
            apiClient("refresh")
              .then((userData) => {
                setUser(userData);
                setLoading(false);
              })
              .catch(() => {
                localStorage.removeItem("isLoggedIn");
                setUser(null);
                setLoading(false);
              });
          } else {
            localStorage.removeItem("isLoggedIn");
            setUser(null);
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAdmin,
        updateUserPreferences,
        getUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
