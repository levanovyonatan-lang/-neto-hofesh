// school-rush-engine.js
// Math and logic for School Rush (Subway Surfers clone)
const LANES = [-2, 0, 2];
const ROW_COUNT = 16;
const ROW_GAP = 16;
const CHUNK_LENGTH = 16;
const CHUNK_COUNT = 10;
const MAX_SPEED = 24;
const FIXED_STEP = 1 / 120;
const TYPES = { LOW: 0, HIGH: 1, SOLID: 2 };

function createRuntime(seed = 12345) {
  const r = {
    seed: seed >>> 0, elapsed: 0, distance: 0, score: 0, coins: 0,
    speed: 11, targetLane: 1, x: 0, y: 0, vy: 0, slide: 0,
    slow: 0, invulnerable: 0, flash: 0, hits: 0, chaserZ: 10,
    ended: false, accumulator: 0, hudElapsed: 0,
    rows: Array.from({ length: ROW_COUNT }, () => ({
      z: 0, obstacles: Array.from({ length: 2 }, () => ({ lane: 0, type: 0, active: false })),
      coins: Array.from({ length: 3 }, () => ({ lane: 0, offset: 0, active: true })),
    })),
  };
  r.rows.forEach((row, i) => { row.z = -24 - i * ROW_GAP; populateRow(r, row); });
  return r;
}

function random(r) {
  r.seed = (Math.imul(1664525, r.seed) + 1013904223) >>> 0;
  return r.seed / 4294967296;
}

function populateRow(r, row) {
  const safeLane = Math.floor(random(r) * 3);
  let index = 0;
  for (let lane = 0; lane < 3; lane++) {
    if (lane === safeLane) continue;
    const obstacle = row.obstacles[index++];
    obstacle.lane = lane;
    // Map obstacles: 0=Recycle bin (high/solid), 1=Wet floor sign (low/jumpable)
    obstacle.type = Math.floor(random(r) * 3);
    obstacle.active = index === 1 || random(r) > 0.32;
  }
  row.coins.forEach((coin, i) => {
    coin.lane = safeLane;
    coin.offset = -4 - i * 2;
    coin.active = true;
  });
}

function command(r, action) {
  if (r.ended) return;
  if (action === 'left') r.targetLane = Math.max(0, r.targetLane - 1);
  if (action === 'right') r.targetLane = Math.min(2, r.targetLane + 1);
  if (action === 'jump' && r.y <= 0.001) { r.vy = 9.4; r.slide = 0; }
  if (action === 'slide') {
    if (r.y > 0) r.vy = Math.min(r.vy, -11);
    r.slide = 0.85;
  }
}

function overlaps(px, bottom, height, lane, z0, z1, type) {
  const halfWidth = type === TYPES.SOLID ? 0.8 : 0.66;
  const minY = type === TYPES.HIGH ? 1.1 : 0;
  const maxY = type === TYPES.HIGH ? 2.8 : type === TYPES.SOLID ? 3.1 : 0.86;
  return Math.abs(px - LANES[lane]) < 0.32 + halfWidth &&
    bottom < maxY && bottom + height > minY &&
    Math.min(z0, z1) < 0.87 && Math.max(z0, z1) > -0.87;
}

function step(r, dt) {
  if (r.ended) return;
  r.elapsed += dt;
  r.slow = Math.max(0, r.slow - dt);
  r.invulnerable = Math.max(0, r.invulnerable - dt);
  r.flash = Math.max(0, r.flash - dt);
  r.slide = Math.max(0, r.slide - dt);
  const baseSpeed = Math.min(MAX_SPEED, 11 + Math.floor(r.elapsed / 10));
  r.speed = baseSpeed * (r.slow > 0 ? 0.64 : 1);
  const advance = r.speed * dt;
  r.distance += advance;
  r.x += (LANES[r.targetLane] - r.x) * (1 - Math.exp(-18 * dt));
  r.vy -= 24 * dt;
  r.y = Math.max(0, r.y + r.vy * dt);
  if (r.y === 0) r.vy = 0;
  const height = r.slide > 0 && r.y < 0.05 ? 0.68 : 1.85;
  r.chaserZ += ((r.slow > 0 ? 3.3 : 10) - r.chaserZ) * (1 - Math.exp(-3 * dt));

  for (const row of r.rows) {
    const oldZ = row.z;
    row.z += advance;
    for (const obstacle of row.obstacles) {
      if (!obstacle.active || !overlaps(r.x, r.y, height, obstacle.lane, oldZ, row.z, obstacle.type)) continue;
      obstacle.active = false;
      if (obstacle.type === TYPES.SOLID) { r.ended = true; break; }
      if (r.invulnerable === 0) {
        r.hits++;
        r.slow = 2.5;
        r.invulnerable = 1.25;
        r.flash = 0.5;
      }
    }
    if (r.ended) break;
    for (const coin of row.coins) {
      if (coin.active && Math.abs(r.x - LANES[coin.lane]) < 0.68 &&
          r.y < 1.5 && r.y + height > 0.7 &&
          oldZ + coin.offset < 0.6 && row.z + coin.offset > -0.6) {
        coin.active = false;
        r.coins++;
      }
    }
    if (row.z > 14) { row.z -= ROW_COUNT * ROW_GAP; populateRow(r, row); }
  }
  r.score = Math.floor(r.distance) + r.coins * 25;
}

function advanceFrame(r, delta) {
  r.accumulator += Math.min(delta, 0.1);
  while (r.accumulator >= FIXED_STEP && !r.ended) {
    step(r, FIXED_STEP);
    r.accumulator -= FIXED_STEP;
  }
}

window.SchoolRushEngine = {
  createRuntime,
  command,
  advanceFrame,
  LANES
};
