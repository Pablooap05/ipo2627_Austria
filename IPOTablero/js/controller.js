
export class GameController {
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
        this.view.setAssistant(`Celda seleccionada en (${r+1}, ${c+1}). Elige otra para intercambiar.`);
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
    
    const nInput = document.querySelector('[data-control="grid-size"]');
    const nVal = document.querySelector('[data-value="grid-size"]');
    if (nInput) {
      nInput.addEventListener('input', (e) => {
        if (nVal) nVal.textContent = `${e.target.value}x${e.target.value}`;
      });
      nInput.addEventListener('change', (e) => {
        this.model.init(e.target.value);
        this.view.render(this.model);
        this.view.setAssistant(`Tablero reiniciado a ${e.target.value}x${e.target.value}.`);
      });
    }

    
    const themeSelect = document.querySelector('[data-control="theme"]');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.model.init(this.model.N, this.model.pieceSize, e.target.value);
        this.view.render(this.model);
      });
    }

    
    document.querySelectorAll('[data-control="piece-size"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        this.model.init(this.model.N, size, this.model.theme);
        this.view.render(this.model);
      });
    });

    
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
