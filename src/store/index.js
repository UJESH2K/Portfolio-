import { create } from 'zustand'

export const useStore = create((set) => ({
    scrollProgress: 0,
    lenis: null,
    setScrollProgress: (progress) => set({ scrollProgress: progress }),
    setLenis: (lenis) => set({ lenis: lenis }),
}))
