// Global CNC Hardware - Products Catalog Page JavaScript

let allProducts = [];
let activeCategory = 'All';
let activeBrand = 'All';
let activePriceRange = 'all';
let activeSort = 'default';
let searchTerm = '';

// Helper to convert product name to image filename slug
function getProductSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Helper to convert product custom images array into image filename slug
function getImageSlug(product) {
  if (product.images && product.images.length > 0 && product.images[0]) {
    return product.images[0];
  }
  return getProductSlug(product.name);
}

// Generate product card HTML snippet
function createProductCardHTML(product) {
  const nameSlug = getProductSlug(product.name);
  const primarySlug = getImageSlug(product);
  const formattedPrice = typeof product.price === 'number' ? product.price.toFixed(2) : product.price;
  
  return `
    <a href="product-details.html?id=${encodeURIComponent(product.id)}" class="group border border-line bg-white flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-signal border-b-4 hover:border-b-signal">
      <div class="relative overflow-hidden bg-white">
        <div class="aspect-square w-full bg-white relative flex items-center justify-center overflow-hidden border-b border-line watermarked-image">
          <img 
            src="images/${nameSlug}.jpg" 
            alt="${product.name}" 
            class="aspect-square w-full h-full object-contain p-3 border-b border-line transition-transform duration-300 group-hover:scale-105" 
            onerror="
              if (this.getAttribute('data-tried-fallback') !== 'true') {
                this.setAttribute('data-tried-fallback', 'true');
                this.src = 'images/${primarySlug}.jpg';
              } else {
                this.style.display='none';
                this.parentElement.querySelector('.fallback-box').style.display='flex';
              }
            "
          />

          <div class="fallback-box aspect-square w-full bg-paper hidden items-center justify-center border-b border-line absolute inset-0">
            <div class="text-center p-4">
              <div class="w-12 h-12 mx-auto mb-2 bg-signal/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" class="w-6 h-6 text-signal fill-none stroke-current stroke-2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <span class="text-xs text-steel font-medium">${product.category}</span>
            </div>
          </div>
        </div>
        <span class="absolute top-2 left-2 bg-navy text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 z-20 shadow-sm">
          ${product.category}
        </span>
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="font-display font-bold text-navy text-base leading-tight mb-2 group-hover:text-signal transition-colors">
            ${product.name}
          </h3>
          <p class="text-xs text-steel leading-relaxed mb-4 line-clamp-2">${product.shortDescription || ''}</p>
        </div>
        <div class="pt-3 border-t border-line flex items-center justify-between">
          <span class="font-display font-extrabold text-signal text-lg">₹${formattedPrice}</span>
          <span class="bg-paper px-2 py-0.5 text-steel font-mono text-[11px] font-semibold">${product.sku || ''}</span>
        </div>
      </div>
    </a>
  `;
}

function createProductRailItemHTML(product) {
  return `
    <a href="product-details.html?id=${encodeURIComponent(product.id)}" class="hero-product-ticker__item group">
      <span class="hero-product-ticker__dot" aria-hidden="true"></span>
      <span class="min-w-0">
        <span class="block text-white/90 text-sm font-semibold leading-snug truncate group-hover:text-signal transition-colors">${product.name}</span>
        <span class="block text-white/45 text-[10px] uppercase tracking-wider mt-1">${product.category}</span>
      </span>
    </a>
  `;
}

function createHorizontalProductCardHTML(product) {
  const nameSlug = getProductSlug(product.name);
  const primarySlug = getImageSlug(product);
  
  return `
    <a href="product-details.html?id=${encodeURIComponent(product.id)}" class="horizontal-product-card group">
      <div class="horizontal-product-card__badge">NEW</div>
      <div class="horizontal-product-card__image">
        <img 
          src="images/${nameSlug}.jpg" 
          alt="${product.name}" 
          class="horizontal-product-card__img"
          onerror="
            if (this.getAttribute('data-tried-fallback') !== 'true') {
              this.setAttribute('data-tried-fallback', 'true');
              this.src = 'images/${primarySlug}.jpg';
            } else {
              this.style.display='none';
              this.parentElement.style.background='linear-gradient(135deg, rgba(16,185,129,0.1), rgba(11,28,45,0.2))';
              this.parentElement.innerHTML='<div style=\\'text-align:center;padding:10px;color:rgba(255,255,255,0.7);font-size:0.6rem;\\'>${product.category}</div>';
            }
          "
        />
      </div>
      <div class="horizontal-product-card__content">
        <div class="horizontal-product-card__name">${product.name}</div>
        <div class="horizontal-product-card__category">${product.category}</div>
      </div>
    </a>
  `;
}

function renderProductRail(products) {
  const rail = document.getElementById('product-rail-track');
  if (!rail || !products.length) return;

  const items = products.map(createProductRailItemHTML).join('');
  rail.innerHTML = `<div class="hero-product-ticker__set">${items}</div><div class="hero-product-ticker__set" aria-hidden="true">${items}</div>`;
}

function renderHorizontalProductTrack(products) {
  const track = document.getElementById('horizontal-product-track');
  if (!track || !products.length) return;

  // Create product cards and duplicate them for seamless infinite scroll
  const productCards = products.map(createHorizontalProductCardHTML).join('');
  // Duplicate the set 3 times to ensure smooth infinite scrolling
  track.innerHTML = productCards + productCards + productCards;
}

// Render dynamic category filter buttons based on products data
function renderCategoryButtons() {
  const container = document.getElementById('category-filter-buttons');
  if (!container || !allProducts.length) return;

  // Extract unique categories in order of appearance
  const uniqueCategories = ['All'];
  allProducts.forEach(p => {
    if (p.category && !uniqueCategories.includes(p.category)) {
      uniqueCategories.push(p.category);
    }
  });

  // Build HTML for each category button with item counts
  const buttonsHTML = uniqueCategories.map(cat => {
    const count = cat === 'All' 
      ? allProducts.length 
      : allProducts.filter(p => p.category === cat).length;

    const isActive = cat === activeCategory;
    const activeClasses = 'bg-signal text-white shadow-glow border-signal';
    const inactiveClasses = 'bg-navyLight text-white/70 hover:bg-white/10 hover:text-white border-white/10';

    return `
      <button 
        data-category="${cat}" 
        class="category-btn px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 ${isActive ? activeClasses : inactiveClasses}">
        <span>${cat}</span>
        <span class="px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'}">${count}</span>
      </button>
    `;
  }).join('');

  container.innerHTML = buttonsHTML;
}

// Render Brand Filter Buttons Active State
function updateBrandButtonsUI() {
  const buttons = document.querySelectorAll('.brand-btn');
  buttons.forEach(btn => {
    const brand = btn.getAttribute('data-brand');
    if (brand === activeBrand) {
      btn.className = 'brand-btn px-2.5 py-1 text-xs font-bold transition-all bg-signal text-white shadow-glow';
    } else {
      btn.className = 'brand-btn px-2.5 py-1 text-xs font-bold transition-all text-white/70 hover:text-white hover:bg-white/10';
    }
  });
}

// Update URL parameters without reloading
function syncURLParams() {
  const url = new URL(window.location);
  
  if (activeCategory !== 'All') url.searchParams.set('category', activeCategory);
  else url.searchParams.delete('category');

  if (activeBrand !== 'All') url.searchParams.set('brand', activeBrand);
  else url.searchParams.delete('brand');

  if (activePriceRange !== 'all') url.searchParams.set('price', activePriceRange);
  else url.searchParams.delete('price');

  if (activeSort !== 'default') url.searchParams.set('sort', activeSort);
  else url.searchParams.delete('sort');

  if (searchTerm.trim() !== '') url.searchParams.set('search', searchTerm.trim());
  else url.searchParams.delete('search');

  window.history.pushState({}, '', url);
}

// Filter and Sort Products
function filterAndSortProducts() {
  const term = searchTerm.trim().toLowerCase();

  let filtered = allProducts.filter(p => {
    // Category Filter
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;

    // Brand Filter (check name, description, specs, category)
    let matchesBrand = true;
    if (activeBrand !== 'All') {
      const pStr = (p.name + ' ' + (p.shortDescription || '') + ' ' + (p.description || '') + ' ' + JSON.stringify(p.specs || '')).toLowerCase();
      matchesBrand = pStr.includes(activeBrand.toLowerCase());
    }

    // Price Range Filter
    let matchesPrice = true;
    if (activePriceRange !== 'all') {
      const [minStr, maxStr] = activePriceRange.split('-');
      const minPrice = parseFloat(minStr) || 0;
      const maxPrice = parseFloat(maxStr) || Infinity;
      matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    }

    // Search Keyword Filter
    const matchesSearch = !term ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.shortDescription && p.shortDescription.toLowerCase().includes(term));

    return matchesCategory && matchesBrand && matchesPrice && matchesSearch;
  });

  // Sort Filtered Results
  if (activeSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (activeSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (activeSort === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (activeSort === 'name-desc') {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  return filtered;
}

// Main Render Function
function renderProducts() {
  const container = document.getElementById('products-grid');
  const countElement = document.getElementById('item-count');
  const activeTitleElement = document.getElementById('active-category-title');
  const summaryTextElement = document.getElementById('filter-summary-text');
  const emptyState = document.getElementById('empty-state');
  const resetBtn = document.getElementById('reset-filters-btn');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  if (!container) return;

  const filtered = filterAndSortProducts();

  // Update Section Title & Subtitle Summary
  if (activeTitleElement) {
    activeTitleElement.textContent = activeCategory === 'All' ? 'All Hardware & Spare Parts' : activeCategory;
  }

  if (summaryTextElement) {
    const summaryParts = [];
    if (activeBrand !== 'All') summaryParts.push(`Brand: ${activeBrand}`);
    if (activePriceRange !== 'all') summaryParts.push(`Price Range Filter`);
    if (searchTerm.trim()) summaryParts.push(`Search: "${searchTerm.trim()}"`);
    
    summaryTextElement.textContent = summaryParts.length > 0 
      ? `Filtered by (${summaryParts.join(' • ')})` 
      : 'Showing genuine imported and local CNC hardware components';
  }

  // Update Item Count Badge
  if (countElement) {
    countElement.textContent = `${filtered.length} ${filtered.length === 1 ? 'Item' : 'Items'} Found`;
  }

  // Show/Hide Reset Filters Button
  const isAnyFilterActive = activeCategory !== 'All' || activeBrand !== 'All' || activePriceRange !== 'all' || activeSort !== 'default' || searchTerm.trim() !== '';
  if (resetBtn) {
    if (isAnyFilterActive) resetBtn.classList.remove('hidden');
    else resetBtn.classList.add('hidden');
  }

  // Show/Hide Clear Search Button
  if (clearSearchBtn) {
    if (searchTerm.trim()) clearSearchBtn.classList.remove('hidden');
    else clearSearchBtn.classList.add('hidden');
  }

  // Render Grid or Empty State
  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
  } else {
    if (emptyState) emptyState.classList.add('hidden');
    container.innerHTML = filtered.map(createProductCardHTML).join('');
  }
}

// Reset All Filters to Defaults
function resetAllFilters() {
  activeCategory = 'All';
  activeBrand = 'All';
  activePriceRange = 'all';
  activeSort = 'default';
  searchTerm = '';

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const priceSelect = document.getElementById('price-range-select');
  if (priceSelect) priceSelect.value = 'all';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'default';

  renderCategoryButtons();
  updateBrandButtonsUI();
  syncURLParams();
  renderProducts();
}

// Initialize Page
document.addEventListener('DOMContentLoaded', async () => {
  // Read URL parameters if present
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('category')) activeCategory = urlParams.get('category');
  if (urlParams.has('brand')) activeBrand = urlParams.get('brand');
  if (urlParams.has('price')) activePriceRange = urlParams.get('price');
  if (urlParams.has('sort')) activeSort = urlParams.get('sort');
  if (urlParams.has('search')) searchTerm = urlParams.get('search');

  // Sync Input Controls with URL params
  const searchInput = document.getElementById('search-input');
  if (searchInput && searchTerm) searchInput.value = searchTerm;

  const priceSelect = document.getElementById('price-range-select');
  if (priceSelect && activePriceRange) priceSelect.value = activePriceRange;

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect && activeSort) sortSelect.value = activeSort;

  // Load products data (supports local file:// protocol and http server)
  if (window.PRODUCTS_DATA && Array.isArray(window.PRODUCTS_DATA) && window.PRODUCTS_DATA.length > 0) {
    allProducts = window.PRODUCTS_DATA;
  } else {
    try {
      const response = await fetch('./data/products.json');
      if (response.ok) {
        allProducts = await response.json();
      }
    } catch (err) {
      console.warn('Error fetching products via JSON:', err);
    }
  }

  // Render Controls & Products
  renderCategoryButtons();
  updateBrandButtonsUI();
  renderProductRail(allProducts);
  renderHorizontalProductTrack(allProducts);
  renderProducts();

  // Attach Category Filter Listener
  const categoryContainer = document.getElementById('category-filter-buttons');
  if (categoryContainer) {
    categoryContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;
      activeCategory = btn.getAttribute('data-category');
      renderCategoryButtons();
      syncURLParams();
      renderProducts();
    });
  }

  // Attach Brand Filter Listener
  const brandContainer = document.getElementById('brand-filter-buttons');
  if (brandContainer) {
    brandContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.brand-btn');
      if (!btn) return;
      activeBrand = btn.getAttribute('data-brand');
      updateBrandButtonsUI();
      syncURLParams();
      renderProducts();
    });
  }

  // Attach Price Range Listener
  if (priceSelect) {
    priceSelect.addEventListener('change', (e) => {
      activePriceRange = e.target.value;
      syncURLParams();
      renderProducts();
    });
  }

  // Attach Sort Listener
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      syncURLParams();
      renderProducts();
    });
  }

  // Attach Search Input Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      syncURLParams();
      renderProducts();
    });
  }

  // Clear Search Button Listener
  const clearSearchBtn = document.getElementById('clear-search-btn');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchTerm = '';
      if (searchInput) searchInput.value = '';
      syncURLParams();
      renderProducts();
    });
  }

  // Reset Filters Buttons Listener
  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);

  const emptyResetBtn = document.getElementById('empty-reset-btn');
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAllFilters);
});
