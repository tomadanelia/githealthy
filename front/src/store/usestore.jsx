import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set, get) => ({
      repoInfo: null,
      setRepoInfo: (info) => set({ repoInfo: info }),
      clearRepoInfo: () => set({ repoInfo: null, dashboardData: null }),

      dashboardData: null,
      isLoading: false,
      error: null,

      setDashboardData: (data) =>
        set({
          dashboardData: data,
          error: null,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) =>
        set({
          error,
          isLoading: false,
        }),

      fetchDashboardData: async (owner, repo) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("http://localhost:3000/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ owner, repo }),
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
          }

          const data = await response.json();
          set({
            dashboardData: data,
            repoInfo: { owner, repo },
            isLoading: false,
            error: null,
          });

          return data;
        } catch (err) {
          set({
            error: err.message,
            isLoading: false,
          });
          throw err;
        }
      },

      expandedPrNumber: null,
      setExpandedPr: (prNumber) => set({ expandedPrNumber: prNumber }),
      clearExpandedPr: () => set({ expandedPrNumber: null }),
      toggleExpandedPr: (prNumber) => {
        const current = get().expandedPrNumber;
        set({ expandedPrNumber: current === prNumber ? null : prNumber });
      },

      reset: () =>
        set({
          repoInfo: null,
          dashboardData: null,
          expandedPrNumber: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "github-pr-analyzer",
      partialize: (state) => ({
        repoInfo: state.repoInfo,
        dashboardData: state.dashboardData,
      }),
    }
  )
);