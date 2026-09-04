# Global CNC Hardware

A high-performance, responsive industrial web application for **Global CNC Hardware** built using **HTML5, CSS3, Tailwind CSS, and Vanilla JavaScript**.

## Project Tech Stack

- **HTML5**: Semantic HTML pages (`index.html`, `about.html`, `services.html`, `products.html`, `product-details.html`, `contact.html`).
- **CSS3 & Tailwind CSS**: Utility-first responsive design, custom color themes (`navy`, `signal`, `paper`), custom fonts (Archivo, Inter), and micro-animations.
- **Vanilla JavaScript**: Lightweight modules (`js/main.js`, `js/products.js`, `js/product-details.js`, `js/contact.js`) for menu drawer toggles, catalog category filtering, real-time search, dynamic product detail parsing, and inquiry form submission.

## How to Run

Simply open `index.html` in any web browser, or serve using any static web server (e.g. VS Code Live Server, Python `python -m http.server`, Nginx, Apache).

## Directory Structure

```text
global-cmc/
├── index.html            # Homepage
├── about.html            # About Us page
├── services.html         # Services page
├── products.html         # Products catalog page
├── product-details.html  # Dynamic product details page
├── contact.html          # Contact & location page
├── css/
│   └── style.css         # Main stylesheet & custom animations
├── js/
│   ├── main.js           # Navigation & header scripts
│   ├── products.js       # Catalog filtering & search logic
│   ├── product-details.js# Product lookup & specs logic
│   └── contact.js        # Contact form submission logic
├── data/
│   └── products.json     # Products data repository
└── images/               # Product photos and logo images
```

## Features

- **Mobile Navigation Drawer**: Smooth slide-in mobile navigation menu.
- **Product Catalog Filtering**: Real-time filtering by category ("Tools", "Fasteners", "Machinery Parts", "Electrical Hardware") and live text search.
- **Dynamic Product Details**: URL query parameter lookup (`?id=cnc-001`) with specifications table and related category items.
- **Contact Form**: FormSubmit API integration with graceful `mailto:` fallback and location Google Map embed.
