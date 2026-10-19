// Reviewed first hints. The optional full solution is separate from the first clue.
export function buildLessonGuide(question) {
  const standard = question?.standard || '';
  const domain = standard.split('.')[1];
  const firstHint = standard === '3.NF.A.2'
    ? 'The distance from 0 to 1 is one whole. Count equal intervals, not the tick marks.'
    : standard === 'K.G.A.2'
      ? 'Look for straight or curved edges. Turning a shape does not change its name.'
      : domain === 'NF'
        ? 'First decide what one whole means. Check whether the pieces are the same size before combining them.'
        : domain === 'NBT'
          ? 'Look at the place value of each digit. Keep ones, tens and hundreds—or decimal places—lined up.'
          : domain === 'MD'
            ? 'Find what is being measured and its unit. Use the picture and decide which quantities belong together.'
            : domain === 'G'
              ? 'Look carefully at the defining properties: sides, corners, angles or coordinates.'
              : domain === 'CC'
                ? 'Count each object once, or notice the pattern between neighboring numbers.'
                : 'What do you know, and what are you trying to find? Try drawing equal groups or a part–whole picture.';
  return { firstHint, strategy: question?.hint || firstHint, solution: question?.explanation || '' };
}
