export interface User {
  id?: string;
  email: string;
  password: string; 
  accountType: "customer" | "artist";
}
