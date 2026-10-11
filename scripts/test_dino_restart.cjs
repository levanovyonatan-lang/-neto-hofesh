// Browser regression checks. Set PLAYWRIGHT_MODULE / CHROME_PATH when using a shared runtime.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');

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

async function setup(browser, base, { demo = false, legacy = false, ad = null, viewport, pathname = '/' } = {}) {
    const page = await browser.newPage({ viewport: viewport || { width: 1100, height: 820 }, serviceWorkers: 'block' });
    let documents = 0;
    page.on('request', request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++; });
    await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    await page.addInitScript(({ legacy, ad }) => {
        if (legacy) Object.defineProperty(window, 'navigation', { value: undefined });
        window.__adRequests = 0;
        window.adsbygoogle = { push() { window.__adRequests++; } };
        window.__adMode = ad;
        // Simulates Google's capture handler, including suppression of the target's click handler.
        document.addEventListener('click', event => {
            const link = event.target.closest?.('[data-dino-restart][href]');
            if (!link || !window.__adMode) return;
            event.preventDefault(); event.stopImmediatePropagation();
            const destination = link.href;
            const priorUrl = location.href;
            const frame = document.createElement('iframe');
            frame.id = 'aswift_test_vignette';
            frame.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483646;background:white';
            document.body.appendChild(frame);
            history.pushState({ testAd: true }, '', '#google_vignette');
            window.__dismissAd = () => {
                frame.remove();
                if (window.__adMode === 'back') history.back();
                else if (window.__adMode === 'hide') { /* Some dismissals keep their history marker. */ }
                else {
                    history.replaceState(history.state, '', priorUrl);
                    location.assign(destination);
                }
            };
        }, true);
    }, { legacy, ad });
    await page.goto(base + pathname + '?schoolType=elem&studyFriday=0&targetIntent=summer' + (demo ? '&show_demo=true' : ''));
    await page.waitForFunction(() => typeof window.startDinoGame === 'function');
    await page.evaluate(async () => {
        window.__starts = 0;
        window.trackEvent = name => { if (name === 'dino_game_play') window.__starts++; };
        localStorage.setItem('dinoHighScore', '999999');
        sessionStorage.setItem('dinoLastAdTime', String(Date.now() - 181000));
        sessionStorage.setItem('dinoGamesSinceAd', '3');
        await window.startDinoGame();
        window.showDinoGameOver(0, 0, '');
        window.__banner = document.getElementById('dino-ad-container');
        window.__adElement = window.__banner.firstElementChild;
        window.__startsBefore = window.__starts;
        window.__adRequestsBefore = window.__adRequests;
    });
    await page.locator('[data-dino-restart]').waitFor();
    return { page, documents: () => documents };
}

async function assertRunning(fixture) {
    const { page } = fixture;
    await page.waitForFunction(() => window.__starts === window.__startsBefore + 1 && !document.getElementById('dino-game-over'));
    assert.deepEqual(await page.evaluate(() => ({
        bannerKept: window.__banner === document.getElementById('dino-ad-container'),
        adKept: window.__adElement === document.querySelector('#dino-ad-container > ins'),
        adRequests: window.__adRequests - window.__adRequestsBefore,
        pending: sessionStorage.getItem('dinoRestartPending'),
        restartParam: new URL(location.href).searchParams.has('dino')
    })), { bannerKept: true, adKept: true, adRequests: 0, pending: null, restartParam: false });
    assert.equal(fixture.documents(), 1, 'Replay must not request another HTML document');
    await page.waitForTimeout(120);
    assert.equal(await page.evaluate(() => window.__starts - window.__startsBefore), 1, 'Replay starts exactly once');
}

(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    try {
        for (const options of [
            { name: 'main / no ad' },
            { name: 'main / ad close', ad: 'navigate' },
            { name: 'mobile / ad back', ad: 'back', viewport: { width: 390, height: 844 } },
            { name: 'main / ad hides in place', ad: 'hide' },
            { name: 'demo / ad close', demo: true, ad: 'navigate' },
            { name: 'older browser / direct replay', legacy: true },
            { name: 'holiday page / ad close', pathname: '/hanukkah/', ad: 'navigate' }
        ]) {
            const fixture = await setup(browser, base, options);
            const { page } = fixture;
            try {
                await page.locator('[data-dino-restart]').click();
                if (options.ad) {
                    await page.waitForFunction(() => sessionStorage.getItem('dinoGamesSinceAd') === '0');
                    assert.equal(await page.evaluate(() => window.__starts - window.__startsBefore), 0, 'No running behind an ad');
                    await page.evaluate(() => window.__dismissAd());
                }
                await assertRunning(fixture);
                if (!options.ad) assert.equal(await page.evaluate(() => sessionStorage.getItem('dinoGamesSinceAd')), '3', 'No-fill does not reset the ad gate');
                console.log('PASS', options.name);
            } finally { await page.close(); }
        }

        for (const gate of ['games', 'time', 'record']) {
            const fixture = await setup(browser, base);
            const { page } = fixture;
            try {
                await page.evaluate(gate => {
                    document.getElementById('dino-game-over').remove();
                    if (gate === 'games') sessionStorage.setItem('dinoGamesSinceAd', '2');
                    if (gate === 'time') sessionStorage.setItem('dinoLastAdTime', String(Date.now()));
                    if (gate === 'record') localStorage.setItem('dinoHighScore', '-1');
                    window.showDinoGameOver(0, 0, '');
                    window.__startsBefore = window.__starts;
                }, gate);
                assert.equal(await page.locator('[data-dino-restart]').getAttribute('href'), null);
                await page.locator('[data-dino-restart]').click();
                await assertRunning(fixture);
                console.log('PASS eligibility:', gate);
            } finally { await page.close(); }
        }

        const canceled = await setup(browser, base, { ad: 'hide' });
        await canceled.page.locator('[data-dino-restart]').click();
        await canceled.page.waitForFunction(() => sessionStorage.getItem('dinoGamesSinceAd') === '0');
        await canceled.page.evaluate(() => { window.cleanupDinoGame(); window.__dismissAd(); });
        await canceled.page.waitForTimeout(200);
        assert.equal(await canceled.page.locator('#dino-score-val').count(), 0, 'Closing the game cancels the pending replay');
        await canceled.page.close();
        console.log('PASS cancel pending replay');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
