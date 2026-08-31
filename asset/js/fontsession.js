/**
 * Runs inline in <head>, before first paint.
 *
 * Re-applies the font classes recorded on a previous visit so cached fonts do
 * not swap in after the page has already painted. Keep it small and
 * synchronous — it blocks rendering on purpose.
 */
(() => {
  'use strict';

  const FONT_KEYS = [
    'font-primary-icons',
    'headings-font-family-h1',
    'headings-font-family-others',
    'font-family-sans-serif',
    'font-family-serif',
  ];

  // Must match the deferred font loader exactly, or nothing is ever found.
  const STORAGE_SUFFIX = 'omeka';

  const fontStorageKey = (fontKey) => {
    const domain = window.location.hostname.replaceAll('.', '_');
    return `${fontKey}-${domain}-${STORAGE_SUFFIX}`;
  };

  const readStorage = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      // Private browsing or storage disabled.
      return null;
    }
  };

  const { documentElement: html } = document;

  FONT_KEYS.forEach((fontKey) => {
    const cached = readStorage(fontStorageKey(fontKey));

    if (cached === 'true') {
      html.classList.add(`${fontKey}-loaded`);
    } else if (cached === 'false') {
      html.classList.add(`${fontKey}-failed`);
    }
  });

  // Exposed so the deferred loader can reuse the same key format.
  window.fontStorageKey = fontStorageKey;
})();