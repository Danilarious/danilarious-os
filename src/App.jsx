// src/App.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// --- ICON IMPORTS ---
import GobyIdle from "./assets/icons/Goby.svg";
import GobyHover from "./assets/icons/Goby_hover.svg";
import GobyClick from "./assets/icons/Goby_click.svg";

import aboutIcon from "./assets/icons/eye.svg";
import settingsIcon from "./assets/icons/radio.svg";
import projectsIcon from "./assets/icons/yellow.svg";

// --- COLOR THEMES (from your palette) ---

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

// --- WINDOW + THEME CONFIG ---

const initialWindows = [
  {
    id: "about",
    title: "About",
    x: 300,
    y: 140,
    width: 420,
    height: 260,
    isOpen: false,
    zIndex: 1,
  },
  {
    id: "settings",
    title: "Settings",
    x: 220,
    y: 160,
    width: 320,
    height: 260,
    isOpen: false,
    zIndex: 1,
  },
  {
    id: "projects",
    title: "Projects",
    x: 260,
    y: 200,
    width: 420,
    height: 280,
    isOpen: false,
    zIndex: 1,
  },
];

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
  const [windows, setWindows] = useState(initialWindows);
  const [activeId, setActiveId] = useState(null);
  const [backgroundId, setBackgroundId] = useState("grid");
  const [filterId, setFilterId] = useState("normal");
  const [zCounter, setZCounter] = useState(10);
  const [gobyState, setGobyState] = useState("idle"); // 'idle' | 'hover' | 'click'

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
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isOpen: true, zIndex: zCounter + 1 } : w
      )
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
      prev.map((w) =>
        w.id === id ? { ...w, x: w.x + dx, y: w.y + dy } : w
      )
    );
  };

  // Goby logo sprite state
  const gobySrc =
    gobyState === "click"
      ? GobyClick
      : gobyState === "hover"
      ? GobyHover
      : GobyIdle;

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

        {/* Desktop icons – right side stack */}
        <div className="absolute top-24 right-8 flex flex-col gap-8 text-xs text-black items-center">
          <DesktopIcon
            label="About.me"
            emoji="🧠"
            iconSrc={aboutIcon}
            onClick={() => openWindow("about")}
          />
          <DesktopIcon
            label="Settings"
            emoji="⚙️"
            iconSrc={settingsIcon}
            onClick={() => openWindow("settings")}
          />
          <DesktopIcon
            label="Projects"
            emoji="📁"
            iconSrc={projectsIcon}
            onClick={() => openWindow("projects")}
          />
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
                {w.id === "about" && <AboutWindowContent />}
                {w.id === "settings" && (
                  <SettingsWindowContent
                    backgrounds={backgrounds}
                    backgroundId={backgroundId}
                    setBackgroundId={setBackgroundId}
                    filters={filters}
                    filterId={filterId}
                    setFilterId={setFilterId}
                  />
                )}
                {w.id === "projects" && <ProjectsWindowContent />}
              </WindowChrome>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}

// --- ANALOG CLOCK COMPONENT ---

function AnalogClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const minuteAngle = (minutes + seconds / 60) * 6;
  const hourAngle = ((hours % 12) + minutes / 60) * 30;

  const tickColors = [
    "#EFAB96",
    "#FBAD26",
    "#567DBE",
    "#E69824",
    "#EBA5AD",
    "#56B57F",
    "#E7BD3D",
    "#6E86C2",
    "#EB784B",
    "#D5757F",
    "#7DB4A6",
    "#6598AC",
  ];

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI;
    const inner = 34;
    const outer = 44;
    const x1 = 50 + inner * Math.cos(angle);
    const y1 = 50 + inner * Math.sin(angle);
    const x2 = 50 + outer * Math.cos(angle);
    const y2 = 50 + outer * Math.sin(angle);
    return { x1, y1, x2, y2, color: tickColors[i % tickColors.length], i };
  });

  return (
    <div className="w-10 h-10">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="#fffdf8"
          stroke="#000000"
          strokeWidth="2.5"
        />

        {ticks.map((t) => (
          <line
            key={t.i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.color}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        ))}

        <line
          x1="50"
          y1="50"
          x2="50"
          y2="30"
          stroke="#2D2726"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${hourAngle} 50 50)`}
        />

        <line
          x1="50"
          y1="50"
          x2="50"
          y2="22"
          stroke="#FBAD26"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} 50 50)`}
        />

        <circle cx="50" cy="50" r="2.7" fill="#000000" />
      </svg>
    </div>
  );
}

// --- PRESENTATIONAL COMPONENTS ---

function DesktopIcon({ label, emoji, onClick, iconSrc }) {
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

// Old-Mac style window chrome
function WindowChrome({
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

function AboutWindowContent() {
  return (
    <div className="space-y-2 text-[12px] leading-relaxed">
      <h2 className="text-sm font-bold mb-1">
      Digitally Amplified Narrative Illustrations Leveraging Artificially Realized Iterations Of Unique Sketches, Drawings, Original Thoughts, And Rendering Techniques
      </h2>
      <p>
      What if technology could help us understand more about ourselves, not suck the well of human creativity dry, but instead become a personalized divining rod for discovering internal wellsprings of creativity, passion, ideas, and possibilities?
      </p>
      <p>
      Danilarious.art bridges two worlds that are often seen as opposed: tactile, human creation and the experimental feedback loop of iterative AI. For several years now, our digital overlords have been coaching us to approach generative AI as something that generates outcomes for us  Every artwork on this site originates as an original sketch or vector illustration—never prompted into existence without personal creations attached, and never co-prompted with art borrowed from other artists:  
      </p>
    </div>
  );
}

function ProjectsWindowContent() {
  const projects = [
    {
      id: "plastic-thoughts",
      title: "Plastic Thoughts (placeholder)",
      description:
        "Surreal desk sculptures and characters, bold color blocks and Memphis energy.",
      status: "OPEN",
    },
    {
      id: "danilarious-world-level-1",
      title: "Danilarious World: Level 1",
      description:
        "Intro world with core characters and interactive hero scene.",
      status: "OPEN",
    },
  ];

  return (
    <div className="space-y-3 text-[12px] leading-relaxed">
      <p>
        Placeholder projects for now. Each of these will eventually open its
        own window or deep-link into a gallery / case study.
      </p>

      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border border-black/40 bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.35)] flex items-start justify-between px-3 py-2"
          >
            <div className="pr-4">
              <div className="font-bold mb-1">{project.title}</div>
              <div>{project.description}</div>
            </div>

            <button className="text-[11px] uppercase border border-black px-2 py-1 bg-[#F5F4EF] hover:bg-black hover:text-white transition">
              {project.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


function SettingsWindowContent({
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
