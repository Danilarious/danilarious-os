// src/apps/CanvasApp/CanvasApp.jsx
import { useRef, useEffect } from 'react';
import { KonvaCanvas } from './components/KonvaCanvas';
import { AssetLibrary } from './components/AssetLibrary';
import { EffectsPanel } from './components/EffectsPanel';
import { Toolbar } from './components/Toolbar';
import { useCanvasStore } from './hooks/useCanvasStore';
import { exportCanvasToPNG } from './utils/export';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

export function CanvasApp() {
  const stageRef = useRef();
  const { elements, hueShift, loadState, getState } = useCanvasStore();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('danilarious-canvas-state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        loadState(state);
      } catch (error) {
        console.error('Failed to load canvas state:', error);
      }
    }
  }, [loadState]);

  // Save to localStorage on change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const state = getState();
      localStorage.setItem('danilarious-canvas-state', JSON.stringify(state));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [elements, hueShift, getState]);

  const handleExport = () => {
    exportCanvasToPNG(stageRef);
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F4EF]">
      {/* Toolbar */}
      <Toolbar onExport={handleExport} />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Asset Library */}
        <div className="w-40 flex-shrink-0">
          <AssetLibrary />
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          {elements.length === 0 ? (
            <div className="text-center space-y-2 max-w-xs">
              <div className="text-4xl">🎨</div>
              <p className="text-[11px] opacity-60">
                Click a shape from the library to start creating
              </p>
            </div>
          ) : (
            <KonvaCanvas
              ref={stageRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
            />
          )}
        </div>

        {/* Right: Effects Panel */}
        <div className="w-48 flex-shrink-0">
          <EffectsPanel />
        </div>
      </div>
    </div>
  );
}
