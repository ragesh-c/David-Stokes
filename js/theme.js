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
