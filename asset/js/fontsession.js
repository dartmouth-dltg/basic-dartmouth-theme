'use strict';

const html = document.documentElement;

const fontNames = [
  'font-primary-icons',
  'headings-font-family-h1',
  'headings-font-family-others',
  'font-family-sans-serif',
  'font-family-serif',
];

if (typeof Storage !== 'undefined') {
  const domain = window.location.hostname.replace(/\./g, '_');
  fontNames.forEach(function addFontClass(index) {
    const storageKey = `${index}-${domain}`;
    if (localStorage[storageKey]) {
      html.classList.add(`${index}-loaded`);
    }
  });
}
