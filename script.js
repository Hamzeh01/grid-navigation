/**
 * Event listener for the form submission to start the pathfinding process.
 * @param {Event} event - The form submission event.
 */
document
  .getElementById("pathForm")
  .addEventListener("submit", handleFormSubmit);

/**
 * Handles the form submission event.
 * @param {Event} event - The form submission event.
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const fileInput = document.getElementById("fileInput").files[0];
  const startX = parseInt(document.getElementById("startX").value);
  const startY = parseInt(document.getElementById("startY").value);
  const endX = parseInt(document.getElementById("endX").value);
  const endY = parseInt(document.getElementById("endY").value);
  const algorithm = document.getElementById("algorithm").value;

  if (fileInput) {
    const reader = new FileReader();
    reader.onload = (e) =>
      processFileContent(
        e.target.result,
        [startX, startY],
        [endX, endY],
        algorithm
      );
    reader.readAsText(fileInput);
  }
}

/**
 * Processes the content of the uploaded file.
 * @param {string} fileContent - The content of the uploaded file.
 * @param {number[]} start - The start coordinates [x, y].
 * @param {number[]} end - The end coordinates [x, y].
 * @param {string} algorithm - The selected algorithm ('astar' or 'gbfs').
 */
function processFileContent(fileContent, start, end, algorithm) {
  const grid = parseGrid(fileContent);
  const result =
    algorithm === "astar"
      ? aStarSearch(grid, start, end)
      : gbfsSearch(grid, start, end);
  document.getElementById("output").innerText = result;
}

/**
 * Parses the grid from the file content.
 * @param {string} content - The content of the file.
 * @returns {number[][]} - The parsed grid.
 */
function parseGrid(content) {
  return content
    .split("\n")
    .map((line) => line.split("").map((char) => (char === "." ? 1 : 0)));
}

/**
 * Class representing a cell in the grid.
 */
class Cell {
  /**
   * Create a cell.
   * @param {number} [parentRow=0] - The row index of the parent cell.
   * @param {number} [parentCol=0] - The column index of the parent cell.
   * @param {number} [f=0] - The total cost function.
   * @param {number} [g=0] - The cost from the start node.
   * @param {number} [h=0] - The heuristic estimate of the cost to the goal.
   */
  constructor(parentRow = 0, parentCol = 0, f = 0, g = 0, h = 0) {
    this.parentRow = parentRow;
    this.parentCol = parentCol;
    this.f = f;
    this.g = g;
    this.h = h;
  }
}

/**
 * Check if a cell is valid (within the grid).
 * @param {number[][]} grid - The grid.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {boolean} - True if valid, false otherwise.
 */
const isValidCell = (grid, row, col) =>
  row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;

/**
 * Check if a cell is unblocked.
 * @param {number[][]} grid - The grid.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {boolean} - True if unblocked, false otherwise.
 */
const isUnblockedCell = (grid, row, col) => grid[row][col] === 1;

/**
 * Check if a cell is the destination.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @param {number[]} destination - The destination coordinates [x, y].
 * @returns {boolean} - True if destination, false otherwise.
 */
const isDestinationCell = (row, col, destination) =>
  row === destination[1] && col === destination[0];

/**
 * Calculate the heuristic value (Euclidean distance) for a cell.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @param {number[]} destination - The destination coordinates [x, y].
 * @returns {number} - The heuristic value.
 */
const calculateHeuristicValue = (row, col, destination) =>
  Math.sqrt((col - destination[0]) ** 2 + (row - destination[1]) ** 2);

/**
 * Trace the path from the destination to the source.
 * @param {Cell[][]} cellDetails - The details of each cell.
 * @param {number[]} destination - The destination coordinates [x, y].
 * @returns {string} - The path as a string.
 */
function tracePath(cellDetails, destination) {
  let row = destination[1],
    col = destination[0],
    path = [];
  while (
    !(
      cellDetails[row][col].parentRow === row &&
      cellDetails[row][col].parentCol === col
    )
  ) {
    path.push([col, row]);
    let tempRow = cellDetails[row][col].parentRow,
      tempCol = cellDetails[row][col].parentCol;
    (row = tempRow), (col = tempCol);
  }
  path.push([col, row]);
  path.reverse();
  return `Path: ${path.map((p) => `(${p[0]}, ${p[1]})`).join(" -> ")}\nCost: ${
    path.length - 1
  }`;
}

/**
 * Perform the pathfinding search (A* or GBFS).
 * @param {number[][]} grid - The grid.
 * @param {number[]} source - The source coordinates [x, y].
 * @param {number[]} destination - The destination coordinates [x, y].
 * @param {boolean} useAStar - Whether to use A* (true) or GBFS (false).
 * @returns {string} - The result of the search.
 */
function performSearch(grid, source, destination, useAStar) {
  const startTime = performance.now();

  if (
    !isValidCell(grid, source[1], source[0]) ||
    !isValidCell(grid, destination[1], destination[0])
  ) {
    return "Source or destination is invalid.";
  }
  if (
    !isUnblockedCell(grid, source[1], source[0]) ||
    !isUnblockedCell(grid, destination[1], destination[0])
  ) {
    return "Source or the destination is blocked.";
  }
  if (isDestinationCell(source[1], source[0], destination)) {
    return "We are already at the destination.";
  }

  const ROWS = grid.length,
    COLS = grid[0].length;
  const closedList = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(false)
  );
  const cellDetails = Array.from({ length: ROWS }, () =>
    Array(COLS)
      .fill(null)
      .map(() => new Cell())
  );
  let [currentRow, currentCol] = [source[1], source[0]];

  cellDetails[currentRow][currentCol] = new Cell(
    currentRow,
    currentCol,
    0.0,
    0.0,
    0.0
  );
  const openList = new Map([[0.0, [currentRow, currentCol]]]);
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
  let foundDestination = false;

  while (openList.size > 0) {
    const [[currentCost, [currentRow, currentCol]]] = openList;
    openList.delete(currentCost);
    closedList[currentRow][currentCol] = true;

    for (const [dx, dy, cost] of directions) {
      const newRow = currentRow + dx,
        newCol = currentCol + dy;
      if (
        isValidCell(grid, newRow, newCol) &&
        isUnblockedCell(grid, newRow, newCol)
      ) {
        if (isDestinationCell(newRow, newCol, destination)) {
          cellDetails[newRow][newCol] = new Cell(currentRow, currentCol);
          const path = tracePath(cellDetails, destination);
          const endTime = performance.now();
          return `${path}\nRuntime: ${(endTime - startTime).toFixed(2)} ms`;
        }

        const gNew = cellDetails[currentRow][currentCol].g + cost;
        const hNew = calculateHeuristicValue(newRow, newCol, destination);
        const fNew = useAStar ? gNew + hNew : hNew;

        if (
          !closedList[newRow][newCol] &&
          (cellDetails[newRow][newCol].f === 0 ||
            cellDetails[newRow][newCol].f > fNew)
        ) {
          openList.set(fNew, [newRow, newCol]);
          cellDetails[newRow][newCol] = new Cell(
            currentRow,
            currentCol,
            fNew,
            gNew,
            hNew
          );
        }
      }
    }
  }

  return "Failed to find the destination cell.";
}

/**
 * A* Search algorithm.
 * @param {number[][]} grid - The grid.
 * @param {number[]} source - The source coordinates [x, y].
 * @param {number[]} destination - The destination coordinates [x, y].
 * @returns {string} - The result of the search.
 */
function aStarSearch(grid, source, destination) {
  return performSearch(grid, source, destination, true);
}

/**
 * Greedy Best-First Search (GBFS) algorithm.
 * @param {number[][]} grid - The grid.
 * @param {number[]} source - The source coordinates [x, y].
 * @param {number[]} destination - The destination coordinates [x, y].
 * @returns {string} - The result of the search.
 */
function gbfsSearch(grid, source, destination) {
  return performSearch(grid, source, destination, false);
}
