# Dark / Light Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dark/light mode toggle to 22 pages of the David Stokes website, defaulting to the visitor's OS preference with localStorage override.

**Architecture:** Two new files (`css/theme.css`, `js/theme.js`) are added. `theme.css` overrides CSS custom properties already used throughout `styles.css` under a `[data-theme="dark"]` attribute on `<html>`. An inline `<script>` in each page's `<head>` (after stylesheets) sets the attribute before first paint to prevent flash. `theme.js` syncs the toggle button UI on DOMContentLoaded and handles click toggling. A no-transition class on `<html>` during initial load prevents an animated flash for first-time dark-OS users.

**Tech Stack:** Vanilla HTML/CSS/JS, no build system. CSS custom properties, `localStorage`, `window.matchMedia`.

---

## Scope

**Included (22 pages):**

| Group | Files |
|---|---|
| Root (6) | `index.html`, `about.html`, `books.html`, `contact.html`, `journal.html`, `media.html` |
| books/ (5) | `books/angles-or-angels.html`, `books/king-alfreds-daughter.html`, `books/sermon-of-the-wolf.html`, `books/the-happy-ending.html`, `books/the-singing-bowl.html` |
| journal/ (11) | `journal/post.html`, `journal/coronation-of-the-king.html`, `journal/finding-aethelflad-in-chester.html`, `journal/finding-aethelflad-in-derby.html`, `journal/finding-aethelflad-in-leicester.html`, `journal/finding-aethelflad-in-shrewsbury.html`, `journal/finding-aethelflad-in-tamworth.html`, `journal/finding-aethelflad-in-warwick.html`, `journal/finding-aethelflad-in-worcester.html`, `journal/gloucester-aethelflads-capital.html`, `journal/kingston-the-coronation-stone.html` |

**Excluded:**
- `waitlist.html` — permanently dark standalone page with its own inline `<style>` block, no shared nav or stylesheet. Already matches dark mode palette. No changes needed.
- `admin/` pages — have their own fixed dark admin palette.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `css/theme.css` | **Create** | Dark palette overrides, `--surface-card` token, toggle button styles, colour transition, no-transition utility |
| `js/theme.js` | **Create** | Sync toggle button to current theme on DOMContentLoaded; handle click toggle + localStorage |
| 6 root pages | **Modify** | Add theme link, inline init script, toggle button, theme.js script tag |
| 5 books/ pages | **Modify** | Same, with `../css/` and `../js/` paths |
| 11 journal/ pages | **Modify** | Same, with `../css/` and `../js/` paths |

---

## Task 1: Create css/theme.css

**Files:**
- Create: `css/theme.css`

- [ ] **Step 1: Create the file**

```css
/* ── Theme tokens ───────────────────────────────────────────────────────────
   Adds --surface-card to :root and overrides CSS variables for dark mode.
   Permanently-dark sections (footer, heroes, chapter-strip, waitlist, etc.)
   use hardcoded values in styles.css and are intentionally excluded here.
   ─────────────────────────────────────────────────────────────────────────── */

/* Light mode: surface-card is white (cards, floating boxes) */
:root {
  --surface-card: #FFFFFF;
}

/* Dark mode overrides */
[data-theme="dark"] {
  --bg-primary:    #1C1A18;
  --bg-secondary:  #252220;
  --text-heading:  #EDE8E0;
  --text-body:     #C8C0B8;
  --text-meta:     #8A8480;
  --accent-sage:   #6B9A7E;
  --divider:       rgba(255,255,255,0.09);
  --dark-surface:  rgba(255,255,255,0.04);
  --dark-border:   rgba(255,255,255,0.08);
  --surface-card:  #252220;
}

/* Suppress transitions on initial load (prevent animated flash for first-time
   dark-OS visitors). The .no-transition class is removed by theme.js after
   the first frame so all subsequent toggles animate normally. */
html.no-transition *,
html.no-transition *::before,
html.no-transition *::after {
  transition: none !important;
}

/* Smooth colour transition on manual theme toggle */
*,
*::before,
*::after {
  transition:
    color 0.25s ease,
    background-color 0.25s ease,
    border-color 0.25s ease;
}

/* ── Theme toggle button ────────────────────────────────────────────────────
   Sits in .site-nav before .nav-hamburger.
   Nav is always dark-coloured so icon colour is always light.
   ─────────────────────────────────────────────────────────────────────────── */

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  color: rgba(250,250,248,0.75);
  font-size: 1.1rem;
  line-height: 1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  color: #FAFAF8;
  background: rgba(255,255,255,0.08);
}

.theme-toggle:focus-visible {
  outline: 2px solid #923851;
  outline-offset: 2px;
}
```

- [ ] **Step 2: Verify the file exists**

Open `http://localhost:8080/css/theme.css` — should return the CSS, not a 404.

---

## Task 2: Create js/theme.js

**Files:**
- Create: `js/theme.js`

- [ ] **Step 1: Create the file**

```js
/**
 * theme.js — Dark/Light mode toggle
 *
 * The inline <script> in each page's <head> already set data-theme on <html>
 * before first paint, and added .no-transition to suppress the initial
 * colour transition. This file:
 *   1. Removes .no-transition after the first frame (so manual toggles animate)
 *   2. Syncs the toggle button's icon and aria-label to the current theme
 *   3. Handles clicks — flip theme, persist to localStorage, update button
 */

(function () {
  'use strict';

  var ICON_DARK  = '☾';   // shown in light mode  → "click to go dark"
  var ICON_LIGHT = '☀';   // shown in dark mode   → "click to go light"

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateButton(theme);
  }

  function updateButton(theme) {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var icon  = btn.querySelector('.theme-icon');
    var isDark = theme === 'dark';
    if (icon) icon.textContent = isDark ? ICON_LIGHT : ICON_DARK;
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Remove the no-transition class so manual toggles animate from here on
    requestAnimationFrame(function () {
      document.documentElement.classList.remove('no-transition');
    });

    // Sync button icon and label to what the inline script already applied
    updateButton(currentTheme());

    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  });
})();
```

- [ ] **Step 2: Verify the file exists**

Open `http://localhost:8080/js/theme.js` — should return the JS, not a 404.

---

## Task 3: Update root HTML pages (6 files)

These files live at the root and use root-relative asset paths (`css/`, `js/`).

**Files:** `index.html`, `about.html`, `books.html`, `contact.html`, `journal.html`, `media.html`

For each file, make **three changes**:

### Change A — Add theme.css + inline init script in `<head>` after the last stylesheet

**For `index.html`** (uses `?v=2`):

Find:
```html
  <link rel="stylesheet" href="css/styles.css?v=2">
</head>
```
Replace with:
```html
  <link rel="stylesheet" href="css/styles.css?v=2">
  <link rel="stylesheet" href="css/theme.css">
  <script>(function(){var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);document.documentElement.classList.add('no-transition');})();</script>
</head>
```

**For `about.html`, `books.html`, `contact.html`, `journal.html`, `media.html`** (no `?v=2`):

Find:
```html
  <link rel="stylesheet" href="css/styles.css">
</head>
```
Replace with:
```html
  <link rel="stylesheet" href="css/styles.css">
  <link rel="stylesheet" href="css/theme.css">
  <script>(function(){var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);document.documentElement.classList.add('no-transition');})();</script>
</head>
```

### Change B — Add toggle button in `<nav class="site-nav">` before `.nav-hamburger`

Find (in every file):
```html
    <button class="nav-hamburger"
```
Insert before it:
```html
    <button class="theme-toggle" id="theme-toggle" aria-label="Switch to dark mode">
      <span class="theme-icon" aria-hidden="true">☾</span>
    </button>
```

### Change C — Add theme.js script before `</body>`

Find `</body>` and insert before it:
```html
  <script src="js/theme.js"></script>
</body>
```

- [ ] **Step 1: Update index.html**
- [ ] **Step 2: Update about.html**
- [ ] **Step 3: Update books.html**
- [ ] **Step 4: Update contact.html**
- [ ] **Step 5: Update journal.html**
- [ ] **Step 6: Update media.html**

- [ ] **Step 7: Smoke-test in browser**

Open `http://localhost:8080`. You should see a moon ☾ icon in the nav. Click it — page transitions smoothly to dark warm charcoal (no flash). Click again — back to parchment. Reload — stays in chosen mode. Open a private window — matches OS dark mode setting.

- [ ] **Step 8: Verify grep — all 6 root pages have the toggle**

```bash
grep -L "theme-toggle" index.html about.html books.html contact.html journal.html media.html
```
Expected output: nothing (empty — all files matched). Any filename printed means that file was missed.

- [ ] **Step 9: Commit**

```bash
git add css/theme.css js/theme.js index.html about.html books.html contact.html journal.html media.html
git commit -m "feat: add dark/light mode toggle to root pages"
```

---

## Task 4: Update books/ subdirectory pages (5 files)

Uses `../css/` and `../js/` paths.

**Files:** `books/angles-or-angels.html`, `books/king-alfreds-daughter.html`, `books/sermon-of-the-wolf.html`, `books/the-happy-ending.html`, `books/the-singing-bowl.html`

All 5 files use `../css/styles.css` (no version query).

### Change A — theme.css + inline init script after last stylesheet

Find:
```html
  <link rel="stylesheet" href="../css/styles.css">
</head>
```
Replace with:
```html
  <link rel="stylesheet" href="../css/styles.css">
  <link rel="stylesheet" href="../css/theme.css">
  <script>(function(){var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);document.documentElement.classList.add('no-transition');})();</script>
</head>
```

### Change B — toggle button before `.nav-hamburger` (identical markup to Task 3)

### Change C — theme.js before `</body>`

```html
  <script src="../js/theme.js"></script>
</body>
```

- [ ] **Step 1: Update books/angles-or-angels.html**
- [ ] **Step 2: Update books/king-alfreds-daughter.html**
- [ ] **Step 3: Update books/sermon-of-the-wolf.html**
- [ ] **Step 4: Update books/the-happy-ending.html**
- [ ] **Step 5: Update books/the-singing-bowl.html**

- [ ] **Step 6: Verify grep**

```bash
grep -L "theme-toggle" books/*.html
```
Expected: empty output.

- [ ] **Step 7: Smoke-test**

Open `http://localhost:8080/books/angles-or-angels.html`. Toggle should work. Switch to dark on a root page, navigate to a books page — stays dark.

- [ ] **Step 8: Commit**

```bash
git add books/
git commit -m "feat: add dark/light mode toggle to books pages"
```

---

## Task 5: Update journal/ subdirectory pages (11 files)

Same as Task 4. Uses `../css/styles.css` (no version query), `../css/theme.css`, `../js/theme.js`.

**Files:** `journal/post.html`, `journal/coronation-of-the-king.html`, `journal/finding-aethelflad-in-chester.html`, `journal/finding-aethelflad-in-derby.html`, `journal/finding-aethelflad-in-leicester.html`, `journal/finding-aethelflad-in-shrewsbury.html`, `journal/finding-aethelflad-in-tamworth.html`, `journal/finding-aethelflad-in-warwick.html`, `journal/finding-aethelflad-in-worcester.html`, `journal/gloucester-aethelflads-capital.html`, `journal/kingston-the-coronation-stone.html`

Apply the same three changes as Task 4 to all 11 files.

- [ ] **Step 1: Update journal/post.html**
- [ ] **Step 2: Update journal/coronation-of-the-king.html**
- [ ] **Step 3: Update journal/finding-aethelflad-in-chester.html**
- [ ] **Step 4: Update journal/finding-aethelflad-in-derby.html**
- [ ] **Step 5: Update journal/finding-aethelflad-in-leicester.html**
- [ ] **Step 6: Update journal/finding-aethelflad-in-shrewsbury.html**
- [ ] **Step 7: Update journal/finding-aethelflad-in-tamworth.html**
- [ ] **Step 8: Update journal/finding-aethelflad-in-warwick.html**
- [ ] **Step 9: Update journal/finding-aethelflad-in-worcester.html**
- [ ] **Step 10: Update journal/gloucester-aethelflads-capital.html**
- [ ] **Step 11: Update journal/kingston-the-coronation-stone.html**

- [ ] **Step 12: Verify grep**

```bash
grep -L "theme-toggle" journal/*.html
```
Expected: empty output. (`journal/post.html` is included in the glob and should match.)

- [ ] **Step 13: Smoke-test**

Open `http://localhost:8080/journal.html`, click a post card — theme persists into the post page. Toggle on the post page — persists back to other pages.

- [ ] **Step 14: Commit**

```bash
git add journal/
git commit -m "feat: add dark/light mode toggle to journal pages"
```

---

## Task 6: Full cross-page verification

- [ ] **Check 1 — No flash of wrong theme (first-time OS dark user)**

Open a private/incognito window with OS set to dark mode. Load `http://localhost:8080`. Should open in dark mode with no visible light flash or animated fade-in. If there is a flash, the inline script or `.no-transition` class is in the wrong position.

- [ ] **Check 2 — Smooth toggle animation**

In an already-loaded tab, click the toggle. The transition from light to dark (and back) should be a smooth 0.25s colour fade, not instant.

- [ ] **Check 3 — Permanently-dark sections stay dark in light mode**

Confirm these stay dark in light mode:
- Footer (bottom of any page)
- Homepage hero portrait section
- Inner-page heroes (open `about.html`)
- Anglo-Saxon arc / chapter strip on homepage
- Newsletter / waitlist CTA sections

- [ ] **Check 4 — Content sections switch correctly in dark mode**

Confirm in dark mode:
- Main body background → warm charcoal `#1C1A18`
- Book cards, journal cards → `#252220` surface
- Body text → warm off-white `#C8C0B8`
- Headings → `#EDE8E0`

- [ ] **Check 5 — Toggle button accessible state**

Inspect the toggle in DevTools:
- Light mode: `aria-label="Switch to dark mode"`, icon text `☾`
- Dark mode: `aria-label="Switch to light mode"`, icon text `☀`

- [ ] **Check 6 — Keyboard**

Tab to the toggle — visible burgundy focus ring. Enter/Space — toggles theme.

---

## Task 7: Final commit and push

- [ ] **Step 1: Status check**

```bash
cd "e:\Claude stuff\david-stokes-website"
git status
```

Expected: clean working tree.

- [ ] **Step 2: Push**

```bash
git push origin master
```
