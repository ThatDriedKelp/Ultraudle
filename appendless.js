const GAME_MODE = "endless";

let audio = new Audio();
audio.preload = "auto";

let gameOver = false;
let song;
let playCount = 0;
let used = new Set();
let attempt = 0;

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const ctxAudio = new AudioCtx();
const analyser = ctxAudio.createAnalyser();
analyser.fftSize = 256;

const buffer = analyser.frequencyBinCount;
const data = new Uint8Array(buffer);

const canvas = document.getElementById("waveform");
const ctx = canvas.getContext("2d");

let sourceDone=false;

function initAudio(){
  if(sourceDone) return;
  const src=ctxAudio.createMediaElementSource(audio);
  src.connect(analyser);
  analyser.connect(ctxAudio.destination);
  sourceDone=true;
}

async function ensureAudio(){
  if(ctxAudio.state==="suspended") await ctxAudio.resume();
  initAudio();
}

function pickSong(){
  const hash=[...Date.now().toString()].reduce((a,c)=>a+c.charCodeAt(0),0);
  song=songs[hash%songs.length];
  audio.src=song.file;
  audio.load();
}

function updatePlays(){
  document.getElementById("playsLeft").textContent="ENDLESS MODE";
}

function autofill(v){
  const box=document.getElementById("suggestions");
  box.innerHTML="";
  v=normalize(v);
  if(!v)return;

  const seen=new Set();

  songs.filter(s=>s.norm.includes(v)).filter(s=>{
    if(seen.has(s.norm)) return false;
    seen.add(s.norm);
    return true;
  }).slice(0,6).forEach(s=>{
    const d=document.createElement("div");
    d.textContent=s.title;
    d.className="suggestion-item";
    d.onclick=()=>{
      document.getElementById("guess").value=s.title;
      box.innerHTML="";
    };
    box.appendChild(d);
  });
}

document.getElementById("guess").addEventListener("input",e=>autofill(e.target.value));

async function playClip(){
  await ensureAudio();
  if(!song) pickSong();

  const len=1.2;

  audio.currentTime=Math.random()*Math.max(0,audio.duration-len);

  await audio.play().catch(()=>{});

  setTimeout(()=>audio.pause(),len*1000);
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

  // prevent reuse
  if (used.has(match.norm)) {
    result.textContent = "USED";
    flash("red");
    input.value = "";
    return;
  }

  used.add(match.norm);
  attempt++;

  // WRONG
  if (g !== song.norm) {
    addHistory(match.title, "wrong");
    flash("red");

    playCount = 0;
    updatePlays();
    input.value = "";
    return;
  }

  // ================= CORRECT =================

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

function showResultScreen() {
  document.getElementById("gameUI").style.display = "none";

  const resultUI = document.getElementById("resultUI");
  resultUI.style.display = "block";

  resultUI.innerHTML = `
    <div>
      <h1>Correct</h1>
      <p>Attempts: ${attempt}</p>

      <button onclick="nextRound()">Next</button>
      <button onclick="returnHome()">← RETURN TO HOME</button>
    </div>
  `;
}

function draw(){
  requestAnimationFrame(draw);

  analyser.getByteFrequencyData(data);

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const step=canvas.width/buffer;

  for(let i=0;i<buffer;i++){
    const v=data[i]/255;
    const h=v*canvas.height;

    ctx.fillStyle="white";
    ctx.fillRect(i*step,(canvas.height-h)/2,step-1,h);
  }
}

function returnHome() {
  window.location.href = "index.html";
}

function nextRound(){
  used.clear();
  pickSong();

  document.getElementById("history").innerHTML="";
  document.getElementById("result").textContent="";
  document.getElementById("guess").value="";
  document.getElementById("resultUI").style.display="none";
  document.getElementById("gameUI").style.display="block";
}

window.onload=()=>{
  pickSong();
  draw();
  updatePlays();
  document.getElementById("playBtn").onclick=playClip;
};