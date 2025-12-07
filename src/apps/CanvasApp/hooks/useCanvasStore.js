// src/apps/CanvasApp/hooks/useCanvasStore.js
// Zustand store for Canvas state management

import { create } from 'zustand';

export const useCanvasStore = create((set) => ({
  // Canvas elements
  elements: [],
  selectedId: null,

  // Effects
  hueShift: 0, // 0-360 degrees

  // Actions - Elements
  addElement: (element) =>
    set((state) => ({
      elements: [
        ...state.elements,
        {
          id: `element-${Date.now()}-${Math.random()}`,
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          zIndex: state.elements.length,
          ...element,
        },
      ],
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  clearCanvas: () =>
    set({
      elements: [],
      selectedId: null,
    }),

  // Actions - Selection
  selectElement: (id) => set({ selectedId: id }),
  deselectElement: () => set({ selectedId: null }),

  // Actions - Layer Management
  bringToFront: (id) =>
    set((state) => {
      const maxZ = Math.max(...state.elements.map((el) => el.zIndex), 0);
      return {
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, zIndex: maxZ + 1 } : el
        ),
      };
    }),

  sendToBack: (id) =>
    set((state) => {
      const minZ = Math.min(...state.elements.map((el) => el.zIndex), 0);
      return {
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, zIndex: minZ - 1 } : el
        ),
      };
    }),

  // Actions - Effects
  setHueShift: (value) => set({ hueShift: value }),

  // Persistence
  loadState: (state) => set(state),

  getState: () => {
    const state = useCanvasStore.getState();
    return {
      elements: state.elements,
      hueShift: state.hueShift,
    };
  },
}));
