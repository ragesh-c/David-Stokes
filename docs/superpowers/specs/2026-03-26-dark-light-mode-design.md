# Dark / Light Mode — Design Spec
**Date:** 2026-03-26
**Project:** David Stokes Website

---

## Overview

Add a dark/light mode toggle to the David Stokes website. The site defaults to the visitor's OS preference, allows manual override via a toggle in the nav, and remembers that override in `localStorage`.

---

## Palette

### Light (existing — unchanged)
| Token | Value |
|---|---|
| `--bg-primary` | `#F6F3EC` |
| `--bg-secondary` | `#EFEBE2` |
| `--text-heading` | `#1A1A18` |
| `--text-body` | `#333330` |
| `--text-meta` | `#77726D` |
| `--accent-sage` | `#425E4F` |
| `--accent-burg` | `#923851` |
| `--divider` | `#D8D3CC` |

### Dark (new overrides in `[data-theme="dark"]`)
| Token | Value | Notes |
|---|---|---|
| `--bg-primary` | `#1C1A18` | Warm charcoal, not cold black |
| `--bg-secondary` | `#252220` | Card/surface layer |
| `--text-heading` | `#EDE8E0` | Inverted parchment |
| `--text-body` | `#C8C0B8` | Readable warm off-white |
| `--text-meta` | `#8A8480` | Muted warm grey |
| `--accent-sage` | `#6B9A7E` | Lightened for dark-bg contrast |
| `--accent-burg` | `#923851` | Unchanged; passes WCAG AA for large text/UI (3.8:1 on dark bg) — not used at body-text size |
| `--divider` | `rgba(255,255,255,0.09)` | Subtle separation |
| `--dark-surface` | `rgba(255,255,255,0.04)` | Flipped for dark bg |
| `--dark-border` | `rgba(255,255,255,0.08)` | Flipped for dark bg |

**Note:** `--white` is NOT overridden. It is used for text on dark backgrounds (button labels, nav text, footer text) and must remain white in both modes. Instead a dedicated token `--surface-card` is introduced for elements that need a white surface in light mode and a dark surface in dark mode (e.g. floating stat cards, about section white boxes):
- Light: `--surface-card: #FFFFFF`
- Dark: `--surface-card: #252220`

---

## Sections that stay permanently dark (not affected by theme toggle)

The following sections use hardcoded dark colours intentionally and should remain dark in both light and dark mode. They are **excluded** from theme switching — no changes needed:

- `.site-footer` — ink gradient background, always dark
- `.hero-section` / `.page-hero` / `.journal-post-hero` — portrait/hero overlays, always dark
- `.chapter-strip` / `.ghost-text-section` — decorative dark strips
- `.waitlist-section` — dark CTA section
- `.newsletter-section` — dark subscription section
- `.books-dark-header` — intentional dark header
- `.bg-dark` utility class — explicitly dark by design
- `.site-nav.scrolled` — dark translucent nav on scroll (appropriate on both themes)

These sections use hardcoded values (`#16110C`, `#1E1510`, etc.) in `styles.css` and will not respond to `[data-theme="dark"]` overrides — which is the correct behaviour.

---

## Architecture

### New files
- **`css/theme.css`** — dark palette overrides under `[data-theme="dark"]` selector; `--surface-card` token in both modes; toggle button styles; smooth colour transition
- **`js/theme.js`** — theme initialisation + toggle logic with dynamic accessible label

### Modified files
- All **23** HTML pages (root pages + `journal/post.html`) get:
  1. `<link rel="stylesheet" href="/css/theme.css">` in `<head>` after `styles.css`
  2. Inline init script in `<head>` **after the stylesheet links** (see below)
  3. Theme toggle button added to nav

### No structural changes to `css/styles.css`
The existing stylesheet already uses CSS custom properties for content sections. The hardcoded dark sections listed above are intentionally permanent and require no changes.

---

## Behaviour

### On page load — inline init script
Placed in `<head>` **after all `<link rel="stylesheet">` tags** so the browser has parsed `[data-theme="dark"]` rules before first paint:

```html
<script>
  (function(){
    var t = localStorage.getItem('theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

### Toggle button
- Sun ☀ icon when in dark mode (click → switch to light), Moon ☾ icon when in light mode (click → switch to dark)
- Lives in the main nav, top right
- `aria-label` updated dynamically: `"Switch to light mode"` (when dark) / `"Switch to dark mode"` (when light)
- On click: flip `data-theme`, save to `localStorage`, update `aria-label` and icon
- Smooth `0.25s ease` CSS transition on `color`, `background-color`, `border-color` only (not `all`, to avoid layout jank)

### Toggle button markup
```html
<button class="theme-toggle" id="theme-toggle" aria-label="Switch to dark mode">
  <span class="theme-icon" aria-hidden="true"></span>
</button>
```

### js/theme.js responsibilities
1. On DOMContentLoaded: read `data-theme` already set on `<html>` by the inline script → sync the toggle button's icon and `aria-label` to match (does NOT re-set `data-theme` — the inline script already did this before paint)
2. On toggle click: flip `data-theme`, persist to `localStorage`, update icon and `aria-label`

---

## Scope

- All **23** `.html` files: 22 root/section pages + `journal/post.html`
- `css/theme.css` (new)
- `js/theme.js` (new)

---

## Out of scope
- Admin panel (`admin/`) — has its own fixed dark palette, excluded
- Images/photos — not affected by theme
- Permanently dark sections listed above — intentionally excluded
