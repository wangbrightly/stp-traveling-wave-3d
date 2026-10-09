// 用无头浏览器逐帧渲染网页的录制模式（#record），每帧存一张 PNG，之后用 ffmpeg 合成视频
// 用法：node record.js <html> <帧目录> [只拍第几秒，可选]
const puppeteer = require(process.env.PUPPETEER_MODULE || 'puppeteer');
const path = require('path'), fs = require('fs');
const [html, outDir, single] = process.argv.slice(2);
const FPS = 30, W = 1920, H = 1080;
(async () => {
  fs.mkdirSync(outDir, {recursive: true});
  const browser = await puppeteer.launch({headless: 'shell', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('PAGE ERROR:', e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('console:', m.text()); });
  await page.setViewport({width: W, height: H, deviceScaleFactor: 1});
  await page.goto('file://' + path.resolve(html) + '#' + (process.env.REC_HASH || 'record'), {waitUntil: 'load'});
  await page.waitForFunction('window.__rec', {timeout: 20000});
  const dur = await page.evaluate(() => window.__rec.duration);
  const times = single !== undefined ? [+single] : Array.from({length: Math.round(dur * FPS)}, (_, f) => f / FPS);
  const t0 = Date.now();
  for (let f = 0; f < times.length; f++) {
    await page.evaluate(t => window.__rec.frame(t), times[f]);
    await page.screenshot({path: path.join(outDir, 'f' + String(f).padStart(4, '0') + '.png')});
    if (f % 30 === 0) console.log('frame', f, '/', times.length, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  await browser.close();
})();
