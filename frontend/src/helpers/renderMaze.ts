import { Application, Container, ContainerChild, Graphics, removeStructAndGroupDuplicates, Renderer } from "pixi.js";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
interface MazeCell {
  neighbours: Set<Direction>;
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
  getMaze(mazeHeight, mazeWidth);

  // Let us process the maze container with the Graphics API
  // Without loss of generality, maze tiles will be indexed from 0 to mazeWidth - 1, since we are drawing from 0-indexed positions
  // const block: Graphics = new Graphics().rect((mazeWidth - 1) * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE).fill(0xffffff);
  // app.stage.addChild(block);
  console.log(app.renderer.height);
};

/**
 * Get a maze with dimensions max_width
 * @param num_rows - The number of rows the maze should have
 * @param num_cols - The number of columns the maze should have
 * @returns A matrix where each cell maintains its own list of valid neighbours
 */
const getMaze = (num_rows: number, num_cols: number) => {
  const visited: Boolean[][] = Array(num_rows)
    .fill(0)
    .map(() => Array(num_cols).fill(false));

  const maze: MazeCell[][] = Array(num_rows)
    .fill(0)
    .map(() => Array(num_cols).fill({ neighbours: new Set() }));

  const dfs = (row: number, col: number, visited: Boolean[][]) => {
    const performBacktrack: Boolean = 0 <= row && row < num_rows && 0 <= num_cols && num_cols < num_rows;
    if (performBacktrack) {
      return;
    }

    visited[row][col] = true;

    const deltas: [number, number, Direction][] = [
      [0, -1, "UP"],
      [0, 1, "DOWN"],
      [-1, 0, "LEFT"],
      [1, 0, "RIGHT"],
    ];

    // Check where can we go
    const validNeighbours: [number, number, Direction][] = deltas
      .map(([dx, dy, dir]) => [row + dx, col + dy, dir] as [number, number, Direction])
      .filter(([new_row, new_col]) => {
        const isWithinBounds: Boolean = 0 <= new_row && new_row < num_rows && 0 <= new_col && new_col < num_cols;
        return isWithinBounds && visited[new_row][new_col] == false;
      });
    console.warn(validNeighbours);
  };

  dfs(0, 0, visited);
};
