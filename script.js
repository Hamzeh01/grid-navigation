// script.js

document
  .getElementById("theme-switch")
  .addEventListener("change", function (event) {
    const label = document.querySelector('label[for="theme-switch"]');
    if (event.target.checked) {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      label.textContent = "Enable Light Mode";
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      label.textContent = "Enable Dark Mode";
    }
  });

let ROW = 1024;
let COL = 1024;

class Cell {
  constructor() {
    this.parent_i = -1;
    this.parent_j = -1;
    this.f = Infinity;
    this.g = Infinity;
    this.h = Infinity;
  }
}

function isValid(row, col) {
  return row >= 0 && row < ROW && col >= 0 && col < COL;
}

function isUnBlocked(grid, row, col) {
  return grid[row][col] == ".";
}

function isDestination(row, col, dest) {
  return row == dest[0] && col == dest[1];
}

function calculateHValue(row, col, dest) {
  return Math.sqrt(
    (row - dest[0]) * (row - dest[0]) + (col - dest[1]) * (col - dest[1])
  );
}

function tracePath(cellDetails, dest) {
  let path = [];
  let row = dest[0];
  let col = dest[1];

  while (
    !(
      cellDetails[row][col].parent_i == row &&
      cellDetails[row][col].parent_j == col
    )
  ) {
    path.push([row, col]);
    let temp_row = cellDetails[row][col].parent_i;
    let temp_col = cellDetails[row][col].parent_j;
    row = temp_row;
    col = temp_col;
  }
  path.push([row, col]);
  return path.reverse();
}

function aStarSearch(grid, src, dest) {
  if (!isValid(src[0], src[1])) {
    console.log("Source is invalid");
    return [];
  }

  if (!isValid(dest[0], dest[1])) {
    console.log("Destination is invalid");
    return [];
  }

  if (
    !isUnBlocked(grid, src[0], src[1]) ||
    !isUnBlocked(grid, dest[0], dest[1])
  ) {
    console.log("Source or the destination is blocked");
    return [];
  }

  if (isDestination(src[0], src[1], dest)) {
    console.log("We are already at the destination");
    return [src];
  }

  let closedList = Array.from({ length: ROW }, () => Array(COL).fill(false));
  let cellDetails = Array.from({ length: ROW }, () =>
    Array.from({ length: COL }, () => new Cell())
  );

  let i = src[0];
  let j = src[1];
  cellDetails[i][j].f = 0;
  cellDetails[i][j].g = 0;
  cellDetails[i][j].h = 0;
  cellDetails[i][j].parent_i = i;
  cellDetails[i][j].parent_j = j;

  let openList = new Set();
  openList.add([0, i, j]);

  while (openList.size > 0) {
    let current = [...openList].reduce((a, b) => (a[0] < b[0] ? a : b));
    openList.delete(current);

    i = current[1];
    j = current[2];
    closedList[i][j] = true;

    let gNew, hNew, fNew;

    let neighbors = [
      [i - 1, j],
      [i + 1, j],
      [i, j + 1],
      [i, j - 1],
      [i - 1, j + 1],
      [i - 1, j - 1],
      [i + 1, j + 1],
      [i + 1, j - 1],
    ];

    for (let [ni, nj] of neighbors) {
      if (isValid(ni, nj)) {
        if (isDestination(ni, nj, dest)) {
          cellDetails[ni][nj].parent_i = i;
          cellDetails[ni][nj].parent_j = j;
          return tracePath(cellDetails, dest);
        } else if (!closedList[ni][nj] && isUnBlocked(grid, ni, nj)) {
          gNew = cellDetails[i][j].g + 1;
          hNew = calculateHValue(ni, nj, dest);
          fNew = gNew + hNew;

          if (
            cellDetails[ni][nj].f == Infinity ||
            cellDetails[ni][nj].f > fNew
          ) {
            openList.add([fNew, ni, nj]);
            cellDetails[ni][nj].f = fNew;
            cellDetails[ni][nj].g = gNew;
            cellDetails[ni][nj].h = hNew;
            cellDetails[ni][nj].parent_i = i;
            cellDetails[ni][nj].parent_j = j;
          }
        }
      }
    }
  }

  console.log("Failed to find the Destination Cell");
  return [];
}

function gbfs(grid, src, dest) {
  if (!isValid(src[0], src[1])) {
    console.log("Source is invalid");
    return [];
  }

  if (!isValid(dest[0], dest[1])) {
    console.log("Destination is invalid");
    return [];
  }

  if (
    !isUnBlocked(grid, src[0], src[1]) ||
    !isUnBlocked(grid, dest[0], dest[1])
  ) {
    console.log("Source or the destination is blocked");
    return [];
  }

  if (isDestination(src[0], src[1], dest)) {
    console.log("We are already at the destination");
    return [src];
  }

  let closedList = Array.from({ length: ROW }, () => Array(COL).fill(false));
  let cellDetails = Array.from({ length: ROW }, () =>
    Array.from({ length: COL }, () => new Cell())
  );

  let i = src[0];
  let j = src[1];
  cellDetails[i][j].h = calculateHValue(i, j, dest);
  cellDetails[i][j].parent_i = i;
  cellDetails[i][j].parent_j = j;

  let openList = new Set();
  openList.add([cellDetails[i][j].h, i, j]);

  while (openList.size > 0) {
    let current = [...openList].reduce((a, b) => (a[0] < b[0] ? a : b));
    openList.delete(current);

    i = current[1];
    j = current[2];
    closedList[i][j] = true;

    let neighbors = [
      [i - 1, j],
      [i + 1, j],
      [i, j + 1],
      [i, j - 1],
      [i - 1, j + 1],
      [i - 1, j - 1],
      [i + 1, j + 1],
      [i + 1, j - 1],
    ];

    for (let [ni, nj] of neighbors) {
      if (isValid(ni, nj)) {
        if (isDestination(ni, nj, dest)) {
          cellDetails[ni][nj].parent_i = i;
          cellDetails[ni][nj].parent_j = j;
          return tracePath(cellDetails, dest);
        } else if (!closedList[ni][nj] && isUnBlocked(grid, ni, nj)) {
          let hNew = calculateHValue(ni, nj, dest);

          if (
            cellDetails[ni][nj].h == Infinity ||
            cellDetails[ni][nj].h > hNew
          ) {
            openList.add([hNew, ni, nj]);
            cellDetails[ni][nj].h = hNew;
            cellDetails[ni][nj].parent_i = i;
            cellDetails[ni][nj].parent_j = j;
          }
        }
      }
    }
  }

  console.log("Failed to find the Destination Cell");
  return [];
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

async function findPath() {
  const fileInput = document.getElementById("file-input");
  const startCoordInput = document
    .getElementById("start-coord")
    .value.split(",")
    .map(Number);
  const goalCoordInput = document
    .getElementById("goal-coord")
    .value.split(",")
    .map(Number);
  const algorithm = document.getElementById("algorithm").value;
  const resultDiv = document.getElementById("result");

  if (fileInput.files.length === 0) {
    resultDiv.innerHTML = `<p>Please upload a grid file.</p>`;
    resultDiv.classList.add("visible");
    return;
  }

  const file = fileInput.files[0];
  const content = await readFile(file);
  const grid = content.split("\n").map((line) => line.split(""));

  let path = [];
  if (algorithm === "a_star") {
    path = aStarSearch(grid, startCoordInput, goalCoordInput);
  } else {
    path = gbfs(grid, startCoordInput, goalCoordInput);
  }

  if (path.length === 0) {
    resultDiv.innerHTML = `<p>No path found</p>`;
    resultDiv.classList.add("visible");
    return;
  }

  const cost = path.length - 1; // Each step in the path costs 1

  resultDiv.innerHTML = `
        <h2>Best Path</h2>
        <p>${path.map((p) => `(${p[0]}, ${p[1]})`).join(" -> ")}</p>
        <p>Cost: ${cost}</p>
    `;
  resultDiv.classList.add("visible");
}
