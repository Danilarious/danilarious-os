// src/apps/CanvasApp/components/EffectsPanel.jsx
import { useCanvasStore } from '../hooks/useCanvasStore';

export function EffectsPanel() {
  const {
    hueShift,
    setHueShift,
    hueCycle,
    setHueCycle,
    kaleidoscopeEnabled,
    kaleidoscopeSegments,
    kaleidoscopeRotation,
    setKaleidoscopeEnabled,
    setKaleidoscopeSegments,
    setKaleidoscopeRotation,
    snapToGrid,
    gridSize,
    setSnapToGrid,
    setGridSize,
    mirrorSnapshotMs,
    setMirrorSnapshotMs,
    mirrorSnapshotAuto,
    setMirrorSnapshotAuto,
    selectedId,
    bringToFront,
    sendToBack,
    removeElement,
  } = useCanvasStore();

  return (
    <div className="h-full flex flex-col border-l border-black bg-[#F5F4EF] p-3 overflow-y-auto">
      <h3 className="text-[11px] font-bold mb-3 uppercase tracking-wide">
        Effects
      </h3>

      {/* Hue Shift */}
      <div className="mb-6">
        <label className="text-[10px] font-semibold mb-2 block">
          Hue Shift: {Math.round(hueShift)}°
        </label>
        <div className="w-full h-2 rounded-full mb-2" style={{ background: 'linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red)' }} />
        <input
          type="range"
          min="0"
          max="360"
          value={hueShift}
          onChange={(e) => setHueShift(Number(e.target.value))}
          className="w-full accent-black"
          style={{
            background:
              'linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red)',
          }}
        />
        <div className="flex justify-between text-[9px] opacity-60 mt-1">
          <span>0°</span>
          <span>180°</span>
          <span>360°</span>
        </div>
        <button
          onClick={() => setHueCycle(!hueCycle)}
          className={`mt-3 w-full px-2 py-1.5 border border-black text-[10px] transition-colors ${
            hueCycle
              ? 'bg-[#FBAD26] hover:bg-[#E7BD3D]'
              : 'bg-white hover:bg-[#ffd836]'
          }`}
        >
          {hueCycle ? 'Stop Hue Cycle' : 'Start Hue Cycle'}
        </button>
      </div>

      {/* Kaleidoscope (stub) */}
      <div className="mb-6 pb-6 border-b border-black/20">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-semibold">Kaleidoscope (preview)</h4>
          <button
            onClick={() => setKaleidoscopeEnabled(!kaleidoscopeEnabled)}
            className={`px-2 py-1 border border-black text-[10px] transition-colors ${
              kaleidoscopeEnabled
                ? 'bg-[#FBAD26] hover:bg-[#E7BD3D]'
                : 'bg-white hover:bg-[#ffd836]'
            }`}
          >
            {kaleidoscopeEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
        <label className="text-[10px] font-semibold mb-1 block">
          Segments: {kaleidoscopeSegments}x
        </label>
        <input
          type="range"
          min="3"
          max="16"
          value={kaleidoscopeSegments}
          onChange={(e) => setKaleidoscopeSegments(Number(e.target.value))}
          className="w-full accent-black"
        />
        <label className="text-[10px] font-semibold mb-1 block mt-3">
          Rotation speed: {kaleidoscopeRotation.toFixed(2)} deg/s
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={kaleidoscopeRotation}
          onChange={(e) => setKaleidoscopeRotation(Number(e.target.value))}
          className="w-full accent-black"
        />
        <p className="text-[9px] opacity-60 mt-2">
          The WebGL mirror uses these settings; the CSS overlay remains as a visual preview.
        </p>
      </div>

      {/* Interaction */}
      <div className="mb-6 pb-6 border-b border-black/20">
        <h4 className="text-[10px] font-semibold mb-2">Interaction</h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px]">Snap to grid</span>
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-2 py-1 border border-black text-[10px] transition-colors ${
              snapToGrid
                ? 'bg-[#FBAD26] hover:bg-[#E7BD3D]'
                : 'bg-white hover:bg-[#ffd836]'
            }`}
          >
            {snapToGrid ? 'On' : 'Off'}
          </button>
        </div>
        <label className="text-[10px] font-semibold mb-1 block">
          Grid size: {gridSize}px
        </label>
        <input
          type="range"
          min="8"
          max="80"
          step="4"
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          className="w-full accent-black"
        />
        <p className="text-[9px] opacity-60 mt-2">
          Snap only applies on drag end to keep placement predictable.
        </p>
      </div>

      {/* Performance */}
      <div className="mb-6 pb-6 border-b border-black/20">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-semibold">Mirror refresh</h4>
          <button
            onClick={() => setMirrorSnapshotAuto(!mirrorSnapshotAuto)}
            className={`px-2 py-1 border border-black text-[10px] transition-colors ${
              mirrorSnapshotAuto
                ? 'bg-[#FBAD26] hover:bg-[#E7BD3D]'
                : 'bg-white hover:bg-[#ffd836]'
            }`}
          >
            {mirrorSnapshotAuto ? 'Auto' : 'Manual'}
          </button>
        </div>
        <label className="text-[10px] font-semibold mb-1 block">
          {mirrorSnapshotAuto ? 'Auto cadence' : `Manual: ${mirrorSnapshotMs}ms`}
        </label>
        <input
          type="range"
          min="250"
          max="2000"
          step="50"
          value={mirrorSnapshotMs}
          onChange={(e) => setMirrorSnapshotMs(Number(e.target.value))}
          className="w-full accent-black"
          disabled={mirrorSnapshotAuto}
        />
        <div className="flex justify-between text-[9px] opacity-60 mt-1">
          <span>Fast</span>
          <span>{mirrorSnapshotMs}ms</span>
          <span>Battery</span>
        </div>
        <p className="text-[9px] opacity-60 mt-2">
          Auto mode adjusts based on canvas size/segments. Manual mode lets you pin a cadence.
        </p>
      </div>

      {/* Layer Controls - only show when element is selected */}
      {selectedId && (
        <div className="mb-6 pb-6 border-b border-black/20">
          <h4 className="text-[10px] font-semibold mb-2">Selected Element</h4>
          <div className="space-y-1.5">
            <button
              onClick={() => bringToFront(selectedId)}
              className="w-full px-2 py-1.5 border border-black bg-white hover:bg-[#ffd836] text-[10px] transition-colors"
            >
              Bring to Front
            </button>
            <button
              onClick={() => sendToBack(selectedId)}
              className="w-full px-2 py-1.5 border border-black bg-white hover:bg-[#ffd836] text-[10px] transition-colors"
            >
              Send to Back
            </button>
            <button
              onClick={() => removeElement(selectedId)}
              className="w-full px-2 py-1.5 border border-black bg-white hover:bg-[#EB784B] hover:text-white text-[10px] transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-auto">
        <p className="text-[9px] leading-relaxed opacity-60">
          Use hue shift to change colors. Select an element to access layer controls.
        </p>
      </div>
    </div>
  );
}
