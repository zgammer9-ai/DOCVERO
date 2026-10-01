/**
 * DOCVERO Dropzone Component
 * Robust file drag-and-drop handler with type validation and clear error messaging.
 */

import { Toast } from './toast.js';

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function createDropzone({
  containerEl,
  accept = '*',
  multiple = false,
  title = 'Drop your file here',
  subtitle = 'or choose from your device',
  formatPills = [],
  maxSizeBytes = 100 * 1024 * 1024, // 100 MB client-side safe default
  onFilesSelected
}) {
  const inputId = 'file-input-' + Math.random().toString(36).substring(2, 9);
  
  const pillsHtml = formatPills.length > 0 
    ? `<div class="dropzone-formats">
        ${formatPills.map(p => `<span class="dropzone-format-pill">${p}</span>`).join('')}
       </div>`
    : '';

  containerEl.innerHTML = `
    <div class="dropzone" id="dz-${inputId}" tabindex="0" role="button" aria-label="${title}">
      <input type="file" id="${inputId}" class="dropzone-input" ${multiple ? 'multiple' : ''} accept="${accept}" tabindex="-1" />
      <div class="dropzone-icon">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </div>
      <div class="dropzone-title">${title}</div>
      <div class="dropzone-subtitle">${subtitle}</div>
      <button type="button" class="btn btn-secondary btn-sm" style="pointer-events:none; margin-bottom: 8px;">Select ${multiple ? 'files' : 'file'}</button>
      ${pillsHtml}
    </div>
  `;

  const dropzoneEl = containerEl.querySelector(`#dz-${inputId}`);
  const inputEl = containerEl.querySelector(`#${inputId}`);

  function handleFiles(files) {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    const validFiles = [];
    for (const file of fileList) {
      if (file.size > maxSizeBytes) {
        Toast.error(`"${file.name}" is larger than ${formatBytes(maxSizeBytes)}. Please choose a smaller file.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0 && typeof onFilesSelected === 'function') {
      onFilesSelected(multiple ? validFiles : validFiles[0]);
    }
  }

  // Drag & drop listeners
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.remove('dragover');
    });
  });

  dropzoneEl.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  });

  inputEl.addEventListener('change', (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  });

  // Keyboard accessibility
  dropzoneEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputEl.click();
    }
  });

  return {
    reset() {
      inputEl.value = '';
    }
  };
}
