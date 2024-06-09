// script.js
document
  .getElementById("pathfinding-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const file = document.getElementById("file").files[0];
    const start = document.getElementById("start").value.split(",").map(Number);
    const target = document
      .getElementById("target")
      .value.split(",")
      .map(Number);
    const algorithm = document.getElementById("algorithm").value;

    const grid = await parseFile(file);
    let result;

    if (algorithm === "gbfs") {
      result = gbfs(grid, start, target);
    } else {
      result = astar(grid, start, target);
    }

    displayResult(result);
  });

function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const lines = event.target.result.split("\n");
      const grid = lines.map((line) => line.split(""));
      resolve(grid);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function heuristic(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function gbfs(grid, start, target) {
  const startTime = performance.now();
  const openList = [[0, start]];
  const cameFrom = {};
  cameFrom[start] = null;

  while (openList.length > 0) {
    openList.sort((a, b) => a[0] - b[0]);
    const [_, current] = openList.shift();

    if (current[0] === target[0] && current[1] === target[1]) {
      break;
    }

    const neighbors = [
      [current[0] + 1, current[1]],
      [current[0] - 1, current[1]],
      [current[0], current[1] + 1],
      [current[0], current[1] - 1],
    ];

    for (const next of neighbors) {
      if (
        next[0] >= 0 &&
        next[0] < grid.length &&
        next[1] >= 0 &&
        next[1] < grid[0].length &&
        grid[next[0]][next[1]] !== "@"
      ) {
        if (!cameFrom.hasOwnProperty(next)) {
          const priority = heuristic(next, target);
          openList.push([priority, next]);
          cameFrom[next] = current;
        }
      }
    }
  }

  const path = [];
  let current = target;
  while (current) {
    path.push(current);
    current = cameFrom[current];
  }
  path.reverse();

  const duration = performance.now() - startTime;
  return { path, duration };
}

function astar(grid, start, target) {
  const startTime = performance.now();
  const openList = [[0, start]];
  const cameFrom = {};
  const costSoFar = {};
  cameFrom[start] = null;
  costSoFar[start] = 0;

  while (openList.length > 0) {
    openList.sort((a, b) => a[0] - b[0]);
    const [_, current] = openList.shift();

    if (current[0] === target[0] && current[1] === target[1]) {
      break;
    }

    const neighbors = [
      [current[0] + 1, current[1]],
      [current[0] - 1, current[1]],
      [current[0], current[1] + 1],
      [current[0], current[1] - 1],
    ];

    for (const next of neighbors) {
      if (
        next[0] >= 0 &&
        next[0] < grid.length &&
        next[1] >= 0 &&
        next[1] < grid[0].length &&
        grid[next[0]][next[1]] !== "@"
      ) {
        const newCost = costSoFar[current] + 1;
        if (!costSoFar.hasOwnProperty(next) || newCost < costSoFar[next]) {
          costSoFar[next] = newCost;
          const priority = newCost + heuristic(next, target);
          openList.push([priority, next]);
          cameFrom[next] = current;
        }
      }
    }
  }

  const path = [];
  let current = target;
  while (current) {
    path.push(current);
    current = cameFrom[current];
  }
  path.reverse();

  const duration = performance.now() - startTime;
  return { path, duration };
}

function displayResult(result) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `<p>Path: ${JSON.stringify(
    result.path
  )}</p><p>Duration: ${result.duration.toFixed(2)} ms</p>`;
}
