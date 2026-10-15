/* ==========================================================================
   PROYECTO TABLERO - ARQUITECTURA MVC (MODEL - VIEW - CONTROLLER)
   Todo estructurado en un único archivo modular para máxima simplicidad.
   ========================================================================== */

/* ==========================================================================
   1. MODEL (Lógica de negocio, estado del tablero y resolubilidad)
   ========================================================================== */
class BoardModel {
  constructor(N = 4, pieceSize = 'medium', theme = 'geometric') {
    this.init(N, pieceSize, theme);
  }

  init(N = this.N, pieceSize = this.pieceSize, theme = this.theme) {
    this.N = Math.max(4, Math.min(6, parseInt(N, 10)));
    this.pieceSize = pieceSize;
    this.theme = theme;
    this.moves = 0;
    this.isWin = false;
    this.grid = this.generateSolvableGrid(this.N);
  }

  // Genera un tablero NxN aleatorio garantizando que sea resoluble
  generateSolvableGrid(N) {
    const rowTypes = [0, 1, 2];
    for (let i = 3; i < N; i++) {
      rowTypes.push(Math.floor(Math.random() * 3));
    }
    this.shuffle(rowTypes);

    const counts = { 0: 0, 1: 0, 2: 0 };
    rowTypes.forEach(t => counts[t] += N);

    const pool = [];
    let id = 0;
    for (let type = 0; type < 3; type++) {
      for (let c = 0; c < counts[type]; c++) {
        pool.push({ id: `p-${id++}`, type });
      }
    }

    let matrix = [];
    let solved = true;

    // Asegura que el estado inicial no esté ya resuelto de partida
    do {
      this.shuffle(pool);
      matrix = [];
      solved = true;
      let idx = 0;

      for (let r = 0; r < N; r++) {
        const row = [];
        const firstType = pool[idx].type;
        for (let c = 0; c < N; c++) {
          const item = pool[idx++];
          row.push({ id: item.id, type: item.type, row: r, col: c });
          if (item.type !== firstType) solved = false;
        }
        matrix.push(row);
      }
    } while (solved);

    return matrix;
  }

  // Intercambia las fichas entre dos celdas
  swap(r1, c1, r2, c2) {
    if (this.isWin || (r1 === r2 && c1 === c2)) return null;

    const p1 = this.grid[r1][c1];
    const p2 = this.grid[r2][c2];

    this.grid[r1][c1] = p2;
    this.grid[r2][c2] = p1;

    p1.row = r2; p1.col = c2;
    p2.row = r1; p2.col = c1;

    this.moves++;
    const status = this.checkWin();
    this.isWin = status.isWin;

    return { moves: this.moves, isWin: this.isWin, status };
  }

  // Comprueba la victoria: cada una de las filas debe tener fichas del mismo tipo
  checkWin() {
    let completedRows = 0;
    const rowStatuses = [];

    for (let r = 0; r < this.N; r++) {
      const firstType = this.grid[r][0].type;
      const isComplete = this.grid[r].every(cell => cell.type === firstType);
      if (isComplete) completedRows++;
      rowStatuses.push({ row: r, isComplete });
    }

    return {
      isWin: completedRows === this.N,
      completedRows,
      totalRows: this.N,
      rowStatuses
    };
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}

/* ==========================================================================
   2. VIEW (Manipulación del DOM mediante atributos data-*)
   ========================================================================== */
class BoardView {
  constructor() {
    this.el = {
      grid: document.querySelector('[data-grid]'),
      indicators: document.querySelector('[data-indicators]'),
      moves: document.querySelector('[data-moves]'),
      solved: document.querySelector('[data-solved]'),
      total: document.querySelector('[data-total]'),
      assistant: document.querySelector('[data-assistant]'),
      modalHelp: document.querySelector('[data-modal="help"]'),
      modalWin: document.querySelector('[data-modal="win"]'),
      winMoves: document.querySelector('[data-win-moves]'),
      sizeButtons: document.querySelectorAll('[data-control="piece-size"]')
    };
  }

  // Renderiza el tablero NxN y las fichas usando atributos data-*
  render(model) {
    document.documentElement.dataset.theme = model.theme;
    document.documentElement.dataset.pieceSize = model.pieceSize;
    document.documentElement.style.setProperty('--N', model.N);

    // Actualiza botones de tamaño
    if (this.el.sizeButtons) {
      this.el.sizeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === model.pieceSize);
      });
    }

    this.el.grid.innerHTML = '';

    for (let r = 0; r < model.N; r++) {
      for (let c = 0; c < model.N; c++) {
        const item = model.grid[r][c];

        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        const piece = document.createElement('div');
        piece.className = 'piece';
        piece.draggable = true;
        piece.dataset.pieceId = item.id;
        piece.dataset.type = item.type;
        piece.dataset.row = r;
        piece.dataset.col = c;

        cell.appendChild(piece);
        this.el.grid.appendChild(cell);
      }
    }

    const winStatus = model.checkWin();
    this.renderIndicators(winStatus.rowStatuses);
    this.updateStats(model.moves, winStatus.completedRows, model.N);
  }

  // Renderiza los indicadores de estado de cada fila
  renderIndicators(rowStatuses) {
    if (!this.el.indicators) return;
    this.el.indicators.innerHTML = '';

    rowStatuses.forEach(s => {
      const badge = document.createElement('div');
      badge.className = `row-badge ${s.isComplete ? 'complete' : ''}`;
      badge.dataset.row = s.row;
      if (!s.isComplete) badge.textContent = `${s.row + 1}`;
      this.el.indicators.appendChild(badge);
    });
  }

  updateStats(moves, solved, total) {
    if (this.el.moves) this.el.moves.textContent = moves;
    if (this.el.solved) this.el.solved.textContent = solved;
    if (this.el.total) this.el.total.textContent = total;
  }

  setAssistant(text) {
    if (this.el.assistant) this.el.assistant.textContent = text;
  }

  toggleModal(name, show) {
    const modal = name === 'help' ? this.el.modalHelp : this.el.modalWin;
    if (modal) modal.classList.toggle('active', show);
  }

  showWin(moves) {
    if (this.el.winMoves) this.el.winMoves.textContent = moves;
    this.toggleModal('win', true);
  }
}

/* ==========================================================================
   3. CONTROLLER (Eventos, Drag & Drop API y Controles)
   ========================================================================== */
class GameController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.dragged = null;
    this.selectedCell = null;

    this.init();
  }

  init() {
    this.bindDragAndDrop();
    this.bindClickEvents();
    this.bindControls();
    this.view.render(this.model);
  }

  // Implementación de la API Drag & Drop nativa
  bindDragAndDrop() {
    const grid = this.view.el.grid;

    grid.addEventListener('dragstart', (e) => {
      const piece = e.target.closest('.piece');
      if (!piece || this.model.isWin) return;

      this.dragged = {
        row: parseInt(piece.dataset.row, 10),
        col: parseInt(piece.dataset.col, 10)
      };
      e.dataTransfer.setData('text/plain', JSON.stringify(this.dragged));
      piece.classList.add('dragging');
    });

    grid.addEventListener('dragend', (e) => {
      const piece = e.target.closest('.piece');
      if (piece) piece.classList.remove('dragging');
      grid.querySelectorAll('.board-cell').forEach(c => c.classList.remove('drag-over'));
      this.dragged = null;
    });

    grid.addEventListener('dragover', (e) => {
      e.preventDefault();
      const cell = e.target.closest('.board-cell');
      if (cell) {
        grid.querySelectorAll('.board-cell').forEach(c => c.classList.remove('drag-over'));
        cell.classList.add('drag-over');
      }
    });

    grid.addEventListener('drop', (e) => {
      e.preventDefault();
      const cell = e.target.closest('.board-cell');
      if (!cell || !this.dragged) return;

      const targetRow = parseInt(cell.dataset.row, 10);
      const targetCol = parseInt(cell.dataset.col, 10);

      this.executeSwap(this.dragged.row, this.dragged.col, targetRow, targetCol);
    });
  }

  // Interacción alternativa mediante clics sucesivos
  bindClickEvents() {
    const grid = this.view.el.grid;

    grid.addEventListener('click', (e) => {
      const cell = e.target.closest('.board-cell');
      if (!cell || this.model.isWin) return;

      const r = parseInt(cell.dataset.row, 10);
      const c = parseInt(cell.dataset.col, 10);

      if (!this.selectedCell) {
        this.selectedCell = { r, c, cell };
        cell.classList.add('selected');
        this.view.setAssistant(`Celda seleccionada en (${r + 1}, ${c + 1}). Elige otra para intercambiar.`);
      } else {
        const { r: r1, c: c1, cell: prevCell } = this.selectedCell;
        prevCell.classList.remove('selected');
        this.selectedCell = null;
        if (r1 !== r || c1 !== c) {
          this.executeSwap(r1, c1, r, c);
        }
      }
    });
  }

  executeSwap(r1, c1, r2, c2) {
    const res = this.model.swap(r1, c1, r2, c2);
    if (!res) return;

    this.view.render(this.model);

    if (res.isWin) {
      this.view.showWin(res.moves);
      this.view.setAssistant(`🎉 ¡Felicidades! Tablero completado en ${res.moves} movimientos.`);
    } else {
      this.view.setAssistant(`Movimiento realizado. Total: ${res.moves}`);
    }
  }

  bindControls() {
    // Control Dimensión N — botones segmentados 4x4 / 5x5 / 6x6
    document.querySelectorAll('[data-control="grid-size"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = parseInt(btn.dataset.size, 10);
        document.querySelectorAll('[data-control="grid-size"]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.model.init(size);
        this.view.render(this.model);
        this.view.setAssistant(`Tablero reiniciado a ${size}x${size}.`);
      });
    });

    // Control Aspecto
    const themeSelect = document.querySelector('[data-control="theme"]');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.model.init(this.model.N, this.model.pieceSize, e.target.value);
        this.view.render(this.model);
      });
    }

    // Control Tamaño
    document.querySelectorAll('[data-control="piece-size"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        this.model.init(this.model.N, size, this.model.theme);
        this.view.render(this.model);
      });
    });

    // Botones de acción y modales
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const act = btn.dataset.action;

      if (act === 'new-game') {
        this.view.toggleModal('win', false);
        this.model.init();
        this.view.render(this.model);
        this.view.setAssistant('Partida iniciada. ¡Organiza las filas!');
      } else if (act === 'help') {
        this.view.toggleModal('help', true);
      } else if (act === 'close-help') {
        this.view.toggleModal('help', false);
      } else if (act === 'close-win') {
        this.view.toggleModal('win', false);
      }
    });
  }
}

/* ==========================================================================
   4. INICIALIZACIÓN
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const model = new BoardModel(4, 'medium', 'geometric');
  const view = new BoardView();
  new GameController(model, view);
});
