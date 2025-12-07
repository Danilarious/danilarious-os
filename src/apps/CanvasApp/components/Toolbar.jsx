// src/apps/CanvasApp/components/Toolbar.jsx
import { useCanvasStore } from '../hooks/useCanvasStore';

export function Toolbar({ onExport }) {
  const { clearCanvas, elements } = useCanvasStore();

  const handleClear = () => {
    if (elements.length > 0) {
      if (window.confirm('Clear all elements from canvas?')) {
        clearCanvas();
      }
    }
  };

  return (
    <div className="border-b border-black bg-[#E5D7AA] px-3 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold">Danilarious Canvas</span>
        <span className="text-[9px] opacity-60">
          {elements.length} {elements.length === 1 ? 'element' : 'elements'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleClear}
          disabled={elements.length === 0}
          className="px-3 py-1 border border-black bg-white hover:bg-[#EB784B] hover:text-white text-[10px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black"
        >
          Clear
        </button>
        <button
          onClick={onExport}
          disabled={elements.length === 0}
          className="px-3 py-1 border border-black bg-[#FBAD26] hover:bg-[#E7BD3D] text-[10px] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#FBAD26]"
        >
          Export PNG
        </button>
      </div>
    </div>
  );
}
