const MAX_GUESSES = 8;
const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

const tilesEl = document.getElementById("tiles");
const hintEl = document.getElementById("hint");
const livesEl = document.getElementById("lives");
const wrongLettersEl = document.getElementById("wrongLetters");
const progressTextEl = document.getElementById("progressText");
const keyboardEl = document.getElementById("keyboard");
const newWordBtn = document.getElementById("newWordBtn");
const resetBtn = document.getElementById("resetBtn");
const bannerEl = document.getElementById("banner");
const gameEl = document.getElementById("game");

let word = "";
let remaining = MAX_GUESSES;
let correctLetters = new Set();
let wrongLetters = [];
let over = false;

function buildKeyboard() {
  keyboardEl.innerHTML = "";
  KEYBOARD_ROWS.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "key-row";
    row.split("").forEach((letter) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "key";
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.addEventListener("click", () => guess(letter));
      rowEl.appendChild(btn);
    });
    keyboardEl.appendChild(rowEl);
  });
}

function buildLives() {
  livesEl.innerHTML = "";
  for (let i = 0; i < MAX_GUESSES; i++) {
    const pip = document.createElement("span");
    pip.className = "pip";
    livesEl.appendChild(pip);
  }
}

function renderLives() {
  const pips = livesEl.querySelectorAll(".pip");
  pips.forEach((pip, i) => {
    pip.classList.toggle("gone", i >= remaining);
  });
}

function renderTiles() {
  tilesEl.innerHTML = "";
  for (const ch of word) {
    const tile = document.createElement("div");
    const known = correctLetters.has(ch) || over;
    tile.className =
      "tile" + (known && correctLetters.has(ch) ? " filled" : "");
    tile.textContent = known ? ch : "";
    tilesEl.appendChild(tile);
  }
}

function renderStatus() {
  wrongLettersEl.textContent = wrongLetters.length
    ? wrongLetters.join(" ").toUpperCase()
    : "—";
  const found = [...word].filter((ch) => correctLetters.has(ch)).length;
  progressTextEl.textContent = over ? "" : `${found} / ${word.length} letters`;
}

function showBanner(kind, html) {
  bannerEl.className = "banner " + kind + " show";
  bannerEl.innerHTML = html;
}

function hideBanner() {
  bannerEl.className = "banner";
  bannerEl.innerHTML = "";
}

function guess(letter) {
  if (over) return;
  const key = keyboardEl.querySelector(`.key[data-letter="${letter}"]`);
  if (!key || key.disabled) return;

  key.disabled = true;

  if (word.includes(letter)) {
    correctLetters.add(letter);
    key.classList.add("correct");
  } else {
    remaining--;
    wrongLetters.push(letter);
    key.classList.add("wrong");
    gameEl.classList.remove("shake");
    void gameEl.offsetWidth;
    gameEl.classList.add("shake");
  }

  renderLives();
  renderTiles();
  renderStatus();

  const won = [...word].every((ch) => correctLetters.has(ch));
  if (won) {
    over = true;
    disableKeyboard();
    showBanner(
      "win",
      `You got it — the word was <b>${word.toUpperCase()}</b>. Nicely guessed.`,
    );
  } else if (remaining <= 0) {
    over = true;
    disableKeyboard();
    renderTiles();
    showBanner(
      "lose",
      `Out of guesses. The word was <b>${word.toUpperCase()}</b>.`,
    );
  }
}

function disableKeyboard() {
  keyboardEl.querySelectorAll(".key").forEach((k) => (k.disabled = true));
}

function newWord() {
  const entry = wordList[Math.floor(Math.random() * wordList.length)];
  word = entry.word;
  hintEl.textContent = entry.hint;
  remaining = MAX_GUESSES;
  correctLetters = new Set();
  wrongLetters = [];
  over = false;

  hideBanner();
  buildKeyboard();
  renderLives();
  renderTiles();
  renderStatus();
}

document.addEventListener("keydown", (e) => {
  const letter = e.key.toLowerCase();
  if (letter.length === 1 && letter >= "a" && letter <= "z") {
    guess(letter);
  }
});

newWordBtn.addEventListener("click", newWord);
resetBtn.addEventListener("click", newWord);

buildLives();
newWord();