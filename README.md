# PDFLeo

**Free, browser-based PDF and document utilities.**

- Website: https://pdfleo.online/
- Repository: https://github.com/Mureedabbas1/PDFLeo
- Hosting: GitHub Pages with the custom domain `pdfleo.online`

PDFLeo is a static website built with HTML, CSS and vanilla JavaScript. Supported tools process documents in the browser where possible. An internet connection is required to load third-party libraries and to use the Translate PDF feature, which sends extracted selectable text to the MyMemory translation API.

## Tool catalogue and limitations

The homepage lists 34 PDF/document tools. Availability does not mean every tool preserves the source document's layout or features. Check the description shown in the tool and inspect downloaded output before relying on it.

- **Basic PDF operations:** merge, split, extract, organize, rotate and remove pages.
- **Images and rendering:** images/JPG to PDF, scan photos to PDF, PDF to JPG and PDF to PowerPoint (page images).
- **Optimization and recovery:** compress, optimize and basic repair attempts. Compression/optimization may rasterize pages or change quality; repair cannot recover every damaged file.
- **Text and conversion:** OCR, PDF to Word/Excel/Markdown, PDF summarizer, compare PDFs, and Office/HTML/text conversions. Many conversions extract text or create a simplified output rather than preserve original formatting.
- **Page edits:** add page numbers, watermark, crop pages, add text, and add a typed signature mark. These are basic stamping/editing operations, not full-featured editors or cryptographic digital signatures.
- **PDF forms:** fills supported existing text fields, checkboxes and choice fields; it does not create new fields.
- **PDF/A:** uses Ghostscript WebAssembly to prepare an archival conversion. A successful conversion is not proof of PDF/A compliance; validate with a dedicated independent validator before regulated archiving.
- **Protect PDF:** creates a password-encrypted, rasterized PDF. Selectable text, links and interactive content are not preserved.
- **Unlock PDF:** requires the correct password and rebuilds pages as images in an unencrypted PDF. Selectable text, links, forms and metadata are not preserved.
- **Redact PDF:** rasterizes pages and covers a specified rectangle on one page. It is not a certified specialist redaction workflow; inspect the complete output carefully and use a verified specialist tool for high-risk/legal documents.
- **Translate PDF text:** sends extracted selectable text to the third-party MyMemory translation service and downloads translated text as TXT. It does not preserve the original PDF layout or images. Do not use it for confidential or sensitive documents unless you accept the provider's data terms.

The interface may use a “Ready” label for an available operation; it does not guarantee lossless conversion, compliance certification or success with every file. Beta or file-dependent results must be reviewed before use.

## Technology

- HTML, CSS and vanilla JavaScript
- pdf-lib for PDF manipulation
- PDF.js for selected PDF rendering and text extraction workflows
- Tesseract.js for OCR where available
- Ghostscript WebAssembly for selected compression/optimization/PDF-A workflows
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

- Do not use the translation feature for confidential, personal, medical, financial or otherwise sensitive text unless you are comfortable sending extracted text to MyMemory under its terms.
- For browser-local tools, the selected file is intended to be processed in the browser; third-party libraries are loaded from external CDNs.
- Rasterized outputs can lose text search, accessibility, links, forms, metadata and other document features.
- Redaction is not certified specialist redaction. Use a verified specialist workflow for high-risk or regulated material.
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
- [Privacy Policy](https://pdfleo.online/privacy.html)
- [Terms of Use](https://pdfleo.online/terms.html)
- [Security](https://pdfleo.online/security.html)

## Brand

White, silver and electric blue with a clean, modern, mobile-friendly interface. The lion-inspired mark is in `logo.svg`.

## Supabase security maintenance

The production database security hardening recorded in [supabase-security-fixes.sql](./supabase-security-fixes.sql) moves the saved-PDF quota helper out of the exposed `public` schema, updates profile RLS policies to cache `auth.uid()`, and adds an index for the saved-PDF account query. This SQL was applied to the connected PDFLeo Supabase project on 2026-10-10 and is kept in the repository for reproducibility. The Supabase security advisor still reports **Leaked Password Protection Disabled**; enable it in Supabase Dashboard → Authentication → Settings → Password Security.

## Verification notes

Repository checks and successful commits do not replace live testing with representative sample files. Test each important tool with several PDFs and verify the downloaded file, especially for password protection/unlocking, redaction, PDF/A, OCR and conversions. Also test DNS/HTTPS, account flows and email delivery separately.
