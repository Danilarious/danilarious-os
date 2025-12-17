## 2025-12-13 – Canvas mode + interaction fixes
- What changed: `src/App.jsx`, `src/apps/CanvasApp/*`, `docs/PRD-Canvas-2025-12-13.md`, `docs/PRD-Canvas.md`; Canvas now runs as a desktop-wide mode with sliding panels and isolate toggle; hue slider shows gradient + affects canvas with hue-cycle option; selection now shows handles + rotation; canvas drags no longer interfere with OS windows; state persists via localStorage.
- Decisions: Canvas is not a windowed app; desktop grid is the canvas surface; mobile icons stay in the iOS-style top grid (bottom-dock concept deprecated); exit Canvas restores normal desktop windows/icons.
- Open questions / TODOs: add selection hitbox affordance for tiny assets; add snap-to-grid toggle; reintroduce in-mode theme toggle; plan teardown hooks for future WebGL layer.
- Recommended next step: stub Danilarious Explorer (asset drawer) and kaleidoscope/WebGL layer wiring while keeping mode overlay architecture.

## 2025-12-13 – Explorer drawer + kaleidoscope placeholder
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`, `components/EffectsPanel.jsx`, `components/ExplorerDrawer.jsx`, `components/KaleidoscopeOverlay.jsx`, `hooks/useCanvasStore.js`, `docs/PRD-Canvas-2025-12-13.md`; added toggleable Explorer drawer stub, kaleidoscope overlay placeholder with stateful controls, and persisted kaleidoscope settings.
- Decisions: Explorer lives inside Canvas Mode as a sliding drawer (not an OS window); Kaleidoscope remains a placeholder overlay until WebGL is built; isolate mode hides Explorer and UI; state persistence now includes hue + kaleidoscope params.
- Open questions / TODOs: implement real WebGL mirror pipeline fed by Konva snapshot; add snap-to-grid and small-hitbox helpers; connect Explorer to admin-uploaded SVG packs and palettes.
- Recommended next step: scaffold WebGL pipeline surface (offscreen snapshot + effect canvas) and wire Explorer to accept external asset manifests.

## 2025-12-13 – WebGL pipeline stub
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `CanvasApp.jsx`, `docs/PRD-Canvas-2025-12-13.md`; replaced the old placeholder with a snapshot-based mirror canvas (2D fallback) wired to kaleidoscope settings.
- Decisions: Effects layer runs alongside the Konva stage using snapshots; keeps the same state hooks for a future GPU implementation.
- Open questions / TODOs: swap the fallback for an actual WebGL renderer; tune snapshot cadence and perf on large canvases; keep Explorer manifest-driven.
- Recommended next step: implement the GPU mirror pipeline and optionally remove the CSS overlay once WebGL replaces it.

## 2025-12-13 – WebGL mirror renderer
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `CanvasApp.jsx`, `docs/PRD-Canvas-2025-12-13.md`; implemented a GPU-backed mirror renderer (with 2D fallback) that consumes Konva snapshots, mirrors into rotating segments, and uses existing kaleidoscope controls.
- Decisions: Effects layer now renders via WebGL when available, falling back to 2D; continues to share Canvas Mode state and snapshot cadence.
- Open questions / TODOs: tune performance on large canvases, tighten snapshot cadence, and wire Explorer to manifest-driven assets.
- Recommended next step: profile the WebGL path, adjust cadence, and connect Explorer to external SVG manifests/upload pipeline.

## 2025-12-13 – Interaction polish + manifest Explorer
- What changed: `src/apps/CanvasApp/components/KonvaCanvas.jsx`, `components/EffectsPanel.jsx`, `hooks/useCanvasStore.js`, `components/WebGLMirrorCanvas.jsx`, `components/ExplorerDrawer.jsx`, `hooks/useAssetManifest.js`, `data/canvasManifest.js`, `docs/PRD-Canvas-2025-12-13.md`; added snap-to-grid toggle with adjustable grid size and enlarged hit areas for small assets; added mirror refresh cadence control; Explorer now reads a manifest-driven pack list with admin upload stub; WebGL mirror uses configurable snapshot cadence.
- Decisions: Grid snapping happens on drag end only; manifest remains static until backend upload/sanitization is built; WebGL cadence is adjustable (250–2000 ms) to balance perf vs fidelity.
- Open questions / TODOs: replace stub upload with real sanitized backend flow; feed Explorer from an external manifest service; profile WebGL mirror on large canvases and consider dynamic cadence; consider removing CSS overlay once WebGL path is stable.
- Recommended next step: implement backend upload/sanitization + manifest feed, then profile/tune the WebGL cadence under load.

## 2025-12-13 – Backend/manifest prep + auto cadence
- What changed: `public/assets/canvas/manifest.json`, `src/apps/CanvasApp/hooks/useAssetManifest.js`, `components/ExplorerDrawer.jsx`, `components/WebGLMirrorCanvas.jsx`, `components/EffectsPanel.jsx`, `hooks/useCanvasStore.js`, `components/KonvaCanvas.jsx`, `docs/PRD-Canvas-2025-12-13.md`; added remote/manifest ingestion with sanitization, stubbed admin upload flow, auto mirror cadence based on canvas size/segments, manual cadence slider retained, snap banner hint, and hid CSS overlay when WebGL is active.
- Decisions: Manifest is now loadable from `/assets/canvas/manifest.json` (sanitized) with local fallback; auto cadence adjusts snapshot interval (clamped) to balance perf; snap hint surfaces grid size; CSS overlay is suppressed when WebGL mirror is running.
- Open questions / TODOs: replace stub upload with real sanitized backend + persistent storage; expose manifest via admin service; profile WebGL mirror under heavy load; add visual grid snap affordance (e.g., highlight nearest grid).
- Recommended next step: implement backend upload + manifest API, then iterate on WebGL performance and snap affordances.

## 2025-12-13 – Rendering stabilization
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `components/SnapGridOverlay.jsx`, `CanvasApp.jsx`, `components/EffectsPanel.jsx`, `hooks/useCanvasStore.js`, `docs/PRD-Canvas-2025-12-13.md`; added visibility-aware snapshotting with auto cadence tuning, manual/auto toggle for mirror refresh, optional grid overlay tied to snap-to-grid, and HUD banner for snap state. Build re-verified.
- Decisions: Auto cadence remains default; mirror snapshots pause when the tab is hidden; grid overlay only appears when snapping is on to reinforce placement.
- Open questions / TODOs: deeper WebGL profiling on large canvases, dynamic overlay toggling once stable, potential removal of CSS overlay; continue toward backend manifest service.
- Recommended next step: profile WebGL under load and tune cadence/overlay removal; proceed with backend upload/sanitization and manifest API.

## 2025-12-13 – Render contract clarification
- What changed: Added `docs/RENDER-CONTRACT.md` capturing coordinate system, render order, timing/animation, isolate behavior, and export expectations for Canvas Mode. Build re-verified (no code changes).
- Decisions: Effects layers (WebGL mirror/CSS overlay/grid) are not baked into exports; Isolate hides UI only; auto cadence remains default with visibility-aware snapshots; backend/ingestion remain provisional pending a future contract aligned to this render behavior.
- Open questions / TODOs: Define export compositing if effects must be included; formalize backend/admin ingestion contract after render contract; profile WebGL under load per prior notes.
- Recommended next step: Agree on export compositing requirements (Konva + mirror) and then align backend/admin manifest/API design to the render contract.

## 2025-12-13 – Konva drag/drop fixes
- What changed: `src/apps/CanvasApp/components/KonvaCanvas.jsx`; aligned to canonical Konva interaction so shapes select on mousedown/tap with `cancelBubble`, remain always draggable, and stage deselect only triggers on empty clicks. Removed extra drag-stop logic that forced a second click; transformer hit handling left unobtrusive.
- Decisions: Keep snap-to-grid via dragBoundFunc; rely on Konva’s native drag lifecycle without manual stop hacks.
- Open questions / TODOs: Continue manual QA across browsers to ensure no regressions; consider adding automated interaction tests later.
- Recommended next step: Proceed with remaining Phase 1 sanity checks (undo/redo flows, multi-shape interactions) before moving toward Phase 2 UI work.

## 2025-12-13 – Undo/redo affordances (Phase 1 wrap)
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`, `hooks/useCanvasStore.js`; exposed history/future for UI state, wired undo/redo buttons into the existing Canvas control bar (disabled when unavailable), and kept keyboard shortcuts (Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z or Cmd/Ctrl+Y). History remains centralized/capped in the store.
- Decisions: Minimal utilitarian buttons only (no layout redesign); history cap retained; no backend/UI architecture changes beyond affordances.
- Open questions / TODOs: Manual dev run to re-verify undo/redo across add/move/rotate/scale/delete; consider automated interaction tests later.
- Recommended next step: Human verification of Phase 1 workflows, then proceed to Phase 2 UI architecture once confirmed.

## 2025-12-13 – Move undo fixes
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`, `components/KonvaCanvas.jsx`, `hooks/useCanvasStore.js`; added a recordSnapshot action and made drag moves/ends update positions without spamming history, while drag start records a single snapshot. Undo/redo now correctly revert move operations alongside other transforms.
- Decisions: Keep history centralized/capped; use recordSnapshot at drag start and history-aware updates only where meaningful; leave UI as-is.
- Open questions / TODOs: Manual dev pass to confirm move undo/redo across browsers; consider consolidating history triggers for other high-frequency actions if needed.
- Recommended next step: Run Phase 1 sanity tests (move undo/redo via keyboard/buttons) and, after confirmation, advance to Phase 2 UI architecture.

## 2025-12-13 – Clear button + single-gesture drop fix
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`, `components/KonvaCanvas.jsx`; added a Canvas Mode “Clear” control to wipe all elements; improved drag/drop so shapes release on a single mouse up/touch end (global pointer-up handler, drag bound snapping during move, stopDrag on end).
- Decisions: Snap remains on-drag; misaligned overlay stays removed; clear requires confirm; backend/ingestion untouched.
- Open questions / TODOs: Validate in `npm run dev` that “double click to drop” is resolved on all browsers; consider adding live position updates to avoid edge cases on very fast drags.
- Recommended next step: Manual sanity test (single-gesture placement/drop, clear) then continue Phase 1 polish if any regressions remain.

## 2025-12-13 – Phase 1 interaction fixes (placement, selection, undo, snap)
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`, `components/AssetLibrary.jsx`, `components/ExplorerDrawer.jsx`, `hooks/useCanvasStore.js`, `components/KonvaCanvas.jsx`, `components/EffectsPanel.jsx`; new shapes now spawn centered in the visible workspace (panel-aware) and are auto-selected; undo/redo stacks added with Cmd/Ctrl+Z (and Shift+Z/Y redo) covering add/move/rotate/scale; snap overlay removed to avoid misaligned grids while snap-on-drag-end remains; keyboard handling added; Explorer additions use the same centered spawn.
- Decisions: Default spawn centers within the usable viewport; snap overlay suppressed until alignment is solved; history capped (50) and cleared on undo/redo actions; ingest/backends remain untouched per phase gate.
- Open questions / TODOs: Verify undo stack under heavy transforms; consider optional grid overlay re-alignment to OS grid; stroke-width preservation on scale remains a nice-to-have.
- Recommended next step: Manual sanity run in `npm run dev` to validate interactions (single-gesture placement, selection with UI visible, undo) and then proceed toward Phase 2 UI architecture once stable.
