const slider = document.getElementById("volumeSlider");

function getAudioElements() {
  return Array.from(document.querySelectorAll("audio"));
}

function applyVolume(v) {
  const vol = v / 100;

  getAudioElements().forEach(a => {
    a.volume = vol;
  });

  localStorage.setItem("masterVolume", vol);
}

function initVolume() {
  const saved = localStorage.getItem("masterVolume");

  const start = saved !== null ? Number(saved) : 0.5;

  slider.value = start * 100;
  applyVolume(start * 100);
}

slider.addEventListener("input", (e) => {
  applyVolume(Number(e.target.value));
});

initVolume();
