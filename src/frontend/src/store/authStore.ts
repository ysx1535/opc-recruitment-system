import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // 登录
      login: async (email: string, password: string) => {
        const data = await authAPI.login({ email, password });
        localStorage.setItem('access_token', data.accessToken);
        set({
          user: data.user,
          token: data.accessToken,
          isAuthenticated: true,
        });
      },

      // 注册
      register: async (email: string, password: string, name: string) => {
        const data = await authAPI.register({ email, password, name });
        localStorage.setItem('access_token', data.accessToken);
        set({
          user: data.user,
          token: data.accessToken,
          isAuthenticated: true,
        });
      },

      // 登出
      logout: () => {
        localStorage.removeItem('access_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // 检查认证状态
      checkAuth: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        try {
          const user = await authAPI.me();
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          localStorage.removeItem('access_token');
          set({ isAuthenticated: false, user: null, token: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
