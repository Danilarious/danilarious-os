# Danilarious Canvas - Technical Architecture

## Overview

This document outlines the technical architecture for Danilarious Canvas—an interactive SVG art playground with kaleidoscopic effects and hue shifting, embedded within the Danilarious OS retro-desktop website.

**Core Technical Challenge:** Enable complex visual effects (kaleidoscope symmetry, hue rotation, animated motion) on user-manipulated SVG assets while maintaining 60fps performance and intuitive drag-and-drop interactions.

**Solution:** Two-canvas architecture separating interaction (Konva.js) from effects rendering (WebGL).

---

## Tech Stack

### Frontend Core

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Framework** | React | 18.2+ | Component architecture, hooks-based state, wide ecosystem |
| **Language** | TypeScript | 5.1+ | Type safety, better DX, catches errors at compile time |
| **Build Tool** | Vite | 5.x | Fast dev server, optimized production builds, glsl plugin support |
| **Styling** | TailwindCSS | 3.3+ | Utility-first, rapid responsive design, matches OS aesthetic |
| **Animation** | Framer Motion | 11.x | Smooth window animations, spring physics for delightful interactions |

### Canvas & Effects

| Component | Technology | Why This Choice |
|-----------|-----------|-----------------|
| **2D Interaction Canvas** | Konva.js | 9.3+ - Lightweight, excellent SVG support, virtual rendering for 100+ objects, familiar transform controls |
| **Effects Rendering** | WebGL 2.0 | GPU-accelerated shaders for kaleidoscope/hue-shift at 60fps, minimal CPU load |
| **Shader Management** | Custom GLSL | Fragment shaders for kaleidoscope mirroring and hue rotation, vertex shaders for geometry |
| **Color Manipulation** | chroma.js | 2.4+ - Accurate HSL/HSV transformations, lightweight (12kb) |

**Why NOT Fabric.js:** Konva has better performance with 100+ SVG objects and cleaner API for our use case.

**Why NOT Three.js:** Overkill for 2D effects; raw WebGL gives us more control and smaller bundle size.

### State & Data

| Concern | Technology | Notes |
|---------|-----------|-------|
| **State Management** | Zustand | 4.4+ - Lightweight (3kb), no boilerplate, perfect for canvas state |
| **Persistence** | localStorage | Phase 1: Browser-local saves; Phase 2: Backend sync |
| **Database** | Cloudflare D1 (SQLite) | Serverless SQL, free tier generous, local dev with Wrangler |
| **File Storage** | Cloudflare R2 | S3-compatible, cheaper egress, integrated with Workers |

### Backend (Admin Panel & API)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Cloudflare Workers | Edge compute, zero cold starts, built-in KV/D1/R2 |
| **Framework** | Hono (TypeScript) | Workers-optimized, Express-like API, tiny bundle |
| **Auth** | Custom JWT (Web Crypto) | Workers-compatible, no Node.js crypto deps |
| **File Uploads** | Multipart parsing + R2 | Direct-to-edge uploads, virus scanning via Worker |

**Why Cloudflare Stack:** Danilarious OS already deployed on Cloudflare Pages/Netlify. Unified platform reduces complexity, Pages <-> Workers integration is seamless.

### Deployment

| Environment | Platform | Details |
|-------------|----------|---------|
| **Frontend** | Cloudflare Pages or Netlify | Auto-deploy from GitHub main branch |
| **Backend API** | Cloudflare Workers | Deployed via Wrangler CLI |
| **Assets (SVGs)** | Cloudflare R2 | CDN-backed, signed URLs for security |
| **Database** | D1 (SQLite at edge) | Replicated across Cloudflare's network |

---

## Two-Canvas Architecture

### The Problem

Users need to:
1. Drag, rotate, and scale SVG assets (2D manipulation)
2. See real-time kaleidoscope effects (GPU-intensive mirroring)
3. Apply hue shifts across all elements simultaneously
4. Maintain 60fps even with 50+ assets on screen

**Single-canvas approaches fail because:**
- Konva can't do GPU shaders (it's canvas2D API)
- WebGL doesn't have friendly drag-drop/transform UX
- Rendering effects in Konva is too slow for real-time

### The Solution: Layered Rendering Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  USER INTERACTION LAYER (Konva.js)                      │
│  ┌────────────────────────────────────────────────┐     │
│  │  Konva Stage (Canvas 2D Context)               │     │
│  │  • Drag/drop SVG assets from library           │     │
│  │  • Bounding boxes with rotation handles        │     │
│  │  • Layer reordering (bring to front/back)      │     │
│  │  • NO color effects applied here               │     │
│  └────────────────────────────────────────────────┘     │
│                      │                                   │
│                      │ toDataURL() on user action        │
│                      ▼                                   │
│  ┌────────────────────────────────────────────────┐     │
│  │  Hidden Canvas (Snapshot Buffer)               │     │
│  │  • Receives Konva.Stage.toDataURL()            │     │
│  │  • Converted to ImageData                      │     │
│  │  • Used as WebGL texture source                │     │
│  └────────────────────────────────────────────────┘     │
│                      │                                   │
│                      │ gl.texImage2D(snapshot)           │
│                      ▼                                   │
│  ┌────────────────────────────────────────────────┐     │
│  │  WebGL Canvas (Effects Display)                │     │
│  │  • Fragment shader: kaleidoscope mirroring     │     │
│  │  • Fragment shader: hue rotation (HSL)         │     │
│  │  • Vertex shader: optional rotation animation  │     │
│  │  • Runs at 60fps via requestAnimationFrame     │     │
│  └────────────────────────────────────────────────┘     │
│                      │                                   │
│                      │ Composited final image            │
│                      ▼                                   │
│               [User sees result]                         │
└─────────────────────────────────────────────────────────┘
```

### Implementation Details

**Canvas 1: Konva Stage (Interaction)**
```typescript
// Konva handles all user manipulation
const stage = new Konva.Stage({
  container: 'konva-container',
  width: 800,
  height: 600,
});

const layer = new Konva.Layer();
stage.add(layer);

// Add SVG as Konva.Image with transform controls
const imageObj = new Image();
imageObj.src = svgDataUrl;
imageObj.onload = () => {
  const konvaImage = new Konva.Image({
    image: imageObj,
    draggable: true,
  });
  
  // Add transformer for rotation/scale handles
  const tr = new Konva.Transformer({
    nodes: [konvaImage],
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    rotateEnabled: true,
  });
  
  layer.add(konvaImage, tr);
  layer.draw();
};
```

**Snapshot Transfer:**
```typescript
// On user interaction or effect toggle, snapshot Konva
const updateWebGLTexture = () => {
  const dataURL = stage.toDataURL({ pixelRatio: 2 }); // High-res for quality
  const img = new Image();
  img.onload = () => {
    // Send to WebGL as texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  };
  img.src = dataURL;
};

// Throttle updates to avoid performance hit
const throttledUpdate = throttle(updateWebGLTexture, 100); // Max 10fps snapshot
```

**Canvas 2: WebGL (Effects)**
```glsl
// Fragment shader for kaleidoscope effect
precision mediump float;

uniform sampler2D u_texture;    // Konva snapshot
uniform vec2 u_resolution;
uniform float u_segments;       // Number of mirror segments (6, 8, 12, etc.)
uniform float u_rotation;       // Rotation angle for animation
uniform float u_hueShift;       // Hue rotation amount (0-360)

varying vec2 v_texCoord;

// Kaleidoscope mirror logic
vec2 kaleidoscope(vec2 uv, float segments) {
  vec2 centered = uv - 0.5;
  float angle = atan(centered.y, centered.x);
  float radius = length(centered);
  
  float segmentAngle = 2.0 * 3.14159 / segments;
  float mirroredAngle = mod(angle, segmentAngle);
  
  // Mirror every other segment
  if (mod(floor(angle / segmentAngle), 2.0) == 1.0) {
    mirroredAngle = segmentAngle - mirroredAngle;
  }
  
  return vec2(cos(mirroredAngle), sin(mirroredAngle)) * radius + 0.5;
}

// RGB to HSL and back for hue shifting
vec3 hueShift(vec3 color, float shift) {
  // Convert RGB -> HSL
  float maxC = max(max(color.r, color.g), color.b);
  float minC = min(min(color.r, color.g), color.b);
  float delta = maxC - minC;
  
  float h = 0.0;
  if (delta > 0.0) {
    if (maxC == color.r) {
      h = mod((color.g - color.b) / delta, 6.0);
    } else if (maxC == color.g) {
      h = (color.b - color.r) / delta + 2.0;
    } else {
      h = (color.r - color.g) / delta + 4.0;
    }
    h /= 6.0;
  }
  
  h = mod(h + shift / 360.0, 1.0);
  
  // Convert HSL -> RGB (simplified)
  // [Full HSL->RGB conversion code here]
  return reconstructedRGB;
}

void main() {
  vec2 uv = v_texCoord;
  
  // Apply kaleidoscope if enabled
  if (u_segments > 1.0) {
    uv = kaleidoscope(uv, u_segments);
  }
  
  // Sample texture
  vec4 color = texture2D(u_texture, uv);
  
  // Apply hue shift
  if (u_hueShift != 0.0) {
    color.rgb = hueShift(color.rgb, u_hueShift);
  }
  
  gl_FragColor = color;
}
```

**Animation Loop:**
```typescript
let animationId: number;

const renderWebGL = (time: number) => {
  // Update uniforms for animation
  gl.uniform1f(u_rotation, time * 0.001 * rotationSpeed);
  gl.uniform1f(u_hueShift, hueShiftValue);
  gl.uniform1f(u_segments, kaleidoscopeSegments);
  
  // Draw quad with shader applied
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  
  animationId = requestAnimationFrame(renderWebGL);
};

// Start/stop animation
const startEffects = () => {
  if (!animationId) {
    animationId = requestAnimationFrame(renderWebGL);
  }
};

const stopEffects = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};
```

### Performance Optimizations

**Throttled Snapshot Updates:**
- Only re-snapshot Konva when user stops interacting (drag end, not drag move)
- Use `lodash.throttle` or custom debounce (100-200ms delay)
- Reduces texture uploads to GPU

**WebGL Texture Reuse:**
- Single texture object, updated in-place
- No allocation/deallocation per frame
- Mipmap generation for smooth scaling

**Conditional Rendering:**
- If kaleidoscope/hue are both disabled, show Konva canvas directly (bypass WebGL)
- Only activate WebGL layer when effects are toggled on

**GPU Memory Management:**
- Limit canvas resolution to 2048x2048 max (most devices support this)
- Use `gl.NEAREST` filtering for crisp pixel art aesthetic (optional)

---

## State Management

### Zustand Store Structure

```typescript
interface CanvasElement {
  id: string;
  assetId: string;          // References uploaded SVG
  x: number;
  y: number;
  rotation: number;         // Degrees
  scale: number;
  zIndex: number;
  // Konva-specific props stored here
}

interface KaleidoscopeSettings {
  enabled: boolean;
  segments: number;         // 3, 6, 8, 12, etc.
  rotationSpeed: number;    // Degrees per second
  rotationDirection: 'cw' | 'ccw';
}

interface CanvasState {
  // Canvas content
  elements: CanvasElement[];
  
  // Effects
  kaleidoscope: KaleidoscopeSettings;
  hueShift: number;         // 0-360
  
  // Actions
  addElement: (asset: Asset, position: { x: number; y: number }) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  reorderElement: (id: string, direction: 'up' | 'down') => void;
  
  // Effects
  toggleKaleidoscope: (enabled: boolean) => void;
  setKaleidoscopeSegments: (segments: number) => void;
  setHueShift: (degrees: number) => void;
  
  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  exportAsJSON: () => string;
}

const useCanvasStore = create<CanvasState>((set, get) => ({
  elements: [],
  kaleidoscope: {
    enabled: false,
    segments: 6,
    rotationSpeed: 30,
    rotationDirection: 'cw',
  },
  hueShift: 0,
  
  addElement: (asset, position) => set((state) => ({
    elements: [
      ...state.elements,
      {
        id: nanoid(),
        assetId: asset.id,
        ...position,
        rotation: 0,
        scale: 1,
        zIndex: state.elements.length,
      },
    ],
  })),
  
  // ... other actions
  
  saveToLocalStorage: () => {
    const state = get();
    localStorage.setItem('danilarious-canvas', JSON.stringify({
      elements: state.elements,
      kaleidoscope: state.kaleidoscope,
      hueShift: state.hueShift,
    }));
  },
}));
```

### Persistence Strategy

**Phase 1 (MVP): localStorage**
- Save canvas state on every change (debounced)
- Load on mount
- No backend required
- Limitation: Per-browser, no sync

**Phase 2 (Future): Backend Sync**
- POST `/api/canvas/save` with canvas JSON
- GET `/api/canvas/:id` to load
- Optional: Auto-save every 30 seconds
- User accounts required

---

## Component Architecture

### File Structure

```
src/
├── apps/
│   └── CanvasApp/
│       ├── CanvasApp.tsx               # Main app container
│       ├── components/
│       │   ├── KonvaCanvas.tsx         # Interaction layer
│       │   ├── WebGLCanvas.tsx         # Effects layer
│       │   ├── AssetLibrary.tsx        # Left panel: draggable assets
│       │   ├── EffectsPanel.tsx        # Right panel: controls
│       │   ├── Toolbar.tsx             # Top: save/export/clear
│       │   └── ExportModal.tsx         # PNG/GIF export UI
│       ├── hooks/
│       │   ├── useCanvasStore.ts       # Zustand store
│       │   ├── useKonvaSync.ts         # Sync Konva <-> Zustand
│       │   └── useWebGLEffects.ts      # WebGL setup/animation
│       ├── shaders/
│       │   ├── kaleidoscope.frag       # GLSL fragment shader
│       │   ├── hueShift.frag           # GLSL hue rotation
│       │   └── vertex.vert             # Standard vertex shader
│       └── utils/
│           ├── export.ts               # PNG/GIF generation
│           └── colorUtils.ts           # chroma.js helpers
├── data/
│   └── assets.ts                       # Hardcoded SVG assets (MVP)
└── windows/
    └── CanvasWindowContent.tsx         # OS window wrapper
```

### Key Component Relationships

```
CanvasApp
├── Toolbar (save, export, clear)
├── AssetLibrary (left sidebar)
│   └── Draggable SVG thumbnails
├── CanvasStage (center)
│   ├── KonvaCanvas (interaction layer, hidden when effects active)
│   └── WebGLCanvas (effects layer, shown when kaleidoscope/hue enabled)
└── EffectsPanel (right sidebar)
    ├── Kaleidoscope controls
    ├── Hue shift slider
    └── Export button
```

---

## Integration with Danilarious OS

### Window Management

The OS already has a `windows` state array and `WindowChrome` component. Canvas integrates as:

```typescript
// In App.jsx (OS shell)
const initialWindows = [
  { id: 'about', title: 'About', ... },
  { id: 'settings', title: 'Settings', ... },
  { id: 'projects', title: 'Projects', ... },
  { id: 'canvas', title: 'Danilarious Canvas', x: 100, y: 100, width: 900, height: 700 },
];

// Window content rendering
{windows.map((w) => (
  <WindowChrome key={w.id} {...w}>
    {w.id === 'canvas' && <CanvasApp />}
    {/* other window contents */}
  </WindowChrome>
))}
```

**Desktop Icon:**
```typescript
<DesktopIcon
  id="canvas"
  label="Canvas"
  icon="/icons/canvas.svg"
  onClick={() => openWindow('canvas')}
/>
```

### Theme Integration

Canvas respects the OS theme system:

```typescript
// In CanvasApp
const { theme } = useOSContext(); // Danilarious palette

// Apply to UI elements
<div className={`bg-${theme.background} text-${theme.foreground}`}>
  {/* Canvas UI */}
</div>

// Grid background matches OS grid
const gridColor = theme === 'light' ? '#E5E5E5' : '#2A2A2A';
```

---

## Export Functionality

### PNG Export (Phase 1)

```typescript
const exportPNG = async () => {
  // 1. Snapshot Konva stage at high resolution
  const dataURL = stage.toDataURL({
    pixelRatio: 2,
    mimeType: 'image/png',
  });
  
  // 2. Load into canvas for branding
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = 1600;
  canvas.height = 1200;
  
  const img = new Image();
  img.src = dataURL;
  await new Promise((resolve) => { img.onload = resolve; });
  
  ctx.drawImage(img, 0, 0);
  
  // 3. Add Danilarious logo watermark
  const logo = new Image();
  logo.src = '/brand/logo.svg';
  await new Promise((resolve) => { logo.onload = resolve; });
  
  ctx.drawImage(logo, canvas.width - 150, canvas.height - 50, 140, 40);
  
  // 4. Download
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob!);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danilarious-${Date.now()}.png`;
    a.click();
  });
};
```

### GIF Export (Phase 2 - Future)

Capture WebGL canvas over time:

```typescript
import GIF from 'gif.js';

const exportGIF = async () => {
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: 800,
    height: 600,
  });
  
  // Capture frames over 3 seconds
  const frameDuration = 1000 / 30; // 30fps
  const totalFrames = 90; // 3 seconds
  
  for (let i = 0; i < totalFrames; i++) {
    await new Promise((resolve) => setTimeout(resolve, frameDuration));
    
    // Capture WebGL canvas
    const canvas = webGLCanvasRef.current;
    gif.addFrame(canvas, { delay: frameDuration });
  }
  
  gif.on('finished', (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danilarious-${Date.now()}.gif`;
    a.click();
  });
  
  gif.render();
};
```

---

## Security Considerations

### SVG Upload Sanitization (Admin Panel)

```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizeSVG = (svgString: string): string => {
  // Strip script tags, event handlers
  return DOMPurify.sanitize(svgString, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use'], // Allow SVG use elements
    FORBID_TAGS: ['script', 'iframe', 'object'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick'],
  });
};
```

### JWT Authentication (Admin)

```typescript
// In Cloudflare Worker
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(env.JWT_SECRET);

// Generate token
const token = await new SignJWT({ userId, role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('24h')
  .sign(secret);

// Verify token
const { payload } = await jwtVerify(token, secret);
```

### Rate Limiting

```typescript
// Cloudflare Workers KV for rate limiting
const RATE_LIMIT = 10; // requests per minute
const key = `rate-limit:${userId}`;

const count = await env.KV.get(key);
if (count && parseInt(count) > RATE_LIMIT) {
  return new Response('Too many requests', { status: 429 });
}

await env.KV.put(key, (parseInt(count || '0') + 1).toString(), {
  expirationTtl: 60,
});
```

---

## Performance Targets

| Metric | Target | How We Achieve It |
|--------|--------|-------------------|
| **Initial Load** | <2 seconds | Code-splitting, lazy-load WebGL shaders, CDN assets |
| **Canvas FPS** | 60fps | WebGL GPU rendering, throttled Konva snapshots |
| **Asset Load** | <500ms | SVGs served from R2 CDN, pre-cached in service worker |
| **Export Time** | <3 seconds | Offscreen canvas rendering, Web Workers for GIF encoding |
| **Concurrent Users** | 1000+ | Stateless Workers, D1 read replicas, R2 auto-scaling |

### Monitoring

- **Sentry** for error tracking
- **Cloudflare Analytics** for traffic/performance
- **Custom metrics:** Average export time, canvas element count distribution

---

## Development Workflow

### Local Setup

```bash
# Install dependencies
npm install

# Start Vite dev server (frontend)
npm run dev

# Start Cloudflare Workers locally (backend)
npm run dev:worker

# Run both in parallel
npm run dev:all
```

### Build & Deploy

```bash
# Build frontend for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Deploy Workers (admin API)
wrangler deploy
```

### Testing Strategy

- **Unit Tests:** Jest for utilities (color transforms, state actions)
- **Component Tests:** React Testing Library for UI components
- **E2E Tests:** Playwright for full user flows (drag asset, apply effects, export)
- **Visual Regression:** Percy or Chromatic for Canvas output consistency

---

## Future Enhancements

### Phase 2 (Post-MVP)
- GIF export with looping animations
- Backend persistence (save/load projects)
- Shareable links to canvas creations
- More kaleidoscope patterns (bilateral, radial variations)

### Phase 3 (Long-term)
- Collaborative editing (Socket.io + CRDT for state sync)
- NFT minting integration (mint canvas exports on-chain)
- Merch export (send to print-on-demand services)
- Mobile app (React Native with same core components)

---

## Appendix: Shader Reference

### Full Kaleidoscope Fragment Shader

```glsl
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_segments;
uniform float u_rotation;

varying vec2 v_texCoord;

const float PI = 3.14159265359;

vec2 rotate(vec2 v, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  mat2 m = mat2(c, -s, s, c);
  return m * v;
}

vec2 kaleidoscope(vec2 uv, float segments, float rotation) {
  // Center coordinates
  vec2 centered = (uv - 0.5) * 2.0;
  
  // Apply global rotation
  centered = rotate(centered, rotation);
  
  // Polar coordinates
  float angle = atan(centered.y, centered.x);
  float radius = length(centered);
  
  // Segment angle
  float segmentAngle = 2.0 * PI / segments;
  
  // Map to first segment
  float normalizedAngle = mod(angle, segmentAngle);
  
  // Mirror every other segment for symmetry
  float segmentIndex = floor(angle / segmentAngle);
  if (mod(segmentIndex, 2.0) == 1.0) {
    normalizedAngle = segmentAngle - normalizedAngle;
  }
  
  // Convert back to Cartesian
  vec2 mirrored = vec2(
    cos(normalizedAngle),
    sin(normalizedAngle)
  ) * radius;
  
  // Denormalize
  return (mirrored / 2.0) + 0.5;
}

void main() {
  vec2 uv = v_texCoord;
  
  if (u_segments > 1.0) {
    uv = kaleidoscope(uv, u_segments, u_rotation);
  }
  
  gl_FragColor = texture2D(u_texture, uv);
}
```

---

## Questions & Decisions Log

**Q: Should we use Konva or Fabric.js?**
A: Konva - better SVG performance and simpler API.

**Q: Client-side or server-side rendering for effects?**
A: Client-side WebGL - real-time previews are essential for UX.

**Q: How to handle mobile performance?**
A: Reduce max canvas resolution, disable animations on low-end devices, progressive enhancement.

**Q: localStorage or IndexedDB for persistence?**
A: localStorage for MVP (simpler), IndexedDB if we need to store large binary data later.

---

**This architecture is designed to be:**
- ✅ Performant (60fps effects via WebGL)
- ✅ Maintainable (modular components, TypeScript safety)
- ✅ Scalable (Cloudflare edge deployment, stateless design)
- ✅ Delightful (smooth interactions, instant feedback)