document
  .getElementById("pathForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const fileInput = document.getElementById("fileInput").files[0];
    const startX = parseInt(document.getElementById("startX").value);
    const startY = parseInt(document.getElementById("startY").value);
    const endX = parseInt(document.getElementById("endX").value);
    const endY = parseInt(document.getElementById("endY").value);
    const algorithm = document.getElementById("algorithm").value;

    if (fileInput) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const grid = e.target.result
          .split("\n")
          .map((line) => line.split("").map((char) => (char === "." ? 1 : 0)));
        if (algorithm === "astar") {
          aStarSearch(grid, [startX, startY], [endX, endY]);
        } else {
          gbfsSearch(grid, [startX, startY], [endX, endY]);
        }
      };
      reader.readAsText(fileInput);
    }
  });

/**
 * Represents a cell in the grid.
 */
class Cell {
  constructor() {
    this.parent_i = 0;
    this.parent_j = 0;
    this.f = 0;
    this.g = 0;
    this.h = 0;
  }
}

/**
 * Checks if the given cell is within the grid boundaries.
 * @param {number[][]} grid - The grid.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {boolean} True if the cell is valid, otherwise false.
 */
function isValid(grid, row, col) {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}

/**
 * Checks if the given cell is passable.
 * @param {number[][]} grid - The grid.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {boolean} True if the cell is unblocked, otherwise false.
 */
function isUnBlocked(grid, row, col) {
  return grid[row][col] === 1;
}

/**
 * Checks if the given cell is the destination.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @param {number[]} dest - The destination coordinates.
 * @returns {boolean} True if the cell is the destination, otherwise false.
 */
function isDestination(row, col, dest) {
  return row === dest[1] && col === dest[0];
}

/**
 * Calculates the heuristic value (Euclidean distance) for a cell.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @param {number[]} dest - The destination coordinates.
 * @returns {number} The heuristic value.
 */
function calculateHValue(row, col, dest) {
  let dx = col - dest[0];
  let dy = row - dest[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Traces the path from the destination to the source.
 * @param {Cell[][]} cellDetails - The details of each cell.
 * @param {number[]} dest - The destination coordinates.
 * @returns {string} The path as a string.
 */
function tracePath(cellDetails, dest) {
  let row = dest[1];
  let col = dest[0];
  let path = [];

  while (
    !(
      cellDetails[row][col].parent_i === row &&
      cellDetails[row][col].parent_j === col
    )
  ) {
    path.push([col, row]);
    let tempRow = cellDetails[row][col].parent_i;
    let tempCol = cellDetails[row][col].parent_j;
    row = tempRow;
    col = tempCol;
  }

  path.push([col, row]);
  path.reverse();

  return path.map((p) => `(${p[0]}, ${p[1]})`).join(" -> ");
}

/**
 * A* Search Algorithm to find the shortest path in the grid.
 * @param {number[][]} grid - The grid.
 * @param {number[]} src - The source coordinates.
 * @param {number[]} dest - The destination coordinates.
 */
function aStarSearch(grid, src, dest) {
  const startTime = performance.now();

  if (!isValid(grid, src[1], src[0])) {
    document.getElementById("output").innerText = "Source is invalid.";
    return;
  }

  if (!isValid(grid, dest[1], dest[0])) {
    document.getElementById("output").innerText = "Destination is invalid.";
    return;
  }

  if (
    !isUnBlocked(grid, src[1], src[0]) ||
    !isUnBlocked(grid, dest[1], dest[0])
  ) {
    document.getElementById("output").innerText =
      "Source or the destination is blocked.";
    return;
  }

  if (isDestination(src[1], src[0], dest)) {
    document.getElementById("output").innerText =
      "We are already at the destination.";
    return;
  }

  const ROW = grid.length;
  const COL = grid[0].length;
  const closedList = Array.from({ length: ROW }, () => Array(COL).fill(false));
  const cellDetails = Array.from({ length: ROW }, () =>
    Array.from({ length: COL }, () => new Cell())
  );

  let i = src[1],
    j = src[0];
  cellDetails[i][j].f = 0.0;
  cellDetails[i][j].g = 0.0;
  cellDetails[i][j].h = 0.0;
  cellDetails[i][j].parent_i = i;
  cellDetails[i][j].parent_j = j;

  const openList = new Map();
  openList.set(0.0, [i, j]);

  let foundDest = false;

  while (openList.size > 0) {
    let p = [...openList.entries()].reduce((a, b) => (a[0] < b[0] ? a : b)); // select cell with lowest f value
    openList.delete(p[0]);

    i = p[1][0];
    j = p[1][1];
    closedList[i][j] = true;

    const directions = [
      [-1, 0, 1.0],
      [1, 0, 1.0],
      [0, 1, 1.0],
      [0, -1, 1.0],
      [-1, 1, 1.414],
      [-1, -1, 1.414],
      [1, 1, 1.414],
      [1, -1, 1.414],
    ];

    for (const [dx, dy, cost] of directions) {
      const newRow = i + dx;
      const newCol = j + dy;

      if (isValid(grid, newRow, newCol)) {
        if (isDestination(newRow, newCol, dest)) {
          cellDetails[newRow][newCol].parent_i = i;
          cellDetails[newRow][newCol].parent_j = j;
          const path = tracePath(cellDetails, dest);
          const endTime = performance.now();
          document.getElementById("output").innerText = `Path: ${path}\nCost: ${
            path.split(" -> ").length - 1
          }\nRuntime: ${(endTime - startTime).toFixed(2)} ms`;
          foundDest = true;
          return;
        } else if (
          !closedList[newRow][newCol] &&
          isUnBlocked(grid, newRow, newCol)
        ) {
          const gNew = cellDetails[i][j].g + cost;
          const hNew = calculateHValue(newRow, newCol, dest);
          const fNew = gNew + hNew;

          if (
            cellDetails[newRow][newCol].f === 0 ||
            cellDetails[newRow][newCol].f > fNew
          ) {
            openList.set(fNew, [newRow, newCol]);
            cellDetails[newRow][newCol].f = fNew;
            cellDetails[newRow][newCol].g = gNew;
            cellDetails[newRow][newCol].h = hNew;
            cellDetails[newRow][newCol].parent_i = i;
            cellDetails[newRow][newCol].parent_j = j;
          }
        }
      }
    }
  }

  if (!foundDest) {
    document.getElementById("output").innerText =
      "Failed to find the destination cell.";
  }
}

/**
 * Greedy Best-First Search Algorithm to find the path in the grid.
 * @param {number[][]} grid - The grid.
 * @param {number[]} src - The source coordinates.
 * @param {number[]} dest - The destination coordinates.
 */
function gbfsSearch(grid, src, dest) {
  const startTime = performance.now();

  if (!isValid(grid, src[1], src[0])) {
    document.getElementById("output").innerText = "Source is invalid.";
    return;
  }

  if (!isValid(grid, dest[1], dest[0])) {
    document.getElementById("output").innerText = "Destination is invalid.";
    return;
  }

  if (
    !isUnBlocked(grid, src[1], src[0]) ||
    !isUnBlocked(grid, dest[1], dest[0])
  ) {
    document.getElementById("output").innerText =
      "Source or the destination is blocked.";
    return;
  }

  if (isDestination(src[1], src[0], dest)) {
    document.getElementById("output").innerText =
      "We are already at the destination.";
    return;
  }

  const ROW = grid.length;
  const COL = grid[0].length;
  const closedList = Array.from({ length: ROW }, () => Array(COL).fill(false));
  const cellDetails = Array.from({ length: ROW }, () =>
    Array.from({ length: COL }, () => new Cell())
  );

  let i = src[1],
    j = src[0];
  cellDetails[i][j].f = 0.0;
  cellDetails[i][j].g = 0.0;
  cellDetails[i][j].h = 0.0;
  cellDetails[i][j].parent_i = i;
  cellDetails[i][j].parent_j = j;

  const openList = new Map();
  openList.set(0.0, [i, j]);

  let foundDest = false;

  while (openList.size > 0) {
    let p = [...openList.entries()].reduce((a, b) => (a[0] < b[0] ? a : b));
    openList.delete(p[0]);

    i = p[1][0];
    j = p[1][1];
    closedList[i][j] = true;

    const directions = [
      [-1, 0, 1.0],
      [1, 0, 1.0],
      [0, 1, 1.0],
      [0, -1, 1.0],
      [-1, 1, 1.414],
      [-1, -1, 1.414],
      [1, 1, 1.414],
      [1, -1, 1.414],
    ];

    for (const [dx, dy] of directions) {
      const newRow = i + dx;
      const newCol = j + dy;

      if (isValid(grid, newRow, newCol)) {
        if (isDestination(newRow, newCol, dest)) {
          cellDetails[newRow][newCol].parent_i = i;
          cellDetails[newRow][newCol].parent_j = j;
          const path = tracePath(cellDetails, dest);
          const endTime = performance.now();
          document.getElementById("output").innerText = `Path: ${path}\nCost: ${
            path.split(" -> ").length - 1
          }\nRuntime: ${(endTime - startTime).toFixed(2)} ms`;
          foundDest = true;
          return;
        } else if (
          !closedList[newRow][newCol] &&
          isUnBlocked(grid, newRow, newCol)
        ) {
          const hNew = calculateHValue(newRow, newCol, dest);

          if (
            cellDetails[newRow][newCol].f === 0 ||
            cellDetails[newRow][newCol].h > hNew
          ) {
            openList.set(hNew, [newRow, newCol]);
            cellDetails[newRow][newCol].f = hNew;
            cellDetails[newRow][newCol].h = hNew;
            cellDetails[newRow][newCol].parent_i = i;
            cellDetails[newRow][newCol].parent_j = j;
          }
        }
      }
    }
  }

  if (!foundDest) {
    document.getElementById("output").innerText =
      "Failed to find the destination cell.";
  }
}
