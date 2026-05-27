// ── Background Music ──────────────────────────────────────────
const bgMusic = new Audio('..audio/bg.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;

document.addEventListener('click', () => {
  if (bgMusic.paused) bgMusic.play();
}, { once: true });

function fn01() {
  window.location.replace("../game/");
}
function fn02() {
   localStorage.setItem('gamedata', '[]');
}
