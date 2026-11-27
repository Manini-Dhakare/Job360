import { create } from "zustand";
import { User, CreditBalance } from "@/types";

interface UserState {
  user: User | null;
  credits: CreditBalance;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setCredits: (credits: CreditBalance) => void;
  deductCredit: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  credits: { balance: 5, lifetime_granted: 5, lifetime_consumed: 0 },
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setCredits: (credits) => set({ credits }),
  deductCredit: () =>
    set((state) => ({
      credits: {
        ...state.credits,
        balance: Math.max(0, state.credits.balance - 1),
        lifetime_consumed: state.credits.lifetime_consumed + 1,
      },
    })),
}));
