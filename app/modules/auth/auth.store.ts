import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "./auth.service";
import type { LoginSchema, RegisterSchema } from "./auth.schema";
import type { User } from "~/types/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (payload: LoginSchema) => Promise<void>;
  register: (payload: RegisterSchema) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,

      // LOGIN
      async login(payload) {
        const data = await authService.login(payload);
        const userData: User = data.user || data;

        // Token is now stored in httpOnly cookie by backend
        set({
          user: userData,
          isAuthenticated: true,
        });
      },

      // REGISTER
      async register(payload) {
        const data = await authService.register(payload);
        const userData: User = data.user || data;

        // Token is now stored in httpOnly cookie by backend
        set({
          user: userData,
          isAuthenticated: true,
        });
      },

      // LOGOUT
      async logout() {
        try {
          await authService.logout();
        } catch (error) {
          // Continue with local logout even if API call fails
          console.error("Logout API error:", error);
        }
        set({ user: null, isAuthenticated: false });
        window.location.href = "/";
      },

      // Set user data (untuk login/register)
      setUser(user: User) {
        set({
          user,
          isAuthenticated: true,
        });
      },

      // Update partial user data (untuk profile update)
      updateUser(userData: Partial<User>) {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      // Clear auth state
      clearAuth() {
        set({ user: null, isAuthenticated: false });
      },

      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: "Rentivo-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
