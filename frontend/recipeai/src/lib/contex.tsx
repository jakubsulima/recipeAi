import { useContext, useState, createContext } from "react";

interface UserProps {
  login: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: UserProps | null;
  setUser: React.Dispatch<React.SetStateAction<UserProps | null>>;
}

const AuthContext = createContext<AuthContextType>(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<UserProps | null>(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
