// Global CNC Hardware - Products Catalog Page JavaScript

let allProducts = [];
let activeCategory = 'All';
let searchTerm = '';

// Helper to convert product name to image filename slug
function getProductSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Generate product card HTML snippet
function createProductCardHTML(product) {
  const slug = getProductSlug(product.name);
  return `
    <a href="product-details.html?id=${encodeURIComponent(product.id)}" class="group border border-line bg-white flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-signal border-b-4 hover:border-b-signal">
      <div class="relative overflow-hidden">
        <div class="aspect-square w-full bg-paper relative flex items-center justify-center overflow-hidden border-b border-line">
          <img 
            src="images/${slug}.jpg" 
            alt="${product.name}" 
            class="aspect-square w-full object-cover border-b border-line" 
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <div class="aspect-square w-full bg-paper hidden items-center justify-center border-b border-line absolute inset-0">
            <div class="text-center p-4">
              <div class="w-12 h-12 mx-auto mb-2 bg-signal/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" class="w-6 h-6 text-signal fill-none stroke-current stroke-2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <span class="text-xs text-steel">${product.category}</span>
            </div>
          </div>
        </div>
        <span class="absolute top-2 left-2 bg-navy text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 z-10">
          ${product.category}
        </span>
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="font-display font-bold text-navy text-base leading-tight mb-2 group-hover:text-signal transition-colors">
            ${product.name}
          </h3>
          <p class="text-xs text-steel leading-relaxed mb-4 line-clamp-2">${product.shortDescription}</p>
        </div>
        <div class="pt-3 border-t border-line flex items-center justify-between">
          <span class="font-display font-extrabold text-signal text-lg">₹${product.price.toFixed(2)}</span>
          <span class="bg-paper px-2 py-0.5 text-steel font-mono text-[11px] font-semibold">${product.sku}</span>
        </div>
      </div>
    </a>
  `;
}

// Render filtered products list
function renderProducts() {
  const container = document.getElementById('products-grid');
  const countElement = document.getElementById('item-count');
  const activeTitleElement = document.getElementById('active-category-title');
  const emptyState = document.getElementById('empty-state');

  if (!container) return;

  const filtered = allProducts.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term ||
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.shortDescription.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  if (activeTitleElement) {
    activeTitleElement.textContent = activeCategory === 'All' ? 'All Hardware & Spare Parts' : activeCategory;
  }

  if (countElement) {
    countElement.textContent = `${filtered.length} ${filtered.length === 1 ? 'Item' : 'Items'} Found`;
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
  } else {
    if (emptyState) emptyState.classList.add('hidden');
    container.innerHTML = filtered.map(createProductCardHTML).join('');
  }
}

// Update Active Button Styling
function updateFilterButtonsUI() {
  const buttons = document.querySelectorAll('.category-btn');
  buttons.forEach(btn => {
    const cat = btn.getAttribute('data-category');
    if (cat === activeCategory) {
      btn.className = 'category-btn px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all bg-signal text-white shadow-glow';
    } else {
      btn.className = 'category-btn px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all bg-navyLight text-white/70 hover:bg-white/10 hover:text-white border border-white/10';
    }
  });
}

// Initialize Page
document.addEventListener('DOMContentLoaded', async () => {
  // Read category from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    activeCategory = categoryParam;
  }

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

  updateFilterButtonsUI();
  renderProducts();

  // Attach Filter Button Listeners
  const filterContainer = document.getElementById('category-filter-buttons');
  if (filterContainer) {
    filterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;
      activeCategory = btn.getAttribute('data-category');

      // Update URL without reload
      const newUrl = new URL(window.location);
      if (activeCategory === 'All') {
        newUrl.searchParams.delete('category');
      } else {
        newUrl.searchParams.set('category', activeCategory);
      }
      window.history.pushState({}, '', newUrl);

      updateFilterButtonsUI();
      renderProducts();
    });
  }

  // Attach Search Input Listener
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      renderProducts();
    });
  }
});
