// Global CNC Hardware - Product Details Page JavaScript

function getProductSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Use the slug from the product's own "images" field when it exists;
// only fall back to a name-derived slug for products missing that field.
function getImageSlug(product) {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return getProductSlug(product.name);
}

function getProductAvailability(product) {
  const specs = product.specs || {};
  const specEntries = Object.entries(specs);
  const sizeSpec = specEntries.find(([label]) => /size|diameter|dimension|thread|bore|capacity/i.test(label));
  const lifeSpec = specEntries.find(([label]) => /life|duration|shelf|service/i.test(label));

  const sizes = product.availableSizes || product.sizes || (sizeSpec ? sizeSpec[1] : null);
  const usableLimit = product.usableLimit || product.usableLife || (lifeSpec ? lifeSpec[1] : null);

  return {
    usableLimit: usableLimit || 'Not specified',
    expiryDate: product.expiryDate || 'Not applicable for this product',
    availableSizes: Array.isArray(sizes) ? sizes.join(', ') : (sizes || 'Standard size')
  };
}

function renderAvailability(product) {
  const container = document.getElementById('detail-availability');
  if (!container) return;

  const availability = getProductAvailability(product);
  const rows = [
    // ['Usable limit', availability.usableLimit],
    // ['Expiry date', availability.expiryDate],
    ['Available sizes', availability.availableSizes]
  ];

  container.innerHTML = rows.map(([label, value]) => `
    <div class="spec-row">
      <dt>${label}</dt>
      <dd>${value}</dd>
    </div>
  `).join('');
}

function createRelatedCardHTML(product) {
  const nameSlug = getProductSlug(product.name);
  const primarySlug = getImageSlug(product);
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

// Modal Functions
function openInquiryModal() {
  const modal = document.getElementById('inquiry-modal');
  const productName = document.getElementById('detail-name').textContent;
  const productSku = document.getElementById('detail-sku').textContent;
  const productCategory = document.getElementById('detail-category').textContent;
  
  // Set product info in modal
  document.getElementById('modal-product-name').textContent = productName;
  document.getElementById('form-product-name').value = productName;
  document.getElementById('form-product-sku').value = productSku;
  document.getElementById('form-product-category').value = productCategory;
  
  // Reset form and show form (hide success message)
  document.getElementById('inquiry-form').reset();
  document.getElementById('inquiry-form').classList.remove('hidden');
  document.getElementById('success-message').classList.add('hidden');
  
  // Show modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeInquiryModal() {
  const modal = document.getElementById('inquiry-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function submitInquiry(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  // Create email body
  const emailBody = `
NEW PRODUCT INQUIRY
====================

Product Information:
- Product: ${formData.get('product_name')}
- SKU: ${formData.get('product_sku')}
- Category: ${formData.get('product_category')}

Customer Information:
- Name: ${formData.get('name')}
- Phone: ${formData.get('phone')}
- Email: ${formData.get('email')}
- Company: ${formData.get('company') || 'Not provided'}

Inquiry Details:
${formData.get('inquiry')}
  `;
  
  // Create mailto link
  const subject = encodeURIComponent(`Product Inquiry: ${formData.get('product_name')}`);
  const body = encodeURIComponent(emailBody);
  const mailtoLink = `mailto:globalcnchardware@gmail.com?subject=${subject}&body=${body}`;
  
  // Open email client
  window.location.href = mailtoLink;
  
  // Show success message
  document.getElementById('inquiry-form').classList.add('hidden');
  document.getElementById('success-message').classList.remove('hidden');
  
  // Reset form after delay
  setTimeout(() => {
    form.reset();
  }, 1000);
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeInquiryModal();
  }
});

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
  const nameSlug = getProductSlug(product.name);
  const primarySlug = getImageSlug(product);
  const imgEl = document.getElementById('product-image');
  const fallbackEl = document.getElementById('product-image-fallback');
  if (imgEl) {
    imgEl.style.display = 'block';
    if (fallbackEl) {
      fallbackEl.style.display = 'none';
    }
    imgEl.onerror = function() {
      if (this.getAttribute('data-tried-fallback') !== 'true') {
        this.setAttribute('data-tried-fallback', 'true');
        this.src = `images/${primarySlug}.jpg`;
      } else {
        this.style.display = 'none';
        if (fallbackEl) {
          fallbackEl.style.display = 'flex';
        }
      }
    };
    imgEl.src = `images/${nameSlug}.jpg`;
    imgEl.alt = product.name;
  }

  const categoryEl = document.getElementById('detail-category');
  const nameEl = document.getElementById('detail-name');
  const taglineEl = document.getElementById('detail-tagline');
  const descEl = document.getElementById('detail-description');
  const priceEl = document.getElementById('detail-price');
  const skuEl = document.getElementById('detail-sku');

  if (categoryEl) categoryEl.textContent = product.category;
  if (nameEl) nameEl.textContent = product.name;
  if (taglineEl) {
    if (product.tagline) {
      taglineEl.textContent = product.tagline;
      taglineEl.classList.remove('hidden');
    } else {
      taglineEl.classList.add('hidden');
    }
  }
  if (descEl) descEl.textContent = product.description;
  if (priceEl) priceEl.textContent = `₹${product.price.toFixed(2)}`;
  if (skuEl) skuEl.textContent = product.sku;

  renderAvailability(product);

  // Key Features Section (now on left side)
  const featuresContainer = document.getElementById('detail-features');
  if (featuresContainer && product.features && Array.isArray(product.features)) {
    featuresContainer.innerHTML = product.features.map((feature, i) => `
      <li class="animate-slide-up" style="animation-delay: ${i * 0.05}s;">
        <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span>${feature}</span>
      </li>
    `).join('');
  } else if (featuresContainer) {
    featuresContainer.innerHTML = '<li class="text-steel">No features specified</li>';
  }

  // Specifications Table (now on right side)
  const specsContainer = document.getElementById('detail-specs');
  if (specsContainer && product.specs) {
    const specEntries = Object.entries(product.specs);
    specsContainer.innerHTML = specEntries.map(([label, value], i) => `
      <div class="spec-row animate-slide-up" style="animation-delay: ${i * 0.03}s;">
        <dt>${label}</dt>
        <dd>${value}</dd>
      </div>
    `).join('');
  }

  // Applications Section (now on right side)
  const applicationsContainer = document.getElementById('detail-applications');
  if (applicationsContainer && product.applications && Array.isArray(product.applications)) {
    applicationsContainer.innerHTML = product.applications.map((application, i) => `
      <li class="animate-slide-up" style="animation-delay: ${i * 0.05}s;">
        <svg class="application-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        <span>${application}</span>
      </li>
    `).join('');
  } else if (applicationsContainer) {
    applicationsContainer.innerHTML = '<li class="text-steel">No applications specified</li>';
  }

  // Technical Details Section (now on left side)
  const technicalDetailsSection = document.getElementById('technical-details-section');
  const technicalDetailsContainer = document.getElementById('detail-technical-details');
  if (technicalDetailsContainer && product.technicalDetails) {
    const techEntries = Object.entries(product.technicalDetails);
    if (techEntries.length > 0) {
      technicalDetailsSection.classList.remove('hidden');
      technicalDetailsContainer.innerHTML = techEntries.map(([label, value], i) => `
        <div class="spec-row animate-slide-up" style="animation-delay: ${i * 0.03}s;">
          <dt>${label}</dt>
          <dd>${value}</dd>
        </div>
      `).join('');
    } else {
      technicalDetailsSection.classList.add('hidden');
    }
  } else if (technicalDetailsSection) {
    technicalDetailsSection.classList.add('hidden');
  }

  // Image Gallery
  const galleryContainer = document.getElementById('product-gallery');
  if (galleryContainer && product.gallery && Array.isArray(product.gallery) && product.gallery.length > 1) {
    galleryContainer.classList.remove('hidden');
    const primarySlug = getImageSlug(product);
    galleryContainer.innerHTML = product.gallery.map((img, index) => `
      <div class="product-gallery-item" 
           onclick="document.getElementById('product-image').src = 'images/${img}.jpg'">
        <img src="images/${img}.jpg" alt="${product.name} - View ${index + 1}" 
             class="w-full h-full object-contain p-2"
             onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'text-xs text-steel text-center p-2\\'>Image ${index + 1}</span>'" />
      </div>
    `).join('');
  } else if (galleryContainer) {
    galleryContainer.classList.add('hidden');
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