# Phase 3: Canvas MVP - Implementation Plan

## Overview

Build the full Danilarious Canvas app with two-canvas architecture (Konva.js + WebGL), SVG asset library, kaleidoscope effects, hue shifting, and export functionality.

**Estimated Scope:** Large (multi-day effort if done thoroughly)
**Dependencies:** Konva.js, chroma-js (color manipulation)
**Reference:** See `docs/ARCHITECTURE.md` for technical details

---

## Implementation Strategy

### Sequential Build Approach

Rather than trying to build everything at once, we'll implement features incrementally and test at each stage. Each step will be a working, testable version.

---

## Step-by-Step Breakdown

### Step 1: Setup & Dependencies

**Tasks:**
- Install Konva.js (`react-konva` + `konva`)
- Install chroma-js for color manipulation
- Create basic component structure

**Files Created:**
```
src/apps/CanvasApp/
  ├── CanvasApp.jsx              # Main container
  ├── components/
  │   ├── KonvaCanvas.jsx        # Interaction layer (Step 2)
  │   ├── AssetLibrary.jsx       # Left panel (Step 3)
  │   ├── EffectsPanel.jsx       # Right panel (Step 5)
  │   └── Toolbar.jsx            # Top controls (Step 7)
  ├── hooks/
  │   └── useCanvasStore.js      # Zustand state (Step 2)
  └── utils/
      └── colorUtils.js          # Chroma.js helpers (Step 5)
```

**Deliverable:** Empty components render without errors

---

### Step 2: Konva Canvas + State Management

**Goal:** Get basic drag-and-drop working with placeholder shapes

**Implementation:**
1. Create Zustand store for canvas state:
   ```js
   // State shape
   {
     elements: [
       { id, x, y, rotation, scale, zIndex, type, fill }
     ],
     addElement, updateElement, removeElement
   }
   ```

2. Build `KonvaCanvas.jsx`:
   - Konva Stage + Layer setup
   - Render elements as Konva shapes
   - Transformer for rotation/scale handles
   - Drag handlers that update Zustand state

3. Add test button to add placeholder circles/rectangles

**Test:**
- Click button → shape appears
- Drag shape → position updates
- Select shape → rotation handles appear
- Delete shape → disappears

**Deliverable:** Interactive canvas with placeholder shapes

---

### Step 3: SVG Asset Library

**Goal:** Replace placeholder shapes with real SVG assets

**Implementation:**
1. Create SVG asset data structure:
   ```js
   // src/data/canvasAssets.js
   export const CANVAS_ASSETS = {
     shapes: [
       { id: 'circle-1', name: 'Circle', svg: '/assets/canvas/circle.svg' }
     ],
     characters: [...],
     scenes: [...],
     extras: [...]
   }
   ```

2. Build `AssetLibrary.jsx`:
   - Left sidebar panel
   - Categorized tabs (Shapes, Characters, Scenes, Extras)
   - Thumbnail grid
   - Click to add to canvas

3. Update Konva to render SVG assets:
   - Load SVG as Image
   - Convert to Konva.Image node
   - Maintain aspect ratio

**Design Decision:**
- **Option A:** Start with 3-5 placeholder SVG assets (simple shapes)
- **Option B:** Create full asset library upfront (20+ assets)

**Recommendation:** Option A - prove the system works first

**Test:**
- Click asset → appears on canvas
- Multiple copies of same asset work
- SVGs render cleanly at different scales

**Deliverable:** Working asset library with drag-and-drop SVGs

---

### Step 4: Layer Management

**Goal:** Control z-index (bring to front/back)

**Implementation:**
1. Add layer controls to selected element:
   - "Bring to Front" button
   - "Send to Back" button
   - Layer up/down buttons

2. Update Zustand store with reorder actions:
   ```js
   reorderElement: (id, direction) => {
     // Swap zIndex with adjacent element
   }
   ```

3. Konva layer sorting based on zIndex

**Test:**
- Overlap 3 shapes
- Bring middle one to front → renders on top
- Send to back → renders behind

**Deliverable:** Full layer control

---

### Step 5: Hue Shift Effect (No WebGL Yet)

**Goal:** Add hue shift slider that changes all element colors

**Implementation:**
1. Add hue shift state to Zustand:
   ```js
   { hueShift: 0 } // 0-360 degrees
   ```

2. Build `EffectsPanel.jsx`:
   - Right sidebar
   - Hue shift slider (0-360)
   - Real-time preview

3. Apply hue shift to Konva elements:
   - Use chroma.js to shift colors
   - Update Konva fill colors on slider change
   - Use Konva filters if possible (faster)

**Test:**
- Slider at 0 → original colors
- Slider at 180 → inverted colors
- Slider at 120 → shifted green-ish

**Deliverable:** Working hue shift without WebGL (simpler implementation first)

---

### Step 6: WebGL Effects Layer (Optional Advanced Feature)

**Goal:** Add kaleidoscope effect via WebGL

**⚠️ Complexity Warning:** This is the most complex part of Phase 3

**Implementation:**
1. Create `WebGLCanvas.jsx`:
   - Canvas element overlaying Konva
   - WebGL context setup
   - GLSL fragment shader for kaleidoscope

2. Pipeline:
   - Konva.Stage.toDataURL() → texture
   - WebGL renders texture with shader
   - Shader applies kaleidoscope mirroring

3. Kaleidoscope controls:
   - Segments slider (3, 6, 8, 12)
   - Rotation animation speed
   - On/off toggle

**Decision Point:**
- **Include in Phase 3 MVP?** Or save for Phase 4?
- WebGL adds significant complexity
- Canvas is fully functional without it

**Recommendation:** Make this **Phase 3.5** (optional enhancement after MVP works)

**Test (if implemented):**
- Toggle kaleidoscope on → mirrored effect appears
- Adjust segments → pattern changes
- Rotation animates smoothly at 60fps

**Deliverable (if implemented):** Kaleidoscope overlay working

---

### Step 7: Export to PNG

**Goal:** Download canvas as branded PNG

**Implementation:**
1. Build `Toolbar.jsx`:
   - Top bar with Save/Export/Clear buttons
   - Export button triggers PNG generation

2. Export logic (`utils/export.js`):
   ```js
   export const exportPNG = async (stage) => {
     const dataURL = stage.toDataURL({ pixelRatio: 2 });

     // Add Danilarious logo watermark
     const canvas = document.createElement('canvas');
     const ctx = canvas.getContext('2d');
     // ... draw image + logo

     // Download
     canvas.toBlob(blob => {
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `danilarious-${Date.now()}.png`;
       a.click();
     });
   };
   ```

3. Watermark integration:
   - Load Danilarious logo SVG
   - Composite onto bottom-right corner
   - Subtle but visible

**Test:**
- Click Export → PNG downloads
- Open PNG → contains canvas content + logo
- High resolution (2x pixelRatio)

**Deliverable:** Working PNG export

---

### Step 8: LocalStorage Persistence

**Goal:** Save/load canvas state across browser sessions

**Implementation:**
1. Auto-save to localStorage on state change:
   ```js
   // Zustand middleware
   useEffect(() => {
     const saved = localStorage.getItem('danilarious-canvas');
     if (saved) {
       setCanvasState(JSON.parse(saved));
     }
   }, []);

   useEffect(() => {
     const debounced = debounce(() => {
       localStorage.setItem(
         'danilarious-canvas',
         JSON.stringify(canvasState)
       );
     }, 500);
     debounced();
   }, [canvasState]);
   ```

2. Load on mount

**Test:**
- Add elements to canvas
- Refresh page → elements persist
- Clear localStorage → canvas resets

**Deliverable:** Working persistence

---

### Step 9: Polish & UX

**Goal:** Make it feel professional

**Tasks:**
1. Loading states (while SVGs load)
2. Empty state messaging ("Drag an asset to begin")
3. Keyboard shortcuts (Delete key to remove selected)
4. Touch gestures for mobile (pinch to zoom)
5. Undo/Redo (if time permits)
6. Canvas background options (transparent, white, colored)

**Test:**
- Feels smooth and responsive
- No janky behavior
- Mobile works (touch drag, etc.)

**Deliverable:** Polished Canvas app

---

## Phase 3 MVP: Minimum Deliverable

To keep Phase 3 manageable, the **minimum viable Canvas** includes:

✅ **Must Have:**
- Konva canvas with SVG asset drag-and-drop
- Asset library with 5-10 placeholder SVGs
- Layer management (bring to front/back)
- Hue shift slider (via Konva filters or chroma.js)
- PNG export with Danilarious watermark
- LocalStorage persistence

❌ **Can Wait for Phase 4:**
- WebGL kaleidoscope effects (most complex part)
- GIF export (animated loops)
- Backend persistence (Cloudflare D1)
- Shareable links
- Advanced effects (bilateral symmetry, etc.)

---

## Implementation Time Estimate

**If we focus on MVP (no WebGL):**
- Step 1 (Setup): 15 minutes
- Step 2 (Konva + State): 45 minutes
- Step 3 (Asset Library): 1 hour
- Step 4 (Layer Management): 30 minutes
- Step 5 (Hue Shift): 45 minutes
- Step 7 (Export): 30 minutes
- Step 8 (Persistence): 20 minutes
- Step 9 (Polish): 30 minutes

**Total MVP: ~4-5 hours** (with testing at each step)

**If we add WebGL:**
- Step 6 (WebGL + Shaders): +2-3 hours
- Shader debugging: +1 hour
- Integration testing: +30 minutes

**Total with WebGL: ~7-9 hours**

---

## Recommended Approach

### Option A: MVP First (Recommended)
1. Build Steps 1-5, 7-9 (skip WebGL)
2. Test thoroughly
3. Deploy to production
4. Collect user feedback
5. Add WebGL in Phase 4 if desired

**Pros:**
- Faster to working product
- Less risk of getting stuck on WebGL complexity
- User gets value sooner

### Option B: Full Vision
1. Build all steps including WebGL
2. May take 2-3x longer
3. Higher risk of implementation challenges

**Pros:**
- Matches the original vision from docs/ARCHITECTURE.md
- Kaleidoscope is the "wow factor"

---

## Dependencies to Install

```bash
npm install konva react-konva
npm install chroma-js
npm install zustand  # (already installed? check package.json)
```

**Optional (for WebGL):**
```bash
npm install glsl-canvas  # OR write raw WebGL
npm install vite-plugin-glsl  # For importing .glsl files
```

---

## Asset Creation Strategy

We'll need SVG assets for the library. Options:

### Option 1: Placeholder SVGs
- Create 5-10 simple geometric shapes
- Circle, square, triangle, star, etc.
- Use Danilarious color palette
- Fast to implement, proves the system works

### Option 2: Custom Danilarious SVGs
- Design Memphis-inspired shapes
- Characters from your art style
- Scene elements
- More time-consuming but matches brand

**Recommendation for Phase 3:** Option 1 (placeholders), then upgrade assets in Phase 4

---

## Testing Checklist

After implementation, test these scenarios:

- [ ] Add 10+ assets to canvas without lag
- [ ] Drag assets smoothly
- [ ] Rotate and scale with handles
- [ ] Hue shift affects all elements
- [ ] Layer reordering works correctly
- [ ] Export produces high-quality PNG
- [ ] Watermark is visible but not intrusive
- [ ] Persistence works across page refresh
- [ ] Mobile: Touch drag works
- [ ] Mobile: Canvas doesn't go off-screen
- [ ] Empty state shows helpful message
- [ ] Loading states don't flash

---

## Risk Assessment

### Low Risk
- Konva integration (well-documented library)
- Asset library UI (straightforward React)
- PNG export (browser-native API)

### Medium Risk
- SVG loading/rendering performance (test with 50+ elements)
- Mobile touch gestures (may need tweaking)
- Color manipulation accuracy

### High Risk
- WebGL shader implementation (complex, easy to introduce bugs)
- WebGL + Konva synchronization (texture updates)
- Cross-browser WebGL compatibility

**Mitigation:** Start with MVP (no WebGL), add WebGL only if MVP works perfectly

---

## Success Criteria

Phase 3 is complete when:

1. ✅ User can drag SVG assets onto canvas
2. ✅ User can manipulate assets (move, rotate, scale)
3. ✅ User can reorder layers
4. ✅ User can shift hue of entire composition
5. ✅ User can export branded PNG
6. ✅ Canvas state persists across sessions
7. ✅ Works on mobile (touch-friendly)
8. ✅ Build passes, no console errors
9. ✅ Matches Danilarious aesthetic (per docs/VISION.md)

---

## Next Steps

Once you approve this plan:

1. I'll install dependencies
2. Create component scaffold (Step 1)
3. Build Konva canvas (Step 2)
4. Continue through steps sequentially
5. Test at each step
6. Commit and push after each working milestone

**Question for you:**

**A)** Build MVP first (no WebGL) - faster, lower risk
**B)** Full vision with WebGL kaleidoscope - longer, higher complexity

Which would you prefer?
