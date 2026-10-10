import { chromium } from 'playwright';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph } from 'docx';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = '/tmp/pdfleo-smoke';
await fs.mkdir(tmp, { recursive: true });

async function makePdf(name, pages = ['PDFLeo sample page one', 'PDFLeo sample page two']) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const [i, text] of pages.entries()) {
    const p = pdf.addPage([595, 842]);
    p.drawText(text, { x: 50, y: 760, size: 18, font });
    p.drawText('Fixture page ' + (i + 1), { x: 50, y: 725, size: 12, font });
  }
  await fs.writeFile(path.join(tmp, name), await pdf.save());
}
await makePdf('sample.pdf');
await makePdf('sample2.pdf', ['PDFLeo different page', 'A changed second page']);
const formPdf = await PDFDocument.create();
const formPage = formPdf.addPage([595, 842]);
formPage.drawText('Form test', { x: 50, y: 780, size: 18, font: await formPdf.embedFont(StandardFonts.Helvetica) });
const form = formPdf.getForm();
const testField = form.createTextField('test_name');
testField.addToPage(formPage, { x: 50, y: 700, width: 220, height: 28 });
form.updateFieldAppearances();
await fs.writeFile(path.join(tmp, 'form.pdf'), await formPdf.save());
const formCheck = await PDFDocument.load(await fs.readFile(path.join(tmp, 'form.pdf')));
if (formCheck.getForm().getFields().length !== 1) throw new Error('Form fixture did not retain its interactive field.');
await fs.writeFile(path.join(tmp, 'sample.txt'), 'PDFLeo Word conversion test. This text should appear in the output PDF.');
await fs.writeFile(path.join(tmp, 'sample.html'), '<html><body><h1>PDFLeo HTML test</h1><p>HTML to PDF sample.</p></body></html>');
const docx = new Document({ sections: [{ children: [new Paragraph('PDFLeo DOCX conversion test')] }] });
await fs.writeFile(path.join(tmp, 'sample.docx'), await Packer.toBuffer(docx));
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Name','Value'],['PDFLeo',123]]), 'Test');
XLSX.writeFile(wb, path.join(tmp, 'sample.xlsx'));
const pptxZip = new JSZip();
pptxZip.file('ppt/slides/slide1.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>PDFLeo PowerPoint test</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>');
await fs.writeFile(path.join(tmp, 'sample.pptx'), await pptxZip.generateAsync({ type: 'nodebuffer' }));
// A tiny valid PNG fixture used to exercise image-to-PDF tools.
await fs.writeFile(path.join(tmp, 'sample.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64'));

const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const target = path.resolve(root, '.' + pathname);
  if (!target.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    const bytes = await fs.readFile(target);
    const ext = path.extname(target);
    res.setHeader('Content-Type', ext === '.html' ? 'text/html' : ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream');
    res.end(bytes);
  } catch { res.writeHead(404).end('Not found'); }
});
await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true });
const results = [];
const fixtures = {
  merge: ['sample.pdf', 'sample2.pdf'], split: ['sample.pdf'], compress: ['sample.pdf'],
  remove: ['sample.pdf'], extract: ['sample.pdf'], organize: ['sample.pdf'],
  scan: ['sample.png'], optimize: ['sample.pdf'], repair: ['sample.pdf'], ocr: ['sample.pdf'],
  jpgpdf: ['sample.png'], wordpdf: ['sample.docx'], pptpdf: ['sample.pptx'], excelpdf: ['sample.xlsx'],
  htmlpdf: ['sample.html'], pdfjpg: ['sample.pdf'], pdfword: ['sample.pdf'], pdfppt: ['sample.pdf'],
  pdfexcel: ['sample.pdf'], rotate: ['sample.pdf'], numbers: ['sample.pdf'], watermark: ['sample.pdf'],
  crop: ['sample.pdf'], edit: ['sample.pdf'], forms: ['form.pdf'], sign: ['sample.pdf'],
  compare: ['sample.pdf', 'sample2.pdf'], summary: ['sample.pdf'], markdown: ['sample.pdf']
};
const serviceTools = ['pdfa', 'unlock', 'protect', 'redact', 'translate'];
try {
  const page = await browser.newPage({ acceptDownloads: true });
  page.setDefaultTimeout(45000);
  page.on('pageerror', err => results.push({ tool: 'PAGE', status: 'console-error', detail: err.message }));
  await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.PDFLib, { timeout: 30000 });
  for (const tool of Object.keys(fixtures)) {
    try {
      await page.locator('[data-tool="' + tool + '"]').click();
      await page.locator('#files').setInputFiles(await Promise.all(fixtures[tool].map(async name => ({ name, mimeType:
        name.endsWith('.pdf') ? 'application/pdf' : name.endsWith('.png') ? 'image/png' :
        name.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
        name.endsWith('.pptx') ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :
        name.endsWith('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
        name.endsWith('.html') ? 'text/html' : 'text/plain',
        buffer: await fs.readFile(path.join(tmp, name)) }))));
      if (tool === 'organize') await page.locator('#pageOrder').fill('2,1');
      if (tool === 'extract') await page.locator('#range').fill('1');
      if (tool === 'remove') await page.locator('#range').fill('2');
      if (tool === 'rotate') await page.locator('#angle').selectOption('90');
      if (tool === 'watermark') await page.locator('#watermarkText').fill('PDFLeo Test');
      if (tool === 'numbers') await page.locator('#prefix').fill('Test');
      if (tool === 'edit') await page.locator('#editText').fill('PDFLeo edit test');
      if (tool === 'sign') await page.locator('#signText').fill('Test Signature');
      if (tool === 'crop') await page.locator('#cropInset').fill('10');
      if (tool === 'compress') await page.locator('#compressionQuality').selectOption('low');
      if (tool === 'forms') {
        const formReady = await Promise.race([
          page.waitForFunction(() => document.querySelector('[data-form-field-index="0"]')).then(() => 'ready'),
          page.waitForFunction(() => document.querySelector('#status')?.classList.contains('error') || document.querySelector('#options')?.textContent.includes('No interactive AcroForm fields')).then(() => 'error')
        ]);
        if (formReady === 'error') throw new Error(await page.locator('#status').innerText());
        await page.locator('[data-form-field-index="0"]').fill('Test User');
      }
      console.log('Testing tool: ' + tool);
      const downloadPromise = page.waitForEvent('download', { timeout: 60000 }).then(download => ({ download })).catch(error => ({ waitError: error }));
      const errorPromise = page.waitForFunction(() => document.querySelector('#status')?.classList.contains('error'), { timeout: 60000 }).then(() => ({ toolError: true })).catch(error => ({ waitError: error }));
      await page.locator('#run').click();
      const outcome = await Promise.race([downloadPromise, errorPromise]);
      if (outcome.toolError) throw new Error(await page.locator('#status').innerText());
      if (outcome.waitError) throw outcome.waitError;
      const download = outcome.download;
      const outputPath = path.join(tmp, 'out-' + tool + '-' + download.suggestedFilename());
      await download.saveAs(outputPath);
      const stat = await fs.stat(outputPath);
      if (!stat.size) throw new Error('Downloaded output is empty');
      const status = await page.locator('#status').innerText();
      if (/error/i.test(await page.locator('#status').getAttribute('class') || '')) throw new Error(status);
      results.push({ tool, status: 'PASS', output: download.suggestedFilename(), bytes: stat.size, message: status });
    } catch (err) {
      results.push({ tool, status: 'FAIL', detail: String(err?.message || err).slice(0, 500) });
    }
  }
  for (const tool of serviceTools) {
    try {
      await page.locator('[data-tool="' + tool + '"]').click();
      if (!(await page.locator('#run').isDisabled())) throw new Error('Service-only tool should be disabled');
      results.push({ tool, status: 'EXPECTED_UNAVAILABLE' });
    } catch (err) { results.push({ tool, status: 'FAIL', detail: String(err?.message || err).slice(0, 300) }); }
  }
} finally {
  await browser.close();
  server.close();
}
console.log(JSON.stringify(results, null, 2));
const failures = results.filter(x => x.status === 'FAIL' || x.status === 'console-error');
await fs.writeFile('/tmp/pdfleo-smoke-results.json', JSON.stringify(results, null, 2));
if (failures.length) process.exitCode = 1;
