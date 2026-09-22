/**
 * GCH Image Gallery — Quadrant Splitter & Lightbox
 * Global CNC Hardware
 *
 * Splits a single combined 2×2 image into 4 individual view panels using
 * pure CSS (overflow + transform). No server-side processing required.
 *
 * Views: [0] Front View (top-left) | [1] Back View (top-right)
 *        [2] Side View (bottom-left) | [3] Connector View (bottom-right)
 */

(function (window) {
  'use strict';

  // ─── Constants ───────────────────────────────────────────────────────────────

  const VIEW_LABELS = ['Front View', 'Back View', 'Side View', 'Connector View'];
  const VIEW_ICONS = [
    // Front — layers icon
    'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    // Back — rotate icon
    'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    // Side — eye icon
    'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    // Connector — plug icon
    'M7 16V4m0 0L3 8m4-4l4 4M17 8v8m0 0l4-4m-4 4l-4-4M3 12h18',
  ];

  // Quadrant CSS: each pair is [translateX%, translateY%] for the 200%-sized inner image
  // Quadrant 0 (top-left):    img origin at 0, 0
  // Quadrant 1 (top-right):   img shifted -50% on X
  // Quadrant 2 (bottom-left): img shifted -50% on Y
  // Quadrant 3 (bottom-right): img shifted -50% on both
  const QUADRANT_TRANSFORMS = [
    { x: '0%',   y: '0%'   },  // Front  — top-left
    { x: '-50%', y: '0%'   },  // Back   — top-right
    { x: '0%',   y: '-50%' },  // Side   — bottom-left
    { x: '-50%', y: '-50%' },  // Connector — bottom-right
  ];

  // ─── Lightbox State ──────────────────────────────────────────────────────────

  let _lb = null;  // reference to active lightbox DOM element
  let _lbIndex = 0;
  let _lbImages = [];
  let _lbLabels = [];

  // ─── Public API ──────────────────────────────────────────────────────────────

  /**
   * GCHGallery.render(options) → HTML string
   *
   * @param {object} options
   * @param {string}   options.imageSrc   — URL of the combined 2×2 image
   * @param {string}   [options.altText]  — Alt text base
   * @param {boolean}  [options.isSingleFallback] — if true, same image shown in all 4 slots
   * @param {string}   [options.galleryId]         — unique id prefix for DOM nodes
   * @param {string}   [options.watermarkText]     — watermark overlay text
   * @returns {string} HTML string to inject
   */
  function render(options) {
    const {
      imageSrc,
      altText = 'Product Image',
      isSingleFallback = false,
      galleryId = 'gch-gallery-' + Date.now(),
      watermarkText = 'GCH | Global CNC Hardware',
    } = options;

    const cells = VIEW_LABELS.map((label, idx) => {
      const t = QUADRANT_TRANSFORMS[idx];
      return `
        <div class="gch-quad-cell"
             onclick="GCHGallery.openLightbox(${idx}, '${galleryId}', '${escapeAttr(imageSrc)}', ${JSON.stringify(isSingleFallback)})"
             title="Click to enlarge — ${label}">

          <!-- Image quadrant clip -->
          <div class="gch-quad-clip">
            <img
              class="gch-quad-img"
              src="${escapeAttr(imageSrc)}"
              alt="${escapeAttr(altText)} — ${label}"
              style="--tx: ${t.x}; --ty: ${t.y}; transform: translate(${t.x}, ${t.y});"
              onerror="this.closest('.gch-quad-cell').classList.add('gch-quad-cell--error')"
              draggable="false"
              loading="lazy"
            />
          </div>

          <!-- View label ribbon -->
          <div class="gch-quad-label">
            <svg class="gch-quad-label__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${VIEW_ICONS[idx]}"/>
            </svg>
            <span>${label}</span>
          </div>

          <!-- Watermark overlay -->
          <div class="gch-quad-watermark" aria-hidden="true">${escapeHtml(watermarkText)}</div>

          <!-- Zoom cursor hint -->
          <div class="gch-quad-zoom-hint" aria-hidden="true">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
            </svg>
          </div>

          <!-- Error state fallback -->
          <div class="gch-quad-error-msg">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>${label}</span>
          </div>
        </div>
      `;
    });

    return `
      <div class="gch-quad-grid" id="${escapeAttr(galleryId)}" data-image="${escapeAttr(imageSrc)}" data-fallback="${isSingleFallback}">
        ${cells.join('')}
      </div>
    `;
  }

  /**
   * GCHGallery.openLightbox(startIndex, galleryId, imageSrc, isSingleFallback)
   * Opens the fullscreen lightbox at a specific quadrant.
   */
  function openLightbox(startIndex, galleryId, imageSrc, isSingleFallback) {
    _lbIndex = startIndex;
    _lbImages = [imageSrc, imageSrc, imageSrc, imageSrc];
    _lbLabels = VIEW_LABELS.slice();

    const lb = document.getElementById('gch-lightbox');
    if (!lb) return;
    _lb = lb;

    _updateLightbox();
    lb.classList.add('gch-lightbox--open');
    document.body.classList.add('gch-lb-open');
  }

  /**
   * GCHGallery.closeLightbox()
   */
  function closeLightbox() {
    if (!_lb) return;
    _lb.classList.remove('gch-lightbox--open');
    document.body.classList.remove('gch-lb-open');

    // Reset zoom
    const imgWrap = _lb.querySelector('.gch-lightbox__img-wrap');
    if (imgWrap) {
      imgWrap.style.transform = '';
      imgWrap.style.cursor = 'zoom-in';
    }
    _lbZoomed = false;
  }

  /**
   * GCHGallery.prevImage() / nextImage()
   */
  function prevImage() {
    _lbIndex = (_lbIndex - 1 + _lbImages.length) % _lbImages.length;
    _updateLightbox();
  }

  function nextImage() {
    _lbIndex = (_lbIndex + 1) % _lbImages.length;
    _updateLightbox();
  }

  function goToImage(index) {
    if (typeof index === 'number' && index >= 0 && index < _lbImages.length) {
      _lbIndex = index;
      _updateLightbox();
    }
  }

  // ─── Internal ────────────────────────────────────────────────────────────────

  let _lbZoomed = false;

  function _updateLightbox() {
    if (!_lb) return;

    const img = _lb.querySelector('.gch-lightbox__img');
    const labelEl = _lb.querySelector('.gch-lightbox__label');
    const counterEl = _lb.querySelector('.gch-lightbox__counter');
    const imgWrap = _lb.querySelector('.gch-lightbox__img-wrap');

    const t = QUADRANT_TRANSFORMS[_lbIndex];
    const iconEl = _lb.querySelector('.gch-lightbox__view-icon path');

    if (img) {
      img.src = _lbImages[_lbIndex];
      img.alt = _lbLabels[_lbIndex];
      // Apply the quadrant crop transform (200% size, offset to show quadrant)
      img.style.width = '200%';
      img.style.height = '200%';
      img.style.transform = `translate(${t.x}, ${t.y})`;
      img.style.maxWidth = 'none';
    }

    if (labelEl) labelEl.textContent = _lbLabels[_lbIndex];
    if (counterEl) counterEl.textContent = `${_lbIndex + 1} / ${_lbImages.length}`;
    if (iconEl) iconEl.setAttribute('d', VIEW_ICONS[_lbIndex]);

    // Update dot indicators
    const dots = _lb.querySelectorAll('.gch-lightbox__dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('gch-lightbox__dot--active', i === _lbIndex);
    });

    // Reset zoom on image change
    if (imgWrap) {
      imgWrap.style.transform = '';
      imgWrap.style.cursor = 'zoom-in';
    }
    _lbZoomed = false;
  }

  function _initLightboxEvents() {
    const lb = document.getElementById('gch-lightbox');
    if (!lb) return;

    // Backdrop click → close
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('gch-lightbox__backdrop')) {
        closeLightbox();
      }
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (!document.body.classList.contains('gch-lb-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    });

    // Click-to-zoom on the image wrapper
    const imgWrap = lb.querySelector('.gch-lightbox__img-wrap');
    if (imgWrap) {
      imgWrap.addEventListener('click', function (e) {
        if (_lbZoomed) {
          imgWrap.style.transform = '';
          imgWrap.style.cursor = 'zoom-in';
          _lbZoomed = false;
        } else {
          // Zoom into clicked point
          const rect = imgWrap.getBoundingClientRect();
          const ox = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
          const oy = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
          imgWrap.style.transformOrigin = `${ox}% ${oy}%`;
          imgWrap.style.transform = 'scale(2.2)';
          imgWrap.style.cursor = 'zoom-out';
          _lbZoomed = true;
        }
      });
    }

    // Touch swipe
    let _touchStartX = 0;
    lb.addEventListener('touchstart', function (e) {
      _touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      const dx = e.changedTouches[0].clientX - _touchStartX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) nextImage();
        else prevImage();
      }
    }, { passive: true });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function escapeAttr(str) {
    return String(str || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ─── Init on DOM Ready ───────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initLightboxEvents);
  } else {
    _initLightboxEvents();
  }

  // ─── Expose Public API ───────────────────────────────────────────────────────

  window.GCHGallery = {
    render,
    openLightbox,
    closeLightbox,
    prevImage,
    nextImage,
    goToImage,
  };

}(window));
