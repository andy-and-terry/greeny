// ── Background Music ──────────────────────────────────────────
const bgMusic = new Audio('..audio/bg.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;

document.addEventListener('click', () => {
  if (bgMusic.paused) bgMusic.play();
}, { once: true });

// ── 6 Placeholder Functions ──────────────────────────────────

function fn01() { console.log('fn01 called'); }
function fn02() { console.log('fn02 called'); }
function fn03() { console.log('fn03 called'); }
function fn04() { console.log('fn04 called'); }
function fn05() { console.log('fn05 called'); }
function fn06() { console.log('fn06 called'); }
