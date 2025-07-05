import { Application, Container, ContainerChild, Graphics, removeStructAndGroupDuplicates, Renderer } from "pixi.js";
import { shuffleArray } from "./arrayUtils";

interface MazeCell {
    neighbours: number[][];
}

interface dfsStackItem {
    row: number;
    col: number;
    isRoot: boolean;
    rowQueuedFrom?: number;
    colQueuedFrom?: number;
}

const TILE_SIZE: number = 20;
const PADDING: number = 10;
/**
 * Our approach for maze generation is as follows:
 *  - Fix the top left corner as the start
 *  - We use randomized depth first search to generate the tiles which the user can traverse
 *  - The randomized depth first search populates information such as wall metadata and the position of the tiles we can traverse
 *  - Once this process is complete, set the bottom right corner as the exit
 *
 */

export const renderMaze = (app: Application<Renderer>) => {
    const appWidth = app.renderer.width;
    const appHeight = app.renderer.height;

    const mazeWidth = appWidth / TILE_SIZE;
    const mazeHeight = appHeight / TILE_SIZE;

    // When splitting the maze into chunks, the coordinates we want to start rendering blocks from would be the top left corner of a given cell.

    const mazeContainer: Container<ContainerChild> = new Container();
    app.stage.addChild(mazeContainer);
    const maze: MazeCell[][] = getMaze(mazeHeight, mazeWidth);

    // Let us process the maze container with the Graphics API
    // Without loss of generality, maze tiles will be indexed from 0 to mazeWidth - 1, since we are drawing from 0-indexed positions
    const block: Graphics = new Graphics().rect((mazeWidth - 1) * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE).fill(0xffffff);
    app.stage.addChild(block);
    console.log(app.renderer.height);
};

/**
 * Get a maze with dimensions max_width
 * @param num_rows - The number of rows the maze should have
 * @param num_cols - The number of columns the maze should have
 * @returns A matrix where each cell maintains its own list of valid neighbours
 */
const getMaze = (num_rows: number, num_cols: number): MazeCell[][] => {
    const generateMazeWithDepthFirstSearch = (rootRow: number, rootCol: number) => {
        const visited: Boolean[][] = Array(num_rows)
            .fill(0)
            .map(() => Array(num_cols).fill(false));

        // Randomized DFS will fill the metadata in this variable
        const maze: MazeCell[][] = Array(num_rows)
            .fill(0)
            .map(() => Array(num_cols).fill({ neighbours: [] }));

        const stack: dfsStackItem[] = [{ row: rootRow, col: rootCol, isRoot: true }];

        const deltas: [number, number][] = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
        ];

        while (stack.length > 0) {
            const currCell: dfsStackItem = stack.pop() as dfsStackItem;
            const currRow: number = currCell.row;
            const currCol: number = currCell.row;
            const isRoot: boolean = currCell.isRoot;

            // The root will need to get its metadata updated eventually.
            // To avoid losing information when simulating the call stack, we make each neighbour that gets pushed in the stack know who enqueued it (Check randomized neighbour process logic below).
            // That way, the neighbour list of the respective nodes are maintained and updated when necessary.
            if (!isRoot) {
                const rowQueuedFrom: number = currCell.rowQueuedFrom as number;
                const colQueuedFrom: number = currCell.colQueuedFrom as number;

                // Update data bidirectionally
                maze[rowQueuedFrom][colQueuedFrom].neighbours.push([currRow, currCol]);
                maze[currRow][currCol].neighbours.push([rowQueuedFrom, colQueuedFrom]);
            }

            // We only push in neighbours within bounds so really we just need to check visited only.
            const performBacktrack: Boolean = visited[currRow][currCol] == true;
            if (performBacktrack) {
                continue;
            }

            // Determine where we can go
            const validNeighbours: [number, number][] = deltas
                .map(([dx, dy]) => [currRow + dx, currCol + dy] as [number, number])
                .filter(([new_row, new_col]) => {
                    const isWithinBounds: Boolean = 0 <= new_row && new_row < num_rows && 0 <= new_col && new_col < num_cols;
                    return isWithinBounds && visited[new_row][new_col] == false;
                });

            // Randomize order of neighbours
            const randomizedNeighbours = shuffleArray(validNeighbours);

            for (const neighbour of randomizedNeighbours) {
                const neighbourRow: number = neighbour[0];
                const neighbourCol: number = neighbour[1];

                if (!visited[neighbourRow][neighbourCol]) {
                    stack.push({ row: neighbourRow, col: neighbourCol, isRoot: false, rowQueuedFrom: currRow, colQueuedFrom: currCol });
                }
            }
        }

        return maze;
    };

    // TODO: Start generation process from a random cell within bounds to possibly introduce more variation.
    const maze: MazeCell[][] = generateMazeWithDepthFirstSearch(0, 0);
    return maze;
};
