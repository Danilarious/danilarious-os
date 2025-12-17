// Lightweight visual grid to reinforce snap-to-grid behavior.
export function SnapGridOverlay({ enabled, gridSize = 24 }) {
  if (!enabled || gridSize < 4) return null;

  const size = Math.max(4, Math.min(120, gridSize));

  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-25 mix-blend-multiply"
      style={{
        backgroundImage:
          `linear-gradient(to right, rgba(0,0,0,0.4) 1px, transparent 1px),` +
          `linear-gradient(to bottom, rgba(0,0,0,0.4) 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}
