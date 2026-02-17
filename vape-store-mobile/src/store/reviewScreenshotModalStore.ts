import { create } from 'zustand';

export interface ReviewScreenshotModalState {
  url: string | null;
  caption?: string;
  open: (url: string, caption?: string) => void;
  close: () => void;
}

export const useReviewScreenshotModalStore = create<ReviewScreenshotModalState>((set) => ({
  url: null,
  caption: undefined,
  open: (url, caption) => set({ url, caption }),
  close: () => set({ url: null, caption: undefined }),
}));
