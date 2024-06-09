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

class cell {
  constructor() {
    this.parent_i = 0;
    this.parent_j = 0;
    this.f = 0;
    this.g = 0;
    this.h = 0;
  }
}

function isValid(grid, row, col) {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}

function isUnBlocked(grid, row, col) {
  return grid[row][col] == 1;
}

function isDestination(row, col, dest) {
  return row == dest[1] && col == dest[0];
}

function calculateHValue(row, col, dest) {
  // Euclidean Distance
  let dx = col - dest[0];
  let dy = row - dest[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function tracePath(cellDetails, dest) {
  let row = dest[1];
  let col = dest[0];
  let Path = [];

  while (
    !(
      cellDetails[row][col].parent_i == row &&
      cellDetails[row][col].parent_j == col
    )
  ) {
    Path.push([col, row]);
    let temp_row = cellDetails[row][col].parent_i;
    let temp_col = cellDetails[row][col].parent_j;
    row = temp_row;
    col = temp_col;
  }

  Path.push([col, row]);
  Path.reverse();

  let pathStr = Path.map((p) => `(${p[0]}, ${p[1]})`).join(" -> ");
  return pathStr;
}

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

  let ROW = grid.length;
  let COL = grid[0].length;
  let closedList = new Array(ROW)
    .fill(false)
    .map(() => new Array(COL).fill(false));

  let cellDetails = new Array(ROW)
    .fill(null)
    .map(() => new Array(COL).fill(null).map(() => new cell()));

  let i = src[1],
    j = src[0];
  cellDetails[i][j].f = 0.0;
  cellDetails[i][j].g = 0.0;
  cellDetails[i][j].h = 0.0;
  cellDetails[i][j].parent_i = i;
  cellDetails[i][j].parent_j = j;

  let openList = new Map();
  openList.set(0.0, [i, j]);

  let foundDest = false;

  while (openList.size > 0) {
    let p = openList.entries().next().value;
    openList.delete(p[0]);

    i = p[1][0];
    j = p[1][1];
    closedList[i][j] = true;

    let gNew, hNew, fNew;
    let directions = [
      [-1, 0, 1.0],
      [1, 0, 1.0],
      [0, 1, 1.0],
      [0, -1, 1.0],
      [-1, 1, 1.414],
      [-1, -1, 1.414],
      [1, 1, 1.414],
      [1, -1, 1.414],
    ];

    for (let d of directions) {
      let newRow = i + d[0];
      let newCol = j + d[1];
      let cost = d[2];

      if (isValid(grid, newRow, newCol)) {
        if (isDestination(newRow, newCol, dest)) {
          cellDetails[newRow][newCol].parent_i = i;
          cellDetails[newRow][newCol].parent_j = j;
          let path = tracePath(cellDetails, dest);
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
          gNew = cellDetails[i][j].g + cost;
          hNew = calculateHValue(newRow, newCol, dest);
          fNew = gNew + hNew;

          if (
            cellDetails[newRow][newCol].f == 0 ||
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

  let ROW = grid.length;
  let COL = grid[0].length;
  let closedList = new Array(ROW)
    .fill(false)
    .map(() => new Array(COL).fill(false));

  let cellDetails = new Array(ROW)
    .fill(null)
    .map(() => new Array(COL).fill(null).map(() => new cell()));

  let i = src[1],
    j = src[0];
  cellDetails[i][j].f = 0.0;
  cellDetails[i][j].g = 0.0;
  cellDetails[i][j].h = 0.0;
  cellDetails[i][j].parent_i = i;
  cellDetails[i][j].parent_j = j;

  let openList = new Map();
  openList.set(0.0, [i, j]);

  let foundDest = false;

  while (openList.size > 0) {
    let p = openList.entries().next().value;
    openList.delete(p[0]);

    i = p[1][0];
    j = p[1][1];
    closedList[i][j] = true;

    let hNew;
    let directions = [
      [-1, 0, 1.0],
      [1, 0, 1.0],
      [0, 1, 1.0],
      [0, -1, 1.0],
      [-1, 1, 1.414],
      [-1, -1, 1.414],
      [1, 1, 1.414],
      [1, -1, 1.414],
    ];

    for (let d of directions) {
      let newRow = i + d[0];
      let newCol = j + d[1];

      if (isValid(grid, newRow, newCol)) {
        if (isDestination(newRow, newCol, dest)) {
          cellDetails[newRow][newCol].parent_i = i;
          cellDetails[newRow][newCol].parent_j = j;
          let path = tracePath(cellDetails, dest);
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
          hNew = calculateHValue(newRow, newCol, dest);

          if (
            cellDetails[newRow][newCol].f == 0 ||
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
