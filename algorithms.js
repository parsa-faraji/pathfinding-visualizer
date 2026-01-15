/**
 * Pathfinding Algorithms
 */

const PathfindingAlgorithms = {
    info: {
        dijkstra: {
            name: "Dijkstra's Algorithm",
            guarantee: true,
            description: "Explores nodes in order of distance from start. Always finds the shortest path but explores many nodes."
        },
        astar: {
            name: "A* Search",
            guarantee: true,
            description: "Uses heuristics to guide search toward the goal. Finds shortest path while exploring fewer nodes than Dijkstra."
        },
        bfs: {
            name: "Breadth-First Search",
            guarantee: true,
            description: "Explores all neighbors at current depth before moving deeper. Guarantees shortest path in unweighted graphs."
        },
        dfs: {
            name: "Depth-First Search",
            guarantee: false,
            description: "Explores as far as possible along each branch before backtracking. Does NOT guarantee shortest path."
        },
        greedy: {
            name: "Greedy Best-First",
            guarantee: false,
            description: "Always moves toward the goal using heuristics. Fast but does NOT guarantee shortest path."
        }
    },

    heuristic(a, b) {
        // Manhattan distance
        return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
    },

    getNeighbors(node, grid, rows, cols) {
        const neighbors = [];
        const { row, col } = node;
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                neighbors.push(grid[newRow][newCol]);
            }
        }

        return neighbors;
    },

    async dijkstra(grid, start, end, rows, cols, visualize, delay) {
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const node = grid[r][c];
                distances.set(node, Infinity);
                unvisited.add(node);
            }
        }
        distances.set(start, 0);

        while (unvisited.size > 0) {
            // Get node with minimum distance
            let current = null;
            let minDist = Infinity;
            for (const node of unvisited) {
                if (distances.get(node) < minDist) {
                    minDist = distances.get(node);
                    current = node;
                }
            }

            if (!current || distances.get(current) === Infinity) break;
            if (current === end) break;

            unvisited.delete(current);

            if (current !== start && current !== end) {
                await visualize(current, 'visited');
                await new Promise(r => setTimeout(r, delay));
            }

            for (const neighbor of this.getNeighbors(current, grid, rows, cols)) {
                if (!unvisited.has(neighbor) || neighbor.isWall) continue;

                const alt = distances.get(current) + 1;
                if (alt < distances.get(neighbor)) {
                    distances.set(neighbor, alt);
                    previous.set(neighbor, current);
                }
            }
        }

        return this.reconstructPath(previous, start, end);
    },

    async astar(grid, start, end, rows, cols, visualize, delay) {
        const openSet = new Set([start]);
        const closedSet = new Set();
        const gScore = new Map();
        const fScore = new Map();
        const previous = new Map();

        gScore.set(start, 0);
        fScore.set(start, this.heuristic(start, end));

        while (openSet.size > 0) {
            let current = null;
            let minF = Infinity;
            for (const node of openSet) {
                if ((fScore.get(node) || Infinity) < minF) {
                    minF = fScore.get(node);
                    current = node;
                }
            }

            if (current === end) break;

            openSet.delete(current);
            closedSet.add(current);

            if (current !== start && current !== end) {
                await visualize(current, 'visited');
                await new Promise(r => setTimeout(r, delay));
            }

            for (const neighbor of this.getNeighbors(current, grid, rows, cols)) {
                if (closedSet.has(neighbor) || neighbor.isWall) continue;

                const tentativeG = (gScore.get(current) || 0) + 1;

                if (!openSet.has(neighbor)) {
                    openSet.add(neighbor);
                } else if (tentativeG >= (gScore.get(neighbor) || Infinity)) {
                    continue;
                }

                previous.set(neighbor, current);
                gScore.set(neighbor, tentativeG);
                fScore.set(neighbor, tentativeG + this.heuristic(neighbor, end));
            }
        }

        return this.reconstructPath(previous, start, end);
    },

    async bfs(grid, start, end, rows, cols, visualize, delay) {
        const queue = [start];
        const visited = new Set([start]);
        const previous = new Map();

        while (queue.length > 0) {
            const current = queue.shift();

            if (current === end) break;

            if (current !== start && current !== end) {
                await visualize(current, 'visited');
                await new Promise(r => setTimeout(r, delay));
            }

            for (const neighbor of this.getNeighbors(current, grid, rows, cols)) {
                if (visited.has(neighbor) || neighbor.isWall) continue;

                visited.add(neighbor);
                previous.set(neighbor, current);
                queue.push(neighbor);
            }
        }

        return this.reconstructPath(previous, start, end);
    },

    async dfs(grid, start, end, rows, cols, visualize, delay) {
        const stack = [start];
        const visited = new Set();
        const previous = new Map();

        while (stack.length > 0) {
            const current = stack.pop();

            if (visited.has(current)) continue;
            visited.add(current);

            if (current === end) break;

            if (current !== start && current !== end) {
                await visualize(current, 'visited');
                await new Promise(r => setTimeout(r, delay));
            }

            for (const neighbor of this.getNeighbors(current, grid, rows, cols)) {
                if (visited.has(neighbor) || neighbor.isWall) continue;

                previous.set(neighbor, current);
                stack.push(neighbor);
            }
        }

        return this.reconstructPath(previous, start, end);
    },

    async greedy(grid, start, end, rows, cols, visualize, delay) {
        const openSet = new Set([start]);
        const closedSet = new Set();
        const previous = new Map();

        while (openSet.size > 0) {
            let current = null;
            let minH = Infinity;
            for (const node of openSet) {
                const h = this.heuristic(node, end);
                if (h < minH) {
                    minH = h;
                    current = node;
                }
            }

            if (current === end) break;

            openSet.delete(current);
            closedSet.add(current);

            if (current !== start && current !== end) {
                await visualize(current, 'visited');
                await new Promise(r => setTimeout(r, delay));
            }

            for (const neighbor of this.getNeighbors(current, grid, rows, cols)) {
                if (closedSet.has(neighbor) || neighbor.isWall) continue;

                if (!openSet.has(neighbor)) {
                    previous.set(neighbor, current);
                    openSet.add(neighbor);
                }
            }
        }

        return this.reconstructPath(previous, start, end);
    },

    reconstructPath(previous, start, end) {
        const path = [];
        let current = end;

        while (current && current !== start) {
            path.unshift(current);
            current = previous.get(current);
        }

        if (current === start) {
            path.unshift(start);
            return path;
        }

        return [];
    }
};

window.PathfindingAlgorithms = PathfindingAlgorithms;
