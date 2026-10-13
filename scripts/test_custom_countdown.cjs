// Fresh-browser regression test for creating a personal countdown from the demo.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');

async function futureDate(page) {
    return page.evaluate(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0')].join('-');
    });
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', { '.html': 'text/html', '.js': 'application/javascript',
        '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' }[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
});

async function run(browser, base, viewport, label, interceptSave = false, startPath = '/?schoolType=elem&studyFriday=0&targetIntent=summer&show_demo=true') {
    const page = await browser.newPage({ viewport, serviceWorkers: 'block' });
    const errors = [];
    let documents = 0;
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
        if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++;
    });
    await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    if (interceptSave) {
        await page.addInitScript(() => {
            document.addEventListener('click', event => {
                const link = event.target.closest?.('#custom-save-btn[href]');
                if (!link) return;
                event.preventDefault();
                window.__fakeAdOpen = true;
                sessionStorage.setItem('testVignetteOpen', '1');
                const destination = link.href;
                window.__closeFakeAd = () => {
                    sessionStorage.removeItem('testVignetteOpen');
                    location.assign(destination);
                };
            });
        });
    }
    try {
        await page.goto(base + startPath);
        await page.locator('#custom-countdown-btn').click();
        await page.waitForURL('**/custom/**');
        await page.locator('#custom-name').fill('בדיקת ספירה');
        await page.locator('#custom-date').fill(await futureDate(page));
        await page.locator('#custom-save-btn').click();
        if (interceptSave) {
            await page.waitForTimeout(350);
            const adStillOpen = await page.evaluate(() => sessionStorage.getItem('testVignetteOpen') === '1');
            if (adStillOpen) {
                assert.match(page.url(), /\/custom\//, 'Do not navigate behind an open vignette');
                await page.evaluate(() => window.__closeFakeAd());
            }
        }
        await page.waitForURL(url => !url.pathname.startsWith('/custom/'));
        await page.waitForFunction(() => document.getElementById('main-screen')?.style.display === 'flex');
        const state = await page.evaluate(() => ({
            url: location.href,
            countdowns: JSON.parse(localStorage.getItem('neto_customCountdowns') || '[]'),
            title: document.getElementById('main-target-title')?.textContent,
            activeCard: document.querySelector('.holiday-card.active')?.textContent,
            mainVisible: getComputedStyle(document.getElementById('main-screen')).display !== 'none'
        }));
        assert.equal(state.countdowns.length, 1, 'Create exactly one countdown');
        assert.match(state.title, /בדיקת ספירה/);
        assert.equal(state.mainVisible, true);
        await page.waitForTimeout(500);
        assert.equal(documents, 3, 'One navigation to form and one navigation back');
        assert.deepEqual(errors, [], 'No uncaught browser errors');
        console.log('PASS', label, state.url);
    } catch (error) {
        console.error('FAIL', label, { url: page.url(), documents, errors });
        throw error;
    } finally { await page.close(); }
}

async function testFirstVisitWithServiceWorker(browser, base) {
    const context = await browser.newContext({ serviceWorkers: 'allow' });
    await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    const page = await context.newPage();
    try {
        await page.goto(base + '/?schoolType=elem&studyFriday=0&targetIntent=summer&show_demo=true');
        await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 });
        await context.setOffline(true);
        await page.locator('#custom-countdown-btn').click();
        await page.waitForURL('**/custom/**');
        assert.equal(await page.locator('#custom-countdown-modal').isVisible(), true,
            'The first /custom/ navigation must display the actual form, not cached home HTML');
        await context.setOffline(false);
        await page.locator('#custom-name').fill('בדיקת מטמון');
        await page.locator('#custom-date').fill(await futureDate(page));
        await page.locator('#custom-save-btn').click();
        await page.waitForURL(url => !url.pathname.startsWith('/custom/'));
        assert.match(await page.locator('#main-target-title').textContent(), /בדיקת מטמון/);
        console.log('PASS first personal form visit with Service Worker');
    } finally { await context.close(); }
}

async function testStandaloneFirstOpen(browser, base) {
    const page = await browser.newPage({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'standalone', { value: true });
    });
    try {
        await page.goto(base + '/?schoolType=elem&studyFriday=0&targetIntent=summer&show_demo=true');
        await page.locator('#custom-countdown-btn').click();
        assert.equal(await page.locator('#custom-countdown-modal').isVisible(), true);
        assert.match(await page.locator('#custom-date').inputValue(), /^\d{4}-\d{2}-\d{2}$/,
            'First standalone opening must initialize the date field');
        await page.locator('#custom-name').fill('בדיקת אפליקציה');
        await page.locator('#custom-date').fill(await futureDate(page));
        await page.locator('#custom-save-btn').click();
        assert.match(await page.locator('#main-target-title').textContent(), /בדיקת אפליקציה/);
        assert.match(page.url(), /\?schoolType=/, 'Standalone save should not reload the page');
        console.log('PASS standalone first opening');
    } finally { await page.close(); }
}

(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const browser = await chromium.launch({ headless: true,
        ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    try {
        await run(browser, base, { width: 1200, height: 900 }, 'desktop first add');
        await run(browser, base, { width: 390, height: 844 }, 'mobile first add');
        await run(browser, base, { width: 390, height: 844 }, 'holiday page first add', false,
            '/hanukkah/?schoolType=elem&studyFriday=0&targetIntent=hanukkah2026&started=true&show_demo=true');
        await run(browser, base, { width: 390, height: 844 }, 'mobile save with vignette interception', true);
        await testStandaloneFirstOpen(browser, base);
        await testFirstVisitWithServiceWorker(browser, base);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
