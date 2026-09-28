
export class BoardView {
  constructor() {
    this.el = {
      headerTitle: document.querySelector('[data-header-title]'),
      grid: document.querySelector('[data-grid]'),
      indicators: document.querySelector('[data-indicators]'),
      moves: document.querySelector('[data-moves]'),
      solved: document.querySelector('[data-solved]'),
      total: document.querySelector('[data-total]'),
      assistant: document.querySelector('[data-assistant]'),
      modalHelp: document.querySelector('[data-modal="help"]'),
      modalWin: document.querySelector('[data-modal="win"]'),
      winMoves: document.querySelector('[data-win-moves]')
    };
  }

  
  render(model) {
    document.documentElement.dataset.theme = model.theme;
    document.documentElement.dataset.pieceSize = model.pieceSize;
    document.documentElement.style.setProperty('--N', model.N);

    
    if (this.el.headerTitle) {
      this.el.headerTitle.textContent = `❖ Tablero ${model.N}x${model.N}`;
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
