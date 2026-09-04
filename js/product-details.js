// Global CNC Hardware - Product Details Page JavaScript

function getProductSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function createRelatedCardHTML(product) {
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

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const notFoundEl = document.getElementById('product-not-found');
  const detailsEl = document.getElementById('product-details-container');

  if (!productId) {
    if (notFoundEl) notFoundEl.classList.remove('hidden');
    if (detailsEl) detailsEl.classList.add('hidden');
    return;
  }

  let products = [];
  if (window.PRODUCTS_DATA && Array.isArray(window.PRODUCTS_DATA) && window.PRODUCTS_DATA.length > 0) {
    products = window.PRODUCTS_DATA;
  } else {
    try {
      const res = await fetch('./data/products.json');
      if (res.ok) {
        products = await res.json();
      }
    } catch (err) {
      console.warn('Error fetching product details via JSON:', err);
    }
  }

  const product = products.find(p => p.id === productId);

  if (!product) {
    if (notFoundEl) notFoundEl.classList.remove('hidden');
    if (detailsEl) detailsEl.classList.add('hidden');
    return;
  }

  if (notFoundEl) notFoundEl.classList.add('hidden');
  if (detailsEl) detailsEl.classList.remove('hidden');

  // Populate Breadcrumb
  const breadcrumbCategory = document.getElementById('breadcrumb-category');
  const breadcrumbName = document.getElementById('breadcrumb-name');
  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = product.category;
    breadcrumbCategory.href = `products.html?category=${encodeURIComponent(product.category)}`;
  }
  if (breadcrumbName) breadcrumbName.textContent = product.name;

  // Populate Product Info
  const slug = getProductSlug(product.name);
  const imgEl = document.getElementById('product-image');
  if (imgEl) {
    imgEl.src = `images/${slug}.jpg`;
    imgEl.alt = product.name;
  }

  const categoryEl = document.getElementById('detail-category');
  const nameEl = document.getElementById('detail-name');
  const descEl = document.getElementById('detail-description');
  const priceEl = document.getElementById('detail-price');
  const skuEl = document.getElementById('detail-sku');

  if (categoryEl) categoryEl.textContent = product.category;
  if (nameEl) nameEl.textContent = product.name;
  if (descEl) descEl.textContent = product.description;
  if (priceEl) priceEl.textContent = `₹${product.price.toFixed(2)}`;
  if (skuEl) skuEl.textContent = product.sku;

  // Specifications Table
  const specsContainer = document.getElementById('detail-specs');
  if (specsContainer && product.specs) {
    const specEntries = Object.entries(product.specs);
    specsContainer.innerHTML = specEntries.map(([label, value], i) => `
      <div class="grid grid-cols-2 px-4 py-3 text-sm ${i !== 0 ? 'border-t border-line' : ''}">
        <dt class="text-steel">${label}</dt>
        <dd class="font-medium text-navy">${value}</dd>
      </div>
    `).join('');
  }

  // Related Products
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const relatedSection = document.getElementById('related-products-section');
  const relatedContainer = document.getElementById('related-products-grid');
  const relatedCategoryTitle = document.getElementById('related-category-title');

  if (related.length > 0 && relatedContainer && relatedSection) {
    relatedSection.classList.remove('hidden');
    if (relatedCategoryTitle) relatedCategoryTitle.textContent = product.category;
    relatedContainer.innerHTML = related.map(createRelatedCardHTML).join('');
  }
});
