export interface Address {
  id?: string;
  userId?: string;       // FK after user is created
  firstName: string;
  lastName: string;
  email: string;
  mobileNr: string;
  country: string;
  postalCode: string;
  city: string;
  street: string;
  address: string;       // optional
}