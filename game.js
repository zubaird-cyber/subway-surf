
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.getElementById('fullscreenBtn').addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.body.requestFullscreen();
  }
});

let x = 100;
let y = canvas.height - 150;
let vy = 0;
let gravity = 0.8;
let jumping = false;

function update() {
  if (jumping) {
    vy += gravity;
    y += vy;
    if (y >= canvas.height - 150) {
      y = canvas.height - 150;
      vy = 0;
      jumping = false;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffcc00";
  ctx.fillRect(x, y, 50, 50);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !jumping) {
    jumping = true;
    vy = -20;
  }
});

loop();
