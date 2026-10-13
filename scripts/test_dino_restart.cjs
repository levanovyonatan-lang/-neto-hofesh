// Browser regression checks for Auto Ads vignette navigation and dino replay.
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

async function setup(browser, base, { ad = false, demo = false, viewport, finish = true, pathname = '/' } = {}) {
    const page = await browser.newPage({ viewport: viewport || { width: 1100, height: 820 }, serviceWorkers: 'block' });
    let documents = 0;
    const errors = [];
    const messages = [];
    page.on('console', message => { if (message.type() === 'error' || message.type() === 'warning') messages.push(message.text()); });
    page.on('request', request => {
        if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++;
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    if (ad) {
        await page.addInitScript(() => {
            document.addEventListener('click', event => {
                const link = event.target.closest?.('[data-dino-restart][href]');
                if (!link) return;
                event.preventDefault();
                event.stopImmediatePropagation();
                const destination = link.href;
                const overlay = document.createElement('div');
                overlay.id = 'test-vignette';
                overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:white';
                document.body.appendChild(overlay);
                history.pushState({}, '', '#google_vignette');
                window.__dismissAd = mode => {
                    overlay.remove();
                    if (mode === 'back') history.back();
                    else location.assign(destination);
                };
            }, true);
        });
    }
    await page.goto(base + pathname + '?schoolType=elem&studyFriday=0&targetIntent=summer' + (demo ? '&show_demo=true' : ''));
    await page.waitForFunction(() => typeof window.startDinoGame === 'function');
    await page.evaluate(() => {
        localStorage.setItem('dinoHighScore', '999999');
        sessionStorage.setItem('dinoLastAdTime', String(Date.now() - 181000));
        sessionStorage.setItem('dinoGamesSinceAd', '2');
        const target = activeEventsList.find((event, index) => index > 0 && index < activeEventsList.length - 1);
        selectTarget(target.id, false);
    });
    await page.locator('#main-game-btn').click();
    await page.locator('#dino-score-val').waitFor();
    if (finish) {
        await page.evaluate(() => window.showDinoGameOver(0, 0, ''));
        await page.locator('[data-dino-restart]').waitFor();
    }
    return { page, documents: () => documents, errors, messages };
}

async function assertRunning(fixture, { navigated, games }) {
    const { page } = fixture;
    try {
        await page.waitForFunction(() => !!document.getElementById('dino-score-val') &&
            !document.getElementById('dino-game-over'), null, { timeout: 10000 });
    } catch (error) {
        console.error('Restart diagnostics', await page.evaluate(() => ({
            url: location.href,
            mainScreen: document.getElementById('main-screen')?.style.display,
            gameLoaded: typeof window.startDinoGame,
            score: !!document.getElementById('dino-score-val'),
            gameOver: !!document.getElementById('dino-game-over'),
            restarting: document.documentElement.classList.contains('dino-restarting'),
            games: sessionStorage.getItem('dinoGamesSinceAd')
        })), fixture.errors, fixture.messages, fixture.documents());
        throw error;
    }
    await page.waitForFunction(() => !new URL(location.href).searchParams.has('dino'));
    assert.equal(await page.evaluate(() => sessionStorage.getItem('dinoGamesSinceAd')), games);
    assert.equal(fixture.documents(), navigated ? 2 : 1);
    assert.deepEqual(fixture.errors, [], 'No browser errors');
}

(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const browser = await chromium.launch({ headless: true,
        ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    try {
        for (const options of [
            { name: 'desktop vignette then destination', ad: true },
            { name: 'mobile vignette then destination', ad: true, viewport: { width: 390, height: 844 } },
            { name: 'demo vignette then destination', ad: true, demo: true },
            { name: 'holiday page vignette then destination', ad: true, pathname: '/hanukkah/' },
            { name: 'vignette returns to original page', ad: true, back: true },
            { name: 'no ad fill, direct navigation' }
        ]) {
            const fixture = await setup(browser, base, options);
            try {
                const { page } = fixture;
                const link = page.locator('[data-dino-restart]');
                assert.equal(await link.evaluate(el => el.tagName), 'A');
                const href = await link.getAttribute('href');
                assert.match(href, /dino=1/);
                assert.match(href, /dinoAdAttempt=1/);
                await link.click();
                if (options.ad) {
                    assert.equal(await page.locator('#test-vignette').count(), 1);
                    assert.equal(await page.locator('#dino-game-over').count(), 1,
                        'Game must not run behind the ad');
                    await page.evaluate(mode => window.__dismissAd(mode), options.back ? 'back' : 'navigate');
                }
                await assertRunning(fixture, { navigated: !options.back, games: '0' });
                console.log('PASS', options.name);
            } finally { await fixture.page.close(); }
        }

        for (const gate of ['games', 'time', 'record']) {
            const fixture = await setup(browser, base, { finish: false });
            try {
                const { page } = fixture;
                await page.evaluate(gate => {
                    if (gate === 'games') sessionStorage.setItem('dinoGamesSinceAd', '0');
                    if (gate === 'time') sessionStorage.setItem('dinoLastAdTime', String(Date.now()));
                    if (gate === 'record') localStorage.setItem('dinoHighScore', '-1');
                    window.showDinoGameOver(0, 0, '');
                }, gate);
                const button = page.locator('[data-dino-restart]');
                assert.equal(await button.evaluate(el => el.tagName), 'BUTTON');
                await button.click();
                await assertRunning(fixture, { navigated: false, games: gate === 'games' ? '1' : '3' });
                console.log('PASS eligibility:', gate);
            } finally { await fixture.page.close(); }
        }

        const natural = await setup(browser, base, { finish: false });
        try {
            await natural.page.locator('#dino-game-over').waitFor({ timeout: 20000 });
            await natural.page.locator('[data-dino-restart]').click();
            await assertRunning(natural, { navigated: true, games: '0' });
            console.log('PASS natural collision and restart');
        } finally { await natural.page.close(); }

        for (const demo of [false, true]) {
            const page = await browser.newPage({ serviceWorkers: 'block' });
            await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
            try {
                await page.goto(base + '/?schoolType=elem&studyFriday=0&targetIntent=summer&dino=1' +
                    (demo ? '&show_demo=true' : ''));
                await page.locator('#dino-score-val').waitFor();
                await page.waitForFunction(() => !new URL(location.href).searchParams.has('dino'));
                console.log('PASS direct restart URL', demo ? 'demo' : 'main');
            } finally { await page.close(); }
        }
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
