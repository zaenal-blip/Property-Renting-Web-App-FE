export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "USER" | "TENANT" | null;
  phone?: string | null;
  businessName?: string | null;
  provider: "email" | "google";
  profilePicture?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
