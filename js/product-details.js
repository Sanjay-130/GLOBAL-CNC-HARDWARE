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
      <div class="product-gallery-item"
           onclick="document.getElementById('product-image').src = 'images/${img}.jpg'">
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

function openModelModal(modelName, productName, productSku) {
  currentModel = modelName;
  currentProduct = productName;
  currentProductSku = productSku;

  const modal = document.getElementById('model-modal');
  const modelNameEl = document.getElementById('modal-model-name');
  const productNameEl = document.getElementById('modal-product-name');
  const productSkuEl = document.getElementById('modal-product-sku');
  const modelImageEl = document.getElementById('modal-model-image');

  // Ensure modal is properly reset
  modal.classList.remove('hidden');
  modal.style.display = '';
  modal.style.visibility = '';

  modelNameEl.textContent = modelName;
  productNameEl.textContent = productName;
  productSkuEl.textContent = 'SKU: ' + productSku;

  // Reset image container
  const imageContainer = modelImageEl.parentElement;
  imageContainer.innerHTML = `<img id="modal-model-image" src="images/model-placeholder.jpg" alt="Model Image" class="w-full h-full object-contain" style="max-height: 300px; object-fit: contain;">`;
  const newModelImageEl = document.getElementById('modal-model-image');

  // Set placeholder image (you can replace this with actual model images later)
  const modelSlug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  newModelImageEl.src = `images/models/${modelSlug}.jpg`;
  newModelImageEl.alt = modelName;

  // Fallback to placeholder if image fails to load
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

  // Populate model specifications based on model name
  populateModelSpecs(modelName);

  // Reset scroll position
  const scrollableBody = modal.querySelector('.overflow-y-auto');
  if (scrollableBody) {
    scrollableBody.scrollTop = 0;
  }

  document.body.style.overflow = 'hidden';
}

function populateModelSpecs(modelName) {
  const controllerEl = document.getElementById('modal-spec-controller');
  const seriesEl = document.getElementById('modal-spec-series');
  const voltageEl = document.getElementById('modal-spec-voltage');
  const applicationEl = document.getElementById('modal-spec-application');

  // Check if current product has modelCatalog (like Drive Cooling Fan)
  const product = products.find(p => p.id === currentProductSku || p.name === currentProduct);
  let catalogItem = null;
  if (product && product.modelCatalog) {
    catalogItem = product.modelCatalog.find(m => 
      m.model === modelName || 
      `${m.brand} ${m.model}` === modelName ||
      modelName.includes(m.model)
    );
  }

  if (catalogItem) {
    controllerEl.textContent = catalogItem.brand;
    seriesEl.textContent = `${catalogItem.size} mm`;
    voltageEl.textContent = catalogItem.electrical || 'DC 24V';
    const extra = [catalogItem.connector, catalogItem.fanucPart].filter(Boolean).join(' | ');
    applicationEl.textContent = extra || 'Drive & Panel Cooling';
    return;
  }

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
  }
});

/**
 * Size-categorized product model display system
 * Specifically designed for Drive Cooling Fan (cnc-014)
 * Dynamically groups models by physical frame size into clean industrial sections.
 */
function getFanSizeCategory(sizeStr) {
  if (!sizeStr) return 'Other Sizes';
  const match = sizeStr.match(/(\d+)\s*x\s*(\d+)/i);
  if (match) {
    const width = parseInt(match[1], 10);
    return `${width}mm Cooling Fans`;
  }
  return 'Standard Cooling Fans';
}

function renderCategorizedFanModels(product) {
  const catalog = product.modelCatalog || [];
  if (!catalog.length) {
    return '<p class="text-steel text-sm p-4">No model catalog available.</p>';
  }

  // Group models dynamically by size category
  const groups = {};
  catalog.forEach(item => {
    const category = getFanSizeCategory(item.size);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
  });

  // Sort categories logically (e.g., 20mm, 40mm, 50mm, 60mm, 80mm, 120mm)
  const sortedCategories = Object.keys(groups).sort((a, b) => {
    const numA = parseInt(a, 10) || 999;
    const numB = parseInt(b, 10) || 999;
    return numA - numB;
  });

  return `
    <div class="fan-size-categorized-wrapper space-y-6">
      <!-- Quick category summary / anchor pill bar -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-line">
        <span class="text-xs uppercase font-bold text-steel tracking-wider mr-1 flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-signal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          Available Sizes (${catalog.length} Models):
        </span>
        ${sortedCategories.map(cat => `
          <a href="#size-group-${cat.replace(/[^a-zA-Z0-9]/g, '-')}" class="text-xs px-2.5 py-1 bg-white border border-line hover:border-signal hover:text-signal text-navy font-semibold transition-all">
            ${cat} <span class="text-steel font-normal">(${groups[cat].length})</span>
          </a>
        `).join('')}
      </div>

      <!-- Categories Container -->
      ${sortedCategories.map(category => {
        const models = groups[category];
        const categoryId = `size-group-${category.replace(/[^a-zA-Z0-9]/g, '-')}`;
        return `
          <div id="${categoryId}" class="fan-size-group bg-white border border-line">
            <!-- Group Header Bar -->
            <div class="fan-size-group-header flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-paper border-b border-line">
              <div class="flex items-center gap-2.5">
                <div class="w-2.5 h-2.5 bg-signal"></div>
                <h3 class="font-display font-bold text-base md:text-lg text-navy tracking-tight uppercase">${category}</h3>
                <span class="text-xs font-mono font-medium px-2 py-0.5 bg-white border border-line text-steel">
                  ${models.length} ${models.length === 1 ? 'Model' : 'Models'}
                </span>
              </div>
              <div class="text-xs text-steel font-mono">
                Industrial Cooling Series
              </div>
            </div>

            <!-- Models Grid -->
            <div class="p-3 md:p-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                ${models.map((item, idx) => {
                  const safeModel = item.model.replace(/'/g, "\\'");
                  const safeName = product.name.replace(/'/g, "\\'");
                  const safeSku = product.sku.replace(/'/g, "\\'");
                  return `
                    <div 
                      class="fan-model-card group bg-white border border-line hover:border-signal p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer animate-slide-up"
                      style="animation-delay: ${idx * 0.02}s;"
                      onclick="openModelModal('${safeModel}', '${safeName}', '${safeSku}')"
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

                        <!-- Model Number -->
                        <div class="flex items-center gap-2 mb-2">
                          <svg class="w-4 h-4 text-signal flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span class="text-sm font-bold text-navy group-hover:text-signalDark transition-colors font-mono tracking-tight break-all">
                            ${item.model}
                          </span>
                        </div>

                        <!-- Specs details -->
                        <div class="space-y-1 text-xs text-steel pt-1 border-t border-line/60">
                          ${item.electrical ? `
                            <div class="flex items-center justify-between text-[11px]">
                              <span class="text-steelLight">Rating:</span>
                              <span class="font-medium text-navy text-right">${item.electrical}</span>
                            </div>
                          ` : ''}
                          ${item.connector ? `
                            <div class="flex items-center justify-between text-[11px]">
                              <span class="text-steelLight">Connector:</span>
                              <span class="font-medium text-navy text-right">${item.connector}</span>
                            </div>
                          ` : ''}
                          ${item.fanucPart ? `
                            <div class="flex items-center justify-between text-[11px]">
                              <span class="text-steelLight">Fanuc Part:</span>
                              <span class="font-mono text-signalDark font-bold text-right">${item.fanucPart}</span>
                            </div>
                          ` : ''}
                        </div>
                      </div>

                      <!-- Footer CTA indicator -->
                      <div class="mt-3 pt-2 border-t border-line/40 flex items-center justify-between text-[11px] text-steel group-hover:text-signalDark transition-colors">
                        <span class="font-semibold uppercase tracking-wider text-[10px]">View Specs</span>
                        <svg class="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}