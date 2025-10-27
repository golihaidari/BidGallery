export interface AuthContextType {
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}