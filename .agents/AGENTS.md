# Neto Hofesh Project Rules & Guidelines

Welcome to the **Neto Hofesh** (נטו חופש) project! You are collaborating with Yonatan and his brother on this repository.

## 1. Project Overview
- **What is it:** An Israeli student holiday countdown web app (PWA) tracking time until school vacations.
- **Tech Stack:** Vanilla HTML/CSS/JS. No heavy frameworks (No React/Vue). No TailwindCSS.
- **Backend/DB:** Firebase Authentication and Firestore (for user sign-ups, leaderboards, and grade-levels).
- **Deployment:** Hosted on GitHub Pages. Any changes pushed to `gh-pages` and `main` branches are immediately live.

## 2. Deployment & Build Process
Whenever you modify HTML/CSS/JS files, follow this workflow:
1. **Never edit holiday subpages manually** (e.g., `/hanukkah/index.html`). They are auto-generated!
2. Only edit the main `index.html`.
3. To apply changes to all pages, run the build script in powershell: `powershell -ExecutionPolicy Bypass -File build_seo_pages.ps1`.
4. After building, bump the `CACHE_VERSION` in `sw.js` so clients download the latest PWA updates.
5. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Your descriptive message"
   git push origin main
   git push origin main:gh-pages
   ```

## 3. Style & UX Rules
- **Aesthetics:** The UI must be highly vibrant, dynamic, and premium. Use glassmorphism, micro-animations, and colorful gradients. 
- **Language:** The site is entirely in Hebrew (RTL). Always ensure UI text is correctly phrased in Hebrew.
- **Leaderboard Colors:** The top 3 medals must always be flat solid colors: Gold (`#fef08a`), Silver (`#e2e8f0`), and Bronze (`#fed7aa`). Do not change these to heavy gradients. 
- **Buttons & Text:** Ensure high contrast. (e.g., Login prompt in the leaderboard must be bold gold `#d97706` reading "התחבר בשביל להיכנס לטבלה").

## 4. Collaboration Etiquette
- Before making massive changes, always run `git pull origin main` to ensure you are not overriding Yonatan's latest work.
- If writing a new feature, verify that there are no JS errors in `app.js` that might break the core countdown loop.
- Use explicit user consent before doing destructive actions (like purging Firebase data).
