/**
 * VISTA (js/views/vista.js)
 * Contiene todas las vistas del juego:
 * - CanvasRenderer (Vista gráfica a 60 FPS con Canvas API y variables CSS)
 * - UIView (Vista DOM para marcadores, modales y suscripción de eventos)
 */
import { ENEMY_TYPES, GAME_STATUS } from '../models/modelo.js';

// 1. VISTA GRÁFICA DEL CANVAS
export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.skyGlowAngle = 0;
    this.colors = {};
    this.loadThemeColors();
  }

  loadThemeColors() {
    const computed = getComputedStyle(document.documentElement);
    const getVar = (name) => computed.getPropertyValue(name).trim();

    this.colors = {
      skyGradientStart: getVar('--sky-gradient-start'),
      skyGradientMid: getVar('--sky-gradient-mid'),
      skyGradientEnd: getVar('--sky-gradient-end'),
      buildingSilhouette: getVar('--building-silhouette'),
      buildingWindow: getVar('--building-window'),
      horizonLine: getVar('--horizon-line'),

      platformGround: getVar('--platform-ground'),
      platformGroundGrid: getVar('--platform-ground-grid'),
      platformCyan: getVar('--neon-cyan'),
      platformCyanGlow: getVar('--neon-cyan-border-glow'),

      pipeBody: getVar('--pipe-body'),
      pipeCap: getVar('--pipe-cap'),
      pipeBorder: getVar('--neon-green'),
      pipeGlow: getVar('--pipe-glow'),

      blockBody: getVar('--block-body'),
      blockBorder: getVar('--neon-pink'),
      blockGlow: getVar('--neon-pink-block-glow'),
      blockDetail: getVar('--neon-yellow'),

      coinColor: getVar('--neon-yellow'),
      coinGlow: getVar('--neon-yellow-strong-glow'),
      coinShine: getVar('--color-pure-white'),

      flagPole: getVar('--color-pure-white'),
      flagBall: getVar('--neon-yellow'),
      flagBallGlow: getVar('--neon-yellow-strong-glow'),
      flagBanner: getVar('--flag-banner'),
      flagBannerGlow: getVar('--flag-banner-glow'),

      spikeColor: getVar('--neon-red'),
      spikeGlow: getVar('--neon-red-spike-glow'),

      enemyGoomba: getVar('--enemy-goomba'),
      enemyGoombaDead: getVar('--enemy-goomba-dead'),
      enemyGoombaGlow: getVar('--enemy-goomba-glow'),
      enemyEyeWhite: getVar('--color-pure-white'),
      enemyEyePupil: getVar('--color-pure-black'),

      playerSuit: getVar('--player-suit'),
      playerSuitGlow: getVar('--player-suit-glow'),
      playerHelmet: getVar('--player-helmet'),
      playerHelmetGlow: getVar('--player-helmet-glow'),
      playerVisor: getVar('--neon-yellow'),

      damageParticle: getVar('--neon-pink'),
      stompParticle: getVar('--neon-cyan'),
      coinParticle: getVar('--neon-yellow'),
      textGold: getVar('--neon-yellow'),
      textGlow: getVar('--neon-yellow-strong-glow')
    };
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  render(model) {
    this.skyGlowAngle += 0.03;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const camX = model.cameraX;

    // 1. Limpieza de pantalla con cielo cibernético y fondo parallax
    this.renderParallaxBackground(ctx, width, height, camX);

    // Guardar contexto para aplicar traslación de la cámara
    ctx.save();
    ctx.translate(-Math.floor(camX), 0);

    // 2. Renderizar Elementos del Nivel (Suelo, Bloques, Tuberías)
    this.renderPlatforms(ctx, model.level.platforms);

    // 3. Renderizar Bandera de Meta
    if (model.level.flag) {
      this.renderFlag(ctx, model.level.flag);
    }

    // 4. Renderizar Monedas Coleccionables
    this.renderCoins(ctx, model.level.coins);

    // 5. Renderizar Enemigos y Obstáculos
    model.level.enemies.forEach(enemy => this.renderEnemy(ctx, enemy));

    // 6. Renderizar Jugador (Protagonista)
    this.renderPlayer(ctx, model.player);

    // 7. Renderizar Partículas
    this.renderParticles(ctx, model.particles);

    // 8. Renderizar Textos flotantes (+100, +200, etc.)
    this.renderFloatingTexts(ctx, model.floatingTexts);

    // Restaurar contexto
    ctx.restore();
  }

  renderParallaxBackground(ctx, width, height, camX) {
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, this.colors.skyGradientStart);
    bgGradient.addColorStop(0.65, this.colors.skyGradientMid);
    bgGradient.addColorStop(1, this.colors.skyGradientEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = this.colors.buildingSilhouette;
    const numBuildings = 20;
    const bWidth = 90;
    for (let i = 0; i < numBuildings; i++) {
      const bX = (i * bWidth - (camX * 0.2)) % (width + bWidth * 2) - bWidth;
      const bH = 140 + (i % 5) * 35;
      ctx.fillRect(bX, height - bH - 40, bWidth - 4, bH);

      ctx.fillStyle = this.colors.buildingWindow;
      for (let wy = height - bH - 25; wy < height - 50; wy += 20) {
        ctx.fillRect(bX + 15, wy, 12, 6);
        ctx.fillRect(bX + 45, wy, 12, 6);
      }
      ctx.fillStyle = this.colors.buildingSilhouette;
    }

    ctx.strokeStyle = this.colors.horizonLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 60);
    ctx.lineTo(width, height - 60);
    ctx.stroke();
  }

  renderPlatforms(ctx, platforms) {
    platforms.forEach(p => {
      if (p.type === 'ground') {
        ctx.fillStyle = this.colors.platformGround;
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.strokeStyle = this.colors.platformCyan;
        ctx.shadowColor = this.colors.platformCyanGlow;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 3;
        ctx.strokeRect(p.x, p.y, p.width, 3);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = this.colors.platformGroundGrid;
        ctx.lineWidth = 1;
        for (let gx = p.x; gx < p.x + p.width; gx += 32) {
          ctx.beginPath();
          ctx.moveTo(gx, p.y);
          ctx.lineTo(gx, p.y + p.height);
          ctx.stroke();
        }
      } else if (p.type === 'pipe') {
        ctx.fillStyle = this.colors.pipeBody;
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.strokeStyle = this.colors.pipeBorder;
        ctx.shadowColor = this.colors.pipeGlow;
        ctx.shadowBlur = 6;
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.width, p.height);

        ctx.fillStyle = this.colors.pipeCap;
        ctx.fillRect(p.x - 4, p.y, p.width + 8, 16);
        ctx.strokeRect(p.x - 4, p.y, p.width + 8, 16);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = this.colors.blockBody;
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.strokeStyle = this.colors.blockBorder;
        ctx.shadowColor = this.colors.blockGlow;
        ctx.shadowBlur = 6;
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.width, p.height);

        ctx.fillStyle = this.colors.blockDetail;
        ctx.shadowBlur = 0;
        for (let bx = p.x + 8; bx < p.x + p.width; bx += 28) {
          ctx.fillRect(bx, p.y + 6, 12, p.height - 12);
        }
      }
    });
  }

  renderCoins(ctx, coins) {
    coins.forEach(c => {
      if (c.collected) return;
      const scaleX = Math.abs(Math.cos(c.animTimer));
      ctx.save();
      ctx.translate(c.x, c.y);

      ctx.shadowColor = this.colors.coinGlow;
      ctx.shadowBlur = 10;
      ctx.fillStyle = this.colors.coinColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(1, c.radius * scaleX), c.radius, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.colors.coinShine;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(0.5, (c.radius * 0.4) * scaleX), c.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  renderFlag(ctx, flag) {
    ctx.fillStyle = this.colors.flagPole;
    ctx.fillRect(flag.x, flag.y, 6, flag.height);

    ctx.fillStyle = this.colors.flagBall;
    ctx.shadowColor = this.colors.flagBallGlow;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(flag.x + 3, flag.y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.colors.flagBanner;
    ctx.shadowColor = this.colors.flagBannerGlow;
    ctx.beginPath();
    ctx.moveTo(flag.x + 6, flag.y + 12);
    ctx.lineTo(flag.x + 48, flag.y + 32);
    ctx.lineTo(flag.x + 6, flag.y + 52);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  renderEnemy(ctx, enemy) {
    ctx.save();
    if (enemy.type === ENEMY_TYPES.SPIKE) {
      ctx.fillStyle = this.colors.spikeColor;
      ctx.shadowColor = this.colors.spikeGlow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y + enemy.height);
      ctx.lineTo(enemy.x + enemy.width / 2, enemy.y);
      ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

      ctx.shadowColor = this.colors.enemyGoombaGlow;
      ctx.shadowBlur = 8;
      ctx.fillStyle = enemy.isDead ? this.colors.enemyGoombaDead : this.colors.enemyGoomba;

      ctx.beginPath();
      ctx.arc(0, -2, enemy.width / 2, Math.PI, 0, false);
      ctx.lineTo(enemy.width / 2, enemy.height / 2);
      ctx.lineTo(-enemy.width / 2, enemy.height / 2);
      ctx.closePath();
      ctx.fill();

      if (!enemy.isDead) {
        ctx.fillStyle = this.colors.enemyEyeWhite;
        ctx.fillRect(-8, -4, 5, 8);
        ctx.fillRect(3, -4, 5, 8);

        ctx.fillStyle = this.colors.enemyEyePupil;
        ctx.fillRect(-6, -2, 3, 4);
        ctx.fillRect(5, -2, 3, 4);
      }
    }
    ctx.restore();
  }

  renderPlayer(ctx, player) {
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 14) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

    if (!player.facingRight) {
      ctx.scale(-1, 1);
    }

    const w = player.width;
    const h = player.height;

    ctx.shadowColor = this.colors.playerSuitGlow;
    ctx.shadowBlur = 10;

    ctx.fillStyle = this.colors.playerSuit;
    ctx.fillRect(-w / 2 + 2, -h / 2 + 14, w - 4, h - 22);

    ctx.fillStyle = this.colors.playerHelmet;
    ctx.shadowColor = this.colors.playerHelmetGlow;
    ctx.fillRect(-w / 2 + 2, -h / 2, w - 4, 14);

    ctx.fillStyle = this.colors.playerVisor;
    ctx.fillRect(2, -h / 2 + 3, w / 2 - 2, 6);

    ctx.fillStyle = this.colors.playerHelmet;
    const legOffset = Math.sin(player.runFrame) * 4;
    ctx.fillRect(-w / 2 + 3, h / 2 - 8, 8, 8 + (player.isGrounded ? legOffset : 0));
    ctx.fillRect(w / 2 - 11, h / 2 - 8, 8, 8 - (player.isGrounded ? legOffset : 0));

    ctx.restore();
  }

  renderParticles(ctx, particles) {
    particles.forEach(p => {
      const alpha = Math.max(0, p.life / p.maxLife);
      let particleColor = this.colors.coinParticle;
      if (p.type === 'stomp') particleColor = this.colors.stompParticle;
      else if (p.type === 'damage') particleColor = this.colors.damageParticle;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particleColor;
      ctx.shadowColor = particleColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  renderFloatingTexts(ctx, floatingTexts) {
    floatingTexts.forEach(t => {
      const alpha = Math.max(0, t.life / t.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 13px "Press Start 2P", monospace';
      ctx.fillStyle = this.colors.textGold;
      ctx.shadowColor = this.colors.textGlow;
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }
}

// 2. VISTA DOM DE INTERFAZ DE USUARIO
export class UIView {
  constructor() {
    this.scoreElement = document.getElementById('currentScore');
    this.highScoreElement = document.getElementById('highScore');
    this.levelElement = document.getElementById('currentLevel');
    this.coinsLeftElement = document.getElementById('coinsLeft');
    this.livesContainer = document.getElementById('livesContainer');

    this.btnStart = document.getElementById('btnStart');
    this.btnPause = document.getElementById('btnPause');
    this.btnReset = document.getElementById('btnReset');
    this.btnHelp = document.getElementById('btnHelp');
    this.btnCloseHelp = document.getElementById('btnCloseHelp');

    this.difficultyButtons = document.querySelectorAll('.segmented-control .seg-btn');
    this.touchButtons = document.querySelectorAll('.touch-btn');

    this.startOverlay = document.getElementById('startOverlay');
    this.pauseOverlay = document.getElementById('pauseOverlay');
    this.gameOverOverlay = document.getElementById('gameOverOverlay');
    this.victoryOverlay = document.getElementById('victoryOverlay');
    this.helpModal = document.getElementById('helpModal');

    this.btnOverlayPlay = document.getElementById('btnOverlayPlay');
    this.btnOverlayResume = document.getElementById('btnOverlayResume');
    this.btnOverlayRestart = document.getElementById('btnOverlayRestart');
    this.btnOverlayNextLevel = document.getElementById('btnOverlayNextLevel');
    this.finalScoreElement = document.getElementById('finalScore');
  }

  onStartClick(handler) {
    if (this.btnStart) this.btnStart.addEventListener('click', handler);
    if (this.btnOverlayPlay) this.btnOverlayPlay.addEventListener('click', handler);
  }

  onPauseClick(handler) {
    if (this.btnPause) this.btnPause.addEventListener('click', handler);
  }

  onResumeClick(handler) {
    if (this.btnOverlayResume) this.btnOverlayResume.addEventListener('click', handler);
  }

  onResetClick(handler) {
    if (this.btnReset) this.btnReset.addEventListener('click', handler);
    if (this.btnOverlayRestart) this.btnOverlayRestart.addEventListener('click', handler);
  }

  onNextLevelClick(handler) {
    if (this.btnOverlayNextLevel) this.btnOverlayNextLevel.addEventListener('click', handler);
  }

  onDifficultySelect(handler) {
    this.difficultyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.getAttribute('data-val');
        handler(diff);
      });
    });
  }

  onHelpToggle(openHandler, closeHandler) {
    if (this.btnHelp) this.btnHelp.addEventListener('click', openHandler);
    if (this.btnCloseHelp) this.btnCloseHelp.addEventListener('click', closeHandler);
  }

  onTouchAction(startHandler, endHandler) {
    this.touchButtons.forEach(btn => {
      const action = btn.getAttribute('data-act');

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        try {
          btn.setPointerCapture(e.pointerId);
        } catch (_) {}
        startHandler(action);
      });

      const releaseHandler = (e) => {
        e.preventDefault();
        btn.classList.remove('pressed');
        try {
          btn.releasePointerCapture(e.pointerId);
        } catch (_) {}
        endHandler(action);
      };

      btn.addEventListener('pointerup', releaseHandler);
      btn.addEventListener('pointercancel', releaseHandler);
    });
  }

  updateHUD(model) {
    if (this.scoreElement) this.scoreElement.textContent = model.score;
    if (this.highScoreElement) this.highScoreElement.textContent = model.highScore;
    if (this.levelElement) this.levelElement.textContent = model.currentLevelNum;
    if (this.coinsLeftElement) {
      this.coinsLeftElement.textContent = `${model.coinsCollected}/${model.totalCoins}`;
    }

    if (this.livesContainer) {
      this.livesContainer.innerHTML = '';
      for (let i = 0; i < model.lives; i++) {
        const life = document.createElement('span');
        life.innerHTML = '❤️';
        this.livesContainer.appendChild(life);
      }
    }

    this.difficultyButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-val') === model.difficulty);
    });

    this.updateStatusOverlays(model);
  }

  updateStatusOverlays(model) {
    if (this.startOverlay) this.startOverlay.classList.toggle('hidden', model.status !== GAME_STATUS.READY);
    if (this.pauseOverlay) this.pauseOverlay.classList.toggle('hidden', model.status !== GAME_STATUS.PAUSED);
    if (this.gameOverOverlay) this.gameOverOverlay.classList.toggle('hidden', model.status !== GAME_STATUS.GAME_OVER);
    if (this.victoryOverlay) this.victoryOverlay.classList.toggle('hidden', model.status !== GAME_STATUS.VICTORY);

    if (model.status === GAME_STATUS.GAME_OVER && this.finalScoreElement) {
      this.finalScoreElement.textContent = model.score;
    }

    if (this.btnPause) {
      this.btnPause.textContent = model.status === GAME_STATUS.PAUSED ? '▶ REANUDAR' : '⏸ PAUSA';
    }
  }

  showHelp(show = true) {
    if (this.helpModal) {
      this.helpModal.classList.toggle('hidden', !show);
    }
  }
}

// 3. VISTA COMPUESTA PRINCIPAL
export class Vista {
  constructor(canvas) {
    this.canvasRenderer = new CanvasRenderer(canvas);
    this.uiView = new UIView();
  }

  resize(w, h) {
    this.canvasRenderer.resize(w, h);
  }

  render(model) {
    this.canvasRenderer.render(model);
  }

  updateHUD(model) {
    this.uiView.updateHUD(model);
  }

  showHelp(show) {
    this.uiView.showHelp(show);
  }

  // Delegaciones de eventos a través de la vista
  onStartClick(handler) { this.uiView.onStartClick(handler); }
  onPauseClick(handler) { this.uiView.onPauseClick(handler); }
  onResumeClick(handler) { this.uiView.onResumeClick(handler); }
  onResetClick(handler) { this.uiView.onResetClick(handler); }
  onNextLevelClick(handler) { this.uiView.onNextLevelClick(handler); }
  onDifficultySelect(handler) { this.uiView.onDifficultySelect(handler); }
  onHelpToggle(openH, closeH) { this.uiView.onHelpToggle(openH, closeH); }
  onTouchAction(startH, endH) { this.uiView.onTouchAction(startH, endH); }
}
