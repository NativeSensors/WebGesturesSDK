
// cursor is brought from vision.js file
// const cursor = getCursor();

const canvas = document.getElementById("gameCanvas");
var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
var viewportHeight = (window.innerHeight || document.documentElement.clientHeight) - 50;
canvas.style.width  = viewportWidth;
canvas.style.height = viewportHeight;
canvas.width  = viewportWidth;
canvas.height = viewportHeight;
const ctx = canvas.getContext("2d");

var score = 0;
const playerSize = 30;
const enemySize = 20;
const playerSpeed = 2;
const bulletSpeed = 0.5;
const enemySpeed = 0.2;
const shootingCooldown = 500; // in milliseconds

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  direction: "up", // initial direction
  lastShotTime: 0,
};

let bullets = [];
let enemies = [];

function spawnEnemy() {
  if(enemies.length < 20)
  {
    const side = Math.floor(Math.random() * 2); // 0: left, 1: up, 2: right, 3: down
    let x, y;
    switch (side) {
      case 0:
        x = 0;
        y = Math.random() * canvas.height;
        break;
      case 1:
        x = canvas.width;
        y = Math.random() * canvas.height;
        break;
    }
    enemies.push({ x, y });
  }
}

function reset()
{
  score = 0;
  setScore(score);
  bullets = [];
  enemies = [];
}

function setScore(new_score){
  score = new_score;
  document.getElementsByClassName("score")[0].innerHTML = `Points: ${score}!`;
}

function drawPlayer() {
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x - playerSize / 2, player.y - playerSize / 2, playerSize, playerSize);
}

function drawBullet(bullet) {
  ctx.fillStyle = "#FFFF00";
  ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
}

function drawEnemy(enemy) {
  ctx.fillStyle = "red";
  ctx.fillRect(enemy.x - enemySize / 2, enemy.y - enemySize / 2, enemySize, enemySize);
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

function shotTragetedEnemy()
{
    // Get the center coordinates
    var centerX = cursor.offsetLeft + cursor.offsetWidth / 2;
    var centerY = cursor.offsetTop + cursor.offsetHeight / 2;

    // Change the center coordinates to integers
    var centerXInt = Math.round(centerX);
    var centerYInt = Math.round(centerY);

    var closet_enemy = null;
    var dist = 200;

    enemies.forEach((enemy) => {
      new_dist = calculateDistance(centerXInt, centerYInt, enemy.x,enemy.y);
      
      if(new_dist < dist)
      {
        dist = new_dist;
        closet_enemy = enemy;
      }
    });
    
    // Shoot bullets
    if(bullets.length < 20 && closet_enemy != null)
    {
      const currentTime = Date.now();
      if (currentTime - player.lastShotTime > shootingCooldown) {
        bullets.push({ x: player.x, y: player.y, direction_x: (player.x - closet_enemy.x)/100 * bulletSpeed, direction_y: (player.y - closet_enemy.y)/100 * bulletSpeed});
        player.lastShotTime = currentTime;
      } 
    }
  
}

function checkPlayersDeath()
{
  enemies.forEach((enemy) =>{
      if(calculateDistance(player.x,player.y,enemy.x,enemy.y) < 1)
      {
        reset();
      }
  });
}


function update() {
  // Move bullets
  shotTragetedEnemy();
  
  bullets = bullets.filter(bullet => {
    bullet.x -= bullet.direction_x;
    bullet.y -= bullet.direction_y;
    
    return bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height;
  });

  // Move enemies towards the player
  enemies.forEach(enemy => {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angle) * enemySpeed;
    enemy.y += Math.sin(angle) * enemySpeed;
  });

  // Check for collisions
  bullets.forEach(bullet => {
    enemies = enemies.filter(enemy => {
      const distance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);
      if (distance > enemySize / 2) {
        return true; // enemy survives
      }
      score += 1;
      setScore(score);
      return false; // enemy hit
    });
  });
}

function draw() {
  ctx.clearRect(0, 0, viewportWidth, viewportHeight);
  
  drawPlayer();
  bullets.forEach(drawBullet);
  enemies.forEach(drawEnemy);
}

var game_run = false;
function gameLoop() {
  if(game_run)
  {
    checkPlayersDeath();
    update();
    draw();
  }
  requestAnimationFrame(gameLoop);
}

var spaw_process_id = null; 
function start_game(){
    cursor.style.width = "200px";
    cursor.style.height = "200px";
    cursor.style.backgroundColor = "#33993333";
    game_run = true;

    if(spaw_process_id === null){
      spaw_process_id = setInterval(spawnEnemy, 1000);
    }
    gameLoop();
}


function stop_game(){
    game_run = false;
    cursor.style.width = "50px";
    cursor.style.height = "50px";

    if(spaw_process_id != null){
      clearInterval(spaw_process_id);
    }
}

