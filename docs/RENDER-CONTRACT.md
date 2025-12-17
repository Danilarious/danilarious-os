# Danilarious Canvas – Render Contract

This document makes explicit the render behavior of Canvas Mode as of 2025-12-13. Any future backend, asset ingestion, or admin flows must not assume behavior beyond this contract without revisiting it.

## Coordinate System
- Origin: top-left of the viewport/stage.
- Units: pixels.
- Stage size: matches the browser viewport (width = `window.innerWidth`, height = `window.innerHeight - topBarHeight`).
- Elements:
  - Position stored as center point (`x`, `y`).
  - Rotation stored in degrees.
  - Scale applied uniformly on X/Y.
  - Offsets set to half the intrinsic image size so transforms are center-based.
- Hit areas: selection uses the element bounds with a padding of 12px to aid small assets.
- Snap-to-grid (optional): when enabled, final `x`/`y` is snapped on drag end to `round(position / gridSize) * gridSize`. No live snapping mid-drag.

## Render Pipeline Order (bottom → top)
1) Desktop grid/background (OS desktop).
2) Konva Stage (interaction canvas) with:
   - Elements rendered in z-order.
   - Hue applied via CSS `filter: hue-rotate(hueShift deg)` on the stage wrapper.
3) WebGL Mirror Layer (if enabled):
   - Consumes Konva snapshot.
   - Mirrors into `segments` radial slices with alternating flip.
   - Runs in a separate canvas overlay; uses requestAnimationFrame for rotation and refreshes its texture based on snapshot cadence.
   - Falls back to a 2D mirror if WebGL is unavailable.
4) CSS Kaleidoscope Overlay:
   - Disabled when WebGL mirror is enabled.
   - Decorative conic gradient for visual preview.
5) Snap Grid Overlay:
   - Only shown when snap-to-grid is on.
6) UI chrome (panels, drawers, HUD): overlays content; Isolate mode hides these layers without altering underlying pixels.

## Timing & Animation Model
- WebGL mirror rotation: driven by requestAnimationFrame; rotationSpeed in degrees/sec.
- WebGL snapshot cadence:
  - Auto mode (default): cadence derived from canvas area and `segments`, clamped (≈280–1400ms).
  - Manual mode: user-selected slider (250–2000ms).
  - Snapshots are skipped when `document.visibilityState === 'hidden'`.
- Hue cycle: requestAnimationFrame updates `hueShift` over time.
- Snap-to-grid: applied once on drag end (no continuous snapping).

## Isolation Behavior
- Isolate mode hides all UI overlays (panels, drawers, HUD, grid overlay, CSS kaleidoscope) but does not alter the rendered canvas pixels or state.
- Exiting Isolate restores UI visibility; canvas state remains unchanged.
- Exiting Canvas Mode restores OS windows/icons and leaves persisted state intact.

## Export Expectations
- Current export path uses the Konva stage PNG export (interaction canvas only).
- Effects (WebGL mirror, CSS overlay, grid overlay, HUD) are **not** baked into exports under current implementation.
- Persisted state (elements, hue, mirror settings, snap) is stored in `localStorage` but not embedded in exports.
- For deterministic exports including effects, the pipeline would need to composite Konva + mirror outputs explicitly (future work, out of scope of this contract).

## Provisional / Out of Scope
- Asset ingestion (manifest, Explorer, admin upload) is provisional and must not be treated as stable for backend integration without revisiting this contract.
- Backend/admin endpoints are not defined here and must align to a future contract that references this render behavior.
