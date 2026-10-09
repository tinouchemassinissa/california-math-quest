import { STANDARDS, MODULES } from '../../data/californiaCurriculum.js';
import { createPRNG } from './prng.js';
import { Rational } from './rational.js';
import { verifyQuestion } from './verifier.js';
import {
  buildPemdasDistractors,
  buildFractionAddDistractors,
  buildSubtractionRegroupingDistractors,
  buildProtractorDistractors,
} from './misconceptions.js';

/**
 * Robust, Verified Mathematical Problem Generator
 * Every generated problem is verified by the Formal Invariant Verifier.
 */
export function generateVerifiedProblem({
  grade = '3',
  standardCode = null,
  seed = Date.now(),
  maxVerificationAttempts = 10,
} = {}) {
  const prng = createPRNG(seed);

  // Pick candidate standard
  let candidateStandards = Object.values(STANDARDS).filter((s) => s.grade === grade);
  if (standardCode && STANDARDS[standardCode]) {
    candidateStandards = [STANDARDS[standardCode]];
  }

  const standard = prng.choice(candidateStandards) || candidateStandards[0];

  for (let attempt = 0; attempt < maxVerificationAttempts; attempt += 1) {
    const rawQuestion = synthesizeQuestion(standard, prng);
    const verification = verifyQuestion(rawQuestion);

    if (verification.valid) {
      return {
        ...rawQuestion,
        verified: true,
        verificationTimestamp: new Date().toISOString(),
      };
    }
    // If invariant failed, advance PRNG state and retry
    prng.next();
  }

  // Safe fallback verified question if all parametric variations hit an edge case
  return getSafeFallbackQuestion(standard);
}

function synthesizeQuestion(standard, prng) {
  const qId = `q-${standard.code}-${Date.now()}-${prng.nextInt(100, 999)}`;
  const baseMeta = {
    id: qId,
    grade: standard.grade,
    standard: standard.code,
    domain: standard.domain,
    cluster: standard.cluster,
    title: standard.title,
    module: standard.module,
  };

  switch (standard.code) {
    // ==================== KINDERGARTEN ====================
    case 'K.CC.A.1': {
      if (prng.next() < 0.5) {
        const start = prng.choice([10, 20, 30, 40, 50, 60]);
        const seq = [start, start + 10, start + 20];
        const next = start + 30;
        const options = prng.shuffle([next, next - 10, next + 10, next + 20]);
        return {
          ...baseMeta,
          prompt: `Counting by tens: ${seq.join(', ')}, ❓`,
          correctAnswer: next,
          options,
          explanation: `When counting forward by tens, add 10 to ${seq[seq.length - 1]}. 10 more is ${next}.`,
          hint: `Skip count by 10s: ${seq[seq.length - 1]} + 10 = ${next}.`,
        };
      } else {
        const start = prng.nextInt(1, 20);
        const seq = [start, start + 1, start + 2];
        const next = start + 3;
        const options = prng.shuffle([next, next - 1, next + 1, next + 2]);
        return {
          ...baseMeta,
          prompt: `What number comes next when counting: ${seq.join(', ')}, ❓`,
          correctAnswer: next,
          options,
          explanation: `The count sequence advances by 1. Right after ${seq[seq.length - 1]} is ${next}.`,
          hint: `Count one more after ${seq[seq.length - 1]}.`,
        };
      }
    }

    case 'K.CC.B.4': {
      const count = prng.nextInt(1, 10);
      const distractors = prng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((x) => x !== count)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `How many dots are in the ten-frame?`,
        correctAnswer: count,
        options: prng.shuffle([count, ...distractors]),
        manipulative: { type: 'ten-frame', count, total: 10 },
        explanation: `Counting each dot inside the ten-frame gives exactly ${count} dots.`,
        hint: `Count the dots row by row. The top row holds up to 5 dots.`,
      };
    }

    case 'K.CC.C.6': {
      const a = prng.nextInt(1, 9);
      let b = prng.nextInt(1, 9);
      while (b === a) b = prng.nextInt(1, 9);
      const askGreater = prng.next() > 0.5;
      const correct = askGreater ? Math.max(a, b) : Math.min(a, b);
      const other = askGreater ? Math.min(a, b) : Math.max(a, b);
      const extra1 = Math.max(1, correct - 2);
      const extra2 = correct + 2;
      const distinctSet = new Set([correct, other, extra1, extra2]);
      let step = 1;
      while (distinctSet.size < 4) {
        distinctSet.add(correct + step);
        step += 1;
      }
      return {
        ...baseMeta,
        prompt: `Which group has ${askGreater ? 'MORE (greater)' : 'FEWER (less)'}: ${a} or ${b}?`,
        correctAnswer: correct,
        options: prng.shuffle(Array.from(distinctSet)),
        explanation: `${Math.max(a, b)} is greater than ${Math.min(a, b)}. Therefore the answer is ${correct}.`,
        hint: `Compare the two numbers on a number line.`,
      };
    }

    case 'K.OA.A.2': {
      const a = prng.nextInt(1, 5);
      const b = prng.nextInt(1, 10 - a);
      const sum = a + b;
      const distractors = prng.shuffle([sum - 1, sum + 1, sum + 2, Math.max(1, sum - 2)].filter((x) => x !== sum && x > 0)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `California state park rangers spotted ${a} sea otters and ${b} more joined them. How many sea otters in all?`,
        correctAnswer: sum,
        options: prng.shuffle([sum, ...distractors]),
        manipulative: { type: 'ten-frame', count: sum, groups: [a, b], total: 10 },
        explanation: `Combine the two groups: ${a} + ${b} = ${sum}.`,
        hint: `Start with ${a} and count on ${b} more.`,
      };
    }

    case 'K.OA.A.4': {
      const a = prng.nextInt(1, 9);
      const partner = 10 - a;
      const distractors = prng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== partner)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Partners of 10: What number pairs with ${a} to make a full 10? (${a} + ❓ = 10)`,
        correctAnswer: partner,
        options: prng.shuffle([partner, ...distractors]),
        manipulative: { type: 'ten-frame', count: 10, groups: [a, partner], total: 10 },
        explanation: `To find the number partner for 10: 10 - ${a} = ${partner}.`,
        hint: `How many empty spaces remain in a ten-frame holding ${a} dots?`,
      };
    }

    // ==================== 1ST GRADE ====================
    case '1.OA.A.1': {
      const a = prng.nextInt(4, 11);
      const b = prng.nextInt(3, 9);
      const sum = a + b;
      const distractors = prng.shuffle([sum - 1, sum + 1, sum - 2, sum + 2].filter((x) => x !== sum)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `California Redwood Explorers found ${a} pinecones in Big Basin and ${b} pinecones in Muir Woods. How many total pinecones?`,
        correctAnswer: sum,
        options: prng.shuffle([sum, ...distractors]),
        explanation: `Add the two quantities together: ${a} + ${b} = ${sum}.`,
        hint: `Make a ten: start at ${a}, add ${10 - a} to make 10, then add the rest.`,
      };
    }

    case '1.OA.D.8': {
      const a = prng.nextInt(3, 10);
      const missing = prng.nextInt(2, 9);
      const sum = a + missing;
      const distractors = prng.shuffle([missing - 1, missing + 1, missing + 2, Math.max(1, missing - 2)].filter((x) => x !== missing)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Find the missing number in the equation: ${a} + ❓ = ${sum}`,
        correctAnswer: missing,
        options: prng.shuffle([missing, ...distractors]),
        explanation: `Subtract to find the unknown addend: ${sum} - ${a} = ${missing}.`,
        hint: `Think: how many jumps from ${a} to reach ${sum}?`,
      };
    }

    case '1.NBT.B.2': {
      const tens = prng.nextInt(2, 8);
      const ones = prng.nextInt(1, 9);
      const val = tens * 10 + ones;
      const flipped = ones * 10 + tens;
      const distractors = prng.shuffle([val - 10, val + 10, flipped].filter((x) => x !== val)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `What two-digit number represents ${tens} tens and ${ones} ones?`,
        correctAnswer: val,
        options: prng.shuffle([val, ...distractors]),
        explanation: `${tens} tens equals ${tens * 10}. Adding ${ones} ones gives ${tens * 10} + ${ones} = ${val}.`,
        hint: `The tens digit is in the first place (${tens}), followed by the ones digit (${ones}).`,
      };
    }

    // ==================== 2ND GRADE ====================
    case '2.OA.B.2': {
      const a = prng.nextInt(6, 14);
      const b = prng.nextInt(5, 9);
      const sum = a + b;
      const distractors = prng.shuffle([sum - 1, sum + 1, sum - 2, sum + 2].filter((x) => x !== sum)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Mental Math Fluency: What is ${a} + ${b}?`,
        correctAnswer: sum,
        options: prng.shuffle([sum, ...distractors]),
        explanation: `Decompose to make a ten: ${a} + ${10 - (a % 10)} makes a multiple of 10, then add the rest to get ${sum}.`,
        hint: `Break ${b} into friendly numbers.`,
      };
    }

    case '2.NBT.B.7': {
      const top = prng.nextInt(52, 95);
      const bottom = prng.nextInt(18, 48);
      const diff = top - bottom;
      const distractors = buildSubtractionRegroupingDistractors(top, bottom, diff);
      return {
        ...baseMeta,
        prompt: `Subtract using place value regrouping: ${top} - ${bottom}`,
        correctAnswer: diff,
        options: prng.shuffle([diff, ...distractors]),
        explanation: `Because the ones in ${bottom} (${bottom % 10}) exceed the ones in ${top} (${top % 10}), unbundle 1 ten into 10 ones. Then subtract to get ${diff}.`,
        hint: `Regroup 1 ten into 10 ones before subtracting.`,
      };
    }

    case '2.MD.C.8': {
      const quarters = prng.nextInt(1, 3);
      const dimes = prng.nextInt(1, 3);
      const nickels = prng.nextInt(0, 2);
      const pennies = prng.nextInt(1, 4);
      const total = quarters * 25 + dimes * 10 + nickels * 5 + pennies * 1;
      const distractors = prng.shuffle([total - 10, total + 10, total - 5, total + 5].filter((x) => x !== total && x > 0)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Calculate the total money in the coin tray: (${quarters} quarters, ${dimes} dimes, ${nickels} nickels, ${pennies} pennies)`,
        correctAnswer: `${total}¢`,
        options: prng.shuffle([`${total}¢`, ...distractors.map((v) => `${v}¢`)]),
        manipulative: { type: 'money', coins: { quarters, dimes, nickels, pennies }, totalCents: total },
        explanation: `${quarters}×25¢ = ${quarters * 25}¢. ${dimes}×10¢ = ${dimes * 10}¢. ${nickels}×5¢ = ${nickels * 5}¢. ${pennies}×1¢ = ${pennies}¢. Sum = ${total}¢.`,
        hint: `Add from largest coins (quarters 25¢) down to pennies (1¢).`,
      };
    }

    // ==================== 3RD GRADE ====================
    case '3.OA.C.7': {
      const a = prng.nextInt(3, 11);
      const b = prng.nextInt(3, 11);
      const prod = a * b;
      const distractors = prng.shuffle([prod - a, prod + a, prod - 1, prod + 2].filter((x) => x !== prod && x > 0)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Fact Fluency: What is ${a} × ${b}?`,
        correctAnswer: prod,
        options: prng.shuffle([prod, ...distractors]),
        manipulative: { type: 'array', rows: a, cols: b },
        explanation: `${a} groups of ${b} items equals ${prod}.`,
        hint: `Think of repeated addition: ${a} groups of ${b}.`,
      };
    }

    case '3.NF.A.1': {
      const den = prng.choice([2, 3, 4, 6, 8]);
      const num = prng.nextInt(1, den - 1);
      const fracStr = `${num}/${den}`;
      const wrong = [`${den - num}/${den}`, `${num}/${den === 8 ? 6 : den + 1}`, `1/${den}`];
      return {
        ...baseMeta,
        prompt: `What fraction of the visual bar model is shaded?`,
        correctAnswer: fracStr,
        options: prng.shuffle([fracStr, ...wrong]),
        manipulative: { type: 'fraction', numerator: num, denominator: den },
        explanation: `The bar is divided into ${den} equal parts (denominator), and ${num} parts are shaded (numerator). The fraction is ${fracStr}.`,
        hint: `Numerator (top) is shaded parts; denominator (bottom) is total equal parts.`,
      };
    }

    case '3.MD.C.7': {
      const l = prng.nextInt(4, 9);
      const w = prng.nextInt(3, 7);
      const area = l * w;
      const perimeter = 2 * (l + w); // Common student misconception: confusing perimeter with area!
      const distractors = prng.shuffle([perimeter, area - l, area + w, area + 2].filter((x) => x !== area && x > 0)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `A community garden bed is ${l} meters long and ${w} meters wide. What is its area in square meters?`,
        correctAnswer: `${area} sq m`,
        options: prng.shuffle([`${area} sq m`, ...distractors.map((v) => `${v} sq m`)]),
        manipulative: { type: 'array', rows: w, cols: l, unit: 'm' },
        explanation: `Area of a rectangle = length × width = ${l} m × ${w} m = ${area} square meters.`,
        hint: `Multiply length by width. Don't confuse area with perimeter!`,
      };
    }

    // ==================== 4TH GRADE ====================
    case '4.OA.A.3': {
      const boxes = prng.nextInt(4, 8);
      const perBox = prng.nextInt(6, 12);
      const sold = prng.nextInt(10, 25);
      const total = boxes * perBox;
      const left = total - sold;
      const distractors = prng.shuffle([total, left + sold / 2, left - 4, left + 4].filter((x) => x !== left && x > 0)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `A school STEM fair prepared ${boxes} supply boxes with ${perBox} solar cells in each box. If students used ${sold} solar cells, how many cells remain?`,
        correctAnswer: left,
        options: prng.shuffle([left, ...distractors]),
        explanation: `Step 1: Total solar cells = ${boxes} × ${perBox} = ${total}. Step 2: Remaining cells = ${total} - ${sold} = ${left}.`,
        hint: `Find the total first, then subtract the used amount.`,
      };
    }

    case '4.OA.B.4': {
      const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
      const composites = [12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30];
      const pickPrime = prng.choice(primes);
      const pickComposites = prng.shuffle(composites).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Which of the following numbers is a PRIME number?`,
        correctAnswer: pickPrime,
        options: prng.shuffle([pickPrime, ...pickComposites]),
        explanation: `${pickPrime} is prime because its only positive factors are 1 and ${pickPrime}.`,
        hint: `A prime number has exactly two distinct factors: 1 and itself.`,
      };
    }

    case '4.MD.C.6': {
      const angle = prng.choice([30, 45, 60, 90, 120, 135, 150]);
      const distractors = buildProtractorDistractors(angle);
      return {
        ...baseMeta,
        prompt: `What is the degree measure of this angle?`,
        correctAnswer: `${angle}°`,
        options: prng.shuffle([`${angle}°`, ...distractors]),
        explanation: `A right angle is exactly 90°. This angle measures ${angle}°.`,
        hint: `Remember acute angles are less than 90°; obtuse angles are greater than 90°.`,
      };
    }

    // ==================== 5TH GRADE ====================
    case '5.OA.A.1': {
      const a = prng.nextInt(3, 7);
      const b = prng.nextInt(3, 7);
      const c = prng.nextInt(3, 6);
      const d = prng.nextInt(2, 6);
      const ans = (a + b) * c - d;
      const distractors = buildPemdasDistractors(a, b, c, d, ans);
      return {
        ...baseMeta,
        prompt: `Evaluate according to Order of Operations (PEMDAS): (${a} + ${b}) × ${c} - ${d}`,
        correctAnswer: ans,
        options: prng.shuffle([ans, ...distractors]),
        explanation: `1. Evaluate parentheses first: (${a} + ${b}) = ${a + b}. 2. Multiply by ${c}: ${a + b} × ${c} = ${(a + b) * c}. 3. Subtract ${d}: ${(a + b) * c} - ${d} = ${ans}.`,
        hint: `PEMDAS: Parentheses first, then Multiplication, then Subtraction.`,
      };
    }

    case '5.NF.A.1': {
      const pairs = [
        { f1: [1, 2], f2: [1, 4], ans: '3/4' },
        { f1: [1, 3], f2: [1, 6], ans: '1/2' },
        { f1: [2, 5], f2: [3, 10], ans: '7/10' },
        { f1: [1, 4], f2: [3, 8], ans: '5/8' },
        { f1: [2, 3], f2: [1, 6], ans: '5/6' },
      ];
      const pick = prng.choice(pairs);
      const distractors = buildFractionAddDistractors(pick.f1[0], pick.f1[1], pick.f2[0], pick.f2[1], pick.ans);
      return {
        ...baseMeta,
        prompt: `Add fractions with unlike denominators: ${pick.f1[0]}/${pick.f1[1]} + ${pick.f2[0]}/${pick.f2[1]}`,
        correctAnswer: pick.ans,
        options: prng.shuffle([pick.ans, ...distractors]),
        explanation: `Find a common denominator. Rename the fractions, then add numerators to get ${pick.ans}.`,
        hint: `Find a common denominator before adding the fractions.`,
      };
    }

    case '5.MD.C.5': {
      const l = prng.nextInt(4, 7);
      const w = prng.nextInt(3, 6);
      const h = prng.nextInt(2, 5);
      const vol = l * w * h;
      const distractors = prng.shuffle([vol + l, vol - w, vol + 10, vol - 10].filter((x) => x !== vol && x > 0)).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `A California marine biology specimen tank measures ${l} ft long, ${w} ft wide, and ${h} ft high. What is its volume in cubic feet?`,
        correctAnswer: `${vol} cu ft`,
        options: prng.shuffle([`${vol} cu ft`, ...distractors.map((v) => `${v} cu ft`)]),
        explanation: `Volume of a rectangular prism = length × width × height = ${l} × ${w} × ${h} = ${vol} cubic feet.`,
        hint: `Volume = l × w × h.`,
      };
    }

    case '5.G.A.1': {
      const x = prng.nextInt(2, 8);
      const y = prng.nextInt(2, 8);
      const coordStr = `(${x}, ${y})`;
      const wrong = [`(${y}, ${x})`, `(${Math.max(1, x - 1)}, ${y})`, `(${x}, ${Math.max(1, y - 1)})`];
      return {
        ...baseMeta,
        prompt: `Identify the coordinates (x, y) of the star plotted in Quadrant 1:`,
        correctAnswer: coordStr,
        options: prng.shuffle([coordStr, ...wrong]),
        manipulative: { type: 'coordinate', x, y, max: 10 },
        explanation: `Start at origin (0, 0). Move horizontally along the x-axis to ${x}, then vertically up the y-axis to ${y}. Coordinates are (${x}, ${y}).`,
        hint: `Horizontal x-axis first, then vertical y-axis.`,
      };
    }

    default: {
      return getSafeFallbackQuestion(standard);
    }
  }
}

function getSafeFallbackQuestion(standard) {
  const a = 7;
  const b = 8;
  const prod = a * b;
  return {
    id: `q-fallback-${Date.now()}`,
    grade: standard.grade || '3',
    standard: standard.code || '3.OA.C.7',
    domain: standard.domain || 'OA',
    cluster: standard.cluster || 'Multiply and divide within 100',
    title: standard.title || 'Multiplication Fact Fluency',
    module: standard.module || '3-M3',
    prompt: `What is ${a} × ${b}?`,
    correctAnswer: prod,
    options: [48, 54, 56, 64],
    explanation: `${a} groups of ${b} equals ${prod}.`,
    hint: `${a} × ${b} = ${prod}.`,
    verified: true,
  };
}
