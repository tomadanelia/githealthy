import { create } from "zustand";
import { persist } from "zustand/middleware";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useStore = create(
  persist(
    (set, get) => ({
      repoInfo: null,
      dashboardData: null,
      isLoading: false,
      error: null,
      user: null, 

      setRepoInfo: (info) => set({ repoInfo: info }),
      
      checkSession: async () => {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include' 
          });
          const data = await res.json();
          set({ user: data.user });
        } catch (e) {
          console.error("Session check failed", e);
        }
      },

      logout: async () => {
        await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: 'include' });
        set({ user: null, dashboardData: null });
      },

      fetchDashboardData: async (owner, repo) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include', 
            body: JSON.stringify({ owner, repo }),
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.details || err.error || "Fetch failed");
          }

          const data = await response.json();
          set({ dashboardData: data, repoInfo: { owner, repo }, isLoading: false, error: null });
        } catch (err) {
          set({ error: err.message, isLoading: false });
        }
      },

      expandedPrNumber: null,
      setExpandedPr: (n) => set({ expandedPrNumber: n }),
      toggleExpandedPr: (n) => set(s => ({ expandedPrNumber: s.expandedPrNumber === n ? null : n })),
      reset: () => set({ repoInfo: null, dashboardData: null, expandedPrNumber: null, isLoading: false, error: null }),
    }),
    {
      name: "github-pr-analyzer",
      partialize: (state) => ({ repoInfo: state.repoInfo, dashboardData: state.dashboardData, user: state.user }),
    }
  )
);