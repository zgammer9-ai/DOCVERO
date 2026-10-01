/**
 * DOCVERO Image Resizer Tool
 * Features:
 * - Exact pixel resizing (width & height)
 * - Proportional aspect ratio lock
 * - Scale by percentage (25%, 50%, 75%, 150%, 200%)
 * - Useful exam & portal dimension presets (Passport 350x450, Signature 140x60)
 * - High-fidelity bicubic resampling via Canvas
 */

import { formatBytes, createDropzone } from '../ui/dropzone.js';
import { Toast } from '../ui/toast.js';

export function initImageResizer(containerEl) {
  let originalFile = null;
  let originalImg = null;
  let keepAspectRatio = true;
  let aspectRatio = 1;

  renderInitialView();

  function renderInitialView() {
    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#image-tools">Image Tools</a>
          <span class="separator">/</span>
          <span>Image Resizer</span>
        </div>
        <h1 class="tool-main-heading">
          Image Resizer
          <span class="badge badge-local">Processed locally in browser</span>
        </h1>
        <p class="tool-subheading">Resize your images by exact pixel dimensions, percentage scale, or standard application presets.</p>
      </div>

      <div id="dropzone-area"></div>

      <div class="tool-guide-section">
        <h2 class="tool-guide-title">Standard Application Dimensions</h2>
        <div class="guide-faq-grid">
          <div class="faq-item">
            <div class="faq-q">What dimensions are required for Indian competitive exams?</div>
            <div class="faq-a">UPSC and SSC typically require photograph dimensions of 350 × 450 pixels (or 3.5 × 4.5 cm) and signature dimensions of 140 × 60 pixels. Both presets are available inside this tool.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Will resizing affect the image sharpness?</div>
            <div class="faq-a">DOCVERO uses bicubic smoothing directly in your browser's graphics pipeline, ensuring crisp text and clear facial outlines even when downsampling.</div>
          </div>
        </div>
      </div>
    `;

    const dropzoneArea = containerEl.querySelector('#dropzone-area');
    createDropzone({
      containerEl: dropzoneArea,
      accept: 'image/jpeg,image/png,image/webp,image/avif',
      title: 'Drop your image here to resize',
      subtitle: 'Supports JPG, PNG, WebP up to 50 MB',
      formatPills: ['Exact Pixels', 'Percentage Scale', 'Presets'],
      onFilesSelected: (file) => {
        handleFileSelected(file);
      }
    });
  }

  function handleFileSelected(file) {
    if (!file.type.startsWith('image/')) {
      Toast.error('Please upload an image file (JPG, PNG, or WebP).');
      return;
    }

    originalFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImg = img;
        aspectRatio = img.naturalWidth / img.naturalHeight;
        renderWorkspace();
      };
      img.onerror = () => {
        Toast.error('Failed to parse this image.');
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  function renderWorkspace() {
    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#image-tools">Image Tools</a>
          <span class="separator">/</span>
          <span>Image Resizer</span>
        </div>
        <h1 class="tool-main-heading">
          Image Resizer
          <span class="badge badge-local">100% Private</span>
        </h1>
      </div>

      <div class="file-info-strip">
        <div class="file-meta">
          <div class="file-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <polyline points="21 9 15 3 9 3 3 9"></polyline>
            </svg>
          </div>
          <div class="file-details">
            <div class="file-name" title="${originalFile.name}">${originalFile.name}</div>
            <div class="file-stats">
              Original: <strong>${originalImg.naturalWidth} × ${originalImg.naturalHeight} px</strong> • ${formatBytes(originalFile.size)}
            </div>
          </div>
        </div>
        <button id="btn-change-file" class="btn btn-secondary btn-sm">Choose another image</button>
      </div>

      <div class="tool-workspace">
        <!-- Preset Shortcuts -->
        <div style="margin-bottom: var(--space-5);">
          <label class="form-label" style="margin-bottom: 8px;">Quick Presets</label>
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
            <button type="button" class="btn btn-secondary btn-sm preset-btn" data-w="350" data-h="450">Passport Photo (350×450)</button>
            <button type="button" class="btn btn-secondary btn-sm preset-btn" data-w="140" data-h="60">Signature (140×60)</button>
            <button type="button" class="btn btn-secondary btn-sm preset-btn" data-w="600" data-h="600">Square / Visa (600×600)</button>
            <button type="button" class="btn btn-secondary btn-sm preset-btn" data-w="1280" data-h="720">HD 720p (1280×720)</button>
            <button type="button" class="btn btn-secondary btn-sm preset-btn" data-w="1920" data-h="1080">Full HD (1920×1080)</button>
          </div>
        </div>

        <!-- Scale Percent Shortcuts -->
        <div style="margin-bottom: var(--space-5);">
          <label class="form-label" style="margin-bottom: 8px;">Scale by Percentage</label>
          <div style="display: flex; gap: var(--space-2);">
            <button type="button" class="btn btn-secondary btn-sm percent-btn" data-scale="0.25">25%</button>
            <button type="button" class="btn btn-secondary btn-sm percent-btn" data-scale="0.5">50%</button>
            <button type="button" class="btn btn-secondary btn-sm percent-btn" data-scale="0.75">75%</button>
            <button type="button" class="btn btn-secondary btn-sm percent-btn" data-scale="1.0">100% (Original)</button>
            <button type="button" class="btn btn-secondary btn-sm percent-btn" data-scale="1.5">150%</button>
          </div>
        </div>

        <div class="controls-grid">
          <!-- Width input -->
          <div class="form-group">
            <label class="form-label" for="input-width">Target Width (Pixels)</label>
            <input type="number" id="input-width" class="input-text" value="${originalImg.naturalWidth}" min="1" max="10000" />
          </div>

          <!-- Height input -->
          <div class="form-group">
            <label class="form-label" for="input-height">Target Height (Pixels)</label>
            <input type="number" id="input-height" class="input-text" value="${originalImg.naturalHeight}" min="1" max="10000" />
          </div>

          <!-- Aspect Ratio Toggle -->
          <div class="form-group" style="grid-column: 1 / -1;">
            <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); font-weight: 500;">
              <input type="checkbox" id="check-aspect" checked style="width: 16px; height: 16px; accent-color: var(--accent);" />
              <span>Lock aspect ratio (prevents stretching or distortion)</span>
            </label>
          </div>

          <!-- Format & Quality -->
          <div class="form-group">
            <label class="form-label" for="select-format">Output Format</label>
            <select id="select-format" class="input-select">
              <option value="image/jpeg" selected>JPG / JPEG</option>
              <option value="image/png">PNG (Preserves transparent background)</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="slider-quality">
              <span>Quality</span>
              <span class="form-hint" id="badge-quality">90%</span>
            </label>
            <div class="slider-group">
              <input type="range" id="slider-quality" class="slider-input" min="10" max="100" value="90" step="5" />
            </div>
          </div>
        </div>

        <!-- Result Callout -->
        <div class="result-card" style="margin-bottom: var(--space-6);">
          <div class="result-comparison">
            <div class="result-stat-box">
              <span class="stat-label">Output Dimensions</span>
              <span class="stat-value" id="stat-output-dim">${originalImg.naturalWidth} × ${originalImg.naturalHeight} px</span>
            </div>
            <div style="color: var(--border-strong);">•</div>
            <div class="result-stat-box">
              <span class="stat-label">Estimated Size</span>
              <span class="stat-value" id="stat-estimated-size">Ready</span>
            </div>
          </div>

          <button id="btn-download" class="btn btn-primary btn-lg" style="width: 100%; max-width: 260px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Resized Image
          </button>
        </div>

        <!-- Live Preview Canvas -->
        <div class="preview-container transparency-grid">
          <canvas id="preview-canvas" class="preview-canvas"></canvas>
        </div>
      </div>
    `;

    // Elements
    const changeFileBtn = containerEl.querySelector('#btn-change-file');
    changeFileBtn.addEventListener('click', () => renderInitialView());

    const inputW = containerEl.querySelector('#input-width');
    const inputH = containerEl.querySelector('#input-height');
    const checkAspect = containerEl.querySelector('#check-aspect');
    const selectFormat = containerEl.querySelector('#select-format');
    const sliderQuality = containerEl.querySelector('#slider-quality');
    const badgeQuality = containerEl.querySelector('#badge-quality');
    const statOutputDim = containerEl.querySelector('#stat-output-dim');
    const statEstimatedSize = containerEl.querySelector('#stat-estimated-size');
    const previewCanvas = containerEl.querySelector('#preview-canvas');
    const btnDownload = containerEl.querySelector('#btn-download');

    checkAspect.addEventListener('change', (e) => {
      keepAspectRatio = e.target.checked;
    });

    inputW.addEventListener('input', () => {
      const w = parseInt(inputW.value, 10);
      if (keepAspectRatio && w && !isNaN(w)) {
        inputH.value = Math.max(1, Math.round(w / aspectRatio));
      }
      updatePreview();
    });

    inputH.addEventListener('input', () => {
      const h = parseInt(inputH.value, 10);
      if (keepAspectRatio && h && !isNaN(h)) {
        inputW.value = Math.max(1, Math.round(h * aspectRatio));
      }
      updatePreview();
    });

    sliderQuality.addEventListener('input', (e) => {
      badgeQuality.textContent = `${e.target.value}%`;
      updatePreview();
    });

    selectFormat.addEventListener('change', () => updatePreview());

    // Presets
    containerEl.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        checkAspect.checked = false;
        keepAspectRatio = false;
        inputW.value = btn.dataset.w;
        inputH.value = btn.dataset.h;
        updatePreview();
      });
    });

    // Percent scale
    containerEl.querySelectorAll('.percent-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const factor = parseFloat(btn.dataset.scale);
        inputW.value = Math.max(1, Math.round(originalImg.naturalWidth * factor));
        inputH.value = Math.max(1, Math.round(originalImg.naturalHeight * factor));
        updatePreview();
      });
    });

    function updatePreview() {
      const w = parseInt(inputW.value, 10) || originalImg.naturalWidth;
      const h = parseInt(inputH.value, 10) || originalImg.naturalHeight;

      statOutputDim.textContent = `${w} × ${h} px`;

      previewCanvas.width = w;
      previewCanvas.height = h;

      const ctx = previewCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const format = selectFormat.value;
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      ctx.drawImage(originalImg, 0, 0, w, h);

      const quality = parseInt(sliderQuality.value, 10) / 100;
      previewCanvas.toBlob((blob) => {
        if (blob) {
          statEstimatedSize.textContent = formatBytes(blob.size);
        }
      }, format, quality);
    }

    btnDownload.addEventListener('click', () => {
      const format = selectFormat.value;
      const quality = parseInt(sliderQuality.value, 10) / 100;
      const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
      const cleanName = originalFile.name.replace(/\.[^/.]+$/, '');
      const downloadName = `docvero-resized-${cleanName}.${ext}`;

      previewCanvas.toBlob((blob) => {
        if (!blob) {
          Toast.error('Could not generate resized image.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        Toast.success('Resized image downloaded.');
      }, format, quality);
    });

    updatePreview();
  }
}
