// src/apps/CanvasApp/CanvasAppShell.jsx
// Phase 2: Placeholder for Danilarious Canvas app
// Will be replaced with full Canvas implementation in Phase 3

export function CanvasAppShell() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4 text-[12px] leading-relaxed">
      <div className="text-center space-y-3 max-w-md">
        <div className="text-4xl">🎨</div>

        <h2 className="text-lg font-bold">Danilarious Canvas</h2>

        <p>
          A kaleidoscopic SVG playground for creating art through layering,
          color shifting, and symmetry effects.
        </p>

        <div className="bg-white/50 border border-black/20 p-3 text-left space-y-2 text-[11px]">
          <p className="font-semibold">Coming in Phase 3:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Drag & drop SVG assets onto canvas</li>
            <li>Kaleidoscope mirror effects (adjustable segments)</li>
            <li>Hue shift slider (0-360°)</li>
            <li>Rotation animation controls</li>
            <li>Layer management (bring to front/back)</li>
            <li>Export as PNG with Danilarious branding</li>
          </ul>
        </div>

        <p className="text-[10px] opacity-60">
          This is a placeholder. The full Canvas app will feature a two-canvas
          architecture (Konva.js for interaction + WebGL for effects) as
          outlined in docs/ARCHITECTURE.md.
        </p>
      </div>
    </div>
  );
}
