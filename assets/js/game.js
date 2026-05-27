const STORAGE_KEY = 'gamedata';
const DETENTION_DURATION_MS = 60_000;
const IMPOSSIBLE_QUESTION_CHANCE = 0.3;

const defaultState = {
  version: 2,
  player: { x: 1, y: 1 },
  notebookCount: 0,
  stars: 0,
  rulesFollowed: 0,
  inventory: [],
  notebooksSolved: [],
  collectedItems: [],
  principalTurns: 0,
  jumpropeTurns: 0,
  wrongAnswers: 0,
  greenyMood: 'Greeny is cheerful and ready to help you learn.',
  message: 'Welcome to Greeny\'s Learning Hall!',
  greeny: {
    x: 5,
    y: 5,
    anger: 0,
    pace: 'calm',
    lastMoveAt: 0
  },
  detention: {
    active: false,
    until: 0
  },
  encounters: {
    principal: false,
    jumprope: false,
    greeny: false
  }
};

const mapLayout = [
  '##########',
  '#P..N...J#',
  '#.##.##..#',
  '#..I..N..#',
  '#.####.#.#',
  '#..N.G...#',
  '#.#.##.#.#',
  '#..P..I..#',
  '#..N...N.#',
  '##########'
];

const detentionTile = { x: 1, y: 8 };

const notebooks = {
  '4,1': { prompt: 'What is 4 + 3?', options: ['5', '7', '6', '8'], answer: '7' },
  '6,3': { prompt: 'What is 9 - 4?', options: ['5', '4', '6', '3'], answer: '5' },
  '3,5': { prompt: 'What is 3 × 2?', options: ['5', '6', '7', '8'], answer: '6' },
  '3,8': { prompt: 'What is 12 ÷ 3?', options: ['2', '3', '4', '6'], answer: '4' },
  '7,8': { prompt: 'What shape has 4 equal sides?', options: ['Triangle', 'Square', 'Circle', 'Oval'], answer: 'Square' }
};

const impossiblePrompts = [
  {
    prompt: '∰⟟⎓ ⟒⋔⊬ ⊑⌰⍑ ⏁⊬⌿⟒⌇, ⍙⊑⏃⏁ ⟟⌇ ☊⍜⍀⍀⟒☊⏁?',
    options: ['◊∆?', '⌇⊬⋔', '⍜⍜⍜', '???']
  },
  {
    prompt: 'ꇙꍩꍟ ꋬꋪꍟ ꋖꃅꍟ ꒒ꍟ꓄꓄ꍟꋪꌗ ꋪꍟꋬ꒒?',
    options: ['blorp', 'snarp', '??', '↯↯↯']
  },
  {
    prompt: 'Ж҈҉͜͡Ӝ̷̨̛̲̠̺̬̪̞ ርቿዪዘነክጋል?',
    options: ['N/A', '???', '▓▓▓', '∆∆∆']
  }
];

const itemDefinitions = {
  '3,3': { name: 'Energy Bar', description: 'Adds 2 stars and gives you a burst of focus.' },
  '6,7': { name: 'Hall Pass', description: 'Helps the principal see that you are prepared.' }
};

const elements = {
  map: document.getElementById('map'),
  roomName: document.getElementById('roomName'),
  roomDescription: document.getElementById('roomDescription'),
  notebookCount: document.getElementById('notebookCount'),
  starCount: document.getElementById('starCount'),
  ruleCount: document.getElementById('ruleCount'),
  inventoryList: document.getElementById('inventoryList'),
  eventContent: document.getElementById('eventContent'),
  greenyMood: document.getElementById('greenyMood'),
  principalStatus: document.getElementById('principalStatus'),
  jumpropeStatus: document.getElementById('jumpropeStatus'),
  resetSaveButton: document.getElementById('resetSaveButton')
};

let state = loadState();
let greenyLoop = null;
let detentionLoop = null;

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([clone(defaultState)]));
    return clone(defaultState);
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0 || typeof parsed[0] !== 'object' || parsed[0] === null) {
      throw new Error('gamedata must be an array with a state object at index 0');
    }

    return mergeState(parsed[0]);
  } catch (error) {
    console.warn('Failed to parse localStorage.gamedata. Resetting save.', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([clone(defaultState)]));
    return clone(defaultState);
  }
}

function mergeState(saved) {
  return {
    ...clone(defaultState),
    ...saved,
    player: { ...defaultState.player, ...(saved.player || {}) },
    inventory: Array.isArray(saved.inventory) ? saved.inventory : [],
    notebooksSolved: Array.isArray(saved.notebooksSolved) ? saved.notebooksSolved : [],
    collectedItems: Array.isArray(saved.collectedItems) ? saved.collectedItems : [],
    greeny: { ...defaultState.greeny, ...(saved.greeny || {}) },
    detention: { ...defaultState.detention, ...(saved.detention || {}) },
    encounters: { ...defaultState.encounters, ...(saved.encounters || {}) }
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([state]));
}

function render() {
  releaseDetentionIfNeeded();
  renderMap();
  renderHud();
  renderInventory();
  renderRoomInfo();
  renderStatuses();
}

function renderMap() {
  elements.map.innerHTML = '';

  for (let y = 0; y < mapLayout.length; y += 1) {
    for (let x = 0; x < mapLayout[y].length; x += 1) {
      const tile = document.createElement('div');
      const symbol = getSymbolAt(x, y);
      tile.className = `tile ${symbol.className}`;
      tile.textContent = symbol.text;
      tile.title = symbol.title;
      elements.map.appendChild(tile);
    }
  }
}

function getSymbolAt(x, y) {
  if (state.player.x === x && state.player.y === y) {
    return { className: 'tile-player', text: '🙂', title: 'You' };
  }

  if (state.greeny.x === x && state.greeny.y === y && !state.detention.active) {
    return { className: 'tile-greeny', text: 'G', title: 'Greeny' };
  }

  const base = mapLayout[y][x];
  const key = `${x},${y}`;

  if (x === detentionTile.x && y === detentionTile.y) {
    return { className: 'tile-door', text: 'D', title: 'Detention Room' };
  }

  if (base === '#') return { className: 'tile-wall', text: '', title: 'Wall' };
  if (base === 'P') return { className: 'tile-principal', text: 'P', title: 'Principal' };
  if (base === 'J') return { className: 'tile-jumprope', text: 'J', title: 'Jump Rope Champion' };
  if (base === 'N' && !state.notebooksSolved.includes(key)) return { className: 'tile-notebook', text: '📘', title: 'Notebook' };
  if (base === 'I' && !state.collectedItems.includes(key)) return { className: 'tile-item', text: '⭐', title: 'Item' };

  return { className: 'tile-floor', text: '', title: 'Hallway' };
}

function renderHud() {
  elements.notebookCount.textContent = `${state.notebookCount} / 7`;
  elements.starCount.textContent = String(state.stars);
  elements.ruleCount.textContent = String(state.rulesFollowed);
}

function renderInventory() {
  elements.inventoryList.innerHTML = '';

  if (state.inventory.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Nothing collected yet.';
    elements.inventoryList.appendChild(li);
    return;
  }

  state.inventory.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    elements.inventoryList.appendChild(li);
  });
}

function renderRoomInfo() {
  const key = `${state.player.x},${state.player.y}`;
  const tile = mapLayout[state.player.y][state.player.x];

  if (state.detention.active) {
    const seconds = Math.max(0, Math.ceil((state.detention.until - Date.now()) / 1000));
    elements.roomName.textContent = 'Detention Room';
    elements.roomDescription.textContent = 'You must wait calmly before returning to class.';
    showMessage(`Detention ends in ${seconds} second${seconds === 1 ? '' : 's'}.`, 'warn');
    return;
  }

  const descriptions = {
    '#': ['Wall', 'A painted brick wall blocks your way.'],
    '.': ['Hallway', 'A bright hallway with posters about math, reading, and kindness.'],
    'N': ['Notebook Corner', 'A learning notebook is here. Solve it to make Greeny proud.'],
    'I': ['Supply Spot', 'A useful school item sits on a nearby table.'],
    'G': ['Greeny\'s Classroom', 'Greeny smiles and reminds everyone to keep learning.'],
    'P': ['Principal Patrol', 'The principal watches for good behavior and neat hallway habits.'],
    'J': ['Playground Lane', 'The jump rope champion challenges students to keep a rhythm.']
  };

  const current = descriptions[tile] || descriptions['.'];
  elements.roomName.textContent = current[0];
  elements.roomDescription.textContent = current[1];

  if (tile === 'N' && !state.notebooksSolved.includes(key)) {
    showNotebookChallenge(key);
  } else if (tile === 'I' && !state.collectedItems.includes(key)) {
    showItemPickup(key);
  } else if (tile === 'P') {
    showPrincipalEncounter();
  } else if (tile === 'J') {
    showJumpropeEncounter();
  } else if (tile === 'G') {
    showGreenyEncounter();
  } else {
    showMessage(state.message || 'Keep exploring the school.');
  }
}

function renderStatuses() {
  const paceText = `Greeny is ${state.greeny.pace} and tapping a pointer against his hand.`;
  elements.greenyMood.textContent = `${state.greenyMood} ${paceText}`;
  elements.principalStatus.textContent = state.encounters.principal
    ? 'The principal noticed your effort and reminds you to stay focused in the halls.'
    : 'The principal is calm because the rules are being followed.';
  elements.jumpropeStatus.textContent = state.encounters.jumprope
    ? 'The jump rope champion is energized after your last rhythm challenge.'
    : 'The jump rope champion is waiting for a fun challenge.';
}

function showMessage(message, tone = 'good') {
  elements.eventContent.innerHTML = `<p class="status-${tone}">${message}</p>`;
}

function maybeGetImpossiblePrompt() {
  return Math.random() < IMPOSSIBLE_QUESTION_CHANCE
    ? impossiblePrompts[Math.floor(Math.random() * impossiblePrompts.length)]
    : null;
}

function showNotebookChallenge(key) {
  const impossible = maybeGetImpossiblePrompt();
  const notebook = impossible || notebooks[key];

  if (!notebook) {
    showMessage('This notebook is still being written.', 'warn');
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'question-box';
  wrapper.innerHTML = `<p>${notebook.prompt}</p>${impossible ? '<p class="status-warn">This page looks unreadable...</p>' : ''}`;

  const answerGrid = document.createElement('div');
  answerGrid.className = 'answer-grid';

  notebook.options.forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-button';
    button.textContent = option;
    button.addEventListener('click', () => solveNotebook(key, impossible ? false : option === notebook.answer, Boolean(impossible)));
    answerGrid.appendChild(button);
  });

  wrapper.appendChild(answerGrid);
  elements.eventContent.innerHTML = '';
  elements.eventContent.appendChild(wrapper);
}

function solveNotebook(key, correct, impossible = false) {
  if (correct) {
    state.notebooksSolved.push(key);
    state.notebookCount += 1;
    state.stars += 5;
    state.greenyMood = 'Greeny says: Amazing work! Keep collecting those notebooks.';
    state.message = 'You solved a notebook and earned 5 stars!';
    saveState();
    render();
    checkWinCondition();
    return;
  }

  state.wrongAnswers += 1;
  state.greeny.anger += 1;
  state.greeny.pace = state.greeny.anger >= 4 ? 'very fast' : state.greeny.anger >= 2 ? 'faster' : 'focused';
  state.greenyMood = impossible
    ? 'Greeny says: That page was pure gibberish... but now he is tapping the pointer faster.'
    : 'Greeny says: That was not correct. He starts tapping the pointer against his hand.';
  state.message = impossible
    ? 'The notebook page was impossible to read. Greeny still got more serious.'
    : 'Wrong answer! Greeny is moving faster now.';
  saveState();
  render();
}

function showItemPickup(key) {
  const item = itemDefinitions[key];
  if (!item) {
    showMessage('A supply locker is here, but it is empty.', 'warn');
    return;
  }

  elements.eventContent.innerHTML = `
    <div class="question-box">
      <p><strong>${item.name}</strong></p>
      <p>${item.description}</p>
      <button type="button" class="activity-button" id="pickupButton">Collect Item</button>
    </div>
  `;

  document.getElementById('pickupButton').addEventListener('click', () => collectItem(key, item));
}

function collectItem(key, item) {
  state.collectedItems.push(key);
  state.inventory.push(item.name);
  state.stars += item.name === 'Energy Bar' ? 2 : 1;
  state.message = `${item.name} added to your inventory.`;
  saveState();
  render();
}

function showPrincipalEncounter() {
  elements.eventContent.innerHTML = `
    <div class="question-box">
      <p>The principal asks: “Are you walking, not running, and staying respectful?”</p>
      <button type="button" class="activity-button" id="followRuleButton">Follow the Rule</button>
    </div>
  `;

  document.getElementById('followRuleButton').addEventListener('click', () => {
    state.encounters.principal = true;
    state.principalTurns += 1;
    state.rulesFollowed += 1;
    state.message = 'You followed the hallway rules. The principal approves.';
    saveState();
    render();
  });
}

function showJumpropeEncounter() {
  elements.eventContent.innerHTML = `
    <div class="question-box">
      <p>The jump rope champion claps a pattern: jump 3 times to the beat!</p>
      <button type="button" class="activity-button" id="jumpropeButton">Jump Along</button>
    </div>
  `;

  document.getElementById('jumpropeButton').addEventListener('click', () => {
    state.encounters.jumprope = true;
    state.jumpropeTurns += 1;
    state.stars += 3;
    state.message = 'Nice rhythm! You earned 3 stars from the jump rope challenge.';
    saveState();
    render();
  });
}

function showGreenyEncounter() {
  state.encounters.greeny = true;
  const reminder = state.notebookCount >= 5
    ? 'Greeny says: You are almost ready to finish the school day!'
    : 'Greeny says: Explore the school and gather more notebooks.';
  state.greenyMood = reminder;
  saveState();
  showMessage(reminder);
}

function checkWinCondition() {
  if (state.notebookCount < 5) return;

  state.message = 'You gathered enough notebooks to finish the learning day. Great job!';
  state.greenyMood = 'Greeny says: You did it! Thanks for helping the school stay bright and friendly.';
  saveState();
}

function canMoveTo(x, y) {
  return mapLayout[y] && mapLayout[y][x] && mapLayout[y][x] !== '#';
}

function movePlayer(dx, dy) {
  releaseDetentionIfNeeded();

  if (state.detention.active) {
    render();
    return;
  }

  const nextX = state.player.x + dx;
  const nextY = state.player.y + dy;

  if (!canMoveTo(nextX, nextY)) {
    state.message = 'A wall blocks the way. Try another hall.';
    render();
    return;
  }

  state.player.x = nextX;
  state.player.y = nextY;
  state.message = 'You moved to a new part of the school.';
  saveState();
  render();
  updateGreeny();
}

function getGreenyDelay() {
  if (state.greeny.anger >= 6) return 350;
  if (state.greeny.anger >= 4) return 500;
  if (state.greeny.anger >= 2) return 700;
  return 1000;
}

function updateGreeny() {
  if (state.detention.active) return;

  const now = Date.now();
  if (now - state.greeny.lastMoveAt < getGreenyDelay()) return;

  const dx = state.player.x - state.greeny.x;
  const dy = state.player.y - state.greeny.y;
  const nextStep = Math.abs(dx) > Math.abs(dy)
    ? { x: state.greeny.x + Math.sign(dx), y: state.greeny.y }
    : { x: state.greeny.x, y: state.greeny.y + Math.sign(dy) };

  if (canMoveTo(nextStep.x, nextStep.y)) {
    state.greeny.x = nextStep.x;
    state.greeny.y = nextStep.y;
    state.greeny.lastMoveAt = now;
  }

  if (state.greeny.x === state.player.x && state.greeny.y === state.player.y) {
    sendToDetention();
    return;
  }

  saveState();
  render();
}

function sendToDetention() {
  state.player.x = detentionTile.x;
  state.player.y = detentionTile.y;
  state.detention.active = true;
  state.detention.until = Date.now() + DETENTION_DURATION_MS;
  state.message = 'Greeny caught you and sent you to detention for 1 minute.';
  state.greenyMood = 'Greeny taps the pointer against his hand and waits for you to reflect in detention.';
  saveState();
  render();
  startDetentionTimer();
}

function startGreenyLoop() {
  if (greenyLoop) clearInterval(greenyLoop);
  greenyLoop = setInterval(() => {
    updateGreeny();
  }, 250);
}

function startDetentionTimer() {
  if (detentionLoop) clearInterval(detentionLoop);
  detentionLoop = setInterval(() => {
    if (!state.detention.active) {
      clearInterval(detentionLoop);
      detentionLoop = null;
      return;
    }
    releaseDetentionIfNeeded();
    render();
  }, 1000);
}

function releaseDetentionIfNeeded() {
  if (!state.detention.active) return;
  if (Date.now() < state.detention.until) return;

  state.detention.active = false;
  state.detention.until = 0;
  state.player.x = 2;
  state.player.y = 8;
  state.message = 'Detention is over. Return to class and keep learning.';
  saveState();
}

function resetSave() {
  state = clone(defaultState);
  saveState();
  render();
}

document.querySelectorAll('[data-move]').forEach(button => {
  button.addEventListener('click', () => {
    const move = button.getAttribute('data-move');
    if (move === 'up') movePlayer(0, -1);
    if (move === 'down') movePlayer(0, 1);
    if (move === 'left') movePlayer(-1, 0);
    if (move === 'right') movePlayer(1, 0);
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowUp') movePlayer(0, -1);
  if (event.key === 'ArrowDown') movePlayer(0, 1);
  if (event.key === 'ArrowLeft') movePlayer(-1, 0);
  if (event.key === 'ArrowRight') movePlayer(1, 0);
});

elements.resetSaveButton.addEventListener('click', resetSave);

if (state.detention.active) {
  startDetentionTimer();
}

startGreenyLoop();
render();
