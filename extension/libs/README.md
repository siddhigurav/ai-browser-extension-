Local libs for OCR and PDF extraction
====================================

This folder holds optional large libraries used for client-side OCR and PDF parsing.

Files expected:

- `tesseract/tesseract.min.js` — Tesseract.js browser bundle (if you want client-side OCR)
- `pdfjs/pdf.min.js` — pdf.js build
- `pdfjs/pdf.worker.min.js` — pdf.js worker

To fetch these automatically, run the included PowerShell script from the repo root:

  cd <repo-root> ; .\extension\libs\download-assets.ps1

If you prefer to fetch manually, download the files from the official cdn or releases and place them into the paths above.

After the files are present, reload the extension in chrome://extensions and test OCR/PDF features.
