export interface User {
  firstName: string;
  surname: string;
  email: string;
  password: string;
  rePassword: string;
  accountType: "customer" | "artist";
  country?: string;
  postalCode?: string;
  city?: string;
  address?: string;
  bio?: string;
  style?: string;
}