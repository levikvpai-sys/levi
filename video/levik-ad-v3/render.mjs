// Render gfx.html layers with Playwright.
//   node render.mjs stills gfx out/stills 1.0,8.2,...      -> PNG stills (gfx composited over grey checker for review)
//   node render.mjs frames gfx out/frames_gfx 0 1120        -> raw RGBA PNG frames for [a, b)
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
import fs from 'fs';
import path from 'path';
import http from 'http';

const [mode, layer, outDir, a, b] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = path.join(process.cwd(), decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(process.cwd()) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${PORT}/gfx.html?layer=${layer}`);
await page.evaluate(() => window.ready);
const FPS = await page.evaluate(() => window.TL.fps);
const save = async (t, file) => {
  await page.evaluate(t => window.seek(t), t);
  const url = await page.evaluate(() => window.grab());
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
};
if (mode === 'stills') {
  for (const s of a.split(',')) await save(+s, `${outDir}/${layer}_t${(+s).toFixed(2).padStart(6, '0')}.png`);
} else {
  for (let i = +a; i < +b; i++) await save(i / FPS, `${outDir}/${String(i).padStart(5, '0')}.png`);
}
await browser.close();
server.close();
