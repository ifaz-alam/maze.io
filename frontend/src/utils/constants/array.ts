/**
 * Produces a uniformly random permutation of a sequence.
 *
 * Uses the Fisher-Yates (Also known as Knuth Shuffle) Algorithm to shuffle the elements
 * @param array The array to shuffle
 */
export const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

/**
 * Compares two coordinate arrays (each expected to be length 2) for equality.
 *
 * Checks if both arrays have the same length and
 * if their corresponding elements are strictly equal (`===`).
 *
 * @param coord1 - The first coordinate array `[x1, y1]`.
 * @param coord2 - The second coordinate array `[x2, y2]`.
 * @returns `true` if both coordinates are equal, `false` otherwise.
 *
 * @example
 * ```ts
 * areCoordinatesEqual([1, 2], [1, 2]); // true
 * areCoordinatesEqual([1, 2], [2, 1]); // false
 * areCoordinatesEqual([1], [1, 2]);    // false
 * ```
 */
export const areCoordinatesEqual = (coord1: number[], coord2: number[]) => {
    return coord1.length === coord2.length && coord1.every((val, idx) => val === coord2[idx]);
};
