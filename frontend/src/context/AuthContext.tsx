/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import {API_URL} from "../config.tsx";
import useFetch from "@hook/fetchData.tsx";
import type {AuthContextType} from "@interfaces/AuthContextType.tsx";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const login = (email: string) => {
    setUserEmail(email);
  };

  const { sendRequest, error } = useFetch<{ success: boolean }>(`${API_URL}/api/auth/logout`);
  const logout = async () => {
    await sendRequest(
      { method: "POST", credentials: "include" },
      "Logout failed"
    );

    if (error) {
      alert(error); // or show it in your UI
      return; // stop clearing context if needed
    }
    setUserEmail(null); // clears context
    console.log("Logout successful, context cleared");
  };

  return (
    <AuthContext.Provider value={{ userEmail, login, logout, isAuthenticated: !!userEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
