import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userId: string;
  setUserId: (id: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: crypto.randomUUID(), // Default to a new UUID
      setUserId: (id) => set({ userId: id }),
    }),
    {
      name: 'user-storage',
    }
  )
);
