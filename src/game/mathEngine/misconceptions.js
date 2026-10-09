import { Rational } from './rational.js';

/**
 * Diagnostic Student Misconception Distractor Engine
 * Synthesizes realistic incorrect answer choices reflecting common student cognitive errors
 * instead of arbitrary random numbers.
 */

export function buildPemdasDistractors(a, b, c, d, correct) {
  const distractors = new Set();

  // Misconception 1: Strict Left-to-Right evaluation ignoring multiplication precedence
  // E.g., for (a + b) * c - d, evaluating without parens: a + (b * c) - d
  const withoutParens = a + (b * c) - d;
  if (withoutParens !== correct && Number.isFinite(withoutParens)) {
    distractors.add(withoutParens);
  }

  // Misconception 2: Subtracting before multiplying: (a + b) * (c - d)
  if (c - d > 0) {
    const subtractFirst = (a + b) * (c - d);
    if (subtractFirst !== correct && Number.isFinite(subtractFirst)) {
      distractors.add(subtractFirst);
    }
  }

  // Misconception 3: Adding d instead of subtracting
  const addedD = (a + b) * c + d;
  if (addedD !== correct && Number.isFinite(addedD)) {
    distractors.add(addedD);
  }

  // Fallback distinct distractors
  let offset = 1;
  while (distractors.size < 3) {
    const cand = correct + offset * (offset % 2 === 0 ? 1 : -1) * (offset > 2 ? 3 : 2);
    if (cand !== correct && cand > 0) {
      distractors.add(cand);
    }
    offset += 1;
  }

  return Array.from(distractors).slice(0, 3);
}

export function buildFractionAddDistractors(n1, d1, n2, d2, correctFractionStr) {
  const distractors = new Set();

  // Misconception 1: "Across the board" add (add numerators and denominators): (n1+n2)/(d1+d2)
  const acrossN = n1 + n2;
  const acrossD = d1 + d2;
  const acrossStr = new Rational(acrossN, acrossD).toString();
  if (acrossStr !== correctFractionStr) {
    distractors.add(acrossStr);
  }

  // Misconception 2: Multiply numerators instead of adding: (n1*n2)/(common denom)
  const multN = n1 * n2;
  const multD = Math.max(d1, d2);
  const multStr = new Rational(multN, multD).toString();
  if (multStr !== correctFractionStr) {
    distractors.add(multStr);
  }

  // Misconception 3: Forgot to rename numerator when finding common denominator
  const unscaledN = n1 + n2;
  const commonD = Math.max(d1, d2);
  const unscaledStr = new Rational(unscaledN, commonD).toString();
  if (unscaledStr !== correctFractionStr) {
    distractors.add(unscaledStr);
  }

  // Fallback valid fractions
  const rCorrect = new Rational(1, 2);
  const fallbackCandidates = ['1/2', '3/4', '2/3', '5/8', '3/8', '7/10'];
  for (const cand of fallbackCandidates) {
    if (distractors.size >= 3) break;
    if (cand !== correctFractionStr) {
      distractors.add(cand);
    }
  }

  return Array.from(distractors).slice(0, 3);
}

export function buildSubtractionRegroupingDistractors(top, bottom, correct) {
  const distractors = new Set();

  // Misconception 1: "Smaller from larger" error: e.g. 52 - 27 -> (7-2)=5, (5-2)=3 -> 35
  const topOnes = top % 10;
  const bottomOnes = bottom % 10;
  const topTens = Math.floor(top / 10);
  const bottomTens = Math.floor(bottom / 10);

  if (bottomOnes > topOnes) {
    const flippedOnes = bottomOnes - topOnes;
    const diffTens = topTens - bottomTens;
    const smallerFromLarger = diffTens * 10 + flippedOnes;
    if (smallerFromLarger !== correct && smallerFromLarger > 0) {
      distractors.add(smallerFromLarger);
    }

    // Misconception 2: Forgot that topTens was reduced by 1 when borrowing
    const forgotBorrowTens = (topTens - bottomTens) * 10 + (topOnes + 10 - bottomOnes);
    if (forgotBorrowTens !== correct && forgotBorrowTens > 0) {
      distractors.add(forgotBorrowTens);
    }
  }

  // Additional offset-based plausible distractors
  let step = 10;
  while (distractors.size < 3) {
    const candPlus = correct + step;
    const candMinus = correct - step;
    if (candPlus > 0 && candPlus !== correct) distractors.add(candPlus);
    if (candMinus > 0 && candMinus !== correct && distractors.size < 3) distractors.add(candMinus);
    step += 1;
  }

  return Array.from(distractors).slice(0, 3);
}

export function buildProtractorDistractors(correctAngle) {
  const distractors = new Set();

  // Misconception 1: Read supplementary scale on protractor (180 - angle)
  const supp = 180 - correctAngle;
  if (supp !== correctAngle && supp > 0 && supp < 180) {
    distractors.add(`${supp}°`);
  }

  // Misconception 2: 90 degree complementary confusion (|90 - angle| or 90 + angle)
  const comp = Math.abs(90 - correctAngle);
  if (comp !== correctAngle && comp > 0) {
    distractors.add(`${comp}°`);
  }

  // Plausible nearby angle benchmarks (30, 45, 60, 90, 120, 135, 150)
  const benchmarks = [30, 45, 60, 90, 120, 135, 150];
  for (const b of benchmarks) {
    if (distractors.size >= 3) break;
    if (b !== correctAngle) {
      distractors.add(`${b}°`);
    }
  }

  return Array.from(distractors).slice(0, 3);
}
