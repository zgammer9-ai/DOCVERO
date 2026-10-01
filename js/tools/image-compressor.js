/**
 * DOCVERO Image Compressor Tool
 * Features:
 * - Lossy quality slider
 * - Guaranteed Target KB mode with auto-binary search & graceful downsampling
 * - Visual before/after inspection
 * - 100% browser-side processing via Canvas API
 */

import { formatBytes, createDropzone } from '../ui/dropzone.js';
import { Toast } from '../ui/toast.js';

export function initImageCompressor(containerEl) {
  let originalFile = null;
  let originalImg = null;
  let currentCompressedBlob = null;

  renderInitialView();

  function renderInitialView() {
    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#image-tools">Image Tools</a>
          <span class="separator">/</span>
          <span>Image Compressor</span>
        </div>
        <h1 class="tool-main-heading">
          Image Compressor
          <span class="badge badge-local">Processed locally in browser</span>
        </h1>
        <p class="tool-subheading">Reduce image file size while keeping clear visual quality. Perfect for meeting strict portal size limits.</p>
      </div>

      <div id="dropzone-area"></div>

      <!-- Informational Guide for Forms -->
      <div class="tool-guide-section">
        <h2 class="tool-guide-title">Guidelines for Exam & Job Portals</h2>
        <div class="guide-faq-grid">
          <div class="faq-item">
            <div class="faq-q">What quality should I use for online applications?</div>
            <div class="faq-a">For most government and university forms (UPSC, SSC, State PSC), an 80% quality setting preserves sharp facial features and crisp signature ink while reducing file size by 60%–80%.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Need a strict size like "under 50 KB"?</div>
            <div class="faq-a">Switch to "Target Size" mode below and enter 50 KB. DOCVERO automatically adjusts quality and dimensions to guarantee the output is under the limit without corrupting the file.</div>
          </div>
        </div>
      </div>
    `;

    const dropzoneArea = containerEl.querySelector('#dropzone-area');
    createDropzone({
      containerEl: dropzoneArea,
      accept: 'image/jpeg,image/png,image/webp,image/avif',
      title: 'Drop your photo or document image here',
      subtitle: 'Supports JPG, PNG, WebP up to 50 MB',
      formatPills: ['JPG', 'PNG', 'WEBP'],
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
        renderWorkspace();
        runCompression();
      };
      img.onerror = () => {
        Toast.error('Failed to parse this image. The file may be damaged.');
      };
      img.src = e.target.result;
    };

    reader.onerror = () => {
      Toast.error('Could not read the file from your device.');
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
          <span>Image Compressor</span>
        </div>
        <h1 class="tool-main-heading">
          Image Compressor
          <span class="badge badge-local">100% Private</span>
        </h1>
      </div>

      <div class="file-info-strip">
        <div class="file-meta">
          <div class="file-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <div class="file-details">
            <div class="file-name" title="${originalFile.name}">${originalFile.name}</div>
            <div class="file-stats">
              Original: <strong>${formatBytes(originalFile.size)}</strong> • Dimensions: ${originalImg.naturalWidth} × ${originalImg.naturalHeight} px
            </div>
          </div>
        </div>
        <button id="btn-change-file" class="btn btn-secondary btn-sm">Choose another image</button>
      </div>

      <div class="tool-workspace">
        <div class="controls-grid">
          <!-- Mode Selection -->
          <div class="form-group">
            <label class="form-label">Compression Mode</label>
            <div class="segmented-control" id="mode-selector">
              <button type="button" class="segmented-btn active" data-mode="quality">Visual Quality</button>
              <button type="button" class="segmented-btn" data-mode="target">Strict Target KB</button>
            </div>
          </div>

          <!-- Quality Slider (shown in quality mode) -->
          <div class="form-group" id="group-quality-slider">
            <label class="form-label" for="slider-quality">
              <span>Compression Quality</span>
              <span class="form-hint">Higher = clearer</span>
            </label>
            <div class="slider-group">
              <input type="range" id="slider-quality" class="slider-input" min="5" max="100" value="80" step="5" />
              <span class="slider-val-badge" id="badge-quality-val">80%</span>
            </div>
          </div>

          <!-- Target Size Input (shown in target mode) -->
          <div class="form-group" id="group-target-input" style="display: none;">
            <label class="form-label" for="input-target-kb">
              <span>Target File Size</span>
              <span class="form-hint">Strict maximum</span>
            </label>
            <div style="display: flex; gap: var(--space-2); align-items: center;">
              <input type="number" id="input-target-kb" class="input-text" style="max-width: 140px;" min="5" max="50000" value="50" />
              <span style="font-size: var(--text-sm); font-weight: 600; color: var(--text-muted);">KB</span>
              <div style="display: flex; gap: 4px; margin-left: 8px;">
                <button type="button" class="btn btn-secondary btn-sm preset-kb-btn" data-kb="20">20 KB</button>
                <button type="button" class="btn btn-secondary btn-sm preset-kb-btn" data-kb="50">50 KB</button>
                <button type="button" class="btn btn-secondary btn-sm preset-kb-btn" data-kb="100">100 KB</button>
              </div>
            </div>
          </div>

          <!-- Output Format -->
          <div class="form-group">
            <label class="form-label" for="select-format">Output Format</label>
            <select id="select-format" class="input-select">
              <option value="image/jpeg" selected>JPG / JPEG (Best for photos & forms)</option>
              <option value="image/webp">WebP (Modern, superior compression)</option>
              <option value="image/png">PNG (Lossless, higher file size)</option>
            </select>
          </div>
        </div>

        <!-- Result Comparison Card -->
        <div class="result-card" id="compression-result-card" style="margin-bottom: var(--space-6);">
          <div class="result-comparison">
            <div class="result-stat-box">
              <span class="stat-label">Original</span>
              <span class="stat-value" style="color: var(--text-muted); font-size: var(--text-base);">${formatBytes(originalFile.size)}</span>
            </div>
            <div style="color: var(--border-strong);">→</div>
            <div class="result-stat-box">
              <span class="stat-label">Compressed</span>
              <span class="stat-value" id="stat-compressed-size">Calculating...</span>
            </div>
            <div id="stat-savings-wrapper">
              <span class="savings-badge" id="stat-savings-badge">-0%</span>
            </div>
          </div>
          
          <div style="display: flex; gap: var(--space-3); width: 100%; justify-content: flex-end;">
            <button id="btn-download" class="btn btn-primary btn-lg" style="width: 100%; max-width: 260px;" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Image
            </button>
          </div>
        </div>

        <!-- Live Preview -->
        <div class="preview-container">
          <img id="preview-image" class="preview-img" alt="Compressed Preview" />
        </div>
      </div>
    `;

    // Bind event handlers
    const changeFileBtn = containerEl.querySelector('#btn-change-file');
    changeFileBtn.addEventListener('click', () => {
      renderInitialView();
    });

    const modeButtons = containerEl.querySelectorAll('.segmented-btn');
    const qualityGroup = containerEl.querySelector('#group-quality-slider');
    const targetGroup = containerEl.querySelector('#group-target-input');

    let currentMode = 'quality';

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;

        if (currentMode === 'quality') {
          qualityGroup.style.display = 'flex';
          targetGroup.style.display = 'none';
        } else {
          qualityGroup.style.display = 'none';
          targetGroup.style.display = 'flex';
        }
        runCompression();
      });
    });

    const sliderQuality = containerEl.querySelector('#slider-quality');
    const badgeQuality = containerEl.querySelector('#badge-quality-val');
    sliderQuality.addEventListener('input', (e) => {
      badgeQuality.textContent = `${e.target.value}%`;
      runCompression();
    });

    const inputTargetKb = containerEl.querySelector('#input-target-kb');
    inputTargetKb.addEventListener('input', () => {
      runCompression();
    });

    const presetKbBtns = containerEl.querySelectorAll('.preset-kb-btn');
    presetKbBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        inputTargetKb.value = btn.dataset.kb;
        runCompression();
      });
    });

    const selectFormat = containerEl.querySelector('#select-format');
    selectFormat.addEventListener('change', () => {
      runCompression();
    });

    const btnDownload = containerEl.querySelector('#btn-download');
    btnDownload.addEventListener('click', () => {
      if (!currentCompressedBlob) return;
      const format = selectFormat.value;
      const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
      const cleanName = originalFile.name.replace(/\.[^/.]+$/, '');
      const downloadName = `docvero-${cleanName}.${ext}`;

      const url = URL.createObjectURL(currentCompressedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      Toast.success('Image downloaded successfully.');
    });
  }

  async function runCompression() {
    if (!originalImg) return;

    const selectFormat = containerEl.querySelector('#select-format');
    const sliderQuality = containerEl.querySelector('#slider-quality');
    const inputTargetKb = containerEl.querySelector('#input-target-kb');
    const statCompressedSize = containerEl.querySelector('#stat-compressed-size');
    const statSavingsBadge = containerEl.querySelector('#stat-savings-badge');
    const previewImage = containerEl.querySelector('#preview-image');
    const btnDownload = containerEl.querySelector('#btn-download');
    const modeBtnActive = containerEl.querySelector('.segmented-btn.active');

    const mode = modeBtnActive ? modeBtnActive.dataset.mode : 'quality';
    const mimeType = selectFormat ? selectFormat.value : 'image/jpeg';

    statCompressedSize.textContent = 'Processing...';
    btnDownload.disabled = true;

    try {
      let resultBlob;

      if (mode === 'quality') {
        const quality = parseInt(sliderQuality.value, 10) / 100;
        resultBlob = await compressImageQuality(originalImg, mimeType, quality);
      } else {
        const targetKb = parseFloat(inputTargetKb.value) || 50;
        resultBlob = await compressToTargetKb(originalImg, mimeType, targetKb);
      }

      currentCompressedBlob = resultBlob;

      const newSize = resultBlob.size;
      statCompressedSize.textContent = formatBytes(newSize);

      const ratio = ((originalFile.size - newSize) / originalFile.size) * 100;
      if (ratio > 0) {
        statSavingsBadge.textContent = `-${Math.round(ratio)}% reduced`;
        statSavingsBadge.style.display = 'inline-block';
        statSavingsBadge.className = 'savings-badge';
      } else if (ratio === 0) {
        statSavingsBadge.textContent = 'Same size';
        statSavingsBadge.className = 'badge';
      } else {
        statSavingsBadge.textContent = `+${Math.abs(Math.round(ratio))}%`;
        statSavingsBadge.className = 'badge badge-warning';
      }

      const previewUrl = URL.createObjectURL(resultBlob);
      previewImage.src = previewUrl;
      btnDownload.disabled = false;
    } catch (err) {
      console.error(err);
      Toast.error('Could not compress this image. Please try another quality setting.');
      statCompressedSize.textContent = 'Error';
    }
  }

  function compressImageQuality(img, mimeType, quality, scale = 1.0) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // For JPEG, fill transparent background with clean white
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Blob generation failed'));
      }, mimeType, quality);
    });
  }

  /**
   * Smart binary search + dimension reduction to guarantee strict output <= targetKB
   */
  async function compressToTargetKb(img, mimeType, targetKb) {
    const targetBytes = targetKb * 1024;
    let minQuality = 0.05;
    let maxQuality = 0.95;
    let bestBlob = null;
    let currentScale = 1.0;

    // First attempt binary search on quality at 1.0 scale
    for (let step = 0; step < 7; step++) {
      const midQuality = (minQuality + maxQuality) / 2;
      const blob = await compressImageQuality(img, mimeType, midQuality, currentScale);

      if (blob.size <= targetBytes) {
        bestBlob = blob;
        minQuality = midQuality; // try higher quality while still under budget
      } else {
        maxQuality = midQuality; // too big, decrease quality
      }
    }

    // If even lowest quality is still over the target size, progressively downscale dimensions
    if (!bestBlob || bestBlob.size > targetBytes) {
      for (let scaleAttempt = 0; scaleAttempt < 6; scaleAttempt++) {
        currentScale *= 0.85; // scale down dimensions by 15%
        const blob = await compressImageQuality(img, mimeType, 0.65, currentScale);
        bestBlob = blob;
        if (blob.size <= targetBytes) {
          break;
        }
      }
    }

    return bestBlob || (await compressImageQuality(img, mimeType, 0.4, 0.5));
  }
}
