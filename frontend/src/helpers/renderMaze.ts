import { Application, Container, ContainerChild, Graphics, Renderer } from "pixi.js";
import { shuffleArray } from "./arrayUtils";

interface MazeCell {
    neighbours: number[][];
}

interface DfsStackItem {
    row: number;
    col: number;
    isRoot: boolean;
    rowQueuedFrom?: number;
    colQueuedFrom?: number;
}
interface GeneratedMaze {
    maze: MazeCell[][];
    startCoordinates: number[];
    endCoordinates: number[];
}

const TILE_SIZE: number = 32;
const PADDING: number = TILE_SIZE;
const WALL_THICKNESS: number = 5;
/**
 * Our approach for maze generation is as follows:
 *  - Fix the top left corner as the start
 *  - We use randomized depth first search to generate the tiles which the user can traverse
 *  - The randomized depth first search populates information such as wall metadata and the position of the tiles we can traverse
 *  - Once this process is complete, set the bottom right corner as the exit
 *
 */

export const renderMaze = (app: Application<Renderer>) => {
    // Without loss of generality, maze tiles will be indexed from 0 to mazeWidth - 1, since we are drawing from 0-indexed positions
    const appWidth = app.renderer.width;
    const appHeight = app.renderer.height;

    // Thought process behind this is that we want to centre the grid such that the margin size is the same as the tile size.
    const mazeWidth = Math.floor((appWidth - PADDING * 2) / TILE_SIZE);
    const mazeHeight = Math.floor((appHeight - PADDING * 2) / TILE_SIZE);

    // When splitting the maze into chunks, the coordinates we want to start rendering blocks from would be the top left corner of a given cell.

    const mazeContainer: Container<ContainerChild> = new Container();
    app.stage.addChild(mazeContainer);

    // Draw walls visually
    for (let y = 0; y < mazeHeight; y++) {
        for (let x = 0; x < mazeWidth; x++) {
            const block: Graphics = new Graphics()
                .rect(x * TILE_SIZE + PADDING, y * TILE_SIZE + PADDING, TILE_SIZE, TILE_SIZE)
                .fill(0xffffff)
                .stroke({ width: WALL_THICKNESS, color: 0x36454f });
            app.stage.addChild(block);
        }
    }

    const { maze, startCoordinates, endCoordinates }: { maze: MazeCell[][]; startCoordinates: number[]; endCoordinates: number[] } = getMaze(
        mazeHeight,
        mazeWidth
    );

    // Remove walls visually
    for (let row = 0; row < mazeHeight; row++) {
        for (let col = 0; col < mazeWidth; col++) {
            // For this approach, we simply overlap a white square in between the middle of the coordinates (by taking the mean of the coordinates).
            // This is more convenient than having a thinner rectangle for which we need to modify the orientation depending on the direction of the neighbour.
            for (const neighbour of maze[row][col].neighbours) {
                const neighbourRow: number = neighbour[0];
                const neighbourCol: number = neighbour[1];
                const rowToDrawFrom: number = (row + neighbourRow) / 2;
                const colToDrawFrom: number = (col + neighbourCol) / 2;

                // The white square would be centered between two squares which may have some black borders, but how do we make sure we don't draw too much white and make the black thickness look inconsistent?
                // We can strategically shrink our white square, so that it removes a black wall regardless of the direction of the neighbour without relying on conditional cases.
                // Simply start the drawing process with a WALL_THICKNESS / 2 offset, and end the drawing process earlier by subtracting off the WALL_THICKNESS from TILE_SIZE.
                // Basically we make the white square fit inside the original square without deleting any black at all, then shift it via weighted average of the coordinates so that it does delete black.
                const whiteSquare: Graphics = new Graphics()
                    .rect(
                        colToDrawFrom * TILE_SIZE + PADDING + WALL_THICKNESS / 2,
                        rowToDrawFrom * TILE_SIZE + PADDING + WALL_THICKNESS / 2,
                        TILE_SIZE - WALL_THICKNESS,
                        TILE_SIZE - WALL_THICKNESS
                    )
                    .fill(0xffffff);

                app.stage.addChild(whiteSquare);
            }
        }
    }

    // Draw start and end coordinates. Parameter setting is inspired by already implemented logic above.
    // Prematurely shrink square to a smaller side length, then shift it half the distance horizontally and vertically to center it.
    const CENTER_OFFSET: number = TILE_SIZE / 2;
    console.warn(startCoordinates, endCoordinates);

    const startBlock: Graphics = new Graphics()
        .rect(
            startCoordinates[1] * TILE_SIZE + PADDING + WALL_THICKNESS / 2 + CENTER_OFFSET / 2,
            startCoordinates[0] * TILE_SIZE + PADDING + WALL_THICKNESS / 2 + CENTER_OFFSET / 2,
            TILE_SIZE - WALL_THICKNESS - CENTER_OFFSET,
            TILE_SIZE - WALL_THICKNESS - CENTER_OFFSET
        )
        .fill(0x008000);
    app.stage.addChild(startBlock);

    const endBlock: Graphics = new Graphics()
        .rect(
            endCoordinates[1] * TILE_SIZE + PADDING + WALL_THICKNESS / 2 + CENTER_OFFSET / 2,
            endCoordinates[0] * TILE_SIZE + PADDING + WALL_THICKNESS / 2 + CENTER_OFFSET / 2,
            TILE_SIZE - WALL_THICKNESS - CENTER_OFFSET,
            TILE_SIZE - WALL_THICKNESS - CENTER_OFFSET
        )
        .fill(0xff0000);
    app.stage.addChild(endBlock);

    console.log(maze);
};

/**
 * Get a maze with dimensions max_width
 * @param num_rows - The number of rows the maze should have
 * @param num_cols - The number of columns the maze should have
 * @returns A matrix where each cell maintains its own list of valid neighbours
 */
const getMaze = (num_rows: number, num_cols: number): GeneratedMaze => {
    const generateMazeWithDepthFirstSearch = (rootRow: number, rootCol: number) => {
        const visited: boolean[][] = Array(num_rows)
            .fill(0)
            .map(() => Array(num_cols).fill(false));
        // Randomized DFS will fill the metadata in this variable
        const maze: MazeCell[][] = Array.from({ length: num_rows }, () => Array.from({ length: num_cols }, () => ({ neighbours: [] })));

        const stack: DfsStackItem[] = [{ row: rootRow, col: rootCol, isRoot: true }];

        const deltas: [number, number][] = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
        ];

        while (stack.length > 0) {
            const currCell: DfsStackItem = stack.pop() as DfsStackItem;
            const currRow: number = currCell.row;
            const currCol: number = currCell.col;

            // We only push in neighbours within bounds, so really we just need to check visited only.
            const performBacktrack: boolean = visited[currRow][currCol] == true;
            if (performBacktrack) {
                continue;
            }

            visited[currRow][currCol] = true;

            // The root will need to get its metadata updated eventually.
            // To avoid losing information when simulating the call stack, we make each neighbour that gets pushed in the stack know who exactly pushed it (Refer to randomized neighbour process logic below).
            // This way, the neighbour list of the respective nodes are maintained and updated when necessary.
            const isRoot: boolean = currCell.isRoot;

            if (!isRoot) {
                // Update data bidirectionally
                const rowQueuedFrom: number = currCell?.rowQueuedFrom as number;
                const colQueuedFrom: number = currCell?.colQueuedFrom as number;
                maze[currRow][currCol].neighbours.push([rowQueuedFrom, colQueuedFrom]);
                maze[rowQueuedFrom][colQueuedFrom].neighbours.push([currRow, currCol]);
            }

            // Determine where we can go given the current state of the algorithm.
            const validNeighbours: [number, number][] = deltas
                .map(([dx, dy]) => [currRow + dx, currCol + dy] as [number, number])
                .filter(([new_row, new_col]) => {
                    const isWithinBounds: boolean = 0 <= new_row && new_row < num_rows && 0 <= new_col && new_col < num_cols;
                    return isWithinBounds && visited[new_row][new_col] == false;
                });

            if (validNeighbours.length == 0) {
                continue;
            }

            const randomizedNeighbours = shuffleArray(validNeighbours);

            for (const neighbour of randomizedNeighbours) {
                const neighbourRow: number = neighbour[0];
                const neighbourCol: number = neighbour[1];
                stack.push({ row: neighbourRow, col: neighbourCol, isRoot: false, rowQueuedFrom: currRow, colQueuedFrom: currCol });
            }
        }

        return { maze, ...getStartAndEndCoordinates(maze) };
    };

    // Start generation process from a random cell within bounds to introduce more variation.
    const randomRowToBeginGenerationFrom: number = Math.floor(Math.random() * num_rows);
    const randomColToBeginGenerationFrom: number = Math.floor(Math.random() * num_cols);
    const generatedMaze: GeneratedMaze = generateMazeWithDepthFirstSearch(randomRowToBeginGenerationFrom, randomColToBeginGenerationFrom);

    return generatedMaze;
};

/**
 * The generated Maze forms a spanning tree, so we can find the two globally furthest points efficiently using two Breadth-First Search (BFS) calls.
 *
 * 1. Select an arbitrary cell.
 * 2. Find the furthest cell from this cell (call it X).
 * 3. Start a separate breadth first call using the cell in step 2 and find the cell farthest from it (call it Y).
 * 4. Globally furthest points are X and Y.
 * @returns An array of length 2. Contains the row and column value of the furthest point in the maze from the specified `startRow` and `startCol`.
 */
const getStartAndEndCoordinates = (maze: MazeCell[][]): { startCoordinates: number[]; endCoordinates: number[] } => {
    const num_rows: number = maze.length;
    const num_cols: number = maze[0].length;
    const randomStartRow = Math.floor(Math.random() * num_rows);
    const randomStartCol = Math.floor(Math.random() * num_cols);

    const startCoordinates: number[] = furthestCoordinatesFromPosition(maze, randomStartRow, randomStartCol);
    const endCoordinates: number[] = furthestCoordinatesFromPosition(maze, startCoordinates[0], startCoordinates[1]);

    return { startCoordinates, endCoordinates };
};

const furthestCoordinatesFromPosition = (maze: MazeCell[][], startRow: number, startCol: number): number[] => {
    const num_rows: number = maze.length;
    const num_cols: number = maze[0].length;
    const deltas: [number, number][] = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
    ];

    const visited: boolean[][] = Array(num_rows)
        .fill(0)
        .map(() => Array(num_cols).fill(false));

    const queue: number[][] = [[startRow, startCol]];

    // We enqueue vertices of increasing distances, hence updating this value is easy.
    let furthestCoordinates: number[] | undefined = undefined;

    while (queue.length > 0) {
        furthestCoordinates = queue[0];

        for (let _ = 0; _ < queue.length; _++) {
            const currCell: number[] = queue.shift() as number[];
            const currRow: number = currCell[0];
            const currCol: number = currCell[1];

            const validNeighbours: [number, number][] = deltas
                .map(([dx, dy]) => [currRow + dx, currCol + dy] as [number, number])
                .filter(([new_row, new_col]) => {
                    const isWithinBounds: boolean = 0 <= new_row && new_row < num_rows && 0 <= new_col && new_col < num_cols;
                    return isWithinBounds && visited[new_row][new_col] == false;
                });

            if (validNeighbours.length == 0) {
                break;
            }

            // Update visited
            for (const neighbour of validNeighbours) {
                const neighbourRow: number = neighbour[0];
                const neighbourCol: number = neighbour[1];
                visited[neighbourRow][neighbourCol] = true;
                queue.push(neighbour);
            }
        }
    }

    return furthestCoordinates as number[];
};
