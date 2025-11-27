/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {API_CONFIG} from "../config.tsx";
import useFetch from "@hook/fetchData.tsx";
import type {AuthContextType} from "@interfaces/AuthContextType.tsx";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  //trigger on refresh start
  const { sendRequest: checkAuth, data: authData } = useFetch<{ authenticated: boolean; email: string }>(`${API_CONFIG.baseURL}/auth/check`);
  useEffect(() => {
    checkAuth(
      { 
        method: "GET", 
        credentials: "include" 
      },
      "Auth check failed"
    );
  }, []);
  useEffect(() => {
    if (authData) {
      if (authData.authenticated && authData.email) {
        setUserEmail(authData.email);
      } else {
        setUserEmail(null);
      }
    }
  }, [authData]);
  //trigger on refresh ends

  const login = (email: string) => {
    setUserEmail(email);
  };

  const { sendRequest, data: logoutData } = useFetch<{ success: boolean; message: string }>(`${API_CONFIG.baseURL}/auth/logout`);
  const logout = async () => {
    try{
      await sendRequest(
        { method: "GET", credentials: "include" },
        "Logout failed"
      );

      setUserEmail(null);
      
      // Optional: Refresh the auth check
      setTimeout(() => {
        checkAuth(
          { method: "GET", credentials: "include" },
          "Auth check failed"
        );
      }, 100)
    } catch (error) {
      console.error("Logout failed:", error);
    }
    
    
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
