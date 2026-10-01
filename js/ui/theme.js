/**
 * DOCVERO Theme Manager
 * Manages Dark Mode / Light Mode with localStorage persistence
 * and automatic OS system preference detection.
 */

const THEME_STORAGE_KEY = 'docvero-theme';

export function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  // Update theme toggle button titles & aria-labels
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    const isDark = theme === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

export function initTheme() {
  const initial = getPreferredTheme();
  applyTheme(initial);

  // Listen for OS system theme changes if user hasn't set explicit preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Bind all toggle buttons on page
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleTheme();
    });
  });
}
