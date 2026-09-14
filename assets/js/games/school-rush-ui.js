// school-rush-ui.js

(function() {
  let runtime = null;
  let status = 'idle'; // idle, running, gameover
  let painter = null;
  let sprites = null;
  let frame = 0;
  let previous = 0;
  
  // Create UI container
  const container = document.createElement('div');
  container.id = 'school-rush-container';
  container.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: #000; z-index: 99999; display: none; overflow: hidden;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width: 100%; height: 100%; display: block;';
  container.appendChild(canvas);
  
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    background: rgba(0,0,0,0.6); color: white;
  `;
  container.appendChild(overlay);

  const scoreBoard = document.createElement('div');
  scoreBoard.style.cssText = `
    position: absolute; top: 20px; right: 20px; font-size: 24px; font-weight: bold;
    text-shadow: 2px 2px 0 #000; color: white; display: none; text-align: right;
  `;
  container.appendChild(scoreBoard);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.5); border: none;
    color: white; font-size: 24px; width: 40px; height: 40px; border-radius: 50%;
    cursor: pointer; display: none; z-index: 10;
  `;
  closeBtn.onclick = closeGame;
  container.appendChild(closeBtn);

  document.body.appendChild(container);

  function updateHUD() {
    if (!runtime) return;
    scoreBoard.innerHTML = `<div>מרחק: ${runtime.score}</div><div style="color: gold;">₪ ${runtime.coins}</div>`;
  }

  function renderOverlay() {
    if (status === 'idle') {
      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <h1 style="font-size: 48px; margin-bottom: 10px; text-align: center;">School Rush</h1>
        <p style="font-size: 20px; margin-bottom: 30px; text-align: center;" dir="rtl">
          ברחו במסדרונות בית הספר!<br>
          החליקו למעלה לקפיצה, למטה להחלקה, ימינה/שמאלה לזוז.
        </p>
        <button id="sr-start-btn" style="padding: 15px 40px; font-size: 24px; background: #e3a931; border: none; border-radius: 30px; cursor: pointer; font-weight: bold; color: #333;">התחל לרוץ</button>
      `;
      document.getElementById('sr-start-btn').onclick = startGame;
      scoreBoard.style.display = 'none';
      closeBtn.style.display = 'block';
    } else if (status === 'gameover') {
      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <h1 style="font-size: 48px; margin-bottom: 10px; color: #ff4d4d;">נתפסת!</h1>
        <p style="font-size: 24px; margin-bottom: 10px;">ניקוד: ${runtime.score}</p>
        <p style="font-size: 24px; margin-bottom: 30px; color: gold;">מטבעות: ${runtime.coins}</p>
        <button id="sr-restart-btn" style="padding: 15px 40px; font-size: 24px; background: #e3a931; border: none; border-radius: 30px; cursor: pointer; font-weight: bold; color: #333;">נסה שוב</button>
      `;
      document.getElementById('sr-restart-btn').onclick = startGame;
      closeBtn.style.display = 'block';
    } else {
      overlay.style.display = 'none';
      scoreBoard.style.display = 'block';
      closeBtn.style.display = 'none';
    }
  }

  function startGame() {
    runtime = SchoolRushEngine.createRuntime(Date.now());
    status = 'running';
    previous = performance.now();
    renderOverlay();
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);
  }

  function closeGame() {
    status = 'idle';
    if (frame) cancelAnimationFrame(frame);
    container.style.display = 'none';
  }

  function tick(now) {
    if (status !== 'running' || !runtime) return;
    const dt = previous ? Math.min((now - previous) / 1000, 0.1) : 0;
    previous = now;
    
    SchoolRushEngine.advanceFrame(runtime, dt);
    
    runtime.hudElapsed += dt;
    if (runtime.hudElapsed >= 0.1) {
      runtime.hudElapsed = 0;
      updateHUD();
    }
    
    painter.render(runtime, status);
    
    if (runtime.ended) {
      status = 'gameover';
      renderOverlay();
      return;
    }
    
    frame = requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => {
    if (painter && container.style.display === 'block') {
      painter.resize(window.innerWidth, window.innerHeight);
      if (status !== 'running' && runtime) {
        painter.render(runtime, status);
      }
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  
  window.addEventListener('keydown', (e) => {
    if (status !== 'running' || !runtime) return;
    if (e.key === 'ArrowLeft') SchoolRushEngine.command(runtime, 'left');
    if (e.key === 'ArrowRight') SchoolRushEngine.command(runtime, 'right');
    if (e.key === 'ArrowUp' || e.key === ' ') SchoolRushEngine.command(runtime, 'jump');
    if (e.key === 'ArrowDown') SchoolRushEngine.command(runtime, 'slide');
  });

  canvas.addEventListener('touchstart', (e) => {
    if (status !== 'running') return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });

  canvas.addEventListener('touchend', (e) => {
    if (status !== 'running' || !runtime) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    if (Math.max(absDx, absDy) > 30) {
      if (absDx > absDy) {
        SchoolRushEngine.command(runtime, dx > 0 ? 'right' : 'left');
      } else {
        SchoolRushEngine.command(runtime, dy > 0 ? 'slide' : 'jump');
      }
    }
  });

  window.startSchoolRush = async function() {
    container.style.display = 'block';
    overlay.innerHTML = '<h2 style="color:white;" dir="rtl">טוען גרפיקה מטורפת...</h2>';
    overlay.style.display = 'flex';
    
    if (!sprites) {
      try {
        sprites = await SchoolRushRenderer.loadSprites();
        painter = SchoolRushRenderer.createPainter(canvas, sprites);
        painter.resize(window.innerWidth, window.innerHeight);
      } catch (e) {
        console.error("Failed to load school rush", e);
        closeGame();
        return;
      }
    }
    
    status = 'idle';
    renderOverlay();
  };

})();
