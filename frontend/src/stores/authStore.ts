import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiPost } from '@/lib/api';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  switchRole: (role: UserRole) => void;
}

// Mock users for demo
const MOCK_USERS: Record<string, { user: User; password: string }> = {
  'student@campus.edu': {
    password: 'student123',
    user: {
      id: 'stu-001',
      email: 'student@campus.edu',
      name: 'Alex Johnson',
      role: 'student',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
  },
  'teacher@campus.edu': {
    password: 'teacher123',
    user: {
      id: 'tea-001',
      email: 'teacher@campus.edu',
      name: 'Dr. Sarah Chen',
      role: 'teacher',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      createdAt: new Date('2023-08-01'),
      updatedAt: new Date('2023-08-01'),
    },
  },
  'admin@campus.edu': {
    password: 'admin123',
    user: {
      id: 'adm-001',
      email: 'admin@campus.edu',
      name: 'Michael Roberts',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2023-06-01'),
    },
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string, role?: UserRole) => {
        set({ isLoading: true });
        
        try {
          // Try API first, fall back to mock
          const response = await apiPost<{ user: User; token: string; refreshToken: string }>('/auth/login', {
            email,
            password,
          });

          if (response.success && response.data) {
            const user = role ? { ...response.data.user, role } : response.data.user;
            set({
              user,
              token: response.data.token,
              refreshToken: response.data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Fall back to mock data
            const mockUser = MOCK_USERS[email.toLowerCase()];
            if (!mockUser || mockUser.password !== password) {
              set({ isLoading: false });
              throw new Error('Invalid email or password');
            }

            const user = role ? { ...mockUser.user, role } : mockUser.user;
            set({
              user,
              token: `mock-jwt-token-${Date.now()}`,
              refreshToken: `mock-refresh-token-${Date.now()}`,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          // Fall back to mock data on error
          const mockUser = MOCK_USERS[email.toLowerCase()];
          if (!mockUser || mockUser.password !== password) {
            set({ isLoading: false });
            throw new Error('Invalid email or password');
          }

          const user = role ? { ...mockUser.user, role } : mockUser.user;
          set({
            user,
            token: `mock-jwt-token-${Date.now()}`,
            refreshToken: `mock-refresh-token-${Date.now()}`,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshSession: async () => {
        set({ isLoading: true });
        try {
          const response = await apiPost<{ token: string }>('/auth/refresh', {});
          if (response.success && response.data) {
            set({
              token: response.data.token,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      updateUser: (updates: Partial<User>) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: { ...state.user, ...updates, updatedAt: new Date() },
          };
        });
      },

      switchRole: (role: UserRole) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: { ...state.user, role },
          };
        });
      },
    }),
    {
      name: 'campus-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
