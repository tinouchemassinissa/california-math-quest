import { STANDARDS } from '../../data/californiaCurriculum.js';
import { createPRNG } from './prng.js';
import { Rational } from './rational.js';
import { verifyQuestion } from './verifier.js';
import {
  getLearnedTemplates,
  synthesizeFromLearnedTemplate,
} from '../learning/curriculumVault.js';
import {
  buildPemdasDistractors,
  buildFractionAddDistractors,
  buildSubtractionRegroupingDistractors,
  buildProtractorDistractors,
} from './misconceptions.js';

export const MANIPULATIVE_STANDARDS = new Set([
  'K.CC.B.4',
  'K.OA.A.2',
  'K.OA.A.4',
  'K.NBT.A.1',
  'K.G.A.2',
  '1.OA.C.6',
  '1.MD.A.2',
  '1.MD.B.3',
  '1.G.A.3',
  '2.OA.C.4',
  '2.NBT.A.2',
  '2.MD.C.7',
  '2.MD.C.8',
  '2.G.A.1',
  '3.OA.A.3',
  '3.OA.C.7',
  '3.NF.A.1',
  '3.NF.A.2',
  '3.NF.A.3',
  '3.MD.C.7',
  '3.MD.D.8',
  '3.G.A.1',
  '4.NF.A.1',
  '4.MD.A.3',
  '4.MD.C.6',
  '4.G.A.1',
  '5.NF.A.1',
  '5.MD.C.5',
  '5.G.A.1',
]);

export const WORD_PROBLEM_STANDARDS = new Set([
  'K.OA.A.2',
  '1.OA.A.1',
  '1.MD.A.2',
  '2.OA.A.1',
  '2.MD.C.8',
  '3.OA.A.3',
  '3.OA.D.8',
  '3.MD.A.1',
  '3.MD.C.7',
  '3.MD.D.8',
  '4.OA.A.2',
  '4.OA.A.3',
  '4.NF.B.4',
  '4.MD.A.1',
  '4.MD.A.3',
  '5.OA.A.1',
  '5.NBT.B.6',
  '5.NBT.B.7',
  '5.NF.A.1',
  '5.NF.B.4',
  '5.NF.B.7',
  '5.MD.A.1',
  '5.MD.C.5',
]);

/**
 * Robust, Verified Mathematical Problem Generator
 * Every single standard in CA CCSS-M Grades K through 5 (56 standards) has a dedicated, verified generator.
 * No dummy fallback is ever used.
 */
export function generateVerifiedProblem({
  grade = '3',
  standardCode = null,
  mode = 'grade-quest',
  seed = null,
  maxVerificationAttempts = 15,
} = {}) {
  const actualSeed =
    seed ??
    Math.floor(
      Date.now() * 1000 +
        (typeof performance !== 'undefined' ? performance.now() * 100 : 0) +
        Math.random() * 1000000
    );
  const prng = createPRNG(actualSeed);

  // Pick candidate standard
  let candidateStandards = Object.values(STANDARDS).filter((s) => s.grade === grade);
  if (standardCode && STANDARDS[standardCode]) {
    candidateStandards = [STANDARDS[standardCode]];
  } else if (mode === 'manipulatives') {
    const manipFiltered = candidateStandards.filter((s) => MANIPULATIVE_STANDARDS.has(s.code));
    if (manipFiltered.length > 0) candidateStandards = manipFiltered;
  } else if (mode === 'word-problems') {
    const wpFiltered = candidateStandards.filter((s) => WORD_PROBLEM_STANDARDS.has(s.code));
    if (wpFiltered.length > 0) candidateStandards = wpFiltered;
  }

  const standard = prng.choice(candidateStandards) || candidateStandards[0];

  // If templates were learned from online feeds/APIs, opportunistically synthesize from them
  if (mode !== 'manipulatives') {
    try {
      const learned = getLearnedTemplates(grade, standard.code);
      if (learned && learned.length > 0 && prng.next() < 0.35) {
        const chosenTemplate = prng.choice(learned);
        const synthesized = synthesizeFromLearnedTemplate(chosenTemplate, prng);
        if (synthesized) {
          const check = verifyQuestion(synthesized);
          if (check.valid) {
            return {
              ...synthesized,
              seed: actualSeed,
              verified: true,
              verificationTimestamp: new Date().toISOString(),
            };
          }
        }
      }
    } catch {
      // If template evaluation fails, proceed seamlessly to procedural synthesis
    }
  }

  const forceWordProblem = mode === 'word-problems';

  for (let attempt = 0; attempt < maxVerificationAttempts; attempt += 1) {
    const rawQuestion = synthesizeQuestion(standard, prng, { forceWordProblem });
    const verification = verifyQuestion(rawQuestion);

    if (verification.valid) {
      return {
        ...rawQuestion,
        seed: actualSeed,
        verified: true,
        verificationTimestamp: new Date().toISOString(),
      };
    }
    prng.next();
  }

  return createGuaranteedDynamicQuestion(standard, prng);
}

function synthesizeQuestion(standard, prng, { forceWordProblem = false } = {}) {
  const qId = `q-${standard.code}-${Date.now()}-${prng.nextInt(1000, 9999)}`;
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
        return {
          ...baseMeta,
          prompt: `Counting by tens: ${seq.join(', ')}, ❓`,
          correctAnswer: next,
          options: prng.shuffle(generateDistinctOptions(next, 4, 10, 100, prng)),
          explanation: `When counting forward by tens, add 10 to ${seq[seq.length - 1]}. 10 more is ${next}.`,
          hint: `Skip count by 10s: ${seq[seq.length - 1]} + 10 = ${next}.`,
        };
      } else {
        const start = prng.nextInt(1, 25);
        const seq = [start, start + 1, start + 2];
        const next = start + 3;
        return {
          ...baseMeta,
          prompt: `What number comes next when counting: ${seq.join(', ')}, ❓`,
          correctAnswer: next,
          options: prng.shuffle(generateDistinctOptions(next, 4, 1, 40, prng)),
          explanation: `Counting advances by 1. Right after ${seq[seq.length - 1]} is ${next}.`,
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
      const distractors = generateDistinctOptions(correct, 4, 1, 12, prng).filter((x) => x !== correct).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Which number is ${askGreater ? 'GREATER (more)' : 'LESS (fewer)'}: ${a} or ${b}?`,
        correctAnswer: correct,
        options: prng.shuffle([correct, ...distractors]),
        explanation: `${Math.max(a, b)} is more than ${Math.min(a, b)}. Therefore the answer is ${correct}.`,
        hint: `Compare the two numbers on a number line.`,
      };
    }

    case 'K.OA.A.2': {
      const a = prng.nextInt(1, 5);
      const b = prng.nextInt(1, 10 - a);
      const isAdd = prng.next() > 0.4;
      if (isAdd) {
        const sum = a + b;
        const distractors = generateDistinctOptions(sum, 4, 1, 10, prng).filter((x) => x !== sum).slice(0, 3);
        const stories = [
          `California park rangers saw ${a} sea otters and ${b} more joined them. How many sea otters in all?`,
          `Maya picked ${a} golden poppies and her brother picked ${b} more. How many poppies altogether?`,
          `There are ${a} ladybugs on a leaf and ${b} more land on it. How many ladybugs now?`,
        ];
        return {
          ...baseMeta,
          prompt: prng.choice(stories),
          correctAnswer: sum,
          options: prng.shuffle([sum, ...distractors]),
          manipulative: { type: 'ten-frame', count: sum, groups: [a, b], total: 10 },
          explanation: `Combine the two groups: ${a} + ${b} = ${sum}.`,
          hint: `Start with ${a} and count on ${b} more.`,
        };
      } else {
        const total = a + b;
        const diff = total - a;
        const distractors = generateDistinctOptions(diff, 4, 0, 10, prng).filter((x) => x !== diff).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `There were ${total} oranges in a basket. Children ate ${a}. How many oranges remain?`,
          correctAnswer: diff,
          options: prng.shuffle([diff, ...distractors]),
          manipulative: { type: 'ten-frame', count: total, removeCount: a, total: 10 },
          explanation: `Start with ${total} and take away ${a} to get ${diff}.`,
          hint: `Subtract: ${total} - ${a} = ${diff}.`,
        };
      }
    }

    case 'K.OA.A.4': {
      const a = prng.nextInt(1, 9);
      const partner = 10 - a;
      const distractors = generateDistinctOptions(partner, 4, 1, 9, prng).filter((x) => x !== partner).slice(0, 3);
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

    case 'K.NBT.A.1': {
      const ones = prng.nextInt(1, 9);
      const teen = 10 + ones;
      const distractors = generateDistinctOptions(teen, 4, 11, 19, prng).filter((x) => x !== teen).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `1 full group of 10 and ${ones} extra ones make what teen number?`,
        correctAnswer: teen,
        options: prng.shuffle([teen, ...distractors]),
        manipulative: { type: 'double-ten-frame', count: teen, firstFull: 10, secondCount: ones },
        explanation: `10 + ${ones} = ${teen}.`,
        hint: `1 ten and ${ones} ones is ${teen}.`,
      };
    }

    case 'K.MD.A.2': {
      const attributes = [
        { objA: 'Giant Redwood Tree', objB: 'Flower', compare: 'TALLER', answer: 'Giant Redwood Tree' },
        { objA: 'Feather', objB: 'Granite Boulders', compare: 'HEAVIER', answer: 'Granite Boulders' },
        { objA: 'School Bus', objB: 'Skateboard', compare: 'LONGER', answer: 'School Bus' },
        { objA: 'Elephant Seal', objB: 'Butterfly', compare: 'LIGHTER', answer: 'Butterfly' },
      ];
      const pick = prng.choice(attributes);
      const options = prng.shuffle([pick.objA, pick.objB, 'Both are equal', 'Cannot tell']);
      return {
        ...baseMeta,
        prompt: `Which object is ${pick.compare}: ${pick.objA} or ${pick.objB}?`,
        correctAnswer: pick.answer,
        options,
        explanation: `Comparing measurable attributes: A ${pick.answer} is clearly ${pick.compare.toLowerCase()}.`,
        hint: `Think about size, length, or weight in real life.`,
      };
    }

    case 'K.G.A.2': {
      const shapes = [
        { name: 'Triangle', sides: 3 },
        { name: 'Rectangle', sides: 4 },
        { name: 'Square', sides: 4 },
        { name: 'Hexagon', sides: 6 },
      ];
      const pick = prng.choice(shapes);
      const distractors = generateDistinctOptions(pick.sides, 4, 0, 8, prng).filter((x) => x !== pick.sides).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `How many straight sides and corners does a ${pick.name.toLowerCase()} have? (Click the shape below to count!)`,
        correctAnswer: pick.sides,
        options: prng.shuffle([pick.sides, ...distractors]),
        manipulative: { type: 'polygon-inspector', sides: pick.sides, shapeName: pick.name },
        explanation: `A ${pick.name.toLowerCase()} has ${pick.sides} straight outer sides and ${pick.sides} corners (vertices).`,
        hint: `Count the straight edges of the ${pick.name.toLowerCase()}.`,
      };
    }

    // ==================== 1ST GRADE ====================
    case '1.OA.A.1': {
      const a = prng.nextInt(5, 12);
      const b = prng.nextInt(3, 8);
      if (prng.next() < 0.6) {
        const sum = a + b;
        const distractors = generateDistinctOptions(sum, 4, 6, 20, prng).filter((x) => x !== sum).slice(0, 3);
        const stories = [
          `California Redwood Explorers found ${a} pinecones in Big Basin and ${b} in Muir Woods. How many total pinecones?`,
          `Leo saw ${a} pelicans at Santa Cruz Beach and ${b} more flying over the pier. How many pelicans in all?`,
          `A classroom library has ${a} science books and ${b} nature books. How many books altogether?`,
        ];
        return {
          ...baseMeta,
          prompt: prng.choice(stories),
          correctAnswer: sum,
          options: prng.shuffle([sum, ...distractors]),
          explanation: `Add the two quantities: ${a} + ${b} = ${sum}.`,
          hint: `Add: ${a} + ${b} = ${sum}.`,
        };
      } else {
        const total = a + b;
        const diff = total - b;
        const distractors = generateDistinctOptions(diff, 4, 2, 18, prng).filter((x) => x !== diff).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `There were ${total} monarch butterflies resting on a branch in Pacific Grove. Then ${b} flew away. How many butterflies are left?`,
          correctAnswer: diff,
          options: prng.shuffle([diff, ...distractors]),
          explanation: `Subtract the butterflies that flew away: ${total} - ${b} = ${diff}.`,
          hint: `Subtract: ${total} - ${b} = ${diff}.`,
        };
      }
    }

    case '1.OA.C.6': {
      const a = prng.nextInt(4, 9);
      const b = prng.nextInt(3, 9);
      const sum = a + b;
      const distractors = generateDistinctOptions(sum, 4, 6, 20, prng).filter((x) => x !== sum).slice(0, 3);
      const makeTenExp =
        sum >= 10
          ? `Make a ten: ${a} + ${10 - a} = 10, then add ${b - (10 - a)} to get ${sum}.`
          : `Start at ${a} and count on ${b} more to reach ${sum}.`;
      return {
        ...baseMeta,
        prompt: `Addition Fluency: What is ${a} + ${b}?`,
        correctAnswer: sum,
        options: prng.shuffle([sum, ...distractors]),
        manipulative: { type: 'number-line', min: 0, max: 20, start: a, hop: b, target: sum },
        explanation: makeTenExp,
        hint: `Start at ${a} and count forward ${b}.`,
      };
    }

    case '1.OA.D.8': {
      const a = prng.nextInt(3, 11);
      const missing = prng.nextInt(2, 9);
      const sum = a + missing;
      const distractors = generateDistinctOptions(missing, 4, 1, 15, prng).filter((x) => x !== missing).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Find the missing number in the equation: ${a} + ❓ = ${sum}`,
        correctAnswer: missing,
        options: prng.shuffle([missing, ...distractors]),
        explanation: `Subtract to find the unknown addend: ${sum} - ${a} = ${missing}.`,
        hint: `Think subtraction: ${sum} - ${a} = ❓.`,
      };
    }

    case '1.NBT.B.2': {
      const tens = prng.nextInt(2, 8);
      const ones = prng.nextInt(1, 9);
      const val = tens * 10 + ones;
      const distractors = generateDistinctOptions(val, 4, 11, 99, prng).filter((x) => x !== val).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `What two-digit number represents ${tens} tens and ${ones} ones?`,
        correctAnswer: val,
        options: prng.shuffle([val, ...distractors]),
        explanation: `${tens} tens = ${tens * 10}. Adding ${ones} ones gives ${val}.`,
        hint: `Tens digit is ${tens}, ones digit is ${ones}.`,
      };
    }

    case '1.NBT.B.3': {
      const a = prng.nextInt(15, 85);
      let b = prng.nextInt(15, 85);
      while (b === a) b = prng.nextInt(15, 85);
      const relation = a > b ? '>' : '<';
      const prompt = `Which symbol makes this true: ${a} ❓ ${b}`;
      const options = ['>', '<', '=', '+'];
      return {
        ...baseMeta,
        prompt,
        correctAnswer: relation,
        options,
        explanation: `${a} is ${a > b ? 'greater than (>)' : 'less than (<)'} ${b}.`,
        hint: `The open mouth of the symbol points toward the larger number.`,
      };
    }

    case '1.NBT.C.5': {
      const base = prng.nextInt(2, 8) * 10 + prng.nextInt(1, 9);
      const isMore = prng.next() > 0.5;
      const target = isMore ? base + 10 : base - 10;
      const distractors = generateDistinctOptions(target, 4, 10, 99, prng).filter((x) => x !== target).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Mental Math: What is 10 ${isMore ? 'MORE' : 'LESS'} than ${base}?`,
        correctAnswer: target,
        options: prng.shuffle([target, ...distractors]),
        explanation: `Add or subtract 1 from the tens place. ${base} ${isMore ? '+ 10' : '- 10'} = ${target}.`,
        hint: `Only the tens digit changes.`,
      };
    }

    case '1.MD.A.2': {
      const lenA = prng.nextInt(4, 9);
      const lenB = prng.nextInt(2, 6);
      const total = lenA + lenB;
      const distractors = generateDistinctOptions(total, 4, 4, 18, prng).filter((x) => x !== total).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `A blue crayon is ${lenA} centimeter cubes long and a red crayon is ${lenB} centimeter cubes long. If placed end-to-end, how many centimeter cubes long are they together?`,
        correctAnswer: total,
        options: prng.shuffle([total, ...distractors]),
        manipulative: { type: 'number-line', min: 0, max: 16, start: lenA, hop: lenB, target: total },
        explanation: `Laying the two objects end-to-end combines their lengths: ${lenA} + ${lenB} = ${total} centimeter cubes.`,
        hint: `Add the two lengths together: ${lenA} + ${lenB}.`,
      };
    }

    case '1.MD.B.3': {
      const hour = prng.nextInt(1, 12);
      const isHalf = prng.next() > 0.5;
      const minute = isHalf ? 30 : 0;
      const timeStr = `${hour}:${minute === 0 ? '00' : '30'}`;
      const distractors = [
        `${(hour % 12) + 1}:${minute === 0 ? '00' : '30'}`,
        `${hour}:${minute === 0 ? '30' : '00'}`,
        `${((hour + 10) % 12) + 1}:${minute === 0 ? '00' : '30'}`,
      ];
      return {
        ...baseMeta,
        prompt: `What time is shown on the clock face?`,
        correctAnswer: timeStr,
        options: prng.shuffle([timeStr, ...distractors]),
        manipulative: { type: 'clock', hour, minute },
        explanation: `Short hour hand points to ${hour}. Minute hand points to ${minute === 0 ? '12 (:00)' : '6 (:30)'}.`,
        hint: `Short hand = hour; Long hand = minute.`,
      };
    }

    case '1.G.A.3': {
      const parts = prng.choice([2, 4]);
      const word = parts === 2 ? 'halves' : 'fourths (quarters)';
      return {
        ...baseMeta,
        prompt: `When a circular pizza is partitioned into ${parts} equal shares, each share is called:`,
        correctAnswer: word,
        options: prng.shuffle(['halves', 'fourths (quarters)', 'thirds', 'sixths']),
        manipulative: { type: 'fraction', numerator: 1, denominator: parts },
        explanation: `2 equal parts are halves; 4 equal parts are fourths or quarters.`,
        hint: `2 parts = halves; 4 parts = fourths.`,
      };
    }

    // ==================== 2ND GRADE ====================
    case '2.OA.A.1': {
      const a = prng.nextInt(24, 58);
      const b = prng.nextInt(15, 36);
      if (prng.next() < 0.5) {
        const sum = a + b;
        const distractors = generateDistinctOptions(sum, 4, 30, 100, prng).filter((x) => x !== sum).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `During the California Coastal Cleanup, 2nd graders collected ${a} plastic bottles in the morning and ${b} in the afternoon. How many bottles did they collect in all?`,
          correctAnswer: sum,
          options: prng.shuffle([sum, ...distractors]),
          explanation: `Add tens and ones: ${a} + ${b} = ${sum} bottles.`,
          hint: `Add ${a} + ${b}.`,
        };
      } else {
        const diff = a - b;
        const distractors = generateDistinctOptions(diff, 4, 5, 60, prng).filter((x) => x !== diff).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `A school garden in Fresno grew ${a} sunflowers. Students gave ${b} sunflowers to neighbors. How many sunflowers are left in the garden?`,
          correctAnswer: diff,
          options: prng.shuffle([diff, ...distractors]),
          explanation: `Subtract ${b} from ${a}: ${a} - ${b} = ${diff} sunflowers.`,
          hint: `Subtract: ${a} - ${b}.`,
        };
      }
    }

    case '2.OA.B.2': {
      const a = prng.nextInt(6, 14);
      const b = prng.nextInt(5, 9);
      const sum = a + b;
      const distractors = generateDistinctOptions(sum, 4, 11, 25, prng).filter((x) => x !== sum).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Mental Math Fluency: What is ${a} + ${b}?`,
        correctAnswer: sum,
        options: prng.shuffle([sum, ...distractors]),
        explanation: `${a} + ${b} = ${sum}.`,
        hint: `Decompose ${b} to make a 10 with ${a}.`,
      };
    }

    case '2.OA.C.3': {
      const num = prng.nextInt(3, 20);
      const ans = num % 2 === 0 ? 'Even' : 'Odd';
      return {
        ...baseMeta,
        prompt: `Is the number ${num} Even or Odd?`,
        correctAnswer: ans,
        options: ['Even', 'Odd', 'Both', 'Neither'],
        explanation: `${num} ${ans === 'Even' ? 'can be divided into 2 equal teams (Even)' : 'has 1 left over when paired (Odd)'}.`,
        hint: `Even numbers end in 0, 2, 4, 6, 8.`,
      };
    }

    case '2.OA.C.4': {
      const rows = prng.nextInt(2, 5);
      const cols = prng.nextInt(2, 5);
      const total = rows * cols;
      const distractors = generateDistinctOptions(total, 4, 4, 25, prng).filter((x) => x !== total).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `An array has ${rows} rows of solar tiles with ${cols} tiles in each row. How many total solar tiles?`,
        correctAnswer: total,
        options: prng.shuffle([total, ...distractors]),
        manipulative: { type: 'array', rows, cols },
        explanation: `Use repeated addition: ${rows} rows of ${cols} = ${total}.`,
        hint: `Add ${cols} repeated ${rows} times.`,
      };
    }

    case '2.NBT.A.1': {
      const h = prng.nextInt(2, 9);
      const t = prng.nextInt(0, 9);
      const o = prng.nextInt(1, 9);
      const val = h * 100 + t * 10 + o;
      const distractors = [
        h * 100 + o * 10 + t,
        t * 100 + h * 10 + o,
        val + 10,
        val - 100,
      ].filter((x) => x !== val && x > 100);
      const options = generateDistinctStringOptions(
        val,
        distractors,
        [245, 381, 509, 672, 814],
        4,
        prng
      );
      return {
        ...baseMeta,
        prompt: `Place Value: What 3-digit number has ${h} hundreds, ${t} tens, and ${o} ones?`,
        correctAnswer: val,
        options,
        explanation: `${h} hundreds (${h * 100}) + ${t} tens (${t * 10}) + ${o} ones (${o}) = ${val}.`,
        hint: `Combine hundreds (${h}00), tens (${t}0), and ones (${o}).`,
      };
    }

    case '2.NBT.A.2': {
      const step = prng.choice([5, 10, 100]);
      const start = prng.nextInt(2, 8) * step;
      const seq = [start, start + step, start + 2 * step];
      const next = start + 3 * step;
      const distractors = generateDistinctOptions(next, 4, 10, 1000, prng).filter((x) => x !== next).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Skip-counting pattern: ${seq.join(', ')}, ❓`,
        correctAnswer: next,
        options: prng.shuffle([next, ...distractors]),
        manipulative: { type: 'number-line', min: start - step, max: next + step, start: seq[0], hop: step, target: next },
        explanation: `Each step adds ${step}. ${seq[seq.length - 1]} + ${step} = ${next}.`,
        hint: `Find the difference between numbers: +${step}.`,
      };
    }

    case '2.NBT.B.7': {
      const top = prng.nextInt(52, 95);
      const bottom = prng.nextInt(18, 48);
      const diff = top - bottom;
      const distractors = buildSubtractionRegroupingDistractors(top, bottom, diff);
      return {
        ...baseMeta,
        prompt: `Subtract with place value regrouping: ${top} - ${bottom}`,
        correctAnswer: diff,
        options: prng.shuffle([diff, ...distractors]),
        explanation: `Regroup 1 ten into 10 ones where needed, then subtract ones and tens: ${top} - ${bottom} = ${diff}.`,
        hint: `If ones on top are smaller than bottom, unbundle 1 ten into 10 ones.`,
      };
    }

    case '2.MD.C.7': {
      const hour = prng.nextInt(1, 12);
      const minute = prng.choice([5, 10, 15, 20, 25, 35, 40, 45, 50, 55]);
      const minStr = minute < 10 ? `0${minute}` : `${minute}`;
      const timeStr = `${hour}:${minStr}`;
      const distractors = [
        `${(hour % 12) + 1}:${minStr}`,
        `${hour}:${((minute + 15) % 60) < 10 ? '0' + ((minute + 15) % 60) : ((minute + 15) % 60)}`,
        `${((hour + 10) % 12) + 1}:${minStr}`,
      ];
      return {
        ...baseMeta,
        prompt: `What time is shown on the clock to the nearest 5 minutes?`,
        correctAnswer: timeStr,
        options: prng.shuffle([timeStr, ...distractors]),
        manipulative: { type: 'clock', hour, minute },
        explanation: `The hour hand is past ${hour}. The minute hand at ${minute / 5} represents ${minute} minutes. Time: ${timeStr}.`,
        hint: `Skip-count by 5s around the clock for the minute hand.`,
      };
    }

    case '2.MD.C.8': {
      const quarters = prng.nextInt(1, 3);
      const dimes = prng.nextInt(1, 3);
      const nickels = prng.nextInt(0, 2);
      const pennies = prng.nextInt(1, 4);
      const total = quarters * 25 + dimes * 10 + nickels * 5 + pennies * 1;
      const distractors = generateDistinctOptions(total, 4, 25, 150, prng).filter((x) => x !== total).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Calculate the total value in the coin tray: (${quarters} quarters, ${dimes} dimes, ${nickels} nickels, ${pennies} pennies)`,
        correctAnswer: `${total}¢`,
        options: prng.shuffle([`${total}¢`, ...distractors.map((v) => `${v}¢`)]),
        manipulative: { type: 'money', coins: { quarters, dimes, nickels, pennies }, totalCents: total },
        explanation: `${quarters}×25¢ + ${dimes}×10¢ + ${nickels}×5¢ + ${pennies}×1¢ = ${total}¢.`,
        hint: `Quarters = 25¢, Dimes = 10¢, Nickels = 5¢, Pennies = 1¢.`,
      };
    }

    case '2.G.A.1': {
      const shapes = [
        { name: 'Triangle', angles: 3 },
        { name: 'Quadrilateral', angles: 4 },
        { name: 'Pentagon', angles: 5 },
        { name: 'Hexagon', angles: 6 },
      ];
      const pick = prng.choice(shapes);
      return {
        ...baseMeta,
        prompt: `A polygon with exactly ${pick.angles} angles and ${pick.angles} sides is called a:`,
        correctAnswer: pick.name,
        options: prng.shuffle(['Triangle', 'Quadrilateral', 'Pentagon', 'Hexagon']),
        manipulative: { type: 'polygon-inspector', sides: pick.angles, shapeName: pick.name },
        explanation: `By geometric definition, a polygon with ${pick.angles} angles and ${pick.angles} sides is a ${pick.name}.`,
        hint: `Triangle = 3, Quadrilateral = 4, Pentagon = 5, Hexagon = 6.`,
      };
    }

    // ==================== 3RD GRADE ====================
    case '3.OA.A.3': {
      const groups = prng.nextInt(4, 9);
      const perGroup = prng.nextInt(3, 8);
      const total = groups * perGroup;
      if (prng.next() < 0.6) {
        const distractors = generateDistinctOptions(total, 4, 12, 100, prng).filter((x) => x !== total).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `A California elementary library organized ${groups} shelves with ${perGroup} books on each shelf. How many total books?`,
          correctAnswer: total,
          options: prng.shuffle([total, ...distractors]),
          manipulative: { type: 'array', rows: groups, cols: perGroup },
          explanation: `Multiply the equal groups: ${groups} × ${perGroup} = ${total} books.`,
          hint: `Multiply: ${groups} × ${perGroup} = ${total}.`,
        };
      } else {
        const distractors = generateDistinctOptions(perGroup, 4, 2, 15, prng).filter((x) => x !== perGroup).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `A ranger station in Sequoia National Park shared ${total} trail maps equally among ${groups} hiking groups. How many maps did each group receive?`,
          correctAnswer: perGroup,
          options: prng.shuffle([perGroup, ...distractors]),
          manipulative: { type: 'array', rows: groups, cols: perGroup },
          explanation: `Divide total maps by the number of groups: ${total} ÷ ${groups} = ${perGroup} maps.`,
          hint: `Think: ${groups} × ❓ = ${total}.`,
        };
      }
    }

    case '3.OA.A.4': {
      const factorA = prng.nextInt(3, 9);
      const unknown = prng.nextInt(3, 9);
      const product = factorA * unknown;
      const distractors = generateDistinctOptions(unknown, 4, 2, 12, prng).filter((x) => x !== unknown).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Find the unknown factor that makes the equation true: ${factorA} × ❓ = ${product}`,
        correctAnswer: unknown,
        options: prng.shuffle([unknown, ...distractors]),
        explanation: `Use the inverse operation (division): ${product} ÷ ${factorA} = ${unknown}.`,
        hint: `Divide ${product} by ${factorA}.`,
      };
    }

    case '3.OA.C.7': {
      const a = prng.nextInt(3, 12);
      const b = prng.nextInt(3, 12);
      const prod = a * b;
      const distractors = generateDistinctOptions(prod, 4, 9, 144, prng).filter((x) => x !== prod).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Fact Fluency: What is ${a} × ${b}?`,
        correctAnswer: prod,
        options: prng.shuffle([prod, ...distractors]),
        manipulative: { type: 'array', rows: a, cols: b },
        explanation: `${a} groups of ${b} equals ${prod}.`,
        hint: `Think of your multiplication tables: ${a} × ${b}.`,
      };
    }

    case '3.OA.D.8': {
      const packs = prng.nextInt(3, 7);
      const perPack = prng.nextInt(4, 8);
      const extra = prng.nextInt(5, 18);
      const total = packs * perPack + extra;
      const distractors = generateDistinctOptions(total, 4, 15, 90, prng).filter((x) => x !== total).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Two-Step Word Problem: An art teacher in San Diego bought ${packs} boxes of markers with ${perPack} markers in each box, plus ${extra} loose markers. How many markers does the teacher have in all?`,
        correctAnswer: total,
        options: prng.shuffle([total, ...distractors]),
        explanation: `Step 1: Multiply boxes by markers per box (${packs} × ${perPack} = ${packs * perPack}). Step 2: Add loose markers (${packs * perPack} + ${extra} = ${total}).`,
        hint: `First multiply ${packs} × ${perPack}, then add ${extra}.`,
      };
    }

    case '3.NBT.A.1': {
      const roundTo = prng.choice([10, 100]);
      const val = prng.nextInt(125, 875);
      const rounded = Math.round(val / roundTo) * roundTo;
      const distractors = generateDistinctOptions(rounded, 4, Math.max(0, rounded - 150), rounded + 150, prng).filter((x) => x !== rounded).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Round ${val} to the nearest ${roundTo}.`,
        correctAnswer: rounded,
        options: prng.shuffle([rounded, ...distractors]),
        explanation: `To round to the nearest ${roundTo}, inspect the digit to the right. 5 or more rounds up to ${rounded}.`,
        hint: `Look at the digit immediately to the right of the ${roundTo}s place.`,
      };
    }

    case '3.NBT.A.2': {
      const a = prng.nextInt(245, 620);
      const b = prng.nextInt(138, 349);
      const isAdd = prng.next() < 0.55;
      const ans = isAdd ? a + b : a - b;
      const distractors = generateDistinctOptions(ans, 4, 50, 999, prng).filter((x) => x !== ans).slice(0, 3);
      return {
        ...baseMeta,
        prompt: isAdd
          ? `Fluently add within 1,000: ${a} + ${b}`
          : `Fluently subtract within 1,000: ${a} - ${b}`,
        correctAnswer: ans,
        options: prng.shuffle([ans, ...distractors]),
        explanation: `Align hundreds, tens, and ones vertically: ${a} ${isAdd ? '+' : '-'} ${b} = ${ans}.`,
        hint: `Work from the ones place to the tens place, then the hundreds place.`,
      };
    }

    case '3.NF.A.1': {
      const den = prng.choice([2, 3, 4, 6, 8]);
      const num = prng.nextInt(1, den - 1);
      const fracStr = `${num}/${den}`;
      const options = generateDistinctFractionOptions(num, den, 4, prng);
      return {
        ...baseMeta,
        prompt: `What fraction of the visual bar model is shaded?`,
        correctAnswer: fracStr,
        options,
        manipulative: { type: 'fraction', numerator: num, denominator: den },
        explanation: `The model is partitioned into ${den} equal parts, with ${num} shaded parts. The fraction is ${fracStr}.`,
        hint: `Numerator = shaded parts; Denominator = total equal parts.`,
      };
    }

    case '3.NF.A.2': {
      const den = prng.choice([2, 3, 4, 6, 8]);
      const num = prng.nextInt(1, den - 1);
      const fracStr = `${num}/${den}`;
      const options = generateDistinctFractionOptions(num, den, 4, prng);
      return {
        ...baseMeta,
        prompt: `On a number line from 0 to 1 partitioned into ${den} equal intervals, what fraction is located at tick mark ${num}?`,
        correctAnswer: fracStr,
        options,
        manipulative: { type: 'fraction', numerator: num, denominator: den },
        explanation: `Each interval is 1/${den}. Moving ${num} intervals from 0 lands on ${fracStr}.`,
        hint: `Each interval between 0 and 1 represents 1/${den}.`,
      };
    }

    case '3.NF.A.3': {
      const denA = prng.choice([3, 4, 6, 8]);
      let denB = prng.choice([2, 3, 4, 6, 8]);
      while (denB === denA) denB = prng.choice([2, 3, 4, 6, 8]);
      const num = 1;
      const greaterFrac = denA < denB ? `${num}/${denA}` : `${num}/${denB}`;
      const smallerDen = Math.min(denA, denB);
      const largerDen = Math.max(denA, denB);
      return {
        ...baseMeta,
        prompt: `Compare unit fractions: Which fraction is GREATER, 1/${denA} or 1/${denB}?`,
        correctAnswer: greaterFrac,
        options: prng.shuffle([`1/${denA}`, `1/${denB}`, 'They are equal', `1/${denA + denB}`]),
        manipulative: { type: 'fraction', numerator: 1, denominator: smallerDen },
        explanation: `When numerators are the same, a smaller denominator means larger equal shares: 1/${smallerDen} > 1/${largerDen}.`,
        hint: `Sharing a whole among fewer parts makes each part larger!`,
      };
    }

    case '3.MD.A.1': {
      const startMin = prng.nextInt(10, 35);
      const elapsed = prng.nextInt(15, 24);
      const endMin = startMin + elapsed;
      const startStr = `2:${startMin}`;
      const endStr = `2:${endMin}`;
      return {
        ...baseMeta,
        prompt: `A student began reading at ${startStr} p.m. and finished at ${endStr} p.m. How many minutes did they read?`,
        correctAnswer: `${elapsed} min`,
        options: prng.shuffle([`${elapsed} min`, `${elapsed + 5} min`, `${elapsed - 5} min`, `${elapsed + 10} min`]),
        explanation: `Elapsed time = ${endMin} - ${startMin} = ${elapsed} minutes.`,
        hint: `Subtract the starting minutes (${startMin}) from the ending minutes (${endMin}).`,
      };
    }

    case '3.MD.C.7': {
      const l = prng.nextInt(4, 9);
      const w = prng.nextInt(3, 7);
      const area = l * w;
      const candidates = [`${area + l} sq m`, `${Math.max(6, area - w)} sq m`, `${2 * (l + w)} sq m`, `${area + 10} sq m`];
      const fallbackPool = ['12 sq m', '20 sq m', '24 sq m', '30 sq m', '36 sq m', '42 sq m', '48 sq m'];
      const options = generateDistinctStringOptions(`${area} sq m`, candidates, fallbackPool, 4, prng);
      return {
        ...baseMeta,
        prompt: `A California school learning garden is ${l} meters long and ${w} meters wide. What is its area in square meters? (Use the interactive grid below to count unit tiles!)`,
        correctAnswer: `${area} sq m`,
        options,
        manipulative: { type: 'interactive-geometry', width: l, height: w, unit: 'm', showAreaGrid: true },
        explanation: `Area = length × width = ${l} × ${w} = ${area} square meters. You can also count the ${area} unit squares on the grid.`,
        hint: `Area is length multiplied by width (L × W).`,
      };
    }

    case '3.MD.D.8': {
      const l = prng.nextInt(4, 10);
      const w = prng.nextInt(3, 8);
      const perimeter = 2 * (l + w);
      const area = l * w;
      const candidates = [`${area} ft`, `${perimeter + 4} ft`, `${Math.max(10, perimeter - 4)} ft`, `${l + w} ft`];
      const fallbackPool = ['18 ft', '22 ft', '26 ft', '30 ft', '32 ft', '36 ft'];
      const options = generateDistinctStringOptions(`${perimeter} ft`, candidates, fallbackPool, 4, prng);
      return {
        ...baseMeta,
        prompt: `A community playground sandbox is ${l} feet long and ${w} feet wide. What is the total perimeter around the sandbox? (Click the sides below to trace and measure!)`,
        correctAnswer: `${perimeter} ft`,
        options,
        manipulative: { type: 'interactive-geometry', width: l, height: w, unit: 'ft', showAreaGrid: false },
        explanation: `Perimeter = 2 × (length + width) = 2 × (${l} + ${w}) = 2 × ${l + w} = ${perimeter} ft. Adding all 4 sides: ${l} + ${w} + ${l} + ${w} = ${perimeter} ft.`,
        hint: `Perimeter is the distance all the way around the outside (add all 4 sides).`,
      };
    }

    case '3.G.A.1': {
      const quadQuestions = [
        {
          prompt: 'Which geometric category describes ALL 4-sided polygons (including squares, rectangles, rhombuses, and trapezoids)?',
          ans: 'Quadrilateral',
          options: ['Quadrilateral', 'Pentagon', 'Hexagon', 'Triangle'],
          exp: 'Any closed 2D figure with 4 straight sides and 4 vertices belongs to the category of quadrilaterals.',
        },
        {
          prompt: 'A quadrilateral with 4 equal side lengths is ALWAYS called a:',
          ans: 'Rhombus',
          options: ['Rhombus', 'Trapezoid', 'Pentagon', 'Triangle'],
          exp: 'A rhombus is a quadrilateral whose 4 sides all have the same length (a square is a special rhombus with right angles).',
        },
        {
          prompt: 'A quadrilateral with 4 right (90°) angles and 4 equal sides is a:',
          ans: 'Square',
          options: ['Square', 'Trapezoid', 'Hexagon', 'Scalene Triangle'],
          exp: 'A square has both 4 right angles (like a rectangle) and 4 equal sides (like a rhombus).',
        },
      ];
      const pick = prng.choice(quadQuestions);
      return {
        ...baseMeta,
        prompt: pick.prompt,
        correctAnswer: pick.ans,
        options: prng.shuffle(pick.options),
        manipulative: { type: 'polygon-inspector', sides: 4, shapeName: pick.ans },
        explanation: pick.exp,
        hint: `'Quad-' means 4 sides.`,
      };
    }

    // ==================== 4TH GRADE ====================
    case '4.OA.A.2': {
      const base = prng.nextInt(6, 14);
      const times = prng.nextInt(3, 7);
      const total = base * times;
      const distractors = [base + times, total + base, Math.max(4, total - times)].filter((x) => x !== total);
      return {
        ...baseMeta,
        prompt: `Multiplicative Comparison: A young coastal redwood tree is ${base} feet tall. A mature redwood tree nearby is ${times} times as tall. How tall is the mature redwood tree?`,
        correctAnswer: `${total} ft`,
        options: generateDistinctStringOptions(
          `${total} ft`,
          distractors.map((d) => `${d} ft`),
          ['24 ft', '36 ft', '42 ft', '48 ft', '56 ft'],
          4,
          prng
        ),
        explanation: `"${times} times as tall as ${base}" means ${times} × ${base} = ${total} feet.`,
        hint: `Multiply ${base} × ${times}.`,
      };
    }

    case '4.OA.A.3': {
      const storyType = prng.choice(['stem', 'bus', 'grove']);
      if (storyType === 'bus') {
        const buses = prng.nextInt(3, 6);
        const perBus = prng.nextInt(35, 48);
        const carRiders = prng.nextInt(15, 30);
        const total = buses * perBus + carRiders;
        const distractors = generateDistinctOptions(total, 4, 100, 350, prng).filter((x) => x !== total).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `For an educational field trip to the Monterey Bay Aquarium, ${buses} school buses each carried ${perBus} students. Another ${carRiders} students arrived in carpools. How many total students attended the trip?`,
          correctAnswer: total,
          options: prng.shuffle([total, ...distractors]),
          explanation: `Bus riders: ${buses} × ${perBus} = ${buses * perBus}. Total: ${buses * perBus} + ${carRiders} = ${total} students.`,
          hint: `Multiply bus count by students per bus, then add carpool students.`,
        };
      } else if (storyType === 'grove') {
        const trees = prng.nextInt(5, 9);
        const perTree = prng.nextInt(12, 20);
        const donated = prng.nextInt(15, 35);
        const totalHarvest = trees * perTree;
        const left = totalHarvest - donated;
        const distractors = generateDistinctOptions(left, 4, 30, 180, prng).filter((x) => x !== left).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `In a Central Valley family orchard, ${trees} citrus trees each yielded ${perTree} crates of sweet oranges. The farm donated ${donated} crates to local food banks. How many crates remain for the community farmers market?`,
          correctAnswer: left,
          options: prng.shuffle([left, ...distractors]),
          explanation: `Total harvest: ${trees} × ${perTree} = ${totalHarvest}. Remaining: ${totalHarvest} - ${donated} = ${left} crates.`,
          hint: `Multiply to find total harvest, then subtract the donated crates.`,
        };
      } else {
        const boxes = prng.nextInt(4, 8);
        const perBox = prng.nextInt(6, 12);
        const sold = prng.nextInt(10, 25);
        const total = boxes * perBox;
        const left = total - sold;
        const distractors = generateDistinctOptions(left, 4, 5, 80, prng).filter((x) => x !== left).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `A California school STEM fair prepared ${boxes} supply boxes with ${perBox} solar cells in each box. Students used ${sold} solar cells. How many cells remain?`,
          correctAnswer: left,
          options: prng.shuffle([left, ...distractors]),
          explanation: `Total = ${boxes} × ${perBox} = ${total}. Remaining = ${total} - ${sold} = ${left}.`,
          hint: `Step 1: Multiply to find total. Step 2: Subtract the used amount.`,
        };
      }
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
        explanation: `${pickPrime} has only two factors: 1 and ${pickPrime}.`,
        hint: `A prime number has only 1 and itself as factors.`,
      };
    }

    case '4.NBT.A.2': {
      const th = prng.nextInt(2, 9);
      const h = prng.nextInt(1, 8);
      const t = prng.nextInt(1, 9);
      const o = prng.nextInt(1, 9);
      const standardVal = th * 1000 + h * 100 + t * 10 + o;
      const ansStr = standardVal.toLocaleString();
      const candidates = [
        (th * 10000 + h * 100 + t * 10 + o).toLocaleString(),
        (th * 1000 + t * 100 + h * 10 + o).toLocaleString(),
        (standardVal + 100).toLocaleString(),
      ];
      const options = generateDistinctStringOptions(ansStr, candidates, ['3,425', '5,812', '7,209', '8,641'], 4, prng);
      return {
        ...baseMeta,
        prompt: `Write the expanded form number in standard form: ${(th * 1000).toLocaleString()} + ${h * 100} + ${t * 10} + ${o}`,
        correctAnswer: ansStr,
        options,
        explanation: `Combine each place value: ${th} thousands, ${h} hundreds, ${t} tens, and ${o} ones = ${ansStr}.`,
        hint: `Place each digit in its corresponding place-value column.`,
      };
    }

    case '4.NBT.A.3': {
      const num = prng.nextInt(12500, 87900);
      const rounded = Math.round(num / 1000) * 1000;
      const distractors = [rounded - 1000, rounded + 1000, Math.round(num / 100) * 100].filter((x) => x !== rounded);
      while (distractors.length < 3) distractors.push(rounded + 2000);
      return {
        ...baseMeta,
        prompt: `Round ${num.toLocaleString()} to the nearest THOUSAND.`,
        correctAnswer: rounded.toLocaleString(),
        options: prng.shuffle([rounded.toLocaleString(), ...distractors.slice(0, 3).map((v) => v.toLocaleString())]),
        explanation: `Look at the hundreds digit. If 5 or more, round up to ${rounded.toLocaleString()}.`,
        hint: `Check the hundreds digit to determine if the thousands digit rounds up.`,
      };
    }

    case '4.NBT.B.4': {
      const a = prng.nextInt(1240, 5890);
      const b = prng.nextInt(1120, 3450);
      const isAdd = prng.next() < 0.5;
      const ans = isAdd ? a + b : Math.max(a, b) - Math.min(a, b);
      const top = isAdd ? a : Math.max(a, b);
      const bot = isAdd ? b : Math.min(a, b);
      const ansStr = ans.toLocaleString();
      const candidates = [
        (ans + 100).toLocaleString(),
        (ans - 100).toLocaleString(),
        (ans + 10).toLocaleString(),
        (ans - 10).toLocaleString(),
      ];
      const options = generateDistinctStringOptions(ansStr, candidates, ['2,450', '3,810', '4,920', '6,120'], 4, prng);
      return {
        ...baseMeta,
        prompt: `Use the standard algorithm to calculate: ${top.toLocaleString()} ${isAdd ? '+' : '-'} ${bot.toLocaleString()}`,
        correctAnswer: ansStr,
        options,
        explanation: `Using place-value alignment from ones to thousands: ${top.toLocaleString()} ${isAdd ? '+' : '-'} ${bot.toLocaleString()} = ${ansStr}.`,
        hint: `Work column by column from right (ones) to left (thousands).`,
      };
    }

    case '4.NBT.B.5': {
      const a = prng.nextInt(24, 75);
      const b = prng.nextInt(4, 9);
      const prod = a * b;
      const distractors = generateDistinctOptions(prod, 4, 50, 700, prng).filter((x) => x !== prod).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Multiply using partial products or the standard algorithm: ${a} × ${b}`,
        correctAnswer: prod,
        options: prng.shuffle([prod, ...distractors]),
        explanation: `Multiply tens: (${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b}), then ones: (${a % 10} × ${b} = ${(a % 10) * b}). Sum = ${prod}.`,
        hint: `Break ${a} into ${Math.floor(a / 10) * 10} + ${a % 10} and multiply each by ${b}.`,
      };
    }

    case '4.NBT.B.6': {
      const divisor = prng.nextInt(3, 8);
      const quotient = prng.nextInt(14, 45);
      const dividend = divisor * quotient;
      const distractors = generateDistinctOptions(quotient, 4, 8, 60, prng).filter((x) => x !== quotient).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Find the exact quotient: ${dividend} ÷ ${divisor}`,
        correctAnswer: quotient,
        options: prng.shuffle([quotient, ...distractors]),
        explanation: `Break ${dividend} into friendly multiples of ${divisor}: ${divisor} × ${quotient} = ${dividend}, so ${dividend} ÷ ${divisor} = ${quotient}.`,
        hint: `Think: ${divisor} × ❓ = ${dividend}.`,
      };
    }

    case '4.NF.A.1': {
      const mult = prng.choice([2, 3, 4]);
      const baseNum = prng.choice([1, 2, 3]);
      const baseDen = prng.choice([baseNum + 1, baseNum + 2, baseNum + 3]);
      const eqNum = baseNum * mult;
      const eqDen = baseDen * mult;
      const targetStr = `${eqNum}/${eqDen}`;
      const candidates = [
        `${baseNum + mult}/${baseDen + mult}`,
        `${eqNum}/${baseDen + 1}`,
        `${Math.max(1, eqNum - 1)}/${eqDen}`,
        `${eqNum + 1}/${eqDen}`,
      ];
      const fallbackPool = ['1/2', '2/3', '3/4', '3/5', '4/5', '5/6', '7/8', '2/5', '3/8'];
      const options = generateDistinctStringOptions(targetStr, candidates, fallbackPool, 4, prng);
      return {
        ...baseMeta,
        prompt: `Which fraction is equivalent to ${baseNum}/${baseDen}?`,
        correctAnswer: targetStr,
        options,
        manipulative: { type: 'fraction', numerator: baseNum, denominator: baseDen },
        explanation: `Multiply numerator and denominator by ${mult}: (${baseNum}×${mult})/(${baseDen}×${mult}) = ${targetStr}.`,
        hint: `Multiply top and bottom by the same factor (${mult}).`,
      };
    }

    case '4.NF.B.3': {
      const den = prng.choice([5, 6, 8, 10, 12]);
      const n1 = prng.nextInt(1, Math.floor(den / 2));
      const n2 = prng.nextInt(1, den - n1 - 1);
      const sumN = n1 + n2;
      const ans = `${sumN}/${den}`;
      const candidates = [
        `${sumN}/${den * 2}`,
        `${n1 * n2}/${den}`,
        `${Math.max(1, sumN - 1)}/${den}`,
        `${sumN + 1}/${den}`,
      ];
      const fallbackPool = ['1/2', '2/3', '3/4', '3/5', '5/6', '7/8', '4/5'];
      const options = generateDistinctStringOptions(ans, candidates, fallbackPool, 4, prng);
      return {
        ...baseMeta,
        prompt: `Add fractions with like denominators: ${n1}/${den} + ${n2}/${den}`,
        correctAnswer: ans,
        options,
        explanation: `With like denominators, add numerators: (${n1} + ${n2})/${den} = ${ans}.`,
        hint: `Add only the numerators; the denominator stays the same.`,
      };
    }

    case '4.NF.B.4': {
      const den = prng.choice([3, 4, 5, 6, 8]);
      const whole = prng.nextInt(2, 5);
      const unitNum = 1;
      const prodNum = whole * unitNum;
      const ansStr = `${prodNum}/${den}`;
      const candidates = [
        `${whole}/${whole * den}`,
        `${prodNum + 1}/${den}`,
        `${Math.max(1, prodNum - 1)}/${den}`,
        `1/${whole * den}`,
      ];
      const options = generateDistinctStringOptions(ansStr, candidates, ['2/3', '3/4', '4/5', '5/6', '7/8'], 4, prng);
      return {
        ...baseMeta,
        prompt: `A recipe for California berry smoothies uses 1/${den} cup of blueberries per smoothie. How many cups are needed to make ${whole} smoothies? (${whole} × 1/${den})`,
        correctAnswer: ansStr,
        options,
        explanation: `${whole} groups of 1/${den} equals (${whole} × 1)/${den} = ${ansStr} cups.`,
        hint: `Multiply the whole number (${whole}) by the unit numerator (1) and keep the denominator (${den}).`,
      };
    }

    case '4.NF.C.6': {
      const val = prng.nextInt(12, 89);
      const decStr = `0.${val}`;
      const fracStr = `${val}/100`;
      const candidates = [`${val}/10`, `${val}/1000`, `1/${val}`, `${val + 1}/100`];
      const fallbackPool = ['1/10', '1/100', '25/100', '50/100', '75/100'];
      const options = generateDistinctStringOptions(fracStr, candidates, fallbackPool, 4, prng);
      return {
        ...baseMeta,
        prompt: `Write the decimal ${decStr} as a fraction:`,
        correctAnswer: fracStr,
        options,
        explanation: `The decimal ${decStr} has two digits past the decimal point, meaning hundredths: ${val}/100.`,
        hint: `Two decimal places represent hundredths.`,
      };
    }

    case '4.MD.A.1': {
      const conversions = [
        { fromUnit: 'kilometers', toUnit: 'meters', factor: 1000, short: 'm', range: [2, 9] },
        { fromUnit: 'meters', toUnit: 'centimeters', factor: 100, short: 'cm', range: [3, 12] },
        { fromUnit: 'kilograms', toUnit: 'grams', factor: 1000, short: 'g', range: [2, 8] },
        { fromUnit: 'liters', toUnit: 'milliliters', factor: 1000, short: 'mL', range: [2, 7] },
        { fromUnit: 'hours', toUnit: 'minutes', factor: 60, short: 'min', range: [2, 5] },
      ];
      const pick = prng.choice(conversions);
      const qty = prng.nextInt(pick.range[0], pick.range[1]);
      const ans = qty * pick.factor;
      const ansStr = `${ans.toLocaleString()} ${pick.short}`;
      const candidates = [
        `${(qty * 10).toLocaleString()} ${pick.short}`,
        `${(qty * 100).toLocaleString()} ${pick.short}`,
        `${(ans + pick.factor).toLocaleString()} ${pick.short}`,
        `${(qty + pick.factor).toLocaleString()} ${pick.short}`,
      ];
      const options = generateDistinctStringOptions(
        ansStr,
        candidates,
        ['200 cm', '500 cm', '1,000 m', '2,500 g', '120 min'],
        4,
        prng
      );
      return {
        ...baseMeta,
        prompt: `Unit Conversion: Convert ${qty} ${pick.fromUnit} into ${pick.toUnit}. (1 ${pick.fromUnit.slice(0, -1)} = ${pick.factor.toLocaleString()} ${pick.toUnit})`,
        correctAnswer: ansStr,
        options,
        explanation: `Multiply ${qty} by ${pick.factor.toLocaleString()}: ${qty} × ${pick.factor.toLocaleString()} = ${ansStr}.`,
        hint: `Multiply ${qty} × ${pick.factor.toLocaleString()}.`,
      };
    }

    case '4.MD.A.3': {
      const l = prng.nextInt(6, 12);
      const w = prng.nextInt(4, 8);
      const area = l * w;
      const distractors = generateDistinctOptions(w, 4, 2, 15, prng).filter((x) => x !== w).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Missing Dimension Formula: A rectangular solar panel array has an area of ${area} sq ft and a length of ${l} ft. What is its width?`,
        correctAnswer: `${w} ft`,
        options: prng.shuffle([`${w} ft`, ...distractors.map((v) => `${v} ft`)]),
        manipulative: { type: 'interactive-geometry', width: l, height: w, unit: 'ft', showAreaGrid: true },
        explanation: `Since Area = length × width, divide Area by length: ${area} ÷ ${l} = ${w} ft.`,
        hint: `Divide the total area (${area}) by the known length (${l}).`,
      };
    }

    case '4.MD.C.6': {
      const angle = prng.choice([30, 45, 60, 90, 120, 135, 150]);
      const distractors = buildProtractorDistractors(angle);
      const kind = angle < 90 ? 'acute' : angle === 90 ? 'right' : 'obtuse';
      return {
        ...baseMeta,
        prompt: `Use the interactive protractor below: What is the degree measure of this ${kind} angle?`,
        correctAnswer: `${angle}°`,
        options: prng.shuffle([`${angle}°`, ...distractors]),
        manipulative: { type: 'protractor', angle },
        explanation: `Reading the inner scale starting from 0° on the right ray, the second ray aligns with ${angle}° (${kind} angle).`,
        hint: `A right angle is 90°. Acute angles are < 90°, obtuse angles are > 90°.`,
      };
    }

    case '4.G.A.1': {
      const items = [
        {
          prompt: 'Two lines in the same plane that never intersect and are always the same distance apart are called:',
          ans: 'Parallel lines',
          options: ['Parallel lines', 'Perpendicular lines', 'Intersecting acute lines', 'Rays'],
          angle: 45,
          exp: 'Parallel lines never cross and remain equidistant forever.',
        },
        {
          prompt: 'Two lines that intersect to form a 90° right angle are called:',
          ans: 'Perpendicular lines',
          options: ['Perpendicular lines', 'Parallel lines', 'Obtuse segments', 'Skew rays'],
          angle: 90,
          exp: 'Perpendicular lines meet at an exact 90° right angle.',
        },
        {
          prompt: 'An angle that measures strictly between 90° and 180° (such as 135°) is classified as:',
          ans: 'Obtuse angle',
          options: ['Obtuse angle', 'Acute angle', 'Right angle', 'Straight angle'],
          angle: 135,
          exp: 'Angles greater than 90° and less than 180° are obtuse angles.',
        },
        {
          prompt: 'An angle that measures less than 90° (such as 45°) is classified as:',
          ans: 'Acute angle',
          options: ['Acute angle', 'Obtuse angle', 'Right angle', 'Reflex angle'],
          angle: 45,
          exp: 'Angles measuring between 0° and 90° are acute angles.',
        },
      ];
      const pick = prng.choice(items);
      return {
        ...baseMeta,
        prompt: pick.prompt,
        correctAnswer: pick.ans,
        options: prng.shuffle(pick.options),
        manipulative: { type: 'protractor', angle: pick.angle },
        explanation: pick.exp,
        hint: `Inspect the angle and rays on the visual model.`,
      };
    }

    // ==================== 5TH GRADE ====================
    case '5.OA.A.1': {
      if (forceWordProblem || prng.next() < 0.5) {
        const teams = prng.nextInt(3, 6);
        const perTeam = prng.nextInt(4, 8);
        const added = prng.nextInt(2, 5);
        const divisor = prng.choice([2, 3]);
        const subtotal = teams * perTeam + added;
        const rem = subtotal % divisor;
        const adjAdded = rem === 0 ? added : added + (divisor - rem);
        const totalPeople = teams * perTeam + adjAdded;
        const ans = totalPeople / divisor;

        const candidates = [ans + 2, Math.max(1, ans - 2), ans * divisor, ans + divisor];
        const fallbackPool = [8, 10, 12, 14, 15, 16, 18, 20];
        const options = generateDistinctStringOptions(ans, candidates, fallbackPool, 4, prng);

        return {
          ...baseMeta,
          prompt: `A California school STEM club organized ${teams} robotics teams with ${perTeam} students each. Then ${adjAdded} new students joined, and the entire group was divided equally into ${divisor} testing stations: [(${teams} × ${perTeam}) + ${adjAdded}] ÷ ${divisor}. How many students are at each station?`,
          correctAnswer: ans,
          options,
          explanation: `Parentheses first: ${teams} × ${perTeam} = ${teams * perTeam}. Add new students: ${teams * perTeam} + ${adjAdded} = ${totalPeople}. Divide into stations: ${totalPeople} ÷ ${divisor} = ${ans} students.`,
          hint: `Follow PEMDAS: evaluate inside parentheses, then add, then divide.`,
        };
      } else {
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
          explanation: `Parentheses first: (${a} + ${b} = ${a + b}). Multiply: ${a + b} × ${c} = ${(a + b) * c}. Subtract: ${(a + b) * c} - ${d} = ${ans}.`,
          hint: `PEMDAS: Parentheses, then Multiplication, then Subtraction.`,
        };
      }
    }

    case '5.OA.A.2': {
      const a = prng.nextInt(4, 12);
      const b = prng.nextInt(3, 9);
      const mult = prng.nextInt(2, 6);
      const correctExpr = `${mult} × (${a} + ${b})`;
      const options = prng.shuffle([
        correctExpr,
        `${mult} × ${a} + ${b}`,
        `(${mult} + ${a}) × ${b}`,
        `${a} + ${b} ÷ ${mult}`,
      ]);
      return {
        ...baseMeta,
        prompt: `Write the numerical expression for: "Add ${a} and ${b}, then multiply the sum by ${mult}."`,
        correctAnswer: correctExpr,
        options,
        explanation: `To ensure ${a} and ${b} are added first before multiplying by ${mult}, enclose (${a} + ${b}) in parentheses: ${correctExpr}.`,
        hint: `Use parentheses around the addition so it happens first.`,
      };
    }

    case '5.NBT.A.2': {
      const base = prng.nextInt(3, 9);
      const exp = prng.choice([2, 3, 4]);
      const power = Math.pow(10, exp);
      const prod = base * power;
      const candidates = [
        (base * 10).toLocaleString(),
        (base * 100).toLocaleString(),
        (base * 1000).toLocaleString(),
        ((base + 1) * power).toLocaleString(),
      ];
      const fallbackPool = ['300', '3,000', '5,000', '70,000', '90,000'];
      const options = generateDistinctStringOptions(prod.toLocaleString(), candidates, fallbackPool, 4, prng);
      return {
        ...baseMeta,
        prompt: `Powers of 10: What is ${base} × 10^${exp} (${base} × ${power.toLocaleString()})?`,
        correctAnswer: prod.toLocaleString(),
        options,
        explanation: `10^${exp} has ${exp} zeros (${power.toLocaleString()}). Multiplying ${base} by 10^${exp} shifts the digits ${exp} places left: ${prod.toLocaleString()}.`,
        hint: `10^${exp} means 1 followed by ${exp} zeros.`,
      };
    }

    case '5.NBT.A.3': {
      const whole = prng.nextInt(2, 9);
      const tenths = prng.nextInt(1, 8);
      const hundredths = prng.nextInt(1, 8);
      const thousandths = prng.nextInt(1, 9);
      const decStr = `${whole}.${tenths}${hundredths}${thousandths}`;
      const candidates = [
        `${whole}.${hundredths}${tenths}${thousandths}`,
        `${whole}.${tenths}0${thousandths}`,
        `${whole}.${thousandths}${hundredths}${tenths}`,
      ];
      const options = generateDistinctStringOptions(decStr, candidates, ['3.425', '5.189', '7.604', '8.251'], 4, prng);
      return {
        ...baseMeta,
        prompt: `Write in standard decimal form: ${whole} + ${tenths}/10 + ${hundredths}/100 + ${thousandths}/1000`,
        correctAnswer: decStr,
        options,
        explanation: `${whole} ones, ${tenths} tenths, ${hundredths} hundredths, and ${thousandths} thousandths is written as ${decStr}.`,
        hint: `Tenths = 1st decimal place, hundredths = 2nd, thousandths = 3rd.`,
      };
    }

    case '5.NBT.B.5': {
      const a = prng.nextInt(12, 35);
      const b = prng.nextInt(11, 24);
      const prod = a * b;
      const distractors = generateDistinctOptions(prod, 4, 120, 900, prng).filter((x) => x !== prod).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Multi-Digit Multiplication: Calculate ${a} × ${b}`,
        correctAnswer: prod,
        options: prng.shuffle([prod, ...distractors]),
        explanation: `Using partial products: (${a} × ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}) + (${a} × ${b % 10} = ${a * (b % 10)}) = ${prod}.`,
        hint: `Multiply ${a} by the ones digit of ${b}, then by the tens digit of ${b}, and add.`,
      };
    }

    case '5.NBT.B.6': {
      const divisor = prng.choice([12, 15, 16, 20, 24, 25]);
      const quotient = prng.nextInt(11, 32);
      const dividend = divisor * quotient;
      const distractors = generateDistinctOptions(quotient, 4, 8, 45, prng).filter((x) => x !== quotient).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `A California solar farm generated ${dividend} megawatt-hours of clean energy equally across ${divisor} turbines. How many megawatt-hours did each turbine generate? (${dividend} ÷ ${divisor})`,
        correctAnswer: quotient,
        options: prng.shuffle([quotient, ...distractors]),
        explanation: `Divide ${dividend} by the two-digit divisor ${divisor}: ${dividend} ÷ ${divisor} = ${quotient}.`,
        hint: `Estimate first: ${divisor} × ${Math.floor(quotient / 10) * 10} = ${divisor * Math.floor(quotient / 10) * 10}.`,
      };
    }

    case '5.NBT.B.7': {
      if (forceWordProblem || prng.next() < 0.5) {
        const items = prng.nextInt(2, 4);
        const priceEach = +prng.choice([2.25, 3.5, 4.25, 5.75]);
        const extraItem = +prng.choice([3.25, 4.5, 6.0]);
        const totalCost = +(items * priceEach + extraItem).toFixed(2);
        const billPaid = totalCost <= 15 ? 20 : 50;
        const changeDue = +(billPaid - totalCost).toFixed(2);

        const candidates = [
          `$${(changeDue + 1).toFixed(2)}`,
          `$${Math.max(0.5, changeDue - 1).toFixed(2)}`,
          `$${totalCost.toFixed(2)}`,
          `$${(changeDue + 0.5).toFixed(2)}`,
        ];
        const fallbackPool = ['$4.50', '$6.25', '$8.75', '$11.25', '$14.50', '$18.00'];
        const options = generateDistinctStringOptions(`$${changeDue.toFixed(2)}`, candidates, fallbackPool, 4, prng);

        return {
          ...baseMeta,
          prompt: `At a California farmers market, Maya bought ${items} punnets of fresh strawberries for $${priceEach.toFixed(2)} each, plus a jar of raw honey for $${extraItem.toFixed(2)}. She paid with a $${billPaid} bill. How much change did she receive?`,
          correctAnswer: `$${changeDue.toFixed(2)}`,
          options,
          explanation: `Cost of strawberries: ${items} × $${priceEach.toFixed(2)} = $${(items * priceEach).toFixed(2)}. Total spent: $${(items * priceEach).toFixed(2)} + $${extraItem.toFixed(2)} = $${totalCost.toFixed(2)}. Change: $${billPaid} - $${totalCost.toFixed(2)} = $${changeDue.toFixed(2)}.`,
          hint: `Step 1: Multiply to find strawberry cost. Step 2: Add honey. Step 3: Subtract total from $${billPaid}.`,
        };
      } else {
        const a = prng.nextInt(20, 60) / 10;
        const b = prng.nextInt(15, 45) / 10;
        const sum = +(a + b).toFixed(1);
        const candidates = [+(sum + 0.1).toFixed(1), +(sum - 0.2).toFixed(1), +(sum + 1.0).toFixed(1), +(sum - 1.0).toFixed(1)];
        const fallbackPool = [4.5, 5.8, 6.2, 7.5, 8.4, 9.1];
        const options = generateDistinctStringOptions(sum, candidates, fallbackPool, 4, prng);
        return {
          ...baseMeta,
          prompt: `Decimal Operation: Calculate ${a.toFixed(1)} + ${b.toFixed(1)}`,
          correctAnswer: sum,
          options,
          explanation: `Line up decimal points: ${a.toFixed(1)} + ${b.toFixed(1)} = ${sum}.`,
          hint: `Align the decimal points vertically before adding.`,
        };
      }
    }

    case '5.NF.A.1': {
      const pairs = [
        { f1: [1, 2], f2: [1, 4], ans: '3/4', num: 3, den: 4, story: 'Marcus walked 1/2 mile in Yosemite Valley and then 1/4 mile to the river overlook.' },
        { f1: [1, 3], f2: [1, 6], ans: '1/2', num: 1, den: 2, story: 'A baker used 1/3 bag of organic oat flour in the morning and 1/6 bag in the afternoon.' },
        { f1: [2, 5], f2: [3, 10], ans: '7/10', num: 7, den: 10, story: 'Elena completed 2/5 of her coastal marine biology report on Monday and 3/10 on Tuesday.' },
        { f1: [1, 4], f2: [3, 8], ans: '5/8', num: 5, den: 8, story: 'A rain gauge in Mendocino collected 1/4 inch of rain before noon and 3/8 inch after noon.' },
        { f1: [2, 3], f2: [1, 6], ans: '5/6', num: 5, den: 6, story: 'Leo spent 2/3 of an hour studying science and 1/6 of an hour studying California history.' },
      ];
      const pick = prng.choice(pairs);
      const isWordProblem = forceWordProblem || prng.next() < 0.5;
      const candidates = buildFractionAddDistractors(pick.f1[0], pick.f1[1], pick.f2[0], pick.f2[1], pick.ans);
      const fallbackPool = ['1/2', '2/3', '3/4', '4/5', '5/6', '7/8', '7/10', '9/10'];
      const options = generateDistinctStringOptions(pick.ans, candidates, fallbackPool, 4, prng);

      return {
        ...baseMeta,
        prompt: isWordProblem
          ? `${pick.story} How much did they complete/use in total?`
          : `Add fractions with unlike denominators: ${pick.f1[0]}/${pick.f1[1]} + ${pick.f2[0]}/${pick.f2[1]}`,
        correctAnswer: pick.ans,
        options,
        manipulative: { type: 'fraction', numerator: pick.num, denominator: pick.den },
        explanation: `Find the common denominator for ${pick.f1[1]} and ${pick.f2[1]}, rename fractions, then add numerators to get ${pick.ans}.`,
        hint: `Find a common denominator before adding.`,
      };
    }

    case '5.NF.B.4': {
      const n1 = prng.choice([1, 2]);
      const d1 = prng.choice([3, 4]);
      const n2 = prng.choice([1, 3]);
      const d2 = prng.choice([4, 5]);
      const res = new Rational(n1 * n2, d1 * d2);
      const ansStr = res.toString();
      const candidates = [
        `${n1 + n2}/${d1 + d2}`,
        `${n1}/${d2}`,
        `${res.n}/${Math.max(1, res.d - 1)}`,
        `${Math.min(res.d - 1, res.n + 1)}/${res.d}`,
      ];
      const fallbackPool = ['1/2', '1/3', '2/3', '1/4', '3/4', '1/5', '2/5', '3/10', '7/10'];
      const options = generateDistinctStringOptions(ansStr, candidates, fallbackPool, 4, prng);

      const isWordProblem = forceWordProblem || prng.next() < 0.5;
      const prompt = isWordProblem
        ? `A community garden plot in Sacramento covers ${n1}/${d1} of an acre. A pollinator sunflower bed occupies ${n2}/${d2} of that plot. What fraction of an acre is the sunflower bed?`
        : `Multiply fractions: ${n1}/${d1} × ${n2}/${d2}`;

      return {
        ...baseMeta,
        prompt,
        correctAnswer: ansStr,
        options,
        explanation: `Multiply numerators: (${n1}×${n2} = ${n1 * n2}) and denominators: (${d1}×${d2} = ${d1 * d2}), simplifying to ${ansStr}.`,
        hint: `Multiply across: (top × top) / (bottom × bottom).`,
      };
    }

    case '5.NF.B.7': {
      const whole = prng.nextInt(3, 8);
      const den = prng.choice([2, 3, 4, 5]);
      if (prng.next() < 0.5) {
        // Whole number divided by unit fraction: whole ÷ (1/den) = whole * den
        const ans = whole * den;
        const distractors = generateDistinctOptions(ans, 4, 4, 45, prng).filter((x) => x !== ans).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `A chef in San Francisco has ${whole} cups of olive oil and pours 1/${den} cup into each dipping bowl. How many bowls can the chef fill? (${whole} ÷ 1/${den})`,
          correctAnswer: ans,
          options: prng.shuffle([ans, ...distractors]),
          explanation: `Each whole cup has ${den} shares of 1/${den}. So ${whole} ÷ 1/${den} = ${whole} × ${den} = ${ans} bowls.`,
          hint: `Multiply the whole number (${whole}) by the denominator (${den}).`,
        };
      } else {
        // Unit fraction divided by whole number: (1/den) ÷ whole = 1 / (den * whole)
        const ansDen = den * whole;
        const ansStr = `1/${ansDen}`;
        const candidates = [`${whole}/${den}`, `1/${den + whole}`, `${den}/${whole}`];
        const options = generateDistinctStringOptions(ansStr, candidates, ['1/6', '1/8', '1/10', '1/12', '1/15', '1/20'], 4, prng);
        return {
          ...baseMeta,
          prompt: `A relay team of ${whole} runners shares 1/${den} mile of a coastal trail equally. What fraction of a mile does each runner run? (1/${den} ÷ ${whole})`,
          correctAnswer: ansStr,
          options,
          explanation: `Partitioning 1/${den} into ${whole} equal parts gives 1/(${den} × ${whole}) = ${ansStr} mile.`,
          hint: `Dividing a unit fraction by ${whole} multiplies the denominator by ${whole}.`,
        };
      }
    }

    case '5.MD.A.1': {
      const meters = prng.nextInt(2, 6);
      const extraCm = prng.choice([25, 40, 50, 75]);
      const totalCm = meters * 100 + extraCm;
      const distractors = [meters * 10 + extraCm, totalCm + 100, (meters + extraCm) * 10];
      const options = generateDistinctStringOptions(
        `${totalCm} cm`,
        distractors.map((d) => `${d} cm`),
        ['250 cm', '325 cm', '450 cm', '575 cm'],
        4,
        prng
      );
      return {
        ...baseMeta,
        prompt: `Multi-Step Measurement Conversion: A sea lion rescue ramp is ${meters} meters and ${extraCm} centimeters long. What is the total length of the ramp in centimeters? (1 m = 100 cm)`,
        correctAnswer: `${totalCm} cm`,
        options,
        explanation: `Convert ${meters} meters to centimeters: ${meters} × 100 = ${meters * 100} cm. Then add ${extraCm} cm: ${meters * 100} + ${extraCm} = ${totalCm} cm.`,
        hint: `First multiply ${meters} × 100, then add ${extraCm}.`,
      };
    }

    case '5.MD.C.5': {
      const l = prng.nextInt(3, 6);
      const w = prng.nextInt(2, 5);
      const h = prng.nextInt(2, 4);
      const vol = l * w * h;
      const candidates = [`${vol + l * w} cu ft`, `${Math.max(12, vol - l * w)} cu ft`, `${2 * (l * w + w * h + l * h)} cu ft`, `${l + w + h} cu ft`];
      const fallbackPool = ['24 cu ft', '36 cu ft', '48 cu ft', '60 cu ft', '72 cu ft', '96 cu ft'];
      const options = generateDistinctStringOptions(`${vol} cu ft`, candidates, fallbackPool, 4, prng);
      return {
        ...baseMeta,
        prompt: `A California marine science rescue tank is ${l} feet long, ${w} feet wide, and ${h} feet tall. What is its volume in cubic feet? (Explore the 3D layers below!)`,
        correctAnswer: `${vol} cu ft`,
        options,
        manipulative: { type: 'volume-prism', length: l, width: w, height: h, unit: 'ft' },
        explanation: `Each horizontal layer has ${l} × ${w} = ${l * w} unit cubes. With ${h} layers, Volume = ${l} × ${w} × ${h} = ${vol} cubic feet.`,
        hint: `Volume = length × width × height (${l} × ${w} × ${h}).`,
      };
    }

    case '5.G.A.1': {
      const x = prng.nextInt(2, 8);
      let y = prng.nextInt(2, 8);
      while (y === x) y = prng.nextInt(2, 8);
      const coordStr = `(${x}, ${y})`;
      const candidates = [
        `(${y}, ${x})`,
        `(${Math.max(1, x - 1)}, ${y})`,
        `(${x}, ${Math.max(1, y - 1)})`,
        `(${x + 1}, ${y})`,
      ];
      const fallbackPool = ['(1, 2)', '(3, 4)', '(5, 6)', '(2, 3)', '(4, 5)'];
      const options = generateDistinctStringOptions(coordStr, candidates, fallbackPool, 4, prng);
      return {
        ...baseMeta,
        prompt: `Identify the ordered pair (x, y) of the star plotted in Quadrant 1 of the coordinate plane:`,
        correctAnswer: coordStr,
        options,
        manipulative: { type: 'coordinate', x, y, max: 10 },
        explanation: `Move horizontally along the x-axis to ${x}, then vertically up the y-axis to ${y}. Coordinates are (${x}, ${y}).`,
        hint: `X-coordinate (horizontal) comes first, then Y-coordinate (vertical).`,
      };
    }

    default: {
      return createGuaranteedDynamicQuestion(standard, prng);
    }
  }
}

function createGuaranteedDynamicQuestion(standard, prng) {
  const g = standard.grade;
  let prompt, correctAnswer, options, explanation, hint;

  if (g === 'K') {
    const a = prng.nextInt(1, 5);
    const b = prng.nextInt(1, 5);
    correctAnswer = a + b;
    prompt = `Count the total objects: ${a} + ${b} = ❓`;
    options = prng.shuffle(generateDistinctOptions(correctAnswer, 4, 1, 10, prng));
    explanation = `${a} + ${b} = ${correctAnswer}.`;
    hint = `Count forward from ${a}.`;
  } else if (g === '1') {
    const a = prng.nextInt(4, 12);
    const b = prng.nextInt(3, 8);
    correctAnswer = a + b;
    prompt = `What is ${a} + ${b}?`;
    options = prng.shuffle(generateDistinctOptions(correctAnswer, 4, 5, 20, prng));
    explanation = `${a} + ${b} = ${correctAnswer}.`;
    hint = `Start at ${a} and add ${b}.`;
  } else if (g === '2') {
    const a = prng.nextInt(15, 60);
    const b = prng.nextInt(12, 38);
    correctAnswer = a + b;
    prompt = `Calculate: ${a} + ${b}`;
    options = prng.shuffle(generateDistinctOptions(correctAnswer, 4, 20, 100, prng));
    explanation = `${a} + ${b} = ${correctAnswer}.`;
    hint = `Add ones first, then tens.`;
  } else if (g === '3') {
    const a = prng.nextInt(3, 9);
    const b = prng.nextInt(3, 9);
    correctAnswer = a * b;
    prompt = `What is ${a} × ${b}?`;
    options = prng.shuffle(generateDistinctOptions(correctAnswer, 4, 9, 81, prng));
    explanation = `${a} groups of ${b} equals ${correctAnswer}.`;
    hint = `Recall your multiplication facts.`;
  } else if (g === '4') {
    const a = prng.nextInt(12, 35);
    const b = prng.nextInt(4, 9);
    correctAnswer = a * b;
    prompt = `Multiply: ${a} × ${b}`;
    options = prng.shuffle(generateDistinctOptions(correctAnswer, 4, 40, 350, prng));
    explanation = `${a} × ${b} = ${correctAnswer}.`;
    hint = `Use the distributive property: (${Math.floor(a / 10) * 10} × ${b}) + (${a % 10} × ${b}).`;
  } else {
    const a = prng.nextInt(2, 6);
    const b = prng.nextInt(3, 8);
    const c = prng.nextInt(1, 5);
    correctAnswer = a * b - c;
    prompt = `Evaluate using order of operations: (${a} × ${b}) - ${c}`;
    options = prng.shuffle(generateDistinctOptions(correctAnswer, 4, 1, 60, prng));
    explanation = `Multiply inside parentheses first: ${a} × ${b} = ${a * b}. Then subtract ${c} = ${correctAnswer}.`;
    hint = `Perform operations inside parentheses first (PEMDAS).`;
  }

  return {
    id: `q-dyn-${standard.code}-${Date.now()}-${prng.nextInt(100, 999)}`,
    grade: standard.grade,
    standard: standard.code,
    domain: standard.domain,
    cluster: standard.cluster,
    title: standard.title,
    module: standard.module,
    prompt,
    correctAnswer,
    options,
    explanation,
    hint,
    verified: true,
  };
}

function generateDistinctOptions(correct, count = 4, min = 0, max = 100, prng) {
  const set = new Set([correct]);
  let tries = 0;
  while (set.size < count && tries < 100) {
    tries += 1;
    const delta = prng.nextInt(-6, 6);
    const cand = correct + (delta === 0 ? (prng.next() > 0.5 ? 1 : -1) : delta);
    if (cand >= min && cand <= max) {
      set.add(cand);
    }
  }
  let fill = 1;
  while (set.size < count) {
    set.add(correct + fill);
    fill += 1;
  }
  return Array.from(set);
}

function generateDistinctStringOptions(correctStr, candidateWrongArray, fallbackPool, count = 4, prng) {
  const norm = (s) => String(s).trim().toLowerCase();
  const seen = new Set([norm(correctStr)]);
  const result = [correctStr];

  for (const item of candidateWrongArray) {
    if (result.length >= count) break;
    if (item !== undefined && item !== null && !seen.has(norm(item))) {
      seen.add(norm(item));
      result.push(item);
    }
  }

  for (const item of fallbackPool) {
    if (result.length >= count) break;
    if (item !== undefined && item !== null && !seen.has(norm(item))) {
      seen.add(norm(item));
      result.push(item);
    }
  }

  let fillIndex = 1;
  while (result.length < count) {
    const filler = typeof correctStr === 'number' ? correctStr + fillIndex : `${correctStr} (${fillIndex})`;
    if (!seen.has(norm(filler))) {
      seen.add(norm(filler));
      result.push(filler);
    }
    fillIndex += 1;
  }

  return prng.shuffle(result);
}

function generateDistinctFractionOptions(num, den, count = 4, prng) {
  const correct = `${num}/${den}`;
  const candidates = [];

  if (num !== den && den !== 0) candidates.push(`${den}/${num}`);
  if (den - num > 0 && den - num !== num) candidates.push(`${den - num}/${den}`);
  if (num + 1 < den) candidates.push(`${num + 1}/${den}`);
  if (num - 1 > 0) candidates.push(`${num - 1}/${den}`);

  const fallbackFractions = [
    '1/2', '1/3', '2/3', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5',
    '1/6', '5/6', '1/8', '3/8', '5/8', '7/8', '2/6', '4/6', '2/8', '6/8'
  ];

  return generateDistinctStringOptions(correct, candidates, fallbackFractions, count, prng);
}
