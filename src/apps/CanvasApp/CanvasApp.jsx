// src/apps/CanvasApp/CanvasApp.jsx
import { useRef, useEffect, useState } from 'react';
import { KonvaCanvas } from './components/KonvaCanvas';
import { AssetLibrary } from './components/AssetLibrary';
import { EffectsPanel } from './components/EffectsPanel';
import { ExplorerDrawer } from './components/ExplorerDrawer';
import { KaleidoscopeOverlay } from './components/KaleidoscopeOverlay';
import { WebGLMirrorCanvas } from './components/WebGLMirrorCanvas';
import { useCanvasStore } from './hooks/useCanvasStore';
import { exportCanvasToPNG } from './utils/export';

const TOP_BAR_HEIGHT = 48; // matches h-12 top bar in App
const LEFT_PANEL = 208; // w-52
const RIGHT_PANEL = 240; // w-60

export function CanvasApp({ onExit }) {
  const stageRef = useRef();
  const {
    elements,
    hueShift,
    hueCycle,
    loadState,
    getState,
    setHueCycle,
    nudgeHue,
    kaleidoscopeEnabled,
    kaleidoscopeSegments,
    kaleidoscopeRotation,
    mirrorSnapshotMs,
    mirrorSnapshotAuto,
    snapToGrid,
    gridSize,
    addElement,
    undo,
    redo,
    selectElement,
    clearCanvas,
    history,
    future,
  } = useCanvasStore();

  const [isolateMode, setIsolateMode] = useState(false);
  const [panelsOpen, setPanelsOpen] = useState(true);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight - TOP_BAR_HEIGHT,
  });

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
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [
    elements,
    hueShift,
    hueCycle,
    kaleidoscopeEnabled,
    kaleidoscopeSegments,
    kaleidoscopeRotation,
    mirrorSnapshotMs,
    getState,
  ]);

  // Resize stage when viewport changes
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight - TOP_BAR_HEIGHT,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hue cycling
  useEffect(() => {
    if (!hueCycle) return;

    let rafId;
    let lastTs = performance.now();

    const tick = (now) => {
      const deltaMs = now - lastTs;
      lastTs = now;
      const degreesPerSecond = 60;
      const deltaDegrees = (deltaMs / 1000) * degreesPerSecond;
      nudgeHue(deltaDegrees);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [hueCycle, nudgeHue]);

  const handleExport = () => {
    exportCanvasToPNG(stageRef);
  };

  const getSpawnPosition = () => {
    const left = overlaysHidden || hidePanels ? 0 : LEFT_PANEL;
    const right = overlaysHidden || hidePanels ? 0 : RIGHT_PANEL;
    const availWidth = Math.max(0, viewport.width - left - right);
    return {
      x: left + availWidth / 2,
      y: viewport.height / 2,
    };
  };

  const handleAddAsset = (asset) => {
    const { x, y } = getSpawnPosition();
    const id = addElement({
      ...asset,
      x,
      y,
    });
    if (id) {
      selectElement(id);
    }
  };

  const hidePanels = isolateMode || !panelsOpen;
  const overlaysHidden = isolateMode;
  const snapBanner =
    snapToGrid && !overlaysHidden
      ? `Snap: ${gridSize}px`
      : null;

  useEffect(() => {
    if (isolateMode) {
      setExplorerOpen(false);
    }
  }, [isolateMode]);

  useEffect(() => {
    const handleKey = (e) => {
      const isUndoKey =
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'z' &&
        !e.shiftKey;
      const isRedoKey =
        (e.metaKey || e.ctrlKey) &&
        ((e.key.toLowerCase() === 'z' && e.shiftKey) ||
          e.key.toLowerCase() === 'y');

      if (isUndoKey) {
        e.preventDefault();
        undo();
      } else if (isRedoKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  return (
    <div className="relative w-full h-full bg-transparent overflow-hidden">
      {/* Stage over the desktop grid */}
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
          <KonvaCanvas
            ref={stageRef}
            width={viewport.width}
            height={viewport.height}
            variant="mode"
          />
          <WebGLMirrorCanvas
            stageRef={stageRef}
            enabled={kaleidoscopeEnabled}
            width={viewport.width}
            height={viewport.height}
            segments={kaleidoscopeSegments}
            rotationSpeed={kaleidoscopeRotation}
            snapshotMs={mirrorSnapshotMs}
            autoSnapshot={mirrorSnapshotAuto}
          />
          {!kaleidoscopeEnabled && (
            <KaleidoscopeOverlay
              enabled={kaleidoscopeEnabled}
              segments={kaleidoscopeSegments}
              rotationSpeed={kaleidoscopeRotation}
            />
          )}
        </div>
      </div>

      {/* Floating controls */}
      {overlaysHidden ? (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          <button
            onClick={() => setIsolateMode(false)}
            className="px-3 py-1 border border-black rounded-full text-[11px] bg-white hover:bg-[#ffd836] transition-colors"
          >
            Exit Isolate
          </button>
          <button
            onClick={() => {
              setHueCycle(false);
              onExit?.();
            }}
            className="px-3 py-1 border border-black rounded-full text-[11px] bg-white hover:bg-[#EB784B] hover:text-white transition-colors"
          >
            Exit Canvas
          </button>
        </div>
      ) : (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          <div className="bg-[#E5D7AA] border border-black shadow-[2px_2px_0_rgba(0,0,0,0.6)] rounded-full px-3 py-1 flex items-center gap-2">
            <span className="text-[11px] font-semibold">Canvas Mode</span>
            <span className="text-[10px] opacity-70">
              {elements.length} {elements.length === 1 ? 'element' : 'elements'}
            </span>
          </div>

        <button
          onClick={() => setIsolateMode((v) => !v)}
          className={`px-3 py-1 border border-black rounded-full text-[11px] bg-white hover:bg-[#ffd836] transition-colors ${
            isolateMode ? 'bg-[#ffd836]' : ''
          }`}
          >
            {isolateMode ? 'Exit Isolate' : 'Isolate'}
        </button>

        <button
          onClick={undo}
          disabled={!history.length}
          className="px-3 py-1 border border-black rounded-full text-[11px] bg-white hover:bg-[#ffd836] transition-colors disabled:opacity-50"
          title="Undo (Cmd/Ctrl+Z)"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!future.length}
          className="px-3 py-1 border border-black rounded-full text-[11px] bg-white hover:bg-[#ffd836] transition-colors disabled:opacity-50"
          title="Redo (Shift+Cmd/Ctrl+Z or Cmd/Ctrl+Y)"
        >
          Redo
        </button>

        <button
          onClick={() => setPanelsOpen((v) => !v)}
          className="px-3 py-1 border border-black rounded-full text-[11px] bg-white hover:bg-[#ffd836] transition-colors"
        >
          {panelsOpen ? 'Hide Panels' : 'Show Panels'}
        </button>

        <button
          onClick={() => {
            if (window.confirm('Clear all elements from the canvas?')) {
              clearCanvas();
            }
          }}
          disabled={elements.length === 0}
          className="px-3 py-1 border border-black rounded-full text-[11px] bg-white hover:bg-[#EB784B] hover:text-white transition-colors disabled:opacity-50"
        >
          Clear
        </button>

        <button
          onClick={() => setExplorerOpen((v) => !v)}
          className={`px-3 py-1 border border-black rounded-full text-[11px] bg-white hover:bg-[#ffd836] transition-colors ${
            explorerOpen ? 'bg-[#ffd836]' : ''
          }`}
          >
            {explorerOpen ? 'Hide Explorer' : 'Show Explorer'}
          </button>

          <button
            onClick={handleExport}
            disabled={elements.length === 0}
            className="px-3 py-1 border border-black rounded-full text-[11px] bg-[#FBAD26] hover:bg-[#E7BD3D] font-semibold transition-colors disabled:opacity-50"
          >
            Export PNG
          </button>

          <button
            onClick={() => {
              setHueCycle(false);
              onExit?.();
            }}
            className="px-3 py-1 border border-black rounded-full text-[11px] bg-white hover:bg-[#EB784B] hover:text-white transition-colors"
          >
            Exit Canvas
          </button>
        </div>
      )}

      {/* Left panel */}
      {!overlaysHidden && (
        <div
          className={`absolute left-0 top-0 h-full w-52 max-w-[70vw] transition-transform duration-300 z-10 ${
            hidePanels ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <AssetLibrary onAddAsset={handleAddAsset} />
        </div>
      )}

      {/* Right panel */}
      {!overlaysHidden && (
        <div
          className={`absolute right-0 top-0 h-full w-60 max-w-[70vw] transition-transform duration-300 z-10 ${
            hidePanels ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <EffectsPanel />
        </div>
      )}

      {/* Explorer drawer */}
      {!overlaysHidden && (
        <ExplorerDrawer
          open={explorerOpen}
          onClose={() => setExplorerOpen(false)}
          onAddAsset={handleAddAsset}
        />
      )}

      {/* Bottom helper */}
      {!overlaysHidden && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-sm border border-black/40 px-4 py-2 rounded shadow-sm text-[11px] text-black">
          <div className="flex items-center gap-3">
            <span>Drag shapes directly on the desktop grid.</span>
            <span className="opacity-70">
              Isolate hides UI; Exit restores OS.
            </span>
            {snapBanner && (
              <span className="px-2 py-1 border border-black/30 rounded bg-[#ffd836]/60">
                {snapBanner}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
