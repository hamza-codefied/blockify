/**
 * Auth Store (Zustand)
 * Manages authentication state: user, tokens, permissions
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      permissions: [],
      isAuthenticated: false,

      // Actions
      setAuth: (user, token, refreshToken, permissions = []) => {
        set({
          user,
          token,
          refreshToken,
          permissions,
          isAuthenticated: true,
        });
      },

      setToken: (token) => {
        set({ token });
      },

      setRefreshToken: (refreshToken) => {
        set({ refreshToken });
      },

      setUser: (user) => {
        set({ user });
      },

      setPermissions: (permissions) => {
        set({ permissions });
      },

      logout: () => {
        // Clear persisted storage first to prevent rehydration
        localStorage.removeItem('auth-storage');
        // Clear all state
        set({
          user: null,
          token: null,
          refreshToken: null,
          permissions: [],
          isAuthenticated: false,
        });
      },

      // Getters
      hasPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };

