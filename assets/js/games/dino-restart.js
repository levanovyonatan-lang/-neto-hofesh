// Keep a requested replay in this document, including after an AdSense vignette.
(function () {
    const actions = new WeakMap();
    const canKeepDocument = !!(window.navigation && window.NavigateEvent &&
        typeof window.NavigateEvent.prototype.intercept === 'function');
    let pending = null;

    function adFrameVisible() {
        return [...document.querySelectorAll(
            'iframe[id^="aswift_"], iframe[id^="google_ads_iframe"], ins.adsbygoogle[data-vignette-loaded="true"]'
        )].some(frame => {
            const rect = frame.getBoundingClientRect();
            if (rect.width < innerWidth * 0.7 || rect.height < innerHeight * 0.7 ||
                rect.bottom <= 0 || rect.top >= innerHeight) return false;
            for (let node = frame; node && node.nodeType === 1; node = node.parentElement) {
                const style = getComputedStyle(node);
                if (node.hidden || style.display === 'none' || style.visibility === 'hidden' ||
                    Number(style.opacity) === 0) return false;
            }
            return true;
        });
    }

    function clearPending() {
        const request = pending;
        if (!request) return null;
        pending = null;
        request.observer.disconnect();
        clearInterval(request.poll);
        cancelAnimationFrame(request.frame);
        request.button.removeAttribute('aria-disabled');
        request.button.style.pointerEvents = '';
        try { sessionStorage.removeItem('dinoRestartPending'); } catch (e) {}
        return request;
    }

    function resume() {
        const request = clearPending();
        if (!request) return;
        const url = new URL(location.href);
        url.searchParams.delete('dino');
        if (url.hash === '#google_vignette') url.hash = '';
        history.replaceState(history.state, '', url);
        request.restart();
    }

    function check() {
        const request = pending;
        if (!request) return;
        request.frame = 0;
        const frameVisible = adFrameVisible();
        const adVisible = frameVisible || (!request.sawFrame && location.hash === '#google_vignette');
        if (frameVisible) request.sawFrame = true;
        if (adVisible) {
            if (!request.sawAd) {
                request.sawAd = true;
                request.onAdShown();
            }
            return;
        }
        if (!document.hidden && (request.navigated || request.sawAd)) resume();
    }

    function scheduleCheck() {
        if (pending && !pending.frame) pending.frame = requestAnimationFrame(check);
    }

    // Window capture runs before ad handlers on document can stop the click.
    window.addEventListener('click', event => {
        const button = event.target.closest?.('[data-dino-restart]');
        const action = button && actions.get(button);
        if (!action || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        if (pending || button.getAttribute('aria-disabled') === 'true') {
            event.preventDefault();
            return;
        }
        if (!canKeepDocument || !button.hasAttribute('href')) {
            event.preventDefault();
            button.setAttribute('aria-disabled', 'true');
            Promise.resolve().then(action.restart).finally(() => button.removeAttribute('aria-disabled'));
            return;
        }
        button.setAttribute('aria-disabled', 'true');
        button.style.pointerEvents = 'none';
        const observer = new MutationObserver(scheduleCheck);
        pending = { ...action, button, target: new URL(button.href), observer,
            sawAd: false, sawFrame: false, navigated: false, frame: 0, poll: 0 };
        try { sessionStorage.setItem('dinoRestartPending', '1'); } catch (e) {}
        observer.observe(document.body, { subtree: true, childList: true, attributes: true,
            attributeFilter: ['style', 'class', 'hidden'] });
        pending.poll = setInterval(check, 100);
        scheduleCheck();
        // The real link is still offered to AdSense; only its eventual navigation is handled here.
    }, true);

    if (canKeepDocument) window.navigation.addEventListener('navigate', event => {
        if (!pending || !event.canIntercept || event.downloadRequest || event.formData) return;
        const url = new URL(event.destination.url);
        if (url.origin !== pending.target.origin || url.pathname !== pending.target.pathname ||
            url.search !== pending.target.search || url.hash === '#google_vignette') return;
        event.intercept({
            scroll: 'manual', focusReset: 'manual',
            handler() {
                if (!pending) return;
                pending.navigated = true;
                check();
            }
        });
    });

    ['hashchange', 'popstate', 'pageshow', 'focus'].forEach(name => window.addEventListener(name, scheduleCheck));
    document.addEventListener('visibilitychange', scheduleCheck);

    window.NetoDinoRestart = {
        canKeepDocument,
        bind(button, action) {
            button.setAttribute('data-dino-restart', '');
            actions.set(button, action);
        },
        cancel: clearPending
    };
})();
