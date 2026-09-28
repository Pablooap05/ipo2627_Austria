
export class BoardModel {
  constructor(N = 4, pieceSize = 'medium', theme = 'geometric') {
    this.init(N, pieceSize, theme);
  }

  init(N = this.N, pieceSize = this.pieceSize, theme = this.theme) {
    this.N = Math.max(3, parseInt(N, 10));
    this.pieceSize = pieceSize;
    this.theme = theme;
    this.moves = 0;
    this.isWin = false;
    this.grid = this.generateSolvableGrid(this.N);
  }

  
  generateSolvableGrid(N) {
    const rowTypes = [0, 1, 2];
    for (let i = 3; i < N; i++) rowTypes.push(Math.floor(Math.random() * 3));
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
