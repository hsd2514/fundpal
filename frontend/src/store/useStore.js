import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      user: null,
      isOnboarded: false,
      onboardingData: {},
      setUser: (user) => set({ user }),
      updateOnboardingData: (data) => set((state) => ({ onboardingData: { ...state.onboardingData, ...data } })),
      completeOnboarding: () => set({ isOnboarded: true }),
      logout: () => set({ user: null, isOnboarded: false, onboardingData: {} }),
    }),
    {
      name: 'fundpal-storage',
    }
  )
);

export default useStore;
