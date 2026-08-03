import { create } from "zustand";
import { authAPI } from "./client.js";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  },

  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { token, data } = response.data;
      set({ token, user: data, loading: false });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message, loading: false });
      throw error;
    }
  },

  register: async (data, file) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.register(data, file);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      set({ error: message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout errors
    } finally {
      set({ user: null, token: null });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: async () => {
    set({ loading: true });
    try {
      const response = await authAPI.getCurrentUser();
      set({ user: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ user: null, token: null, loading: false });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  },

  isAuthenticated: () => {
    const state = useAuthStore.getState();
    return !!state.token && !!state.user;
  },

  isAdmin: () => {
    const state = useAuthStore.getState();
    return state.user?.role === "admin" || state.user?.role === "super-admin";
  }
}));
