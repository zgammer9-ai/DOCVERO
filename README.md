# DOCVERO — Your Everyday File Toolkit

> **“Resize, compress, convert and manage your files — simply.”**

DOCVERO is a privacy-first, zero-cost, 100% client-side web application designed especially for **students, job applicants, and everyday users** who frequently need to prepare photos, signatures, certificates, and PDF documents for online government and college admission portals (such as UPSC, SSC, JEE, NEET, State PSCs, Bank PO, and Visa applications).

---

## Key Features & Production-Ready Tools (V1)

| Tool | Capability | How It Works |
| :--- | :--- | :--- |
| **Image Compressor** | Slider quality & strict Target KB mode (e.g. `<50 KB`, `<20 KB`) | Uses Canvas API with iterative binary search and dynamic downsampling so files never exceed strict portal limits |
| **Passport & Signature Resizer** | 1-Click exam presets: 3.5×4.5 cm (350×450 px), 140×60 px signature, paper whitening filter | Interactive crop, pan, ink darkener, and strict `<20 KB` / `<50 KB` bounds |
| **Image Resizer** | Exact pixel width & height, percentage scale (25%–200%), aspect-ratio lock | Bicubic downsampling and dimension adjustments in browser memory |
| **Image Converter** | JPG ↔ PNG ↔ WebP batch conversion | Automated pure-white matte behind transparent signatures + batch ZIP download |
| **JPG / Images to PDF** | Combines photos/certificates into a single A4 PDF | Built with `pdf-lib`, page reordering (↑/↓), orientation, margin controls |
| **PDF to JPG / PNG** | High-resolution image extraction from any PDF | Rendered via `PDF.js` at 150/200/300 DPI with single-page or full ZIP download |
| **PDF Merge** | Combines multiple PDF documents | Sequencing, page count summaries, and instant client-side collation via `pdf-lib` |
| **PDF Split & Rotate** | 90° page rotation, selective extraction, page deletion | Interactive visual thumbnail grid powered by `pdf-lib` and `PDF.js` |

---

## Zero-Cost & 100% Privacy Guarantee

* **₹0 Server Bills**: The entire application runs directly on the user's computer or mobile phone. There are no backend API calls, no AI token fees, and no file servers to maintain.
* **100% Private**: User documents and photos **never leave their device**. They are not uploaded, cached, or analyzed on any cloud server.
* **No Account Required**: Frictionless experience — open, drop file, download, leave.

---

## Architecture & Codebase Structure

```
docvero/
├── index.html                   # Semantic HTML5 entry point & SEO metadata
├── vercel.json                  # Vercel deployment routing & static caching headers
├── package.json                 # Project configuration & build scripts
├── .gitignore                   # Repository clean-state ignore rules
├── server.ps1                   # Zero-dependency local dev server (built-in Windows .NET)
├── README.md                    # Documentation & deployment guide
├── assets/                      # Official brand assets (logo-icon.svg, logo.svg, logo.png)
├── css/
│   ├── variables.css            # Design tokens & dark/light theme variables
│   ├── base.css                 # Base resets, typography, container grids
│   ├── components.css           # Header, footer, cards, dropzones, toasts, dialogs
│   └── tools.css                # Tool-specific canvases, comparison grids, croppers
└── js/
    ├── app.js                   # Client-side router, SEO title updater, app controller
    ├── ui/
    │   ├── theme.js             # Dark / Light mode manager with persistence
    │   ├── toast.js             # Accessible toast notifications
    │   ├── dropzone.js          # Drag-and-drop file handler with validation
    │   └── search.js            # Instant fuzzy search index & Ctrl+K command palette
    ├── tools/
    │   ├── image-compressor.js  # Quality slider & strict binary-search target KB engine
    │   ├── image-resizer.js     # Pixel precision resizer with presets
    │   ├── image-converter.js   # JPG/PNG/WebP converter with ZIP packager
    │   ├── jpg-to-pdf.js        # Multi-image A4 PDF builder (pdf-lib)
    │   ├── pdf-to-jpg.js        # PDF page renderer & image extractor (PDF.js)
    │   ├── pdf-merge.js         # Multi-document PDF merger (pdf-lib)
    │   ├── pdf-organizer.js     # Page rotation (90°), split & extraction
    │   └── form-photo-resizer.js# Portal photo & signature cropper with paper whitener
    └── vendor/
        ├── pdf-lib.min.js       # Local pure-JS PDF generation/merge library
        ├── pdf.min.js           # Local PDF.js rendering library
        ├── pdf.worker.min.js    # Local PDF.js worker
        └── jszip.min.js         # Local client-side ZIP packaging library
```

---

## Step-by-Step: Deploying via GitHub to Vercel

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new) and log in.
2. Name your repository (e.g. `docvero`).
3. Set visibility to **Public** (or Private).
4. Click **Create repository**.

### Step 2: Add Files to GitHub
* **Method A (Web Browser - No Git CLI needed)**:
  1. On your newly created GitHub repository page, click **uploading an existing file**.
  2. Drag and drop all files and folders from `C:\Users\user\.gemini\antigravity\scratch\docvero`.
  3. Click **Commit changes**.
* **Method B (Git Terminal)**:
  ```bash
  cd docvero
  git init
  git add .
  git commit -m "Initial DOCVERO release"
  git branch -M main
  git remote add origin https://github.com/<your-username>/docvero.git
  git push -u origin main
  ```

### Step 3: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New... > Project**.
3. Select your `docvero` repository and click **Import**.
4. Framework Preset: **Other** (it will automatically detect the static project with `vercel.json`).
5. Click **Deploy**.
6. In ~15 seconds, your site is live with a free SSL domain (e.g. `docvero.vercel.app`)!

---

## Local Development
Run the built-in Windows PowerShell server:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
Or with Node:
```bash
npx serve .
```
