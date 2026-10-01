/**
 * DOCVERO Form Photo & Signature Resizer
 * Specially designed for Indian & global online forms, exams, and government portals:
 * UPSC, SSC, JEE, NEET, State PSC, Bank PO, US/Schengen/Indian Passports.
 *
 * Features:
 * - 1-Click Form Presets (Passport 3.5x4.5cm, Signature 140x60px, Visa 2x2in)
 * - Strict Target Size (<20KB, <50KB, <100KB)
 * - Signature Background Whiter & Ink Darkener (fixes phone-camera signature scans!)
 * - Interactive Crop & Pan
 */

import { formatBytes, createDropzone } from '../ui/dropzone.js';
import { Toast } from '../ui/toast.js';

export function initFormPhotoResizer(containerEl, initialPreset = 'passport') {
  let originalFile = null;
  let originalImg = null;
  let currentPreset = initialPreset; // 'passport' | 'signature' | 'visa' | 'custom'
  let targetKb = 50; // default for photos

  // Crop / Pan state
  let scale = 1.0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startDragX = 0;
  let startDragY = 0;

  // Filter state
  let enhanceContrast = false;

  renderInitialView();

  function renderInitialView() {
    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#form-tools">For Forms</a>
          <span class="separator">/</span>
          <span>Passport Photo & Signature Resizer</span>
        </div>
        <h1 class="tool-main-heading">
          Passport Photo & Signature Resizer
          <span class="badge badge-local">Processed locally in browser</span>
        </h1>
        <p class="tool-subheading">Get your photo or signature ready for government, admission, and job portals in seconds with exact dimensions and strict KB caps.</p>
      </div>

      <div id="dropzone-area"></div>

      <!-- Quick Requirement Cheat Sheet -->
      <div class="tool-guide-section">
        <h2 class="tool-guide-title">Standard Indian & Global Portal Requirements</h2>
        <div class="guide-faq-grid">
          <div class="faq-item">
            <div class="faq-q">UPSC / SSC / State PSC Photo Requirements</div>
            <div class="faq-a">Dimensions: 3.5 × 4.5 cm (350 × 450 px). Size limit: Typically between 20 KB and 50 KB. JPG format only with light background.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Signature Upload Requirements (UPSC / SSC / Bank)</div>
            <div class="faq-a">Dimensions: 140 × 60 px (or 2:1 ratio). Size limit: Strictly between 10 KB and 20 KB. Must be on white paper with dark blue or black ink.</div>
          </div>
        </div>
      </div>
    `;

    const dropzoneArea = containerEl.querySelector('#dropzone-area');
    createDropzone({
      containerEl: dropzoneArea,
      accept: 'image/jpeg,image/png,image/webp',
      title: 'Drop your photo or signature scan here',
      subtitle: 'Supports camera photos and document scans',
      formatPills: ['Passport Photo (3.5×4.5cm)', 'Signature (<20 KB)', 'US Visa (2×2 in)'],
      onFilesSelected: (file) => {
        handleFileSelected(file);
      }
    });
  }

  function handleFileSelected(file) {
    if (!file.type.startsWith('image/')) {
      Toast.error('Please upload an image file.');
      return;
    }

    originalFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImg = img;
        scale = 1.0;
        panX = 0;
        panY = 0;
        renderWorkspace();
      };
      img.onerror = () => Toast.error('Failed to read image.');
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  function getPresetConfig() {
    switch (currentPreset) {
      case 'signature':
        return { name: 'Signature', width: 140, height: 60, defaultKb: 20, isSignature: true };
      case 'visa':
        return { name: 'US Visa / OCI (2×2 in)', width: 600, height: 600, defaultKb: 100, isSignature: false };
      case 'passport':
      default:
        return { name: 'Passport Photo (3.5×4.5 cm)', width: 350, height: 450, defaultKb: 50, isSignature: false };
    }
  }

  function renderWorkspace() {
    const config = getPresetConfig();
    targetKb = config.defaultKb;
    enhanceContrast = config.isSignature; // default contrast boost for signatures

    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#form-tools">For Forms</a>
          <span class="separator">/</span>
          <span>Form Photo & Signature</span>
        </div>
        <h1 class="tool-main-heading">
          Form Photo & Signature Resizer
          <span class="badge badge-local">100% Private</span>
        </h1>
      </div>

      <div class="file-info-strip">
        <div class="file-meta">
          <div class="file-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="file-details">
            <div class="file-name" title="${originalFile.name}">${originalFile.name}</div>
            <div class="file-stats">Original: ${originalImg.naturalWidth} × ${originalImg.naturalHeight} px • ${formatBytes(originalFile.size)}</div>
          </div>
        </div>
        <button id="btn-change-file" class="btn btn-secondary btn-sm">Upload different photo</button>
      </div>

      <div class="tool-workspace">
        <!-- Preset Selector Tabs -->
        <div class="form-group" style="margin-bottom: var(--space-5);">
          <label class="form-label">Select Form Requirement</label>
          <div class="segmented-control" id="form-preset-control">
            <button type="button" class="segmented-btn ${currentPreset === 'passport' ? 'active' : ''}" data-preset="passport">Passport Photo (3.5×4.5 cm)</button>
            <button type="button" class="segmented-btn ${currentPreset === 'signature' ? 'active' : ''}" data-preset="signature">Signature (140×60 px / Under 20 KB)</button>
            <button type="button" class="segmented-btn ${currentPreset === 'visa' ? 'active' : ''}" data-preset="visa">US Visa / OCI (600×600 px)</button>
          </div>
        </div>

        <div class="controls-grid">
          <!-- Target File Size Selection -->
          <div class="form-group">
            <label class="form-label">
              <span>Target File Size Limit</span>
              <span class="form-hint" id="badge-kb-limit">Under ${targetKb} KB</span>
            </label>
            <div style="display: flex; gap: var(--space-2); align-items: center;">
              <button type="button" class="btn btn-secondary btn-sm kb-btn ${targetKb === 20 ? 'btn-primary' : ''}" data-kb="20">Under 20 KB</button>
              <button type="button" class="btn btn-secondary btn-sm kb-btn ${targetKb === 50 ? 'btn-primary' : ''}" data-kb="50">Under 50 KB</button>
              <button type="button" class="btn btn-secondary btn-sm kb-btn ${targetKb === 100 ? 'btn-primary' : ''}" data-kb="100">Under 100 KB</button>
              <input type="number" id="input-custom-kb" class="input-text" style="max-width: 90px;" placeholder="Custom" min="5" max="10000" />
            </div>
          </div>

          <!-- Signature Clean paper filter toggle -->
          <div class="form-group">
            <label class="form-label">Paper Cleanliness Filter</label>
            <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); font-weight: 500; margin-top: 6px;">
              <input type="checkbox" id="check-contrast" ${enhanceContrast ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--accent);" />
              <span>Whiten Paper & Darken Ink (Removes shadows & yellow tint)</span>
            </label>
          </div>

          <!-- Zoom Slider -->
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label" for="slider-zoom">
              <span>Zoom & Framing</span>
              <span class="form-hint">Drag image inside box to center face or signature</span>
            </label>
            <div class="slider-group">
              <input type="range" id="slider-zoom" class="slider-input" min="0.5" max="3.0" value="1.0" step="0.05" />
              <button type="button" id="btn-reset-pan" class="btn btn-subtle btn-sm">Center</button>
            </div>
          </div>
        </div>

        <!-- Interactive Crop Stage -->
        <div class="cropper-stage" id="cropper-stage">
          <div class="cropper-preview-area" id="cropper-preview-area" style="cursor: grab;">
            <canvas id="cropper-canvas"></canvas>
          </div>
          <div style="padding: 10px 16px; background: var(--bg-surface); border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between;">
            <span id="label-dimensions-spec">Output: ${config.width} × ${config.height} px</span>
            <span>💡 Click and drag to reposition image</span>
          </div>
        </div>

        <!-- Result Box & Download -->
        <div class="result-card" style="margin-bottom: var(--space-6);">
          <div class="result-comparison">
            <div class="result-stat-box">
              <span class="stat-label">Result Dimensions</span>
              <span class="stat-value" id="res-dimensions" style="font-size: var(--text-base);">${config.width} × ${config.height} px</span>
            </div>
            <div style="color: var(--border-strong);">•</div>
            <div class="result-stat-box">
              <span class="stat-label">Output Size</span>
              <span class="stat-value" id="res-filesize">Calculating...</span>
            </div>
          </div>

          <button id="btn-download-form-file" class="btn btn-primary btn-lg" style="width: 100%; max-width: 280px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Ready for Portal
          </button>
        </div>
      </div>
    `;

    const changeFileBtn = containerEl.querySelector('#btn-change-file');
    changeFileBtn.addEventListener('click', () => renderInitialView());

    const presetButtons = containerEl.querySelectorAll('#form-preset-control .segmented-btn');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        currentPreset = btn.dataset.preset;
        scale = 1.0;
        panX = 0;
        panY = 0;
        renderWorkspace();
      });
    });

    const kbBtns = containerEl.querySelectorAll('.kb-btn');
    const inputCustomKb = containerEl.querySelector('#input-custom-kb');
    const badgeKbLimit = containerEl.querySelector('#badge-kb-limit');

    kbBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        kbBtns.forEach(b => b.classList.remove('btn-primary'));
        btn.classList.add('btn-primary');
        targetKb = parseInt(btn.dataset.kb, 10);
        badgeKbLimit.textContent = `Under ${targetKb} KB`;
        inputCustomKb.value = '';
        updateFormCanvas();
      });
    });

    inputCustomKb.addEventListener('input', () => {
      const val = parseInt(inputCustomKb.value, 10);
      if (val && val > 0) {
        kbBtns.forEach(b => b.classList.remove('btn-primary'));
        targetKb = val;
        badgeKbLimit.textContent = `Under ${targetKb} KB`;
        updateFormCanvas();
      }
    });

    const checkContrast = containerEl.querySelector('#check-contrast');
    checkContrast.addEventListener('change', (e) => {
      enhanceContrast = e.target.checked;
      updateFormCanvas();
    });

    const sliderZoom = containerEl.querySelector('#slider-zoom');
    sliderZoom.addEventListener('input', (e) => {
      scale = parseFloat(e.target.value);
      updateFormCanvas();
    });

    const btnResetPan = containerEl.querySelector('#btn-reset-pan');
    btnResetPan.addEventListener('click', () => {
      scale = 1.0;
      panX = 0;
      panY = 0;
      sliderZoom.value = '1.0';
      updateFormCanvas();
    });

    // Drag-to-pan handlers
    const previewArea = containerEl.querySelector('#cropper-preview-area');
    previewArea.addEventListener('mousedown', (e) => {
      isDragging = true;
      startDragX = e.clientX - panX;
      startDragY = e.clientY - panY;
      previewArea.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - startDragX;
      panY = e.clientY - startDragY;
      updateFormCanvas();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        previewArea.style.cursor = 'grab';
      }
    });

    // Touch support for mobile users
    previewArea.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        startDragX = e.touches[0].clientX - panX;
        startDragY = e.touches[0].clientY - panY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      panX = e.touches[0].clientX - startDragX;
      panY = e.touches[0].clientY - startDragY;
      updateFormCanvas();
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    const canvas = containerEl.querySelector('#cropper-canvas');
    const resDimensions = containerEl.querySelector('#res-dimensions');
    const resFilesize = containerEl.querySelector('#res-filesize');
    const btnDownload = containerEl.querySelector('#btn-download-form-file');

    let currentBlob = null;

    async function updateFormCanvas() {
      const cfg = getPresetConfig();
      canvas.width = cfg.width;
      canvas.height = cfg.height;

      const ctx = canvas.getContext('2d');
      // Clean white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Center + pan + scale
      ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
      ctx.scale(scale, scale);

      // Fit image cover style
      const baseScale = Math.max(canvas.width / originalImg.naturalWidth, canvas.height / originalImg.naturalHeight);
      const drawW = originalImg.naturalWidth * baseScale;
      const drawH = originalImg.naturalHeight * baseScale;

      ctx.drawImage(originalImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Apply Paper Whiten & Ink Darken filter if selected
      if (enhanceContrast) {
        applySignatureContrast(ctx, canvas.width, canvas.height);
      }

      resDimensions.textContent = `${cfg.width} × ${cfg.height} px`;
      resFilesize.textContent = 'Compressing...';
      btnDownload.disabled = true;

      // Ensure file is strictly <= targetKb
      const targetBytes = targetKb * 1024;
      currentBlob = await generateStrictBlob(canvas, targetBytes);

      resFilesize.textContent = `${formatBytes(currentBlob.size)} (Target: <${targetKb} KB)`;
      btnDownload.disabled = false;
    }

    btnDownload.addEventListener('click', () => {
      if (!currentBlob) return;
      const cfg = getPresetConfig();
      const cleanName = originalFile.name.replace(/\.[^/.]+$/, '');
      const downloadName = `docvero-${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${cleanName}.jpg`;

      const url = URL.createObjectURL(currentBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      Toast.success('Form image downloaded. Ready for portal upload!');
    });

    updateFormCanvas();
  }

  function applySignatureContrast(ctx, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Boost white paper background and darken ink
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

      if (brightness > 170) {
        // Whiten paper background completely
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      } else if (brightness < 120) {
        // Darken ink strokes
        data[i] = Math.max(0, r * 0.7);
        data[i + 1] = Math.max(0, g * 0.7);
        data[i + 2] = Math.max(0, b * 0.7);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  async function generateStrictBlob(canvas, maxBytes) {
    let minQ = 0.1;
    let maxQ = 0.95;
    let bestBlob = null;

    for (let i = 0; i < 7; i++) {
      const q = (minQ + maxQ) / 2;
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', q));
      if (blob.size <= maxBytes) {
        bestBlob = blob;
        minQ = q; // try to get higher quality while still under target
      } else {
        maxQ = q;
      }
    }

    if (!bestBlob) {
      // If even 0.1 quality is larger than budget, output at lowest quality
      bestBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.1));
    }

    return bestBlob;
  }
}
