// src/components/DesktopIcon.jsx

export function DesktopIcon({ label, emoji, onClick, iconSrc }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group w-full"
    >
      {/* Icon container - larger and more prominent on mobile */}
      <div className="w-16 h-16 md:w-16 md:h-16 max-md:w-20 max-md:h-20 rounded-2xl border border-black bg-[#fdfdfd] flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.3)] group-hover:-translate-y-0.5 group-active:translate-y-0.5 transition-transform">
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={label}
            className="w-9 h-9 md:w-9 md:h-9 max-md:w-12 max-md:h-12 object-contain"
          />
        ) : (
          <span className="text-xl md:text-xl max-md:text-3xl">{emoji}</span>
        )}
      </div>
      {/* Label - smaller on mobile like iOS */}
      <span className="text-[11px] md:text-[11px] max-md:text-[10px] text-center max-w-[80px] truncate">
        {label}
      </span>
    </button>
  );
}
