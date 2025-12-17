// Lightweight visual placeholder for the future WebGL kaleidoscope layer.
export function KaleidoscopeOverlay({
  enabled,
  segments = 6,
  rotationSpeed = 0.2,
}) {
  if (!enabled) return null;

  const safeSegments = Math.max(2, Math.min(segments, 24));
  const durationSeconds = Math.max(6, Math.min(120, 60 / Math.max(rotationSpeed, 0.05)));

  const gradient = `repeating-conic-gradient(
    from 0deg,
    rgba(255, 216, 54, 0.32) 0deg,
    rgba(251, 173, 38, 0.32) ${180 / safeSegments}deg,
    rgba(233, 140, 120, 0.28) ${360 / safeSegments}deg
  )`;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 mix-blend-screen opacity-45">
      <div
        className="absolute inset-[-20%]"
        style={{
          backgroundImage: gradient,
          animation: `spin ${durationSeconds}s linear infinite`,
          filter: 'blur(10px)',
        }}
      />
      <div className="absolute top-3 left-3 px-2 py-1 text-[10px] bg-black/40 text-white rounded border border-white/30 backdrop-blur-sm">
        Kaleidoscope preview (stub)
      </div>
    </div>
  );
}
