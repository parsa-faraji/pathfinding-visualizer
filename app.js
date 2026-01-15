/**
 * Pathfinding Visualizer Application
 */

(function() {
    'use strict';

    const ROWS = 20;
    const COLS = 40;

    let grid = [];
    let startNode = null;
    let endNode = null;
    let isRunning = false;
    let isMouseDown = false;
    let isDraggingStart = false;
    let isDraggingEnd = false;

    const speedMap = { fast: 5, medium: 20, slow: 50 };

    const elements = {
        grid: document.getElementById('grid'),
        algorithm: document.getElementById('algorithm'),
        speed: document.getElementById('speed'),
        pattern: document.getElementById('pattern'),
        visualize: document.getElementById('visualize'),
        clearPath: document.getElementById('clearPath'),
        clearAll: document.getElementById('clearAll'),
        nodesVisited: document.getElementById('nodesVisited'),
        pathLength: document.getElementById('pathLength'),
        time: document.getElementById('time'),
        algorithmInfo: document.getElementById('algorithmInfo')
    };

    function init() {
        createGrid();
        setupEventListeners();
        updateAlgorithmInfo();
    }

    function createGrid() {
        elements.grid.innerHTML = '';
        elements.grid.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;
        grid = [];

        for (let r = 0; r < ROWS; r++) {
            const row = [];
            for (let c = 0; c < COLS; c++) {
                const node = {
                    row: r,
                    col: c,
                    isWall: false,
                    element: document.createElement('div')
                };

                node.element.className = 'node';
                node.element.dataset.row = r;
                node.element.dataset.col = c;

                elements.grid.appendChild(node.element);
                row.push(node);
            }
            grid.push(row);
        }

        // Set start and end
        const startRow = Math.floor(ROWS / 2);
        startNode = grid[startRow][5];
        endNode = grid[startRow][COLS - 6];

        startNode.element.classList.add('start');
        endNode.element.classList.add('end');
    }

    function setupEventListeners() {
        elements.grid.addEventListener('mousedown', handleMouseDown);
        elements.grid.addEventListener('mousemove', handleMouseMove);
        elements.grid.addEventListener('mouseup', handleMouseUp);
        elements.grid.addEventListener('mouseleave', handleMouseUp);

        elements.algorithm.addEventListener('change', updateAlgorithmInfo);
        elements.pattern.addEventListener('change', handlePatternChange);
        elements.visualize.addEventListener('click', visualize);
        elements.clearPath.addEventListener('click', clearPath);
        elements.clearAll.addEventListener('click', clearAll);
    }

    function handleMouseDown(e) {
        if (isRunning) return;
        const node = getNodeFromEvent(e);
        if (!node) return;

        isMouseDown = true;

        if (node === startNode) {
            isDraggingStart = true;
        } else if (node === endNode) {
            isDraggingEnd = true;
        } else {
            toggleWall(node);
        }
    }

    function handleMouseMove(e) {
        if (!isMouseDown || isRunning) return;
        const node = getNodeFromEvent(e);
        if (!node) return;

        if (isDraggingStart && node !== endNode && !node.isWall) {
            startNode.element.classList.remove('start');
            startNode = node;
            startNode.element.classList.add('start');
        } else if (isDraggingEnd && node !== startNode && !node.isWall) {
            endNode.element.classList.remove('end');
            endNode = node;
            endNode.element.classList.add('end');
        } else if (!isDraggingStart && !isDraggingEnd && node !== startNode && node !== endNode) {
            if (!node.isWall) {
                toggleWall(node, true);
            }
        }
    }

    function handleMouseUp() {
        isMouseDown = false;
        isDraggingStart = false;
        isDraggingEnd = false;
    }

    function getNodeFromEvent(e) {
        const el = e.target;
        if (!el.classList.contains('node')) return null;
        const row = parseInt(el.dataset.row);
        const col = parseInt(el.dataset.col);
        return grid[row][col];
    }

    function toggleWall(node, forceWall = false) {
        if (node === startNode || node === endNode) return;

        if (forceWall) {
            node.isWall = true;
            node.element.classList.add('wall');
        } else {
            node.isWall = !node.isWall;
            node.element.classList.toggle('wall');
        }
    }

    function updateAlgorithmInfo() {
        const algo = elements.algorithm.value;
        const info = PathfindingAlgorithms.info[algo];

        elements.algorithmInfo.innerHTML = `
            <h3>${info.name}</h3>
            <p class="guarantee ${info.guarantee ? 'yes' : 'no'}">
                ${info.guarantee ? 'Guarantees shortest path' : 'Does NOT guarantee shortest path'}
            </p>
            <p class="description">${info.description}</p>
        `;
    }

    function handlePatternChange() {
        const pattern = elements.pattern.value;
        clearAll();

        switch (pattern) {
            case 'random':
                generateRandomWalls();
                break;
            case 'maze':
                generateMaze();
                break;
            case 'horizontal':
                generateHorizontalLines();
                break;
            case 'vertical':
                generateVerticalLines();
                break;
        }

        elements.pattern.value = 'none';
    }

    function generateRandomWalls() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c] !== startNode && grid[r][c] !== endNode) {
                    if (Math.random() < 0.3) {
                        grid[r][c].isWall = true;
                        grid[r][c].element.classList.add('wall');
                    }
                }
            }
        }
    }

    function generateMaze() {
        // Simple recursive division maze
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
                    if (grid[r][c] !== startNode && grid[r][c] !== endNode) {
                        grid[r][c].isWall = true;
                        grid[r][c].element.classList.add('wall');
                    }
                }
            }
        }
        divide(1, ROWS - 2, 1, COLS - 2);
    }

    function divide(rowStart, rowEnd, colStart, colEnd) {
        if (rowEnd - rowStart < 2 || colEnd - colStart < 2) return;

        const horizontal = (rowEnd - rowStart) > (colEnd - colStart);

        if (horizontal) {
            const row = rowStart + Math.floor(Math.random() * (rowEnd - rowStart - 1)) + 1;
            const passage = colStart + Math.floor(Math.random() * (colEnd - colStart + 1));

            for (let c = colStart; c <= colEnd; c++) {
                if (c !== passage && grid[row][c] !== startNode && grid[row][c] !== endNode) {
                    grid[row][c].isWall = true;
                    grid[row][c].element.classList.add('wall');
                }
            }

            divide(rowStart, row - 1, colStart, colEnd);
            divide(row + 1, rowEnd, colStart, colEnd);
        } else {
            const col = colStart + Math.floor(Math.random() * (colEnd - colStart - 1)) + 1;
            const passage = rowStart + Math.floor(Math.random() * (rowEnd - rowStart + 1));

            for (let r = rowStart; r <= rowEnd; r++) {
                if (r !== passage && grid[r][col] !== startNode && grid[r][col] !== endNode) {
                    grid[r][col].isWall = true;
                    grid[r][col].element.classList.add('wall');
                }
            }

            divide(rowStart, rowEnd, colStart, col - 1);
            divide(rowStart, rowEnd, col + 1, colEnd);
        }
    }

    function generateHorizontalLines() {
        for (let r = 2; r < ROWS - 2; r += 3) {
            const passage = Math.floor(Math.random() * COLS);
            for (let c = 0; c < COLS; c++) {
                if (c !== passage && grid[r][c] !== startNode && grid[r][c] !== endNode) {
                    grid[r][c].isWall = true;
                    grid[r][c].element.classList.add('wall');
                }
            }
        }
    }

    function generateVerticalLines() {
        for (let c = 2; c < COLS - 2; c += 3) {
            const passage = Math.floor(Math.random() * ROWS);
            for (let r = 0; r < ROWS; r++) {
                if (r !== passage && grid[r][c] !== startNode && grid[r][c] !== endNode) {
                    grid[r][c].isWall = true;
                    grid[r][c].element.classList.add('wall');
                }
            }
        }
    }

    async function visualize() {
        if (isRunning) return;
        clearPath();

        isRunning = true;
        elements.visualize.disabled = true;
        elements.clearAll.disabled = true;

        const algo = elements.algorithm.value;
        const delay = speedMap[elements.speed.value];
        const startTime = performance.now();
        let nodesVisited = 0;

        const visualizeNode = async (node, type) => {
            nodesVisited++;
            elements.nodesVisited.textContent = nodesVisited;
            node.element.classList.add(type);
        };

        const path = await PathfindingAlgorithms[algo](
            grid, startNode, endNode, ROWS, COLS, visualizeNode, delay
        );

        const endTime = performance.now();
        elements.time.textContent = `${Math.round(endTime - startTime)}ms`;

        // Animate path
        if (path.length > 0) {
            elements.pathLength.textContent = path.length - 1;
            for (const node of path) {
                if (node !== startNode && node !== endNode) {
                    await new Promise(r => setTimeout(r, 30));
                    node.element.classList.remove('visited');
                    node.element.classList.add('path');
                }
            }
        } else {
            elements.pathLength.textContent = 'No path';
        }

        isRunning = false;
        elements.visualize.disabled = false;
        elements.clearAll.disabled = false;
    }

    function clearPath() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                grid[r][c].element.classList.remove('visited', 'path');
            }
        }
        elements.nodesVisited.textContent = '0';
        elements.pathLength.textContent = '0';
        elements.time.textContent = '0ms';
    }

    function clearAll() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                grid[r][c].isWall = false;
                grid[r][c].element.classList.remove('wall', 'visited', 'path');
            }
        }
        elements.nodesVisited.textContent = '0';
        elements.pathLength.textContent = '0';
        elements.time.textContent = '0ms';
    }

    init();
})();
