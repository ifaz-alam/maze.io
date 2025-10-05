# Maze Generation Engine
<img width="633" height="472" alt="image" src="https://github.com/user-attachments/assets/b04b6394-3fa2-44c2-9e38-85ecb7a63c29" />

This project is a TypeScript + PixiJS engine for generating and rendering solvable mazes.  
The maze is represented as a spanning tree, ensuring every cell is reachable, and start/end points are chosen to maximize path length.  

## Features
- Randomized **depth-first search** for maze generation  
- **Two-pass BFS** to select start and end points at maximum distance  
- Rendering with **PixiJS** (walls, paths, start = green, end = red)  
- Generates mazes in under **0.02s** for typical grid sizes  
- Modular TypeScript code with type definitions and unit tests  
- Supports local development or Dockerized setup

## Testing

Unit tests are included to ensure the maze generation logic is correct and the application behaves as expected.

### Examples of tests

- **Maze structure**  
  Ensures all cells are connected, no unreachable cells exist, and neighbour links are symmetric.

- **Start and end coordinates**  
  Verifies that start and end points are valid, distinct, and as far apart as possible.

- **Coordinate helpers**  
  Checks utility functions like `areCoordinatesEqual` for correct behavior.

- **Boundary checks**  
  Confirms that generated paths do not exit the maze grid.

### Running Tests

To run all tests using Vitest:

```bash
npm run test
```
## What’s Next

The next step for maze.io is to introduce a **real-time multiplayer mode** where players compete to solve the same maze. We are also planning to implement a **ranking system using Elo ratings**.

### What is Elo?

Elo is a method for rating player skill based on game outcomes:

- If a higher-rated player beats a lower-rated one, their Elo increases slightly.  
- If a lower-rated player wins against a stronger opponent, they gain more points.  
- The rating change is proportional to how “surprising” the win is, based on the two players’ current ratings.

This system encourages fair matchmaking and ensures that rankings reflect actual performance over time.

