import { STANDARDS } from '../../data/californiaCurriculum.js';
import { semanticErrors } from './semanticChecks.js';
/**
 * Formal Mathematical, Pedagogical, Semantic & Kid-Safety Invariant Verifier
 * Validates that every generated or ingested question satisfies strict constraints:
 * 1. Structural Invariant: Valid object with all required metadata fields.
 * 2. Uniqueness Invariant: Exactly 4 distinct options, and exactly 1 matches correctAnswer.
 * 3. Sanity & Safety Invariant: Zero NaN, Infinity, null, undefined, "[object", or HTML script tags.
 * 4. Elementary K–5 Non-Negativity Invariant: No negative numeric answers or distractors in K–5.
 * 5. Semantic Formula Invariant: Rectangle area (L × W), volume (L × W × H), and explicit arithmetic
 *    prompts must mathematically match correctAnswer.
 * 6. Manipulative Integrity Invariant: Visual manipulative payloads contain valid finite parameters.
 */

const FORBIDDEN_TOKENS = ['nan', 'undefined', '[object', '<script', 'infinity'];

function hasCorruptedText(value) {
  const str = String(value ?? '').toLowerCase();
  return FORBIDDEN_TOKENS.some((tok) => str.includes(tok));
}

function extractLeadingNumber(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/,/g, '').trim();
    if (cleaned.includes('/') || cleaned.includes(':')) return NaN;
    const m = cleaned.match(/^(-?\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) : NaN;
  }
  return NaN;
}

export function verifyQuestion(question) {
  if (!question || typeof question !== 'object') {
    return { valid: false, error: 'Question must be an object', errors: ['Question must be an object'] };
  }

  // 1. Required metadata
  const requiredFields = ['id', 'grade', 'standard', 'title', 'prompt', 'correctAnswer', 'options'];
  for (const field of requiredFields) {
    if (question[field] === undefined || question[field] === null || question[field] === '') {
      const msg = `Missing required field: ${field}`;
      return { valid: false, error: msg, errors: [msg] };
    }
  }

  if (!STANDARDS[question.standard] || STANDARDS[question.standard].grade !== question.grade) {
    return { valid: false, error: 'Unknown standard or grade mismatch', errors: ['Unknown standard or grade mismatch'] };
  }
  const independentErrors = semanticErrors(question);
  if (independentErrors.length) return { valid: false, error: independentErrors[0], errors: independentErrors };

  // 2. Text corruption & XSS safety check on prompt, title, explanation, hint
  if (hasCorruptedText(question.prompt) || hasCorruptedText(question.title)) {
    const msg = `Corrupted or unsafe text in prompt/title: "${question.prompt}"`;
    return { valid: false, error: msg, errors: [msg] };
  }
  if (question.explanation && hasCorruptedText(question.explanation)) {
    return { valid: false, error: 'Corrupted text in explanation', errors: ['Corrupted text in explanation'] };
  }
  if (question.hint && hasCorruptedText(question.hint)) {
    return { valid: false, error: 'Corrupted text in hint', errors: ['Corrupted text in hint'] };
  }

  // 3. Options array structure
  const { options, correctAnswer } = question;
  if (!Array.isArray(options)) {
    return { valid: false, error: 'Options must be an array', errors: ['Options must be an array'] };
  }

  if (options.length !== 4) {
    const msg = `Options array must have exactly 4 items, got ${options.length}`;
    return { valid: false, error: msg, errors: [msg] };
  }

  // 4. Validate each option for NaN, Infinity, empty string, or negative numbers in K-5
  if (typeof correctAnswer === 'number' && (!Number.isFinite(correctAnswer) || correctAnswer < 0)) {
    const msg = `Invalid or negative numeric correctAnswer for K-5: ${correctAnswer}`;
    return { valid: false, error: msg, errors: [msg] };
  }
  if (hasCorruptedText(correctAnswer)) {
    const msg = `Corrupted correctAnswer: ${correctAnswer}`;
    return { valid: false, error: msg, errors: [msg] };
  }

  for (let i = 0; i < options.length; i += 1) {
    const opt = options[i];
    if (opt === undefined || opt === null || (typeof opt === 'number' && !Number.isFinite(opt))) {
      const msg = `Option at index ${i} is invalid (NaN, Infinity, null, or undefined)`;
      return { valid: false, error: msg, errors: [msg] };
    }
    if (typeof opt === 'number' && opt < 0) {
      const msg = `Option at index ${i} is negative (${opt}) in K-5 curriculum`;
      return { valid: false, error: msg, errors: [msg] };
    }
    if (typeof opt === 'string' && opt.trim() === '') {
      const msg = `Option at index ${i} is an empty string`;
      return { valid: false, error: msg, errors: [msg] };
    }
    if (hasCorruptedText(opt)) {
      const msg = `Option at index ${i} contains corrupted token: ${opt}`;
      return { valid: false, error: msg, errors: [msg] };
    }
  }

  // 5. Check option uniqueness (case and whitespace normalized)
  const normalizedSet = new Set(options.map((o) => String(o).trim().toLowerCase()));
  if (normalizedSet.size !== 4) {
    const msg = `All 4 options must be distinct. Options: [${options.join(', ')}]`;
    return { valid: false, error: msg, errors: [msg] };
  }

  // 6. Check that exactly ONE option matches the correct answer
  const correctNorm = String(correctAnswer).trim().toLowerCase();
  const matchCount = options.filter((o) => String(o).trim().toLowerCase() === correctNorm).length;

  if (matchCount !== 1) {
    const msg = `Expected exactly 1 option to match correctAnswer "${correctAnswer}", found ${matchCount}. Options: [${options.join(', ')}]`;
    return { valid: false, error: msg, errors: [msg] };
  }

  // 7. Semantic Formula Verification: Area of Rectangle (L long and W wide -> Area = L * W)
  const promptStr = String(question.prompt);
  const areaMatch = promptStr.match(
    /\b(\d+)\s*(?:feet|ft|meters|m|inches|in|centimeters|cm|yards|yd)\s+long\s+and\s+(\d+)\s*(?:feet|ft|meters|m|inches|in|centimeters|cm|yards|yd)\s+wide[^?]*what is its area/i
  );
  if (areaMatch) {
    const expectedArea = Number(areaMatch[1]) * Number(areaMatch[2]);
    const actualNumeric = extractLeadingNumber(correctAnswer);
    if (actualNumeric !== expectedArea) {
      const msg = `Semantic Area Mismatch: ${areaMatch[1]} × ${areaMatch[2]} must equal ${expectedArea}, but correctAnswer is "${correctAnswer}"`;
      return { valid: false, error: msg, errors: [msg] };
    }
  }

  // 8. Semantic Formula Verification: Volume of Rectangular Prism (L long, W wide, and H high -> Volume = L * W * H)
  const volMatch = promptStr.match(
    /\b(\d+)\s*(?:feet|ft|meters|m|inches|in|centimeters|cm)\s+long,\s*(\d+)\s*(?:feet|ft|meters|m|inches|in|centimeters|cm)\s+wide,\s+and\s+(\d+)\s*(?:feet|ft|meters|m|inches|in|centimeters|cm)\s+(?:high|tall)[^?]*what is its volume/i
  );
  if (volMatch) {
    const expectedVol = Number(volMatch[1]) * Number(volMatch[2]) * Number(volMatch[3]);
    const actualNumeric = extractLeadingNumber(correctAnswer);
    if (actualNumeric !== expectedVol) {
      const msg = `Semantic Volume Mismatch: ${volMatch[1]} × ${volMatch[2]} × ${volMatch[3]} must equal ${expectedVol}, but correctAnswer is "${correctAnswer}"`;
      return { valid: false, error: msg, errors: [msg] };
    }
  }

  // 9. Manipulative sanity check if present
  if (question.manipulative) {
    if (typeof question.manipulative !== 'object' || !question.manipulative.type) {
      const msg = 'Manipulative must be an object with a valid type';
      return { valid: false, error: msg, errors: [msg] };
    }
    for (const [k, v] of Object.entries(question.manipulative)) {
      if (typeof v === 'number' && !Number.isFinite(v)) {
        const msg = `Manipulative field "${k}" is NaN/Infinite`;
        return { valid: false, error: msg, errors: [msg] };
      }
    }
  }

  return { valid: true, error: null, errors: [] };
}
