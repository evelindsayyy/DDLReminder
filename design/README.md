# Design

Design-phase artifacts for the Deadline Tracker. None of this is part of the
Next.js build — it's the reference the production UI was implemented against.

## Contents

| File | What it is |
|------|------------|
| `index.html` | Standalone wireframe browser. Open it directly in a browser — it loads the `.jsx` files below via in-browser Babel (no build step). |
| `design-canvas.jsx` | Figma-ish canvas wrapper (sections, artboards, post-it notes). |
| `sketch-kit.jsx` | Shared hand-drawn wireframe primitives. |
| `tweaks-panel.jsx` | Reusable tweaks/controls shell for the canvas. |
| `wireframes-dashboard.jsx` | Dashboard layout variants. |
| `wireframes-assignments.jsx` | Assignment list/calendar variants. |
| `wireframes-other.jsx` | Applications, quick-add, settings, and mobile frames. |
| `HANDOFF.md` | Brief mapping the chosen wireframe variants to the codebase. |
| `DESIGN_TOKENS.md` | Canonical production type / color / spacing system. |

## Viewing the wireframes

```bash
open design/index.html        # macOS
# or just open the file in any browser
```

The `.jsx` files are loaded with relative `src=` paths, so they must stay in
this folder alongside `index.html`.
