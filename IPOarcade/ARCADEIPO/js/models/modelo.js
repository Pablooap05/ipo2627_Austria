/**
 * MODELO (js/models/modelo.js)
 * Contiene toda la lógica de negocio, entidades, físicas, nivel y estado del juego.
 * No contiene referencias al DOM ni a estilos visuales (arquitectura MVC pura).
 */

// 1. CONFIGURACIÓN Y ENTIDAD JUGADOR
export const PLAYER_CONFIG = {
  WIDTH: 28,
  HEIGHT: 40,
  GRAVITY: 0.55,
  MAX_FALL_SPEED: 12,
  ACCELERATION: 0.6,
  FRICTION: 0.82,
  MAX_SPEED: 4.8,
  JUMP_FORCE: -12.5,
  INVINCIBILITY_DURATION: 1.8 // segundos tras recibir daño
};

export class Player {
  constructor(x = 100, y = 300) {
    this.startX = x;
    this.startY = y;
    this.reset();
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.width = PLAYER_CONFIG.WIDTH;
    this.height = PLAYER_CONFIG.HEIGHT;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = false;
    this.facingRight = true;
    this.isJumping = false;
    this.invincibleTimer = 0;
    this.runFrame = 0;
    this.runAnimSpeed = 0.2;
    this.isDead = false;
  }

  jump() {
    if (this.isGrounded && !this.isDead) {
      this.vy = PLAYER_CONFIG.JUMP_FORCE;
      this.isGrounded = false;
      this.isJumping = true;
    }
  }

  moveLeft() {
    if (this.isDead) return;
    this.vx -= PLAYER_CONFIG.ACCELERATION;
    this.facingRight = false;
  }

  moveRight() {
    if (this.isDead) return;
    this.vx += PLAYER_CONFIG.ACCELERATION;
    this.facingRight = true;
  }

  update(deltaTime) {
    if (this.isDead) {
      this.vy += PLAYER_CONFIG.GRAVITY * 0.8;
      this.y += this.vy;
      return;
    }

    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= deltaTime;
    }

    this.vx *= PLAYER_CONFIG.FRICTION;
    if (Math.abs(this.vx) < 0.05) this.vx = 0;
    if (this.vx > PLAYER_CONFIG.MAX_SPEED) this.vx = PLAYER_CONFIG.MAX_SPEED;
    if (this.vx < -PLAYER_CONFIG.MAX_SPEED) this.vx = -PLAYER_CONFIG.MAX_SPEED;

    this.vy += PLAYER_CONFIG.GRAVITY;
    if (this.vy > PLAYER_CONFIG.MAX_FALL_SPEED) {
      this.vy = PLAYER_CONFIG.MAX_FALL_SPEED;
    }

    if (this.isGrounded && Math.abs(this.vx) > 0.3) {
      this.runFrame += Math.abs(this.vx) * this.runAnimSpeed;
    } else if (this.isGrounded) {
      this.runFrame = 0;
    }
  }

  takeDamage() {
    if (this.invincibleTimer <= 0 && !this.isDead) {
      this.invincibleTimer = PLAYER_CONFIG.INVINCIBILITY_DURATION;
      this.vy = -6;
      return true;
    }
    return false;
  }

  die() {
    this.isDead = true;
    this.vy = -10;
  }
}

// 2. CONFIGURACIÓN Y ENTIDAD ENEMIGO
export const ENEMY_TYPES = {
  GOOMBA: 'goomba',
  SPIKE: 'spike'
};

export class Enemy {
  constructor(x, y, type = ENEMY_TYPES.GOOMBA, patrolDist = 120) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = type === ENEMY_TYPES.GOOMBA ? 30 : 28;
    this.height = type === ENEMY_TYPES.GOOMBA ? 30 : 24;
    this.speed = type === ENEMY_TYPES.GOOMBA ? 1.4 : 0;
    this.vx = this.speed;
    this.vy = 0;
    this.patrolLeft = x - patrolDist;
    this.patrolRight = x + patrolDist;
    this.isDead = false;
    this.deadTimer = 0;
  }

  update(deltaTime) {
    if (this.isDead) {
      this.deadTimer -= deltaTime;
      return;
    }

    if (this.type === ENEMY_TYPES.GOOMBA) {
      this.x += this.vx;
      if (this.x <= this.patrolLeft) {
        this.x = this.patrolLeft;
        this.vx = Math.abs(this.speed);
      } else if (this.x >= this.patrolRight) {
        this.x = this.patrolRight;
        this.vx = -Math.abs(this.speed);
      }
    }
  }

  stomp() {
    this.isDead = true;
    this.deadTimer = 0.4;
    this.height = 14;
    this.y += 16;
  }
}

// 3. CONFIGURACIÓN Y ENTIDAD NIVEL
export const LEVEL_CONFIG = {
  TILE_SIZE: 32,
  HEIGHT: 480,
  WIDTH: 3600
};

export class Level {
  constructor(levelNumber = 1) {
    this.levelNumber = levelNumber;
    this.width = LEVEL_CONFIG.WIDTH;
    this.height = LEVEL_CONFIG.HEIGHT;
    this.platforms = [];
    this.coins = [];
    this.enemies = [];
    this.flag = null;
    this.initLevel();
  }

  initLevel() {
    this.platforms = [];
    this.coins = [];
    this.enemies = [];

    // Suelo continuo con abismos estratégicos
    this.platforms.push({ x: 0, y: 416, width: 800, height: 64, type: 'ground' });
    this.platforms.push({ x: 920, y: 416, width: 680, height: 64, type: 'ground' });
    this.platforms.push({ x: 1720, y: 416, width: 880, height: 64, type: 'ground' });
    this.platforms.push({ x: 2750, y: 416, width: 750, height: 64, type: 'ground' });

    // Plataformas flotantes, tuberías y bloques
    this.platforms.push({ x: 240, y: 320, width: 128, height: 28, type: 'block' });
    this.platforms.push({ x: 440, y: 260, width: 160, height: 28, type: 'block' });
    this.platforms.push({ x: 680, y: 350, width: 60, height: 66, type: 'pipe' });

    this.platforms.push({ x: 830, y: 320, width: 60, height: 24, type: 'floating' });

    this.platforms.push({ x: 1040, y: 330, width: 140, height: 28, type: 'block' });
    this.platforms.push({ x: 1260, y: 250, width: 120, height: 28, type: 'block' });
    this.platforms.push({ x: 1460, y: 340, width: 64, height: 76, type: 'pipe' });

    this.platforms.push({ x: 1630, y: 290, width: 60, height: 24, type: 'floating' });

    this.platforms.push({ x: 1800, y: 320, width: 96, height: 28, type: 'block' });
    this.platforms.push({ x: 1980, y: 240, width: 140, height: 28, type: 'block' });
    this.platforms.push({ x: 2200, y: 310, width: 160, height: 28, type: 'block' });
    this.platforms.push({ x: 2440, y: 340, width: 60, height: 76, type: 'pipe' });

    this.platforms.push({ x: 2630, y: 300, width: 70, height: 24, type: 'floating' });

    this.platforms.push({ x: 2880, y: 370, width: 60, height: 46, type: 'step' });
    this.platforms.push({ x: 2940, y: 324, width: 60, height: 92, type: 'step' });
    this.platforms.push({ x: 3000, y: 278, width: 60, height: 138, type: 'step' });

    this.flag = { x: 3250, y: 156, width: 30, height: 260 };

    // Monedas
    const coinPositions = [
      { x: 260, y: 280 }, { x: 300, y: 280 }, { x: 340, y: 280 },
      { x: 460, y: 220 }, { x: 520, y: 220 }, { x: 580, y: 220 },
      { x: 845, y: 280 },
      { x: 1060, y: 290 }, { x: 1120, y: 290 },
      { x: 1280, y: 210 }, { x: 1340, y: 210 },
      { x: 1645, y: 250 },
      { x: 1820, y: 280 }, { x: 2000, y: 200 }, { x: 2060, y: 200 }, { x: 2220, y: 270 },
      { x: 2650, y: 260 },
      { x: 2900, y: 330 }, { x: 2960, y: 284 }, { x: 3020, y: 238 }
    ];
    this.coins = coinPositions.map(pos => ({
      x: pos.x,
      y: pos.y,
      radius: 9,
      collected: false,
      animTimer: Math.random() * 6
    }));

    // Enemigos
    this.enemies.push(new Enemy(380, 386, ENEMY_TYPES.GOOMBA, 90));
    this.enemies.push(new Enemy(520, 230, ENEMY_TYPES.GOOMBA, 50));
    this.enemies.push(new Enemy(1120, 386, ENEMY_TYPES.GOOMBA, 100));
    this.enemies.push(new Enemy(1300, 220, ENEMY_TYPES.GOOMBA, 40));
    this.enemies.push(new Enemy(1860, 386, ENEMY_TYPES.GOOMBA, 90));
    this.enemies.push(new Enemy(2280, 386, ENEMY_TYPES.GOOMBA, 110));
    this.enemies.push(new Enemy(2980, 386, ENEMY_TYPES.GOOMBA, 80));

    this.enemies.push(new Enemy(640, 392, ENEMY_TYPES.SPIKE, 0));
    this.enemies.push(new Enemy(1420, 392, ENEMY_TYPES.SPIKE, 0));
    this.enemies.push(new Enemy(2400, 392, ENEMY_TYPES.SPIKE, 0));
  }
}

// 4. MODELO PRINCIPAL DEL JUEGO
export const GAME_STATUS = {
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  VICTORY: 'victory'
};

export class Modelo {
  constructor() {
    this.player = new Player(100, 340);
    this.level = new Level(1);
    this.cameraX = 0;
    this.viewportWidth = 800;
    this.viewportHeight = 480;

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('arcade_platformer_highscore') || '0', 10);
    this.lives = 3;
    this.coinsCollected = 0;
    this.totalCoins = this.level.coins.length;
    this.currentLevelNum = 1;
    this.status = GAME_STATUS.READY;

    this.difficulty = 'normal';

    this.particles = [];
    this.floatingTexts = [];
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    let enemyMultiplier = 1.0;
    if (diff === 'easy') {
      enemyMultiplier = 0.75;
    } else if (diff === 'normal') {
      enemyMultiplier = 1.0;
    } else if (diff === 'hard') {
      enemyMultiplier = 1.35;
    }

    this.level.enemies.forEach(e => {
      if (e.type === ENEMY_TYPES.GOOMBA) {
        e.speed = 1.4 * enemyMultiplier;
        e.vx = (e.vx > 0 ? 1 : -1) * e.speed;
      }
    });
  }

  startNewGame() {
    this.score = 0;
    this.lives = 3;
    this.coinsCollected = 0;
    this.currentLevelNum = 1;
    this.level = new Level(1);
    this.totalCoins = this.level.coins.length;
    this.player.reset();
    this.cameraX = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.setDifficulty(this.difficulty);
    this.status = GAME_STATUS.PLAYING;
  }

  nextLevel() {
    this.currentLevelNum++;
    this.level = new Level(this.currentLevelNum);
    this.totalCoins = this.level.coins.length;
    this.player.reset();
    this.cameraX = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.setDifficulty(this.difficulty);
    this.status = GAME_STATUS.PLAYING;
  }

  pause() {
    if (this.status === GAME_STATUS.PLAYING) {
      this.status = GAME_STATUS.PAUSED;
    }
  }

  resume() {
    if (this.status === GAME_STATUS.PAUSED) {
      this.status = GAME_STATUS.PLAYING;
    }
  }

  addScore(points, x, y, type = 'coin') {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('arcade_platformer_highscore', this.highScore.toString());
    }
    if (x !== undefined && y !== undefined) {
      this.floatingTexts.push({
        text: `+${points}`,
        x,
        y,
        life: 0.8,
        maxLife: 0.8,
        type
      });
    }
  }

  spawnParticles(x, y, type = 'coin', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2.5,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        type
      });
    }
  }

  update(deltaTime) {
    if (this.status !== GAME_STATUS.PLAYING) return;

    this.player.update(deltaTime);
    this.resolvePlatformCollisions();

    if (this.player.y > this.level.height + 60 && !this.player.isDead) {
      this.handlePlayerDeath();
    }

    const targetCameraX = this.player.x - this.viewportWidth * 0.35;
    this.cameraX += (targetCameraX - this.cameraX) * 0.12;
    if (this.cameraX < 0) this.cameraX = 0;
    const maxCameraX = this.level.width - this.viewportWidth;
    if (this.cameraX > maxCameraX) this.cameraX = maxCameraX;

    this.level.coins.forEach(coin => {
      if (!coin.collected) {
        coin.animTimer += deltaTime * 5;
        const dist = Math.hypot(
          (this.player.x + this.player.width / 2) - coin.x,
          (this.player.y + this.player.height / 2) - coin.y
        );
        if (dist < coin.radius + this.player.width / 2) {
          coin.collected = true;
          this.coinsCollected++;
          this.addScore(100, coin.x, coin.y, 'coin');
          this.spawnParticles(coin.x, coin.y, 'coin', 10);
        }
      }
    });

    for (let i = this.level.enemies.length - 1; i >= 0; i--) {
      const enemy = this.level.enemies[i];
      enemy.update(deltaTime);

      if (enemy.isDead && enemy.deadTimer <= 0) {
        this.level.enemies.splice(i, 1);
        continue;
      }

      if (!enemy.isDead && !this.player.isDead) {
        const pLeft = this.player.x;
        const pRight = this.player.x + this.player.width;
        const pTop = this.player.y;
        const pBottom = this.player.y + this.player.height;

        const eLeft = enemy.x;
        const eRight = enemy.x + enemy.width;
        const eTop = enemy.y;
        const eBottom = enemy.y + enemy.height;

        if (pRight > eLeft && pLeft < eRight && pBottom > eTop && pTop < eBottom) {
          if (this.player.vy > 0 && (pBottom - this.player.vy) <= eTop + 14 && enemy.type === ENEMY_TYPES.GOOMBA) {
            enemy.stomp();
            this.player.vy = -9;
            this.addScore(200, enemy.x + enemy.width / 2, enemy.y, 'stomp');
            this.spawnParticles(enemy.x + enemy.width / 2, enemy.y, 'stomp', 12);
          } else {
            if (this.player.takeDamage()) {
              this.spawnParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 'damage', 16);
              this.lives--;
              if (this.lives <= 0) {
                this.handlePlayerDeath();
              }
            }
          }
        }
      }
    }

    const flag = this.level.flag;
    if (flag) {
      if (this.player.x + this.player.width >= flag.x && this.player.x <= flag.x + flag.width) {
        this.status = GAME_STATUS.VICTORY;
        this.addScore(1000, flag.x, flag.y, 'victory');
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= deltaTime;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y -= 25 * deltaTime;
      t.life -= deltaTime;
      if (t.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  resolvePlatformCollisions() {
    if (this.player.isDead) return;

    this.player.x += this.player.vx;
    for (const plat of this.level.platforms) {
      if (this.checkCollision(this.player, plat)) {
        if (this.player.vx > 0) {
          this.player.x = plat.x - this.player.width;
        } else if (this.player.vx < 0) {
          this.player.x = plat.x + plat.width;
        }
        this.player.vx = 0;
      }
    }

    this.player.y += this.player.vy;
    this.player.isGrounded = false;

    for (const plat of this.level.platforms) {
      if (this.checkCollision(this.player, plat)) {
        if (this.player.vy > 0) {
          this.player.y = plat.y - this.player.height;
          this.player.vy = 0;
          this.player.isGrounded = true;
          this.player.isJumping = false;
        } else if (this.player.vy < 0) {
          this.player.y = plat.y + plat.height;
          this.player.vy = 0;
        }
      }
    }
  }

  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  handlePlayerDeath() {
    this.player.die();
    setTimeout(() => {
      if (this.lives > 0) {
        this.player.reset();
        this.cameraX = 0;
      } else {
        this.status = GAME_STATUS.GAME_OVER;
      }
    }, 1000);
  }
}

// Alias compatible
export { Modelo as GameModel };
