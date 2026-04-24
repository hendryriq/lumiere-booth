import { create } from "zustand";

export type Screen = "lobby" | "viewfinder" | "darkroom" | "print-tray";

export type LayoutType = "strip-1x4" | "grid-2x2" | "polaroid-single" | "hero-collage" | "strip-4x1" | "cinematic-reel";
export type FrameType = "minimalist-mono" | "vintage-floral" | "stamp-border";
export type FilmFilterType = "ilford-hp5" | "kodak-portra" | "fuji-superia";

export interface PhotoboothState {
  // Navigation
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;

  // Captured photos (base64 data URLs)
  photos: string[];
  videos: string[]; // WebM blobs for Motion Print
  addPhoto: (photo: string) => void;
  addVideo: (video: string) => void;
  clearPhotos: () => void;
  undoLastPhoto: () => void;
  swapPhotos: (index1: number, index2: number) => void;

  // Darkroom selections
  selectedLayout: LayoutType;
  selectedFrame: FrameType;
  selectedFilter: FilmFilterType;
  customText: string;
  setLayout: (layout: LayoutType) => void;
  setFrame: (frame: FrameType) => void;
  setFilter: (filter: FilmFilterType) => void;
  setCustomText: (text: string) => void;

  // Final composed image
  finalImageUrl: string | null;
  setFinalImageUrl: (url: string) => void;

  // Reset entire session
  resetSession: () => void;
}

const initialState = {
  currentScreen: "lobby" as Screen,
  photos: [],
  videos: [],
  selectedLayout: "strip-1x4" as LayoutType,
  selectedFrame: "minimalist-mono" as FrameType,
  selectedFilter: "ilford-hp5" as FilmFilterType,
  customText: "LUMIÈRE BOOTH — 2026",
  finalImageUrl: null,
};

export const usePhotoboothStore = create<PhotoboothState>((set) => ({
  ...initialState,

  setScreen: (screen) => set({ currentScreen: screen }),

  addPhoto: (photo) =>
    set((state) => ({ photos: [...state.photos, photo] })),

  addVideo: (video) =>
    set((state) => ({ videos: [...state.videos, video] })),

  clearPhotos: () => set({ photos: [], videos: [] }),

  undoLastPhoto: () =>
    set((state) => ({
      photos: state.photos.slice(0, -1),
      videos: state.videos.slice(0, -1),
    })),

  swapPhotos: (index1, index2) =>
    set((state) => {
      const newPhotos = [...state.photos];
      const newVideos = [...state.videos];
      
      const tempPhoto = newPhotos[index1];
      newPhotos[index1] = newPhotos[index2];
      newPhotos[index2] = tempPhoto;
      
      const tempVideo = newVideos[index1];
      newVideos[index1] = newVideos[index2];
      newVideos[index2] = tempVideo;
      
      return { photos: newPhotos, videos: newVideos };
    }),

  setLayout: (layout) => set({ selectedLayout: layout }),

  setFrame: (frame) => set({ selectedFrame: frame }),

  setFilter: (filter) => set({ selectedFilter: filter }),

  setCustomText: (text) => set({ customText: text }),

  setFinalImageUrl: (url) => set({ finalImageUrl: url }),

  resetSession: () => set(initialState),
}));
