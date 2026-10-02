// Global CNC Hardware - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // ── MOBILE MENU ─────────────────────────────────────────────
  const mobileMenuBtn  = document.getElementById('mobile-menu-btn');
  const mobileMenu     = document.getElementById('mobile-menu');
  const menuIconOpen   = document.getElementById('menu-icon-open');
  const menuIconClose  = document.getElementById('menu-icon-close');
  const mobileMenuClose = document.getElementById('mobile-menu-close');

  // Create and inject backdrop element
  let backdrop = document.getElementById('mobile-menu-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'mobile-menu-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scroll
    if (menuIconOpen)  menuIconOpen.classList.add('hidden');
    if (menuIconClose) menuIconClose.classList.remove('hidden');
    mobileMenuBtn && mobileMenuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
    if (menuIconOpen)  menuIconOpen.classList.remove('hidden');
    if (menuIconClose) menuIconClose.classList.add('hidden');
    mobileMenuBtn && mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }

  // Toggle on hamburger click
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });
  }

  // Close on X button
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMenu);
  }

  // Close when a nav link is clicked
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on backdrop click
  backdrop.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  // ── ACTIVE NAVIGATION LINK HIGHLIGHTING ──────────────────────
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a, #mobile-menu a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('/').pop();

    const isActive =
      linkPath === currentPath ||
      (currentPath === '' && linkPath === 'index.html') ||
      (currentPath === 'index.html' && linkPath === 'index.html');

    if (isActive) {
      if (link.classList.contains('desktop-nav-link')) {
        link.classList.add('text-signal', 'font-semibold', 'bg-signal/5');
        link.classList.remove('text-steel');
        const indicator = link.querySelector('.nav-indicator');
        if (indicator) indicator.classList.remove('hidden');
      } else if (link.classList.contains('mobile-nav-link')) {
        link.classList.add('text-signal', 'bg-signal/5');
        link.classList.remove('text-steel');
      }
    }
  });

  // ── DYNAMIC COPYRIGHT YEAR ────────────────────────────────────
  const yearElements = document.querySelectorAll('#footer-year');
  yearElements.forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ── HEADER SCROLL BEHAVIOR ────────────────────────────────────
  // Add shadow on scroll for better visual feedback
  const header = document.querySelector('header');
  if (header) {
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 20) {
        header.style.boxShadow = '0 2px 20px rgba(11, 28, 45, 0.12)';
      } else {
        header.style.boxShadow = '';
      }
      lastScrollY = scrollY;
    }, { passive: true });
  }

  // ── RESPONSIVE IMAGE FALLBACKS ────────────────────────────────
  // Handle broken images gracefully
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('data-fallback-attached')) {
      img.setAttribute('data-fallback-attached', 'true');
      img.addEventListener('error', function() {
        if (this.getAttribute('data-tried-fallback') !== 'true') {
          this.setAttribute('data-tried-fallback', 'true');
          // Try to show placeholder sibling if available
          const sibling = this.nextElementSibling;
          if (sibling && sibling.classList.contains('hidden')) {
            this.style.display = 'none';
            sibling.style.display = 'flex';
          }
        }
      });
    }
  });
});
