// ── Background Music ──────────────────────────────────────────
const bgMusic = new Audio('my_sound.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;

// Auto-play on first user interaction (browser policy requirement)
document.addEventListener('click', () => {
  if (bgMusic.paused) bgMusic.play();
}, { once: true });

// ── 23 Functions ─────────────────────────────────────────────

function fn01_toggleMusic() {
  bgMusic.paused ? bgMusic.play() : bgMusic.pause();
}

function fn02_setVolumeHigh()  { bgMusic.volume = 1.0; }
function fn03_setVolumeLow()   { bgMusic.volume = 0.1; }
function fn04_muteMusic()      { bgMusic.muted = true; }
function fn05_unmuteMusic()    { bgMusic.muted = false; }

function fn06_changeColor() {
  document.body.style.backgroundColor =
    '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
}

function fn07_alertMessage() {
  alert('Button clicked!');
}

function fn08_logTimestamp() {
  console.log('Timestamp:', new Date().toISOString());
}

function fn09_toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function fn10_increaseFontSize() {
  const size = parseFloat(getComputedStyle(document.body).fontSize);
  document.body.style.fontSize = (size + 2) + 'px';
}

function fn11_decreaseFontSize() {
  const size = parseFloat(getComputedStyle(document.body).fontSize);
  document.body.style.fontSize = Math.max(8, size - 2) + 'px';
}

function fn12_resetFontSize() {
  document.body.style.fontSize = '16px';
}

function fn13_shakeScreen() {
  document.body.style.animation = 'shake 0.3s';
  setTimeout(() => document.body.style.animation = '', 300);
}

function fn14_scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fn15_scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function fn16_copyURL() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => console.log('URL copied'));
}

function fn17_reloadPage() {
  location.reload();
}

function fn18_printPage() {
  window.print();
}

function fn19_showDate() {
  document.getElementById('output').textContent = new Date().toLocaleDateString();
}

function fn20_showTime() {
  document.getElementById('output').textContent = new Date().toLocaleTimeString();
}

function fn21_clearOutput() {
  const el = document.getElementById('output');
  if (el) el.textContent = '';
}

function fn22_countClicks() {
  fn22_countClicks.count = (fn22_countClicks.count || 0) + 1;
  document.getElementById('output').textContent = 'Clicks: ' + fn22_countClicks.count;
}

function fn23_resetClickCount() {
  fn22_countClicks.count = 0;
  document.getElementById('output').textContent = 'Clicks reset.';
}
