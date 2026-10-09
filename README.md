# PDFLeo

**Free, simple PDF tools — built for the browser.**

🌐 Website: [https://pdfleo.online](https://pdfleo.online)

PDFLeo is a lightweight, mobile-friendly website for everyday PDF tasks. Its current tools run in the visitor's browser using [pdf-lib](https://pdf-lib.js.org/).

## Available tools

- **Merge PDF** — combine multiple PDF files in selection order.
- **Images to PDF** — turn JPG and PNG images into a PDF.
- **Rotate PDF** — rotate PDF pages by 90°, 180°, or 270°.
- **Extract PDF pages** — save selected page numbers or ranges, such as `1-3,5`.

## Technology

- HTML, CSS, and vanilla JavaScript
- [pdf-lib 1.17.1](https://pdf-lib.js.org/) loaded from jsDelivr
- GitHub Pages hosting
- Custom domain: `pdfleo.online`

## Run locally

Open `index.html` in a modern browser with an internet connection. The PDF library is loaded from a CDN.

## Publish with GitHub Pages

1. Open **Settings → Pages** in the repository.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose branch `main` and folder `/(root)`, then save.
4. Set the custom domain to `pdfleo.online` and enable HTTPS when the option becomes available.
5. Confirm the domain's DNS records point to GitHub Pages.

The repository includes a `CNAME` file for the custom domain. DNS propagation and HTTPS provisioning may take time.

## Privacy and limitations

Selected documents are processed in the browser and are not intentionally uploaded to a PDFLeo application server. The site loads its PDF library from a third-party CDN, so an internet connection is needed. Keep a backup of important files and review the output before relying on it.

Privacy and Terms pages are included. Before adding analytics, ads, or AdSense, update the privacy policy and implement any required consent and disclosures.

## Brand

White, silver, and electric blue; modern, clean, and mobile-first. The lion-inspired mark is in `logo.svg`.
