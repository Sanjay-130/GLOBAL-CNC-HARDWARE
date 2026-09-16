// Global CNC Hardware - Image Protection System

// Disable right-click on images
document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
    e.preventDefault();
    return false;
  }
}, false);

// Disable drag and drop on images
document.addEventListener('dragstart', function(e) {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
    e.preventDefault();
    e.dataTransfer.effectAllowed = 'none';
    return false;
  }
}, false);

document.addEventListener('dragover', function(e) {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'none';
    return false;
  }
}, false);

document.addEventListener('drop', function(e) {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
    e.preventDefault();
    return false;
  }
}, false);

// Disable image selection
document.addEventListener('selectstart', function(e) {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
    e.preventDefault();
    return false;
  }
}, false);

// Disable long-press on mobile (prevent save image option)
document.addEventListener('touchstart', function(e) {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
    setTimeout(function() {
      e.target.style.webkitTouchCallout = 'none';
    }, 300);
  }
}, false);

// Image obfuscation - Convert images to canvas (without watermark)
function protectImages() {
  const images = document.querySelectorAll('.protected-image');
  
  images.forEach(function(img) {
    // Skip if already converted to canvas
    if (img.tagName === 'CANVAS') return;
    
    const src = img.src;
    if (!src) return;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    
    // Draw image to canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Replace img with canvas
    img.parentNode.replaceChild(canvas, img);
    
    // Apply protection styles to canvas
    canvas.classList.add('protected-image');
  });
}

// Lazy loading with JavaScript
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.add('protected-image');
          
          // Convert to canvas after loading (without watermark)
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            img.parentNode.replaceChild(canvas, img);
            canvas.classList.add('protected-image');
          };
        }
        
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(function(img) {
    imageObserver.observe(img);
  });
}

// Initialize protection on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Apply protection to existing images
  protectImages();
  
  // Initialize lazy loading
  lazyLoadImages();
});

// Add protection to dynamically loaded images
const MutationObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    mutation.addedNodes.forEach(function(node) {
      if (node.nodeType === 1) {
        const images = node.querySelectorAll('img');
        images.forEach(function(img) {
          img.classList.add('protected-image');
          img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
          });
          img.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
          });
        });
      }
    });
  });
});

MutationObserver.observe(document.body, {
  childList: true,
  subtree: true
});