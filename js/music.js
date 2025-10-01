const musicList = [];
for (let i = 1; i <= 13; i++) {
  musicList.push(`assets/musics/pokemusic${i}.mp3`);
}

let currentTrack = 0;
let isPlaying = false;

const audio = new Audio();
audio.src = musicList[currentTrack];
audio.volume = 0.5;

const playPauseBtn = document.getElementById("playPauseMusic");
const nextBtn = document.getElementById("nextMusic");
const prevBtn = document.getElementById("prevMusic");
const volumeSlider = document.getElementById("volumeControl");
const volumeEmoji = document.getElementById("volumeIcon");

// Ajusta o slider para 0-100 e converte para 0-1
volumeSlider.min = 0;
volumeSlider.max = 100;
volumeSlider.step = 1;
volumeSlider.value = audio.volume * 100;

function togglePlayPause() {
  if (isPlaying) {
    audio.pause();
    playPauseBtn.textContent = "▶️";
  } else {
    audio.play();
    playPauseBtn.textContent = "⏸️";
  }
  isPlaying = !isPlaying;
}

function nextMusic() {
  currentTrack = (currentTrack + 1) % musicList.length;
  audio.src = musicList[currentTrack];
  if (isPlaying) audio.play();
}

function prevMusic() {
  currentTrack = (currentTrack - 1 + musicList.length) % musicList.length;
  audio.src = musicList[currentTrack];
  if (isPlaying) audio.play();
}

function setVolume(e) {
  audio.volume = e.target.value / 100;
  updateVolumeEmoji();
}

function updateVolumeEmoji() {
  const v = audio.volume;
  if (v === 0) volumeEmoji.textContent = "🔇";
  else if (v <= 0.25) volumeEmoji.textContent = "🔈";
  else if (v <= 0.5) volumeEmoji.textContent = "🔉";
  else if (v <= 0.75) volumeEmoji.textContent = "🔊";
  else volumeEmoji.textContent = "📢";
}

playPauseBtn.addEventListener("click", togglePlayPause);
nextBtn.addEventListener("click", nextMusic);
prevBtn.addEventListener("click", prevMusic);
volumeSlider.addEventListener("input", setVolume);
audio.addEventListener("ended", nextMusic);

setVolume({ target: volumeSlider });
