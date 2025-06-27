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
