// src/apps/CanvasApp/components/EffectsPanel.jsx
import { useCanvasStore } from '../hooks/useCanvasStore';

export function EffectsPanel() {
  const {
    hueShift,
    setHueShift,
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
        <input
          type="range"
          min="0"
          max="360"
          value={hueShift}
          onChange={(e) => setHueShift(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[9px] opacity-60 mt-1">
          <span>0°</span>
          <span>180°</span>
          <span>360°</span>
        </div>
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
