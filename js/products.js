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
    <div class="group border border-line bg-white flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-signal border-b-4 hover:border-b-signal relative">
      <div class="relative overflow-hidden bg-white">
        <a href="product-details.html?id=${encodeURIComponent(product.id)}" class="block aspect-square w-full bg-white relative flex items-center justify-center overflow-hidden border-b border-line watermarked-image">
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
        </a>
        <span class="absolute top-2 left-2 bg-navy text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 z-20 shadow-sm pointer-events-none">
          ${product.category}
        </span>
        <!-- Quick View button revealed on card hover -->
        <button 
          type="button"
          class="gch-quick-view-btn" 
          onclick="openQuickView('${encodeURIComponent(product.id)}', event)"
          aria-label="Quick view of ${product.name}"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          Quick View
        </button>
      </div>
      <a href="product-details.html?id=${encodeURIComponent(product.id)}" class="p-5 flex-1 flex flex-col justify-between">
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
      </a>
    </div>
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
  
  console.log('=== FILTERING START ===');
  console.log('Filter parameters:', {
    term,
    activeCategory,
    activeBrand,
    activePriceRange,
    activeSort,
    totalProducts: allProducts.length
  });

  let filtered = allProducts.filter(p => {
    // Category Filter - case insensitive comparison
    const matchesCategory = activeCategory === 'All' || 
                           (p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
    if (!matchesCategory) {
      console.log(`❌ ${p.name} - Category filter: "${p.category}" != "${activeCategory}"`);
    }

    // Brand Filter - simplified to check brand field directly
    let matchesBrand = true;
    if (activeBrand !== 'All') {
      matchesBrand = (p.brand && p.brand.toLowerCase() === activeBrand.toLowerCase()) ||
                    (p.name && p.name.toLowerCase().includes(activeBrand.toLowerCase()));
      if (!matchesBrand) {
        console.log(`❌ ${p.name} - Brand filter: brand="${p.brand}" doesn't match "${activeBrand}"`);
      }
    }

    // Price Range Filter
    let matchesPrice = true;
    if (activePriceRange !== 'all') {
      const [minStr, maxStr] = activePriceRange.split('-');
      const minPrice = parseFloat(minStr) || 0;
      const maxPrice = parseFloat(maxStr) || Infinity;
      matchesPrice = p.price >= minPrice && p.price <= maxPrice;
      if (!matchesPrice) {
        console.log(`❌ ${p.name} - Price filter: ${p.price} not in range ${activePriceRange}`);
      }
    }

    // Search Keyword Filter
    const matchesSearch = !term ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.shortDescription && p.shortDescription.toLowerCase().includes(term));
    
    if (!matchesSearch && term) {
      console.log(`❌ ${p.name} - Search filter: doesn't match "${term}"`);
    }

    const result = matchesCategory && matchesBrand && matchesPrice && matchesSearch;
    if (result) {
      console.log(`✅ ${p.name} - PASSED ALL FILTERS`);
    }
    
    return result;
  });

  console.log('=== FILTERING COMPLETE ===');
  console.log(`Products filtered: ${allProducts.length} → ${filtered.length}`);
  
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
  
  console.log('=== RENDER PRODUCTS START ===');
  console.log('Rendering products. Total products:', allProducts.length);
  console.log('Current filters:', { activeCategory, activeBrand, activePriceRange, activeSort, searchTerm });

  let filtered = filterAndSortProducts();
  console.log('Filtered products:', filtered.length);
  
  // EMERGENCY FALLBACK: If no products show, reset brand filter to "All"
  if (filtered.length === 0 && activeBrand !== 'All') {
    console.warn('⚠️ No products found with current brand filter. Resetting to "All"');
    activeBrand = 'All';
    updateBrandButtonsUI();
    filtered = filterAndSortProducts();
    console.log('After brand reset, products:', filtered.length);
  }

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
    console.log('❌ SHOWING EMPTY STATE - No products to display');
  } else {
    if (emptyState) emptyState.classList.add('hidden');
    container.innerHTML = filtered.map(createProductCardHTML).join('');
    console.log(`✅ RENDERED ${filtered.length} PRODUCTS SUCCESSFULLY`);
  }
  
  console.log('=== RENDER PRODUCTS COMPLETE ===');
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

  const navSearchInput = document.getElementById('nav-search-input');
  if (navSearchInput) navSearchInput.value = '';
  
  const navClearSearch = document.getElementById('nav-clear-search');
  if (navClearSearch) navClearSearch.classList.add('hidden');

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
  // Force reset all filters to default to ensure products display
  activeCategory = 'All';
  activeBrand = 'All';
  activePriceRange = 'all';
  activeSort = 'default';
  searchTerm = '';
  
  console.log('=== PAGE LOAD - FILTERS RESET ===');
  console.log('Default filter state:', {
    category: activeCategory,
    brand: activeBrand,
    price: activePriceRange,
    sort: activeSort,
    search: searchTerm
  });
  
  // DO NOT read URL parameters - always start with clean state
  // This ensures products always display on page load

  // Sync Input Controls with clean state
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  
  const navSearchInput = document.getElementById('nav-search-input');
  if (navSearchInput) navSearchInput.value = '';
  
  const navClearSearch = document.getElementById('nav-clear-search');
  if (navClearSearch) navClearSearch.classList.add('hidden');

  const priceSelect = document.getElementById('price-range-select');
  if (priceSelect) priceSelect.value = 'all';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'default';

  // Load products data (supports local file:// protocol and http server)
  if (window.PRODUCTS_DATA && Array.isArray(window.PRODUCTS_DATA) && window.PRODUCTS_DATA.length > 0) {
    allProducts = window.PRODUCTS_DATA;
    console.log('Loaded products from PRODUCTS_DATA:', allProducts.length);
  } else {
    try {
      const response = await fetch('./data/products.json');
      if (response.ok) {
        allProducts = await response.json();
        console.log('Loaded products from JSON:', allProducts.length);
      }
    } catch (err) {
      console.warn('Error fetching products via JSON:', err);
    }
  }
  
  // Fallback if no products loaded
  if (!allProducts || allProducts.length === 0) {
    console.error('No products data available!');
    // Try to load from PRODUCTS_DATA again
    if (window.PRODUCTS_DATA) {
      allProducts = window.PRODUCTS_DATA;
      console.log('Fallback loaded products from PRODUCTS_DATA:', allProducts.length);
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
      const newBrand = btn.getAttribute('data-brand');
      console.log('Brand filter clicked:', newBrand);
      activeBrand = newBrand;
      console.log('Active brand set to:', activeBrand);
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
      
      // Sync with navigation search input
      if (navSearchInput) {
        navSearchInput.value = searchTerm;
      }
      if (navClearSearch) {
        if (searchTerm.length > 0) {
          navClearSearch.classList.remove('hidden');
        } else {
          navClearSearch.classList.add('hidden');
        }
      }
    });
  }
  
  // Attach Navigation Search Input Listener
  if (navSearchInput) {
    navSearchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      syncURLParams();
      renderProducts();
      
      // Sync with main search input
      if (searchInput) {
        searchInput.value = searchTerm;
        const mainClearBtn = document.getElementById('clear-search-btn');
        if (mainClearBtn) {
          if (searchTerm.length > 0) {
            mainClearBtn.classList.remove('hidden');
          } else {
            mainClearBtn.classList.add('hidden');
          }
        }
      }
      
      // Show/hide nav clear button
      if (navClearSearch) {
        if (searchTerm.length > 0) {
          navClearSearch.classList.remove('hidden');
        } else {
          navClearSearch.classList.add('hidden');
        }
      }
    });
  }
  
  // Attach Navigation Search Clear Button
  if (navClearSearch) {
    navClearSearch.addEventListener('click', () => {
      if (navSearchInput) {
        navSearchInput.value = '';
      }
      navClearSearch.classList.add('hidden');
      searchTerm = '';
      if (searchInput) {
        searchInput.value = '';
        const mainClearBtn = document.getElementById('clear-search-btn');
        if (mainClearBtn) {
          mainClearBtn.classList.add('hidden');
        }
      }
      
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

// ─── Quick View Modal Functionality ──────────────────────────────────────────

function openQuickView(productId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const decodedId = decodeURIComponent(productId);
  const product = allProducts.find(p => p.id === decodedId);
  if (!product) return;

  const overlay = document.getElementById('quick-view-overlay');
  const panel = document.getElementById('quick-view-panel');
  const contentEl = document.getElementById('quick-view-content');
  const footerEl = document.getElementById('quick-view-footer');

  if (!panel || !contentEl) return;

  const nameSlug = getProductSlug(product.name);
  const primarySlug = getImageSlug(product);
  const formattedPrice = typeof product.price === 'number' ? product.price.toFixed(2) : product.price;

  // Key specs preview (up to 4 items)
  let specsHTML = '';
  if (product.specs && typeof product.specs === 'object') {
    const entries = Object.entries(product.specs).slice(0, 4);
    if (entries.length > 0) {
      specsHTML = `
        <div class="mt-4 pt-3 border-t border-line">
          <div class="text-[10px] font-bold uppercase tracking-wider text-steel mb-2">Key Specifications</div>
          <div class="space-y-1.5">
            ${entries.map(([k, v]) => `
              <div class="flex justify-between text-xs py-1 border-b border-line/50">
                <span class="text-steel">${k}</span>
                <span class="font-semibold text-navy text-right font-mono">${v}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  contentEl.innerHTML = `
    <div class="gch-qv-image-wrap">
      <span class="gch-qv-cat-badge">${product.category}</span>
      <img
        src="images/${nameSlug}.jpg"
        alt="${product.name}"
        onerror="
          if (this.getAttribute('data-tried') !== 'true') {
            this.setAttribute('data-tried', 'true');
            this.src = 'images/${primarySlug}.jpg';
          } else {
            this.src = 'images/drive-cooling-fan.jpg';
          }
        "
      />
    </div>
    <div class="gch-qv-content">
      <div class="gch-qv-meta-row">
        <span class="gch-qv-sku">${product.sku || 'N/A'}</span>
        <span class="text-[11px] font-semibold text-signalDark bg-signal/10 px-2 py-0.5">Ready to Ship</span>
      </div>
      <h3 class="gch-qv-name mt-2">${product.name}</h3>
      <div class="flex items-baseline gap-2 my-2">
        <span class="gch-qv-price">₹${formattedPrice}</span>
        <span class="text-[11px] text-steel">Starting price</span>
      </div>
      <p class="gch-qv-desc">${product.shortDescription || product.description || ''}</p>
      ${specsHTML}
    </div>
  `;

  if (footerEl) {
    footerEl.innerHTML = `
      <a href="product-details.html?id=${encodeURIComponent(product.id)}" class="gch-qv-cta-primary">
        <span>View Full Details</span>
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
        </svg>
      </a>
      <a href="tel:+919865292092" class="gch-qv-cta-secondary">
        <svg class="w-3.5 h-3.5 text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
        <span>Call</span>
      </a>
    `;
  }

  if (overlay) overlay.classList.add('gch-quick-view-overlay--open');
  panel.classList.add('gch-quick-view-panel--open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const overlay = document.getElementById('quick-view-overlay');
  const panel = document.getElementById('quick-view-panel');

  if (overlay) overlay.classList.remove('gch-quick-view-overlay--open');
  if (panel) {
    panel.classList.remove('gch-quick-view-panel--open');
    panel.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
}

// Close Quick View on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeQuickView();
  }
});
