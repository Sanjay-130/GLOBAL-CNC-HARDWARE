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
// DISABLED: Canvas conversion was causing image visibility and sizing issues
// Keeping the function for future use if needed
function protectImages() {
  // Disabled - images now use direct src with protection only
  // Canvas conversion was causing display issues
  return;
}

// Lazy loading with JavaScript
// DISABLED: Using direct src instead of data-src to fix image visibility issues
function lazyLoadImages() {
  // Disabled - images now use direct src for better visibility
  // Lazy loading with data-src was causing display problems
  return;
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