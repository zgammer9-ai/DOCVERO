/**
 * DOCVERO Instant Client-Side Tool Search
 * Ultra-fast fuzzy query matching for tools, problems, and student exam requirements.
 */

export const TOOLS_INDEX = [
  {
    id: 'image-compressor',
    title: 'Image Compressor',
    desc: 'Reduce image file size with visual quality control or target exact KB limits.',
    category: 'Image Tools',
    tags: ['compress', 'photo', 'reduce size', 'kb', 'mb', 'jpg', 'jpeg', 'png', 'shrink', '50 kb', '100 kb', '20 kb'],
    route: '#compress-image'
  },
  {
    id: 'image-resizer',
    title: 'Image Resizer',
    desc: 'Change image dimensions by exact pixels, percentage, or aspect ratio.',
    category: 'Image Tools',
    tags: ['resize', 'dimensions', 'width', 'height', 'scale', 'pixels', 'aspect ratio', 'photo'],
    route: '#resize-image'
  },
  {
    id: 'image-converter',
    title: 'Image Format Converter',
    desc: 'Convert JPG to PNG, PNG to JPG, and WebP formats instantly with high fidelity.',
    category: 'Image Tools',
    tags: ['convert', 'jpg to png', 'png to jpg', 'webp', 'format', 'transparency', 'extension'],
    route: '#convert-image'
  },
  {
    id: 'jpg-to-pdf',
    title: 'JPG / Images to PDF',
    desc: 'Combine multiple photos, marksheets, or scans into a clean, properly oriented A4 PDF.',
    category: 'PDF Tools',
    tags: ['jpg to pdf', 'image to pdf', 'png to pdf', 'photos to pdf', 'marksheet', 'certificate', 'a4', 'doc'],
    route: '#jpg-to-pdf'
  },
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG / PNG',
    desc: 'Extract high-resolution images from any PDF document page by page or download as ZIP.',
    category: 'PDF Tools',
    tags: ['pdf to jpg', 'pdf to image', 'pdf to png', 'extract pages', 'render pdf', 'convert pdf'],
    route: '#pdf-to-jpg'
  },
  {
    id: 'pdf-merge',
    title: 'PDF Merge',
    desc: 'Combine multiple PDF files into one clean document with custom page ordering.',
    category: 'PDF Tools',
    tags: ['merge pdf', 'combine pdf', 'join pdf', 'attach', 'multi pdf', 'collate'],
    route: '#pdf-merge'
  },
  {
    id: 'pdf-organizer',
    title: 'PDF Split & Rotate',
    desc: 'Rotate upside-down pages, delete unwanted sheets, or extract specific page ranges.',
    category: 'PDF Tools',
    tags: ['split pdf', 'rotate pdf', 'delete pages', 'extract pages', 'reorder', 'turn page'],
    route: '#pdf-organizer'
  },
  {
    id: 'form-photo-resizer',
    title: 'Passport Photo & Signature Resizer',
    desc: 'Tailored for Indian & global admission forms (UPSC, SSC, JEE, NEET, Visas). Strict KB limits and dimension presets.',
    category: 'For Forms & Applications',
    tags: ['passport photo', 'signature', 'signature resize', 'upsc', 'ssc', 'jee', 'neet', '20 kb', '50 kb', '3.5 x 4.5', '140x60', 'exam form', 'govt form'],
    route: '#form-resizer'
  }
];

export function searchTools(query) {
  if (!query || !query.trim()) return TOOLS_INDEX;
  const cleanQ = query.toLowerCase().trim();

  return TOOLS_INDEX.filter(tool => {
    if (tool.title.toLowerCase().includes(cleanQ)) return true;
    if (tool.desc.toLowerCase().includes(cleanQ)) return true;
    if (tool.category.toLowerCase().includes(cleanQ)) return true;
    if (tool.tags.some(t => t.includes(cleanQ))) return true;
    return false;
  });
}

export function setupSearchPalette() {
  const backdrop = document.getElementById('search-modal-backdrop');
  const input = document.getElementById('search-palette-input');
  const resultsContainer = document.getElementById('search-results-list');
  const triggerBtns = document.querySelectorAll('[data-open-search]');

  if (!backdrop || !input || !resultsContainer) return;

  function openSearch() {
    backdrop.classList.add('open');
    input.value = '';
    renderResults(TOOLS_INDEX);
    setTimeout(() => input.focus(), 50);
  }

  function closeSearch() {
    backdrop.classList.remove('open');
  }

  function renderResults(list) {
    if (list.length === 0) {
      resultsContainer.innerHTML = `
        <li style="padding: 24px; text-align: center; color: var(--text-muted); font-size: var(--text-sm);">
          No matching tools found. Try searching for "photo", "pdf", "50 kb", or "signature".
        </li>
      `;
      return;
    }

    resultsContainer.innerHTML = list.map(item => `
      <li>
        <a href="${item.route}" class="search-result-item" data-tool-id="${item.id}">
          <div>
            <div class="search-result-title">${item.title}</div>
            <div class="search-result-desc">${item.desc}</div>
          </div>
          <span class="badge badge-local" style="font-size: 11px;">${item.category}</span>
        </a>
      </li>
    `).join('');

    resultsContainer.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        closeSearch();
      });
    });
  }

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSearch();
    });
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeSearch();
    }
  });

  input.addEventListener('input', (e) => {
    const matched = searchTools(e.target.value);
    renderResults(matched);
  });

  // Global keydown for Cmd+K / Ctrl+K and Escape
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (backdrop.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
    } else if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeSearch();
    }
  });
}
