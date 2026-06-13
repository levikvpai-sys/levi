import { create } from "zustand";
import type { Campaign, CampaignOutput, AgentRun, CampaignStore } from "@/types";

export const useCampaignStore = create<CampaignStore>((set) => ({
  campaigns: [],
  currentCampaign: null,
  outputs: [],
  agentRuns: [],
  isLoading: false,
  error: null,

  setCampaigns: (campaigns) => set({ campaigns }),

  setCurrentCampaign: (campaign) => set({ currentCampaign: campaign }),

  addCampaign: (campaign) =>
    set((state) => ({ campaigns: [campaign, ...state.campaigns] })),

  updateCampaign: (id, updates) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      currentCampaign:
        state.currentCampaign?.id === id
          ? { ...state.currentCampaign, ...updates }
          : state.currentCampaign,
    })),

  addOutput: (output) =>
    set((state) => ({ outputs: [output, ...state.outputs] })),

  updateOutput: (id, updates) =>
    set((state) => ({
      outputs: state.outputs.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    })),

  setAgentRun: (run) =>
    set((state) => {
      const existing = state.agentRuns.findIndex((r) => r.id === run.id);
      if (existing >= 0) {
        const updated = [...state.agentRuns];
        updated[existing] = run;
        return { agentRuns: updated };
      }
      return { agentRuns: [run, ...state.agentRuns] };
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));

export default useCampaignStore;
