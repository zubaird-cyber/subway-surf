// ——— Setup —————————————————————————————— //
const canvas = document.getElementById("gameCanvas"), ctx = canvas.getContext("2d");
const laneX = [120,240,360];
let playerLane = 1, y=500, jumpY=0, isJump=false, velY=0;
let trains=[], coins=[], score=0, health=3, gameSpeed=5;
let hoverboardActive=false, hoverboardTimer=0;
let char = localStorage.getItem("character") || "default";
let board = localStorage.getItem("hoverboard") || "default";

// ——— Controls ———————————————————————————— //
let lastTap=0, tSX=0, tSY=0;
canvas.addEventListener("touchstart", e=>{
  const t=e.changedTouches[0];
  tSX=t.screenX; tSY=t.screenY;
  const now=Date.now(), dt=now-lastTap;
  if(dt<300) activateHoverboard();
  lastTap=now;
});
canvas.addEventListener("touchend", e=>{
  const t=e.changedTouches[0], dx=t.screenX-tSX, dy=t.screenY-tSY;
  if(Math.abs(dx)>Math.abs(dy)){
    if(dx>50 && playerLane<2) playerLane++;
    else if(dx<-50 && playerLane>0) playerLane--;
  } else {
    if(dy>50) roll();
    else if(dy<-50 && !isJump) jump();
  }
});

// ——— Mechanics ———————————————————————————— //
function jump(){ isJump=true; velY=-15; }
function roll(){ /* Optional roll logic here */ }
function activateHoverboard(){
  if(!hoverboardActive){
    hoverboardActive=true; hoverboardTimer=900;
  }
}

// ——— Entities —————————————————————————————— //
class Train {
  constructor(lane){ this.lane=lane; this.y=-60; this.hasCoins=Math.random()<0.5; }
  update(){ this.y+=gameSpeed; }
  draw(){
    ctx.fillStyle="gray"; ctx.fillRect(laneX[this.lane]-40,this.y,80,60);
    if(this.hasCoins) { ctx.fillStyle="gold"; ctx.beginPath(); ctx.arc(laneX[this.lane],this.y-10,10,0,2*Math.PI); ctx.fill(); }
  }
}

class Coin {
  constructor(lane,y){ this.lane=lane; this.y=y; }
  update(){ this.y+=gameSpeed; }
  draw(){ ctx.fillStyle="yellow"; ctx.beginPath(); ctx.arc(laneX[this.lane],this.y,10,0,2*Math.PI); ctx.fill(); }
}

// ——— Shop Logic ——————————————————————————— //
function selectChar(n){ char=n; localStorage.setItem("character",n); }
function selectBoard(n){ board=n; localStorage.setItem("hoverboard",n); }
function startGame(){ document.getElementById("shopScreen").style.display="none"; canvas.style.display="block"; }

// ——— Spawn Logic ——————————————————————————— //
function spawnTrain(){ trains.push(new Train(Math.floor(Math.random()*3))); }
function spawnCoin(){ coins.push(new Coin(Math.floor(Math.random()*3), -20)); }

// ——— Collisions ——————————————————————————— //
function checkCollisions(){
  trains.forEach((t,i)=>{
    if(t.lane===playerLane && t.y+60>y+jumpY && t.y<y+50+jumpY){
      if(!hoverboardActive){ health--; trains.splice(i,1); if(health<=0) gameOver(); }
    }
  });
  coins.forEach((c,i)=>{
    if(c.lane===playerLane && c.y+10>y+jumpY && c.y<y+50+jumpY){ score+=100; coins.splice(i,1); }
  });
}

// ——— Game Over ———————————————————————————— //
function gameOver(){ alert(`Game Over! Score:${score}`); location.reload(); }

// ——— Update & Draw —————————————————————————— //
function update(){
  if(isJump){ jumpY+=velY; velY+=1; if(jumpY>=0){ jumpY=0; isJump=false; } }
  if(hoverboardActive && --hoverboardTimer<=0) hoverboardActive=false;
  gameSpeed = 5 + Math.floor(score/1000);
  if(Math.random() < 0.02 + score/20000) spawnTrain();
  if(Math.random() < 0.02) spawnCoin();
  trains.forEach(t=>t.update()); coins.forEach(c=>c.update());
  checkCollisions();
  trains = trains.filter(t => t.y < canvas.height);
  coins = coins.filter(c => c.y < canvas.height);
  score++;
}
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="blue"; ctx.fillRect(laneX[playerLane]-20, y+jumpY, 40, 50);
  trains.forEach(t=>t.draw()); coins.forEach(c=>c.draw());
  // HUD
  ctx.fillStyle="black"; ctx.font="20px Arial";
  ctx.fillText(`Score:${score}`,10,30);
  ctx.fillText(`Health:${health}`,10,60);
  if(hoverboardActive) ctx.fillText(`Hover:${(hoverboardTimer/60).toFixed(1)}s`,10,90);
}
function gameLoop(){ update(); draw(); requestAnimationFrame(gameLoop); }

// ——— Start ———————————————————————————————— //
canvas.style.display = 'none';
document.getElementById("shopScreen").style.display = 'block';
function drawBackground() {
  // Draw track base
  ctx.fillStyle = "#444"; // dark gray for track
  ctx.fillRect(80, 0, 320, canvas.height);

  // Draw rails
  ctx.strokeStyle = "#bbb";
  ctx.lineWidth = 6;
  for (let i = 0; i < canvas.height; i += 40) {
    // Left rail
    ctx.beginPath();
    ctx.moveTo(100, i);
    ctx.lineTo(100, i + 20);
    ctx.stroke();
    // Right rail
    ctx.beginPath();
    ctx.moveTo(360, i);
    ctx.lineTo(360, i + 20);
    ctx.stroke();
  }

  // Draw cross ties (horizontal wooden beams)
  ctx.strokeStyle = "#86592d";
  ctx.lineWidth = 8;
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(100, y + 10);
    ctx.lineTo(360, y + 10);
    ctx.stroke();
  }
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  // Draw player, trains, coins...
  ctx.fillStyle = "blue";
  ctx.fillRect(laneX[playerLane] - 20, y + jumpY, 40, 50);

  trains.forEach(t => t.draw());
  coins.forEach(c => c.draw());

  // HUD...
}
const fullscreenBtn = document.getElementById("fullscreenBtn");

fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
});
let trackOffset = 0;

function drawBackground() {
  // Track base
  ctx.fillStyle = "#444";
  ctx.fillRect(80, 0, 320, canvas.height);

  // Rails
  ctx.strokeStyle = "#bbb";
  ctx.lineWidth = 6;
  for (let i = 0; i < canvas.height; i += 40) {
    let y = (i + trackOffset) % canvas.height;
    // Left rail dashed segment
    ctx.beginPath();
    ctx.moveTo(100, y);
    ctx.lineTo(100, y + 20);
    ctx.stroke();

    // Right rail dashed segment
    ctx.beginPath();
    ctx.moveTo(360, y);
    ctx.lineTo(360, y + 20);
    ctx.stroke();
  }

  // Cross ties
  ctx.strokeStyle = "#86592d";
  ctx.lineWidth = 8;
  for (let y = 0; y < canvas.height; y += 40) {
    let tieY = (y + trackOffset) % canvas.height;
    ctx.beginPath();
    ctx.moveTo(100, tieY + 10);
    ctx.lineTo(360, tieY + 10);
    ctx.stroke();
  }
}

// Update track offset inside update() or gameLoop()
function update() {
  // Existing update code ...

  trackOffset += gameSpeed;
  if (trackOffset > 40) trackOffset -= 40;

  // The rest of update...
}
