import { beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { GeneratedMaze, getMaze, getStartAndEndCoordinates, MazeCell } from "../helpers/maze";
import { areCoordinatesEqual } from "../helpers/maze";

describe("Simple Generated Maze", () => {
    const numRows: number = 1;
    const numCols: number = 5;

    // All tests can share the same maze without risk of mutating it, it’s better for performance.
    let maze: MazeCell[][];
    let startCoordinates: number[];
    let endCoordinates: number[];

    beforeAll(() => {
        const generatedMaze: GeneratedMaze = getMaze(numRows, numCols);
        maze = generatedMaze.maze;
        startCoordinates = generatedMaze.startCoordinates;
        endCoordinates = generatedMaze.endCoordinates;
    });
    it("should have the correct type", () => {
        expectTypeOf(maze).toEqualTypeOf<MazeCell[][]>();
    });

    it("should have the correct dimensions", () => {
        expect(Array.isArray(maze)).toBe(true);
        expect(maze.length).toBe(numRows);

        for (const row of maze) {
            expect(Array.isArray(row)).toBe(true);
            expect(row.length).toBe(numCols);
        }
    });
    it("should return valid start and end coordinates", () => {
        const coordinates: number[][] = [startCoordinates, endCoordinates];

        for (const [row, col] of coordinates) {
            const isWithinBounds: boolean = 0 <= row && row < numRows && 0 <= col && col < numCols;
            expect(isWithinBounds).toBe(true);
        }
    });

    it("should return start and end coordinates that are as far apart as possible", () => {
        const leftCoordinates: number[] = [0, 0];
        const rightCoordinates: number[] = [0, numCols - 1];

        const startsAtLeftCoordinates: boolean = areCoordinatesEqual(startCoordinates, leftCoordinates);
        const endsAtRightCoordinates: boolean = areCoordinatesEqual(endCoordinates, rightCoordinates);

        const startsAtRightCoordinates: boolean = areCoordinatesEqual(startCoordinates, rightCoordinates);
        const endsAtLeftCoordinates: boolean = areCoordinatesEqual(endCoordinates, leftCoordinates);

        expect((startsAtLeftCoordinates && endsAtRightCoordinates) || (startsAtRightCoordinates && endsAtLeftCoordinates)).toBe(true);
    });

    it("should not generate paths that exit the maze grid", () => {
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                for (const [neighbourRow, neighbourCol] of maze[row][col].neighbours) {
                    const isWithinBounds: boolean = 0 <= neighbourRow && neighbourRow < numRows && 0 <= neighbourCol && neighbourCol < numCols;
                    expect(isWithinBounds).toBe(true);
                }
            }
        }
    });

    it("should have symmetric neighbour links between connected cells", () => {
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                for (const [neighbourRow, neighbourCol] of maze[row][col].neighbours) {
                    expect(maze[neighbourRow][neighbourCol].neighbours).toContainEqual([row, col]);
                }
            }
        }
    });

    it("should have no unreachable cells", () => {
        /**
         * In a valid maze, all cells should be reachable - i.e., the maze should form one connected component.
         * We use an iterative Depth-First Search (DFS) algorithm to verify full connectivity.
         * Starting from one cell, DFS will visit all reachable cells.
         * After the traversal, if any cell remains unvisited, it means the maze has at least 1 disconnected region.
         */
        const visited: boolean[][] = Array.from({ length: numRows }, () => Array(numCols).fill(false));
        let numConnectedComponents = 0;

        const visitComponent = (startRow: number, startCol: number) => {
            const stack: number[][] = [[startRow, startCol]];

            while (stack.length > 0) {
                const [r, c] = stack.pop()!;
                if (visited[r][c]) continue;
                visited[r][c] = true;

                for (const [nr, nc] of maze[r][c].neighbours) {
                    if (!visited[nr][nc]) stack.push([nr, nc]);
                }
            }
        };

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                if (!visited[row][col]) {
                    numConnectedComponents++;
                    visitComponent(row, col);
                }
            }
        }

        expect(numConnectedComponents).toBe(1);
    });
});
describe("Maze Generation Helper Functions", () => {
    describe("getStartAndEndCoordinates", () => {
        it("should return endpoints at the top-left and top-right corners of a U-shaped maze because they are the furthest from each other", () => {
            // Maze layout (U shape):
            // [0,0] S       E [0,1]
            //    │           │
            // [1,0] ─────── [1,1]

            const topLeft: number[] = [0, 0];
            const topRight: number[] = [0, 1];
            const bottomLeft: number[] = [1, 0];
            const bottomRight: number[] = [1, 1];

            const maze: MazeCell[][] = [
                [{ neighbours: [bottomLeft] }, { neighbours: [bottomRight] }],
                [{ neighbours: [topLeft, bottomRight] }, { neighbours: [topRight, bottomLeft] }],
            ];

            const { startCoordinates, endCoordinates } = getStartAndEndCoordinates(maze);

            const startsAtTopLeft: boolean = areCoordinatesEqual(startCoordinates, topLeft);
            const endsAtTopRight: boolean = areCoordinatesEqual(endCoordinates, topRight);

            const startsAtTopRight: boolean = areCoordinatesEqual(startCoordinates, topRight);
            const endsAtTopLeft: boolean = areCoordinatesEqual(endCoordinates, topLeft);

            expect((startsAtTopLeft && endsAtTopRight) || (startsAtTopRight && endsAtTopLeft)).toBe(true);
        });
    });
});
