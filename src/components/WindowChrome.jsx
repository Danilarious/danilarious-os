// src/components/WindowChrome.jsx
// Old-Mac style window chrome

export function WindowChrome({
  title,
  active,
  onClose,
  children,
  theme,
  onCycleTheme,
}) {
  const {
    windowBg,
    headerBg,
    borderColor,
    shadowColor,
    titleColor,
    accentColor,
    contentTextColor,
  } = theme;

  return (
    <div
      className="w-full h-full border"
      style={{
        backgroundColor: windowBg,
        borderColor,
        boxShadow: `4px 4px 0 ${shadowColor}`,
      }}
    >
      {/* Title bar */}
      <div
        className="relative h-7 flex items-center justify-between px-2 border-b"
        style={{
          backgroundColor: headerBg,
          borderColor,
        }}
      >
        {/* top bevel lines */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-[#ffffff]/80" />
        <div className="absolute inset-x-0 top-[1px] h-[1px] bg-[#d0d0d0]" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-[#000000]" />

        {/* LEFT: blank close box */}
        <button
          onClick={onClose}
          className="relative w-4 h-4 border bg-[#f5f5f5] hover:bg-[#ffffff]"
          style={{
            borderColor,
          }}
          aria-label="Close window"
        />

        {/* CENTER: title */}
        <div className="flex-1 flex items-center justify-center pointer-events-none">
          <span
            className="text-[11px] font-semibold px-2"
            style={{
              color: titleColor,
              opacity: active ? 1 : 0.75,
            }}
          >
            {title}
          </span>
        </div>

        {/* RIGHT: color/theme button */}
        <button
          onClick={onCycleTheme}
          className="w-4 h-4 border flex items-center justify-center"
          style={{
            borderColor,
            backgroundColor: accentColor,
          }}
          aria-label="Change window color"
        />
      </div>

      {/* Content */}
      <div
        className="p-4 text-xs h-[calc(100%-1.75rem)] overflow-auto"
        style={{ color: contentTextColor }}
      >
        {children}
      </div>
    </div>
  );
}
