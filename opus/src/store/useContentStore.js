import { create } from "zustand";

export const useContentStore = create((set) => ({
    exhibitions: [],
    musicals: [],
    goods: [],

    setExhibitions: (data) => set({ exhibitions: data }),
    setMusicals: (data) => set({ musicals: data }),
    setGoods: (data) => set({ goods: data }),
}));