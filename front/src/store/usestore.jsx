import { create } from "zustand";


export const useStore = create((set) => ({
  repoInfo: null,
  setRepoInfo: (info) => set({ repoInfo: info }),

  dashboardData: null,
  setDashboardData: (data) => set({ dashboardData: data }),

  selectedPr: null,
  setSelectedPr: (pr) => set({ selectedPr: pr }),
}));
