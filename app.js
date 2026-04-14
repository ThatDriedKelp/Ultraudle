const GAME_MODE = window.GAME_MODE || "standard";

let audio = new Audio();
audio.preload = "auto";

const savedVolume = localStorage.getItem("masterVolume");
audio.volume = savedVolume !== null ? Number(savedVolume) : 0.5;

let song = null;
let clipStart = 0;

let playCount = 0;
let used = new Set();
let attempt = 0;
let won = false;
let gameOver = false;

let audioCtx;
let analyser;
let dataArray;
let canvas;
let ctx;

let sourceNode;

const revealTimes = [0.5, 1, 2, 3, 4, 5];

function initAudio() {
  if (audioCtx) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  dataArray = new Uint8Array(analyser.frequencyBinCount);

  audio.volume = Number(localStorage.getItem("masterVolume") ?? 0.5);

  sourceNode = audioCtx.createMediaElementSource(audio);
  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);
}

async function ensureAudio() {
  initAudio();
  if (audioCtx.state === "suspended") await audioCtx.resume();
}

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
    el.style.color = "white";
    return;
  }

  const left = 3 - playCount;

  el.textContent = `PLAYS LEFT: ${Math.max(0, left)}`;
  el.style.color =
    left <= 0 ? "red" :
    left === 1 ? "orange" :
    left === 2 ? "yellow" : "green";
}

function normalizeLocal(v) {
  if (typeof normalize === "function") return normalize(v);
  return v.toLowerCase().trim();
}

function autofill(v) {
  const box = document.getElementById("suggestions");
  if (!box) return;

  box.innerHTML = "";

  v = normalizeLocal(v);
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
  const d = document.createElement("div");
  d.className = type;
  d.textContent = text;

  const h = document.getElementById("history");
  if (h) h.appendChild(d);
}

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

  await audio.play();

  setTimeout(() => audio.pause(), len * 1000);

  playCount++;
  updatePlays();
}

function checkGuess() {
  if (gameOver) return;
  if (GAME_MODE === "standard" && attempt >= 6) return;

  const input = document.getElementById("guess");
  const result = document.getElementById("result");

  if (!input || !result) return;

  const g = normalizeLocal(input.value);
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
  won = true;
  result.textContent = "CORRECT";

  setTimeout(() => {
    showCompletedScreen();
  }, 300);
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
      <button onclick="returnHome()">RETURN HOME</button>
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

  const h = document.getElementById("history");
  if (h) h.innerHTML = "";

  const r = document.getElementById("result");
  if (r) r.textContent = "";

  const i = document.getElementById("guess");
  if (i) i.value = "";

  const rui = document.getElementById("resultUI");
  const gui = document.getElementById("gameUI");

  if (rui) rui.style.display = "none";
  if (gui) gui.style.display = "block";

  updatePlays();
}

function draw() {
  requestAnimationFrame(draw);

  if (!analyser || !ctx || !canvas) return;

  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const step = canvas.width / dataArray.length;

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 255;
    const h = v * canvas.height;

    ctx.fillStyle = "white";
    ctx.fillRect(i * step, (canvas.height - h) / 2, step - 1, h);
  }
}

function returnHome() {
  window.location.href = "./index.html";
}

window.onload = () => {
  canvas = document.getElementById("waveform");
  if (canvas) ctx = canvas.getContext("2d");

  pickSong();
  updatePlays();
  draw();

  const btn = document.getElementById("playBtn");
  if (btn) btn.onclick = playClip;

  const input = document.getElementById("guess");
  if (input) input.addEventListener("input", e => autofill(e.target.value));
};
