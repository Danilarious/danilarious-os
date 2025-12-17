import { useRef } from 'react';
import { useAssetManifest } from '../hooks/useAssetManifest';

// Toggleable Explorer drawer for manifest-driven assets and admin upload stub.
export function ExplorerDrawer({ open, onClose, onAddAsset }) {
  const { packs, addStubbedUpload, source } = useAssetManifest();
  const fileInputRef = useRef(null);

  const handleAdd = (asset) => {
    onAddAsset?.({
      assetId: asset.id,
      assetSrc: asset.svg,
      type: 'image',
    });
  };

  const handleStubUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    addStubbedUpload(file.name);
    alert(
      'Upload stubbed: in production this will sanitize and persist SVGs via the admin backend.'
    );
    event.target.value = '';
  };

  return (
    <div
      className={`absolute inset-x-0 bottom-0 h-64 max-h-[70vh] bg-[#F5F4EF] border-t border-black shadow-[0_-4px_0_rgba(0,0,0,0.6)] transition-transform duration-300 z-30 ${
        open ? 'translate-y-0' : 'translate-y-[70%]'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-black/20">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wide">
            Danilarious Explorer
          </span>
          <span className="text-[10px] opacity-70">
            Toggleable asset drawer — future home for custom SVG packs
          </span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 border border-black rounded-full text-[11px] bg-white hover:bg-[#ffd836] transition-colors"
        >
          Hide
        </button>
      </div>

      <div className="h-[calc(100%-2.5rem)] grid grid-cols-3 gap-3 p-3 overflow-y-auto">
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between text-[10px] px-1">
            <span className="opacity-80">Source: {source === 'remote' ? 'External manifest' : 'Local manifest'}</span>
            <span className="opacity-60">Drag any item to add</span>
          </div>
          {packs.map((pack) => (
            <div key={pack.id} className="border border-black/15 bg-white p-2 rounded">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-[10px] font-semibold">{pack.name}</h4>
                  <p className="text-[9px] opacity-70">{pack.description}</p>
                </div>
                <span className="text-[9px] px-2 py-1 border border-black/20 rounded">
                  {pack.items.length} assets
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {pack.items.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => handleAdd(asset)}
                    className="aspect-square border border-black bg-white hover:bg-[#ffd836] flex items-center justify-center rounded"
                    title={asset.name}
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
          ))}
        </div>

        <div className="col-span-1 space-y-3">
          <div className="text-[10px] leading-relaxed bg-white border border-black/20 p-3 rounded">
            <h4 className="text-[10px] font-semibold mb-1">Admin Upload (stub)</h4>
            <p className="opacity-80">
              Future: sanitize SVG (strip scripts, enforce viewBox), tag, and persist via backend.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 w-full px-3 py-2 border border-dashed border-black text-[11px] bg-white hover:bg-[#ffd836] transition-colors"
            >
              Upload SVG (stub)
            </button>
            <input
              type="file"
              accept=".svg"
              ref={fileInputRef}
              className="hidden"
              onChange={handleStubUpload}
            />
          </div>

          <div className="text-[10px] leading-relaxed bg-white border border-black/20 p-3 rounded">
            <h4 className="text-[10px] font-semibold mb-1">Saved palettes (future)</h4>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {['#ffd836', '#fbad26', '#e7bd3d', '#ff8cc7', '#43a9ff', '#291C42'].map(
                (color) => (
                  <div
                    key={color}
                    className="h-8 border border-black/20"
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
            <p className="opacity-70">
              Palettes will pair with manifest packs and admin uploads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
