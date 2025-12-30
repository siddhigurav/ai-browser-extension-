<#
download-assets.ps1

Run this script from the repository root (PowerShell) to download the recommended
Tesseract.js and pdf.js browser bundles into the extension's libs folder.

Usage (PowerShell):
  cd <repo-root>
  .\extension\libs\download-assets.ps1

This will place files at:
  extension/libs/tesseract/tesseract.min.js
  extension/libs/pdfjs/pdf.min.js
  extension/libs/pdfjs/pdf.worker.min.js

Note: adjust versions/URLs in the script if you prefer other releases.
#>

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Downloading assets into $root..."

mkdir -Force tesseract | Out-Null
mkdir -Force pdfjs | Out-Null

$tesseractUrl = 'https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js'
$pdfJsUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js'
$pdfWorkerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'

function Download-File($url, $dest) {
  Write-Host "Downloading $url -> $dest"
  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -Verbose:$false
    Write-Host "Saved: $dest"
  } catch {
    Write-Warning "Failed to download $url : $_"
  }
}

Download-File $tesseractUrl (Join-Path $root 'tesseract/tesseract.min.js')
Download-File $pdfJsUrl (Join-Path $root 'pdfjs/pdf.min.js')
Download-File $pdfWorkerUrl (Join-Path $root 'pdfjs/pdf.worker.min.js')

Write-Host "Done. If downloads succeeded, reload the extension in Chrome and test OCR/PDF flows."
