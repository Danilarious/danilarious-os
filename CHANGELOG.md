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

## 2025-12-13 – Phase 2 UI architecture (tool rail + floating windows)
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`, `components/ExplorerDrawer.jsx`; added a fixed left tool rail (Select/Move + Shapes flyout using existing assets), converted Explorer and Effects into floating draggable windows with z-order focus, and retained existing canvas controls/undo/redo without behavior changes. Explorer content adjusted to window-friendly layout.
- Decisions: No new tools or canvas logic; “Hide Panels” now hides floating windows; rail is structural only; canvas interactions/render contract unchanged.
- Open questions / TODOs: Window docking/resizing polish; outside-click close for flyout; mobile positioning; potential z-order manager if more windows arrive.
- Recommended next step: Human verification in `npm run dev` (canvas unchanged, undo/redo intact, Explorer/Effects windows draggable/show/hide, tool rail fixed), then proceed to Phase 3 export decisions or Phase 2b window polish.

## 2025-12-13 – Phase 2 refinements (rail, windows, sliders)
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`, `components/ExplorerDrawer.jsx`; fixed tool rail to the left edge and consolidated Explorer/Effects toggles into the rail (with active states), removed redundant top toggles, converted window drag to header-only to prevent sliders from dragging windows, and set Effects default placement to the right. Slider interactions now stay smooth without moving windows.
- Decisions: No canvas/logic changes; rail remains a structural container; Explorer/Effects are simple toggles; docking/resizing deferred.
- Open questions / TODOs: Add outside-click close for flyout/windows, polish window snapping/docking later, adjust mobile placement if needed.
- Recommended next step: Manual dev verification (sliders smooth, rail fixed, windows toggle/drag correctly) then proceed to Phase 3 export planning or Phase 2b window polish.

## 2025-12-13 – Phase 2 alignment (rail toggles, window hitboxes)
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`, `components/EffectsPanel.jsx`; fixed tool rail (Explorer/FX toggles with distinct active states), removed redundant top controls, constrained window drag to header with proper pointer handling, and added pointer stop on sliders to prevent window dragging. Effects window defaults to right-side placement; window hitboxes limited to visible bounds to keep canvas clicks reliable near windows.
- Decisions: Tool rail is the single control surface for Explorer/FX; canvas behavior/undo unchanged; deferred docking/resizing/collapse.
- Open questions / TODOs: Add outside-click close for flyout/windows; consider z-order manager and docking in later polish; verify pointer behavior across browsers.
- Recommended next step: Manual Phase 2 QA in `npm run dev` (canvas clickability near windows, slider smoothness, rail toggles) then proceed to Phase 3 or Phase 2b polish.

## 2025-12-13 – Phase 2 toggle semantics + hit-testing hardening
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`; made top control bars pointer-events-safe so they don’t block canvas clicks, constrained window interaction to visible chrome/content only, and ensured Explorer/FX rail buttons reflect open state exclusively. Bottom helper no longer intercepts clicks.
- Decisions: Window visibility is the single source of truth for rail toggle state; non-interactive overlays are pointer-events-none; no canvas/undo changes.
- Open questions / TODOs: Confirm Phase 2 with manual dev QA across window edges; defer docking/resizing/collapse and persistent positions.
- Recommended next step: Run Phase 2 verification in `npm run dev`; if clean, Phase 2 is complete and can proceed to Phase 3 export decisions.

## 2025-12-13 – Phase 2 toolbar states
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`; added distinct hover/active/selected styling for tool buttons and window toggles, and visually separated tools from window toggles in the rail. Explorer/FX toggles now read as persistent window states (Explorer uses a distinct active color).
- Decisions: No new tools or behavior; styles only to make state obvious; canvas interactions unchanged.
- Open questions / TODOs: Validate state visibility across devices; tune color contrast if needed.
- Recommended next step: Manual dev verification that tool buttons are exclusive and window toggles persist correctly; if clean, Phase 2 can close.

## 2025-12-13 – Persistent toolbar selection styling
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`, `src/App.css`; added explicit `.is-selected` class bindings for tool and window toggle buttons and defined persistent CSS styles that override hover/active without relying on focus. Explorer has a distinct selected color.
- Decisions: Selection state is now purely class-driven (`activeTool`, `explorerOpen`, `effectsOpen`); hover/active remain additive and do not override selection.
- Open questions / TODOs: Confirm visual contrast on all displays; consider consolidating legacy App.css defaults later.
- Recommended next step: Manual dev verification that selected states persist after click and toggles behave as true windows; if clean, Phase 2 can close.

## 2025-12-13 – Tailwind-selected toolbar states
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`, `src/App.css`; replaced `.is-selected` styling with explicit Tailwind conditional classes so selected state persists regardless of utility precedence. Removed now-unused `.is-selected` CSS rules.
- Decisions: Selected/hover/active states are now fully expressed in Tailwind class strings; explorer uses its distinct active color; no behavior changes.
- Open questions / TODOs: Visual QA for contrast consistency across devices.
- Recommended next step: Manual dev verification that tool/FX/Explorer buttons retain persistent selected state after click; if clean, Phase 2 can close.

## 2025-12-13 – Phase 2.5 tool semantics lock-in
- What changed: `src/apps/CanvasApp/CanvasApp.jsx`, `components/KonvaCanvas.jsx`, `hooks/useCanvasStore.js`; introduced a Remove tool as a formal mouse mode (click deletes, undoable), reclassified Shapes as a flyout-only toggle (no tool state), and separated tools/flyouts/window toggles in the rail with clear dividers. Explorer/FX toggles now share a single active color.
- Decisions: Exactly one tool remains active at all times (default Select); flyouts do not affect tool state; window toggles are multi-select and reflect visibility only; no canvas rendering/effects changes.
- Open questions / TODOs: Manual dev verification of tool/flight/toggle semantics and remove tool undo/redo; consider cursor style tweak if needed.
- Recommended next step: After human verification, Phase 2.5 is complete and Phase 3 is unlocked (not started).

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

## 2025-12-13 – CanvasApp crash fix
- Fix: CanvasApp runtime crash caused by toolbar semantic refactor (ForwardRef render error).

## 2025-12-13 – Phase 3 tool system formalization
- What changed: `src/apps/CanvasApp/tools/toolRegistry.js`, `src/apps/CanvasApp/components/KonvaCanvas.jsx`, `src/apps/CanvasApp/CanvasApp.jsx`; introduced a formal tool registry (ids, cursors, handlers, button styles), routed tool behavior through the registry, and kept Remove tool behavior explicit and undoable.
- Decisions: Tool behavior is now defined centrally and selected via `activeTool`; flyouts/windows remain independent of tool state; no render/export changes.
- Open questions / TODOs: Add future tool definitions (draw, shape creation) into the registry when Phase 4 begins; consider finer cursor variants if needed.
- Recommended next step: Run Phase 3 manual verification (dev + build) and then proceed to Phase 4 extension points after review.

## 2025-12-13 – Keyboard delete restored
- Fix: Delete/Backspace removes selected element again (undoable) while ignoring inputs.

## 2025-12-26 – Phase 3 closeout + Phase 4 asset packs kickoff
- What changed: `src/data/canvasAssetPacks.js`, `src/apps/CanvasApp/hooks/useAssetManifest.js`, `src/apps/CanvasApp/components/ExplorerDrawer.jsx`, `src/apps/CanvasApp/CanvasApp.jsx`, `src/apps/CanvasApp/components/AssetLibrary.jsx`, `docs/PHASES.md`, `docs/PRD-Canvas.md`; Phase 3 marked complete in docs; asset packs centralized in a file-based catalog and Explorer now renders pack metadata and assets from that source.
- Decisions: Use a single local asset pack catalog as the source of truth; keep Explorer upload as a stub; no backend/admin or export changes in this slice.
- Open questions / TODOs: Confirm manual QA checklist in `npm run dev`; decide how/when to reintroduce export truth work after asset pack foundation.
- Recommended next step: After manual verification, continue Phase 4 by refining pack metadata (scale/anchor usage) and Explorer UX without introducing backend dependencies.

## 2025-12-26 – Phase 4 pack defaults + Explorer filter
- What changed: `src/data/canvasAssetPacks.js`, `src/apps/CanvasApp/CanvasApp.jsx`, `src/apps/CanvasApp/components/ExplorerDrawer.jsx`, `src/apps/CanvasApp/components/AssetLibrary.jsx`, `docs/PHASES.md`, `docs/PRD-Canvas.md`; asset default scale/rotation now applies on spawn; Explorer displays pack descriptions and includes a text filter.
- Decisions: Defaults are applied at add time only; anchor metadata is stored but not yet used in transforms; filter is client-side only.
- Open questions / TODOs: Consider how per-asset anchor should affect transform pivot in future; evaluate search behavior for large packs.
- Recommended next step: Extend pack metadata usage (anchor/pivot) once interaction behavior is locked, without adding backend dependencies.

## 2025-12-26 – Phase 4.1 PNG export with effect compositing
- What changed: `src/apps/CanvasApp/utils/export.js`, `src/apps/CanvasApp/CanvasApp.jsx`, `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `docs/RENDER-CONTRACT.md`; export now composites stage + mirror canvas and bakes hue rotation, excluding UI chrome.
- Decisions: Export uses a composite canvas with screen blend for mirror output; CSS overlays remain excluded; isolate mode does not alter export layers.
- Open questions / TODOs: Validate mirror blend/opacity parity on all browsers; decide if export pixel ratio should be user-configurable.
- Recommended next step: Manual QA export comparisons (effects on/off, isolate on/off) before any GIF work.

## 2025-12-26 – Export feedback + fallback download
- Fix: Export button now shows progress/confirmation and falls back to dataURL download if blob creation fails.

## 2025-12-26 – Export includes kaleidoscope buffer
- Fix: WebGL mirror canvas preserves its drawing buffer so PNG export can composite the kaleidoscope layer.

## 2025-12-26 – Kaleidoscope source hiding + even segments + square export
- What changed: `src/apps/CanvasApp/components/KonvaCanvas.jsx`, `src/apps/CanvasApp/CanvasApp.jsx`, `src/apps/CanvasApp/hooks/useCanvasStore.js`, `src/apps/CanvasApp/components/EffectsPanel.jsx`, `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `src/apps/CanvasApp/utils/export.js`, `docs/RENDER-CONTRACT.md`; source shapes are hidden when kaleidoscope is enabled, segments are clamped to even values, and PNG export uses a square canvas with mirror-only output.
- Decisions: Odd segment counts are disallowed for stability; kaleidoscope export is content-centered with light padding; source layer is treated as input-only when mirror is active.
- Open questions / TODOs: Decide whether to enable editing while source layer is hidden; evaluate hue shift application for mirror output in live view.
- Recommended next step: Manual export QA for kaleidoscope on/off and confirm square output sizing on varied aspect ratios.

## 2025-12-26 – Hue shift applied to kaleidoscope view
- Fix: WebGL mirror canvas now inherits hue shift so live kaleidoscope matches export color shift.

## 2025-12-26 – Kaleidoscope export sizing fix
- Fix: Kaleidoscope exports now compute square size from content radius (center-to-bounds) to avoid viewport-shaped output and excessive padding.

## 2025-12-26 – Export radius guardrails
- Fix: Export sizing now tolerates missing/invalid bounds so kaleidoscope export does not error.

## 2025-12-26 – Kaleidoscope export render path
- Fix: Kaleidoscope export now renders a square mirror output from the stage snapshot (with rotation), avoiding viewport clipping.

## 2025-12-26 – Kaleidoscope export parity fix
- Fix: Kaleidoscope exports now use base-size square bounds and bake hue shift into the mirror source to match live colors.

## 2025-12-26 – Kaleidoscope export render fallback
- Fix: Kaleidoscope export now renders with source-over compositing and explicit scaling to avoid blank output.

## 2025-12-26 – Kaleidoscope export centering fix
- Fix: Kaleidoscope export no longer applies stage offset when rendering the mirror wedges, preventing blank output.

## 2025-12-26 – Kaleidoscope export parity (fallback renderer)
- Fix: Export now uses the same wedge mirroring logic as the 2D fallback to match the live kaleidoscope geometry.

## 2025-12-26 – Kaleidoscope export parity (WebGL path)
- Fix: Export now renders the kaleidoscope via a WebGL pass (shader-matched) with a 2D fallback, aligning output to the live mirror.

## 2025-12-26 – Kaleidoscope lens editing + rotation model
- What changed: `src/apps/CanvasApp/utils/kaleidoscopeLens.js`, `src/apps/CanvasApp/components/KonvaCanvas.jsx`, `src/apps/CanvasApp/components/KaleidoscopeOverlay.jsx`, `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `src/apps/CanvasApp/components/EffectsPanel.jsx`, `src/apps/CanvasApp/hooks/useCanvasStore.js`, `src/apps/CanvasApp/CanvasApp.jsx`; added shared lens geometry, clipped Konva editing to the lens, and moved rotation to lens orientation (not output spin).
- Decisions: Kaleidoscope rotation is now a static lens angle in degrees; Konva remains interactive inside the lens while mirror output stays visible; snapshots can be requested on transform end.
- Open questions / TODOs: Confirm interaction feel when editing outside the lens; consider adding a subtle dim outside the wedge for clarity.
- Recommended next step: Manual QA for kaleidoscope editing (select/drag/transform inside wedge) and export parity.

## 2025-12-26 – Kaleidoscope source layer snapshots
- Fix: WebGL mirror and export now capture from a hidden source layer (unclipped) to keep mirror parity while editing through the clipped lens.

## 2025-12-26 – Kaleidoscope lens rotation semantics
- Fix: Lens rotation now rotates sampling orientation without spinning the final mirrored output (WebGL + export + 2D fallback).

## 2025-12-26 – Lens wedge alignment
- Fix: Lens triangle is offset by half a segment so the visible wedge matches the kaleidoscope sampling orientation.

## 2025-12-26 – Canvas hit testing tightened
- Fix: Shape hit regions now use the actual image silhouette (no padded bounding box), preventing off-shape selection conflicts.

## 2025-12-26 – Canvas hit testing restored
- Fix: Restored rectangle-based hit regions to keep shapes selectable while avoiding padded bounds.

## 2025-12-26 – Canvas hit order
- Fix: Render order now respects topmost z-index for hit detection, improving selection of lower-layer shapes.

## 2025-12-26 – Selection reliability cleanup
- Fix: Hidden source-layer ids are now unique and render order restored to avoid selection ambiguity.

## 2025-12-26 – Transformer hit tuning
- Fix: Transformer border hit area no longer intercepts clicks, improving selection of nearby shapes.

## 2025-12-26 – Phase 4 hit-testing audit + anchor defaults
- What changed: `src/apps/CanvasApp/components/KonvaCanvas.jsx`, `src/apps/CanvasApp/CanvasApp.jsx`, `src/apps/CanvasApp/components/AssetLibrary.jsx`, `src/apps/CanvasApp/components/ExplorerDrawer.jsx`; image hit testing now uses the image alpha (instead of padded bounds) to improve selection reliability, and asset anchor metadata now flows into spawn + Konva offsets for pivot defaults.
- Decisions: Prioritized pixel-accurate hit regions to avoid top-layer bounding boxes stealing clicks; anchor defaults remain data-driven with a center fallback.
- Open questions / TODOs: Validate selection reliability with dense, overlapping shapes and confirm whether further hit tuning is needed for tiny assets.
- Recommended next step: Continue Phase 4 metadata usage by defining per-pack anchor/pivot guidance and evaluating any remaining selection edge cases.

## 2025-12-26 – Hit proxy selection + uniform transforms
- What changed: `src/apps/CanvasApp/components/KonvaCanvas.jsx`; introduced a cached hit-proxy image per element for alpha-accurate selection without caching the visible art, and constrained transformer anchors to corners with keepRatio for uniform scaling.
- Decisions: Decoupled hit testing from rendering to avoid pixelation during transforms; uniform scaling is now the default (side anchors disabled).
- Open questions / TODOs: Confirm selection reliability with large overlapping stacks and verify proxy opacity does not introduce visible artifacts.
- Recommended next step: Run a quick manual QA pass on selection + transforms, then resume Phase 4 metadata refinements.

## 2025-12-26 – Kaleidoscope live/export parity (wedge fill + opacity)
- What changed: `src/apps/CanvasApp/utils/export.js`, `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`; export now clips the base canvas to the wedge gap before compositing the mirror, and the live mirror canvas/fallback render at full opacity with normal blend to avoid the lighter overlay look.
- Decisions: Mirror output stays `source-over` with full opacity; wedge gap is filled only by the clipped source canvas.
- Open questions / TODOs: Confirm offscreen shapes (top/bottom) mirror correctly in live view after wedge clipping changes.
- Recommended next step: Manual QA for kaleidoscope on/off with a shape crossing the top/bottom edges and verify export/live parity.

## 2025-12-26 – Kaleidoscope export scaling parity
- What changed: `src/apps/CanvasApp/utils/export.js`; export now pads the source canvas to the mirror output size before sampling, so kaleidoscope geometry matches live scale.
- Decisions: Export samples a padded source texture centered in the output square to preserve on-screen scale.
- Open questions / TODOs: Verify export parity for large canvases at multiple segment counts.
- Recommended next step: Manual export check against live for a dense scene with large shapes near edges.

## 2025-12-26 – Anchor offset stabilization for new assets
- What changed: `src/apps/CanvasApp/components/KonvaCanvas.jsx`; stabilized anchor offsets on image load by compensating position to prevent jumps, and forced transformer refresh after image load to avoid tiny initial bounds.
- Decisions: Keep visual position stable when offsets resolve post-load; transformer is explicitly refreshed when a selected image finishes loading.
- Open questions / TODOs: Verify this fully removes initial tiny-bounds selection on slow image loads.
- QA checklist: not run (manual verification needed: add new shape → first-click selection normal; no jump on load; kaleidoscope on/off).

## 2025-12-26 – Kaleidoscope lens flash cleanup
- What changed: `src/apps/CanvasApp/components/KaleidoscopeOverlay.jsx`; removed the lens fill and kept a non-scaling stroke to prevent a black flash when kaleidoscope mode toggles.
- Decisions: Lens overlay remains visible as an outline only to avoid fill-related flicker.
- Open questions / TODOs: Confirm this resolves the flash on all browsers; reintroduce a subtle fill only if it can be made stable.
- QA checklist: not run (manual verification needed: toggle kaleidoscope on/off and watch for lens flicker).

## 2025-12-26 – Kaleidoscope mirror readiness gating
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`; mirror canvas now stays transparent until the first snapshot texture is ready, preventing initial flash when enabling kaleidoscope.
- Decisions: Prefer brief invisibility over a one-frame flash on enable.
- Open questions / TODOs: Confirm no visible delay feels jarring on slow machines; consider a subtle fade-in later if needed.
- QA checklist: not run (manual verification needed: toggle kaleidoscope on/off and on initial load).

## 2025-12-26 – Kaleidoscope rotation knob + auto-rotate
- What changed: `src/apps/CanvasApp/components/EffectsPanel.jsx`, `src/apps/CanvasApp/hooks/useCanvasStore.js`, `src/apps/CanvasApp/CanvasApp.jsx`, `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`; replaced the rotation slider with a knob that supports continuous rotation, added auto-rotate toggle, and normalized rotation math in the mirror renderer.
- Decisions: Auto-rotate runs while kaleidoscope is enabled; rotation value can exceed 360° but is normalized at render time.
- Open questions / TODOs: Consider exposing auto-rotate speed control if needed.
- QA checklist: not run (manual verification needed: knob drag, auto-rotate toggle, kaleidoscope on/off).

## 2025-12-26 – Lens rotation normalization + hue knob
- What changed: `src/apps/CanvasApp/utils/kaleidoscopeLens.js`, `src/apps/CanvasApp/components/EffectsPanel.jsx`; normalized lens rotation math to match mirror output when rotation exceeds 360°, and replaced the hue slider with a conic-gradient hue knob.
- Decisions: Lens rotation is always normalized for overlay/clip alignment; hue shift remains cyclic with a wraparound knob.
- Open questions / TODOs: Verify export parity with kaleidoscope on/off after rotation normalization.
- QA checklist: not run (manual verification needed: lens alignment, export parity, hue knob drag).

## 2025-12-26 – Lens wedge alignment (rotation offset)
- What changed: `src/apps/CanvasApp/utils/kaleidoscopeLens.js`; removed the half-segment offset so the visible lens wedge aligns with the kaleidoscope sampling orientation.
- Decisions: Lens rotation now maps directly to the mirror rotation without an extra half-segment shift.
- Open questions / TODOs: Confirm alignment across several segment counts (8, 12, 16).
- QA checklist: not run (manual verification needed: compare wedge to mirror output).

## 2025-12-26 – Lens wedge alignment (sector bounds)
- What changed: `src/apps/CanvasApp/utils/kaleidoscopeLens.js`; lens triangle now spans the sector bounds (rotation to rotation+segment angle) to match the mirror’s wedge mapping.
- Decisions: Lens preview reflects the actual mirrored sector rather than a symmetric wedge.
- Open questions / TODOs: Validate alignment across segment counts and rotation angles.
- QA checklist: not run (manual verification needed: compare wedge to mirror output at several rotations).

## 2025-12-26 – Kaleidoscope rotation alignment (shader + fallback)
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `src/apps/CanvasApp/utils/export.js`; rotation now offsets the sector angle in the mirror shader and 2D fallback, keeping the lens wedge aligned across live view and export.
- Decisions: Rotation is applied to wedge orientation (theta) rather than rotating the sampled vector post-mirror.
- Open questions / TODOs: Re-verify export parity at multiple segment counts.
- QA checklist: not run (manual verification needed: lens alignment at 0/45/90°, export match).

## 2025-12-26 – Lens model unification + debug overlay
- What changed: `src/apps/CanvasApp/utils/kaleidoscopeLens.js`, `src/apps/CanvasApp/components/KaleidoscopeOverlay.jsx`, `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`; introduced a canonical lens model (start/end sector), updated overlay rays to match it, and added a dev-only debug overlay/logging toggle (`?debugLens`).
- Decisions: Sector bounds are [rotation, rotation+segmentAngle] everywhere; overlay draws rays only (no fill) and uses the shared model.
- Open questions / TODOs: Confirm wedge alignment at non-cardinal rotations across segment counts; remove debug logs once verified.
- QA checklist: not run (manual verification needed: 8/12/14/16 segments at 45°/80°/123°; export parity).

## 2025-12-26 – Kaleidoscope lens canonicalization + UI control fixes
- What changed: `src/apps/CanvasApp/utils/kaleidoscopeLens.js`, `src/apps/CanvasApp/components/KaleidoscopeOverlay.jsx`, `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `src/apps/CanvasApp/utils/export.js`, `src/apps/CanvasApp/components/EffectsPanel.jsx`, `src/apps/CanvasApp/CanvasApp.jsx`; unified lens model (sector bounds + rays), aligned shader/fallback/export sampling to that model, added dev-only `?debugLens` logs/arc, fixed rotation knob direction, and stabilized segments slider value handling.
- Decisions: Rotation degrees are clockwise in screen space; sector is [start, start+angle]; rotation is applied to sector bounds (theta), not to the sampled vector.
- Open questions / TODOs: Remove debug logs once verified; confirm parity across 8/12/14/16 segments and multiple rotations.
- QA checklist: not run (manual verification needed: segments 8/10/12/14/16; rotations 0/15/45/80/123/142/270; export parity).

## 2025-12-26 – Kaleidoscope sector alignment (aspect + debug overlays)
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `src/apps/CanvasApp/utils/export.js`, `src/apps/CanvasApp/components/KaleidoscopeOverlay.jsx`; removed aspect-correction in shader/export sampling to align wedge geometry with screen space, expanded `?debugLens` overlay to include filled wedge, marker, and labels, and added segment angle logging.
- Decisions: Sampling now uses screen-space polar coordinates (no aspect warp) to keep overlay/clip and mirror in the same frame.
- Open questions / TODOs: Validate live vs export parity at non-square viewports after removing aspect correction.
- QA checklist: not run (manual verification needed: segments 8/10/12/14/16; rotations 0/15/45/80/108/123/142/270; export parity).

## 2025-12-26 – Kaleidoscope lens audit + previewSector debug
- What changed: `src/apps/CanvasApp/utils/kaleidoscopeLens.js`, `src/apps/CanvasApp/components/KaleidoscopeOverlay.jsx`, `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `src/apps/CanvasApp/utils/export.js`; enforced a single lens model with explicit rotation conventions, added `?previewSector` mode to show the raw sampled wedge, expanded `?debugLens` overlays/labels, and aligned shader/fallback/export sampling to the canonical sector start.
- Decisions: 0° points right (+X), positive rotation is clockwise (screen Y down), sector is [start, start+angle], and rotation applies to sector bounds (theta) only.
- Open questions / TODOs: Remove debug overlays/logs after verification; confirm parity at all segment counts/angles.
- QA checklist: not run (manual verification needed: segments 8/10/12/14/16; rotations 0/15/45/80/108/123/142/270; previewSector overlay vs output; export parity).

## 2025-12-26 – Kaleidoscope DPR coordinate sync + debug uniforms
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `src/apps/CanvasApp/components/KaleidoscopeOverlay.jsx`, `src/apps/CanvasApp/utils/export.js`, `src/apps/CanvasApp/CanvasApp.jsx`; WebGL sampling now uses CSS-space centers with DPR-sized buffers, added u_center/u_resolution uniforms to both live and export shaders, extended debug overlay to show CSS vs drawingBuffer sizes, and aligned previewSector/export fallback to the same sampling basis.
- Decisions: Overlay and lens math remain in CSS pixels; WebGL buffers scale by DPR while shader sampling uses CSS-space centers for angle correctness.
- Open questions / TODOs: Remove debug overlays/logs after verification; confirm wedge parity at non-cardinal rotations with DPR scaling.
- QA checklist: not run (manual verification needed: segments 8/10/12/14/16; rotations 0/15/45/80/108/123/142/270; previewSector overlay vs output; export parity).

## 2025-12-26 – Kaleidoscope sampling rotation fix (source sector)
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `src/apps/CanvasApp/utils/export.js`; kaleidoscope rotation now offsets the sampled sector (not the output wedge), previewSector uses the same sectorStart bounds, and 2D fallback mirrors use sectorStart to rotate the source instead of spinning the output.
- Decisions: Rotation affects sampling direction only; output wedge layout stays fixed while source sector rotates.
- Open questions / TODOs: Confirm live wedge alignment at non-cardinal angles; verify export parity after rotation fix.
- QA checklist: not run (manual verification needed: segments 8/10/12/14/16; rotations 0/15/45/80/108/123/142/270; previewSector overlay vs output; export parity).

## 2025-12-26 – Kaleidoscope center alignment (CSS size sync)
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`; mirror canvas CSS size is now explicitly set to match the stage width/height so the sampling center remains at the canvas midpoint.
- Decisions: Keep WebGL sampling in CSS pixel space; align display size with Konva stage dimensions.
- Open questions / TODOs: Remove debug overlays/logs after verification; confirm center alignment at multiple viewport sizes.
- QA checklist: not run (manual verification needed: confirm mirror center stays at canvas midpoint while rotating lens).

## 2025-12-26 – Kaleidoscope wedge cutout (no overlay ghost)
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `src/apps/CanvasApp/utils/export.js`, `src/apps/CanvasApp/components/KaleidoscopeOverlay.jsx`; mirror output now cuts out the source wedge so only raw canvas shows inside the viewfinder, export mirrors apply the same cutout, and debug overlay wedge fill is removed.
- Decisions: The lens sector is reserved for direct editing; kaleidoscope only renders outside the wedge.
- Open questions / TODOs: Confirm wedge cutout parity in previewSector and export across rotations.
- QA checklist: not run (manual verification needed: wedge shows raw canvas only; mirrored output surrounds wedge; export parity).

## 2025-12-26 – Kaleidoscope seam rotation parity (live + export)
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `src/apps/CanvasApp/utils/export.js`; updated WebGL export shader to rotate seams with the sectorStart (matching live), and aligned the 2D fallback wedge loop so seams and source rotate together.
- Decisions: Output seams rotate with lens rotation; source sampling uses the same sectorStart in live, fallback, and export paths.
- Open questions / TODOs: Verify gap orientation at non-cardinal rotations (216°, 343°) and ensure the wedge cutout stays aligned.
- QA checklist: not run (manual verification needed: rotations 0/216/343; segments 8/10/12/14/16; previewSector vs live and export parity).

## 2025-12-26 – Kaleidoscope shader Y-axis alignment
- What changed: `src/apps/CanvasApp/components/WebGLMirrorCanvas.jsx`, `src/apps/CanvasApp/utils/export.js`; shader sampling now maps v_uv into screen-space (Y down) before computing theta so lens rotation and cutout move in the same direction as the overlay.
- Decisions: WebGL shader now uses screen-space coordinates for angle math to match Konva and overlay conventions.
- Open questions / TODOs: Confirm cutout + mirrored output move clockwise with the knob at 90° and 349°.
- QA checklist: not run (manual verification needed: rotation 90° should align; 349°/169° should not invert).

## 2025-12-26 – Export fills wedge from source canvas
- What changed: `src/apps/CanvasApp/utils/export.js`; mirror exports now draw the source canvas underneath the mirror output so the wedge gap is filled with live canvas content.
- Decisions: Export mirrors are composited over the base canvas instead of mirror-only output.
- Open questions / TODOs: Verify export wedge shows raw canvas content at multiple rotations and segments.
- QA checklist: not run (manual verification needed: export with kaleidoscope enabled shows filled wedge; compare live vs export).
