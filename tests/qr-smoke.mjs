import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = '/tmp/pdfleo-qr-smoke';
await fs.mkdir(tmp, { recursive: true });
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
await new Promise(resolve => server.listen(4174, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true });
const slugs = [
  'website-url','wifi','text','email','phone','sms','whatsapp','vcard','location','google-maps',
  'facebook','instagram','tiktok','youtube','linkedin','snapchat','x-twitter','telegram','pinterest',
  'discord','payment','product','business-profile','digital-business-card','restaurant-menu',
  'event-ticket','coupon','google-review','pdf-file','app-download'
];
const paths = slugs.map(s => s + '-qr-generator.html');
const results = [];
try {
  const page = await browser.newPage({ acceptDownloads: true });
  page.setDefaultTimeout(20000);
  await page.goto('http://127.0.0.1:4174/qr-code-tools.html', { waitUntil: 'domcontentloaded' });
  const cards = await page.locator('a.qr-card').count();
  if (cards !== 30) throw new Error('QR directory should contain 30 cards; found ' + cards);
  const sitemap = await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8');
  for (const file of paths) {
    if (!sitemap.includes('https://pdfleo.online/' + file)) throw new Error('Missing from sitemap: ' + file);
  }
  for (const file of paths) {
    try {
      const response = await page.goto('http://127.0.0.1:4174/' + file, { waitUntil: 'domcontentloaded' });
      if (!response || response.status() !== 200) throw new Error('HTTP status was not 200');
      await page.waitForFunction(() => typeof window.QRCode !== 'undefined', { timeout: 20000 });
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      if (canonical !== 'https://pdfleo.online/' + file) throw new Error('Canonical mismatch: ' + canonical);
      const form = page.locator('form').first();
      const controls = await form.locator('input, textarea, select').evaluateAll(els => els.map(el => ({
        id: el.id, type: el.type || el.tagName.toLowerCase(), tag: el.tagName.toLowerCase()
      })));
      for (const field of controls) {
        const locator = field.id ? page.locator('#' + field.id) : form.locator(field.tag).first();
        if (field.tag === 'select') {
          await locator.selectOption({ index: 0 });
          continue;
        }
        if (field.type === 'checkbox' || field.type === 'radio' || field.type === 'hidden' || field.type === 'file') continue;
        const id = (field.id || '').toLowerCase();
        let value = 'PDFLeo test';
        if (id.includes('url') || id.includes('link') || id === 'value') value = 'https://example.com/test';
        else if (id.includes('email')) value = 'hello@example.com';
        else if (id.includes('phone') || id.includes('tel')) value = '+923001234567';
        else if (id.includes('ssid')) value = 'PDFLeo Test WiFi';
        else if (id.includes('password')) value = 'testpass123';
        else if (id.includes('lat')) value = '31.5204';
        else if (id.includes('lon')) value = '74.3587';
        else if (id.includes('amount')) value = '100';
        else if (id.includes('date')) value = '2026-12-01';
        else if (id.includes('name')) value = 'Alex Test';
        else if (id.includes('place') || id.includes('address') || id.includes('venue')) value = 'Lahore, Pakistan';
        else if (id.includes('event')) value = 'PDFLeo Test Event';
        else if (id.includes('ticket')) value = 'TICKET-001';
        else if (id.includes('code')) value = 'SAVE10';
        else if (id.includes('discount')) value = '10 percent off';
        else if (id.includes('sku')) value = 'SKU-001';
        else if (id.includes('subject')) value = 'Test subject';
        else if (id.includes('message') || id.includes('body') || id.includes('text')) value = 'PDFLeo QR test';
        await locator.fill(value);
      }
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
      await form.locator('button[type="submit"]').click();
      await page.waitForFunction(() => {
        const box = document.querySelector('#qrbox, #qrBox');
        return !!box && !!box.querySelector('canvas, img');
      }, { timeout: 15000 });
      const dl = page.locator('#download');
      if (await dl.isDisabled()) throw new Error('PNG download button remained disabled');
      await dl.click();
      const download = await downloadPromise;
      const output = path.join(tmp, file.replace('.html', '.png'));
      await download.saveAs(output);
      const stat = await fs.stat(output);
      if (!stat.size) throw new Error('PNG download was empty');
      results.push({ page: file, status: 'PASS', bytes: stat.size });
    } catch (error) {
      results.push({ page: file, status: 'FAIL', detail: String(error?.message || error).slice(0, 400) });
    }
  }
} finally {
  await browser.close();
  server.close();
}
console.log(JSON.stringify(results, null, 2));
await fs.writeFile('/tmp/pdfleo-qr-smoke-results.json', JSON.stringify(results, null, 2));
if (results.some(r => r.status === 'FAIL')) process.exitCode = 1;
