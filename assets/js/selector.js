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
function fn03() {
  function isValidJSON(jsonString) {
    try {
        JSON.parse(jsonString);
        return true;
    } catch (e) {
        return false;
    }
}

// 1. Get the item from localStorage
const rawData = localStorage.getItem('myKey');

// 2. Check if the item actually exists first
if (rawData === null) {
    alert("Item not existing!")
} else if (isValidJSON(rawData)) {
    
    const parsedData = JSON.parse(rawData);
} else {
    alert("Invalid file; upon closing this message the file will be reset")
    localStorage.setitem('gamedata', '[]')
}

}
