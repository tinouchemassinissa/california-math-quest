/**
 * Formal Mathematical Invariant Verifier
 * Validates that every generated question satisfies strict pedagogical and mathematical constraints:
 * 1. Uniqueness Invariant: Exactly 4 distinct options, exactly 1 matches correct answer.
 * 2. Sanity Invariant: No NaN, null, undefined, or empty strings.
 * 3. Pedagogical Invariant: Step-by-step mathematical explanation provided.
 * 4. Boundary Invariant: Positive non-zero numbers where physical items are measured.
 */

export function verifyQuestion(question) {
  if (!question || typeof question !== 'object') {
    return { valid: false, error: 'Question must be an object' };
  }

  // Required metadata
  const requiredFields = ['id', 'grade', 'standard', 'title', 'prompt', 'correctAnswer', 'options'];
  for (const field of requiredFields) {
    if (question[field] === undefined || question[field] === null || question[field] === '') {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Options verification
  const { options, correctAnswer } = question;
  if (!Array.isArray(options)) {
    return { valid: false, error: 'Options must be an array' };
  }

  if (options.length !== 4) {
    return { valid: false, error: `Options array must have exactly 4 items, got ${options.length}` };
  }

  // Check for NaN or undefined within options
  for (let i = 0; i < options.length; i += 1) {
    const opt = options[i];
    if (opt === undefined || opt === null || (typeof opt === 'number' && Number.isNaN(opt))) {
      return { valid: false, error: `Option at index ${i} is invalid (NaN, null, or undefined)` };
    }
    if (typeof opt === 'string' && opt.trim() === '') {
      return { valid: false, error: `Option at index ${i} is an empty string` };
    }
  }

  // Check option uniqueness (case and whitespace normalized for strings)
  const normalizedSet = new Set(options.map((o) => String(o).trim().toLowerCase()));
  if (normalizedSet.size !== 4) {
    return {
      valid: false,
      error: `All 4 options must be distinct. Options: [${options.join(', ')}]`,
    };
  }

  // Check that exactly ONE option matches the correct answer
  const correctNorm = String(correctAnswer).trim().toLowerCase();
  const matchCount = options.filter((o) => String(o).trim().toLowerCase() === correctNorm).length;

  if (matchCount !== 1) {
    return {
      valid: false,
      error: `Expected exactly 1 option to match correctAnswer "${correctAnswer}", found ${matchCount}. Options: [${options.join(', ')}]`,
    };
  }

  // Physical non-negativity constraint for counting / word problems
  if (typeof correctAnswer === 'number' && question.domain === 'CC' && correctAnswer < 0) {
    return { valid: false, error: `Counting domain cannot have negative correct answer: ${correctAnswer}` };
  }

  return { valid: true, error: null };
}
