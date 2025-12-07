// src/components/DesktopIcon.jsx

export function DesktopIcon({ label, emoji, onClick, iconSrc }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div className="w-16 h-16 rounded-2xl border border-black bg-[#fdfdfd] flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.3)] group-hover:-translate-y-0.5 transition-transform">
        {iconSrc ? (
          <img src={iconSrc} alt={label} className="w-9 h-9 object-contain" />
        ) : (
          <span className="text-xl">{emoji}</span>
        )}
      </div>
      <span className="text-[11px] text-center">{label}</span>
    </button>
  );
}
