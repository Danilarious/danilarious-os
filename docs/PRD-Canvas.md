# Danilarious OS × Canvas – Product & Tech Plan

*Last updated: December 2024*

> Update (2025-12-13): See `docs/PRD-Canvas-2025-12-13.md` for the current Canvas mode architecture, fixes, and mobile stance. Note that the correct mobile layout keeps icons in an iOS-style top grid; any previous “bottom dock” mentions are outdated.

## 0. Context

**Danilarious OS (BxOS)** is a retro-desktop-style web experience mimicking a 90s Mac/OS environment with draggable windows, a top bar, a live clock, and desktop icons. It is currently deployed at:

- **Production:** https://danilarious-os.netlify.app/
- **Repo:** https://github.com/danilarious/danilarious-os

The long-term goal is to turn this OS into a home for multiple interactive **apps**, starting with **Danilarious Canvas** – a kaleidoscopic, SVG-focused drawing / art-playground experience – plus other experimental tools, galleries, and Easter eggs.

**This document outlines:**

1. How to evolve the **OS architecture** so it can host apps cleanly.
2. How to integrate **Danilarious Canvas** into that OS.
3. A phased roadmap so work can be done incrementally via branches/PRs.

**Related documentation:**
- See `docs/VISION.md` for brand identity, aesthetics, and creative direction
- See `docs/ARCHITECTURE.md` for technical implementation details (WebGL, two-canvas system, etc.)
- See `docs/GETTING-STARTED.md` for Cursor workflow and example prompts

---

## 1. Goals & Non-Goals

### 1.1 Goals

- Turn the current OS into a **multi-app shell**, not a single-page demo.
- Add a simple, predictable structure for:
  - Projects / gallery data (file-based "database" for now).
  - App registry and window management.
- Define where and how **Danilarious Canvas** will live inside the OS.
- Keep the codebase **small, readable, and Cursor-friendly**.
- Preserve and extend the **retro Mac / OS9 aesthetic** and Danilarious palette.

### 1.2 Non-Goals

- No backend or multi-user auth yet.
- No live collaboration or shared canvases.
- No CMS integration until later.
- No complex mobile UI until core desktop behavior is solid.

---

## 2. Current State (High-Level)

### Frontend Stack

- Vite + React
- TailwindCSS
- Framer Motion

### Components

`App.jsx` currently combines:
- Desktop background
- Top bar
- Clock
- Desktop icons
- Window state
- Window content logic

### Deployment

- GitHub → Netlify (auto-deploy from `main` branch)

### Current Limitations

- Window system is hardcoded.
- No app registry.
- Project data inline.
- No place for future apps.

---

## 3. Architecture Direction

The OS should evolve to include:

- A central **app registry** (`src/config/apps.js`)
- Separate **window content components** (`src/windows/`)
- Shared **data modules** (`src/data/projects.js`, etc.)
- A clear place for **CanvasApp** to live (`src/apps/CanvasApp/`)

**Technical details:** See `docs/ARCHITECTURE.md` for Canvas implementation specifics (Konva + WebGL two-canvas system, shader code, state management).

---

## 4. Phased Plan

This section expands the phased roadmap in more detail, including concrete next steps for the repo and Canvas.

---

### Phase 0 – Stabilize Current OS ✅ (Done / Ongoing)

**Objective:** Ensure current OS is stable, deployable, and easy to change.

- ✅ Repo initialized with Git, GitHub remote set.
- ✅ Deployed on Netlify from `main`.
- ✅ Basic window system and theming in place.

**Ongoing practices**

Use simple Git workflow for changes:
```bash
git add .
git commit -m "feat: short description"
git push
```

Confirm `npm run build` passes before pushing bigger refactors.

---

### Phase 1 – OS Ready for Apps

**Objective:** Refactor the OS just enough so adding apps (including Canvas) is clean and doesn't require rewiring everything later.

#### 1A. Projects Data + Gallery Structure

**Goal:** Make the Projects window real and future-proof without jumping into a full backend yet.

**Why now**

- The Projects window already exists; wiring it to real data is low-friction.
- Forces us to define how apps/projects are represented in code, which matters for Canvas and all future apps.
- We can keep it file-based now and later swap to a CMS/DB without rewriting UI components.

**What to implement**

1. Create a `src/data/projects.js` (or `.ts`) file with an array of project objects:

```js
// src/data/projects.js
export const PROJECTS = [
  {
    id: "plastic-thoughts",
    title: "Plastic Thoughts",
    type: "series",
    status: "in-progress",
    slug: "plastic-thoughts",
    thumb: "/art/plastic-thoughts/thumb.svg",
    images: [
      "/art/plastic-thoughts/01.svg",
      "/art/plastic-thoughts/02.svg",
    ],
    tags: ["sculpture", "desk", "memphis"],
    shortDescription: "Surreal desk sculptures and characters, bold color blocks and Memphis energy.",
    year: 2025,
  },
  // ...more projects as needed
];
```

2. Store artwork under `public/art/<project-slug>/...`:
   - Example: `public/art/plastic-thoughts/01.svg`.
   - Code only holds **paths + metadata**, never binary image data.

3. Update `ProjectsWindowContent` to:
   - Import `PROJECTS`.
   - Map entries into cards/rows (reusing the current visual style).

This acts as a **pseudo-database** that is:
- Easy to edit by hand.
- Friendly for Git.
- Ready to be replaced by a real backend or CMS later.

#### 1B. Basic Responsive / Mobile Layout

**Goal:** Make sure the OS doesn't feel broken on phones.

**Why now**

- Easier to make layout responsive while the codebase is small.
- Affects almost every future feature (Canvas, draw tools, games, etc.).

**MVP mobile behavior**

**App Icons:**
- Desktop: icons on the right side (current behavior).
- Mobile: icons centered horizontally in the style of typical iOS Mobile home

**Windows:**
- On small screens, windows should:
  - Either open near-max width and height, or
  - Have constrained drag so they cannot disappear off-screen.

**Background grid:**
- Keep the grid on mobile, but consider reduced density or lower contrast on very small screens.

This can be achieved with a handful of Tailwind responsive utilities and bounds/guard logic around drag behavior.

#### 1C. App Registry and Window Content Extraction

**Goal:** Turn the OS into a generic multi-app shell.

**What to implement**

1. Create `src/config/apps.js`:

```js
import { AboutWindowContent } from "../windows/AboutWindowContent";
import { SettingsWindowContent } from "../windows/SettingsWindowContent";
import { ProjectsWindowContent } from "../windows/ProjectsWindowContent";
// CanvasApp will be added in Phase 2/3

export const APPS = {
  about: {
    id: "about",
    title: "About",
    iconId: "about", // maps to eye.svg or similar
    component: AboutWindowContent,
  },
  settings: {
    id: "settings",
    title: "Settings",
    iconId: "settings",
    component: SettingsWindowContent,
  },
  projects: {
    id: "projects",
    title: "Projects",
    iconId: "projects",
    component: ProjectsWindowContent,
  },
  // canvas: added in Phase 2/3
};
```

2. Extract window content components into dedicated files:
   - `src/windows/AboutWindowContent.jsx`
   - `src/windows/SettingsWindowContent.jsx`
   - `src/windows/ProjectsWindowContent.jsx`

3. Refactor `App.jsx` so that:
   - Window metadata references `APPS` by ID.
   - Window rendering resolves the correct component from `APPS[id].component`.

**Outcome for Phase 1**

- ✅ App registry in place.
- ✅ Window content separated from the shell.
- ✅ Projects window fed by `src/data/projects.js`.
- ✅ OS still looks/feels the same, but is structurally **app-ready** and mobile-aware.

---

### Phase 2 – Canvas Entry Point in the OS

**Objective:** Create a clean integration point for Canvas inside the OS UX, without implementing the full drawing engine yet.

#### 2.1 Add a Canvas App Shell

Add Canvas to the app registry in `src/config/apps.js`:

```js
import { CanvasAppShell } from "../apps/CanvasAppShell";

export const APPS = {
  // existing apps...
  canvas: {
    id: "canvas",
    title: "Danilarious Canvas",
    iconId: "canvas", // maps to a canvas icon in the dock
    component: CanvasAppShell,
  },
};
```

Create `src/apps/CanvasAppShell.jsx`:

```jsx
export function CanvasAppShell() {
  return (
    <div className="text-[12px] leading-relaxed space-y-2">
      <p>
        This will become the Danilarious Canvas – a kaleidoscopic SVG playground
        for drawing, color shifting, and exporting art.
      </p>
      <p>
        For now, this is just a placeholder. Over time, this window will host
        the full Canvas app.
      </p>
    </div>
  );
}
```

#### 2.2 Add a Desktop Icon for Canvas

Add a new desktop icon entry associated with `canvas`:
- Either inline in `App.jsx` or in a `DESKTOP_ICONS` config.
- Clicking it should call `openWindow("canvas")`.

#### 2.3 Decide Canvas Integration Strategy

**Two options:**

**Option A – Embedded App Component (Recommended)**
- Canvas lives as a React component at `src/apps/CanvasApp/CanvasApp.jsx`.
- Has direct access to React hooks, theme utilities, and the Danilarious palette.
- Feels more integrated, easier to evolve.
- **This is the recommended approach.**

**Option B – Iframe-based App**
- Canvas is a separate app deployed elsewhere (e.g. `canvas.danilarious.art`).
- OS window embeds it via an `<iframe src="https://canvas.danilarious.art" />`.
- Useful if Canvas becomes very complex or needs a different stack.

**Recommendation:** Start with **Option A** for the MVP. An iframe-based approach can be introduced later if separation becomes necessary.

**Outcome for Phase 2**

- ✅ Clicking a Canvas desktop icon opens a window with a Canvas placeholder.
- ✅ The OS has a clear conceptual place where Canvas "lives."

---

### Phase 3 – Danilarious Canvas MVP

**Objective:** Implement a first usable version of Canvas inside the OS.

**Note:** For detailed technical implementation (two-canvas architecture, WebGL shaders, Konva setup), see `docs/ARCHITECTURE.md`.

#### 3.1 Canvas MVP Scope

**Core behaviors:**

**Canvas area:**
- A drawing surface within the window (over the grid or inside its own pane).

**Asset Library:**
- Left panel with draggable SVG assets (shapes, characters, scenes, extras/parts)
- Click or drag to add to canvas

**Interaction (Konva layer):**
- Drag to move assets
- Bounding box with rotation/scale handles
- Layer reordering (bring to front/back)
- No effects applied on this layer

**Effects (WebGL layer):**
- Kaleidoscope overlay (adjustable segments: 3, 6, 8, 12, etc.)
- Hue shift slider (0-360 degrees, affects all elements)
- Rotation animation (speed control)
- Toggle effects on/off

**Palette:**
- Swatches from the official Danilarious palette (see `docs/VISION.md`)

**Export:**
- PNG with Danilarious logo watermark
- (Phase 4: Looping GIF export)

**Persistence:**
- Save/load to `localStorage` per browser instance

#### 3.2 Canvas Architecture

**File:** `src/apps/CanvasApp/CanvasApp.jsx`

**Internal state model (Zustand):**

```ts
interface CanvasElement {
  id: string;
  assetId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

interface CanvasState {
  elements: CanvasElement[];
  kaleidoscope: {
    enabled: boolean;
    segments: number;
    rotationSpeed: number;
  };
  hueShift: number; // 0-360
}
```

**Component structure:**
- `CanvasApp.tsx` - Main container
- `components/KonvaCanvas.tsx` - Interaction layer (drag/drop/transform)
- `components/WebGLCanvas.tsx` - Effects layer (kaleidoscope + hue shift)
- `components/AssetLibrary.tsx` - Left panel with draggable assets
- `components/EffectsPanel.tsx` - Right panel with effect controls
- `components/Toolbar.tsx` - Top bar with save/export/clear
- `hooks/useCanvasStore.ts` - Zustand state management

**Persistence:**

```js
const STORAGE_KEY = "danilarious-canvas-doc";

// on change (debounced)
const saveState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(canvasState));
};

// on mount
const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) setCanvasState(JSON.parse(saved));
};
```

#### 3.3 Integration with OS

- The OS is agnostic about Canvas internals.
- OS handles:
  - Opening/closing the Canvas window.
  - Position/z-index.
  - WindowChrome frame/theming.
- Canvas is responsible for its own internal state and UX.

**Outcome for Phase 3**

- ✅ Functional Canvas app that:
  - Lets users drag SVG assets onto canvas
  - Apply kaleidoscope and hue-shift effects in real-time
  - Export branded PNG images
  - Saves state in `localStorage`
  - Matches Danilarious aesthetic (see `docs/VISION.md`)

---

### Phase 4 – Enhancements / Easter Eggs / Other Apps

**Objective:** Layer flavor and discoverability on top of the solid shell.

#### 4.1 Simple Easter Eggs (Good Early Targets)

**Logo click modes:**
- Click `Danilarious.art` in the top-left to cycle OS "skins" (palette swaps).
- Long-press or double-click to reveal a hidden "About the OS" app icon.

**Clock interactions:**
- Click the clock to toggle global dark mode (reusing window theme logic globally).
- Long-press for hidden timezones or secret messages.

**Grid surprises:**
- Randomly render a few special grid cells that change color on hover.
- Clicking them opens mini-windows with random messages, art, or links.

All of this can live behind:
- An `easterEggs` helper module.
- A light global UI state (React context or a top-level state object in `App.jsx`).

#### 4.2 tldraw / Excalidraw Overlay (Optional)

Add a hidden or explicit "Draw Mode" app that:
- Opens a full-window overlay based on tldraw or Excalidraw.
- Uses the OS grid as visual context.

**MVP:**
- No persistence (refresh loses the drawing).
- Later, add export or localStorage persistence.

#### 4.3 Contact App

A "Contact" app as a window:
- Name, email, message fields.
- v1: integrate with Netlify Forms or a small serverless function.

#### 4.4 Rich Easter Egg Systems (Later)

- Hidden key combos (e.g., Konami code) to reveal special windows.
- Unlockable side-scrolling or additional desktop areas.
- Animated characters walking across the desktop or appearing in response to triggers.

#### 4.5 Canvas Phase 4 Features

- **GIF Export:** Looping animated GIFs of kaleidoscope + hue shift
- **Backend Persistence:** Save/load canvas projects to Cloudflare D1
- **Shareable Links:** Generate URLs to load specific canvas compositions
- **Admin Panel:** Upload new SVG assets, organize categories
- **Advanced Effects:** Bilateral symmetry, more kaleidoscope patterns

---

### Recommended Immediate Next Steps

**To start Phase 1:**

1. **Refactor Projects into `src/data/projects.js` and hook the UI to that.**
2. **Add basic responsive behavior for dock + windows (mobile layout).**
3. **Create app registry in `src/config/apps.js`.**
4. **Extract window content components into `src/windows/`.**

**Optional (fun!):**
5. **Add one tiny Easter egg (logo click cycles header theme).**

**This yields:**
- ✅ Real content structure for projects.
- ✅ A site that doesn't feel broken on mobile.
- ✅ App-ready architecture for Canvas integration.
- ✅ One fun interaction in production to set the tone for future discoveries.

---

## 5. Repo Structure (Target)

```text
src/
  apps/
    CanvasApp/
      CanvasApp.tsx               # Main canvas container
      components/
        KonvaCanvas.tsx           # Interaction layer
        WebGLCanvas.tsx           # Effects layer
        AssetLibrary.tsx          # Left panel
        EffectsPanel.tsx          # Right panel
        Toolbar.tsx               # Top controls
      hooks/
        useCanvasStore.ts         # State management
        useWebGLEffects.ts        # WebGL setup
      shaders/
        kaleidoscope.frag         # GLSL shader
        hueShift.frag             # GLSL shader
      utils/
        export.ts                 # PNG/GIF generation
    CanvasAppShell.jsx            # Phase 2 placeholder
    // future apps...
  config/
    apps.js                       # App registry
  data/
    projects.js                   # Project metadata
    assets.js                     # Canvas SVG assets (MVP)
  windows/
    AboutWindowContent.jsx
    SettingsWindowContent.jsx
    ProjectsWindowContent.jsx
  components/
    DesktopIcon.jsx
    WindowChrome.jsx
    AnalogClock.jsx
    // any reusable chunks
  App.jsx
  main.jsx

docs/
  VISION.md                       # Brand & aesthetics
  ARCHITECTURE.md                 # Technical implementation
  PRD-Canvas.md                   # This file
  GETTING-STARTED.md              # Cursor workflow

assets/
  icons/                          # Desktop icons

public/
  art/
    <project-slug>/
      01.svg
      02.svg
      thumb.svg
```

---

## 6. Cursor Workflow

**Suggested workflow for changes:**

1. **Optionally create a feature branch:**
   ```bash
   git checkout -b feature/app-registry
   ```

2. **Edit in Cursor:** Refactor components and data per this PRD.
   - Use `@docs/PRD-Canvas.md`, `@docs/ARCHITECTURE.md`, `@docs/VISION.md` to give Claude context
   - See `docs/GETTING-STARTED.md` for example prompts

3. **Test locally:**
   ```bash
   npm run dev
   ```

4. **Check production build:**
   ```bash
   npm run build
   ```

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add app registry and projects data module"
   git push
   ```

6. **Merge to `main`, Netlify auto-deploys.**

**Commit message conventions:**
- `feat(canvas):` - New Canvas feature
- `feat(os):` - OS shell enhancement
- `fix:` - Bug fix
- `refactor:` - Code restructure
- `style:` - UI/styling changes
- `docs:` - Documentation updates

---

## 7. Open Questions / To Clarify Later

- Exact initial feature set of Canvas (kaleidoscope behavior, randomization, layer system, etc.).
  - *Partially answered in `docs/ARCHITECTURE.md` - WebGL kaleidoscope with adjustable segments*
- Whether Canvas should export preset sizes for print, NFT minting, etc.
  - *Phase 4+ feature*
- How much OS UI should be unlockable vs visible by default.
- When to introduce a CMS or backend for galleries and projects.
  - *Phase 4+ - start with file-based in Phase 1*

---

## Summary: The Path Forward

**Phase 0:** ✅ OS is stable and deployed

**Phase 1 (Next):** Make OS app-ready
1. Projects data structure
2. Mobile responsive layout
3. App registry + window content extraction

**Phase 2:** Add Canvas entry point
1. Canvas app shell (placeholder)
2. Desktop icon
3. Window integration

**Phase 3:** Build Canvas MVP
1. Konva interaction layer
2. WebGL effects layer
3. Asset library + controls
4. Export functionality

**Phase 4+:** Enhancements
1. Easter eggs
2. GIF export
3. Backend persistence
4. Additional apps

**Let's build this step by step, keeping it fun and Danilarious!** 🎨
