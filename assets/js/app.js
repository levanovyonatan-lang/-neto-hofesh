const loadingPhrases = ["טוען פאנץ' מוחץ... 🤖", "מחשב אנרגיות לקיץ... ☀️", "מחפש כוח רצון... 🔍"];
const tipsDataVersion = 'tips-file-v2';
const dailyTipsStorageKey = `holiday_calc_daily_tips_${tipsDataVersion}`;
const tipHistoryStorageKey = `holiday_calc_tip_history_${tipsDataVersion}`;
const tipsScriptSrc = `tips.js?v=${tipsDataVersion}`;
const schoolTipKeys = { elem: 'elementary', middle: 'highschool', high: 'highschool' };
let tipsDatabasePromise = null;
let userConfig = { schoolType: '', studyFriday: false, activeTargetId: '' };
let activeEventsList = [];
let timerInterval = null;
let dailyTipsState = { date: '', targets: {} };
let confettiFired = false;
let deferredPrompt = null;
let isAnimatingNetDays = false;
let netDaysAnimationId = null;
let vimeoPlayerInstance = null;

// שמירת ה-Prompt להתקנה אוטומטית באנדרואיד
window.addEventListener('beforeinstallprompt', (e) => {
    // הסרנו את e.preventDefault() כדי לאפשר לדפדפן להקפיץ את הפס הלבן האוטומטי בתחתית המסך
    deferredPrompt = e;
});

window.addEventListener('appinstalled', () => {
    trackEvent('android_pwa_installed');
    const a2hsBtn = document.getElementById('a2hs-btn');
    if (a2hsBtn) a2hsBtn.style.display = 'none';
    deferredPrompt = null;
});

function trackEvent(eventName, params = {}) {
    console.log("Track Event:", eventName, params);
    if (typeof gtag === 'function') {
        gtag('event', eventName, { ...params, transport: 'beacon' });
    }
}

let activeHolidays = ['2026-04-22', '2026-05-05', '2026-05-21', '2026-05-22'];

const holidays2027 = [
    '2026-09-11', '2026-09-13', // ראש השנה
    '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', // כיפור וסוכות
    '2026-12-06', '2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10', '2026-12-11', // חנוכה
    '2027-03-23', '2027-03-24', // פורים
    '2027-04-13', '2027-04-14', '2027-04-15', '2027-04-16', '2027-04-18', '2027-04-19', '2027-04-20', '2027-04-21', '2027-04-22', '2027-04-23', '2027-04-25', '2027-04-26', '2027-04-27', '2027-04-28', // פסח
    '2027-05-12', // יום העצמאות
    '2027-06-10', '2027-06-11' // שבועות
];

const targets2027 = [
    { id: 'roshHashana2026', name: 'ראש השנה', date: new Date('2026-09-11T08:15:00'), icon: '🍯', bg: '#fef3c7', lengthText: '<b>שלושה ימים</b> כולל שישי-שבת' },
    { id: 'kippurSukkot2026', name: 'כיפור וסוכות', date: new Date('2026-09-20T08:15:00'), icon: '🛖', bg: '#ecfdf5', lengthText: '<b>שבועיים רצופים!</b>' },
    { id: 'hanukkah2026', name: 'חנוכה', date: new Date('2026-12-06T08:15:00'), icon: '🍩', bg: '#eff6ff', lengthText: '<b>שבוע שלם</b>' },
    { id: 'purim2027', name: 'פורים', date: new Date('2027-03-23T08:15:00'), icon: '🎭', bg: '#fdf4ff', lengthText: '<b>יומיים</b> מטורפים' },
    { id: 'pesach2027', name: 'פסח', date: new Date('2027-04-13T08:15:00'), icon: '🍷', bg: '#fff7ed', lengthText: '<b>16 ימים!</b>' },
    { id: 'atzmaut2027', name: 'יום העצמאות', date: new Date('2027-05-12T08:15:00'), icon: '🇮🇱', bg: '#f0f9ff', lengthText: '<b>יום אחד</b>' },
    { id: 'shavuot2027', name: 'שבועות', date: new Date('2027-06-10T08:15:00'), icon: '🧀', bg: '#f0fdf4', lengthText: '<b>שלושה ימים</b> כולל שישי-שבת' },
    { id: 'summerHigh2027', name: 'החופש הגדול', date: new Date('2027-06-21T08:15:00'), isSummer: true, type: 'high', icon: '🏖️', bg: '#fefce8' },
    { id: 'summerElem2027', name: 'החופש הגדול', date: new Date('2027-07-01T08:15:00'), isSummer: true, type: 'elem', icon: '🍉', bg: '#fefce8' }
];

const allTargets = [
    { id: 'atzmaut', name: 'יום העצמאות', date: new Date('2026-04-22T08:15:00'), icon: '🇮🇱', bg: '#f0f9ff', lengthText: '<b>יום אחד</b>' },
    { id: 'lagbaomer', name: 'ל"ג בעומר', date: new Date('2026-05-05T08:15:00'), icon: '🔥', bg: '#fff7ed', lengthText: '<b>יום אחד</b>' },
    { id: 'shavuot', name: 'שבועות', date: new Date('2026-05-21T08:15:00'), icon: '🧀', bg: '#f0fdf4', lengthText: '<b>שלושה ימים</b> כולל שישי-שבת' },
    { id: 'summerHigh', name: 'החופש הגדול', date: new Date('2026-06-19T08:15:00'), isSummer: true, type: 'high', icon: '🏖️', bg: '#fefce8' },
    { id: 'summerMiddlePrep', name: 'מכינת קיץ', date: new Date('2026-07-01T08:15:00'), type: 'middle', icon: '🤖', bg: '#eff6ff', noFriday: true, description: 'לכיתות ז\'-ט\' (לא חובה). לומדים עד ה-30.6', lengthText: '<b>62 ימים</b>' },
    { id: 'summerElemLow', name: 'ביה"ס של החופש הגדול (א\'-ג\')', date: new Date('2026-07-31T08:15:00'), type: 'elem', icon: '🎒', bg: '#fdf4ff', description: 'לומדים עד ה-30.7 (לא חובה)', noFriday: true, lengthText: '<b>32 ימים</b>' },
    { id: 'summerElem', name: 'החופש הגדול', date: new Date('2026-07-01T08:15:00'), isSummer: true, type: 'elem', icon: '🍉', bg: '#fefce8' }
];

function initPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js?v=161').catch(() => { });
    }

    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone) || window.matchMedia('(display-mode: standalone)').matches;

    if (isInStandaloneMode()) {
        const a2hsBtn = document.getElementById('a2hs-btn');
        if (a2hsBtn) a2hsBtn.style.display = 'none';

        // מעקב התקנה ופתיחה ב-IOS
        const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
        if (isIOS) {
            if (!localStorage.getItem('ios_pwa_installed_tracked')) {
                trackEvent('ios_pwa_installed');
                localStorage.setItem('ios_pwa_installed_tracked', 'true');
            }
            trackEvent('ios_pwa_open');
        } else {
            trackEvent('pwa_open_standalone');
        }
    }
}

function detectIOSBrowser() {
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    if (!isIOS) return 'not-ios';
    const isChrome = /CriOS/.test(ua);
    const isFirefox = /FxiOS/.test(ua);
    const isGoogleApp = /GSA/.test(ua);
    const isInstagram = /Instagram/.test(ua);
    const isFacebook = /FBAV|FBAN/.test(ua);
    if (isChrome || isFirefox || isGoogleApp || isInstagram || isFacebook) return 'ios-non-safari';
    return 'ios-safari';
}

function handleA2HS() {
    if (deferredPrompt) {
        trackEvent('click_install_pwa');
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
    } else {
        trackEvent('open_ios_install_modal');
        const iosBrowserType = detectIOSBrowser();
        document.getElementById('modal-safari-content').style.display = 'none';
        document.getElementById('modal-nonsafari-content').style.display = 'none';
        document.getElementById('modal-android-content').style.display = 'none';

        // Reset to video mode by default
        const videoContainer = document.getElementById('video-instruction-container');
        const writtenContent = document.getElementById('written-instructions');
        const toggleBtn = document.getElementById('toggle-instruction-mode');

        if (videoContainer) videoContainer.style.display = 'block';
        if (writtenContent) writtenContent.style.display = 'none';
        if (toggleBtn) toggleBtn.innerHTML = 'הסבר כתוב 📝';

        if (iosBrowserType === 'not-ios') document.getElementById('modal-android-content').style.display = 'block';
        else if (iosBrowserType === 'ios-non-safari') {
            trackEvent('attempt_auto_safari_redirect');
            // נסיון פתיחה אוטומטית בספארי
            window.location.href = `x-safari-https://${window.location.hostname}${window.location.pathname}?install=1`;

            // אם המשתמש נשאר בדף אחרי השהייה, נציג את המודל כגיבוי
            setTimeout(() => {
                if (document.getElementById('ios-modal').style.display !== 'flex') {
                    document.getElementById('modal-nonsafari-content').style.display = 'block';
                    document.getElementById('ios-modal').style.display = 'flex';
                    document.getElementById('ios-modal').focus();
                    trackEvent('showed_nonsafari_warning');
                    trackEvent('ios_auto_safari_failed');
                }
            }, 1200);
            return; // עוצרים כאן כדי לא להציג את המודל הריק או לבצע לוגיקה של ספארי
        }
        else {
            document.getElementById('modal-safari-content').style.display = 'block';
            const video = videoContainer ? videoContainer.querySelector('video') : null;
            if (video) {
                video.currentTime = 0;
                video.play().catch(() => { });
            }
        }

        document.getElementById('ios-modal').style.display = 'flex';
        document.getElementById('ios-modal').focus();
    }
}

function copySiteUrlForSafari(btn) {
    const copyText = document.getElementById("site-url-input");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
    trackEvent('copied_url_for_safari');
    btn.innerHTML = "הועתק! ✅";
    btn.style.background = "#dcfce7"; btn.style.color = "#166534"; btn.style.borderColor = "#86efac";
    setTimeout(() => { btn.innerHTML = "העתק קישור 📋"; btn.style.background = "#fef08a"; btn.style.color = "#854d0e"; btn.style.borderColor = "#fde047"; }, 3000);
}

function closeIosModal() {
    trackEvent('close_ios_install_modal');
    document.getElementById('ios-modal').style.display = 'none';
    const video = document.querySelector('#modal-safari-content video');
    if (video) video.pause();
}

function toggleInstructionMode() {
    const videoContainer = document.getElementById('video-instruction-container');
    const writtenInstructions = document.getElementById('written-instructions');
    const toggleBtn = document.getElementById('toggle-instruction-mode');
    const video = videoContainer ? videoContainer.querySelector('video') : null;

    if (writtenInstructions.style.display === 'none') {
        // Switch to written
        videoContainer.style.display = 'none';
        writtenInstructions.style.display = 'block';
        toggleBtn.innerHTML = 'סרטון הסבר 🎬';
        if (video) video.pause();
        trackEvent('switch_to_written_instructions');
    } else {
        // Switch to video
        videoContainer.style.display = 'block';
        writtenInstructions.style.display = 'none';
        toggleBtn.innerHTML = 'הסבר כתוב 📝';
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => { });
        }
        trackEvent('switch_to_video_instructions');
    }
}

let hasCopiedPromoCode = false;

function openVipModal() {
    hasCopiedPromoCode = false;
    document.getElementById('small-request-alert').style.display = 'none';
    const hint = document.getElementById('video-click-hint');
    if (hint) hint.style.display = 'flex';

    const copyBtn = document.getElementById('dedicated-copy-btn');
    if (copyBtn) {
        copyBtn.innerHTML = "העתק 📋";
        copyBtn.style.background = "#fef08a"; copyBtn.style.color = "#854d0e"; copyBtn.style.borderColor = "#fde047";
        copyBtn.classList.remove('copied'); copyBtn.classList.remove('video-ended-highlight');
    }

    const spinner = document.getElementById('video-loading-spinner');
    if (spinner) spinner.style.display = 'none';

    trackEvent('open_vip_funnel');
    document.getElementById('vip-modal').style.display = 'flex';
    document.getElementById('vip-modal').focus();
}

function closeVipModal() {
    trackEvent('close_vip_funnel');
    document.getElementById('vip-modal').style.display = 'none';
    const vid = document.getElementById('promo-video');
    if (vid) {
        if (vid.tagName === 'VIDEO' && typeof vid.pause === 'function') vid.pause();
        else if (vid.tagName === 'IFRAME' && vimeoPlayerInstance) {
            vimeoPlayerInstance.pause().catch(() => { });
        }
    }
}

function togglePromoVideo() {
    const vid = document.getElementById('promo-video');
    if (!vid) return;

    if (vid.tagName === 'VIDEO') {
        if (vid.paused) { vid.play().catch(e => console.log('Video play prevented', e)); trackEvent('play_promo_video'); }
        else { vid.pause(); trackEvent('pause_promo_video'); }
    } else if (vid.tagName === 'IFRAME' && typeof Vimeo !== 'undefined') {
        if (!vimeoPlayerInstance) {
            vimeoPlayerInstance = new Vimeo.Player(vid);
            vimeoPlayerInstance.on('ended', () => { highlightCopyButton(); trackEvent('ended_promo_video_vimeo'); });
            vimeoPlayerInstance.on('play', () => {
                const hint = document.getElementById('video-click-hint');
                if (hint) hint.style.display = 'none';
                // Final attempt to ensure sound after play starts
                setTimeout(() => {
                    if (vimeoPlayerInstance) {
                        vimeoPlayerInstance.setMuted(false).catch(() => { });
                        vimeoPlayerInstance.setVolume(1).catch(() => { });
                    }
                }, 100);
            });
        }

        // Show loading spinner
        const spinner = document.getElementById('video-loading-spinner');
        if (spinner) spinner.style.display = 'block';

        // Chain the audio commands and play call
        // We do them both before and after play for maximum compatibility
        vimeoPlayerInstance.setVolume(1).catch(() => { });
        vimeoPlayerInstance.setMuted(false).catch(() => { });

        vimeoPlayerInstance.play().then(() => {
            vimeoPlayerInstance.setMuted(false).catch(() => { });
            vimeoPlayerInstance.setVolume(1).catch(() => { });
        }).catch(err => {
            console.error('Vimeo play error:', err);
            if (spinner) spinner.style.display = 'none';
        });
    }
}

function highlightCopyButton() {
    const copyBtn = document.getElementById('dedicated-copy-btn');
    if (copyBtn && !copyBtn.classList.contains('copied')) copyBtn.classList.add('video-ended-highlight');
}

function copyPromoCode(btnElement) {
    const tempInput = document.createElement("input");
    tempInput.value = 'חופש';
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    hasCopiedPromoCode = true; trackEvent('copied_promo_code_via_btn');

    btnElement.classList.remove('video-ended-highlight'); btnElement.classList.add('copied');
    btnElement.innerHTML = "הועתק! ✅"; btnElement.style.background = "#dcfce7"; btnElement.style.color = "#166534"; btnElement.style.borderColor = "#86efac";
}

function setupManualCopyListener() {
    const promoTextElement = document.getElementById('promo-code-text');
    if (promoTextElement) {
        promoTextElement.addEventListener('copy', function () {
            hasCopiedPromoCode = true; trackEvent('copied_promo_code_manually');
            const btnElement = document.getElementById('dedicated-copy-btn');
            if (btnElement) { btnElement.classList.remove('video-ended-highlight'); btnElement.classList.add('copied'); btnElement.innerHTML = "הועתק! ✅"; btnElement.style.background = "#dcfce7"; btnElement.style.color = "#166534"; btnElement.style.borderColor = "#86efac"; }
        });
    }
}

function attemptRegistration() {
    const registrationLink = "https://teenk.co.il/teenkerz/";
    if (hasCopiedPromoCode) {
        trackEvent('success_reg_with_copy');
    } else {
        trackEvent('success_reg_without_copy');
    }
    // הקישור נפתח מיד בכל מצב
    const a = document.createElement('a');
    a.href = registrationLink;
    a.target = '_blank';
    a.rel = 'nofollow noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function handleSponsorClick() {
    if (userConfig.schoolType === 'elem') {
        trackEvent('click_ad_avigail_tip');
        window.location.href = "avigail-camp.html";
    } else if (userConfig.schoolType === 'high') {
        const isAndroid = /Android/i.test(navigator.userAgent);
        trackEvent('click_tip_jobs_sponsor');
        trackEvent(isAndroid ? 'click_tip_jobs_android' : 'click_tip_jobs_iphone');
        if (isAndroid) {
            window.location.href = "https://play.google.com/store/apps/details?id=com.hagovistim.app";
        } else {
            window.location.href = "https://chat.whatsapp.com/GbuLGylKq5216WxoKKDKWe";
        }
    }
}

function loadTipsDatabase() {
    if (window.tipsDatabase && typeof window.tipsDatabase === 'object') {
        return Promise.resolve(window.tipsDatabase);
    }

    if (tipsDatabasePromise) return tipsDatabasePromise;

    tipsDatabasePromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[data-tips-database="true"]');

        const finishLoading = () => {
            if (window.tipsDatabase && typeof window.tipsDatabase === 'object') {
                resolve(window.tipsDatabase);
            } else {
                tipsDatabasePromise = null;
                reject(new Error('tips.js loaded without window.tipsDatabase'));
            }
        };

        if (existingScript) {
            existingScript.addEventListener('load', finishLoading, { once: true });
            existingScript.addEventListener('error', () => {
                tipsDatabasePromise = null;
                reject(new Error('Failed to load tips.js'));
            }, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = tipsScriptSrc;
        script.async = true;
        script.dataset.tipsDatabase = 'true';
        script.onload = finishLoading;
        script.onerror = () => {
            tipsDatabasePromise = null;
            reject(new Error('Failed to load tips.js'));
        };
        document.head.appendChild(script);
    });

    return tipsDatabasePromise;
}

function flattenTips(source) {
    const tips = [];
    const collect = (value) => {
        if (typeof value === 'string' && value.trim()) {
            tips.push(value.trim());
        } else if (Array.isArray(value)) {
            value.forEach(collect);
        } else if (value && typeof value === 'object') {
            Object.values(value).forEach(collect);
        }
    };

    collect(source);
    return [...new Set(tips)];
}

function getSchoolTipKey(schoolType) {
    return schoolTipKeys[schoolType] || schoolTipKeys.high;
}

function resolveTipPool(tipsDb, targetId, schoolType) {
    tipsDb = tipsDb || {};
    const schoolTipKey = getSchoolTipKey(schoolType);
    const keys = [];

    if (tipsDb[targetId]) keys.push(targetId);
    if (targetId === 'shavuot') keys.push('shavuot');
    keys.push(schoolTipKey);

    const uniqueKeys = [...new Set(keys)];
    const pool = uniqueKeys.flatMap((key) => flattenTips(tipsDb[key])).filter(Boolean);
    const fallbackPool = pool.length ? pool : flattenTips(tipsDb);

    return {
        pool: fallbackPool,
        poolKey: `${targetId}_${schoolType || 'default'}_${uniqueKeys.join('_') || 'all'}`
    };
}

function getDailyTipStateKey(targetId, schoolType = userConfig.schoolType) {
    return `${targetId}::${schoolType || 'default'}`;
}

function normalizeDailyTipState(state) {
    if (typeof state === 'number') return { clicks: state, texts: [] };
    if (!state || typeof state !== 'object') return { clicks: 0, texts: [] };

    return {
        clicks: Number(state.clicks) || 0,
        texts: Array.isArray(state.texts) ? state.texts : []
    };
}

function getDailyTipState(targetId) {
    const keyedState = dailyTipsState.targets[getDailyTipStateKey(targetId)];
    if (keyedState) return normalizeDailyTipState(keyedState);
    return normalizeDailyTipState(dailyTipsState.targets[targetId]);
}

function setDailyTipState(targetId, state) {
    dailyTipsState.targets[getDailyTipStateKey(targetId)] = normalizeDailyTipState(state);
}

function loadDailyState() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const saved = localStorage.getItem(dailyTipsStorageKey);
    if (saved) { try { const parsed = JSON.parse(saved); if (parsed.date === todayStr) { dailyTipsState = parsed; return; } } catch (e) { } }
    dailyTipsState = { date: todayStr, targets: {} };
}

function saveDailyState() { localStorage.setItem(dailyTipsStorageKey, JSON.stringify(dailyTipsState)); }

function renderTipBox(targetId, isNewlyClicked = false) {
    const currentState = getDailyTipState(targetId);

    const aiToolsContainer = document.querySelector('.ai-tools');
    const target = typeof activeEventsList !== 'undefined' ? activeEventsList.find(e => e.id === targetId) : null;

    let shouldShowTips = false;
    if (target) {
        if (target.isHappeningNow) {
            shouldShowTips = true;
        } else {
            const nextUpcomingHoliday = activeEventsList.find(e => !e.isHappeningNow && !e.id.startsWith('summer'));
            if (nextUpcomingHoliday && target.id === nextUpcomingHoliday.id) {
                shouldShowTips = true;
            }
            if (target.isSummer) {
                shouldShowTips = true;
            }
        }
    }

    if (aiToolsContainer) {
        aiToolsContainer.style.display = shouldShowTips ? '' : 'none';
    }

    const btn = document.getElementById('main-ai-btn');
    const btnText = document.getElementById('ai-btn-text');
    const sponsorBanner = document.getElementById('tip-sponsor-banner');

    if (sponsorBanner) {
        if (userConfig.schoolType === 'middle' || userConfig.schoolType === 'elem') {
            sponsorBanner.style.display = 'none';
        } else {
            sponsorBanner.style.display = 'block';
            const textElement = sponsorBanner.querySelector('.sponsor-text');
            if (textElement) {
                if (userConfig.schoolType === 'elem') {
                    /* Temporarily disabled
                    if (isNewlyClicked) trackEvent('view_tip_sponsor_elem');

                    sponsorBanner.style.background = 'linear-gradient(135deg, #f3e8ff, #e9d5ff)';
                    sponsorBanner.style.borderColor = '#d8b4fe';
                    sponsorBanner.style.color = '#000000';

                    const elemSponsorOptions = [
                        "לונה פארק, בריכה ועוד?<br><b><span style=\"color: #ff6600;\">תצטרפו לקייטנת אקשן עם אביגיל</span></b>",
                        "פארק מים, קולנוע ועוד?<br><b><span style=\"color: #ff6600;\">תרשמו לקייטנת אקשן עם אביגיל!</span></b>",
                        "הופעה פרטית, גרביטי פארק ועוד?<br><b><span style=\"color: #ff6600;\">תרשמו לקייטנת אקשן עם אביגיל!</span></b>"
                    ];
                    const now = new Date();
                    const start = new Date('2026-05-16');
                    let dayIndex = Math.floor((now - start) / (1000 * 60 * 60 * 24));
                    if (dayIndex < 0) dayIndex = 0;

                    const clickNum = currentState.clicks || 1;
                    const finalIndex = (dayIndex * 3 + clickNum) % elemSponsorOptions.length;
                    const chosenOption = elemSponsorOptions[finalIndex];

                    textElement.innerHTML = `<span aria-hidden="true">🌟</span> ${chosenOption}`;
                    */
                } else if (userConfig.schoolType === 'high') {
                    if (isNewlyClicked) trackEvent('view_tip_jobs_sponsor');

                    sponsorBanner.style.background = '';
                    sponsorBanner.style.borderColor = '';
                    sponsorBanner.style.color = '';

                    textElement.innerHTML = `<span aria-hidden="true">🌟</span> <b style="font-size: 1.05em; color: #1e293b;">רוצים להרוויח הרבה כסף בחופש?</b><br><b style="font-size: 1.15em; text-decoration: underline;">לחצו כאן (16+)</b>`;
                }
            }
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const isDemo = urlParams.get('show_demo') === 'true';
    const isVacation = (isDemo && target) || (target && target.isHappeningNow);

    if (currentState.clicks > 0 && currentState.texts && currentState.texts.length > 0) {
        const latestTip = currentState.texts[currentState.texts.length - 1];
        const title = currentState.clicks === 1 ? (isVacation ? "המשימה היומית" : "הטיפ היומי") : "טיפ נוסף";
        const secondTipText = isVacation ? "לחצו לטיפ אופטימיות יומי ✨" : "לחצו כאן לטיפ נוסף ✨";
        let extraHTML = currentState.clicks === 1 ? `<span style="font-size: calc(13px * var(--text-scale, 1)); color: var(--primary-hover); margin-top: 8px; display: block;">${secondTipText}</span>` : `<span style="font-size: calc(13px * var(--text-scale, 1)); color: var(--text-muted); margin-top: 8px; display: block;">טיפ חדש יופיע מחר ✨</span>`;

        const titleIcon = isVacation && currentState.clicks === 1 ? "⚡" : "✨";
        btnText.innerHTML = `<b style="color: var(--text-main); font-size: calc(16px * var(--text-scale, 1));">${title} ${titleIcon}</b><br><span style="color: var(--text-main); font-weight: 600;">${latestTip}</span>${extraHTML}`;
        btn.classList.add('has-tip');

        if (isNewlyClicked) {
            btn.style.transition = 'none'; btn.style.animation = 'none'; void btn.offsetWidth;
            btn.style.animation = 'tipUpdateAnim 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
            setTimeout(() => { btn.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease'; }, 600);

            if (sponsorBanner && (userConfig.schoolType === 'high')) { // || userConfig.schoolType === 'elem'
                sponsorBanner.style.display = 'flex'; sponsorBanner.style.animation = 'none'; void sponsorBanner.offsetWidth;
                sponsorBanner.style.animation = 'tipUpdateAnim 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                if (userConfig.schoolType === 'elem') {
                    // trackEvent('view_ad_avigail_tip');
                } else {
                    trackEvent('view_ad_vip_tip');
                }
            }
            setTimeout(() => {
                window.scrollBy({ top: 70, behavior: 'smooth' });
            }, 150);
        } else {
            if (sponsorBanner) sponsorBanner.style.display = 'none';
        }

        if (currentState.clicks >= 2) { btn.disabled = true; btn.style.pointerEvents = 'none'; btn.setAttribute('aria-disabled', 'true'); }
        else { btn.disabled = false; btn.style.pointerEvents = 'auto'; btn.removeAttribute('aria-disabled'); }
    } else {
        btnText.innerHTML = isVacation ? "לחצו למשימה היומית ⚡" : "לחצו לטיפ אופטימיות יומי ✨";
        btn.classList.remove('has-tip'); btn.disabled = false; btn.style.pointerEvents = 'auto';
        if (sponsorBanner) sponsorBanner.style.display = 'none';
    }
}

async function getSmartTip(targetId, schoolType, tipNumber) {
    if (tipNumber === 1) {
        const _d = new Date();
        const _il = new Date(_d.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
        const _str = `${_il.getFullYear()}-${String(_il.getMonth() + 1).padStart(2, '0')}-${String(_il.getDate()).padStart(2, '0')}`;
        if (_str === '2026-06-27') {
            return "המורה אמרה “נשאר לנו רק נושא קטן” ואז התחילה סופת שלגים של סיכומים, דפים ומבטי ייאוש. 📚😵💫";
        }
        if (_str === '2026-06-28') {
            return "המזגן בכיתה עובד כאילו הוא קיבל משימה אישית להפוך את יוני לסופת שלגים. 🥶☀️";
        }
    }

    const tipsDb = await loadTipsDatabase();

    // Check if we are in vacation mode AND demo parameter is true
    const urlParams = new URLSearchParams(window.location.search);
    const isDemo = urlParams.get('show_demo') === 'true';
    const target = typeof activeEventsList !== 'undefined' ? activeEventsList.find(e => e.id === targetId) : null;

    let poolKeyOverride = null;
    let fallbackSchoolType = schoolType === 'middle' ? 'high' : schoolType;
    let baseTargetName = targetId.replace(/\d+$/, ''); // remove year

    // Map the internal target names to the ones used in tips.js
    const targetMap = {
        'summerHigh': 'summer',
        'summerElem': 'summer',
        'summerElemLow': 'summer',
        'summerMiddlePrep': 'summer',
        'pesach': 'pesach',
        'atzmaut': 'atzmaut',
        'roshHashana': 'roshHashana',
        'kippurSukkot': 'kippurSukkot',
        'hanukkah': 'hanukkah',
        'purim': 'purim',
        'shavuot': 'shavuot',
        'lagbaomer': 'lagbaomer'
    };
    if (targetMap[baseTargetName]) baseTargetName = targetMap[baseTargetName];

    const isCountdown = target && !target.isHappeningNow && !isDemo;

    if (isCountdown) {
        const waitTargetName = baseTargetName === 'kippurSukkot' ? 'sukkot' : baseTargetName;
        poolKeyOverride = `waiting_${waitTargetName}_${fallbackSchoolType}`;
    } else {
        poolKeyOverride = `vacation_${baseTargetName}_${fallbackSchoolType}_${tipNumber}`;
        if (!tipsDb[poolKeyOverride]) {
            poolKeyOverride = `vacation_${baseTargetName}_${fallbackSchoolType}_1`;
        }
    }

    let pool = [];
    if (poolKeyOverride && tipsDb[poolKeyOverride]) {
        pool = flattenTips(tipsDb[poolKeyOverride]);
    } else {
        const resolved = resolveTipPool(tipsDb, targetId, schoolType);
        pool = resolved.pool;
    }

    if (!pool.length) throw new Error('No tips are available for the selected context');

    // יצירת אינדקס דטרמיניסטי לפי התאריך (מאופס מהיום כדי שטיפים חדשים יופיעו קודם)
    const now = new Date();
    const start = new Date('2026-05-16');
    let dayIndex = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    if (dayIndex < 0) dayIndex = 0;

    // בחירת אינדקס בצורה עוקבת כדי למנוע חזרות ככל הניתן
    let finalIndex;
    if (poolKeyOverride && tipsDb[poolKeyOverride]) {
        if (isCountdown) {
            if (tipNumber === 1) {
                finalIndex = (dayIndex * 2) % pool.length;
            } else {
                finalIndex = (dayIndex * 2 + 1) % pool.length;
            }
        } else {
            // For vacation mode, each tipNumber is a separate list, so we just use dayIndex
            finalIndex = dayIndex % pool.length;
        }
    } else {
        if ((isDemo && target) || (target && target.isHappeningNow)) {
            // During vacation, tip 1 is a recommendation, so tip 2 is the ONLY regular tip per day.
            // Advance regular pool by 1 per day instead of 2.
            finalIndex = dayIndex % pool.length;
        } else {
            // כל יום "מתקדמים" ב-2 טיפים בתוך המאגר
            finalIndex = (dayIndex * 2 + (tipNumber - 1)) % pool.length;
        }
    }

    return pool[finalIndex];
}

function handleAiTip() {
    loadDailyState();
    const targetId = userConfig.activeTargetId;
    const currentState = getDailyTipState(targetId);
    if (currentState.clicks >= 2) return;

    const btn = document.getElementById('main-ai-btn'); const btnText = document.getElementById('ai-btn-text'); const loader = document.getElementById('ai-btn-loader');
    btn.style.opacity = '0.7'; btn.style.pointerEvents = 'none'; btn.style.transform = 'scale(0.98)';
    loader.style.display = 'inline-block'; btnText.innerHTML = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];

    const target = activeEventsList.find(e => e.id === targetId);
    if (!target) {
        btn.style.opacity = '1'; btn.style.transform = 'scale(1)'; loader.style.display = 'none'; btn.style.pointerEvents = 'auto';
        return;
    }
    const schoolNamesEng = { 'elem': 'elementary', 'middle': 'middle', 'high': 'high' };
    const schoolNameEng = schoolNamesEng[userConfig.schoolType] || userConfig.schoolType;

    // שליחת אירוע עם שם ייחודי באנגלית
    const descriptiveEventName = `tip_${currentState.clicks + 1}_${schoolNameEng}`;
    trackEvent(descriptiveEventName, {
        'target_id': target.id,
        'school_type': userConfig.schoolType,
        'tip_number': currentState.clicks + 1,
        'tip_label': `Tip ${currentState.clicks + 1} ${schoolNameEng}`
    });

    // גיבוי עם השם הכללי
    trackEvent('click_ai_tip', {
        'school_type': schoolNameEng,
        'tip_number': currentState.clicks + 1
    });

    setTimeout(async () => {
        try {
            const selectedTip = await getSmartTip(target.id, userConfig.schoolType, currentState.clicks + 1);
            currentState.clicks++; if (!currentState.texts) currentState.texts = [];
            currentState.texts.push(selectedTip); setDailyTipState(targetId, currentState); saveDailyState();
            renderTipBox(targetId, true);
        } catch (error) {
            console.error(error);
            trackEvent('tip_load_failed', { 'target_id': target.id });
            btnText.innerHTML = "לא הצלחנו לטעון טיפ כרגע. נסו שוב עוד רגע ✨";
            btn.disabled = false; btn.style.pointerEvents = 'auto'; btn.removeAttribute('aria-disabled');
        } finally {
            btn.style.opacity = '1'; btn.style.transform = 'scale(1)'; loader.style.display = 'none';
        }
    }, 800);
}
function updateNextVacationButtonText() {
    const btn = document.getElementById('btn-next-vacation');
    if (!btn) return;
    
    const choice = document.querySelector('input[name="schoolType"]:checked');
    const schoolType = choice ? choice.value : 'elem';
    
    const now = Date.now();
    const currentTargets = [...allTargets, ...targets2027];
    
    let isVacationNow = false;
    for (const e of currentTargets) {
        if (e.type && e.type !== schoolType && !(schoolType === 'middle' && e.id.startsWith('summerHigh'))) continue;
        if (e.id === 'summerMiddlePrep' || e.id === 'summerElemLow' || e.id.startsWith('atzmaut') || e.id.startsWith('lagbaomer')) continue;
        
        if (e.isSummer) {
            const summerEnd = new Date(e.date.getFullYear(), 8, 1);
            if (e.date.getTime() <= now && now < summerEnd.getTime()) {
                isVacationNow = true;
                break;
            }
        } else {
            const durationMap = {
                'atzmaut': 1, 'lagbaomer': 1, 'shavuot': 3,
                'roshHashana': 3, 'kippurSukkot': 14, 'hanukkah': 8,
                'purim': 2, 'pesach': 16
            };
            const baseName = e.id.replace(/\d+$/, '');
            const days = durationMap[baseName] || 1;
            const endDate = new Date(e.date.getTime() + days * 86400000);
            if (e.date.getTime() <= now && now < endDate.getTime()) {
                isVacationNow = true;
                break;
            }
        }
    }
    
    if (isVacationNow) {
        btn.innerHTML = 'כמה ימים נשאר לחופש הנוכחי? <span aria-hidden="true" style="font-size: 1.15em;">⏳</span>';
    } else {
        btn.innerHTML = 'התחל ספירה לחופש הקרוב <span aria-hidden="true" style="font-size: 1.15em;">🚀</span>';
    }
}

window.onload = () => {
    updateNextVacationButtonText();
    initPWA();
    setupManualCopyListener();
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('show_demo') === 'true') {
        document.title = "מתי באמת החופש? ספירה לאחור בלי שבתות שישי וחגים | נטו חופש";
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute("content", "מתי באמת החופש? ספירה לאחור בלי שבתות שישי וחגים | נטו חופש");
        
        const seoFooterH2 = document.querySelector('.seo-footer h2');
        if (seoFooterH2) seoFooterH2.textContent = "מתי באמת החופש 2026? ספירה לאחור - נטו חופש";
        
        const setupSteps = document.querySelectorAll('.setup-step');
        if (setupSteps.length >= 2) {
            setupSteps[1].style.marginTop = '2px';
        }
    }

    if (urlParams.get('install') === '1') {
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
            trackEvent('opened_from_auto_safari');
            document.getElementById('modal-safari-content').style.display = 'block';
            document.getElementById('modal-nonsafari-content').style.display = 'none';
            document.getElementById('modal-android-content').style.display = 'none';
            document.getElementById('ios-modal').style.display = 'flex';
        }, 500);
    }

    // תמיכה במקלדת ונגישות לסגירת חלונות
    document.addEventListener('keydown', function (event) {
        if (event.key === "Escape") {
            closeIosModal();
            closeVipModal();
            closeLegalModal();
            document.getElementById('a11y-menu').style.display = 'none';
        }
    });
};

function initApp(countdownTarget = 'summer') {
    const choice = document.querySelector('input[name="schoolType"]:checked');
    if (!choice) { document.getElementById('error-message').style.display = 'block'; return; }
    window.scrollTo(0, 0);
    userConfig.schoolType = choice.value; userConfig.studyFriday = document.getElementById('friday-toggle').checked;

    userConfig.targetIntent = countdownTarget;

    const schoolNamesEng = { 'elem': 'elementary', 'middle': 'middle', 'high': 'high' };
    const schoolNameEng = schoolNamesEng[userConfig.schoolType] || userConfig.schoolType;

    // שליחת אירוע ספציפי לסוג בית הספר (באנגלית)
    trackEvent('start_' + schoolNameEng);

    // אירוע כללי עם פרמטרים לניתוח קל יותר
    trackEvent('app_start', {
        'school_type': schoolNameEng,
        'study_friday': userConfig.studyFriday ? 'yes' : 'no'
    });

    showMainScreen();
    // גלילה קלה למטה כדי שיראו את ה"בחרו יעד ספירה" והבאנר לא יסתיר
    setTimeout(() => {
        window.scrollTo({ top: 50, behavior: 'smooth' });
    }, 100);
}

function resetApp() {
    window.scrollTo(0, 0); trackEvent('click_change_settings');
    if (timerInterval) clearInterval(timerInterval);
    userConfig = { schoolType: '', studyFriday: false, activeTargetId: '' }; confettiFired = false;
    document.getElementById('main-screen').style.display = 'none'; document.getElementById('setup-screen').style.display = 'flex';

    const btn = document.getElementById('main-ai-btn'); document.getElementById('ai-btn-text').innerHTML = "לחצו לטיפ אופטימיות יומי ✨";
    btn.classList.remove('has-tip'); btn.disabled = false; btn.style.pointerEvents = 'auto';
    const sponsorBanner = document.getElementById('tip-sponsor-banner'); if (sponsorBanner) sponsorBanner.style.display = 'none';
    const elemSocial = document.getElementById('social-elem-banner'); if (elemSocial) elemSocial.style.display = 'none';
    const highSocial = document.getElementById('social-high-banner'); if (highSocial) highSocial.style.display = 'none';
    const demoBanner = document.getElementById('demo-banner'); if (demoBanner) demoBanner.style.display = 'none';
    const avigailBanner = document.getElementById('avigail-banner'); if (avigailBanner) avigailBanner.style.display = 'none';
    const jobsBanner = document.getElementById('jobs-banner'); if (jobsBanner) jobsBanner.style.display = 'none';
}

function updateSchoolSelection(radio) {
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    radio.parentElement.classList.add('selected');
    updateNextVacationButtonText();
}

function updateFridayToggle() {
    const toggle = document.getElementById('friday-toggle'); trackEvent('toggle_friday', { 'study_friday': toggle.checked });
    const hint = document.getElementById('friday-hint-text');
    hint.textContent = toggle.checked ? 'כן, יש לנו לימודים בשישי ☹️' : 'לא, אצלנו שישי זה חופש 😊';
    hint.style.color = toggle.checked ? '#ef4444' : 'var(--text-muted)';
}

function calculateNetDays(targetDate, forceNoFriday = false, targetId = null) {
    const now = new Date(); let count = 0, current = new Date(now);
    // אם השעה 15:00 ומעלה, היום הנוכחי כבר לא נחשב כיום לימודים (התלמידים סיימו)
    if (now.getHours() >= 15) current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);

    // מאפסים את שעת יעד הספירה לחצות כדי שיום תחילת החופש עצמו לא ייספר כיום לימודים
    const targetNormalized = new Date(targetDate);
    targetNormalized.setHours(0, 0, 0, 0);

    while (current < targetNormalized) {
        const dStr = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0') + '-' + String(current.getDate()).padStart(2, '0');

        let isSummerDay = false;
        if (userConfig.schoolType === 'elem') {
            if (current.getMonth() === 6 || current.getMonth() === 7) isSummerDay = true;
        } else {
            if ((current.getMonth() === 5 && current.getDate() >= 21) || current.getMonth() === 6 || current.getMonth() === 7) isSummerDay = true;
            if (current.getFullYear() === 2026 && current.getMonth() === 5 && current.getDate() >= 19) isSummerDay = true;
        }

        if (isSummerDay && targetId !== 'summerMiddlePrep' && targetId !== 'summerElemLow') {
            current.setDate(current.getDate() + 1);
            continue;
        }

        // ימי שישי של בית הספר של החופש הגדול ביולי אינם נלמדים (גם אם לומדים בשישי בשגרת הלימודים)
        const isJulyOrLater = current.getMonth() >= 6; // 6 = July
        const isFridayStudy = userConfig.studyFriday && !(forceNoFriday && isJulyOrLater);
        if (current.getDay() !== 6 && (current.getDay() !== 5 || isFridayStudy) && !activeHolidays.includes(dStr)) count++;
        current.setDate(current.getDate() + 1);
    }
    return count;
}

function animateNetDays(finalValue) {
    if (netDaysAnimationId) { cancelAnimationFrame(netDaysAnimationId); netDaysAnimationId = null; }
    if (typeof finalValue !== 'number' || finalValue <= 0) { document.getElementById('main-net-days').textContent = finalValue <= 0 ? "הגיע!" : finalValue; isAnimatingNetDays = false; return; }

    isAnimatingNetDays = true; const obj = document.getElementById('main-net-days');
    const startValue = finalValue + 75; const duration = 1500; let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(startValue - (startValue - finalValue) * easeProgress);
        obj.textContent = currentVal;

        if (progress < 1) netDaysAnimationId = window.requestAnimationFrame(step);
        else { obj.textContent = finalValue; isAnimatingNetDays = false; netDaysAnimationId = null; }
    };
    netDaysAnimationId = window.requestAnimationFrame(step);
}

function showMainScreen() {
    document.getElementById('setup-screen').style.display = 'none'; document.getElementById('main-screen').style.display = 'flex';
    document.getElementById('excluding-label').textContent = userConfig.studyFriday ? "(בניכוי חגים ושבתות)" : "(בניכוי חגים, שישי ושבת)";

    const demoBanner = document.getElementById('demo-banner');
    const avigailBanner = document.getElementById('avigail-banner');
    const jobsBanner = document.getElementById('jobs-banner');
    const highSocial = document.getElementById('social-high-banner');
    const elemSocial = document.getElementById('social-elem-banner');

    const isExperimentalSite = window.location.hostname.includes('github.io');
    const urlParams = new URLSearchParams(window.location.search);
    const isDemo = urlParams.get('show_demo') === 'true' || isExperimentalSite;

    if (!allTargets.find(t => t.id === 'roshHashana2026')) {
        allTargets.push(...targets2027);
        activeHolidays.push(...holidays2027);
    }

    if (userConfig.schoolType === 'elem') {
        if (demoBanner) {
            demoBanner.style.display = 'none';
            // trackEvent('view_ad_summer_wheels_sticky');
        }
        if (avigailBanner) {
            // avigailBanner.style.display = 'flex';
            // trackEvent('view_ad_avigail_sticky');
            avigailBanner.style.display = 'none';
        }
        if (jobsBanner) jobsBanner.style.display = 'none';

        if (highSocial) highSocial.style.display = 'none';
        if (elemSocial) elemSocial.style.display = 'block';
    } else if (userConfig.schoolType === 'high') {
        if (demoBanner) demoBanner.style.display = 'none';
        if (avigailBanner) avigailBanner.style.display = 'none';
        if (jobsBanner) {
            jobsBanner.style.display = 'flex';
            trackEvent('view_ad_jobs_sticky');

            const isAndroid = /Android/i.test(navigator.userAgent);
            const jobsLink = document.getElementById('jobs-banner-link');
            const jobsImg = document.getElementById('jobs-banner-img');

            if (jobsLink && jobsImg) {
                if (isAndroid) {
                    jobsLink.href = "https://play.google.com/store/apps/details?id=com.hagovistim.app";
                    jobsImg.src = "assets/images/jobs-banner-android.jpeg?v=10";
                    jobsLink.onclick = function () { trackEvent('click_ad_jobs_sticky'); trackEvent('click_ad_jobs_android'); };
                } else {
                    jobsLink.href = "https://chat.whatsapp.com/GbuLGylKq5216WxoKKDKWe";
                    jobsImg.src = "assets/images/jobs-banner-iphone.jpg?v=10";
                    jobsLink.onclick = function () { trackEvent('click_ad_jobs_sticky'); trackEvent('click_ad_jobs_iphone'); };
                }
            }
        }
        if (highSocial) highSocial.style.display = 'block';
        if (elemSocial) elemSocial.style.display = 'none';
    } else {
        if (demoBanner) demoBanner.style.display = 'none';
        if (avigailBanner) avigailBanner.style.display = 'none';
        if (jobsBanner) jobsBanner.style.display = 'none';
        if (highSocial) highSocial.style.display = 'block';
        if (elemSocial) elemSocial.style.display = 'none';
    }

    const summerHighObj = allTargets.find(t => t.id === 'summerHigh');
    if (summerHighObj) { if (!userConfig.studyFriday) summerHighObj.date = new Date('2026-06-18T08:15:00'); else summerHighObj.date = new Date('2026-06-19T08:15:00'); }

    // 2027 High school summer vacation ALWAYS starts on June 21, since June 20 is a Sunday.
    // No dynamic adjustment needed for summerHigh2027.

    const summerElemLowObj = allTargets.find(t => t.id === 'summerElemLow');
    if (summerElemLowObj) { if (!userConfig.studyFriday) summerElemLowObj.date = new Date('2026-07-30T08:15:00'); else summerElemLowObj.date = new Date('2026-07-31T08:15:00'); }

    const now = Date.now();
    activeEventsList = allTargets.filter(e => {
        let isHappening = false;

        if (e.isSummer) {
            const summerEnd = new Date(e.date.getFullYear(), 8, 1);
            if (e.date.getTime() <= now && now < summerEnd.getTime()) {
                isHappening = true;
                e.isHappeningNow = true;
                e.endDate = summerEnd;
            }
        } else {
            const durationMap = {
                'atzmaut': 1, 'lagbaomer': 1, 'shavuot': 3,
                'roshHashana': 3, 'kippurSukkot': 14, 'hanukkah': 8,
                'purim': 2, 'pesach': 16
            };
            const baseName = e.id.replace(/\d+$/, '');
            const days = durationMap[baseName] || 1;
            const endDate = new Date(e.date.getTime() + days * 86400000);

            if (e.date.getTime() <= now && now < endDate.getTime()) {
                isHappening = true;
                e.isHappeningNow = true;
                e.endDate = endDate;
            }
        }

        if (e.date.getTime() <= now && !isHappening) return false;

        if (e.type) {
            if (userConfig.schoolType === 'elem' && e.type !== 'elem') return false;
            if (userConfig.schoolType === 'middle' && !(e.type === 'middle' || (e.type === 'high' && e.id.startsWith('summerHigh')))) return false;
            if (userConfig.schoolType === 'high' && e.type !== 'high') return false;
        }

        if (!e.isSummer) return true;

        if (userConfig.schoolType === 'elem') return e.type === 'elem';
        if (userConfig.schoolType === 'middle') return e.type === 'middle' || (e.type === 'high' && e.id.startsWith('summerHigh'));
        if (userConfig.schoolType === 'high') return e.type === 'high';
        return false;
    });
    activeEventsList.sort((a, b) => a.date - b.date); 
    
    if (userConfig.targetIntent) {
        let selectedId = '';
        if (userConfig.targetIntent === 'next') {
            const nextVacation = activeEventsList.find(t => 
                !t.id.startsWith('atzmaut') && 
                !t.id.startsWith('lagbaomer') && 
                t.id !== 'summerMiddlePrep' && 
                t.id !== 'summerElemLow'
            );
            selectedId = nextVacation ? nextVacation.id : activeEventsList[0].id;
        } else if (userConfig.targetIntent === 'summer') {
            const nextSummer = activeEventsList.find(t => t.isSummer);
            selectedId = nextSummer ? nextSummer.id : activeEventsList[0].id;
        }
        userConfig.activeTargetId = selectedId;
        userConfig.targetIntent = null;
    }

    renderHolidays(); 
    selectTarget(userConfig.activeTargetId || activeEventsList[0].id, false);
    if (timerInterval) clearInterval(timerInterval); timerInterval = setInterval(updateDashboard, 1000);
}

function renderHolidays() {
    const container = document.getElementById('holidays-container'); container.innerHTML = '';
    activeEventsList.forEach(ev => {
        const card = document.createElement('button');
        card.className = `holiday-card ${ev.id === userConfig.activeTargetId ? 'active' : ''}`;
        card.onclick = () => selectTarget(ev.id);

        let subText = `ב-${ev.date.toLocaleDateString('he-IL')}`;
        if (ev.description) subText = ev.description;

        card.innerHTML = `<div><b>${ev.name} <span aria-hidden="true">${ev.icon}</span></b><br><small>${subText}</small></div>`;
        card.setAttribute('aria-label', `ספירה לחג ${ev.name}`);
        container.appendChild(card);
    });
}

function selectTarget(id, shouldScroll = true) {
    if (userConfig.activeTargetId !== id && userConfig.activeTargetId !== '') trackEvent('select_target_holiday', { 'holiday_id': id });
    if (shouldScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    userConfig.activeTargetId = id; confettiFired = false;
    const target = activeEventsList.find(e => e.id === id); if (!target) return;
    document.getElementById('main-timer-bg').style.background = target.bg;
    const timerBg = document.getElementById('main-timer-bg');

    const netDaysPrefix = document.getElementById('net-days-prefix');
    const netDaysSuffix = document.getElementById('net-days-suffix');
    const excludingLabel = document.getElementById('excluding-label');
    const vacationBox = document.getElementById('vacation-length-box');
    const absoluteTimer = document.getElementById('absolute-timer-container');
    const vacationMessage = document.getElementById('vacation-message');
    const totalDaysLabel = document.getElementById('total-days-label');

    if (target.isHappeningNow) {
        timerBg.classList.add('vacation-mode');
        document.getElementById('main-target-title').textContent = `${target.name} כבר כאן! ${target.icon}`;
        if (netDaysPrefix) {
            netDaysPrefix.style.display = 'block';
            netDaysPrefix.textContent = 'נשארו:';
        }
        if (netDaysSuffix) netDaysSuffix.textContent = 'ימים עד חזרה ללימודים';
        if (excludingLabel) excludingLabel.style.display = 'none';
        if (vacationBox) vacationBox.style.display = 'none';
        if (absoluteTimer) absoluteTimer.style.display = 'none';
        if (totalDaysLabel) totalDaysLabel.style.display = 'none';
        if (vacationMessage) vacationMessage.style.display = 'block';
    } else {
        timerBg.classList.remove('vacation-mode');
        document.getElementById('main-target-title').textContent = `עד ${target.name} ${target.icon}`;
        if (netDaysPrefix) {
            netDaysPrefix.style.display = 'block';
            netDaysPrefix.textContent = 'נשארו רק:';
        }
        if (netDaysSuffix) netDaysSuffix.textContent = 'ימי לימוד נטו!';
        if (excludingLabel) {
            excludingLabel.style.display = 'block';
            if (target.noFriday) {
                excludingLabel.textContent = userConfig.studyFriday ? "(בניכוי חגים, שבתות, וימי שישי של קייטנת הקיץ)" : "(בניכוי חגים, שישי ושבת)";
            } else {
                excludingLabel.textContent = userConfig.studyFriday ? "(בניכוי חגים ושבתות)" : "(בניכוי חגים, שישי ושבת)";
            }
        }
        if (vacationBox) {
            let lengthText = '';
            if (target.isSummer) {
                const endOfSchool = new Date(target.date); endOfSchool.setHours(0, 0, 0, 0); const startOfSchool = new Date(target.date.getFullYear(), 8, 1);
                lengthText = `<b>${Math.round((startOfSchool - endOfSchool) / 86400000)} ימים</b>`;
            } else if (target.lengthText) {
                lengthText = target.lengthText;
            }
            if (lengthText) {
                document.getElementById('vacation-days-count').innerHTML = `החופש יימשך ${lengthText}`;
                vacationBox.style.display = 'inline-block';
            } else {
                vacationBox.style.display = 'none';
            }
        }
        if (absoluteTimer) absoluteTimer.style.display = 'flex';
        if (totalDaysLabel) totalDaysLabel.style.display = 'block';
        if (vacationMessage) vacationMessage.style.display = 'none';
    }

    loadDailyState(); renderTipBox(id); renderHolidays();
    const netDays = calculateNetDays(target.date, target.noFriday, target.id); animateNetDays(netDays); updateDashboard();
}

function updateDashboard() {
    const event = activeEventsList.find(e => e.id === userConfig.activeTargetId); if (!event) return;
    const nowTime = new Date(); const todayStr = `${nowTime.getFullYear()}-${nowTime.getMonth() + 1}-${nowTime.getDate()}`;
    if (dailyTipsState.date && dailyTipsState.date !== todayStr) { loadDailyState(); renderTipBox(userConfig.activeTargetId); }

    let diff = event.date.getTime() - Date.now();
    if (event.isHappeningNow) {
        diff = event.endDate.getTime() - Date.now();
    }

    if (diff <= 0) {
        document.getElementById('main-net-days').textContent = "הגיע!";
        if (!event.isHappeningNow && !confettiFired) { confettiFired = true; confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); }
    } else {
        document.getElementById('abs-days').textContent = Math.floor(diff / 86400000);
        document.getElementById('abs-hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
        document.getElementById('abs-mins').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        document.getElementById('abs-secs').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        if (!isAnimatingNetDays) {
            if (event.isHappeningNow) {
                document.getElementById('main-net-days').textContent = Math.ceil(diff / 86400000);
            } else {
                document.getElementById('main-net-days').textContent = calculateNetDays(event.date, event.noFriday, event.id);
            }
        }
    }
}

function shareWhatsApp(event) {
    event.preventDefault(); trackEvent('share_whatsapp_click');
    const text = `מצאתי אתר שמראה כמה ימי לימוד נטו נשאר עד החופש! 🏖️😱\nכנסו לבדוק >> http://neto-hofesh.co.il/`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}


// --- מנגנון חלוניות משפטיות והצהרת נגישות תקנית ---
function openLegalModal(type) {
    const content = document.getElementById('legal-content');
    let html = '';

    if (type === 'terms') {
        html = `<h2 style="font-size: calc(20px * var(--text-scale, 1)); margin-bottom: 15px; color: #1e293b;">תנאי שימוש והגבלת אחריות</h2>
            <div style="font-size: calc(14px * var(--text-scale, 1)); color: #475569; line-height: 1.6;">
                <p>ברוכים הבאים לאתר "נטו חופש". השימוש באתר מותנה בהסכמתכם לתנאים אלו:</p>
                <p>1. <b>ייעוד האתר:</b> האתר מספק ספירה לאחור הערכתית למועדי חופשות. הנתונים אינם רשמיים ואינם מהווים אסמכתא. האתר מסופק לשימוש "כמות שהוא" (AS IS).</p>
                <p>2. <b>פטור מאחריות פרסומים:</b> <u>האתר מציג המלצות, קישורים ממומנים ותוכן צד ג' (כגון הרשמה לפאנל סקרים / מפרסמים). האתר ו/או מפעיליו אינם אחראים בשום צורה לתוכן זה, לטיבו, למהימנותו או לנגישותו. כל התקשרות בין המשתמש לצד ג' הינה על אחריות המשתמש בלבד.</u></p>
                <p>3. <b>אחריות טכנית:</b> בעל האתר לא יישא באחריות לכל תקלה, שיבוש או נזק (ישיר או עקיף) הנובעים מהשימוש באתר.</p>
            </div>`;
    } else if (type === 'privacy') {
        html = `<h2 style="font-size: calc(20px * var(--text-scale, 1)); margin-bottom: 15px; color: #1e293b;">מדיניות פרטיות</h2>
            <div style="font-size: calc(14px * var(--text-scale, 1)); color: #475569; line-height: 1.6;">
                <p>1. <b>איסוף נתונים אנונימיים:</b> האתר משתמש ב-Google Analytics לשם איסוף נתונים סטטיסטיים אנונימיים (כגון סוג דפדפן, דפים נצפים). איננו אוספים מידע אישי מזהה.</p>
                <p>2. <b>Cookies (קובצי עוגיות):</b> האתר משתמש בקובצי עוגיות כדי לשמור את העדפות המשתמש (למשל, סוג בית הספר והטיפים שכבר נקראו) כדי לשפר את חווית הגלישה.</p>
                <p>3. <b>צדדים שלישיים:</b> מידע סטטיסטי עשוי להיות מעובד על ידי שרתי גוגל בכפוף למדיניות הפרטיות שלהם.</p>
            </div>`;
    } else if (type === 'accessibility') {
        html = `<h2 style="font-size: calc(20px * var(--text-scale, 1)); margin-bottom: 15px; color: #1e293b;">הצהרת נגישות משפטית</h2>
            <div style="font-size: calc(14px * var(--text-scale, 1)); color: #475569; line-height: 1.6;">
                <p>מפעיל האתר רואה חשיבות עליונה בהנגשת האתר לאנשים עם מוגבלויות, בהתאם להוראות חוק שוויון זכויות לאנשים עם מוגבלות ותקן ישראלי 5568 (ברמת AA).</p>
                <p><b>התאמות שבוצעו באתר:</b><br>
                ✔ כפתור נגישות ייעודי להגדלת פונט, ניגודיות גבוהה והדגשת קישורים.<br>
                ✔ תמיכה מלאה בניווט מקלדת (מקש Tab ומקש Escape לסגירת חלונות).<br>
                ✔ התאמה לקוראי מסך (הסתרת אלמנטים גרפיים עם aria-hidden והוספת aria-labels).<br>
                ✔ עיצוב רספונסיבי המותאם לכל סוגי המסכים.</p>
                <p><b>הגבלת אחריות לתוכן צד שלישי:</b><br>
                יודגש כי האתר כולל הפניות, המלצות ופרסומות של צדדים שלישיים (כגון אתרי סקרים ומועדוני צרכנות). תכנים אלו מופעלים על ידי גורמים חיצוניים, <b>ונגישותם הינה באחריות המפרסמים בלבד</b>. מפעיל האתר אינו אחראי לנגישות של אתרים חיצוניים אלו.</p>
                <p><b>דיווח על תקלות:</b><br>
                אם נתקלתם בבעיית נגישות כלשהי באתר עצמו, נשמח אם תפנו אלינו כדי שנוכל לתקן זאת בהקדם. ניתן לפנות לרכז הנגישות, יונתן לבנוב, בדוא"ל: <a href="mailto:levanov.yonatan@gmail.com" style="color:#0ea5e9;">levanov.yonatan@gmail.com</a>.</p>
                <p><small>תאריך עדכון אחרון: מאי 2026</small></p>
            </div>`;
    }

    content.innerHTML = html;
    document.getElementById('legal-modal').style.display = 'flex';
    document.getElementById('legal-modal').focus();
    trackEvent('view_legal_' + type);
}

function closeLegalModal() {
    document.getElementById('legal-modal').style.display = 'none';
}

// חסימת מקשים (למניעת העתקה)
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', function (e) {
    if (e.key === 'F12' || e.keyCode === 123) return e.preventDefault(), false;
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) return e.preventDefault(), false;
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) return e.preventDefault(), false;
    if (e.ctrlKey && (e.key === 'S' || e.key === 's')) return e.preventDefault(), false;
});

// אתחול מראש של נגן ה-Vimeo לביצועים מהירים
document.addEventListener('DOMContentLoaded', () => {
    const vidElement = document.getElementById('promo-video');
    if (vidElement && vidElement.tagName === 'IFRAME' && typeof Vimeo !== 'undefined' && !vimeoPlayerInstance) {
        vimeoPlayerInstance = new Vimeo.Player(vidElement);
        vimeoPlayerInstance.on('ended', () => { highlightCopyButton(); trackEvent('ended_promo_video_vimeo'); });
        vimeoPlayerInstance.on('play', () => {
            const hint = document.getElementById('video-click-hint');
            if (hint) hint.style.display = 'none';
            // Final attempt to ensure sound after play starts
            setTimeout(() => {
                if (vimeoPlayerInstance) {
                    vimeoPlayerInstance.setMuted(false).catch(() => { });
                    vimeoPlayerInstance.setVolume(1).catch(() => { });
                }
            }, 100);
        });
    }
});

// פונקציית אנימציית גולש עבור האתר הנסיוני בלבד
let surferClickCount = 0;
let surferClickTimer = null;

function triggerSurferAnimation() {
    surferClickCount++;
    clearTimeout(surferClickTimer);

    surferClickTimer = setTimeout(() => {
        if (surferClickCount === 1) {
            const timer = document.querySelector('.absolute-timer');
            if (timer && !timer.querySelector('.surfer-passenger')) {
                trackEvent('view_easter_egg_surfer');
                const surfer = document.createElement('div');
                surfer.className = 'surfer-passenger surf-right-to-left';
                surfer.innerHTML = '🏄‍♂️';
                timer.appendChild(surfer);

                surfer.addEventListener('animationend', () => {
                    surfer.remove();
                });
            }
        } else if (surferClickCount === 2) {
            // Airplane Easter Egg
            if (!document.querySelector('.airplane-container')) {
                trackEvent('view_easter_egg_airplane');
                const airplane = document.createElement('div');
                airplane.className = 'airplane-container';
                airplane.innerHTML = `
                    <div class="airplane-banner">עוד קצת וטסים לחופש! ☀️</div>
                    <div class="airplane-emoji">✈️</div>
                `;
                document.body.appendChild(airplane);

                airplane.addEventListener('animationend', () => {
                    airplane.remove();
                });
            }
        }
        surferClickCount = 0;
    }, 300);
}

// Demo Site specific logic removed as requested by user.
