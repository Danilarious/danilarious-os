// src/apps/CanvasApp/hooks/useCanvasStore.js
// Zustand store for Canvas state management

import { create } from 'zustand';

const HISTORY_LIMIT = 50;

const snapshotState = (state) => ({
  elements: state.elements,
  selectedId: state.selectedId,
});

export const useCanvasStore = create((set) => ({
  // Canvas elements
  elements: [],
  selectedId: null,
  history: [],
  future: [],

  // Effects
  hueShift: 0, // 0-360 degrees
  hueCycle: false,
  kaleidoscopeEnabled: false,
  kaleidoscopeSegments: 6,
  kaleidoscopeRotation: 0.2, // deg/sec
  mirrorSnapshotMs: 900,
  mirrorSnapshotAuto: true,
  snapToGrid: false,
  gridSize: 24,

  // Actions - Elements
  addElement: (element) => {
    let createdId = null;
    set((state) => {
      const newId = `element-${Date.now()}-${Math.random()}`;
      createdId = newId;
      const newElement = {
        id: newId,
        x: 100,
        y: 100,
        rotation: 0,
        scale: 1,
        zIndex: state.elements.length,
        ...element,
      };
      const history = [...state.history, snapshotState(state)].slice(
        -HISTORY_LIMIT
      );
      return {
        elements: [...state.elements, newElement],
        selectedId: newId,
        history,
        future: [],
      };
    });
    return createdId;
  },

  updateElement: (id, updates, opts = { recordHistory: true }) =>
    set((state) => {
      const history = opts.recordHistory
        ? [...state.history, snapshotState(state)].slice(-HISTORY_LIMIT)
        : state.history;
      const future = opts.recordHistory ? [] : state.future;
      return {
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
        history,
        future,
      };
    }),

  recordSnapshot: () =>
    set((state) => ({
      history: [...state.history, snapshotState(state)].slice(-HISTORY_LIMIT),
      future: [],
    })),

  removeElement: (id) =>
    set((state) => {
      const history = [...state.history, snapshotState(state)].slice(
        -HISTORY_LIMIT
      );
      return {
        elements: state.elements.filter((el) => el.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
        history,
        future: [],
      };
    }),

  clearCanvas: () =>
    set({
      elements: [],
      selectedId: null,
      history: [],
      future: [],
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
  nudgeHue: (delta) =>
    set((state) => ({
      hueShift: ((state.hueShift + delta) % 360 + 360) % 360,
    })),
  setHueCycle: (value) => set({ hueCycle: value }),
  setKaleidoscopeEnabled: (value) => set({ kaleidoscopeEnabled: value }),
  setKaleidoscopeSegments: (value) => set({ kaleidoscopeSegments: value }),
  setKaleidoscopeRotation: (value) => set({ kaleidoscopeRotation: value }),
  setMirrorSnapshotMs: (value) => set({ mirrorSnapshotMs: value }),
  setMirrorSnapshotAuto: (value) => set({ mirrorSnapshotAuto: value }),
  setSnapToGrid: (value) => set({ snapToGrid: value }),
  setGridSize: (value) => set({ gridSize: value }),

  // Undo / Redo
  undo: () =>
    set((state) => {
      if (!state.history.length) return state;
      const previous = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      const futureEntry = snapshotState(state);
      return {
        elements: previous.elements,
        selectedId: previous.selectedId,
        history: newHistory,
        future: [futureEntry, ...state.future].slice(0, HISTORY_LIMIT),
      };
    }),
  redo: () =>
    set((state) => {
      if (!state.future.length) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      const historyEntry = snapshotState(state);
      return {
        elements: next.elements,
        selectedId: next.selectedId,
        history: [...state.history, historyEntry].slice(-HISTORY_LIMIT),
        future: newFuture,
      };
    }),

  // Persistence
  loadState: (state) => set(state),

  getState: () => {
    const state = useCanvasStore.getState();
    return {
      elements: state.elements,
      hueShift: state.hueShift,
      hueCycle: state.hueCycle,
      kaleidoscopeEnabled: state.kaleidoscopeEnabled,
      kaleidoscopeSegments: state.kaleidoscopeSegments,
      kaleidoscopeRotation: state.kaleidoscopeRotation,
      mirrorSnapshotMs: state.mirrorSnapshotMs,
      mirrorSnapshotAuto: state.mirrorSnapshotAuto,
      snapToGrid: state.snapToGrid,
      gridSize: state.gridSize,
    };
  },
}));
