/**
 * Theme behaviours.
 *
 * jQuery is only used where a third-party plugin requires it (slick).
 * Everything else is plain DOM.
 */
(() => {
  'use strict';

  // ---------------------------------------------------------------- helpers

  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const debounce = (fn, wait = 150) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* private mode / storage disabled */
      }
    },
  };

  const uniqueId = () =>
    crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // ------------------------------------------------------------ font loading

  const FONTS = {
    'headings-font-family-h1': 'ManukaBlack',
    'headings-font-family-others': 'National2',
    'font-primary-icons': 'FontAwesome',
    'font-family-sans-serif': 'National2',
    'font-family-serif': 'DartmouthRuzicka',
  };

  const loadFonts = () => {
    if (typeof FontFaceObserver === 'undefined') return;

    const { documentElement: html } = document;
    const domain = window.location.hostname.replaceAll('.', '_');

    Object.entries(FONTS).forEach(async ([key, family]) => {
      const storageKey = `${key}-${domain}-omeka`;
      const cached = storage.get(storageKey);

      // Already know the outcome from a previous visit.
      if (cached === 'true') {
        html.classList.add(`${key}-loaded`);
        return;
      }
      if (cached === 'false') {
        html.classList.add(`${key}-failed`);
        return;
      }

      try {
        await new FontFaceObserver(family).load(null, 5000);
        storage.set(storageKey, 'true');
        html.classList.add(`${key}-loaded`);
      } catch {
        storage.set(storageKey, 'false');
        html.classList.add(`${key}-failed`);
      }
    });
  };

  // ------------------------------------------------------- site promo image

  const PROMO_IMAGE_RATIO = 0.625;

  const syncPromoImageHeight = () => {
    const img = document.querySelector('#content.used-for-site-promo .site-promo-image figure img');
    if (!img) return;
    img.style.height = `${img.clientWidth * PROMO_IMAGE_RATIO}px`;
  };

  // -------------------------------------------------------- media carousels

  const SLICK_OPTIONS = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 8000,
    dots: true,
    adaptiveHeight: true,
    accessibility: true,
    arrowsPlacement: 'split',
    focusOnSelect: true,
    fade: true,
    cssEase: 'linear',
  };

  const initMediaCarousels = () => {
    const jq = window.jQuery;
    if (!jq?.fn?.slick) return;

    $$('.item.resource.show .media-embeds').forEach((embeds) => {
      const isSingleImage = embeds.querySelectorAll(':scope > .media-render').length < 2;
      const isSpeakout = Boolean(embeds.closest('.page-wrapper.speakout'));
      const isInitialized = embeds.classList.contains('slick-initialized');

      if (isSingleImage || isSpeakout || isInitialized) return;

      jq(embeds).slick(SLICK_OPTIONS);
    });
  };

  const slickCommand = (slider, command) => {
    const jq = window.jQuery;
    if (jq?.fn?.slick) jq(slider).slick(command);
  };

  // ------------------------------------------------------------ value links

  const linkifyValues = () => {
    if (typeof window.Autolink?.linkifyElement !== 'function') return;

    $$('.value-content').forEach((el) => window.Autolink.linkifyElement(el));
  };

  // ---------------------------------------------------------------- lightbox

  /** Tag image links so Tobii can pick them up, and so we can map back to a slide. */
  const tagLightboxLinks = () => {
    $$('.item.resource.show .media-embeds .media-render img').forEach((img) => {
      const link = img.closest('a');
      if (!link || link.closest('.slick-cloned')) return;

      link.classList.add('dcl-lightbox');
      if (!link.id) link.id = `dcl-${uniqueId()}`;
    });
  };

  const initLightbox = () => {
    if (typeof Tobii === 'undefined') return;

    new Tobii({ selector: '.dcl-lightbox' });

    // Match each lightbox image to the carousel link it came from.
    const links = $$('a.dcl-lightbox');
    $$('.tobii-image img').forEach((img) => {
      const { src } = img.dataset;
      if (!src) return;

      const match = links.find((link) => link.getAttribute('href') === src);
      if (match) img.dataset.slickId = match.id;
    });

    $$('.tobii-zoom__icon').forEach((icon) => {
      icon.tabIndex = 0;
    });
  };

  /** Keep the carousel in step with the lightbox arrows. */
  const handleLightboxNav = (event) => {
    const button = event.target.closest('.tobii__btn--next, .tobii__btn--previous');
    if (!button) return;

    const activeImage = document.querySelector('.tobii__slide--is-active img');
    const slickId = activeImage?.dataset.slickId;
    if (!slickId) return;

    const slider = document.getElementById(slickId)?.closest('.slick-slider');
    if (!slider) return;

    slickCommand(slider, button.classList.contains('tobii__btn--next') ? 'slickNext' : 'slickPrev');
  };

  /** Expand / compress the image within the lightbox details pane. */
  const handleLightboxControl = (event) => {
    const control = event.target.closest('a.lightbox-control');
    if (!control) return;

    event.preventDefault();

    const icon = control.querySelector('.fa');
    const isExpanded = Boolean(icon?.classList.contains('fa-expand'));

    icon?.classList.toggle('fa-expand', !isExpanded);
    icon?.classList.toggle('fa-compress', isExpanded);
    control.closest('.lightbox-details-img')?.classList.toggle('with-description', !isExpanded);
  };

  // --------------------------------------------------------- language switch

  const initLanguageSwitcher = () => {
    const select = document.querySelector('header select.language-switcher');
    if (!select) return;

    select.addEventListener('change', () => {
      const { href } = select.selectedOptions[0]?.dataset ?? {};
      if (href) window.location.pathname = href;
    });
  };

  // ------------------------------------------------------------ back to top

  const BACK_TO_TOP_OFFSET = 400;

  const initBackToTop = () => {
    const button = document.getElementById('back-to-top-btn');
    if (!button) return;

    button.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const sync = () => {
      button.style.display = window.scrollY > BACK_TO_TOP_OFFSET ? '' : 'none';
    };

    window.addEventListener('scroll', sync, { passive: true });
    sync();
  };

  // --------------------------------------------------------------- sub menu

  const initSubMenu = () => {
    const content = document.getElementById('dcl-sub-menu-content');
    const controls = $$('.dcl-sub-menu-control');
    if (!content || controls.length === 0) return;

    controls.forEach((control) => {
      control.addEventListener('click', () => {
        const isExpanded = control.getAttribute('aria-expanded') === 'true';
        control.setAttribute('aria-expanded', String(!isExpanded));
        content.style.display = isExpanded ? 'none' : '';
      });
    });
  };

  // ------------------------------------------------- left-aligned block runs

  const markAfterLeftAligned = (className = 'is-after-left-align') => {
    $$('.block-layout-alignment-block-left').forEach((start) => {
      let sibling = start.nextElementSibling;

      while (sibling && !sibling.classList.contains('block-media')) {
        sibling.classList.add(className);
        sibling = sibling.nextElementSibling;
      }
    });
  };

  // -------------------------------------------------------------------- init

  const init = () => {
    loadFonts();

    syncPromoImageHeight();
    window.addEventListener('resize', debounce(syncPromoImageHeight), { passive: true });

    initMediaCarousels();
    linkifyValues();

    tagLightboxLinks();
    initLightbox();

    document.addEventListener('click', handleLightboxNav);
    document.addEventListener('click', handleLightboxControl);

    initLanguageSwitcher();
    initBackToTop();
    initSubMenu();
    markAfterLeftAligned();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();