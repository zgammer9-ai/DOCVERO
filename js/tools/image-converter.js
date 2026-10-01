/**
 * DOCVERO Image Format Converter Tool
 * Supports JPG ↔ PNG ↔ WebP batch conversion with transparency preservation
 * and ZIP download.
 */

import { formatBytes, createDropzone } from '../ui/dropzone.js';
import { Toast } from '../ui/toast.js';

export function initImageConverter(containerEl) {
  let fileList = [];
  let convertedBlobs = [];

  renderInitialView();

  function renderInitialView() {
    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#image-tools">Image Tools</a>
          <span class="separator">/</span>
          <span>Image Format Converter</span>
        </div>
        <h1 class="tool-main-heading">
          Image Format Converter
          <span class="badge badge-local">Processed locally in browser</span>
        </h1>
        <p class="tool-subheading">Convert between JPG, PNG, and WebP formats instantly without sending your files across the internet.</p>
      </div>

      <div id="dropzone-area"></div>

      <div class="tool-guide-section">
        <h2 class="tool-guide-title">Why format conversion matters for applications</h2>
        <div class="guide-faq-grid">
          <div class="faq-item">
            <div class="faq-q">Why do portals reject PNG photos?</div>
            <div class="faq-a">Most job and admission portals (UPSC, SSC, State Gov) strictly require JPG/JPEG format and do not accept PNG. DOCVERO converts your PNG into a clean JPG with a crisp white background.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Does converting PNG to JPG produce a black background?</div>
            <div class="faq-a">No. Standard simple tools often convert transparent pixels to black. DOCVERO automatically applies an intelligent pure-white matte background behind transparent signatures and logos.</div>
          </div>
        </div>
      </div>
    `;

    const dropzoneArea = containerEl.querySelector('#dropzone-area');
    createDropzone({
      containerEl: dropzoneArea,
      accept: 'image/jpeg,image/png,image/webp,image/avif',
      multiple: true,
      title: 'Drop images here to convert format',
      subtitle: 'Upload single or multiple JPG, PNG, WebP files',
      formatPills: ['JPG to PNG', 'PNG to JPG', 'WebP Conversion'],
      onFilesSelected: (files) => {
        fileList = Array.isArray(files) ? files : [files];
        renderWorkspace();
      }
    });
  }

  function renderWorkspace() {
    containerEl.innerHTML = `
      <div class="tool-header-section">
        <div class="breadcrumbs">
          <a href="#">Home</a>
          <span class="separator">/</span>
          <a href="#image-tools">Image Tools</a>
          <span class="separator">/</span>
          <span>Image Format Converter</span>
        </div>
        <h1 class="tool-main-heading">
          Convert Images (${fileList.length} ${fileList.length === 1 ? 'file' : 'files'})
          <span class="badge badge-local">100% Private</span>
        </h1>
      </div>

      <div class="file-info-strip">
        <div class="file-meta">
          <div class="file-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
          </div>
          <div class="file-details">
            <div class="file-name">${fileList.length} ${fileList.length === 1 ? 'image' : 'images'} selected</div>
            <div class="file-stats">Total size: ${formatBytes(fileList.reduce((acc, f) => acc + f.size, 0))}</div>
          </div>
        </div>
        <button id="btn-change-file" class="btn btn-secondary btn-sm">Add / change files</button>
      </div>

      <div class="tool-workspace">
        <div class="controls-grid" style="margin-bottom: var(--space-6);">
          <div class="form-group">
            <label class="form-label" for="select-target-format">Target Format</label>
            <select id="select-target-format" class="input-select">
              <option value="image/jpeg">JPG / JPEG (Standard for all online forms)</option>
              <option value="image/png">PNG (Preserves transparent background)</option>
              <option value="image/webp">WebP (Modern lightweight web format)</option>
            </select>
          </div>

          <div class="form-group" id="group-quality">
            <label class="form-label" for="slider-quality">
              <span>Quality</span>
              <span class="form-hint" id="badge-quality">92%</span>
            </label>
            <div class="slider-group">
              <input type="range" id="slider-quality" class="slider-input" min="20" max="100" value="92" step="4" />
            </div>
          </div>
        </div>

        <div style="display: flex; gap: var(--space-3); margin-bottom: var(--space-6);">
          <button id="btn-convert-all" class="btn btn-primary btn-lg">
            Convert All Images
          </button>
          <button id="btn-download-zip" class="btn btn-secondary btn-lg" style="display: none;">
            Download All as ZIP (.zip)
          </button>
        </div>

        <!-- Converted Files Queue -->
        <div class="file-queue-list" id="conversion-queue">
          <!-- Queue items inserted dynamically -->
        </div>
      </div>
    `;

    const changeFileBtn = containerEl.querySelector('#btn-change-file');
    changeFileBtn.addEventListener('click', () => renderInitialView());

    const selectTargetFormat = containerEl.querySelector('#select-target-format');
    const groupQuality = containerEl.querySelector('#group-quality');
    const sliderQuality = containerEl.querySelector('#slider-quality');
    const badgeQuality = containerEl.querySelector('#badge-quality');
    const btnConvertAll = containerEl.querySelector('#btn-convert-all');
    const btnDownloadZip = containerEl.querySelector('#btn-download-zip');
    const queueContainer = containerEl.querySelector('#conversion-queue');

    selectTargetFormat.addEventListener('change', () => {
      if (selectTargetFormat.value === 'image/png') {
        groupQuality.style.opacity = '0.4';
        groupQuality.style.pointerEvents = 'none';
      } else {
        groupQuality.style.opacity = '1';
        groupQuality.style.pointerEvents = 'auto';
      }
    });

    sliderQuality.addEventListener('input', (e) => {
      badgeQuality.textContent = `${e.target.value}%`;
    });

    renderQueueItems();

    function renderQueueItems() {
      queueContainer.innerHTML = fileList.map((file, idx) => `
        <div class="file-queue-item" id="item-${idx}">
          <div class="queue-item-meta">
            <div class="queue-index-badge">${idx + 1}</div>
            <div class="queue-info">
              <div class="queue-filename">${file.name}</div>
              <div class="queue-size">${formatBytes(file.size)} • ${file.type || 'image'}</div>
            </div>
          </div>
          <div class="queue-actions" id="status-${idx}">
            <span class="badge">Ready to convert</span>
          </div>
        </div>
      `).join('');
    }

    btnConvertAll.addEventListener('click', async () => {
      btnConvertAll.disabled = true;
      btnConvertAll.textContent = 'Converting...';
      convertedBlobs = [];

      const targetFormat = selectTargetFormat.value;
      const quality = parseInt(sliderQuality.value, 10) / 100;
      const targetExt = targetFormat === 'image/webp' ? 'webp' : targetFormat === 'image/png' ? 'png' : 'jpg';

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const statusEl = containerEl.querySelector(`#status-${i}`);
        if (statusEl) statusEl.innerHTML = `<span class="badge badge-warning">Processing...</span>`;

        try {
          const blob = await convertSingleFile(file, targetFormat, quality);
          convertedBlobs.push({
            name: `${file.name.replace(/\.[^/.]+$/, '')}.${targetExt}`,
            blob
          });

          if (statusEl) {
            statusEl.innerHTML = `
              <span class="badge badge-local">${formatBytes(blob.size)}</span>
              <button type="button" class="btn btn-secondary btn-sm single-dl-btn" data-index="${i}">Download</button>
            `;
            const dlBtn = statusEl.querySelector('.single-dl-btn');
            dlBtn.addEventListener('click', () => {
              downloadBlob(blob, `${file.name.replace(/\.[^/.]+$/, '')}.${targetExt}`);
            });
          }
        } catch (err) {
          console.error(err);
          if (statusEl) statusEl.innerHTML = `<span class="badge" style="color:var(--error); border-color:var(--error-border);">Failed</span>`;
        }
      }

      btnConvertAll.disabled = false;
      btnConvertAll.textContent = 'Re-convert All';

      if (convertedBlobs.length > 1) {
        btnDownloadZip.style.display = 'inline-flex';
        btnDownloadZip.onclick = () => downloadZip();
      }

      Toast.success(`Converted ${convertedBlobs.length} ${convertedBlobs.length === 1 ? 'file' : 'files'}.`);
    });

    async function downloadZip() {
      if (typeof window.JSZip === 'undefined') {
        Toast.error('ZIP packaging utility not loaded.');
        return;
      }

      const zip = new window.JSZip();
      convertedBlobs.forEach(item => {
        zip.file(item.name, item.blob);
      });

      Toast.info('Packaging ZIP file...');
      const zipContent = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipContent, 'docvero-converted-images.zip');
    }
  }

  function convertSingleFile(file, targetMime, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          const ctx = canvas.getContext('2d');
          if (targetMime === 'image/jpeg') {
            // White matte behind transparent pixels
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas blob conversion failed'));
          }, targetMime, quality);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
