export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "USER" | "TENANT";
  profilePicture?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
