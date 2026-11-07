/**
 * CONTROLADOR (js/controllers/controlador.js)
 * Coordina la interacción del usuario, el ciclo de vida del juego (requestAnimationFrame)
 * y la sincronización entre el Modelo y la Vista.
 */
import { GAME_STATUS } from '../models/modelo.js';

export class Controlador {
  constructor(modelo, vista) {
    this.model = modelo;
    this.view = vista;

    this.keys = {
      left: false,
      right: false,
      up: false
    };

    this.lastTime = performance.now();
    this.animationFrameId = null;

    this.bindEvents();
    this.init();
  }

  init() {
    this.view.resize(this.model.viewportWidth, this.model.viewportHeight);
    this.view.updateHUD(this.model);
    this.view.render(this.model);
    this.startLoop();
  }

  bindEvents() {
    // 1. Controles de Teclado del Controller
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // 2. Suscripciones a eventos de la vista (desacoplado de elementos del DOM)
    this.view.onStartClick(() => this.model.startNewGame());
    this.view.onPauseClick(() => this.togglePause());
    this.view.onResumeClick(() => this.model.resume());
    this.view.onResetClick(() => this.model.startNewGame());
    this.view.onNextLevelClick(() => this.model.nextLevel());

    // 3. Suscripción a cambio de dificultad
    this.view.onDifficultySelect((selectedDiff) => {
      this.model.setDifficulty(selectedDiff);
      this.view.updateHUD(this.model);
    });

    // 4. Suscripción al modal de ayuda
    this.view.onHelpToggle(
      () => this.view.showHelp(true),
      () => this.view.showHelp(false)
    );

    // 5. Suscripción a controles táctiles e interactivos inferiores
    this.view.onTouchAction(
      (action) => this.handleActionStart(action),
      (action) => this.handleActionEnd(action)
    );
  }

  handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = true;
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this.keys.up = true;
        this.model.player.jump();
        break;
      case 'KeyP':
        this.togglePause();
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = false;
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this.keys.up = false;
        break;
    }
  }

  handleActionStart(action) {
    if (this.model.status === GAME_STATUS.READY) {
      this.model.startNewGame();
    }

    if (action === 'LEFT') {
      this.keys.left = true;
    } else if (action === 'RIGHT') {
      this.keys.right = true;
    } else if (action === 'JUMP') {
      this.keys.up = true;
      this.model.player.jump();
    }
  }

  handleActionEnd(action) {
    if (action === 'LEFT') {
      this.keys.left = false;
    } else if (action === 'RIGHT') {
      this.keys.right = false;
    } else if (action === 'JUMP') {
      this.keys.up = false;
    }
  }

  togglePause() {
    if (this.model.status === GAME_STATUS.PLAYING) {
      this.model.pause();
    } else if (this.model.status === GAME_STATUS.PAUSED) {
      this.model.resume();
    }
  }

  handleContinuousInput() {
    if (this.model.status !== GAME_STATUS.PLAYING) return;

    if (this.keys.left) {
      this.model.player.moveLeft();
    }
    if (this.keys.right) {
      this.model.player.moveRight();
    }
    if (this.keys.up) {
      this.model.player.jump();
    }
  }

  startLoop() {
    this.lastTime = performance.now();
    const loop = (currentTime) => {
      const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      // 1. Manejar entradas continuas
      this.handleContinuousInput();

      // 2. Actualización de física y lógica pura (Modelo)
      this.model.update(deltaTime);

      // 3. Renderizado gráfico Canvas (Vista Gráfica)
      this.view.render(this.model);

      // 4. Actualización del HUD y Modales (Vista DOM)
      this.view.updateHUD(this.model);

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }
}

// Alias compatible
export { Controlador as GameController };
