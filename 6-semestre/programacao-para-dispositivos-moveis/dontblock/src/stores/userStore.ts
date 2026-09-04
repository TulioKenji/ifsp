import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import type { User } from '@/schemas/user';

const storage = createMMKV({
    id: 'users-storage',
});

const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,

  setItem: (name, value) => {
    storage.set(name, value);
  },

  removeItem: (name) => {
    storage.remove(name);
  },
};

interface UsersState {
  users: Record<string, User>;
  addUser: (user: User) => void;
  removeUser: (userId: User['user']) => void;
  clearUsers: () => void;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set) => ({
      users: {},

      addUser: (user) =>
        set((state) => ({
          users: { ...state.users, [user.user]: user },
        })),

      removeUser: (user) =>
        set((state) => ({
          users: Object.fromEntries(
            Object.entries(state.users).filter(([key]) => key !== user)
          ),
        })),

      clearUsers: () =>
        set({
          users: {},
        }),
    }),
    {
      name: 'users-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
