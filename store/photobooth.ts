import { create } from "zustand";

export type Screen = "lobby" | "viewfinder" | "darkroom" | "print-tray";

export type LayoutType = "strip-1x4" | "grid-2x2" | "polaroid-single";
export type FrameType = "minimalist-mono" | "vintage-floral" | "stamp-border";
export type FilmFilterType = "ilford-hp5" | "kodak-portra" | "fuji-superia";

export interface PhotoboothState {
  // Navigation
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;

  // Captured photos (base64 data URLs)
  photos: string[];
  addPhoto: (photo: string) => void;
  clearPhotos: () => void;

  // Darkroom selections
  selectedLayout: LayoutType;
  selectedFrame: FrameType;
  selectedFilter: FilmFilterType;
  setLayout: (layout: LayoutType) => void;
  setFrame: (frame: FrameType) => void;
  setFilter: (filter: FilmFilterType) => void;

  // Final composed image
  finalImageUrl: string | null;
  setFinalImageUrl: (url: string) => void;

  // Reset entire session
  resetSession: () => void;
}

const initialState = {
  currentScreen: "lobby" as Screen,
  photos: [],
  selectedLayout: "strip-1x4" as LayoutType,
  selectedFrame: "minimalist-mono" as FrameType,
  selectedFilter: "ilford-hp5" as FilmFilterType,
  finalImageUrl: null,
};

export const usePhotoboothStore = create<PhotoboothState>((set) => ({
  ...initialState,

  setScreen: (screen) => set({ currentScreen: screen }),

  addPhoto: (photo) =>
    set((state) => ({ photos: [...state.photos, photo] })),

  clearPhotos: () => set({ photos: [] }),

  setLayout: (layout) => set({ selectedLayout: layout }),

  setFrame: (frame) => set({ selectedFrame: frame }),

  setFilter: (filter) => set({ selectedFilter: filter }),

  setFinalImageUrl: (url) => set({ finalImageUrl: url }),

  resetSession: () => set(initialState),
}));
