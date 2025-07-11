export type Coordinates = [number, number];

export interface MazeCell {
    neighbours: Coordinates[];
}

export interface DfsStackItem {
    row: number;
    col: number;
    isRoot: boolean;
    neighbourQueuedFrom?: Coordinates;
}
export interface GeneratedMaze {
    maze: MazeCell[][];
    startCoordinates: Coordinates;
    endCoordinates: Coordinates;
}
