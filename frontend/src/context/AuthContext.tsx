import React, { createContext, useContext, useState } from "react";

interface AuthState {
  email: string | null;
  token: string | null;
}

interface AuthContextType {
  auth: AuthState;
  login: (email: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ email: null, token: null });

  const login = (email: string, token: string) => {
    setAuth({ email, token });
    localStorage.setItem("auth", JSON.stringify({ email, token })); // persist
  };

  const logout = () => {
    setAuth({ email: null, token: null });
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
