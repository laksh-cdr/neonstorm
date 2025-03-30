// canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvas_width = window.innerWidth;
const canvas_height = window.innerHeight;

// other stuff
let spaceIsPressed = false;
let score = document.getElementById("score");
let scoreText = 0;

let startGameBtn = document.querySelector("#startGameBtn");
let gameOverUi = document.querySelector("#gameOverUi");
let bigScore = document.querySelector("#bigScore");

// getting directions
const mcoord = {
  x: 0,
  y: 0,
};

// projectile position
let dx;
let dy;
let distance;

let bulletpx;
let bulletpy;

// enemy position
let enemydx;
let enemydy;
let enemydistance;

// player position
let objectX = canvas_width / 2;
let objectY = canvas_height / 2;

const targetFPS = 120;
const frameDelay = 1000 / targetFPS;
let lastTime = 0;

let animationId;

console.log(`CONTROLS:
  Use mouse to aim.
  Press space key to shoot bullets.
  -----------------------`);
console.log(`RULES:
  >>>Shoot enemies with bullets.
  >>>If any enemy touches you,
  Its game over.`);

// INIT FUNCTION
function init(currentTime) {
  animationId = window.requestAnimationFrame(init);

  canvas.width = canvas_width;
  canvas.height = canvas_height;

  const deltaTime = currentTime - lastTime;
  if (deltaTime >= frameDelay) {
    score.innerHTML = scoreText;
    main();

    lastTime = currentTime - (deltaTime % frameDelay);
  }

  
}


// PLAYER CLASS
class Player {
  constructor() {
    this.coord = { x: canvas_width / 2, y: 300 };
    this.color = "cyan";
    this.size = 15;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.coord.x, this.coord.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    this.draw();
  }
}

// bullet class
class Projectile {
  constructor(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    this.px = canvas_width / 2;
    this.py = 300;
    this.color = "white";
    this.size = 6;
    this.vm = 20;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.px, this.py, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.draw();
    this.px += this.vx * this.vm;
    this.py += this.vy * this.vm;
  }
}

// ENEMY CLASS
class Enemy {
  constructor(vx, vy, px, py, size, color) {
    this.px = px;
    this.py = py;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.px, this.py, this.size, 0, Math.PI * 2);
    ctx.fill();

    this.px += this.vx * 0.5;
    this.py += this.vy * 0.5;
  }
}

// PARTICLES CLASS
class Particle {
  constructor(vx, vy, px, py, size, color) {
    this.px = px;
    this.py = py;
    this.vx = vx;
    this.vy = vy;
    this.vm = 2;
    this.color = color;
    this.size = size;
    this.alpha = 1;
  }

  draw() {
    ctx.save();

    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.px, this.py, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    this.px += this.vx * this.vm;
    this.py += this.vy * this.vm;
    this.alpha -= 0.01;
  }
}

let player = new Player();
let projectiles = [];
let enemies = [];
let particles = [];

function reset() {
  player = new Player();
  projectiles = [];
  enemies = [];
  particles = [];
  scoreText = 0;
}

// main function
function main() {

  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas_width, canvas_height);
  
  // bullet
  projectiles.forEach((projectile, index) => {
    projectile.update();
    if (
      projectile.px - projectile.size > canvas_width ||
      projectile.px + projectile.size < 0 ||
      projectile.py - projectile.size > canvas_height ||
      projectile.py + projectile.size < 0
    ) {
      projectiles.splice(index, 1);
    }

    // if projectile collide with the enemy
    enemies.forEach((enemy, eindex) => {
      if (
        projectile.py + projectile.size > enemy.py - enemy.size &&
        projectile.py - projectile.size < enemy.py + enemy.size &&
        projectile.px + projectile.size > enemy.px - enemy.size &&
        projectile.px - projectile.size < enemy.px + enemy.size
      ) {
        for (let i = 0; i < 10; i++) {
          particles.push(new Particle( Math.random() - 0.5, Math.random() - 0.5, projectile.px, projectile.py, 3, enemy.color ))
        }
        if (enemy.size - 10 > 10) {
          gsap.to(enemy, {
            size: enemy.size - 10
          })
          projectiles.splice(index, 1);
        } else {
          projectiles.splice(index, 1);
          enemies.splice(eindex, 1);
          scoreText++;
        }
      }
    });
  });

  // if enemy collide with the player
  enemies.forEach((enemy) => {
    if (
      enemy.px + enemy.size > player.coord.x - player.size &&
      enemy.px - enemy.size < player.coord.x + player.size &&
      enemy.py + enemy.size > player.coord.y - player.size &&
      enemy.py - enemy.size < player.coord.y + player.size
    ) {
      window.cancelAnimationFrame(animationId);
      gameOverUi.style.display = "flex";
      bigScore.innerHTML = scoreText;
    }
  })

  // player
  player.update();

  // enemy
  enemies.forEach((enemy) => {
    enemy.draw();
  });

  // particles
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0.01) {
      particles.splice(index, 1);
    }
    particle.draw();
  });

  // promotions
  if (scoreText >= 5) {
    player.color = "hsl(10, 50%, 50%)";
  }
  if (scoreText >= 50) {
    player.color = "hsl(65, 100%, 50.00%)";
  }
  if (scoreText >= 100) {
    player.color = "hsl(112, 100%, 50.00%)";
  }
  if (scoreText >= 250) {
    player.color = "hsl(177, 100%, 50.00%)";
  }
  if (scoreText >= 500) {
    player.color = "hsl(282, 100%, 50.00%)";
  }
  if (scoreText >= 950) {
    player.color = "hsl(148, 100%, 50.00%)";
  }

}

// SPAWNING ENEMIES
function spawnEnemy() {
  setInterval(() => {
    const size = Math.floor(Math.random() * (40 - 10 + 1) + 10);
    let px;
    let py;
    if (Math.random() < 0.5) {
      px = Math.random() < 0.5 ? 0 - size : canvas_width + size;
      py = Math.random() * canvas_height;
    } else {
      px = Math.random() * canvas_width;
      py = Math.random() < 0.5 ? 0 - size : canvas_height + size;
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`

    const angle = Math.atan2(canvas_height / 2 - py, canvas_width / 2 - px);
    const vx = Math.cos(angle);
    const vy = Math.sin(angle);

    enemies.push(new Enemy(vx, vy, px, py, size, color));
  }, 1100); // spawn enemy after this time
}

// EVENTS
window.addEventListener("keydown", function (e) {
  if (e.code === "Space" && !spaceIsPressed) {
    spaceIsPressed = true;
  }
});

window.addEventListener("keyup", function (e) {
  if (e.code === "Space") {
    spaceIsPressed = false;
  }
});

window.addEventListener("click", function (e) {
  mcoord.x = e.clientX - canvas.getBoundingClientRect().x;
  mcoord.y = e.clientY - canvas.getBoundingClientRect().y;

  const angle = Math.atan2(
    mcoord.y - canvas_height / 2,
    mcoord.x - canvas_width / 2
  );

  projectiles.push(new Projectile(Math.cos(angle), Math.sin(angle)));
});


startGameBtn.addEventListener("click", () => {
  reset();
  gameOverUi.style.display = "none";
  spawnEnemy();
  window.requestAnimationFrame(init);
})

