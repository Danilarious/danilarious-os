# Getting Started with Danilarious Canvas Development

## Quick Start: Your First Cursor Session

### Before You Begin

Make sure you have:
- ✅ Cursor installed with Claude API key configured
- ✅ This repo (`BxOS` / `danilarious-os`) open in Cursor
- ✅ Read `docs/VISION.md` and `docs/ARCHITECTURE.md` (or at least skimmed them)

### The Perfect First Prompt

Open Cursor Composer (`Cmd + I` on Mac, `Ctrl + I` on Windows) and paste:

```
I'm building Danilarious Canvas - an interactive kaleidoscopic SVG art tool 
that runs as an "app" inside my Danilarious OS retro-desktop website.

CONTEXT DOCS:
Please read @docs/VISION.md and @docs/ARCHITECTURE.md for full background.

CURRENT STATE:
- Repo: You're looking at it (danilarious-os)
- Live site: https://danilarious-os.netlify.app/
- Stack: Vite + React + TailwindCSS + Framer Motion
- Architecture: Retro Mac OS9-style desktop with draggable windows

THE PLAN:
Following the phased approach in @docs/PRD-Canvas.md:
- Phase 0: ✅ Complete (OS is live)
- Phase 1: Make OS app-ready (refactor for app registry)
- Phase 2: Add Canvas entry point (shell/placeholder)
- Phase 3: Build Canvas MVP (actual drawing with WebGL effects)

IMMEDIATE GOAL:
Analyze the current codebase structure and help me start Phase 1 - 
refactoring the OS to be app-ready before we build Canvas itself.

Please:
1. Review the current project structure
2. Identify what needs to be refactored per the PRD
3. Suggest the first concrete task to tackle

Let's build this step by step.
```

### What Claude Will Do

Claude will:
1. Analyze your current codebase (App.jsx, component structure, etc.)
2. Identify where window management and content are currently coupled
3. Suggest creating the app registry pattern from the PRD
4. Give you concrete next steps with complete code

---

## Workflow for Each Development Session

### 1. Starting a New Feature

**Always reference context docs:**

```
We're working on Danilarious Canvas (see @docs/PRD-Canvas.md).

Currently on Phase 1, Task: [specific task like "creating app registry"].

Context from @docs/ARCHITECTURE.md: We're using a two-canvas system 
(Konva for interaction, WebGL for effects).

Let's implement [feature] with the following requirements:
- [bullet points of what you want]

Show me the complete code files.
```

### 2. Continuing from a Previous Session

**Remind Claude where you left off:**

```
Continuing Danilarious Canvas development.

Last session we: [what you accomplished]

Current status: [what's working, what's next]

According to @docs/PRD-Canvas.md Phase [X], we need to:
- [next steps]

Let's tackle [specific feature].
```

### 3. Making Changes to Existing Code

**Use `@filename` to reference specific files:**

```
Looking at @src/App.jsx, we need to refactor the window rendering 
to use the app registry we created in @src/config/apps.js.

Currently windows are hardcoded. Let's make it dynamic so adding 
Canvas later is just adding an entry to the registry.

Show me the updated App.jsx file.
```

### 4. Implementing Complex Features (Canvas Itself)

**Break it down into milestones:**

```
We're ready to build the Canvas app itself (Phase 3).

Reference @docs/ARCHITECTURE.md section "Two-Canvas Architecture" 
for the technical approach.

Milestone 1: Basic Konva canvas with drag-drop SVG placement
- Create src/apps/CanvasApp/CanvasApp.tsx
- Set up Konva Stage with basic click-to-place-asset functionality
- Use Memphis Milano aesthetic from @docs/VISION.md

Show me:
1. Complete CanvasApp component
2. Any new dependencies I need to install
3. How to integrate it into the existing window system
```

### 5. Debugging Issues

**Provide context and error messages:**

```
I'm getting an error when trying to [action]:

[paste error message]

Current code in @src/path/to/file.tsx:
[relevant code snippet]

According to @docs/ARCHITECTURE.md we should be using [approach].
What's going wrong and how do I fix it?
```

### 6. Refining Aesthetics

**Reference the vision doc:**

```
The Canvas UI is functional but doesn't match the Danilarious aesthetic yet.

From @docs/VISION.md:
- Memphis Milano energy (bold geometry, vibrant colors)
- Danilarious palette: #E7B03D, #EC4CA5, #6598AC, etc.
- Retro OS window styling matching the rest of the site

Current Canvas component: @src/apps/CanvasApp/CanvasApp.tsx

Help me refine the styling to match the vision. Show me updated CSS/Tailwind classes.
```

---

## Phase-by-Phase Prompts

### Phase 1: OS Ready for Apps

**Task 1A: Projects Data Structure**

```
Phase 1, Task 1A from @docs/PRD-Canvas.md: Create projects data structure.

We need to:
1. Create src/data/projects.js with an array of project objects
2. Each project has: id, title, type, status, slug, thumb, images, tags, shortDescription, year
3. Update ProjectsWindowContent to use this data instead of placeholder content

Reference the schema in the PRD. Show me:
- Complete src/data/projects.js
- Updated ProjectsWindowContent.jsx
```

**Task 1B: Mobile Responsive Layout**

```
Phase 1, Task 1B: Make the OS mobile-responsive.

Current issues:
- Desktop icons on right side don't work on mobile
- Windows can be dragged off-screen
- Grid might be too dense on small screens

Using Tailwind responsive classes, help me:
1. Create a bottom dock for mobile (icons in flex row)
2. Constrain window dragging to stay on screen
3. Adjust grid density for small screens

Show me updated code for relevant components.
```

**Task 1C: App Registry**

```
Phase 1, Task 1C: Create app registry and extract window content.

Following @docs/PRD-Canvas.md section 1C:

1. Create src/config/apps.js that maps app IDs to components
2. Extract AboutWindowContent, SettingsWindowContent, ProjectsWindowContent 
   into separate files in src/windows/
3. Refactor App.jsx to render windows dynamically from the registry

This prepares us to add Canvas in Phase 2.

Show me:
- src/config/apps.js (complete file)
- Example of one extracted window component
- Updated App.jsx window rendering logic
```

### Phase 2: Canvas Entry Point

**Task 2.1: Add Canvas Shell**

```
Phase 2: Adding Canvas entry point to the OS.

Create:
1. src/apps/CanvasAppShell.jsx - placeholder component that says 
   "Canvas coming soon" with vision description
2. Add 'canvas' entry to src/config/apps.js
3. Add Canvas desktop icon that calls openWindow('canvas')

Use the Danilarious palette from @docs/VISION.md for placeholder styling.

Show me all new/updated files.
```

### Phase 3: Canvas MVP

**Milestone 1: Basic Konva Setup**

```
Phase 3, Milestone 1: Basic Konva canvas.

Following @docs/ARCHITECTURE.md "Two-Canvas Architecture":

Create src/apps/CanvasApp/ with:
- CanvasApp.tsx (main container)
- components/KonvaCanvas.tsx (interaction layer)
- hooks/useCanvasStore.ts (Zustand store for canvas state)

For now, just:
- 800x600 Konva stage
- Click to place a simple rectangle
- Show the rectangle with bounding box

Install needed: konva, react-konva, zustand

Show me complete code for these files.
```

**Milestone 2: SVG Asset Library**

```
Phase 3, Milestone 2: Asset library sidebar.

Add to CanvasApp:
- Left panel with draggable SVG thumbnails
- Hardcoded assets for now (we'll add admin upload later)
- Drag from panel → drop on Konva canvas → asset appears

Reference @docs/ARCHITECTURE.md for component structure.
Aesthetic from @docs/VISION.md (Memphis colors, chunky UI).

Show me:
- Updated CanvasApp.tsx layout
- components/AssetLibrary.tsx
- Example SVG assets in src/data/assets.ts
```

**Milestone 3: WebGL Effects Layer**

```
Phase 3, Milestone 3: Add WebGL canvas for kaleidoscope/hue effects.

Following @docs/ARCHITECTURE.md "Two-Canvas Architecture":

1. Create components/WebGLCanvas.tsx
2. Implement fragment shader from architecture doc (kaleidoscope)
3. Add toggle to switch between Konva (no effects) and WebGL (effects on)

When effects are off: show Konva directly
When effects are on: snapshot Konva → feed to WebGL → show WebGL

Show me:
- WebGLCanvas.tsx component
- shaders/kaleidoscope.frag
- Integration in CanvasApp.tsx
```

---

## Common Patterns & Tips

### Pattern: Adding a New Component

```
I need to add a [ComponentName] component that does [functionality].

It should:
- Live at src/[path]/[ComponentName].tsx
- Use TypeScript
- Match Danilarious aesthetic (@docs/VISION.md palette)
- Integrate with [existing component] via [method]

Show me the complete component code and how to import/use it.
```

### Pattern: Implementing a Feature from PRD

```
From @docs/PRD-Canvas.md section [X.Y]:

[paste relevant section]

I want to implement this feature. Break it down into steps and 
show me code for step 1.
```

### Pattern: Debugging Performance

```
The canvas is lagging when I [action].

According to @docs/ARCHITECTURE.md we should be [optimization strategy].

Current code: @src/[file]

How do I optimize this?
```

### Pattern: Matching the Aesthetic

```
This UI element doesn't feel "Danilarious" enough.

From @docs/VISION.md:
- Memphis Milano (chunky, bold, geometric)
- Danilarious palette: [specific colors]
- Playful precision

Current code: [paste snippet]

How can I make this more on-brand? Show me updated styling.
```

---

## Git Workflow

After each working feature:

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat(canvas): add basic Konva stage with asset placement"

# Push to GitHub
git push

# Netlify auto-deploys from main branch
```

**Commit message format:**
- `feat(canvas): [description]` - new feature
- `fix(canvas): [description]` - bug fix
- `refactor(os): [description]` - code restructure
- `style(ui): [description]` - styling changes
- `docs: [description]` - documentation updates

---

## Asking for Help

### If You're Stuck

```
I'm stuck on [problem].

What I'm trying to do: [goal]

What's happening: [current behavior]

What I expected: [desired behavior]

Relevant code: @src/[file]

Any ideas?
```

### If You Need Clarification on Architecture

```
I'm confused about [technical decision] in @docs/ARCHITECTURE.md.

Specifically: [quote confusing section]

Can you explain this in simpler terms and show me an example?
```

### If You Want to Deviate from the Plan

```
The PRD suggests [approach A], but I'm thinking [approach B] might be better because [reason].

Pros/cons of each approach?
Should I stick with the PRD or go with the alternative?
```

---

## Quick Reference: Essential Files

| File | Purpose | When to Reference |
|------|---------|-------------------|
| `docs/VISION.md` | Brand, aesthetic, artist references | Styling, UI design decisions |
| `docs/ARCHITECTURE.md` | Technical stack, WebGL approach | Complex features, performance |
| `docs/PRD-Canvas.md` | Phased roadmap, feature specs | Planning next steps, priorities |
| `src/config/apps.js` | App registry | Adding new apps to OS |
| `src/apps/CanvasApp/` | Canvas implementation | Building Canvas features |

---

## Success Checklist

After each session, you should have:
- ✅ Working code (no errors in console)
- ✅ Committed to git with clear message
- ✅ Tested locally (`npm run dev`)
- ✅ Pushed to GitHub (triggers deploy)
- ✅ Checked live site (danilarious-os.netlify.app)

---

## Next Steps After This Setup

1. **Run the first prompt** from the top of this doc
2. **Follow Claude's guidance** to refactor the OS (Phase 1)
3. **Commit each working piece** to git
4. **Move to Phase 2** when OS is app-ready
5. **Build Canvas incrementally** (Phase 3)

**Remember:** You're building this to learn. Ask Claude "why" when you don't understand something. Request explanations. Iterate. Have fun! 🎨
