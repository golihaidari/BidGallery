export interface Artist {
  userId?: string;       // FK after user is created
  firstName: string;
  lastName: string;
  bio: string;
  style: string;
}