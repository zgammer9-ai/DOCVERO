/**
 * DOCVERO PDF Split, Rotate & Page Extractor
 * Powered by pdf-lib & PDF.js (100% in-browser).
 * Features:
 * - Rotate individual or all pages (90° clockwise)
 * - Select / Deselect pages
 * - Delete unwanted pages
 * - Export selected / rotated pages into a clean new PDF
 */

import { formatBytes, createDropzone } from '../ui/dropzone.js';
import { Toast } from '../ui/toast.js';

export function initPdfOrganizer(containerEl) {
  let originalFile = null;
  let pdfDoc = null;
  let pageStates = []; // Array of { pageNum, rotation: 0, selected: true, canvas: null }

  renderInitialView();

  function renderInitialView() {
    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#pdf-tools">PDF Tools</a>
          <span class="separator">/</span>
          <span>PDF Split & Rotate</span>
        </div>
        <h1 class="tool-main-heading">
          PDF Split & Rotate
          <span class="badge badge-local">Processed locally in browser</span>
        </h1>
        <p class="tool-subheading">Fix upside-down pages, extract specific pages, or remove blank pages from your PDF documents.</p>
      </div>

      <div id="dropzone-area"></div>

      <div class="tool-guide-section">
        <h2 class="tool-guide-title">Document scanning tips</h2>
        <div class="guide-faq-grid">
          <div class="faq-item">
            <div class="faq-q">Certificate scanned upside down or sideways?</div>
            <div class="faq-a">Click the rotate button (↻) on any page to turn it 90 degrees until it is right-side up. When you save, the orientation is permanently corrected.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Only need page 1 of a 5-page admission notice?</div>
            <div class="faq-a">Select only the page you want to keep, or delete the unnecessary pages. DOCVERO will output a compact PDF containing only your selected pages.</div>
          </div>
        </div>
      </div>
    `;

    const dropzoneArea = containerEl.querySelector('#dropzone-area');
    createDropzone({
      containerEl: dropzoneArea,
      accept: 'application/pdf',
      title: 'Drop your PDF here to organize pages',
      subtitle: 'Rotate, extract, or delete pages with live preview',
      formatPills: ['Rotate 90°', 'Extract Pages', 'Delete Pages'],
      onFilesSelected: (file) => {
        handlePdfSelected(file);
      }
    });
  }

  async function handlePdfSelected(file) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      Toast.error('Please upload a valid PDF document.');
      return;
    }

    originalFile = file;

    if (typeof window.pdfjsLib === 'undefined' || typeof window.PDFLib === 'undefined') {
      Toast.error('PDF engine is initializing. Please try in a moment.');
      return;
    }

    window.pdfjsLib.GlobalWorkerOptions.workerSrc = './js/vendor/pdf.worker.min.js';
    Toast.info('Loading PDF pages...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      pdfDoc = await loadingTask.promise;

      pageStates = Array.from({ length: pdfDoc.numPages }).map((_, i) => ({
        pageNum: i + 1,
        rotation: 0,
        selected: true,
        canvas: null
      }));

      renderWorkspace();
    } catch (err) {
      console.error(err);
      Toast.error('Could not load PDF document.');
    }
  }

  function renderWorkspace() {
    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#pdf-tools">PDF Tools</a>
          <span class="separator">/</span>
          <span>PDF Split & Rotate</span>
        </div>
        <h1 class="tool-main-heading">
          Organize PDF (${pageStates.length} pages)
          <span class="badge badge-local">100% Private</span>
        </h1>
      </div>

      <div class="file-info-strip">
        <div class="file-meta">
          <div class="file-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div class="file-details">
            <div class="file-name" title="${originalFile.name}">${originalFile.name}</div>
            <div class="file-stats">Total: ${pageStates.length} pages • ${formatBytes(originalFile.size)}</div>
          </div>
        </div>
        <button id="btn-change-file" class="btn btn-secondary btn-sm">Choose another PDF</button>
      </div>

      <div class="tool-workspace">
        <!-- Quick Batch Actions Toolbar -->
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-6); align-items: center; justify-content: space-between;">
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
            <button type="button" id="btn-rotate-all-cw" class="btn btn-secondary btn-sm">↻ Rotate All 90°</button>
            <button type="button" id="btn-select-all" class="btn btn-secondary btn-sm">Select All</button>
            <button type="button" id="btn-deselect-all" class="btn btn-subtle btn-sm">Deselect All</button>
          </div>

          <div>
            <button id="btn-save-pdf" class="btn btn-primary btn-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Save & Download PDF
            </button>
          </div>
        </div>

        <!-- Pages Grid -->
        <div class="pdf-pages-grid" id="organizer-pages-grid">
          <!-- Page cards will render here -->
        </div>
      </div>
    `;

    const changeBtn = containerEl.querySelector('#btn-change-file');
    changeBtn.addEventListener('click', () => renderInitialView());

    const btnRotateAll = containerEl.querySelector('#btn-rotate-all-cw');
    const btnSelectAll = containerEl.querySelector('#btn-select-all');
    const btnDeselectAll = containerEl.querySelector('#btn-deselect-all');
    const btnSavePdf = containerEl.querySelector('#btn-save-pdf');
    const gridEl = containerEl.querySelector('#organizer-pages-grid');

    btnRotateAll.addEventListener('click', () => {
      pageStates.forEach(p => {
        p.rotation = (p.rotation + 90) % 360;
      });
      updateAllRotations();
    });

    btnSelectAll.addEventListener('click', () => {
      pageStates.forEach(p => (p.selected = true));
      renderCards();
    });

    btnDeselectAll.addEventListener('click', () => {
      pageStates.forEach(p => (p.selected = false));
      renderCards();
    });

    renderCards();
    loadPageThumbnails();

    function renderCards() {
      gridEl.innerHTML = pageStates.map((p, idx) => `
        <div class="pdf-page-card ${p.selected ? 'selected' : ''}" id="org-card-${p.pageNum}">
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label style="display: flex; align-items: center; gap: 4px; font-size: 11px; cursor: pointer;">
              <input type="checkbox" class="page-select-checkbox" data-idx="${idx}" ${p.selected ? 'checked' : ''} style="accent-color: var(--accent);" />
              <span>Page ${p.pageNum}</span>
            </label>
            <span style="font-size: 10px; color: var(--text-muted);" id="rot-badge-${p.pageNum}">${p.rotation}°</span>
          </div>

          <div class="pdf-page-canvas-wrapper" id="org-canvas-wrap-${p.pageNum}">
            ${p.canvas ? '' : '<span style="font-size: 11px; color: var(--text-muted);">Loading...</span>'}
          </div>

          <div class="pdf-page-meta" style="padding-top: 6px;">
            <button type="button" class="btn btn-secondary btn-sm rotate-single-btn" data-idx="${idx}" title="Rotate 90° Clockwise">↻ 90°</button>
            <button type="button" class="btn btn-subtle btn-sm delete-single-btn" data-idx="${idx}" title="Delete Page" style="color: var(--error);">✕</button>
          </div>
        </div>
      `).join('');

      // Put existing canvases back if already rendered
      pageStates.forEach(p => {
        if (p.canvas) {
          const wrap = containerEl.querySelector(`#org-canvas-wrap-${p.pageNum}`);
          if (wrap) {
            wrap.innerHTML = '';
            p.canvas.style.transform = `rotate(${p.rotation}deg)`;
            wrap.appendChild(p.canvas);
          }
        }
      });

      // Bind check listeners
      gridEl.querySelectorAll('.page-select-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const idx = parseInt(e.target.dataset.idx, 10);
          pageStates[idx].selected = e.target.checked;
          const card = containerEl.querySelector(`#org-card-${pageStates[idx].pageNum}`);
          if (card) {
            card.classList.toggle('selected', e.target.checked);
          }
        });
      });

      // Bind rotate listeners
      gridEl.querySelectorAll('.rotate-single-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          pageStates[idx].rotation = (pageStates[idx].rotation + 90) % 360;
          updatePageRotation(idx);
        });
      });

      // Bind delete listeners
      gridEl.querySelectorAll('.delete-single-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          pageStates.splice(idx, 1);
          if (pageStates.length === 0) {
            renderInitialView();
          } else {
            renderCards();
          }
        });
      });
    }

    function updatePageRotation(idx) {
      const p = pageStates[idx];
      const badge = containerEl.querySelector(`#rot-badge-${p.pageNum}`);
      if (badge) badge.textContent = `${p.rotation}°`;
      if (p.canvas) {
        p.canvas.style.transform = `rotate(${p.rotation}deg)`;
      }
    }

    function updateAllRotations() {
      pageStates.forEach((_, idx) => updatePageRotation(idx));
    }

    async function loadPageThumbnails() {
      for (const p of pageStates) {
        if (!p.canvas) {
          const page = await pdfDoc.getPage(p.pageNum);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({ canvasContext: ctx, viewport }).promise;

          p.canvas = canvas;
          canvas.style.transform = `rotate(${p.rotation}deg)`;
          const wrap = containerEl.querySelector(`#org-canvas-wrap-${p.pageNum}`);
          if (wrap) {
            wrap.innerHTML = '';
            wrap.appendChild(canvas);
          }
        }
      }
    }

    btnSavePdf.addEventListener('click', async () => {
      const activePages = pageStates.filter(p => p.selected);
      if (activePages.length === 0) {
        Toast.error('Please select at least 1 page to include in the output PDF.');
        return;
      }

      btnSavePdf.disabled = true;
      btnSavePdf.textContent = 'Saving PDF...';

      try {
        const { PDFDocument, degrees } = window.PDFLib;
        const arrayBuffer = await originalFile.arrayBuffer();
        const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const newDoc = await PDFDocument.create();

        for (const p of activePages) {
          // copy 0-indexed page
          const [copiedPage] = await newDoc.copyPages(srcDoc, [p.pageNum - 1]);
          if (p.rotation !== 0) {
            const currentRot = copiedPage.getRotation().angle;
            copiedPage.setRotation(degrees((currentRot + p.rotation) % 360));
          }
          newDoc.addPage(copiedPage);
        }

        const newPdfBytes = await newDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });

        const cleanName = originalFile.name.replace(/\.[^/.]+$/, '');
        const downloadName = `docvero-organized-${cleanName}.pdf`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        Toast.success('Organized PDF downloaded successfully.');
      } catch (err) {
        console.error(err);
        Toast.error('Failed to export PDF.');
      } finally {
        btnSavePdf.disabled = false;
        btnSavePdf.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Save & Download PDF
        `;
      }
    });
  }
}
