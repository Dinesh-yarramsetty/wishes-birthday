const slide = document.querySelector('.slide');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');
const slides = () => Array.from(slide.querySelectorAll('.item'));
const songOne = document.getElementById('songOne');
const songTwo = document.getElementById('songTwo');
const progressFill = document.querySelector('.progress-fill');
const counter = document.querySelector('.slide-counter');
const soundNote = document.querySelector('.sound-note');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const mainMessage = document.getElementById('mainMessage');

const SLIDE_SECONDS = 7;
const TOTAL_SLIDES = 9;
const TOTAL_SECONDS = SLIDE_SECONDS * TOTAL_SLIDES;
const CROSSFADE_AT = 30;
const CROSSFADE_SECONDS = 5;
const PARTICLE_COLOURS = ['#ffe2a6', '#ffc4dc', '#c9f5e8', '#e2c9ff', '#ff9d8f'];
let currentSlide = 0;
let finished = false;
let started = false;
let startedAt = 0;
let slideTimer = null;
let secondSongTimer = null;

function createMicroFirework(xPercent, yPercent) {
  const container = document.querySelector('.container');
  const burst = document.createElement('div');
  burst.className = 'micro-firework';
  burst.style.left = `${xPercent}%`;
  burst.style.top = `${yPercent}%`;
  const colours = ['#ffe2a6', '#ffc4dc', '#c9f5e8', '#e2c9ff', '#ffb58e'];
  for (let i = 0; i < 10; i++) {
    const spark = document.createElement('i');
    spark.style.setProperty('--angle', `${i * 36 + Math.random() * 8}deg`);
    spark.style.setProperty('--distance', `${22 + Math.random() * 20}px`);
    spark.style.setProperty('--spark-colour', colours[Math.floor(Math.random() * colours.length)]);
    burst.appendChild(spark);
  }
  container.appendChild(burst);
  setTimeout(() => burst.remove(), 900);
}

function celebratePhotoMovement() {
  createMicroFirework(56, 34);
  setTimeout(() => createMicroFirework(91, 66), 130);
}

function refreshSlideText() {
  const active = slides()[0];
  if (!active) return;
  const content = active.querySelector('.content');
  if (content) {
    const theme = Array.from(active.classList).find(name => name.startsWith('theme-')) || 'theme-welcome';
    mainMessage.className = `main-message ${theme}`;
    mainMessage.innerHTML = content.outerHTML;
    mainMessage.querySelectorAll('.eyebrow, .name, .des, button').forEach((el) => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
  }
  counter.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${TOTAL_SLIDES}`;
}

function goNext() {
  if (finished) return;
  const items = slides();
  if (items.length < 2) return;
  slide.appendChild(items[0]);
  celebratePhotoMovement();
  currentSlide = (currentSlide + 1) % TOTAL_SLIDES;
  refreshSlideText();
}
function goPrevious() {
  if (finished) return;
  const items = slides();
  if (items.length < 2) return;
  slide.prepend(items[items.length - 1]);
  celebratePhotoMovement();
  currentSlide = (currentSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES;
  refreshSlideText();
}
nextBtn.addEventListener('click', goNext);
prevBtn.addEventListener('click', goPrevious);

function createCelebrationBurst() {
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight / 2;
  [0, 1, 2].forEach((burstIndex) => {
    const x = originX + (burstIndex - 1) * 95;
    const y = originY + (burstIndex === 1 ? -15 : 28);
    const ring = document.createElement('span');
    ring.className = 'burst-ring';
    ring.style.setProperty('--x', `${x}px`);
    ring.style.setProperty('--y', `${y}px`);
    ring.style.setProperty('--colour', PARTICLE_COLOURS[burstIndex]);
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 1000);
    for (let i = 0; i < 34; i++) {
      const particle = document.createElement('span');
      const angle = (Math.PI * 2 * i) / 34 + Math.random() * .16;
      const distance = 75 + Math.random() * 175;
      particle.className = 'burst-particle';
      particle.style.setProperty('--x', `${x}px`);
      particle.style.setProperty('--y', `${y}px`);
      particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      particle.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
      particle.style.setProperty('--colour', PARTICLE_COLOURS[Math.floor(Math.random() * PARTICLE_COLOURS.length)]);
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1450);
    }
  });
}

function beginSecondSong() {
  if (finished) return;
  songTwo.currentTime = 0;
  songTwo.volume = 0;
  songTwo.play().then(() => {
    const fadeStartedAt = performance.now();
    const fade = () => {
      if (finished) return;
      const elapsed = (performance.now() - fadeStartedAt) / 1000;
      const amount = Math.min(1, elapsed / CROSSFADE_SECONDS);
      songTwo.volume = amount;
      songOne.volume = 1 - amount;
      if (amount < 1) requestAnimationFrame(fade);
      else songOne.pause();
    };
    requestAnimationFrame(fade);
  }).catch(() => {
    soundNote.textContent = 'Could not play the second song. Check that adiye.mp3 is beside dinu.html.';
  });
}
function finishShow() {
  if (finished) return;
  finished = true;
  clearInterval(slideTimer);
  clearTimeout(secondSongTimer);
  songOne.pause();
  songTwo.pause();
  progressFill.style.width = '100%';
  soundNote.textContent = 'A little birthday memory, made just for you. 💗';
}
function updateProgress() {
  if (started && !finished) {
    const elapsed = Math.min(TOTAL_SECONDS, (performance.now() - startedAt) / 1000);
    progressFill.style.width = `${(elapsed / TOTAL_SECONDS) * 100}%`;
    if (elapsed >= TOTAL_SECONDS) finishShow();
  }
  requestAnimationFrame(updateProgress);
}
function startCelebration() {
  if (started) return;
  started = true;
  document.body.classList.add('is-started');
  startedAt = performance.now();
  createCelebrationBurst();
  startScreen.classList.add('is-hidden');
  soundNote.textContent = 'Enjoy the celebration! 🎂';
  songOne.volume = 1;
  songTwo.volume = 0;
  songOne.play().catch(() => {
    soundNote.textContent = 'First song missing. Add Assets/Audio/Ala lovaa.mpeg and restart.';
  });
  slideTimer = setInterval(() => {
    const elapsed = (performance.now() - startedAt) / 1000;
    if (elapsed >= TOTAL_SECONDS) return finishShow();
    if (currentSlide < TOTAL_SLIDES - 1) goNext();
  }, SLIDE_SECONDS * 1000);
  secondSongTimer = setTimeout(beginSecondSong, CROSSFADE_AT * 1000);
}
startButton.addEventListener('click', startCelebration);
refreshSlideText();
requestAnimationFrame(updateProgress);

const confettiLayer = document.querySelector('.confetti-layer');
for (let i = 0; i < 34; i++) {
  const piece = document.createElement('span');
  const shapes = ['', 'paper-dot', 'paper-ribbon', 'paper-diamond'];
  piece.className = shapes[i % shapes.length];
  piece.style.left = `${Math.random() * 100}%`;
  piece.style.background = PARTICLE_COLOURS[i % PARTICLE_COLOURS.length];
  piece.style.setProperty('--fall-time', `${6 + Math.random() * 7}s`);
  piece.style.setProperty('--delay', `${-Math.random() * 12}s`);
  piece.style.setProperty('--drift', `${Math.random() * 120 - 60}px`);
  confettiLayer.appendChild(piece);
}

// Tiny, elegant fireworks at the two upper corners of the main frame.
createMicroFirework(3.5, 5);
createMicroFirework(96.5, 5);
setInterval(() => {
  createMicroFirework(3.5, 5);
  setTimeout(() => createMicroFirework(96.5, 5), 420);
}, 3200);
