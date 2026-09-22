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
        <div class="aspect-square w-full bg-white relative flex items-center justify-center overflow-hidden border-b border-line image-protected-container" style="max-height: 250px;">
          <img
            src="images/${nameSlug}.jpg"
            alt="${product.name}"
            class="aspect-square w-full h-full object-contain p-3 border-b border-line transition-transform duration-300 group-hover:scale-105 protected-image"
            style="max-height: 250px; object-fit: contain;"
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
    function _tryInitMainZoom() {
      imgEl.classList.remove('group-hover:scale-105');
      const container = document.getElementById('product-image-container') || imgEl.closest('.image-protected-container');
      if (container) {
        initImageZoom(imgEl, container);
      }
    }

    imgEl.onerror = function() {
      if (this.getAttribute('data-tried-fallback') !== 'true') {
        this.setAttribute('data-tried-fallback', 'true');
        this.src = `images/${primarySlug}.jpg`;
        if (this.complete && this.naturalWidth > 0) {
          _tryInitMainZoom();
        } else {
          this.addEventListener('load', _tryInitMainZoom, { once: true });
        }
      } else {
        this.style.display = 'none';
        if (fallbackEl) {
          fallbackEl.style.display = 'flex';
        }
      }
    };

    imgEl.src = `images/${nameSlug}.jpg`;
    imgEl.alt = product.name;

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      _tryInitMainZoom();
    } else {
      imgEl.addEventListener('load', _tryInitMainZoom, { once: true });
    }
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

  // Compatible Models Section
  const compatibleModelsContainer = document.getElementById('detail-compatible-models');
  if (compatibleModelsContainer) {
    if (product.id === 'cnc-014' && product.modelCatalog && Array.isArray(product.modelCatalog)) {
      compatibleModelsContainer.innerHTML = renderCategorizedFanModels(product);
    } else if (product.compatibleModels && Array.isArray(product.compatibleModels)) {
      compatibleModelsContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          ${product.compatibleModels.map((model, i) => `
            <div class="bg-paper rounded-lg p-3 border border-line hover:border-signal hover:bg-signal/5 transition-all duration-300 animate-slide-up cursor-pointer" style="animation-delay: ${i * 0.03}s;" onclick="openModelModal('${model.replace(/'/g, "\\'")}', '${product.name.replace(/'/g, "\\'")}', '${product.sku.replace(/'/g, "\\'")}')">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-signal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="text-sm font-medium text-navy">${model}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      compatibleModelsContainer.innerHTML = '<p class="text-steel text-sm">No compatible models specified</p>';
    }
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
      <div class="product-gallery-item ${index === 0 ? 'active-thumb ring-2 ring-signal' : ''} cursor-pointer transition-all hover:border-signal"
           onclick="switchMainProductImage('images/${img}.jpg', this)">
        <img src="images/${img}.jpg" alt="${product.name} - View ${index + 1}"
             class="w-full h-full object-contain p-2"
             style="max-height: 100px; object-fit: contain;"
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

// Model Modal Functions
let currentModel = '';
let currentProduct = '';
let currentProductSku = '';

function openModelModal(modelName, productName, productSku, catalogItemId) {
  currentModel = modelName;
  currentProduct = productName;
  currentProductSku = productSku;

  const modal = document.getElementById('model-modal');
  const modelNameEl = document.getElementById('modal-model-name');
  const productNameEl = document.getElementById('modal-product-name');
  const productSkuEl = document.getElementById('modal-product-sku');
  const modalHeaderTitle = document.getElementById('modal-header-title');

  // Ensure modal is properly reset
  modal.classList.remove('hidden');
  modal.style.display = '';
  modal.style.visibility = '';

  if (modelNameEl) modelNameEl.textContent = modelName;
  if (productNameEl) productNameEl.textContent = productName;
  if (productSkuEl) productSkuEl.textContent = 'SKU: ' + productSku;

  // Try to find catalog item for fan products (cnc-014)
  let catalogItem = null;
  const allProducts = window.PRODUCTS_DATA || [];
  const product = allProducts.find(p => p.sku === productSku || p.name === productName || p.id === 'cnc-014');
  if (product && product.modelCatalog) {
    if (catalogItemId !== undefined) {
      catalogItem = product.modelCatalog.find(m => m.id === catalogItemId);
    }
    if (!catalogItem && modelName) {
      catalogItem = product.modelCatalog.find(m => 
        m.model === modelName || 
        `${m.brand} ${m.model}` === modelName ||
        modelName.includes(m.model)
      );
    }
  }

  const imageContainer = document.getElementById('modal-image-container');

  if (catalogItem) {
    // === FAN PRODUCT MODAL ===
    if (modalHeaderTitle) modalHeaderTitle.textContent = 'Fan Model Details';

    // Update the model name in the header subtitle
    if (modelNameEl) modelNameEl.textContent = `${catalogItem.brand} ${catalogItem.model}`;

    // Replace image area with fan image panel
    if (imageContainer) {
      imageContainer.innerHTML = renderFanImagePanel(catalogItem);

      // Initialize zoom for the fan model image in the modal
      setTimeout(() => {
        const modalImg = document.getElementById('modal-model-image');
        const modalZoomContainer = document.getElementById('modal-fan-zoom-container');
        if (modalImg && modalZoomContainer && typeof window.ProductImageZoom === 'function') {
          if (modalProductZoomInstance) {
            modalProductZoomInstance.destroy();
          }
          modalProductZoomInstance = new window.ProductImageZoom({
            container: modalZoomContainer,
            image: modalImg,
            zoomLevel: 2.2
          });
        }
      }, 50);
    }

    // Render rich fan specification rows
    renderFanModalSpecs(catalogItem);

    // Populate "PRODUCT INFORMATION" section with high-level system & catalog info (no duplicate model specs)
    const sizeNum = getFanSizeWidth(catalogItem.size);
    const sizeSpecs = FAN_SIZE_SPECS[sizeNum] || {};
    const productInfoContainer = document.getElementById('modal-product-info-container');
    if (productInfoContainer) {
      productInfoContainer.innerHTML = `
        <div class="flex items-center gap-2 mb-3">
          <svg class="w-5 h-5 text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <span class="text-sm font-semibold text-steel uppercase tracking-wider">Product Information</span>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between items-center py-1.5 border-b border-line/60">
            <span class="text-steel text-xs">Product Line</span>
            <span class="text-navy font-semibold text-xs">Drive Cooling Fan</span>
          </div>
          <div class="flex justify-between items-center py-1.5 border-b border-line/60">
            <span class="text-steel text-xs">Series</span>
            <span class="text-navy font-semibold text-xs">${sizeSpecs.category || (sizeNum + 'mm Series')}</span>
          </div>
          <div class="flex justify-between items-center py-1.5 border-b border-line/60">
            <span class="text-steel text-xs">Target Drives</span>
            <span class="text-navy font-medium text-xs">Servo & Spindle Amplifiers</span>
          </div>
          <div class="flex justify-between items-center py-1.5 border-b border-line/60">
            <span class="text-steel text-xs">CNC Compatibility</span>
            <span class="text-navy text-xs font-medium">Fanuc / Siemens / Mitsubishi</span>
          </div>
          <div class="flex justify-between items-center py-1.5 border-b border-line/60">
            <span class="text-steel text-xs">Catalog SKU</span>
            <span class="text-steel font-mono text-xs">${productSku}</span>
          </div>
          <div class="flex justify-between items-center py-1.5">
            <span class="text-steel text-xs">Stock Status</span>
            <span class="inline-flex items-center gap-1.5 text-signalDark font-bold text-xs">
              <span class="w-2 h-2 bg-signal inline-block"></span> In Stock (Ready to Ship)
            </span>
          </div>
        </div>
      `;
    }

    // Concise, purposeful application description (no duplicate spec regurgitation)
    const descEl = document.getElementById('modal-model-description');
    if (descEl) {
      descEl.innerHTML = `
        High-efficiency thermal management fan engineered for CNC servo drive units, spindle amplifiers, and control cabinets. Designed for continuous industrial duty, low acoustic vibration, and reliable heat dissipation under heavy cutting cycles.
      `;
    }

    // Pre-fill enquiry message
    const msgEl = document.getElementById('model-enquiry-message');
    if (msgEl && !msgEl.value) {
      msgEl.placeholder = `I am interested in ${catalogItem.brand} ${catalogItem.model} (${catalogItem.size}mm). Please share pricing and availability.`;
    }

  } else {
    // === STANDARD PRODUCT MODAL ===
    if (modalHeaderTitle) modalHeaderTitle.textContent = 'Compatible Model Details';

    if (imageContainer) {
      imageContainer.innerHTML = `<img id="modal-model-image" src="images/model-placeholder.jpg" alt="Model Image" class="w-full h-full object-contain" style="max-height: 300px; object-fit: contain;">`;
      const newModelImageEl = document.getElementById('modal-model-image');
      if (newModelImageEl) {
        const modelSlug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        newModelImageEl.src = `images/models/${modelSlug}.jpg`;
        newModelImageEl.alt = modelName;
        newModelImageEl.onerror = function() {
          this.style.display = 'none';
          this.parentElement.innerHTML = `
            <div class="text-steel text-center p-8">
              <svg class="w-20 h-20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="text-sm font-medium">Model Image</p>
              <p class="text-xs mt-1 opacity-70">Placeholder - Replace with actual image</p>
            </div>
          `;
        };
      }
    }

    // Reset Product Information container for standard products
    const productInfoContainer = document.getElementById('modal-product-info-container');
    if (productInfoContainer) {
      productInfoContainer.innerHTML = `
        <div class="flex items-center gap-2 mb-3">
          <svg class="w-5 h-5 text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <span class="text-sm font-semibold text-steel uppercase tracking-wider">Product Information</span>
        </div>
        <p id="modal-product-name" class="text-navy font-semibold text-base mb-2">${productName}</p>
        <p id="modal-product-sku" class="text-steel text-sm">SKU: ${productSku}</p>
      `;
    }

    // Reset description to generic text
    const descEl = document.getElementById('modal-model-description');
    if (descEl) {
      descEl.innerHTML = 'This model is compatible with the selected product. Our team can provide detailed specifications, availability, and pricing information for this configuration.';
    }

    // Reset specs label
    const specsLabel = document.getElementById('modal-specs-label');
    if (specsLabel) specsLabel.textContent = 'Key Specifications';

    // Reset specs to standard 4-row layout then populate
    const specsContainer = document.getElementById('modal-model-specs');
    if (specsContainer) {
      specsContainer.innerHTML = `
        <div class="flex justify-between items-center py-2 border-b border-line">
          <span class="text-steel text-sm">Controller Type</span>
          <span id="modal-spec-controller" class="text-navy font-medium text-sm">-</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-line">
          <span class="text-steel text-sm">Series</span>
          <span id="modal-spec-series" class="text-navy font-medium text-sm">-</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-line">
          <span class="text-steel text-sm">Voltage</span>
          <span id="modal-spec-voltage" class="text-navy font-medium text-sm">-</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-steel text-sm">Application</span>
          <span id="modal-spec-application" class="text-navy font-medium text-sm">-</span>
        </div>
      `;
    }
    populateModelSpecs(modelName);
  }

  // Reset scroll position
  const scrollableBody = modal.querySelector('.overflow-y-auto');
  if (scrollableBody) {
    scrollableBody.scrollTop = 0;
  }

  document.body.style.overflow = 'hidden';
}

function getFanModelImage(item) {
  if (item && item.image) return item.image;
  const slug = (item && item.model ? item.model : '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `images/models/${slug}.jpg`;
}

// ─────────────────────────────────────────────
// PRODUCT IMAGE ZOOMER INTEGRATION
// Utilizes the modular ProductImageZoom engine
// ─────────────────────────────────────────────
let mainProductZoomInstance = null;
let modalProductZoomInstance = null;

/**
 * Switch main product image from thumbnail click
 * Updates both <img> src and zoom preview panel instantly
 */
window.switchMainProductImage = function(newSrc, clickedEl) {
  const imgEl = document.getElementById('product-image');
  if (imgEl) {
    imgEl.src = newSrc;
  }
  if (mainProductZoomInstance) {
    mainProductZoomInstance.updateSource(newSrc);
  }
  if (clickedEl) {
    document.querySelectorAll('.product-gallery-item').forEach(el => {
      el.classList.remove('active-thumb', 'ring-2', 'ring-signal');
    });
    clickedEl.classList.add('active-thumb', 'ring-2', 'ring-signal');
  }
};

function initImageZoom(imgEl, containerEl) {
  if (!imgEl || !containerEl) return;
  if (typeof window.ProductImageZoom !== 'function') return;

  if (mainProductZoomInstance) {
    mainProductZoomInstance.updateSource(imgEl.src);
    return;
  }

  mainProductZoomInstance = new window.ProductImageZoom({
    container: containerEl,
    image: imgEl,
    zoomLevel: 2.5
  });
}

function renderFanImagePanel(item) {
  const sizeNum = getFanSizeWidth(item.size);
  const sizeSpecs = FAN_SIZE_SPECS[sizeNum] || {};
  const badge = sizeSpecs.badge || '';

  // Create model slug for image naming
  const modelSlug = `${item.brand}-${item.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // 4 separate images for manual upload with Driver-Cooling-Fan subfolder
  const images = [
    { view: 'Front View', src: `images/models/Driver-Cooling-Fan/${modelSlug}-front.jpg`, label: 'FRONT VIEW' },
    { view: 'Back View', src: `images/models/Driver-Cooling-Fan/${modelSlug}-back.jpg`, label: 'BACK VIEW' },
    { view: 'Side View', src: `images/models/Driver-Cooling-Fan/${modelSlug}-side.jpg`, label: 'SIDE VIEW' },
    { view: 'Connector View', src: `images/models/Driver-Cooling-Fan/${modelSlug}-connector.jpg`, label: 'CONNECTOR VIEW' }
  ];

  // Create 2x2 grid for 4 images
  const imagesGrid = images.map((img, index) => `
    <div class="aspect-square bg-white border border-line flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-signal transition-all" onclick="openImageZoom('${img.src}', '${img.label}')">
      <img src="${img.src}" alt="${img.view}" class="w-full h-full object-contain p-2" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'text-steel text-center p-2\\'><span class=\\'text-xs font-medium\\'>${img.label}</span><br><span class=\\'text-[10px] text-steel/70\\'>Image not found</span></div>'">
      <div class="absolute bottom-0 left-0 right-0 bg-navy/80 text-white text-[10px] font-bold uppercase tracking-wider py-1 text-center z-10">${img.label}</div>
      <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
        <div class="bg-white/90 rounded-full p-3 shadow-lg">
          <svg class="w-6 h-6 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
        </div>
      </div>
    </div>
  `).join('');

  console.log('Generated images grid for:', modelSlug);

  return `
    <div class="fan-modal-image-panel flex flex-col w-full bg-white" style="min-height:340px;">

      <!-- Size badge + model label row -->
      <div class="flex items-center justify-between px-3 py-2 bg-paper border-b border-line">
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-navy bg-white px-2.5 py-1 border border-line shadow-sm">
          ${item.size} mm
        </span>
        ${badge ? `<span class="text-[11px] font-bold uppercase tracking-wider bg-signal/15 text-signalDark border border-signal/30 px-2.5 py-1">${badge}</span>` : ''}
      </div>

      <!-- Gallery section header -->
      <div class="flex items-center justify-between px-3 py-2 bg-paper border-b border-line">
        <div class="flex items-center gap-2">
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"/>
          </svg>
          <span class="text-xs font-bold uppercase tracking-wider text-navy">Product Views (4-Angle Gallery)</span>
        </div>
        <span class="text-[10px] text-steel">Click to view</span>
      </div>

      <!-- 4-View Photos Grid (2x2) -->
      <div class="w-full p-3 grid grid-cols-2 gap-2">
        ${imagesGrid}
      </div>

      <!-- Model label footer -->
      <div class="text-center border-t border-line bg-paper/40 py-2 px-3">
        <div class="text-[10px] font-bold uppercase tracking-widest text-steel">Cooling Fan Model</div>
        <div class="text-sm font-mono font-bold text-navy truncate">${item.brand} — ${item.model}</div>
      </div>
    </div>
  `;
}


function renderFanModalSpecs(item) {
  const specsContainer = document.getElementById('modal-model-specs');
  const specsLabel = document.getElementById('modal-specs-label');
  if (!specsContainer) return;
  if (specsLabel) specsLabel.textContent = 'Fan Specifications';

  const rows = [
    { label: 'Brand / Make',      value: item.brand,      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { label: 'Model Number',      value: item.model,      icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',              mono: true },
    { label: 'Dimensions',        value: item.size ? `${item.size} mm` : null, icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4' },
    { label: 'Electrical Rating', value: item.electrical, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Wire Count',        value: item.wires ? `${item.wires} Wire` : null, icon: 'M4 6h16M4 12h16M4 18h16' },
    { label: 'Connector Type',    value: item.connector,  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Fanuc Part No.',    value: item.fanucPart,  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', highlight: true },
  ].filter(r => r.value);

  specsContainer.innerHTML = rows.map((row, idx) => `
    <div class="fan-spec-row flex items-center gap-3 py-2.5 ${idx < rows.length - 1 ? 'border-b border-line/70' : ''}">
      <div class="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-signal/10 border border-signal/20">
        <svg class="w-3.5 h-3.5 text-signalDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${row.icon}"/>
        </svg>
      </div>
      <span class="text-steel text-xs w-28 flex-shrink-0">${row.label}</span>
      <span class="text-navy font-semibold text-sm ${row.mono ? 'font-mono' : ''} ${row.highlight ? 'text-signalDark font-bold font-mono bg-signal/10 px-1.5 py-0.5 border border-signal/20 text-xs' : ''} ml-auto text-right leading-snug">${row.value}</span>
    </div>
  `).join('');
}

function populateModelSpecs(modelName) {
  const controllerEl = document.getElementById('modal-spec-controller');
  const seriesEl = document.getElementById('modal-spec-series');
  const voltageEl = document.getElementById('modal-spec-voltage');
  const applicationEl = document.getElementById('modal-spec-application');
  if (!controllerEl) return;

  // Extract specifications from model name
  let controller = 'Standard';
  let series = 'General';
  let voltage = '220V / 380V';
  let application = 'CNC Machining';

  // Fanuc
  if (modelName.toLowerCase().includes('fanuc')) {
    controller = 'Fanuc CNC';
    if (modelName.includes('0i')) series = '0i Series';
    else if (modelName.includes('31i')) series = '31i Series';
    else if (modelName.includes('32i')) series = '32i Series';
    else if (modelName.includes('M/T')) series = 'M/T Series';
    else series = 'Standard Series';
    voltage = '200-240V AC';
    application = 'CNC Lathe & Milling';
  }
  // Siemens
  else if (modelName.toLowerCase().includes('siemens')) {
    controller = 'Siemens CNC';
    if (modelName.includes('828D')) series = '828D Series';
    else if (modelName.includes('840D')) series = '840D Series';
    else series = 'Standard Series';
    voltage = '24V DC / 230V AC';
    application = 'CNC Machining Centers';
  }
  // Mitsubishi
  else if (modelName.toLowerCase().includes('mitsubishi')) {
    controller = 'Mitsubishi CNC';
    if (modelName.includes('M800')) series = 'M800 Series';
    else if (modelName.includes('M80')) series = 'M80 Series';
    else series = 'Standard Series';
    voltage = '200-240V AC';
    application = 'CNC Lathe & Milling';
  }
  // Haas
  else if (modelName.toLowerCase().includes('haas')) {
    controller = 'Haas CNC';
    if (modelName.includes('VF')) series = 'VF Series';
    else if (modelName.includes('ST')) series = 'ST Series';
    else if (modelName.includes('NGC')) series = 'NGC Control';
    else series = 'Standard Series';
    voltage = '208-240V AC';
    application = 'CNC Machining Centers';
  }
  // Okuma
  else if (modelName.toLowerCase().includes('okuma')) {
    controller = 'Okuma CNC';
    if (modelName.includes('MA')) series = 'MA Series';
    else if (modelName.includes('LB')) series = 'LB Series';
    else if (modelName.includes('OSP')) series = 'OSP Control';
    else series = 'Standard Series';
    voltage = '200-240V AC';
    application = 'CNC Lathe & Machining';
  }
  // DMG Mori
  else if (modelName.toLowerCase().includes('dmg') || modelName.toLowerCase().includes('mori')) {
    controller = 'DMG Mori CNC';
    if (modelName.includes('NH')) series = 'NH Series';
    else if (modelName.includes('DMU')) series = 'DMU Series';
    else if (modelName.includes('NL')) series = 'NL Series';
    else if (modelName.includes('CELOS')) series = 'CELOS Control';
    else series = 'Standard Series';
    voltage = '200-240V AC';
    application = 'CNC Machining Centers';
  }
  // Doosan
  else if (modelName.toLowerCase().includes('doosan')) {
    controller = 'Doosan CNC';
    if (modelName.includes('Puma')) series = 'Puma Series';
    else if (modelName.includes('Lynx')) series = 'Lynx Series';
    else series = 'Standard Series';
    voltage = '200-240V AC';
    application = 'CNC Lathe & Machining';
  }
  // Makino
  else if (modelName.toLowerCase().includes('makino')) {
    controller = 'Makino CNC';
    if (modelName.includes('D')) series = 'D Series';
    else series = 'Standard Series';
    voltage = '200-240V AC';
    application = 'CNC Machining Centers';
  }
  // Huron
  else if (modelName.toLowerCase().includes('huron')) {
    controller = 'Huron CNC';
    if (modelName.includes('VX')) series = 'VX Series';
    else series = 'Standard Series';
    voltage = '200-240V AC';
    application = 'CNC Machining Centers';
  }
  // Tool Holders
  else if (modelName.toLowerCase().includes('tool holder') || modelName.toLowerCase().includes('bt') || modelName.toLowerCase().includes('hsk') || modelName.toLowerCase().includes('cat')) {
    controller = 'Tool Holder System';
    series = 'Standard Tooling';
    voltage = 'N/A';
    application = 'Tool Clamping';
  }
  // Universal
  else if (modelName.toLowerCase().includes('universal')) {
    controller = 'Universal CNC';
    series = 'Multi-Brand';
    voltage = 'Variable';
    application = 'General CNC';
  }

  controllerEl.textContent = controller;
  seriesEl.textContent = series;
  voltageEl.textContent = voltage;
  applicationEl.textContent = application;
}

function closeModelModal() {
  const modal = document.getElementById('model-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';

  if (modalProductZoomInstance) {
    modalProductZoomInstance.destroy();
    modalProductZoomInstance = null;
  }

  // Clear form fields
  document.getElementById('model-enquiry-name').value = '';
  document.getElementById('model-enquiry-email').value = '';
  document.getElementById('model-enquiry-phone').value = '';
  document.getElementById('model-enquiry-message').value = '';

  // Reset scroll position
  const scrollableBody = modal.querySelector('.overflow-y-auto');
  if (scrollableBody) {
    scrollableBody.scrollTop = 0;
  }

  // Remove any inline styles that might have been added
  modal.style.display = '';
}

// Image Zoom Modal Functions
let currentZoomLevel = 1.0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let imageTranslateX = 0;
let imageTranslateY = 0;

function openImageZoom(imageSrc, label) {
  const modal = document.getElementById('image-zoom-modal');
  const zoomImage = document.getElementById('zoom-image');
  const zoomLabel = document.getElementById('zoom-image-label');

  console.log('Opening zoom modal with:', imageSrc, label);

  // Reset zoom level when opening
  currentZoomLevel = 1.0;
  imageTranslateX = 0;
  imageTranslateY = 0;
  updateZoomDisplay();

  if (zoomImage) {
    zoomImage.src = imageSrc;
    zoomImage.style.display = 'block';
    zoomImage.style.transform = 'scale(1) translate(0px, 0px)';
    zoomImage.style.cursor = 'grab';

    // Add drag event listeners
    zoomImage.addEventListener('mousedown', startDrag);
    zoomImage.addEventListener('mousemove', drag);
    zoomImage.addEventListener('mouseup', endDrag);
    zoomImage.addEventListener('mouseleave', endDrag);

    // Add touch support for mobile
    zoomImage.addEventListener('touchstart', startDragTouch);
    zoomImage.addEventListener('touchmove', dragTouch);
    zoomImage.addEventListener('touchend', endDrag);
  }
  if (zoomLabel) {
    zoomLabel.textContent = label;
  }

  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  modal.style.visibility = 'visible';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';

  document.body.style.overflow = 'hidden';
  document.body.style.overflowY = 'auto';
}

function closeImageZoom() {
  const modal = document.getElementById('image-zoom-modal');
  const zoomImage = document.getElementById('zoom-image');

  // Remove drag event listeners
  if (zoomImage) {
    zoomImage.removeEventListener('mousedown', startDrag);
    zoomImage.removeEventListener('mousemove', drag);
    zoomImage.removeEventListener('mouseup', endDrag);
    zoomImage.removeEventListener('mouseleave', endDrag);
    zoomImage.removeEventListener('touchstart', startDragTouch);
    zoomImage.removeEventListener('touchmove', dragTouch);
    zoomImage.removeEventListener('touchend', endDrag);
  }

  modal.classList.add('hidden');
  modal.style.display = 'none';
  modal.style.visibility = 'hidden';
  document.body.style.overflow = '';
  document.body.style.overflowY = 'auto';

  // Reset zoom when closing
  currentZoomLevel = 1.0;
  imageTranslateX = 0;
  imageTranslateY = 0;
}

function startDrag(e) {
  isDragging = true;
  dragStartX = e.clientX - imageTranslateX;
  dragStartY = e.clientY - imageTranslateY;
  const zoomImage = document.getElementById('zoom-image');
  if (zoomImage) {
    zoomImage.classList.add('grabbing');
  }
}

function drag(e) {
  if (!isDragging) return;
  e.preventDefault();

  imageTranslateX = e.clientX - dragStartX;
  imageTranslateY = e.clientY - dragStartY;

  updateZoomDisplay();
}

function endDrag() {
  isDragging = false;
  const zoomImage = document.getElementById('zoom-image');
  if (zoomImage) {
    zoomImage.classList.remove('grabbing');
  }
}

// Touch event handlers for mobile
function startDragTouch(e) {
  if (e.touches.length === 1) {
    isDragging = true;
    dragStartX = e.touches[0].clientX - imageTranslateX;
    dragStartY = e.touches[0].clientY - imageTranslateY;
    const zoomImage = document.getElementById('zoom-image');
    if (zoomImage) {
      zoomImage.classList.add('grabbing');
    }
  }
}

function dragTouch(e) {
  if (!isDragging || e.touches.length !== 1) return;
  e.preventDefault();

  imageTranslateX = e.touches[0].clientX - dragStartX;
  imageTranslateY = e.touches[0].clientY - dragStartY;

  updateZoomDisplay();
}

function adjustZoom(delta) {
  currentZoomLevel += delta;

  // Clamp zoom level between 0.5x and 3x
  if (currentZoomLevel < 0.5) currentZoomLevel = 0.5;
  if (currentZoomLevel > 3.0) currentZoomLevel = 3.0;

  updateZoomDisplay();
}

function resetZoom() {
  currentZoomLevel = 1.0;
  imageTranslateX = 0;
  imageTranslateY = 0;
  updateZoomDisplay();
}

function updateZoomDisplay() {
  const zoomImage = document.getElementById('zoom-image');
  const zoomLevelDisplay = document.getElementById('zoom-level');

  if (zoomImage) {
    zoomImage.style.transform = `scale(${currentZoomLevel}) translate(${imageTranslateX}px, ${imageTranslateY}px)`;
  }

  if (zoomLevelDisplay) {
    zoomLevelDisplay.textContent = Math.round(currentZoomLevel * 100) + '%';
  }
}

function sendModelEnquiry() {
  const name = document.getElementById('model-enquiry-name').value.trim();
  const email = document.getElementById('model-enquiry-email').value.trim();
  const phone = document.getElementById('model-enquiry-phone').value.trim();
  const message = document.getElementById('model-enquiry-message').value.trim();

  if (!name || !email || !phone) {
    alert('Please fill in your name, email, and phone number.');
    return;
  }

  // Create email body
  const subject = encodeURIComponent(`Enquiry for ${currentModel} - ${currentProduct}`);
  const body = encodeURIComponent(
    `Product: ${currentProduct}\n` +
    `SKU: ${currentProductSku}\n` +
    `Compatible Model: ${currentModel}\n\n` +
    `Customer Details:\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `Phone: ${phone}\n\n` +
    `Message/Requirements:\n${message || 'No specific requirements mentioned.'}`
  );

  // Open email client
  window.location.href = `mailto:globalcnchardware@gmail.com?subject=${subject}&body=${body}`;

  // Show success feedback
  const sendBtn = event.target;
  const originalText = sendBtn.innerHTML;
  sendBtn.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
    Opening Email Client...
  `;
  sendBtn.classList.add('bg-signalDark');

  setTimeout(() => {
    closeModelModal();
    sendBtn.innerHTML = originalText;
    sendBtn.classList.remove('bg-signalDark');
  }, 1500);
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModelModal();
    closeImageZoom();
  }
});

/**
 * Size-categorized product model display system
 * Specifically designed for Drive Cooling Fan (cnc-014)
 * Dynamically groups models by physical frame size into clean industrial sections
 * in descending order (bigger size first) with complete technical specifications,
 * application insights, and smart tags.
 */
const FAN_SIZE_SPECS = {
  172: {
    category: '172mm Cooling Fans',
    badge: 'Heavy Duty',
    subtitle: 'Industrial High Airflow & Extreme Cooling Series',
    description: 'Designed for heavy-duty CNC main electrical enclosures, multi-axis drive racks, and large industrial heat exchangers requiring maximum CFM displacement.',
    voltage: '24V / 48V DC / 230V AC',
    speed: '2,500 – 4,000 RPM',
    airflow: '180 – 300+ CFM',
    noise: '48 – 62 dBA',
    bearing: 'Dual Precision Ball',
    power: '15.0W – 45.0W',
    insight: 'Maximum airflow delivery for large CNC cabinets and continuous multi-axis machining load dissipations.',
    tags: ['Heavy Duty', 'Extreme Airflow', 'Dual Ball Bearing', 'Best for CNC Main Enclosures']
  },
  140: {
    category: '140mm Cooling Fans',
    badge: 'High Airflow',
    subtitle: 'High Airflow & Main Drive Series',
    description: 'High static pressure and high volumetric air delivery engineered for large spindle servo amplifiers, high-capacity regenerative units, and central CNC cabinet ventilation.',
    voltage: '12V / 24V / 48V DC',
    speed: '1,800 – 3,200 RPM',
    airflow: '120 – 180+ CFM',
    noise: '36 – 50 dBA',
    bearing: 'Dual Ball Bearing',
    power: '6.0W – 18.0W',
    insight: 'High airflow with low noise signature, ideal for high-power CNC inverter modules and main drive enclosures.',
    tags: ['High Airflow', 'Industrial Grade', 'Dual Ball Bearing', 'Best for Large Servo Cabinets']
  },
  120: {
    category: '120mm Cooling Fans',
    badge: 'Cabinet Grade',
    subtitle: 'Industrial High Airflow Series',
    description: 'Optimized for CNC control cabinets, multi-axis servo drives, and industrial power distribution panels. Delivers strong forced-air cooling across heatsink fins.',
    voltage: '12V / 24V / 48V DC',
    speed: '1,800 – 3,500 RPM',
    airflow: '70 – 100+ CFM',
    noise: '32 – 45 dBA',
    bearing: 'Dual Precision Ball',
    power: '3.5W – 12.0W',
    insight: 'Superior static pressure and high airflow designed for dense heatsink arrays and sealed CNC cabinet ducting.',
    tags: ['High Airflow', 'Industrial Grade', 'Dual Ball Bearing', 'Best for CNC Cabinets & Drives']
  },
  80: {
    category: '80mm Cooling Fans',
    badge: 'Servo Grade',
    subtitle: 'Mid-Drive & Power Supply Series',
    description: 'Precision cooling for mid-size servo drives, CNC power supply modules, and enclosed machine interface units requiring balanced static pressure.',
    voltage: '12V / 24V DC',
    speed: '2,500 – 5,000 RPM',
    airflow: '25 – 45 CFM',
    noise: '28 – 42 dBA',
    bearing: 'Dual Ball / Precision Sleeve',
    power: '1.5W – 6.0W',
    insight: 'Balanced airflow and pressure profile, engineered for mid-capacity servo amplifier heatsinks and power supplies.',
    tags: ['Balanced Airflow', 'Industrial Grade', 'Dual Ball Bearing', 'Best for Servo Drives & PSUs']
  },
  60: {
    category: '60mm Cooling Fans',
    badge: 'Precision',
    subtitle: 'Mid-Size CNC Drive Series',
    description: 'Specialized thermal management for Fanuc, Siemens, and Mitsubishi servo drives, power supply modules, and compact control interfaces.',
    voltage: '12V / 24V DC',
    speed: '3,000 – 6,000 RPM',
    airflow: '12 – 30 CFM',
    noise: '26 – 40 dBA',
    bearing: 'Dual Precision Ball',
    power: '1.0W – 4.5W',
    insight: 'Moderate-to-high speed fan delivering concentrated airflow through tight drive heatsink fin channels.',
    tags: ['Focused Airflow', 'Dual Ball Bearing', 'Fanuc Compatible', 'Best for CNC Servo Drives']
  },
  50: {
    category: '50mm Cooling Fans',
    badge: 'Compact',
    subtitle: 'Specialty Drive & Module Series',
    description: 'Designed for compact CNC servo amplifiers, auxiliary power packs, and specialized controller electronics where space is strictly constrained.',
    voltage: '12V / 24V DC',
    speed: '3,500 – 6,500 RPM',
    airflow: '8 – 18 CFM',
    noise: '24 – 38 dBA',
    bearing: 'Precision Ball / Sleeve',
    power: '0.8W – 3.5W',
    insight: 'Compact footprint for targeted thermal relief in specialized modular drive systems and CNC sub-assemblies.',
    tags: ['Compact Cooling', 'High Reliability', 'Precision Bearing', 'Best for Modular Drives']
  },
  40: {
    category: '40mm Cooling Fans',
    badge: 'Compact',
    subtitle: 'Ultra-Compact CNC Drive & Internal Heat Sink Series',
    description: 'Standard cooling solution for Fanuc, NMB, San Ace, and Sunon drive modules, embedded power boards, and tight heatsink compartments.',
    voltage: '12V / 24V DC',
    speed: '4,500 – 8,500 RPM',
    airflow: '5 – 10+ CFM',
    noise: '25 – 42 dBA',
    bearing: 'Dual Precision Ball',
    power: '0.5W – 3.5W',
    insight: 'High rotational velocity engineered for direct heatsink fin cooling in tight, high-density electronic assemblies.',
    tags: ['Compact Cooling', 'High RPM', 'Dual Ball Bearing', 'Best for Drive Modules & Heatsinks']
  },
  20: {
    category: '20mm Cooling Fans',
    badge: 'Micro',
    subtitle: 'Micro Enclosure & Controller Component Series',
    description: 'Specialized micro cooling for miniature electronic modules, high-density sensor amplifiers, and ultra-compact CNC internal drive compartments.',
    voltage: '12V / 24V DC',
    speed: '6,000 – 10,000 RPM',
    airflow: '1.5 – 4.0 CFM',
    noise: '20 – 32 dBA',
    bearing: 'Precision Ball / Miniature Sleeve',
    power: '0.4W – 1.8W',
    insight: 'Micro-profile cooling delivering concentrated spot airflow in ultra-confined CNC machine enclosures.',
    tags: ['Micro Form Factor', 'Spot Cooling', 'Low Power', 'Best for Micro Electronics']
  }
};

function getFanSizeWidth(sizeStr) {
  if (!sizeStr) return 0;
  const match = sizeStr.match(/(\d+)\s*x\s*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

function renderCategorizedFanModels(product) {
  const catalog = product.modelCatalog || [];
  if (!catalog.length) {
    return '<p class="text-steel text-sm p-4">No model catalog available.</p>';
  }

  // Group models dynamically by size width
  const sizeMap = {};
  catalog.forEach(item => {
    const width = getFanSizeWidth(item.size);
    if (!sizeMap[width]) {
      sizeMap[width] = [];
    }
    sizeMap[width].push(item);
  });

  // Sort sizes in DESCENDING order (bigger size first: e.g. 172, 140, 120, 80, 60, 50, 40, 20)
  const sortedSizes = Object.keys(sizeMap)
    .map(w => parseInt(w, 10))
    .sort((a, b) => b - a);

  return `
    <div class="fan-size-categorized-wrapper space-y-8">
      <!-- Quick category summary & anchor navigation -->
      <div class="bg-paper border border-line p-3 sm:p-4">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-line">
          <span class="text-xs uppercase font-bold text-navy tracking-wider flex items-center gap-2">
            <svg class="w-4 h-4 text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            Cooling Fan Categories (${catalog.length} Total Models – Descending by Size)
          </span>
          <span class="text-[11px] text-steel font-mono">Bigger Size First</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          ${sortedSizes.map(size => {
            const spec = FAN_SIZE_SPECS[size] || { category: `${size}mm Cooling Fans` };
            const count = sizeMap[size].length;
            return `
              <a href="#size-group-${size}mm" class="text-xs px-3 py-1.5 bg-white border border-line hover:border-signal hover:text-signalDark text-navy font-semibold transition-all flex items-center gap-1.5 shadow-sm">
                <span class="w-1.5 h-1.5 bg-signal"></span>
                <span>${spec.category}</span>
                <span class="text-steel font-normal text-[11px]">(${count})</span>
              </a>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Categories Container (Descending Size Order) -->
      ${sortedSizes.map(size => {
        const models = sizeMap[size];
        const spec = FAN_SIZE_SPECS[size] || {
          category: `${size}mm Cooling Fans`,
          badge: 'Standard',
          subtitle: 'Industrial Cooling Series',
          description: `Industrial cooling solution designed for CNC machine drive systems and control enclosures with ${size}mm mounting footprint.`,
          voltage: '12V / 24V / 48V',
          speed: '2,000 – 6,000 RPM',
          airflow: 'Standard CFM',
          noise: '25 – 45 dBA',
          bearing: 'Dual Ball / Sleeve',
          power: '1.0W – 10.0W',
          insight: 'Engineered for continuous CNC electrical enclosure ventilation.',
          tags: ['Industrial Grade', 'Dual Ball Bearing', 'Best for CNC Enclosures']
        };
        const categoryId = `size-group-${size}mm`;

        return `
          <div id="${categoryId}" class="fan-size-group bg-white border border-line">
            <!-- 1. Section Header -->
            <div class="fan-size-group-header px-4 sm:px-6 py-4 bg-paper border-b border-line">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 bg-signal"></div>
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="font-display font-bold text-lg md:text-xl text-navy tracking-tight uppercase">${spec.category}</h3>
                      <span class="text-xs font-bold uppercase tracking-wider text-signalDark bg-signal/15 px-2 py-0.5 border border-signal/30">
                        ${spec.badge}
                      </span>
                    </div>
                    <p class="text-xs text-steel font-medium mt-0.5">${spec.subtitle}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold px-2.5 py-1 bg-white border border-line text-navy shadow-sm">
                    ${models.length} ${models.length === 1 ? 'Compatible Model' : 'Compatible Models'}
                  </span>
                </div>
              </div>
            </div>

            <!-- Body: Specs, Description, Insights & Models -->
            <div class="p-4 sm:p-6 space-y-5">
              
              <!-- 2. Short Description & 6. Smart Tags -->
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-line">
                <p class="text-sm text-steel leading-relaxed max-w-3xl">
                  ${spec.description}
                </p>
                <!-- Smart Tags -->
                <div class="flex flex-wrap gap-1.5 shrink-0">
                  ${spec.tags.map(tag => `
                    <span class="text-[11px] font-semibold text-navy bg-paper border border-line px-2.5 py-1 uppercase tracking-wider">
                      ${tag}
                    </span>
                  `).join('')}
                </div>
              </div>

              <!-- 3. Technical Specification Table & 4. Performance Insight -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <!-- Technical Specification Table (Spans 2 columns on desktop) -->
                <div class="lg:col-span-2 border border-line bg-white">
                  <div class="bg-paper px-3 py-2 border-b border-line flex items-center justify-between">
                    <span class="text-xs font-bold uppercase text-navy tracking-wider flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                      Technical Specification Range (${size}mm Series)
                    </span>
                    <span class="text-[10px] text-steel font-mono uppercase">Industry Standard</span>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-xs text-left">
                      <tbody class="divide-y divide-line">
                        <tr class="hover:bg-paper/50 transition-colors">
                          <td class="px-3.5 py-2 font-semibold text-steel w-1/3 bg-paper/30">Operating Voltage</td>
                          <td class="px-3.5 py-2 font-mono font-medium text-navy">${spec.voltage}</td>
                        </tr>
                        <tr class="hover:bg-paper/50 transition-colors">
                          <td class="px-3.5 py-2 font-semibold text-steel bg-paper/30">Rotational Speed</td>
                          <td class="px-3.5 py-2 font-mono font-medium text-navy">${spec.speed}</td>
                        </tr>
                        <tr class="hover:bg-paper/50 transition-colors">
                          <td class="px-3.5 py-2 font-semibold text-steel bg-paper/30">Airflow Range</td>
                          <td class="px-3.5 py-2 font-mono font-bold text-signalDark">${spec.airflow}</td>
                        </tr>
                        <tr class="hover:bg-paper/50 transition-colors">
                          <td class="px-3.5 py-2 font-semibold text-steel bg-paper/30">Noise Level</td>
                          <td class="px-3.5 py-2 font-mono font-medium text-navy">${spec.noise}</td>
                        </tr>
                        <tr class="hover:bg-paper/50 transition-colors">
                          <td class="px-3.5 py-2 font-semibold text-steel bg-paper/30">Bearing System</td>
                          <td class="px-3.5 py-2 font-medium text-navy">${spec.bearing}</td>
                        </tr>
                        <tr class="hover:bg-paper/50 transition-colors">
                          <td class="px-3.5 py-2 font-semibold text-steel bg-paper/30">Power Consumption</td>
                          <td class="px-3.5 py-2 font-mono font-medium text-navy">${spec.power}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- 4. Performance Insight Card -->
                <div class="border border-line bg-paper/40 p-4 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-2.5">
                      <div class="w-2 h-2 bg-signal"></div>
                      <span class="text-xs font-bold uppercase text-navy tracking-wider">Performance Insight</span>
                    </div>
                    <p class="text-xs text-steel leading-relaxed mb-3">
                      ${spec.insight}
                    </p>
                    <div class="p-2.5 bg-white border border-line text-[11px] text-steel">
                      <strong class="text-navy font-semibold block mb-0.5">Application Tip:</strong>
                      ${size >= 80 
                        ? 'High airflow series: ensure unimpeded exhaust vents and clean filter mats for optimal heat exchange.' 
                        : 'Compact series: inspect heatsink fin clearance and wiring connector pin alignment during replacement.'}
                    </div>
                  </div>
                  <div class="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-[11px] text-steel">
                    <span class="font-mono">Mounting: Standard ${size}mm</span>
                    <span class="font-semibold text-signalDark">Ready Stock</span>
                  </div>
                </div>
              </div>

              <!-- 5. Model Listing Section -->
              <div class="pt-2">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold uppercase text-navy tracking-wider flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    Available ${spec.category} Models (${models.length})
                  </span>
                  <span class="text-[11px] text-steel">Click any model card to view specifications & request quote</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  ${models.map((item, idx) => {
                    const safeModel = item.model.replace(/'/g, "\\'");
                    const safeName = product.name.replace(/'/g, "\\'");
                    const safeSku = product.sku.replace(/'/g, "\\'");
                    const itemId = item.id;
                    return `
                      <div 
                        class="fan-model-card group bg-white border border-line hover:border-signal p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer animate-slide-up"
                        style="animation-delay: ${idx * 0.02}s;"
                        onclick="openModelModal('${safeModel}', '${safeName}', '${safeSku}', ${JSON.stringify(itemId)})"
                        title="Click to view details for ${item.brand} ${item.model}"
                      >
                        <div>
                          <!-- Top row: Brand & Size badge -->
                          <div class="flex items-start justify-between gap-2 mb-2">
                            <span class="text-xs font-bold uppercase tracking-wider text-signalDark bg-signal/10 px-2 py-0.5 border border-signal/20">
                              ${item.brand}
                            </span>
                            <span class="text-[11px] font-mono text-steel bg-paper px-1.5 py-0.5 border border-line whitespace-nowrap">
                              ${item.size} mm
                            </span>
                          </div>

                          <!-- Model Image Thumbnail -->
                          <div class="w-full h-36 sm:h-40 bg-paper/40 border border-line/60 my-2.5 flex items-center justify-center p-2.5 overflow-hidden image-protected-container">
                            <img 
                              src="${item.image || getFanModelImage(item)}" 
                              alt="${item.brand} ${item.model}" 
                              class="w-full h-full object-contain protected-image group-hover:scale-105 transition-transform duration-200" 
                              onerror="this.onerror=null; this.src='images/models/fan-placeholder.jpg';" 
                              loading="lazy"
                            />
                          </div>

                          <!-- Model Number -->
                          <div class="flex items-center gap-2 mt-2">
                            <svg class="w-4 h-4 text-signal flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span class="text-sm font-bold text-navy group-hover:text-signalDark transition-colors font-mono tracking-tight break-all">
                              ${item.model}
                            </span>
                          </div>
                        </div>

                        <!-- Footer CTA indicator -->
                        <div class="mt-4 pt-2 border-t border-line/40 flex items-center justify-between text-[11px] text-steel group-hover:text-signalDark transition-colors">
                          <span class="font-semibold uppercase tracking-wider text-[10px]">View Specs &amp; Inquire</span>
                          <svg class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                          </svg>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}