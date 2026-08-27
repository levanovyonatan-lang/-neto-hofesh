
function updateSponsorTexts() {
    const sponsorOptions = [
        "מרגיש שאתה יכול יותר? 💪<br><b><span style='color: #166534;'>בוא לפרוץ את הגבולות שלך עם אימוני כוח מטורפים</span></b>",
        "נמאס לשבת מול המסך כל היום?<br><b><span style='color: #166534;'>אימוני אקשן וכושר במרכז שירסקו לכם את השיעמום</span></b>",
        "בוא לרסק את השיעמום!<br><b><span style='color: #166534;'>עם אימונים מטריפים, כוח וחברים חדשים באזור המרכז</span></b>"
    ];

    const now = new Date();
    const start = new Date('2025-05-16');
    let dayIndex = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    if (dayIndex < 0) dayIndex = 0;

    const targetId = typeof userConfig !== 'undefined' ? userConfig.activeTargetId : 'summer';
    const currentState = typeof getDailyTipState === 'function' ? getDailyTipState(targetId) : {};
    const clickNum = currentState.clicks || 1;
    
    const finalIndex = (dayIndex * 3 + clickNum) % sponsorOptions.length;
    const chosenOption = sponsorOptions[finalIndex];

    const htmlContent = '<span aria-hidden="true">🏋️‍♂️</span> ' + chosenOption;

    const tipTextElement = document.querySelector('#tip-sponsor-banner .sponsor-text');
    if (tipTextElement) tipTextElement.innerHTML = htmlContent;

    const gameSponsorBanner = document.getElementById('game-sponsor-banner');
    if (gameSponsorBanner) {
        gameSponsorBanner.style.background = 'linear-gradient(135deg, #f0fdf4, #dcfce7)';
        gameSponsorBanner.style.borderColor = '#86efac';
        gameSponsorBanner.style.color = '#000000';
        const gameTextElement = gameSponsorBanner.querySelector('.sponsor-text');
        if (gameTextElement) gameTextElement.innerHTML = htmlContent;
    }
}
