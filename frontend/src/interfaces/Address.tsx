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
  address1: string;
  address2: string;       // optional
}