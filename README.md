# PDFLeo

**Free, browser-based PDF and document utilities.**

- Website: https://pdfleo.online/
- Repository: https://github.com/Mureedabbas1/PDFLeo
- Hosting: GitHub Pages with the custom domain `pdfleo.online`

PDFLeo is a static website built with HTML, CSS and vanilla JavaScript. PDF work that is supported by the current browser build is intended to run locally in the user's browser. The website loads third-party libraries from CDNs, so an internet connection is required.

## Tool catalogue

The homepage currently lists 34 tools. Status labels are intentional: **Ready** identifies the basic tools marked ready in the interface; **Browser beta** means the feature is experimental and its output must be checked; **Needs specialist engine** means the operation is not implemented in this browser build; **Not enabled** means the feature is deliberately disabled.

### Ready
- Merge PDF
- Extract Pages
- Organize PDF
- JPG to PDF
- Rotate PDF

### Browser beta
- Split PDF
- Compress PDF
- Remove Pages
- Scan to PDF
- Optimize PDF
- Repair PDF
- OCR PDF
- Word to PDF
- PowerPoint to PDF
- Excel to PDF
- HTML to PDF
- PDF to JPG
- PDF to Word
- PDF to PowerPoint
- PDF to Excel
- Add Page Numbers
- Add Watermark
- Crop PDF
- Edit PDF
- PDF Forms
- Sign PDF
- Compare PDF
- PDF Summarizer
- PDF to Markdown

### Requires an additional engine / not enabled
- PDF to PDF/A — true PDF/A conversion and validation are not included.
- Unlock PDF — password removal is not included.
- Protect PDF — PDF password encryption is not included.
- Translate PDF — translation engine is not included.
- Redact PDF — deliberately disabled because drawing a black box over text is not secure redaction.

Do not describe a beta or specialist-engine tool as fully supported until it has been tested with representative files and its limitations are clear. Always verify output documents before relying on them.

## Technology
- HTML, CSS and vanilla JavaScript
- pdf-lib for PDF manipulation
- PDF.js for selected PDF rendering workflows
- Tesseract.js for OCR where available
- Supabase Auth and optional tool-usage recording (requires correct project/database configuration)
- GitHub Pages and custom domain

## Run locally
Open `index.html` in a modern browser with an internet connection. Some browser security rules may limit features when opened directly from the filesystem; use a local static server for a closer match to deployment.

## Deploy with GitHub Pages
1. Open **Settings → Pages** in the repository.
2. Select **Deploy from a branch**.
3. Choose branch `main` and folder `/(root)`.
4. Set the custom domain to `pdfleo.online`.
5. Confirm DNS and enable **Enforce HTTPS** when GitHub Pages makes it available.
6. Verify the live homepage, custom-domain certificate, redirects and all important pages after deployment.

The repository includes a `CNAME` file. A successful GitHub commit does not by itself prove that DNS, HTTPS, or the deployed site is working; verify those separately.

## File-size guidance
The homepage applies a 25 MB per-file and 60 MB total-selection limit to help avoid excessive browser memory use. Large scans, OCR and image-heavy PDFs can still be slow or fail depending on device memory and browser capability. Process smaller batches when necessary.

## Privacy and security
- Do not upload highly sensitive files to any service unless you understand the processing behavior of that particular feature.
- Browser-local processing is the intended design for supported tools; third-party libraries are loaded from external CDNs.
- Redaction is disabled until secure removal of underlying text and relevant content can be provided.
- Never put Supabase service-role keys or other private credentials in public client-side code.
- Supabase email confirmation and password recovery require correct Auth URL settings and SMTP/domain configuration. Test email delivery end to end before relying on it.
- Keep the Privacy Policy and Terms accurate as features, analytics, advertising or server processing change.

## Main pages
- [Home and tools](https://pdfleo.online/)
- [About](https://pdfleo.online/about.html)
- [FAQ](https://pdfleo.online/faq.html)
- [Guides](https://pdfleo.online/guides.html)
- [Blog](https://pdfleo.online/blog.html)
- [Workflows](https://pdfleo.online/workflows.html)
- [Pricing](https://pdfleo.online/pricing.html)
- [Privacy Policy](https://pdfleo.online/privacy.html)
- [Terms of Use](https://pdfleo.online/terms.html)
- [Security](https://pdfleo.online/security.html)

## Brand
White, silver and electric blue with a clean, modern, mobile-friendly interface. The lion-inspired mark is in `logo.svg`.
