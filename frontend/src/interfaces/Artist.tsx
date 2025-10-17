export interface Artist {
  id?: number; // FK after user is created
  firstName: string;
  lastName: string;
  bio: string;
  style: string;
  imageUrl: string;
}