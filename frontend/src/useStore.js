import create from 'zustand';

export const useStore = create((set) => ({
    currentSentences: [],
    setSentences: (d) => set((state) => ({
        currentSentences: d
    })),

}));