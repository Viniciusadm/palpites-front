import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Session {
  userId: string;
  displayName: string;
}

interface AuthState {
  userId: string | null;
  displayName: string | null;
  poolId: string | null;
  setSession: (session: Session) => void;
  setPoolId: (poolId: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      displayName: null,
      poolId: null,
      setSession: ({ userId, displayName }) => set({ userId, displayName }),
      setPoolId: (poolId) => set({ poolId }),
      clear: () => set({ userId: null, displayName: null, poolId: null }),
    }),
    { name: "palpites:auth" },
  ),
);
