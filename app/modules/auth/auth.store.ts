import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "./auth.service";
import type { LoginSchema, RegisterSchema, OnboardingSchema } from "./auth.schema";
import type { User } from "~/types/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (payload: LoginSchema) => Promise<void>;
  register: (payload: RegisterSchema) => Promise<{ message: string }>;
  googleLogin: (accessToken: string) => Promise<{ needsOnboarding: boolean }>;
  onboarding: (payload: OnboardingSchema) => Promise<void>;
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

      // LOGIN (email)
      async login(payload) {
        const data = await authService.login(payload);
        const userData: User = data.user || data;

        set({
          user: userData,
          isAuthenticated: true,
        });
      },

      // REGISTER (email) — does NOT auto-login, user must verify email first
      async register(payload) {
        const data = await authService.register(payload);
        return data; // { message: "..." }
      },

      // GOOGLE LOGIN
      async googleLogin(accessToken: string) {
        const data = await authService.googleLogin(accessToken);
        const { needsOnboarding, ...userData } = data;

        set({
          user: userData as User,
          isAuthenticated: true,
        });

        return { needsOnboarding };
      },

      // ONBOARDING
      async onboarding(payload: OnboardingSchema) {
        const data = await authService.onboarding(payload);
        const userData: User = data.user || data;

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
          console.error("Logout API error:", error);
        }
        set({ user: null, isAuthenticated: false });
        window.location.href = "/";
      },

      // Set user data
      setUser(user: User) {
        set({
          user,
          isAuthenticated: true,
        });
      },

      // Update partial user data
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
