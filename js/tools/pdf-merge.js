/**
 * DOCVERO PDF Merge Tool
 * Powered by pdf-lib (100% in-browser, zero server uploads).
 * Features:
 * - Multi-PDF sequencing (Move up, Move down, Remove)
 * - Page count inspection
 * - Total page summary
 * - Instant merge and download
 */

import { formatBytes, createDropzone } from '../ui/dropzone.js';
import { Toast } from '../ui/toast.js';

export function initPdfMerge(containerEl) {
  let pdfFiles = []; // Array of { id, file, numPages, bytes }

  renderInitialView();

  function renderInitialView() {
    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#pdf-tools">PDF Tools</a>
          <span class="separator">/</span>
          <span>PDF Merge</span>
        </div>
        <h1 class="tool-main-heading">
          PDF Merge
          <span class="badge badge-local">Processed locally in browser</span>
        </h1>
        <p class="tool-subheading">Combine multiple PDF documents into a single unified file with custom page order.</p>
      </div>

      <div id="dropzone-area"></div>

      <div class="tool-guide-section">
        <h2 class="tool-guide-title">How to merge documents for portals</h2>
        <div class="guide-faq-grid">
          <div class="faq-item">
            <div class="faq-q">Can I merge documents with different page orientations?</div>
            <div class="faq-a">Yes. DOCVERO preserves the orientation, dimensions, and vector contents of every individual page from each source PDF.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Are bookmarked or signed documents supported?</div>
            <div class="faq-a">Standard PDF documents and certificates combine smoothly. If a document has strict digital DRM protection or encryption, unlock it first.</div>
          </div>
        </div>
      </div>
    `;

    const dropzoneArea = containerEl.querySelector('#dropzone-area');
    createDropzone({
      containerEl: dropzoneArea,
      accept: 'application/pdf',
      multiple: true,
      title: 'Drop your PDF files here to merge',
      subtitle: 'Upload 2 or more PDF documents',
      formatPills: ['Multi-file Merge', 'Custom Page Order', 'Zero Uploads'],
      onFilesSelected: (files) => {
        handleIncomingPdfs(Array.isArray(files) ? files : [files]);
      }
    });
  }

  async function handleIncomingPdfs(files) {
    if (typeof window.PDFLib === 'undefined') {
      Toast.error('PDF engine is loading. Please wait 1 second.');
      return;
    }

    Toast.info('Reading PDF files...');

    const { PDFDocument } = window.PDFLib;

    for (const file of files) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) continue;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const numPages = doc.getPageCount();

        pdfFiles.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          numPages,
          bytes: new Uint8Array(arrayBuffer)
        });
      } catch (err) {
        console.error(err);
        Toast.error(`Could not read "${file.name}". It may be encrypted or corrupted.`);
      }
    }

    if (pdfFiles.length > 0) {
      renderWorkspace();
    }
  }

  function renderWorkspace() {
    const totalPages = pdfFiles.reduce((acc, item) => acc + item.numPages, 0);
    const totalBytes = pdfFiles.reduce((acc, item) => acc + item.file.size, 0);

    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#pdf-tools">PDF Tools</a>
          <span class="separator">/</span>
          <span>PDF Merge</span>
        </div>
        <h1 class="tool-main-heading">
          Merge PDFs (${pdfFiles.length} ${pdfFiles.length === 1 ? 'file' : 'files'}, ${totalPages} pages)
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
            <div class="file-name">${pdfFiles.length} PDF files ready to combine</div>
            <div class="file-stats">Total combined pages: <strong>${totalPages} pages</strong> • ${formatBytes(totalBytes)}</div>
          </div>
        </div>
        <div style="display: flex; gap: var(--space-2);">
          <button id="btn-add-more-pdf" class="btn btn-secondary btn-sm">+ Add more PDFs</button>
          <button id="btn-clear-all" class="btn btn-subtle btn-sm">Clear</button>
        </div>
        <input type="file" id="input-add-more-pdf" multiple accept="application/pdf" style="display: none;" />
      </div>

      <div class="tool-workspace">
        <div class="controls-grid" style="margin-bottom: var(--space-6);">
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label" for="input-merged-name">Merged PDF Filename</label>
            <input type="text" id="input-merged-name" class="input-text" value="docvero-merged.pdf" style="max-width: 400px;" />
          </div>
        </div>

        <div style="margin-bottom: var(--space-6);">
          <button id="btn-execute-merge" class="btn btn-primary btn-lg" style="width: 100%; max-width: 280px;" ${pdfFiles.length < 2 ? 'disabled' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Merge & Download PDF
          </button>
          ${pdfFiles.length < 2 ? '<p style="font-size: 13px; color: var(--text-muted); margin-top: 6px;">Add at least 2 PDF documents to merge.</p>' : ''}
        </div>

        <h3 style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-3);">Merge Sequence</h3>
        <div class="file-queue-list" id="pdf-merge-list">
          <!-- Queue items rendered here -->
        </div>
      </div>
    `;

    const addMoreBtn = containerEl.querySelector('#btn-add-more-pdf');
    const inputAddMore = containerEl.querySelector('#input-add-more-pdf');
    const clearAllBtn = containerEl.querySelector('#btn-clear-all');
    const queueList = containerEl.querySelector('#pdf-merge-list');
    const btnExecuteMerge = containerEl.querySelector('#btn-execute-merge');

    addMoreBtn.addEventListener('click', () => inputAddMore.click());
    inputAddMore.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleIncomingPdfs(Array.from(e.target.files));
      }
    });

    clearAllBtn.addEventListener('click', () => {
      pdfFiles = [];
      renderInitialView();
    });

    renderQueue();

    function renderQueue() {
      queueList.innerHTML = pdfFiles.map((item, idx) => `
        <div class="file-queue-item" data-id="${item.id}">
          <div class="queue-item-meta">
            <div class="queue-index-badge">${idx + 1}</div>
            <div class="queue-info">
              <div class="queue-filename">${item.file.name}</div>
              <div class="queue-size">${item.numPages} ${item.numPages === 1 ? 'page' : 'pages'} • ${formatBytes(item.file.size)}</div>
            </div>
          </div>
          <div class="queue-actions">
            <button type="button" class="btn btn-secondary btn-sm queue-move-up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Move Up">↑</button>
            <button type="button" class="btn btn-secondary btn-sm queue-move-down" data-idx="${idx}" ${idx === pdfFiles.length - 1 ? 'disabled' : ''} title="Move Down">↓</button>
            <button type="button" class="btn btn-subtle btn-sm queue-delete" data-idx="${idx}" title="Remove" style="color: var(--error);">✕</button>
          </div>
        </div>
      `).join('');

      queueList.querySelectorAll('.queue-move-up').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx > 0) {
            const temp = pdfFiles[idx];
            pdfFiles[idx] = pdfFiles[idx - 1];
            pdfFiles[idx - 1] = temp;
            renderWorkspace();
          }
        });
      });

      queueList.querySelectorAll('.queue-move-down').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx < pdfFiles.length - 1) {
            const temp = pdfFiles[idx];
            pdfFiles[idx] = pdfFiles[idx + 1];
            pdfFiles[idx + 1] = temp;
            renderWorkspace();
          }
        });
      });

      queueList.querySelectorAll('.queue-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          pdfFiles.splice(idx, 1);
          if (pdfFiles.length === 0) {
            renderInitialView();
          } else {
            renderWorkspace();
          }
        });
      });
    }

    btnExecuteMerge.addEventListener('click', async () => {
      if (pdfFiles.length < 2) return;

      btnExecuteMerge.disabled = true;
      btnExecuteMerge.textContent = 'Merging documents...';

      try {
        let mergedName = containerEl.querySelector('#input-merged-name').value.trim() || 'docvero-merged.pdf';
        if (!mergedName.toLowerCase().endsWith('.pdf')) mergedName += '.pdf';

        const { PDFDocument } = window.PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const item of pdfFiles) {
          const srcDoc = await PDFDocument.load(item.bytes, { ignoreEncryption: true });
          const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
          copiedPages.forEach(p => mergedPdf.addPage(p));
        }

        const mergedBytes = await mergedPdf.save();
        const blob = new Blob([mergedBytes], { type: 'application/pdf' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = mergedName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        Toast.success('PDFs merged and downloaded successfully!');
      } catch (err) {
        console.error(err);
        Toast.error('Could not merge these PDFs. Please check for damaged files.');
      } finally {
        btnExecuteMerge.disabled = false;
        btnExecuteMerge.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Merge & Download PDF
        `;
      }
    });
  }
}
