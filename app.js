const GAME_MODE = window.GAME_MODE || "standard";

let audio = new Audio();
audio.preload = "auto";

let song = null;
let clipStart = 0;

let playCount = 0;
let used = new Set();
let attempt = 0;
let won = false;
let streak = 0;

let gameOver = false; 

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

document.addEventListener("click", async () => {
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }
}, { once: true });


const analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;

const buffer = analyser.frequencyBinCount;
const data = new Uint8Array(buffer);

const canvas = document.getElementById("waveform");
const ctx = canvas.getContext("2d");

let sourceDone = false;

function initAudio() {
  if (sourceDone) return;
  const src = audioCtx.createMediaElementSource(audio);
  src.connect(analyser);
  analyser.connect(audioCtx.destination);
  sourceDone = true;
}

async function ensureAudio() {
  if (audioCtx.state === "suspended") await audioCtx.resume();
  initAudio();
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

function autofill(v) {
  const box = document.getElementById("suggestions");
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
        document.getElementById("guess").value = s.title;
        box.innerHTML = "";
      };

      box.appendChild(d);
    });
}

document.getElementById("guess").addEventListener("input", e =>
  autofill(e.target.value)
);

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
  document.getElementById("history").appendChild(d);
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
  } catch (e) {
    console.log(e);
  }

  playCount++;
  updatePlays();

  setTimeout(() => audio.pause(), len * 1000);
}

function checkGuess() {
  if (gameOver) return;

  const input = document.getElementById("guess");
  const result = document.getElementById("result");

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
    if (GAME_MODE === "standard") {
      showCompletedScreen();
    } else {
      showResultScreen();
    }
  }, 200);
}

function showCompletedScreen() {
  document.getElementById("gameUI").style.display = "none";

  const resultUI = document.getElementById("resultUI");
  resultUI.style.display = "block";

  resultUI.innerHTML = `
    <div style="
      background: rgba(0,255,0,0.15);
      backdrop-filter: blur(6px);
      padding: 20px;
      text-align: center;
      color: white;
    ">

      <h1 style="font-size: 48px;">COMPLETED</h1>

      <p style="font-size: 22px;">
        Attempts: ${attempt}
      </p>

      <div id="historyClone"></div>

      <button onclick="nextRound()">Next Puzzle</button>

      <button onclick="returnHome()">← RETURN TO HOME</button>
    </div>
  `;

  const hist = document.getElementById("history");
  document.getElementById("historyClone").innerHTML = hist.innerHTML;
}


function nextRound() {
  song = null;
  playCount = 0;
  used.clear();
  attempt = 0;
  won = false;

  pickSong();

  document.getElementById("history").innerHTML = "";
  document.getElementById("result").textContent = "";
  document.getElementById("guess").value = "";

  document.getElementById("resultUI").style.display = "none";
  document.getElementById("gameUI").style.display = "block";

  updatePlays();
}


function draw() {
  requestAnimationFrame(draw);

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
  draw();
  updatePlays();

  document.getElementById("playBtn").onclick = playClip;
};
