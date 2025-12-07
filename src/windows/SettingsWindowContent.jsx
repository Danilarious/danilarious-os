// src/windows/SettingsWindowContent.jsx

export function SettingsWindowContent({
  backgrounds,
  backgroundId,
  setBackgroundId,
  filters,
  filterId,
  setFilterId,
}) {
  return (
    <div className="space-y-4 text-[12px]">
      <section>
        <h3 className="font-semibold mb-2">Change background</h3>
        <div className="grid grid-cols-5 gap-2">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setBackgroundId(bg.id)}
              className={`w-8 h-8 border border-black flex items-center justify-center ${
                backgroundId === bg.id ? "ring-2 ring-black" : ""
              }`}
              style={
                bg.type === "solid"
                  ? { backgroundColor: bg.color }
                  : bg.type === "grid"
                  ? {
                      backgroundColor: "#f3f3ea",
                      backgroundImage:
                        "linear-gradient(#c3c3c3 1px, transparent 1px), linear-gradient(90deg, #c3c3c3 1px, transparent 1px)",
                      backgroundSize: "8px 8px",
                    }
                  : bg.type === "space"
                  ? {
                      backgroundColor: "#020617",
                      backgroundImage:
                        "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.7) 1px, transparent 0)",
                      backgroundSize: "10px 10px",
                    }
                  : {}
              }
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-2">Filters</h3>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterId(f.id)}
              className={`px-2 py-1 border border-black text-[11px] ${
                filterId === f.id ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
