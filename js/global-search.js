// Global CNC Hardware - Global Search Functionality
// This file handles the search bar that appears on all pages

document.addEventListener('DOMContentLoaded', function() {
  const globalSearchInput = document.getElementById('global-search-input');
  const globalClearSearch = document.getElementById('global-clear-search');
  
  if (!globalSearchInput) return;
  
  // Handle Enter key press
  globalSearchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });
  
  // Handle real-time typing (optional - can trigger search on demand)
  globalSearchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.trim();
    
    // Show/hide clear button
    if (searchTerm.length > 0) {
      globalClearSearch.classList.remove('hidden');
    } else {
      globalClearSearch.classList.add('hidden');
    }
  });
  
  // Handle clear button click
  if (globalClearSearch) {
    globalClearSearch.addEventListener('click', function() {
      globalSearchInput.value = '';
      globalClearSearch.classList.add('hidden');
      globalSearchInput.focus();
    });
  }
  
  // Perform search function
  function performSearch() {
    const searchTerm = globalSearchInput.value.trim();
    
    if (searchTerm.length > 0) {
      // Redirect to products page with search parameter
      const currentPath = window.location.pathname;
      const pathSegments = currentPath.split('/');
      pathSegments.pop(); // Remove current file
      pathSegments.push('products.html');
      const productsPath = pathSegments.join('/');
      
      // Construct the URL with search parameter
      const searchUrl = productsPath + '?search=' + encodeURIComponent(searchTerm);
      window.location.href = searchUrl;
    }
  }
  
  // Check if we're on products page and populate search from URL
  if (window.location.pathname.includes('products.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam && globalSearchInput) {
      globalSearchInput.value = searchParam;
      if (globalClearSearch) {
        globalClearSearch.classList.remove('hidden');
      }
    }
  }
  
  // Add focus enhancement
  globalSearchInput.addEventListener('focus', function() {
    this.parentElement.classList.add('search-focused');
  });
  
  globalSearchInput.addEventListener('blur', function() {
    this.parentElement.classList.remove('search-focused');
  });
});