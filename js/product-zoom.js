/**
 * ProductImageZoom - Amazon / Flipkart Style Magnifier
 * 
 * Features:
 * - High-performance cursor tracking using requestAnimationFrame (60fps, no lag)
 * - Semi-transparent square lens overlay with brand styling (20-25% opacity)
 * - Separate right-side preview panel with boundary and viewport detection
 * - Pure HTML, CSS, JavaScript (zero external dependencies)
 * - Desktop hover + mobile touch tap/drag fallback
 * - Multiple images / thumbnail switching support
 * - Lazy loading for high-resolution images
 * - Smooth fade and slight scale animation on hover start
 * - Minimal design (no rounded corners, clean borders, subtle shadows)
 */

class ProductImageZoom {
  /**
   * @param {Object} options
   * @param {HTMLElement|string} options.container - The wrapper element containing the product image
   * @param {HTMLImageElement|string} options.image - The main product image element
   * @param {number} [options.zoomLevel=2.5] - Magnification factor (e.g. 2.5x)
   * @param {number} [options.lensSize=160] - Default size of the square lens in pixels
   * @param {string} [options.highResSrc] - Optional high-resolution image URL
   */
  constructor(options = {}) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : options.container;

    this.img = typeof options.image === 'string'
      ? document.querySelector(options.image)
      : options.image;

    if (!this.container || !this.img) {
      console.warn('[ProductImageZoom] Container or image element not found.');
      return;
    }

    this.zoomLevel = options.zoomLevel || 2.5;
    this.lensSize = options.lensSize || 160;
    this.highResSrc = options.highResSrc || this.img.getAttribute('data-zoom-image') || null;
    this.title = options.title || `ZOOM PREVIEW &bull; ${this.zoomLevel}X`;
    this.anchorContainer = options.anchorContainer
      ? (typeof options.anchorContainer === 'string' ? document.querySelector(options.anchorContainer) : options.anchorContainer)
      : null;
    this.customPreviewWidth = options.previewWidth || null;
    this.customPreviewHeight = options.previewHeight || null;

    this.isActive = false;
    this.isTouch = false;
    this.rAF = null;

    // Latest mouse/touch position
    this.clientX = 0;
    this.clientY = 0;

    // Cached layout rects
    this.containerRect = null;
    this.imgRect = null;

    this.init();
  }

  setTitle(title) {
    this.title = title;
    if (this.previewTitleSpan) {
      this.previewTitleSpan.innerHTML = title;
    }
  }

  init() {
    // Clean any prior instance on this container
    if (this.container._productZoomInstance) {
      this.container._productZoomInstance.destroy();
    }
    this.container._productZoomInstance = this;

    // Apply base styles to container
    this.container.classList.add('product-zoom-container');

    // Create lens element
    this.lens = document.createElement('div');
    this.lens.className = 'product-zoom-lens';
    this.lens.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.lens);

    // Create preview panel element (appended to body to bypass any ancestor overflow)
    this.preview = document.createElement('div');
    this.preview.className = 'product-zoom-preview';
    this.preview.setAttribute('aria-hidden', 'true');

    // Header label inside preview panel
    this.previewHeader = document.createElement('div');
    this.previewHeader.className = 'product-zoom-preview-header';
    
    this.previewBadgeIcon = document.createElement('span');
    this.previewBadgeIcon.className = 'zoom-badge-icon';
    this.previewBadgeIcon.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="11" y1="8" x2="11" y2="14"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
    `;

    this.previewTitleSpan = document.createElement('span');
    this.previewTitleSpan.className = 'zoom-badge-title';
    this.previewTitleSpan.innerHTML = this.title;

    this.previewHeader.appendChild(this.previewBadgeIcon);
    this.previewHeader.appendChild(this.previewTitleSpan);
    this.preview.appendChild(this.previewHeader);

    document.body.appendChild(this.preview);

    // Bind event handlers
    this._bindEvents();

    // Initial background image setup
    this.updateSource(this.img.currentSrc || this.img.src, this.highResSrc);
  }

  _bindEvents() {
    this._onMouseEnter = this.onMouseEnter.bind(this);
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onMouseLeave = this.onMouseLeave.bind(this);

    this._onTouchStart = this.onTouchStart.bind(this);
    this._onTouchMove = this.onTouchMove.bind(this);
    this._onTouchEnd = this.onTouchEnd.bind(this);

    this._onWindowResize = this.onWindowResize.bind(this);

    // Attach desktop hover events to the container
    this.container.addEventListener('mouseenter', this._onMouseEnter);
    this.container.addEventListener('mousemove', this._onMouseMove);
    this.container.addEventListener('mouseleave', this._onMouseLeave);

    // Attach mobile touch events to the container
    this.container.addEventListener('touchstart', this._onTouchStart, { passive: false });
    this.container.addEventListener('touchmove', this._onTouchMove, { passive: false });
    this.container.addEventListener('touchend', this._onTouchEnd);
    this.container.addEventListener('touchcancel', this._onTouchEnd);

    window.addEventListener('resize', this._onWindowResize);
    window.addEventListener('scroll', this._onWindowResize, { passive: true });

    // Listen to parent scrollable elements (e.g. modals)
    this._scrollParents = [];
    let p = this.container.parentElement;
    while (p && p !== document.body) {
      const style = window.getComputedStyle(p);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        p.addEventListener('scroll', this._onWindowResize, { passive: true });
        this._scrollParents.push(p);
      }
      p = p.parentElement;
    }
  }

  updateSource(src, highResSrc = null) {
    if (!src) return;
    this.currentSrc = src;
    this.highResSrc = highResSrc || this.img.getAttribute('data-zoom-image') || null;

    // Set immediate preview background with current image
    this.preview.style.backgroundImage = `url('${src}')`;

    // Lazy load high-res image if available
    if (this.highResSrc && this.highResSrc !== src) {
      const highResImg = new Image();
      highResImg.src = this.highResSrc;
      highResImg.onload = () => {
        if (this.currentSrc === src) {
          this.preview.style.backgroundImage = `url('${this.highResSrc}')`;
        }
      };
    }
  }

  refreshRects() {
    this.containerRect = this.container.getBoundingClientRect();
    this.imgRect = this.img.getBoundingClientRect();
  }

  onMouseEnter(e) {
    this.isTouch = false;
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    this.show();
  }

  onMouseMove(e) {
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    if (!this.isActive) {
      this.show();
    }
    this._requestTick();
  }

  onMouseLeave() {
    this.hide();
  }

  onTouchStart(e) {
    if (e.touches && e.touches.length > 0) {
      this.isTouch = true;
      this.clientX = e.touches[0].clientX;
      this.clientY = e.touches[0].clientY;
      this.show();
      this._requestTick();
    }
  }

  onTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      // Prevent screen scroll while zooming on mobile touch drag
      e.preventDefault();
      this.clientX = e.touches[0].clientX;
      this.clientY = e.touches[0].clientY;
      this._requestTick();
    }
  }

  onTouchEnd() {
    this.hide();
  }

  onWindowResize() {
    if (this.isActive) {
      this.refreshRects();
      this._positionPreviewPanel();
      this._requestTick();
    }
  }

  show() {
    // Only activate if image has loaded and has dimensions
    if (!this.img.complete || this.img.naturalWidth === 0) return;

    this.refreshRects();
    if (this.containerRect.width === 0 || this.containerRect.height === 0) return;

    this.isActive = true;

    // Setup preview dimensions and position
    this._positionPreviewPanel();

    // Show elements with animation
    this.lens.classList.add('is-active');
    this.preview.classList.add('is-active');

    this._requestTick();
  }

  hide() {
    this.isActive = false;
    if (this.rAF) {
      cancelAnimationFrame(this.rAF);
      this.rAF = null;
    }
    this.lens.classList.remove('is-active');
    this.preview.classList.remove('is-active');
  }

  _positionPreviewPanel() {
    const baseRect = this.anchorContainer ? this.anchorContainer.getBoundingClientRect() : this.containerRect;
    const cRect = this.containerRect;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Desired preview dimensions:
    const targetH = this.customPreviewHeight || Math.min(Math.max(340, Math.round(baseRect.height)), viewportH - 24);
    let targetW = this.customPreviewWidth || Math.min(520, Math.max(340, Math.round(baseRect.width * 1.05)));

    // Check space on right side
    const spaceRight = viewportW - baseRect.right - 20;
    const spaceLeft = baseRect.left - 20;

    let left = 0;
    let top = baseRect.top;

    if (spaceRight >= 340) {
      // Plenty of room on right (Standard Amazon desktop layout)
      targetW = Math.min(targetW, spaceRight);
      left = baseRect.right + 16;
    } else if (spaceLeft >= 340) {
      // Flip to left side if right is restricted
      targetW = Math.min(targetW, spaceLeft);
      left = baseRect.left - targetW - 16;
    } else {
      // Mobile / Tablet fallback: inner overlay zoom directly over the image
      left = cRect.left;
      top = cRect.top;
      targetW = cRect.width;
    }

    // Keep preview vertically inside the viewport
    if (top + targetH > viewportH - 12) {
      top = Math.max(12, viewportH - targetH - 12);
    }
    if (top < 12) {
      top = 12;
    }

    this.previewWidth = targetW;
    this.previewHeight = targetH;

    this.preview.style.width = `${targetW}px`;
    this.preview.style.height = `${targetH}px`;
    this.preview.style.left = `${Math.round(left)}px`;
    this.preview.style.top = `${Math.round(top)}px`;

    // Lens dimensions are proportional to panel and zoomLevel
    this.actualLensW = Math.max(30, Math.min(cRect.width * 0.85, Math.round(targetW / this.zoomLevel)));
    this.actualLensH = Math.max(30, Math.min(cRect.height * 0.85, Math.round(targetH / this.zoomLevel)));

    this.lens.style.width = `${this.actualLensW}px`;
    this.lens.style.height = `${this.actualLensH}px`;
  }

  _requestTick() {
    if (!this.rAF) {
      this.rAF = requestAnimationFrame(() => {
        this.rAF = null;
        this._update();
      });
    }
  }

  _update() {
    if (!this.isActive || !this.containerRect) return;

    const cRect = this.containerRect;
    const lensW = this.actualLensW;
    const lensH = this.actualLensH;

    // Cursor position relative to container
    let relX = this.clientX - cRect.left;
    let relY = this.clientY - cRect.top;

    // Center lens around cursor
    let lensX = relX - lensW / 2;
    let lensY = relY - lensH / 2;

    // Constrain lens strictly within container boundaries
    const maxX = cRect.width - lensW;
    const maxY = cRect.height - lensH;

    lensX = Math.max(0, Math.min(lensX, maxX));
    lensY = Math.max(0, Math.min(lensY, maxY));

    // Move lens via GPU translate3d (zero layout recalculation)
    this.lens.style.transform = `translate3d(${Math.round(lensX)}px, ${Math.round(lensY)}px, 0)`;

    // Calculate background scale and position
    // Ratio of lens movement across container
    const ratioX = maxX > 0 ? (lensX / maxX) : 0;
    const ratioY = maxY > 0 ? (lensY / maxY) : 0;

    // Zoomed image dimensions in the preview panel
    const zoomX = this.previewWidth / lensW;
    const zoomY = this.previewHeight / lensH;

    const bgWidth = cRect.width * zoomX;
    const bgHeight = cRect.height * zoomY;

    // Max background offset
    const maxBgScrollX = bgWidth - this.previewWidth;
    const maxBgScrollY = bgHeight - this.previewHeight;

    const bgX = ratioX * maxBgScrollX;
    const bgY = ratioY * maxBgScrollY;

    this.preview.style.backgroundSize = `${Math.round(bgWidth)}px ${Math.round(bgHeight)}px`;
    this.preview.style.backgroundPosition = `-${Math.round(bgX)}px -${Math.round(bgY)}px`;
  }

  destroy() {
    this.hide();

    if (this._onMouseEnter) {
      this.container.removeEventListener('mouseenter', this._onMouseEnter);
      this.container.removeEventListener('mousemove', this._onMouseMove);
      this.container.removeEventListener('mouseleave', this._onMouseLeave);

      this.container.removeEventListener('touchstart', this._onTouchStart);
      this.container.removeEventListener('touchmove', this._onTouchMove);
      this.container.removeEventListener('touchend', this._onTouchEnd);
      this.container.removeEventListener('touchcancel', this._onTouchEnd);

      window.removeEventListener('resize', this._onWindowResize);
      window.removeEventListener('scroll', this._onWindowResize);
    }

    if (this._scrollParents && this._scrollParents.length > 0) {
      this._scrollParents.forEach(p => p.removeEventListener('scroll', this._onWindowResize));
      this._scrollParents = [];
    }

    if (this.lens && this.lens.parentNode) {
      this.lens.parentNode.removeChild(this.lens);
    }

    if (this.preview && this.preview.parentNode) {
      this.preview.parentNode.removeChild(this.preview);
    }

    this.container.classList.remove('product-zoom-container');
    delete this.container._productZoomInstance;
  }
}

// Global exposure
window.ProductImageZoom = ProductImageZoom;
