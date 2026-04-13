const GAME_MODE = window.GAME_MODE || "standard";

let audio = new Audio();
audio.preload = "auto";

let song = null;
let clipStart = 0;

let playCount = 0;
let used = new Set();
let attempt = 0;
let won = false;

let gameOver = false;

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

let analyser;
let buffer;
let data;

const canvas = document.getElementById("waveform");
const ctx = canvas ? canvas.getContext("2d") : null;

let sourceDone = false;

function initAudio() {
  if (sourceDone || !audioCtx) return;

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  buffer = analyser.frequencyBinCount;
  data = new Uint8Array(buffer);

  const src = audioCtx.createMediaElementSource(audio);
  src.connect(analyser);
  analyser.connect(audioCtx.destination);

  sourceDone = true;
}

async function ensureAudio() {
  if (audioCtx.state === "suspended") await audioCtx.resume();
  initAudio();
}

document.addEventListener("click", async () => {
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }
}, { once: true });

function pickSong() {
  const seed =
    GAME_MODE === "standard"
      ? new Date().toISOString().slice(0, 10)
      : Date.now().toString();

  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);

  song = songs[hash % songs.length];
  audio.src = song.file;
  audio.load();
}

function updatePlays() {
  const el = document.getElementById("playsLeft");
  if (!el) return;

  if (GAME_MODE === "endless") {
    el.textContent = "ENDLESS MODE";
    return;
  }

  const left = 3 - playCount;

  el.textContent = `PLAYS LEFT: ${Math.max(0, left)}`;
  el.style.color =
    left <= 0 ? "red" :
    left === 1 ? "orange" :
    left === 2 ? "yellow" : "green";
}

function autofill(v) {
  const box = document.getElementById("suggestions");
  if (!box) return;

  box.innerHTML = "";

  v = normalize(v);
  if (!v) return;

  const seen = new Set();

  songs
    .filter(s => s.norm.includes(v))
    .filter(s => {
      if (seen.has(s.norm)) return false;
      seen.add(s.norm);
      return true;
    })
    .slice(0, 6)
    .forEach(s => {
      const d = document.createElement("div");
      d.className = "suggestion-item";
      d.textContent = s.title;

      d.onclick = () => {
        const input = document.getElementById("guess");
        if (input) input.value = s.title;
        box.innerHTML = "";
      };

      box.appendChild(d);
    });
}

const guessInput = document.getElementById("guess");
if (guessInput) {
  guessInput.addEventListener("input", e => autofill(e.target.value));
}

function flash(type) {
  const f = document.getElementById("flash");
  if (!f) return;

  document.body.classList.remove("shake");
  f.className = "";
  void f.offsetWidth;

  if (type === "red") {
    f.classList.add("flash-red");
    document.body.classList.add("shake");
  }

  if (type === "green") {
    f.classList.add("flash-green");
  }

  setTimeout(() => {
    f.className = "";
    document.body.classList.remove("shake");
  }, 200);
}

function addHistory(text, type) {
  const box = document.getElementById("history");
  if (!box) return;

  const d = document.createElement("div");
  d.className = type;
  d.textContent = text;
  box.appendChild(d);
}

const revealTimes = [0.5, 1, 2, 3, 4, 5];

async function playClip() {
  await ensureAudio();
  if (!song) pickSong();

  if (!audio.duration || isNaN(audio.duration)) {
    await new Promise(r =>
      audio.addEventListener("loadedmetadata", r, { once: true })
    );
  }

  const len = revealTimes[Math.min(playCount, revealTimes.length - 1)];
  const max = Math.max(0, audio.duration - len);

  clipStart = Math.random() * max;

  audio.pause();
  audio.currentTime = clipStart;

  await new Promise(r => requestAnimationFrame(r));

  try {
    await audio.play();
  } catch {}

  playCount++;
  updatePlays();

  setTimeout(() => audio.pause(), len * 1000);
}

function checkGuess() {
  if (gameOver) return;

  const input = document.getElementById("guess");
  const result = document.getElementById("result");

  if (!input || !result) return;

  const g = normalize(input.value);
  const match = songs.find(s => s.norm === g);

  if (!match) {
    result.textContent = "INVALID";
    flash("red");
    input.value = "";
    return;
  }

  if (used.has(match.norm)) {
    result.textContent = "USED";
    flash("red");
    input.value = "";
    return;
  }

  used.add(match.norm);
  attempt++;

  if (g !== song.norm) {
    addHistory(match.title, "wrong");
    flash("red");

    playCount = 0;
    updatePlays();
    input.value = "";
    return;
  }

  flash("green");
  gameOver = true;

  setTimeout(() => {
    showCompletedScreen();
  }, 200);
}

function showCompletedScreen() {
  const gameUI = document.getElementById("gameUI");
  const resultUI = document.getElementById("resultUI");

  if (gameUI) gameUI.style.display = "none";
  if (!resultUI) return;

  resultUI.style.display = "block";

  const hist = document.getElementById("history");

  resultUI.innerHTML = `
    <div style="background: rgba(0,255,0,0.15); padding:20px; text-align:center;">
      <h1>COMPLETED</h1>
      <p>Attempts: ${attempt}</p>
      <div id="historyClone"></div>
      <button onclick="nextRound()">Next Puzzle</button>
      <button onclick="returnHome()">RETURN</button>
    </div>
  `;

  const clone = document.getElementById("historyClone");
  if (clone && hist) clone.innerHTML = hist.innerHTML;
}

function nextRound() {
  song = null;
  playCount = 0;
  used.clear();
  attempt = 0;
  won = false;
  gameOver = false;

  pickSong();

  const hist = document.getElementById("history");
  if (hist) hist.innerHTML = "";

  const result = document.getElementById("result");
  if (result) result.textContent = "";

  const input = document.getElementById("guess");
  if (input) input.value = "";

  const resultUI = document.getElementById("resultUI");
  const gameUI = document.getElementById("gameUI");

  if (resultUI) resultUI.style.display = "none";
  if (gameUI) gameUI.style.display = "block";

  updatePlays();
}

function draw() {
  requestAnimationFrame(draw);

  if (!analyser || !ctx || !canvas) return;

  analyser.getByteFrequencyData(data);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const step = canvas.width / buffer;

  for (let i = 0; i < buffer; i++) {
    const v = data[i] / 255;
    const h = v * canvas.height;

    ctx.fillStyle = "white";
    ctx.fillRect(i * step, (canvas.height - h) / 2, step - 1, h);
  }
}

function returnHome() {
  window.location.href = "./index.html";
}

window.onload = () => {
  pickSong();
  updatePlays();
  draw();

  const btn = document.getElementById("playBtn");
  if (btn) btn.onclick = playClip;
};
