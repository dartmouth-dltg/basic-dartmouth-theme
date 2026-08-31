/*
 * Based on autolink-js by Bryan Woods, used under the MIT license.
 * https://github.com/bryanwoods/autolink-js
 *
 * Rewritten in modern JavaScript. Adds a DOM-based API that never builds
 * markup from a string, and escapes matched URLs in the string-based API.
 */
(() => {
  'use strict';

  /**
   * A URL must be preceded by the start of the string, whitespace, or a simple
   * tag, so URLs already inside an href are left alone. The final character
   * class excludes trailing punctuation, so "see http://example.com." keeps the
   * full stop outside the link.
   */
  const URL_PATTERN =
    /(^|[\s\n]|<[a-z]*\/?>)((?:https?|ftp):\/\/[-\w+&@#/%?=()~|!:,.;\u2019]*[-\w+&@#/%=~()|])/gi;

  const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

  const attributeEntries = (attributes) =>
    Object.entries(attributes).filter(([, value]) => value != null && value !== false);

  const buildAttributeString = (attributes) =>
    attributeEntries(attributes)
      .map(([name, value]) => (value === true ? ` ${name}` : ` ${name}="${escapeHtml(value)}"`))
      .join('');

  /**
   * Turn bare URLs in a string into anchors and return a string.
   *
   * The input is treated as HTML (that is what the original did), so the text
   * around each URL is passed through untouched — only the matched URL is
   * escaped. If your input is plain text, prefer linkifyElement below.
   *
   * @param {string} text
   * @param {object} [options] Attributes for the generated anchor, plus an
   *   optional `callback(url)` that can return replacement HTML.
   * @returns {string}
   */
  const linkify = (text, { callback, ...attributes } = {}) =>
    String(text).replace(URL_PATTERN, (match, prefix, url) => {
      const replacement = callback?.(url);
      if (typeof replacement === 'string' && replacement.length > 0) {
        return `${prefix}${replacement}`;
      }
      return `${prefix}<a href="${escapeHtml(url)}"${buildAttributeString(attributes)}>${escapeHtml(url)}</a>`;
    });

  const createAnchor = (url, attributes) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.textContent = url;

    attributeEntries(attributes).forEach(([name, value]) => {
      anchor.setAttribute(name, value === true ? '' : String(value));
    });

    return anchor;
  };

  const toNode = (replacement) => {
    if (replacement instanceof Node) return replacement;

    const template = document.createElement('template');
    template.innerHTML = replacement;
    return template.content;
  };

  /**
   * Turn bare URLs in a plain-text string into anchors and return a fragment.
   * Nothing is parsed as HTML, so the surrounding text cannot inject markup.
   *
   * @param {string} text
   * @param {object} [options] Same shape as linkify. `callback(url)` may return
   *   a Node or an HTML string.
   * @returns {DocumentFragment}
   */
  const linkifyToFragment = (text, { callback, ...attributes } = {}) => {
    const source = String(text);
    const fragment = document.createDocumentFragment();
    let cursor = 0;

    for (const match of source.matchAll(URL_PATTERN)) {
      const [, prefix, url] = match;
      const urlStart = match.index + prefix.length;
      const replacement = callback?.(url);

      fragment.append(source.slice(cursor, urlStart));
      fragment.append(replacement ? toNode(replacement) : createAnchor(url, attributes));

      cursor = urlStart + url.length;
    }

    fragment.append(source.slice(cursor));
    return fragment;
  };

  /**
   * Replace an element's text content with the same text, URLs linked.
   *
   * @param {Element} element
   * @param {object} [options] Same shape as linkify.
   * @returns {Element} the element, for chaining
   */
  const linkifyElement = (element, options) => {
    element.replaceChildren(linkifyToFragment(element.textContent, options));
    return element;
  };

  /**
   * Add String.prototype.autoLink for callers that still expect it.
   * Non-enumerable, so it does not show up in for...in over a string.
   */
  const installStringMethod = () => {
    if (typeof String.prototype.autoLink === 'function') return;

    Object.defineProperty(String.prototype, 'autoLink', {
      value(options) {
        return linkify(this, options);
      },
      writable: true,
      configurable: true,
      enumerable: false,
    });
  };

  window.Autolink = { linkify, linkifyToFragment, linkifyElement, installStringMethod };
})();