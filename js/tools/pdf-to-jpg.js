/**
 * DOCVERO PDF to JPG / PNG Converter
 * Powered by PDF.js (Client-side page rendering) and JSZip.
 * Features:
 * - High-resolution page extraction (150 DPI / 300 DPI)
 * - Visual thumbnail grid of all pages
 * - Download single page or batch ZIP archive
 */

import { formatBytes, createDropzone } from '../ui/dropzone.js';
import { Toast } from '../ui/toast.js';

export function initPdfToJpg(containerEl) {
  let currentFile = null;
  let pdfDoc = null;
  let renderedPages = []; // Array of { pageNum, canvas, blob, mimeType }

  renderInitialView();

  function renderInitialView() {
    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#pdf-tools">PDF Tools</a>
          <span class="separator">/</span>
          <span>PDF to JPG</span>
        </div>
        <h1 class="tool-main-heading">
          PDF to JPG / PNG
          <span class="badge badge-local">Processed locally in browser</span>
        </h1>
        <p class="tool-subheading">Extract crystal-clear image files from any PDF. Download individual pages or the entire document as a ZIP file.</p>
      </div>

      <div id="dropzone-area"></div>

      <div class="tool-guide-section">
        <h2 class="tool-guide-title">Why extract JPG from PDF?</h2>
        <div class="guide-faq-grid">
          <div class="faq-item">
            <div class="faq-q">When do forms require JPG instead of PDF?</div>
            <div class="faq-a">Many admission portals and state public service commissions require caste/income certificates or ID proofs in JPG/JPEG image format rather than PDF. This tool converts your PDF pages into clean images instantly.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Will my confidential documents be kept private?</div>
            <div class="faq-a">Yes! DOCVERO renders your PDF pages directly on your device using WebAssembly and HTML5 Canvas. Your documents are never uploaded to any cloud server or database.</div>
          </div>
        </div>
      </div>
    `;

    const dropzoneArea = containerEl.querySelector('#dropzone-area');
    createDropzone({
      containerEl: dropzoneArea,
      accept: 'application/pdf',
      title: 'Drop your PDF document here',
      subtitle: 'Supports PDFs of any page count up to 100 MB',
      formatPills: ['PDF to JPG', 'PDF to PNG', 'Batch ZIP Download'],
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

    currentFile = file;

    if (typeof window.pdfjsLib === 'undefined') {
      Toast.error('PDF rendering engine is loading. Please wait a moment.');
      return;
    }

    // Set worker path
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = './js/vendor/pdf.worker.min.js';

    Toast.info('Reading PDF document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      pdfDoc = await loadingTask.promise;
      renderWorkspace();
    } catch (err) {
      console.error(err);
      Toast.error('Could not open this PDF. The file may be password-protected or corrupted.');
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
          <span>PDF to JPG</span>
        </div>
        <h1 class="tool-main-heading">
          PDF to Image (${pdfDoc.numPages} ${pdfDoc.numPages === 1 ? 'page' : 'pages'})
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
            <div class="file-name" title="${currentFile.name}">${currentFile.name}</div>
            <div class="file-stats">Total: ${pdfDoc.numPages} pages • ${formatBytes(currentFile.size)}</div>
          </div>
        </div>
        <button id="btn-change-file" class="btn btn-secondary btn-sm">Choose another PDF</button>
      </div>

      <div class="tool-workspace">
        <div class="controls-grid" style="margin-bottom: var(--space-6);">
          <div class="form-group">
            <label class="form-label" for="select-format">Export Format</label>
            <select id="select-format" class="input-select">
              <option value="image/jpeg" selected>JPG / JPEG (Standard for online applications)</option>
              <option value="image/png">PNG (Lossless sharpness)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="select-resolution">Resolution Quality</label>
            <select id="select-resolution" class="input-select">
              <option value="1.5" selected>Standard (150 DPI - Fast & lightweight)</option>
              <option value="2.0">High (200 DPI - Sharp text)</option>
              <option value="2.5">Maximum (300 DPI - Print quality)</option>
            </select>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-6); align-items: center;">
          <button id="btn-render-all" class="btn btn-primary btn-lg">
            Convert All ${pdfDoc.numPages} Pages
          </button>
          <button id="btn-download-all-zip" class="btn btn-secondary btn-lg" style="display: none;">
            Download All as ZIP (.zip)
          </button>
          <span id="render-progress-text" style="font-size: var(--text-sm); color: var(--text-muted);"></span>
        </div>

        <!-- Pages Grid -->
        <div class="pdf-pages-grid" id="pages-grid">
          <!-- Page cards will render here -->
        </div>
      </div>
    `;

    const changeBtn = containerEl.querySelector('#btn-change-file');
    changeBtn.addEventListener('click', () => renderInitialView());

    const btnRenderAll = containerEl.querySelector('#btn-render-all');
    const btnDownloadZip = containerEl.querySelector('#btn-download-all-zip');
    const progressText = containerEl.querySelector('#render-progress-text');
    const pagesGrid = containerEl.querySelector('#pages-grid');
    const selectFormat = containerEl.querySelector('#select-format');
    const selectResolution = containerEl.querySelector('#select-resolution');

    // Render placeholder cards for all pages
    pagesGrid.innerHTML = Array.from({ length: pdfDoc.numPages }).map((_, i) => `
      <div class="pdf-page-card" id="page-card-${i + 1}">
        <div class="pdf-page-canvas-wrapper" id="canvas-wrap-${i + 1}">
          <span style="font-size: 11px; color: var(--text-muted);">Page ${i + 1}</span>
        </div>
        <div class="pdf-page-meta">
          <span class="pdf-page-num">Page ${i + 1}</span>
          <div class="pdf-page-actions" id="action-wrap-${i + 1}">
            <button type="button" class="btn btn-secondary btn-sm render-single-btn" data-page="${i + 1}">Render</button>
          </div>
        </div>
      </div>
    `).join('');

    // Individual render listeners
    pagesGrid.querySelectorAll('.render-single-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pageNum = parseInt(btn.dataset.page, 10);
        await renderSinglePage(pageNum);
      });
    });

    btnRenderAll.addEventListener('click', async () => {
      btnRenderAll.disabled = true;
      renderedPages = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        progressText.textContent = `Rendering page ${i} of ${pdfDoc.numPages}...`;
        await renderSinglePage(i);
      }

      progressText.textContent = `All ${pdfDoc.numPages} pages converted!`;
      btnRenderAll.disabled = false;
      btnRenderAll.textContent = 'Re-convert Pages';

      if (pdfDoc.numPages > 1) {
        btnDownloadZip.style.display = 'inline-flex';
        btnDownloadZip.onclick = () => downloadAllZip();
      }
    });

    async function renderSinglePage(pageNum) {
      const scale = parseFloat(selectResolution.value) || 1.5;
      const format = selectFormat.value;
      const ext = format === 'image/png' ? 'png' : 'jpg';

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      // Fill clean white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      // Update UI for this page
      const wrapEl = containerEl.querySelector(`#canvas-wrap-${pageNum}`);
      if (wrapEl) {
        wrapEl.innerHTML = '';
        wrapEl.appendChild(canvas);
      }

      const blob = await new Promise(res => canvas.toBlob(res, format, 0.92));
      const cleanPdfName = currentFile.name.replace(/\.[^/.]+$/, '');
      const pageFileName = `${cleanPdfName}-page-${pageNum}.${ext}`;

      // Store in array
      const existingIdx = renderedPages.findIndex(p => p.pageNum === pageNum);
      const pageItem = { pageNum, blob, filename: pageFileName };
      if (existingIdx >= 0) renderedPages[existingIdx] = pageItem;
      else renderedPages.push(pageItem);

      const actionWrap = containerEl.querySelector(`#action-wrap-${pageNum}`);
      if (actionWrap) {
        actionWrap.innerHTML = `
          <button type="button" class="btn btn-secondary btn-sm dl-page-btn" data-page="${pageNum}">
            Download (${formatBytes(blob.size)})
          </button>
        `;
        const dlBtn = actionWrap.querySelector('.dl-page-btn');
        dlBtn.addEventListener('click', () => {
          downloadBlob(blob, pageFileName);
        });
      }
    }

    async function downloadAllZip() {
      if (typeof window.JSZip === 'undefined') {
        Toast.error('ZIP packaging utility not loaded.');
        return;
      }

      if (renderedPages.length === 0) {
        Toast.error('Please convert pages before downloading.');
        return;
      }

      const zip = new window.JSZip();
      renderedPages.forEach(item => {
        zip.file(item.filename, item.blob);
      });

      Toast.info('Packaging ZIP file...');
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const cleanPdfName = currentFile.name.replace(/\.[^/.]+$/, '');
      downloadBlob(zipContent, `docvero-${cleanPdfName}-pages.zip`);
      Toast.success('ZIP file downloaded successfully.');
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
