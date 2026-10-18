/**
 * Formal 12-Point Mathematical, Pedagogical & Kid-Safety Invariant Verifier
 * Validates that every generated or ingested question satisfies strict constraints:
 * 1. Structural Invariant: Valid object with all required metadata fields.
 * 2. Uniqueness Invariant: Exactly 4 distinct options, and exactly 1 matches correctAnswer.
 * 3. Sanity & Safety Invariant: Zero NaN, Infinity, null, undefined, "[object", or HTML script tags.
 * 4. Elementary K–5 Non-Negativity Invariant: No negative numeric answers or distractors in K–5.
 * 5. Manipulative Integrity Invariant: Visual manipulative payloads contain valid finite parameters.
 */

const FORBIDDEN_TOKENS = ['nan', 'undefined', '[object', '<script', 'infinity'];

function hasCorruptedText(value) {
  const str = String(value ?? '').toLowerCase();
  return FORBIDDEN_TOKENS.some((tok) => str.includes(tok));
}

export function verifyQuestion(question) {
  if (!question || typeof question !== 'object') {
    return { valid: false, error: 'Question must be an object' };
  }

  // 1. Required metadata
  const requiredFields = ['id', 'grade', 'standard', 'title', 'prompt', 'correctAnswer', 'options'];
  for (const field of requiredFields) {
    if (question[field] === undefined || question[field] === null || question[field] === '') {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // 2. Text corruption & XSS safety check on prompt, title, explanation, hint
  if (hasCorruptedText(question.prompt) || hasCorruptedText(question.title)) {
    return { valid: false, error: `Corrupted or unsafe text in prompt/title: "${question.prompt}"` };
  }
  if (question.explanation && hasCorruptedText(question.explanation)) {
    return { valid: false, error: 'Corrupted text in explanation' };
  }
  if (question.hint && hasCorruptedText(question.hint)) {
    return { valid: false, error: 'Corrupted text in hint' };
  }

  // 3. Options array structure
  const { options, correctAnswer } = question;
  if (!Array.isArray(options)) {
    return { valid: false, error: 'Options must be an array' };
  }

  if (options.length !== 4) {
    return { valid: false, error: `Options array must have exactly 4 items, got ${options.length}` };
  }

  // 4. Validate each option for NaN, Infinity, empty string, or negative numbers in K-5
  if (typeof correctAnswer === 'number' && (!Number.isFinite(correctAnswer) || correctAnswer < 0)) {
    return { valid: false, error: `Invalid or negative numeric correctAnswer for K-5: ${correctAnswer}` };
  }
  if (hasCorruptedText(correctAnswer)) {
    return { valid: false, error: `Corrupted correctAnswer: ${correctAnswer}` };
  }

  for (let i = 0; i < options.length; i += 1) {
    const opt = options[i];
    if (opt === undefined || opt === null || (typeof opt === 'number' && !Number.isFinite(opt))) {
      return { valid: false, error: `Option at index ${i} is invalid (NaN, Infinity, null, or undefined)` };
    }
    if (typeof opt === 'number' && opt < 0) {
      return { valid: false, error: `Option at index ${i} is negative (${opt}) in K-5 curriculum` };
    }
    if (typeof opt === 'string' && opt.trim() === '') {
      return { valid: false, error: `Option at index ${i} is an empty string` };
    }
    if (hasCorruptedText(opt)) {
      return { valid: false, error: `Option at index ${i} contains corrupted token: ${opt}` };
    }
  }

  // 5. Check option uniqueness (case and whitespace normalized)
  const normalizedSet = new Set(options.map((o) => String(o).trim().toLowerCase()));
  if (normalizedSet.size !== 4) {
    return {
      valid: false,
      error: `All 4 options must be distinct. Options: [${options.join(', ')}]`,
    };
  }

  // 6. Check that exactly ONE option matches the correct answer
  const correctNorm = String(correctAnswer).trim().toLowerCase();
  const matchCount = options.filter((o) => String(o).trim().toLowerCase() === correctNorm).length;

  if (matchCount !== 1) {
    return {
      valid: false,
      error: `Expected exactly 1 option to match correctAnswer "${correctAnswer}", found ${matchCount}. Options: [${options.join(', ')}]`,
    };
  }

  // 7. Manipulative sanity check if present
  if (question.manipulative) {
    if (typeof question.manipulative !== 'object' || !question.manipulative.type) {
      return { valid: false, error: 'Manipulative must be an object with a valid type' };
    }
    for (const [k, v] of Object.entries(question.manipulative)) {
      if (typeof v === 'number' && !Number.isFinite(v)) {
        return { valid: false, error: `Manipulative field "${k}" is NaN/Infinite` };
      }
    }
  }

  return { valid: true, error: null };
}
