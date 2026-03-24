# Design System Specification: The Ethereal Workbench

## 1. Overview & Creative North Star
**Creative North Star: The Precision Laboratory**
This design system moves away from the "boxy" utility of traditional developer tools. Instead, it treats modding—specifically for the vibrant world of Terraria—as a high-end editorial experience. We are building a "Precision Laboratory": an environment that feels as lightweight as a code editor but as immersive as the game itself. 

By leveraging the Windows 11 Fluent aesthetic, we move beyond a "template" look. We utilize intentional asymmetry, where a heavy sidebar might be balanced by an expansive, airy workspace. We break the rigid grid using overlapping "Mica" layers and high-contrast typography scales that guide the eye through complex data without the need for suffocating borders.

---

## 2. Colors & Surface Philosophy
The palette is rooted in professional neutrals, allowing the vibrant pixel art of game assets to be the hero.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through:
1. **Background Color Shifts:** A `surface-container-low` section sitting on a `surface` background.
2. **Mica Material Effects:** Using the system’s native translucency to create organic separation.
3. **Negative Space:** Using the `Spacing Scale (8 - 12)` to create "gutters of intent."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of frosted glass.
- **Base Layer:** `surface` (The foundation).
- **Secondary Workspace:** `surface-container-low` (Nested inside the base).
- **Interactive Modules:** `surface-container-lowest` (The "white paper" feel for item editors).
- **Elevated Overlays:** `surface-bright` (For transient UI like popovers).

### The "Glass & Gradient" Rule
To elevate the "out-of-the-box" Fluent look, floating elements must use **Glassmorphism**. Apply a backdrop-blur (minimum 20px) to `surface-container-lowest` with 80% opacity. For primary CTAs, use a subtle linear gradient from `primary` (#005faa) to `primary-container` (#0078d4) at a 135-degree angle to provide "visual soul."

---

## 3. Typography
We utilize **Segoe UI Variable** (referenced as 'inter' in the scale for technical compatibility) to bridge the gap between technical data and editorial elegance.

*   **Display (Large/Medium):** Used exclusively for project titles and "Hero" stats (e.g., Weapon DPS). These should feel authoritative and use `on-surface` high contrast.
*   **Headlines & Titles:** Use `headline-sm` for category headers (e.g., "Item Properties"). These act as the anchors of the layout.
*   **Body:** `body-md` is the workhorse. It ensures readability during long coding or JSON-editing sessions.
*   **Labels:** `label-md` and `label-sm` are used for technical metadata (Internal IDs, Sprite Dimensions). Use `on-surface-variant` to keep these secondary.

**Editorial Hierarchy:** Always pair a `display-sm` project title with a `label-md` version number nearby. The massive size difference creates a sophisticated, "magazine-style" tension.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not structural lines.

*   **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container-low` sidebar. The slight shift in luminosity creates a soft, natural lift.
*   **Ambient Shadows:** For floating dialogs, use a 32px blur with 4% opacity. The shadow color must be a tinted version of `on-surface` (a deep, desaturated blue-grey) rather than pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token at **15% opacity**. 100% opaque borders are strictly forbidden.
*   **Mica Material:** The main application background must use the Mica effect, allowing the user's desktop wallpaper to subtly influence the `surface` color, making the tool feel "native" to their OS.

---

## 5. Components

### Buttons & Interaction
*   **Primary Button:** Uses the "Signature Gradient" (Primary to Primary-Container). Corner radius: `lg` (0.5rem). Text: `label-md` uppercase for a professional "tool" feel.
*   **Secondary/Ghost:** No background. Uses `outline` for text color. Interaction state: `surface-container-high` on hover.

### Modding-Specific Components
*   **Sprite Preview Card:** A `surface-container-lowest` card with a `xl` (0.75rem) corner radius. No border. Use a subtle `primary-fixed` subtle glow if the item is "Selected."
*   **Property Inspector:** A vertical stack using `surface-container-low`. **Do not use dividers.** Use `Spacing: 4` between property groups to define boundaries.
*   **The "Breadcrumb" Path:** Use `label-sm` with `on-surface-variant`. Separate items with a simple `0.5rem` space, no slashes or arrows.

### Input Fields
*   **The "Underline" Input:** Instead of a boxed input, use a `surface-container-highest` background with a 2px bottom-accent of `primary` only when focused. This mimics the high-end feel of modern IDEs.

### Chips & Tags
*   **Weapon Type Chips:** Use `secondary-container` with `on-secondary-container` text. Radius: `full`. These should feel like "pills" that can be easily flicked away.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use whitespace as a separator. If you think you need a line, try adding `Spacing: 6` instead.
*   **DO** use `surface-container-highest` for "Active" states in navigation sidebars.
*   **DO** ensure all interactive elements have a minimum corner radius of `md` (0.375rem) to maintain the Fluent "Softness."

### Don’t:
*   **DON'T** use 100% black text. Use `on-surface` (#1a1c1c) for better readability on Mica backgrounds.
*   **DON'T** use "Drop Shadows" on standard cards. Reserve shadows only for elements that physically "float" over the UI (Modals, Tooltips).
*   **DON'T** use high-saturation backgrounds for data-heavy areas. Stick to the `surface-container` tiers to prevent eye fatigue.