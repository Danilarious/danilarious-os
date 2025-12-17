// src/apps/CanvasApp/components/AssetLibrary.jsx
import { CANVAS_ASSETS } from '../../../data/canvasAssets';

export function AssetLibrary({ onAddAsset }) {
  const handleAddAsset = (asset) => {
    onAddAsset?.({
      assetId: asset.id,
      assetSrc: asset.svg,
      type: 'image',
    });
  };

  return (
    <div className="h-full flex flex-col border-r border-black bg-[#F5F4EF] p-3 overflow-y-auto">
      <h3 className="text-[11px] font-bold mb-3 uppercase tracking-wide">
        Asset Library
      </h3>

      {/* Shapes */}
      <div className="mb-4">
        <h4 className="text-[10px] font-semibold mb-2 opacity-60">Shapes</h4>
        <div className="grid grid-cols-2 gap-2">
          {CANVAS_ASSETS.shapes.map((asset) => (
            <button
              key={asset.id}
              onClick={() => handleAddAsset(asset)}
              className="aspect-square border border-black bg-white hover:bg-[#ffd836] transition-colors flex items-center justify-center group rounded"
              title={`Add ${asset.name}`}
            >
              <img
                src={asset.svg}
                alt={asset.name}
                className="w-12 h-12 object-contain"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-auto pt-4 border-t border-black/20">
        <p className="text-[9px] leading-relaxed opacity-60">
          Click any shape to add it to the canvas. Drag to move, use handles to
          rotate and scale.
        </p>
      </div>
    </div>
  );
}
