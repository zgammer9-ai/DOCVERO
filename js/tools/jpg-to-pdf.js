/**
 * DOCVERO JPG & Images to PDF Converter
 * Powered by pdf-lib (100% in-browser, zero server uploads).
 * Features:
 * - Multi-image ordering (Move up, Move down, Remove)
 * - Page format: A4, US Letter, Fit to Image
 * - Orientation: Auto-detect, Portrait, Landscape
 * - Margins: None, Small, Standard
 */

import { formatBytes, createDropzone } from '../ui/dropzone.js';
import { Toast } from '../ui/toast.js';

export function initJpgToPdf(containerEl) {
  let imageFiles = []; // Array of { id, file, dataUrl, width, height }

  renderInitialView();

  function renderInitialView() {
    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#pdf-tools">PDF Tools</a>
          <span class="separator">/</span>
          <span>JPG to PDF</span>
        </div>
        <h1 class="tool-main-heading">
          JPG / Images to PDF
          <span class="badge badge-local">Processed locally in browser</span>
        </h1>
        <p class="tool-subheading">Combine photos, certificates, or document scans into a clean, properly oriented PDF document.</p>
      </div>

      <div id="dropzone-area"></div>

      <div class="tool-guide-section">
        <h2 class="tool-guide-title">Tips for College & Job Applications</h2>
        <div class="guide-faq-grid">
          <div class="faq-item">
            <div class="faq-q">Need to submit multiple certificates in one file?</div>
            <div class="faq-a">Upload all your marksheet or certificate photos together. You can rearrange them in any sequence and DOCVERO will compile them into a single neat A4 PDF.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Will my photos be compressed into the PDF?</div>
            <div class="faq-a">Images are embedded at their native resolution with standard PDF compression, preventing pixelation while keeping the output file size manageable for portal limits.</div>
          </div>
        </div>
      </div>
    `;

    const dropzoneArea = containerEl.querySelector('#dropzone-area');
    createDropzone({
      containerEl: dropzoneArea,
      accept: 'image/jpeg,image/png,image/webp',
      multiple: true,
      title: 'Drop photos or certificates here',
      subtitle: 'Upload single or multiple images (JPG, PNG, WebP)',
      formatPills: ['A4 Standard', 'Auto Orientation', 'Multiple Photos'],
      onFilesSelected: (files) => {
        handleIncomingFiles(Array.isArray(files) ? files : [files]);
      }
    });
  }

  async function handleIncomingFiles(files) {
    Toast.info('Reading images...');
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await readFileDataUrl(file);
      const dims = await getImageDimensions(dataUrl);
      imageFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        dataUrl,
        width: dims.width,
        height: dims.height
      });
    }

    if (imageFiles.length > 0) {
      renderWorkspace();
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
          <span>JPG to PDF</span>
        </div>
        <h1 class="tool-main-heading">
          Images to PDF (${imageFiles.length} ${imageFiles.length === 1 ? 'page' : 'pages'})
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
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="file-details">
            <div class="file-name">${imageFiles.length} ${imageFiles.length === 1 ? 'image' : 'images'} in PDF queue</div>
            <div class="file-stats">Drag or use arrow buttons to order pages</div>
          </div>
        </div>
        <div style="display: flex; gap: var(--space-2);">
          <button id="btn-add-more" class="btn btn-secondary btn-sm">+ Add more images</button>
          <button id="btn-clear-all" class="btn btn-subtle btn-sm">Clear</button>
        </div>
        <input type="file" id="input-add-more" multiple accept="image/jpeg,image/png,image/webp" style="display: none;" />
      </div>

      <div class="tool-workspace">
        <div class="controls-grid" style="margin-bottom: var(--space-6);">
          <!-- Page Format -->
          <div class="form-group">
            <label class="form-label" for="select-page-size">Page Size</label>
            <select id="select-page-size" class="input-select">
              <option value="a4" selected>A4 (Standard for official documents)</option>
              <option value="letter">US Letter</option>
              <option value="fit">Fit to Image Size</option>
            </select>
          </div>

          <!-- Page Orientation -->
          <div class="form-group">
            <label class="form-label" for="select-orientation">Orientation</label>
            <select id="select-orientation" class="input-select">
              <option value="auto" selected>Auto-detect per image</option>
              <option value="portrait">All Portrait</option>
              <option value="landscape">All Landscape</option>
            </select>
          </div>

          <!-- Margins -->
          <div class="form-group">
            <label class="form-label" for="select-margins">Page Margins</label>
            <select id="select-margins" class="input-select">
              <option value="small" selected>Small Margin (15 pt)</option>
              <option value="none">No Margin (Full page bleed)</option>
              <option value="normal">Standard Margin (36 pt)</option>
            </select>
          </div>

          <!-- Output filename -->
          <div class="form-group">
            <label class="form-label" for="input-filename">PDF File Name</label>
            <input type="text" id="input-filename" class="input-text" value="docvero-document.pdf" />
          </div>
        </div>

        <div style="margin-bottom: var(--space-6);">
          <button id="btn-generate-pdf" class="btn btn-primary btn-lg" style="width: 100%; max-width: 280px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Generate & Download PDF
          </button>
        </div>

        <h3 style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-3);">Page Sequence</h3>
        <div class="file-queue-list" id="image-queue-list">
          <!-- Queue items rendered here -->
        </div>
      </div>
    `;

    const addMoreBtn = containerEl.querySelector('#btn-add-more');
    const inputAddMore = containerEl.querySelector('#input-add-more');
    const clearAllBtn = containerEl.querySelector('#btn-clear-all');
    const queueList = containerEl.querySelector('#image-queue-list');
    const btnGeneratePdf = containerEl.querySelector('#btn-generate-pdf');

    addMoreBtn.addEventListener('click', () => inputAddMore.click());
    inputAddMore.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleIncomingFiles(Array.from(e.target.files));
      }
    });

    clearAllBtn.addEventListener('click', () => {
      imageFiles = [];
      renderInitialView();
    });

    renderQueue();

    function renderQueue() {
      queueList.innerHTML = imageFiles.map((item, idx) => `
        <div class="file-queue-item" data-id="${item.id}">
          <div class="queue-item-meta">
            <div class="queue-index-badge">${idx + 1}</div>
            <img src="${item.dataUrl}" class="queue-thumb" alt="Thumbnail" />
            <div class="queue-info">
              <div class="queue-filename">${item.file.name}</div>
              <div class="queue-size">${item.width} × ${item.height} px • ${formatBytes(item.file.size)}</div>
            </div>
          </div>
          <div class="queue-actions">
            <button type="button" class="btn btn-secondary btn-sm queue-move-up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Move Up">↑</button>
            <button type="button" class="btn btn-secondary btn-sm queue-move-down" data-idx="${idx}" ${idx === imageFiles.length - 1 ? 'disabled' : ''} title="Move Down">↓</button>
            <button type="button" class="btn btn-subtle btn-sm queue-delete" data-idx="${idx}" title="Remove" style="color: var(--error);">✕</button>
          </div>
        </div>
      `).join('');

      queueList.querySelectorAll('.queue-move-up').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx > 0) {
            const temp = imageFiles[idx];
            imageFiles[idx] = imageFiles[idx - 1];
            imageFiles[idx - 1] = temp;
            renderQueue();
          }
        });
      });

      queueList.querySelectorAll('.queue-move-down').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx < imageFiles.length - 1) {
            const temp = imageFiles[idx];
            imageFiles[idx] = imageFiles[idx + 1];
            imageFiles[idx + 1] = temp;
            renderQueue();
          }
        });
      });

      queueList.querySelectorAll('.queue-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          imageFiles.splice(idx, 1);
          if (imageFiles.length === 0) {
            renderInitialView();
          } else {
            renderQueue();
          }
        });
      });
    }

    btnGeneratePdf.addEventListener('click', async () => {
      if (imageFiles.length === 0) return;
      if (typeof window.PDFLib === 'undefined') {
        Toast.error('PDF generation library is loading. Please wait 1 second.');
        return;
      }

      btnGeneratePdf.disabled = true;
      btnGeneratePdf.textContent = 'Generating PDF...';

      try {
        const pageSizeChoice = containerEl.querySelector('#select-page-size').value;
        const orientationChoice = containerEl.querySelector('#select-orientation').value;
        const marginChoice = containerEl.querySelector('#select-margins').value;
        let pdfName = containerEl.querySelector('#input-filename').value.trim() || 'docvero-document.pdf';
        if (!pdfName.toLowerCase().endsWith('.pdf')) pdfName += '.pdf';

        const marginPt = marginChoice === 'none' ? 0 : marginChoice === 'normal' ? 36 : 15;

        const { PDFDocument } = window.PDFLib;
        const pdfDoc = await PDFDocument.create();

        for (const item of imageFiles) {
          // Normalize to jpeg/png bytes for PDF embedding
          const { bytes, format } = await getImageBytesForPdf(item.file);
          let embeddedImage;
          if (format === 'png') {
            embeddedImage = await pdfDoc.embedPng(bytes);
          } else {
            embeddedImage = await pdfDoc.embedJpg(bytes);
          }

          const imgW = embeddedImage.width;
          const imgH = embeddedImage.height;

          let pageW, pageH;

          if (pageSizeChoice === 'fit') {
            pageW = imgW + marginPt * 2;
            pageH = imgH + marginPt * 2;
          } else {
            // A4 is 595.28 x 841.89 pt, Letter is 612 x 792 pt
            let baseW = pageSizeChoice === 'letter' ? 612 : 595.28;
            let baseH = pageSizeChoice === 'letter' ? 792 : 841.89;

            let isLandscape = false;
            if (orientationChoice === 'auto') {
              isLandscape = imgW > imgH;
            } else if (orientationChoice === 'landscape') {
              isLandscape = true;
            }

            pageW = isLandscape ? Math.max(baseW, baseH) : Math.min(baseW, baseH);
            pageH = isLandscape ? Math.min(baseW, baseH) : Math.max(baseW, baseH);
          }

          const page = pdfDoc.addPage([pageW, pageH]);

          // Scale image inside margins
          const usableW = pageW - marginPt * 2;
          const usableH = pageH - marginPt * 2;

          const scale = Math.min(usableW / imgW, usableH / imgH);
          const drawW = imgW * scale;
          const drawH = imgH * scale;

          const drawX = marginPt + (usableW - drawW) / 2;
          const drawY = marginPt + (usableH - drawH) / 2;

          page.drawImage(embeddedImage, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH
          });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        Toast.success('PDF created and downloaded successfully!');
      } catch (err) {
        console.error(err);
        Toast.error('Failed to create PDF. Please ensure all uploaded images are valid.');
      } finally {
        btnGeneratePdf.disabled = false;
        btnGeneratePdf.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Generate & Download PDF
        `;
      }
    });
  }

  function readFileDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function getImageDimensions(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 800, height: 600 });
      img.src = dataUrl;
    });
  }

  async function getImageBytesForPdf(file) {
    // If WebP, convert to JPEG array buffer first so PDF-lib can embed it natively
    if (file.type === 'image/webp') {
      const canvas = document.createElement('canvas');
      const img = new Image();
      await new Promise((res) => {
        img.onload = res;
        img.src = URL.createObjectURL(file);
      });
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return { bytes, format: 'jpg' };
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const format = file.type === 'image/png' ? 'png' : 'jpg';
    return { bytes, format };
  }
}
