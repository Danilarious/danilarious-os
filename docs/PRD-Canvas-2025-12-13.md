# Danilarious OS × Canvas — PRD Update (2025-12-13)

## What changed this session
- Canvas is now a **mode over the desktop** (no window chrome). The desktop grid is the canvas surface; panels slide over it; isolate hides UI.
- Canvas state (elements + hue settings) persists to `localStorage` and restores on entry/exit.
- Interaction fixes: canvas drags no longer tug the OS, selection shows corner handles + a rotation handle, hue shift is visible with a spectrum track and a hue-cycle toggle.
- New stubs: **Danilarious Explorer** toggleable drawer (asset packs placeholder) and **Kaleidoscope preview overlay** to anchor the future effects layer.
- WebGL mirror pipeline: GPU-backed mirror renderer (with 2D fallback) that snapshots the Konva stage and renders mirrored segments with rotation using the existing controls.
- Mobile note: the **iOS-style top-row icon layout is the correct mobile approach**. Older docs that mention a bottom dock are outdated and should be ignored.
- Interaction polish: snap-to-grid toggle with adjustable grid size; enlarged hit area for small assets.
- Performance control: mirror refresh cadence slider + auto mode that adjusts based on canvas size/segments.
- Visual affordance: optional grid overlay appears when snap-to-grid is enabled; snap banner shows active grid size.

## Current behavior snapshot
- Enter Canvas via the desktop icon → Canvas mode overlays the desktop (top bar remains). Desktop icons/windows pause.
- Panels: Asset Library (left) and Effects (right) slide in/out; you can hide both or enter Isolate (no UI, only canvas + a minimal exit control).
- Explorer drawer: toggleable bottom drawer with manifest-driven packs (local or remote JSON), admin upload stub (sanitization to be added), and palette placeholders.
- Canvas surface: full-viewport Konva stage on top of the grid background. Elements can be dragged, scaled, rotated with a bounding box and rotation handle.
- Effects: hue slider with spectrum gradient applies a live `hue-rotate()` filter to the stage; hue-cycle toggle animates hue over time. Layer controls remain per selection. Mirror cadence slider + auto mode allow perf tuning.
- Kaleidoscope preview: optional overlay (CSS) driven by segments + rotation speed; WebGL mirror layer: snapshot-based GPU renderer (falls back to 2D) that mirrors the Konva stage into rotating segments using the same state as the overlay.
- Interaction: snap-to-grid toggle (adjustable size) applied on drag end; enlarged hit areas for easier selection of tiny assets.
- Visual: grid overlay renders when snap is on; snap banner in HUD shows current grid size.
- Persistence/export: auto-saves to `localStorage` on change; export PNG still available.
- Exit Canvas restores normal desktop interaction and windows/icons.

## Architecture outline (mode-first)
- Canvas lives as a **mode overlay** (`CanvasApp` via `App.jsx`) instead of a window entry in `windows` state. The desktop background remains unchanged for continuity with other apps.
- UI layers are independent: sliding side panels, floating controls, and isolate mode that hides panels + helper UI.
- State: single Zustand store (`useCanvasStore`) holds elements, hue, mirror settings (auto/manual cadence), snap-to-grid; persisted to `localStorage`.
- Rendering: Konva stage for interaction; hue filter applied at the container level. Future effects (WebGL/kaleidoscope) can mount alongside the stage using the same mode overlay. A CSS kaleidoscope placeholder overlay is already wired to state (segments + rotation).
- Explorer: manifest-driven packs (static/remote JSON) with admin upload stub to be replaced by sanitized backend flow.

## Deferred / TODO
- Add visual affordance for selection hit area when assets are very small.
- Add snap-to-grid toggle to align with the desktop grid.
- Re-introduce a minimal in-mode toolbar theme toggle that respects OS themes.
- Formalize cleanup on unmount for future WebGL layer (current Konva is lightweight).

## Near-term outlines (not implemented)
- **Danilarious Explorer (asset window):**
  - Toggleable drawer/window that lists SVG packs by category with previews.
  - Supports dropping SVGs onto canvas and tagging for future search.
  - Respects Canvas mode (slides over desktop; does not create a new OS window).
- **Kaleidoscope (architecture-first):**
  - Secondary effects layer that reads a Konva snapshot, renders mirrored segments in WebGL.
  - Controls to set segment count, rotation speed, and export-ready preset sizes.
  - Keep Konva interaction as the source of truth; WebGL stays purely presentational.
- **Admin backend (outline):**
  - Endpoint or stub for SVG upload (single-user auth later), with category + tag metadata.
  - Sanitization step: strip scripts, enforce viewBox, restrict size/paths count.
  - File-based seed compatible with `public/assets/canvas` until a real service exists.

## Mobile stance (clarification)
- Use the current iOS-style home-screen placement for icons on mobile (top grid area). The previous “bottom dock” concept is deprecated and should be ignored.
- Other mobile edge cases (window bounds, density tweaks) can be revisited later.
