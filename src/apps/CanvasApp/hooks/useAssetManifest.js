import { useEffect, useMemo, useState } from 'react';
import { CANVAS_MANIFEST } from '../../../data/canvasManifest';

// Manages manifest-driven assets; currently static with admin upload stub.
export function useAssetManifest() {
  const [packs, setPacks] = useState(CANVAS_MANIFEST);
  const [source, setSource] = useState('local');

  const allItems = useMemo(
    () => packs.flatMap((pack) => pack.items.map((item) => ({ ...item, packId: pack.id })) ),
    [packs]
  );

  // Attempt to hydrate from external manifest (e.g., admin-published JSON)
  useEffect(() => {
    const controller = new AbortController();
    const loadManifest = async () => {
      try {
        const res = await fetch('/assets/canvas/manifest.json', { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setPacks(sanitizeManifest(data));
          setSource('remote');
        }
      } catch (_err) {
        // fall back silently
      }
    };
    loadManifest();
    return () => controller.abort();
  }, []);

  const addStubbedUpload = (fileName) => {
    const safeName = sanitizeText(fileName || 'Custom SVG');
    const stub = {
      id: `custom-${Date.now()}`,
      name: safeName,
      svg: '/assets/canvas/square.svg', // placeholder path until backend persists uploads
    };
    setPacks((prev) =>
      prev.map((p) =>
        p.id === 'core-shapes'
          ? { ...p, items: [...p.items, stub] }
          : p
      )
    );
  };

  const importManifest = (manifest) => {
    if (!manifest || !Array.isArray(manifest)) return;
    setPacks(sanitizeManifest(manifest));
    setSource('remote');
  };

  return {
    packs,
    allItems,
    source,
    addStubbedUpload,
    importManifest,
  };
}

function sanitizeText(text) {
  return String(text || '')
    .replace(/[^\w\s\-\.\(\)]/g, '')
    .slice(0, 120)
    .trim();
}

function sanitizeManifest(manifest) {
  return manifest.map((pack) => ({
    id: sanitizeText(pack.id || `pack-${Date.now()}`),
    name: sanitizeText(pack.name || 'Pack'),
    description: sanitizeText(pack.description || ''),
    category: sanitizeText(pack.category || 'misc'),
    items: Array.isArray(pack.items)
      ? pack.items.map((item) => ({
          id: sanitizeText(item.id || `asset-${Date.now()}`),
          name: sanitizeText(item.name || 'Asset'),
          svg: typeof item.svg === 'string' ? item.svg : '',
        }))
      : [],
  }));
}
