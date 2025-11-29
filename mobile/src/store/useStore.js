import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      name: 'fundpal-mobile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useStore;
