/**
 * DOCVERO Main Application Controller & Router
 * Modern, zero-bloat client-side router with SEO updates and tool initialization.
 */

import { setupSearchPalette, TOOLS_INDEX, searchTools } from './ui/search.js';
import { Toast } from './ui/toast.js';
import { initTheme } from './ui/theme.js';

import { initImageCompressor } from './tools/image-compressor.js';
import { initImageResizer } from './tools/image-resizer.js';
import { initImageConverter } from './tools/image-converter.js';
import { initJpgToPdf } from './tools/jpg-to-pdf.js';
import { initPdfToJpg } from './tools/pdf-to-jpg.js';
import { initPdfMerge } from './tools/pdf-merge.js';
import { initPdfOrganizer } from './tools/pdf-organizer.js';
import { initFormPhotoResizer } from './tools/form-photo-resizer.js';

// Route configuration
const ROUTES = {
  '': {
    title: 'DOCVERO — Your Everyday File Toolkit',
    render: renderHomepage
  },
  '#popular-tools': {
    title: 'Popular Tools — DOCVERO',
    render: (c) => {
      renderHomepage(c);
      setTimeout(() => {
        const el = document.getElementById('popular-tools');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  },
  '#image-tools': {
    title: 'Image Tools — DOCVERO',
    render: (c) => renderCategoryView(c, 'Image Tools')
  },
  '#pdf-tools': {
    title: 'PDF Tools — DOCVERO',
    render: (c) => renderCategoryView(c, 'PDF Tools')
  },
  '#form-tools': {
    title: 'For Forms & Applications — DOCVERO',
    render: (c) => renderCategoryView(c, 'For Forms & Applications')
  },
  '#compress-image': {
    title: 'Image Compressor — Reduce KB Size Privately | DOCVERO',
    render: (c) => initImageCompressor(c)
  },
  '#resize-image': {
    title: 'Image Resizer — Exact Dimensions & Pixels | DOCVERO',
    render: (c) => initImageResizer(c)
  },
  '#convert-image': {
    title: 'Image Format Converter — JPG, PNG, WebP | DOCVERO',
    render: (c) => initImageConverter(c)
  },
  '#jpg-to-pdf': {
    title: 'JPG to PDF — Combine Photos into A4 PDF | DOCVERO',
    render: (c) => initJpgToPdf(c)
  },
  '#pdf-to-jpg': {
    title: 'PDF to JPG & PNG — Extract High-Res Pages | DOCVERO',
    render: (c) => initPdfToJpg(c)
  },
  '#pdf-merge': {
    title: 'PDF Merge — Combine Multiple PDFs | DOCVERO',
    render: (c) => initPdfMerge(c)
  },
  '#pdf-organizer': {
    title: 'PDF Split & Rotate — Organize PDF Pages | DOCVERO',
    render: (c) => initPdfOrganizer(c)
  },
  '#form-resizer': {
    title: 'Passport Photo & Signature Resizer for Online Forms | DOCVERO',
    render: (c) => initFormPhotoResizer(c, 'passport')
  },
  '#privacy': {
    title: 'Privacy Policy & Local Processing Guarantee | DOCVERO',
    render: renderPrivacyPage
  },
  '#about': {
    title: 'About DOCVERO — Simple, Zero-Cost Everyday Utilities',
    render: renderAboutPage
  },
  '#terms': {
    title: 'Terms of Service | DOCVERO',
    render: renderTermsPage
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupNavigation();
  setupSearchPalette();
  handleRoute();

  window.addEventListener('hashchange', () => {
    handleRoute();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
});

function setupNavigation() {
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      const isOpen = mobileDrawer.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

function handleRoute() {
  const hash = window.location.hash || '';
  const cleanHash = hash.split('?')[0];
  const appContainer = document.getElementById('app-view');

  if (!appContainer) return;

  const routeConfig = ROUTES[cleanHash] || ROUTES[''];
  document.title = routeConfig.title;

  // Highlight active nav links
  document.querySelectorAll('.site-nav .nav-link, .mobile-drawer .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === cleanHash || (cleanHash === '' && href === '#')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  appContainer.innerHTML = '';
  routeConfig.render(appContainer);
}

/**
 * Homepage rendering (problem-oriented, clean visual hierarchy)
 */
function renderHomepage(container) {
  container.innerHTML = `
    <!-- Hero Section -->
    <section style="padding: var(--space-12) 0 var(--space-8); text-align: center;">
      <div class="container">
        <div style="display: inline-flex; margin-bottom: var(--space-4);">
          <span class="badge badge-local" style="font-size: var(--text-xs); padding: 4px 12px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            Processed 100% locally in your browser • Zero server uploads
          </span>
        </div>

        <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: var(--space-4);">
          <img src="assets/logo-icon.svg" alt="DOCVERO Logo" style="width: 54px; height: 54px;" />
          <span class="brand-wordmark" style="font-size: clamp(2.4rem, 5.5vw, 3.6rem); letter-spacing: -0.03em;">DOC<span class="brand-accent">VERO</span></span>
        </div>

        <h1 style="font-size: clamp(1.35rem, 3vw, 1.85rem); font-weight: 600; letter-spacing: -0.015em; max-width: 720px; margin: 0 auto var(--space-3); color: var(--text-muted);">
          Your everyday file toolkit.
        </h1>

        <p class="lead" style="max-width: 620px; margin: 0 auto var(--space-6); color: var(--text-body);">
          Resize, compress, convert and manage your files — simply. Designed especially for students, job applicants, and everyday document tasks.
        </p>

        <!-- Inline Quick Search Box -->
        <div style="max-width: 580px; margin: 0 auto var(--space-5); position: relative;">
          <div style="display: flex; align-items: center; background: var(--bg-surface); border: 2px solid var(--border-strong); border-radius: var(--radius-lg); padding: 6px 14px; box-shadow: var(--shadow-sm); transition: border-color var(--transition-fast);" id="hero-search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-right: 10px; flex-shrink: 0;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="hero-search-input" placeholder="What do you need to do? (e.g. compress photo under 50kb, merge pdfs...)" style="border: none; outline: none; width: 100%; font-size: var(--text-base); font-family: inherit; color: var(--text-main); background: transparent;" autocomplete="off" />
            <kbd style="font-size: 11px; color: var(--text-muted); display: none;" class="shortcut-tag">Ctrl K</kbd>
          </div>
          <div id="hero-search-results" style="display: none; position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); z-index: 40; max-height: 280px; overflow-y: auto; text-align: left; padding: 4px;"></div>
        </div>

        <!-- Quick Problem Pills -->
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-2); max-width: 720px; margin: 0 auto var(--space-8);">
          <span style="font-size: var(--text-xs); color: var(--text-muted); align-self: center; margin-right: 4px;">Quick Actions:</span>
          <a href="#compress-image" class="badge" style="cursor: pointer;">Compress photo</a>
          <a href="#form-resizer" class="badge badge-blue" style="cursor: pointer;">Signature under 20 KB</a>
          <a href="#jpg-to-pdf" class="badge" style="cursor: pointer;">JPG to PDF</a>
          <a href="#pdf-to-jpg" class="badge" style="cursor: pointer;">PDF to JPG</a>
          <a href="#pdf-merge" class="badge" style="cursor: pointer;">Merge PDFs</a>
          <a href="#form-resizer" class="badge badge-local" style="cursor: pointer;">Passport Photo (3.5 × 4.5 cm)</a>
        </div>
      </div>
    </section>

    <!-- Popular Tools Directory -->
    <section style="padding: var(--space-10) 0; border-top: 1px solid var(--border); background-color: var(--bg-surface);" id="popular-tools">
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-4);">
          <div>
            <h2 style="font-size: var(--text-2xl); font-weight: 700; margin-bottom: var(--space-1);">Popular Tools</h2>
            <p style="font-size: var(--text-sm); color: var(--text-body);">Every tool runs locally on your computer or phone. Fast, reliable, and completely free.</p>
          </div>
          <a href="#image-tools" style="font-size: var(--text-sm); font-weight: 600;">View all tools →</a>
        </div>

        <div class="tools-grid">
          ${renderToolCard({
            route: '#compress-image',
            icon: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>`,
            title: 'Image Compressor',
            desc: 'Reduce image file size with visual quality slider or enter exact target KB (e.g. 50 KB).',
            badge: 'Quality & KB Control'
          })}

          ${renderToolCard({
            route: '#form-resizer',
            icon: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`,
            title: 'Passport & Signature Resizer',
            desc: 'Passport photo (3.5 × 4.5 cm) and signature (140 × 60 px) presets with strict <20KB / <50KB caps.',
            badge: 'For Exam Portals'
          })}

          ${renderToolCard({
            route: '#jpg-to-pdf',
            icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>`,
            title: 'JPG to PDF',
            desc: 'Convert multiple photos or scans into a neat, properly oriented A4 PDF document.',
            badge: 'Multi-image A4'
          })}

          ${renderToolCard({
            route: '#pdf-to-jpg',
            icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>`,
            title: 'PDF to JPG',
            desc: 'Extract high-resolution images from every page of your PDF. Download single page or all as ZIP.',
            badge: 'High DPI'
          })}

          ${renderToolCard({
            route: '#pdf-merge',
            icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line>`,
            title: 'PDF Merge',
            desc: 'Combine multiple PDF files into one clean document with custom page reordering.',
            badge: 'Zero Uploads'
          })}

          ${renderToolCard({
            route: '#resize-image',
            icon: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="21 9 15 3 9 3 3 9"></polyline>`,
            title: 'Image Resizer',
            desc: 'Resize image dimensions by exact pixels, percentage scale, or aspect-ratio locked proportions.',
            badge: 'Pixel Precision'
          })}

          ${renderToolCard({
            route: '#convert-image',
            icon: `<polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line>`,
            title: 'Image Format Converter',
            desc: 'Convert JPG to PNG, PNG to JPG, and WebP formats with transparency preservation.',
            badge: 'Batch Support'
          })}

          ${renderToolCard({
            route: '#pdf-organizer',
            icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18a4 4 0 1 0-4-4"></path>`,
            title: 'PDF Split & Rotate',
            desc: 'Rotate upside-down pages 90°, delete unwanted sheets, or extract specific page ranges.',
            badge: 'Visual Preview'
          })}
        </div>
      </div>
    </section>

    <!-- Problem-Oriented Section: Made for real-world forms -->
    <section style="padding: var(--space-10) 0; border-top: 1px solid var(--border); background-color: var(--bg-page);">
      <div class="container">
        <div style="max-width: 640px; margin-bottom: var(--space-4);">
          <h2 style="font-size: var(--text-2xl); font-weight: 700; margin-bottom: var(--space-1);">Made for real-world forms & applications</h2>
          <p style="font-size: var(--text-sm); color: var(--text-body);">Solve the exact file rejection issues that students and job applicants encounter every day.</p>
        </div>

        <div class="problem-grid">
          <!-- Problem 1 -->
          <div class="problem-card">
            <span class="problem-tag">Upload Rejected?</span>
            <h3 class="problem-title">Photo too large for portal?</h3>
            <p class="problem-desc">Exam portals (UPSC, SSC, JEE, State PSC) strictly cap uploads at 50 KB or 100 KB. DOCVERO compresses without turning photos into blurry mush.</p>
            <a href="#compress-image" class="btn btn-secondary btn-sm" style="align-self: flex-start;">Compress photo under 50 KB →</a>
          </div>

          <!-- Problem 2 -->
          <div class="problem-card">
            <span class="problem-tag">Dimension Error?</span>
            <h3 class="problem-title">Signature not the right size?</h3>
            <p class="problem-desc">Forms require strict 140 × 60 px or 2:1 aspect ratio under 20 KB. Whitens paper background, darkens blue/black ink, and locks dimensions.</p>
            <a href="#form-resizer" class="btn btn-secondary btn-sm" style="align-self: flex-start;">Resize signature →</a>
          </div>

          <!-- Problem 3 -->
          <div class="problem-card">
            <span class="problem-tag">Multiple Scans?</span>
            <h3 class="problem-title">Combine certificate photos?</h3>
            <p class="problem-desc">Need a single PDF of your degree, marksheets, and caste certificate? Arrange your phone photos and generate a clean A4 PDF.</p>
            <a href="#jpg-to-pdf" class="btn btn-secondary btn-sm" style="align-self: flex-start;">Convert JPG to PDF →</a>
          </div>

          <!-- Problem 4 -->
          <div class="problem-card">
            <span class="problem-tag">Format Mismatch?</span>
            <h3 class="problem-title">Need JPG instead of PDF?</h3>
            <p class="problem-desc">Government portals often reject PDF uploads for identity proofs. Extract crystal-clear JPG images from any PDF in one click.</p>
            <a href="#pdf-to-jpg" class="btn btn-secondary btn-sm" style="align-self: flex-start;">Extract JPG from PDF →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Privacy Architecture Callout -->
    <section style="padding: var(--space-12) 0; background-color: var(--bg-surface); border-top: 1px solid var(--border);">
      <div class="container">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
          <div style="display: inline-flex; margin-bottom: var(--space-3);">
            <span class="badge badge-local" style="padding: 4px 12px; font-weight: 600;">Privacy-First Engineering</span>
          </div>
          <h2 style="font-size: var(--text-2xl); font-weight: 700; margin-bottom: var(--space-3); color: var(--text-main);">
            Your personal documents stay on your device.
          </h2>
          <p style="font-size: var(--text-base); color: var(--text-body); line-height: var(--leading-relaxed); margin-bottom: var(--space-6);">
            Unlike traditional file conversion sites that upload your sensitive documents, passport photos, and signatures to remote cloud servers, 
            <strong>DOCVERO processes your files entirely within your web browser</strong> using client-side WebAssembly, Canvas, and pure JavaScript.
          </p>
          <div style="display: inline-flex; gap: var(--space-4); flex-wrap: wrap; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); font-weight: 500;">
              <span style="color: var(--success); font-weight: 700;">✓</span> 0 Server Uploads
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); font-weight: 500;">
              <span style="color: var(--success); font-weight: 700;">✓</span> No Account or Login Required
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); font-weight: 500;">
              <span style="color: var(--success); font-weight: 700;">✓</span> 100% Free Forever
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Hero Search Input handler
  const heroInput = container.querySelector('#hero-search-input');
  const heroResults = container.querySelector('#hero-search-results');

  if (heroInput && heroResults) {
    heroInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (!q) {
        heroResults.style.display = 'none';
        return;
      }
      const matched = searchTools(q);
      if (matched.length === 0) {
        heroResults.innerHTML = `<div style="padding: 12px; font-size: 13px; color: var(--text-muted);">No matching tools found.</div>`;
      } else {
        heroResults.innerHTML = matched.map(m => `
          <a href="${m.route}" class="search-result-item" style="padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 14px; font-weight: 600; color: var(--text-main);">${m.title}</div>
              <div style="font-size: 12px; color: var(--text-muted);">${m.desc}</div>
            </div>
            <span class="badge badge-local" style="font-size: 11px;">${m.category}</span>
          </a>
        `).join('');
      }
      heroResults.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!heroInput.contains(e.target) && !heroResults.contains(e.target)) {
        heroResults.style.display = 'none';
      }
    });
  }
}

function renderToolCard({ route, icon, title, desc, badge }) {
  return `
    <a href="${route}" class="tool-card">
      <div>
        <div class="tool-card-header">
          <div class="tool-icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${icon}
            </svg>
          </div>
          <span class="badge badge-local">${badge}</span>
        </div>
        <div class="tool-card-title">${title}</div>
        <div class="tool-card-desc">${desc}</div>
      </div>
      <div class="tool-card-footer">
        <span class="tool-card-action">
          Open tool
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </div>
    </a>
  `;
}

/**
 * Category views for filtered browsing
 */
function renderCategoryView(container, categoryName) {
  const tools = TOOLS_INDEX.filter(t => t.category === categoryName);

  container.innerHTML = `
    <div class="container" style="padding-top: var(--space-8); padding-bottom: var(--space-12);">
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <span>${categoryName}</span>
        </div>
        <h1 class="tool-main-heading">${categoryName}</h1>
        <p class="tool-subheading">All tools in this collection operate strictly on your device without file uploads.</p>
      </div>

      <div class="tools-grid">
        ${tools.map(tool => renderToolCard({
          route: tool.route,
          icon: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>`,
          title: tool.title,
          desc: tool.desc,
          badge: 'Local Processing'
        })).join('')}
      </div>
    </div>
  `;
}

/**
 * Privacy Policy Page
 */
function renderPrivacyPage(container) {
  container.innerHTML = `
    <div class="container-narrow" style="padding-top: var(--space-8); padding-bottom: var(--space-12);">
      <div class="breadcrumbs">
        <a href="#">Home</a>
        <span class="separator">/</span>
        <span>Privacy Policy</span>
      </div>

      <h1 style="font-size: var(--text-3xl); font-weight: 700; margin-bottom: var(--space-4);">Privacy Policy</h1>
      <p class="text-muted" style="margin-bottom: var(--space-6);">Last updated: September 2026</p>

      <div style="background: var(--badge-local-bg); border: 1px solid var(--badge-local-border); border-radius: var(--radius-lg); padding: var(--space-5); margin-bottom: var(--space-8);">
        <h3 style="color: var(--badge-local-text); font-size: var(--text-base); margin-bottom: var(--space-2);">The DOCVERO Privacy Guarantee</h3>
        <p style="color: #166534; font-size: var(--text-sm); line-height: var(--leading-normal);">
          <strong>Your files never leave your computer or mobile device.</strong> All image resizing, file compression, PDF conversions, page extractions, and PDF merges are executed locally in your browser's execution memory using HTML5 Canvas and WebAssembly.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-6); font-size: var(--text-sm); line-height: var(--leading-relaxed);">
        <div>
          <h2 style="font-size: var(--text-lg); margin-bottom: var(--space-2);">1. File Processing & Zero Storage</h2>
          <p>DOCVERO operates with a zero-storage architecture. When you drop an image or PDF into any tool, the file is read directly by your web browser's File API. At no point is the file transmitted across the internet to our servers or any third-party cloud infrastructure.</p>
        </div>

        <div>
          <h2 style="font-size: var(--text-lg); margin-bottom: var(--space-2);">2. No User Accounts or Personal Data Collection</h2>
          <p>We believe utility software should be frictionless. DOCVERO requires no registration, no email address, and no account creation. You can use all tools anonymously.</p>
        </div>

        <div>
          <h2 style="font-size: var(--text-lg); margin-bottom: var(--space-2);">3. Analytics & Telemetry</h2>
          <p>DOCVERO does not track keystrokes, filenames, document contents, or metadata. Basic, privacy-respecting website visit counts (pageviews) may be logged to understand site reliability, but never associated with your files or identity.</p>
        </div>

        <div>
          <h2 style="font-size: var(--text-lg); margin-bottom: var(--space-2);">4. Contact</h2>
          <p>If you have any questions or security inquiries regarding our client-side processing, reach out at <code>privacy@docvero.app</code>.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * About Page
 */
function renderAboutPage(container) {
  container.innerHTML = `
    <div class="container-narrow" style="padding-top: var(--space-8); padding-bottom: var(--space-12);">
      <div class="breadcrumbs">
        <a href="#">Home</a>
        <span class="separator">/</span>
        <span>About DOCVERO</span>
      </div>

      <h1 style="font-size: var(--text-3xl); font-weight: 700; margin-bottom: var(--space-4);">About DOCVERO</h1>
      <p class="lead" style="margin-bottom: var(--space-6);">Your everyday file toolkit. Simple, fast, and private.</p>

      <div style="display: flex; flex-direction: column; gap: var(--space-6); font-size: var(--text-sm); line-height: var(--leading-relaxed);">
        <p>
          Every year, millions of students and job applicants across India and worldwide struggle with frustrating online application portals. Portals require photos under 50 KB, signatures under 20 KB in 140×60 pixels, and marksheets combined into single PDFs.
        </p>
        <p>
          Existing websites are cluttered with deceptive ads, demand paid subscriptions for basic features, or silently upload sensitive identity documents and certificates to unknown overseas servers.
        </p>
        <p>
          <strong>DOCVERO was created to fix this.</strong>
        </p>
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-6);">
          <h3 style="margin-bottom: var(--space-3); font-size: var(--text-base);">Core Principles of DOCVERO:</h3>
          <ul style="padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2);">
            <li><strong>Privacy First:</strong> Files stay on your device. We use browser-native APIs and WebAssembly.</li>
            <li><strong>Zero Cost (₹0):</strong> No hidden subscription paywalls, no "3 free conversions then pay" tricks.</li>
            <li><strong>Form-Optimized:</strong> Built-in presets for UPSC, SSC, JEE, NEET, Visas, and State Portals.</li>
            <li><strong>Fast & Lightweight:</strong> Works reliably on mobile phones and low-bandwidth connections.</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * Terms Page
 */
function renderTermsPage(container) {
  container.innerHTML = `
    <div class="container-narrow" style="padding-top: var(--space-8); padding-bottom: var(--space-12);">
      <div class="breadcrumbs">
        <a href="#">Home</a>
        <span class="separator">/</span>
        <span>Terms of Service</span>
      </div>

      <h1 style="font-size: var(--text-3xl); font-weight: 700; margin-bottom: var(--space-4);">Terms of Service</h1>
      <p class="text-muted" style="margin-bottom: var(--space-6);">Effective: September 2026</p>

      <div style="display: flex; flex-direction: column; gap: var(--space-5); font-size: var(--text-sm); line-height: var(--leading-relaxed);">
        <p>DOCVERO provides in-browser document processing tools free of charge for personal, educational, and professional use.</p>
        <p>Because all processing takes place locally on your device, you retain full ownership and copyright of your files at all times.</p>
        <p>DOCVERO is provided "as is", without warranty of any kind. Users are advised to verify that their processed documents meet the specific requirements of their target portal before final submission.</p>
      </div>
    </div>
  `;
}
