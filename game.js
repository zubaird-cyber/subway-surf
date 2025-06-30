(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const shopScreen = document.getElementById("shopScreen");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScoreEl = document.getElementById("finalScore");
  const restartBtn = document.getElementById("restartBtn");
  const startBtn = document.getElementById("startBtn");

  const charactersContainer = document.getElementById("characters");
  const hoverboardsContainer = document.getElementById("hoverboards");

  const laneCount = 3;
  const laneX = [120, 240, 360];
  const gravity = 1;
  const hoverboardDuration = 15000; // ms
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Assets placeholders for characters and hoverboards (text-based)
  const characters = [
    { id: "default", label: "😎" },
    { id: "ninja", label: "🥷" },
    { id: "robot", label: "🤖" },
  ];

  const hoverboards = [
    { id: "default", label: "🛹" },
    { id: "fire", label: "🔥" },
    { id: "ice", label: "❄️" },
  ];

  class Player {
    constructor(game) {
      this.game = game;
      this.lane = 1;
      this.x = laneX[this.lane];
      this.y = canvasHeight - 100;
      this.targetX = this.x;
      this.jumpY = 0;
      this.isJumping = false;
      this.velY = 0;
      this.health = 3;
      this.hoverboardActive = false;
      this.hoverboardTimer = 0;
      this.score = 0;
      this.width = 40;
      this.height = 50;
      this.character = "default";
      this.hoverboard = "default";
    }

    update(deltaTime) {
      this.x += (this.targetX - this.x) * 0.2;

      if (this.isJumping) {
        this.jumpY += this.velY;
        this.velY += gravity;
        if (this.jumpY >= 0) {
          this.jumpY = 0;
          this.isJumping = false;
        }
      }

      if (this.hoverboardActive) {
        this.hoverboardTimer -= deltaTime;
        if (this.hoverboardTimer <= 0) {
          this.hoverboardActive = false;
          this.hoverboardTimer = 0;
        }
      }
    }

    jump() {
      if (!this.isJumping) {
        this.isJumping = true;
        this.velY = -15;
      }
    }

    moveLeft() {
      if (this.lane > 0) {
        this.lane--;
        this.targetX = laneX[this.lane];
      }
    }

    moveRight() {
      if (this.lane < laneCount - 1) {
        this.lane++;
        this.targetX = laneX[this.lane];
      }
    }

    activateHoverboard() {
      if (!this.hoverboardActive) {
        this.hoverboardActive = true;
        this.hoverboardTimer = hoverboardDuration;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y + this.jumpY);

      // Draw hoverboard effect if active
      if (this.hoverboardActive) {
        const glowAlpha = 0.6 + 0.4 * Math.sin(Date.now() / 100);
        ctx.shadowColor = "yellow";
        ctx.shadowBlur = 20;
        ctx.globalAlpha = glowAlpha;
        ctx.fillRect(-25, 15, 50, 10);
        ctx.globalAlpha = 1;
      }

      // Draw player box (or emoji)
      ctx.fillStyle = "#3498db";
      ctx.fillRect(-this.width / 2, -this.height, this.width, this.height);

      ctx.font = "36px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";

      // Character emoji on player
      let emoji = characters.find(c => c.id === this.character)?.label || "😎";
      ctx.fillText(emoji, 0, -this.height / 2);

      ctx.restore();
    }
  }

  class Train {
    constructor(game, lane) {
      this.game = game;
      this.lane = lane;
      this.x = laneX[lane];
      this.y = -80;
      this.width = 80;
      this.height = 60;
      this.speed = game.gameSpeed;
      this.hasCoins = Math.random() < 0.5;
    }

    update(deltaTime) {
      this.y += this.speed * deltaTime;
    }

    draw(ctx) {
      ctx.save();
      ctx.fillStyle = "#555555";
      ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);

      // Windows
      ctx.fillStyle = "#222";
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(this.x - 30 + i * 25, this.y + 15, 20, 20);
      }

      if (this.hasCoins) {
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(this.x, this.y - 15, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  class Coin {
    constructor(game, lane, y) {
      this.game = game;
      this.lane = lane;
      this.x = laneX[lane];
      this.y = y;
      this.radius = 10;
      this.speed = game.gameSpeed;
      this.angle = 0;
    }

    update(deltaTime) {
      this.y += this.speed * deltaTime;
      this.angle += 0.1;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = "gold";
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Coin inner details
      ctx.strokeStyle = "#ffeb3b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.stroke();

      ctx.restore();
    }
  }

  class Game {
    constructor() {
      this.player = new Player(this);
      this.trains = [];
      this.coins = [];
      this.lastTime = 0;
      this.spawnTimer = 0;
      this.spawnInterval = 1500; // ms
      this.gameSpeed = 0.3; // pixels/ms ~ 300 px/s
      this.score = 0;
      this.health = 3;
      this.state = "shop"; // "shop", "playing", "gameover"
      this
