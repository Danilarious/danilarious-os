// src/App.jsx
import { useState } from "react";
import { motion } from "framer-motion";

// Config & Data
import { APPS, DESKTOP_ICONS } from "./config/apps";
import { CanvasApp } from "./apps/CanvasApp/CanvasApp";

// Components
import { AnalogClock } from "./components/AnalogClock";
import { DesktopIcon } from "./components/DesktopIcon";
import { WindowChrome } from "./components/WindowChrome";

// Icon imports
import GobyIdle from "./assets/icons/Goby.svg";
import GobyHover from "./assets/icons/Goby_hover.svg";
import GobyClick from "./assets/icons/Goby_click.svg";

// --- COLOR THEMES ---

const WINDOW_THEMES = {
  retroLight: {
    id: "retroLight",
    name: "Retro Light",
    windowBg: "#F5F4EF", // Gallery Paper
    headerBg: "#E5D7AA", // Soft Oat
    borderColor: "#000000",
    shadowColor: "#2D2726", // Midnight Espresso
    titleColor: "#2D2726",
    accentColor: "#FBAD26", // Neon Mango (color-cycle button)
    contentTextColor: "#2D2726",
  },
  retroAqua: {
    id: "retroAqua",
    name: "Retro Aqua",
    windowBg: "#E5D7AA", // Soft Oat
    headerBg: "#6598AC", // Cyan Blueprint
    borderColor: "#000000",
    shadowColor: "#493E34", // Burnt Vinyl
    titleColor: "#F5F4EF", // Gallery Paper
    accentColor: "#EFAB96", // Retro Peach Fizz
    contentTextColor: "#2D2726",
  },
  retroDark: {
    id: "retroDark",
    name: "Retro Dark",
    windowBg: "#2D2726", // Midnight Espresso
    headerBg: "#291C42", // VHS Midnight
    borderColor: "#000000",
    shadowColor: "#000000", // Absolute Black
    titleColor: "#F5F4EF",
    accentColor: "#E7BD3D", // Pixel Gold
    contentTextColor: "#F5F4EF",
  },
};

const DEFAULT_WINDOW_THEME_ID = "retroLight";

// --- BACKGROUND & FILTER CONFIG ---

const backgrounds = [
  { id: "grid", label: "Grid", type: "grid" },
  {
    id: "yellow",
    label: "Yellow",
    type: "solid",
    color: "#ffd836",
  },
  {
    id: "blue",
    label: "Blue",
    type: "solid",
    color: "#43a9ff",
  },
  {
    id: "pink",
    label: "Pink",
    type: "solid",
    color: "#ff8cc7",
  },
  {
    id: "space",
    label: "Space",
    type: "space",
  },
];

const filters = [
  { id: "normal", label: "Normal", css: "none" },
  { id: "bw", label: "Black & White", css: "grayscale(1)" },
  { id: "invert", label: "Invert", css: "invert(1)" },
  { id: "negative", label: "Negative", css: "invert(1) hue-rotate(180deg)" },
];

function getBackgroundStyle(bg) {
  if (!bg) {
    return {
      className: "relative bg-gradient-to-br from-pink-300 to-rose-400",
      style: {},
    };
  }

  if (bg.type === "solid") {
    return {
      className: "relative",
      style: { backgroundColor: bg.color },
    };
  }

  if (bg.type === "grid") {
    return {
      className: "relative",
      style: {
        backgroundColor: "#f3f3ea",
        backgroundImage:
          "linear-gradient(#c3c3c3 1px, transparent 1px), linear-gradient(90deg, #c3c3c3 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      },
    };
  }

  if (bg.type === "space") {
    return {
      className: "relative",
      style: {
        backgroundColor: "#020617",
        backgroundImage:
          "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.7) 1px, transparent 0)",
        backgroundSize: "40px 40px",
      },
    };
  }

  return {
    className: "relative bg-gradient-to-br from-pink-300 to-rose-400",
    style: {},
  };
}

// --- MAIN APP COMPONENT ---

export default function App() {
  // Initialize windows from APPS registry (Canvas runs as a mode, not a window)
  const initialWindows = Object.values(APPS)
    .filter((app) => app.id !== "canvas")
    .map((app) => ({
      id: app.id,
      title: app.title,
      ...app.defaultWindow,
      isOpen: false,
      zIndex: 1,
    }));

  const [windows, setWindows] = useState(initialWindows);
  const [activeId, setActiveId] = useState(null);
  const [backgroundId, setBackgroundId] = useState("grid");
  const [filterId, setFilterId] = useState("normal");
  const [zCounter, setZCounter] = useState(10);
  const [gobyState, setGobyState] = useState("idle"); // 'idle' | 'hover' | 'click'
  const [canvasMode, setCanvasMode] = useState(false);

  // Theme cycling
  const themeIds = Object.keys(WINDOW_THEMES);
  const [windowThemeId, setWindowThemeId] = useState(
    DEFAULT_WINDOW_THEME_ID
  );

  const windowTheme =
    WINDOW_THEMES[windowThemeId] || WINDOW_THEMES.retroLight;

  const cycleWindowTheme = () => {
    setWindowThemeId((prev) => {
      const idx = themeIds.indexOf(prev);
      const nextIdx = (idx + 1) % themeIds.length;
      return themeIds[nextIdx];
    });
  };

  const bgConfig =
    backgrounds.find((b) => b.id === backgroundId) || backgrounds[0];
  const filter = filters.find((f) => f.id === filterId) || filters[0];
  const { className: bgClassName, style: bgStyle } = getBackgroundStyle(
    bgConfig
  );

  const openWindow = (id) => {
    if (id === "canvas") {
      setCanvasMode(true);
      setActiveId(null);
      return;
    }

    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;

        // On mobile, make windows take up more of the screen
        const isMobile = window.innerWidth < 768;
        const windowWidth = isMobile ? Math.min(w.width, window.innerWidth - 32) : w.width;
        const windowHeight = isMobile ? Math.min(w.height, window.innerHeight - 100) : w.height;
        const windowX = isMobile ? 16 : w.x;
        const windowY = isMobile ? 60 : w.y;

        return {
          ...w,
          isOpen: true,
          zIndex: zCounter + 1,
          width: windowWidth,
          height: windowHeight,
          x: windowX,
          y: windowY,
        };
      })
    );
    setZCounter((z) => z + 1);
    setActiveId(id);
  };

  const closeWindow = (id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w))
    );
    if (activeId === id) setActiveId(null);
  };

  const bringToFront = (id) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, zIndex: zCounter + 1 } : w
      )
    );
    setZCounter((z) => z + 1);
    setActiveId(id);
  };

  const onDragEnd = (id, _event, info) => {
    const { x: dx, y: dy } = info.offset;
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;

        // Calculate new position
        let newX = w.x + dx;
        let newY = w.y + dy;

        // Constrain to viewport bounds (with some padding)
        const minX = -w.width + 100; // Allow 100px visible on left
        const maxX = window.innerWidth - 100; // Allow 100px visible on right
        const minY = 0; // Don't allow dragging above top bar
        const maxY = window.innerHeight - 100; // Allow 100px visible at bottom

        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        return { ...w, x: newX, y: newY };
      })
    );
  };

  // Goby logo sprite state
  const gobySrc =
    gobyState === "click"
      ? GobyClick
      : gobyState === "hover"
      ? GobyHover
      : GobyIdle;

  // Render window content based on app registry
  const renderWindowContent = (windowId) => {
    const app = APPS[windowId];
    if (!app) return null;

    const Component = app.component;

    // Pass special props to Settings window
    if (windowId === "settings") {
      return (
        <Component
          backgrounds={backgrounds}
          backgroundId={backgroundId}
          setBackgroundId={setBackgroundId}
          filters={filters}
          filterId={filterId}
          setFilterId={setFilterId}
        />
      );
    }

    return <Component />;
  };

  const handleDesktopIconClick = (appId) => {
    if (canvasMode && appId !== "canvas") {
      // Keep desktop interaction paused while Canvas Mode is active
      return;
    }
    openWindow(appId);
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      {/* Desktop background */}
      <div
        className={`w-full h-full ${bgClassName}`}
        style={{ ...bgStyle, filter: filter.css }}
      >
        {/* Top bar */}
        <div className="w-full h-12 bg-[#ffd836] border-b border-black flex items-center justify-between px-4 text-xs font-medium">
          {/* LEFT: Goby + Danilarious.art */}
          <div className="flex items-center gap-6">
            <button
              className="flex items-center gap-2"
              onClick={() =>
                window.open(
                  "https://www.instagram.com/danilarious_art/",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              onMouseEnter={() => setGobyState("hover")}
              onMouseLeave={() => setGobyState("idle")}
              onMouseDown={() => setGobyState("click")}
              onMouseUp={() => setGobyState("hover")}
            >
              <img
                src={gobySrc}
                alt="Danilarious Goby"
                className="w-8 h-8 object-contain"
              />
              <span className="font-semibold text-sm">Danilarious.art</span>
            </button>
          </div>

          {/* RIGHT: Analog clock only */}
          <div className="flex items-center justify-end flex-1">
            <AnalogClock />
          </div>
        </div>

        {!canvasMode && (
          <>
            {/* Desktop icons – responsive: vertical stack on desktop, iOS-style grid on mobile */}
            <div className="absolute top-24 right-8 flex flex-col gap-8 text-xs text-black items-center md:flex-col md:top-24 md:right-8 max-md:top-20 max-md:left-0 max-md:right-0 max-md:grid max-md:grid-cols-4 max-md:gap-6 max-md:px-6">
              {DESKTOP_ICONS.map((icon) => {
                const app = APPS[icon.appId];
                return (
                  <DesktopIcon
                    key={icon.id}
                    label={icon.label}
                    emoji={app.emoji}
                    iconSrc={app.iconSrc}
                    onClick={() => handleDesktopIconClick(icon.appId)}
                  />
                );
              })}
            </div>

            {/* Windows */}
            {windows.map((w) =>
              !w.isOpen ? null : (
                <motion.div
                  key={w.id}
                  drag
                  dragMomentum={false}
                  onDragEnd={(e, info) => onDragEnd(w.id, e, info)}
                  onMouseDown={() => bringToFront(w.id)}
                  className="absolute flex flex-col overflow-hidden"
                  style={{
                    width: w.width,
                    height: w.height,
                    zIndex: w.zIndex,
                    x: w.x,
                    y: w.y,
                  }}
                >
                  <WindowChrome
                    title={w.title}
                    active={activeId === w.id}
                    onClose={() => closeWindow(w.id)}
                    theme={windowTheme}
                    onCycleTheme={cycleWindowTheme}
                  >
                    {renderWindowContent(w.id)}
                  </WindowChrome>
                </motion.div>
              )
            )}
          </>
        )}

        {/* Canvas mode overlay */}
        {canvasMode && (
          <div className="absolute inset-x-0 top-12 bottom-0 z-40">
            <CanvasApp onExit={() => setCanvasMode(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
