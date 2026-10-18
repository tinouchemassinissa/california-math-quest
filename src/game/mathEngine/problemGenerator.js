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
  '1.OA.A.1',
  '1.OA.C.6',
  '1.OA.D.8',
  '1.NBT.B.2',
  '1.MD.A.2',
  '1.MD.B.3',
  '1.G.A.3',
  '2.OA.A.1',
  '2.OA.C.4',
  '2.NBT.A.1',
  '2.NBT.A.2',
  '2.MD.B.5',
  '2.MD.C.7',
  '2.MD.C.8',
  '2.MD.D.10',
  '2.G.A.1',
  '3.OA.A.3',
  '3.OA.B.5',
  '3.OA.C.7',
  '3.OA.D.8',
  '3.NF.A.1',
  '3.NF.A.2',
  '3.NF.A.3',
  '3.MD.C.7',
  '3.MD.D.8',
  '3.G.A.1',
  '4.OA.A.2',
  '4.NF.A.1',
  '4.NF.A.2',
  '4.MD.A.3',
  '4.MD.C.6',
  '4.G.A.1',
  '5.NF.A.1',
  '5.MD.C.5',
  '5.G.A.1',
  '5.G.B.3',
]);

export const WORD_PROBLEM_STANDARDS = new Set([
  'K.OA.A.2',
  '1.OA.A.1',
  '1.MD.A.2',
  '2.OA.A.1',
  '2.MD.B.5',
  '2.MD.C.8',
  '2.MD.D.10',
  '3.OA.A.3',
  '3.OA.D.8',
  '3.MD.A.1',
  '3.MD.A.2',
  '3.MD.C.7',
  '3.MD.D.8',
  '4.OA.A.2',
  '4.OA.A.3',
  '4.NF.B.3',
  '4.NF.B.4',
  '4.MD.A.1',
  '4.MD.A.3',
  '5.OA.A.1',
  '5.NBT.B.6',
  '5.NBT.B.7',
  '5.NF.A.1',
  '5.NF.B.3',
  '5.NF.B.4',
  '5.NF.B.7',
  '5.MD.A.1',
  '5.MD.C.5',
  '5.G.A.1',
]);

/**
 * Assign official CAASPP (Smarter Balanced) Assessment Claim & Depth of Knowledge (DOK)
 */
function inferCaasppMetadata(standard, prompt = '') {
  const isWord =
    prompt.length > 68 ||
    /California|Cambrian|Bagby|Fammatre|Farnham|Sartorette|Steindorf|San Jose|Sierra|Redwood|Monterey|Yosemite|San Diego|Sacramento|Fresno|student|teacher|ranger|chef|market|library|solar|train|aquarium/i.test(
      prompt
    );
  if (isWord) {
    return {
      caasppClaim: 'Claim 2: Problem Solving & Modeling',
      dokLevel: standard.grade >= '3' ? 'DOK 2: Conceptual Application' : 'DOK 2: Skill & Concept',
    };
  }
  if (/why|explain|classify|true|always|equivalent|compare|expression|pattern|hierarchy/i.test(prompt)) {
    return {
      caasppClaim: 'Claim 3: Communicating Reasoning',
      dokLevel: 'DOK 2: Conceptual Reasoning',
    };
  }
  return {
    caasppClaim: 'Claim 1: Concepts & Procedures',
    dokLevel: 'DOK 1: Procedural Fluency',
  };
}

/**
 * Robust, Verified Mathematical Problem Generator
 * Every single standard in CA CCSS-M Grades K through 5 (82 standards) has a dedicated, verified generator
 * with multiple authentic California sub-templates.
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

  if (mode !== 'manipulatives') {
    try {
      const learned = getLearnedTemplates(grade, standard.code);
      if (learned && learned.length > 0 && prng.next() < 0.35) {
        const chosenTemplate = prng.choice(learned);
        const synthesized = synthesizeFromLearnedTemplate(chosenTemplate, prng);
        if (synthesized) {
          const check = verifyQuestion(synthesized);
          if (check.valid) {
            const meta = inferCaasppMetadata(standard, synthesized.prompt);
            return {
              ...meta,
              ...synthesized,
              seed: actualSeed,
              verified: true,
              verificationTimestamp: new Date().toISOString(),
            };
          }
        }
      }
    } catch {
      // Proceed seamlessly to procedural synthesis
    }
  }

  const forceWordProblem = mode === 'word-problems';

  for (let attempt = 0; attempt < maxVerificationAttempts; attempt += 1) {
    const rawQuestion = synthesizeQuestion(standard, prng, { forceWordProblem });
    const verification = verifyQuestion(rawQuestion);

    if (verification.valid) {
      const meta = inferCaasppMetadata(standard, rawQuestion.prompt);
      return {
        ...meta,
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
      const variant = prng.nextInt(1, 3);
      if (variant === 1) {
        const start = prng.choice([10, 20, 30, 40, 50, 60, 70]);
        const seq = [start, start + 10, start + 20];
        const next = start + 30;
        return {
          ...baseMeta,
          prompt: `Skip-counting forward by tens to 100: ${seq.join(', ')}, ❓`,
          correctAnswer: next,
          options: prng.shuffle(generateDistinctOptions(next, 4, 10, 100, prng)),
          explanation: `When counting forward by tens, add 10 to ${seq[seq.length - 1]}: ${seq[seq.length - 1]} + 10 = ${next}.`,
          hint: `Count by tens: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.`,
        };
      } else if (variant === 2) {
        const start = prng.nextInt(8, 85);
        const seq = [start, start + 1, start + 2];
        const next = start + 3;
        return {
          ...baseMeta,
          prompt: `What number comes next when counting by ones: ${seq.join(', ')}, ❓`,
          correctAnswer: next,
          options: prng.shuffle(generateDistinctOptions(next, 4, 1, 100, prng)),
          explanation: `Counting forward by ones adds 1 each time. After ${seq[seq.length - 1]} comes ${next}.`,
          hint: `Add 1 to ${seq[seq.length - 1]}.`,
        };
      } else {
        const start = prng.nextInt(15, 75);
        const missing = start + 1;
        return {
          ...baseMeta,
          prompt: `Find the missing number in the counting sequence: ${start}, ❓, ${start + 2}, ${start + 3}`,
          correctAnswer: missing,
          options: prng.shuffle(generateDistinctOptions(missing, 4, 10, 90, prng)),
          explanation: `${missing} is between ${start} and ${start + 2} when counting by ones.`,
          hint: `What number is 1 more than ${start}?`,
        };
      }
    }

    case 'K.CC.B.4': {
      const count = prng.nextInt(1, 10);
      const distractors = prng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((x) => x !== count)).slice(0, 3);
      return {
        ...baseMeta,
        prompt:
          count > 5
            ? `Cardinality & 5-Groups: The top row of the ten-frame has 5 dots and the bottom row has ${count - 5}. How many dots in all?`
            : `How many dots are shown inside the ten-frame below?`,
        correctAnswer: count,
        options: prng.shuffle([count, ...distractors]),
        manipulative: { type: 'ten-frame', count, total: 10 },
        explanation:
          count > 5
            ? `Using the 5-group structure: 5 on top + ${count - 5} on bottom = ${count} dots.`
            : `Counting each dot in the ten-frame gives ${count}.`,
        hint: `A full top row has 5 dots. Count on from 5 if there are dots in the bottom row.`,
      };
    }

    case 'K.CC.C.6': {
      const a = prng.nextInt(1, 10);
      let b = prng.nextInt(1, 10);
      while (b === a) b = prng.nextInt(1, 10);
      const askGreater = prng.next() > 0.5;
      const correct = askGreater ? Math.max(a, b) : Math.min(a, b);
      const distractors = generateDistinctOptions(correct, 4, 1, 12, prng).filter((x) => x !== correct).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Group A has ${a} acorns and Group B has ${b} acorns. Which number is ${askGreater ? 'GREATER (more)' : 'LESS (fewer)'}?`,
        correctAnswer: correct,
        options: prng.shuffle([correct, ...distractors]),
        explanation: `Comparing ${a} and ${b}: ${Math.max(a, b)} is greater than ${Math.min(a, b)}, so the ${askGreater ? 'greater' : 'lesser'} number is ${correct}.`,
        hint: `Think which number comes ${askGreater ? 'later' : 'earlier'} when counting.`,
      };
    }

    case 'K.OA.A.2': {
      const a = prng.nextInt(2, 6);
      const b = prng.nextInt(1, 10 - a);
      const isAdd = prng.next() > 0.45;
      if (isAdd) {
        const sum = a + b;
        const distractors = generateDistinctOptions(sum, 4, 1, 10, prng).filter((x) => x !== sum).slice(0, 3);
        const stories = [
          `In the Bagby Elementary garden, ${a} ladybugs are on a leaf and ${b} more fly over. How many ladybugs are there in all?`,
          `Monterey Bay rangers spotted ${a} sea otters floating in the kelp forest, and ${b} more swam over. How many sea otters are there in all?`,
          `Maya picked ${a} California golden poppies in the meadow and ${b} more by the trail. How many poppies did she pick altogether?`,
        ];
        return {
          ...baseMeta,
          prompt: prng.choice(stories),
          correctAnswer: sum,
          options: prng.shuffle([sum, ...distractors]),
          manipulative: { type: 'ten-frame', count: sum, groups: [a, b], total: 10 },
          explanation: `Put the two parts together (Number Bond ${a} and ${b}): ${a} + ${b} = ${sum}.`,
          hint: `Start at ${a} and count forward ${b} more.`,
        };
      } else {
        const total = a + b;
        const diff = total - a;
        const distractors = generateDistinctOptions(diff, 4, 0, 10, prng).filter((x) => x !== diff).slice(0, 3);
        const subStories = [
          `There were ${total} sweet oranges in the Sartorette Elementary snack basket. Students ate ${a} of them. How many oranges are left?`,
          `${total} quail were foraging on a Sierra Foothills trail. Then ${a} flew into the bushes. How many quail remain on the trail?`,
        ];
        return {
          ...baseMeta,
          prompt: prng.choice(subStories),
          correctAnswer: diff,
          options: prng.shuffle([diff, ...distractors]),
          manipulative: { type: 'ten-frame', count: total, removeCount: a, total: 10 },
          explanation: `Take apart ${a} from the whole of ${total}: ${total} - ${a} = ${diff}.`,
          hint: `Start with ${total} dots and cross out ${a}.`,
        };
      }
    }

    case 'K.OA.A.4': {
      const a = prng.nextInt(1, 9);
      const partner = 10 - a;
      const distractors = generateDistinctOptions(partner, 4, 1, 9, prng).filter((x) => x !== partner).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Friends of 10 (Number Bond): What number pairs with ${a} to make a full 10? (${a} + ❓ = 10)`,
        correctAnswer: partner,
        options: prng.shuffle([partner, ...distractors]),
        manipulative: { type: 'ten-frame', count: 10, groups: [a, partner], total: 10 },
        explanation: `A full ten-frame holds 10 dots. Since ${a} spaces are filled in the first group, 10 - ${a} = ${partner} more are needed to make 10.`,
        hint: `Count the green dots in the ten-frame that complete 10.`,
      };
    }

    case 'K.NBT.A.1': {
      const ones = prng.nextInt(1, 9);
      const teen = 10 + ones;
      if (prng.next() < 0.5) {
        const distractors = generateDistinctOptions(teen, 4, 11, 19, prng).filter((x) => x !== teen).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Teen Numbers as "10 Ones and Some More Ones": 10 ones and ${ones} extra ones compose what number? (10 + ${ones} = ❓)`,
          correctAnswer: teen,
          options: prng.shuffle([teen, ...distractors]),
          manipulative: { type: 'double-ten-frame', count: teen, firstFull: 10, secondCount: ones },
          explanation: `In the "Say Ten" way (Eureka Math), ten-${ones} is 10 + ${ones} = ${teen}.`,
          hint: `1 full ten-frame (10) plus ${ones} more ones equals ${teen}.`,
        };
      } else {
        const distractors = generateDistinctOptions(ones, 4, 1, 9, prng).filter((x) => x !== ones).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Decompose the teen number ${teen} into 10 ones and some further ones: ${teen} = 10 + ❓`,
          correctAnswer: ones,
          options: prng.shuffle([ones, ...distractors]),
          manipulative: { type: 'double-ten-frame', count: teen, firstFull: 10, secondCount: ones },
          explanation: `${teen} is composed of 1 ten (10 ones) and ${ones} extra ones: ${teen} = 10 + ${ones}.`,
          hint: `Look at the second ten-frame to see how many extra ones go with 10.`,
        };
      }
    }

    case 'K.MD.A.2': {
      const attributes = [
        { objA: 'Coastal Redwood Tree', objB: 'California Poppy', compare: 'TALLER', answer: 'Coastal Redwood Tree' },
        { objA: 'Hummingbird Feather', objB: 'Sierra Granite Boulder', compare: 'HEAVIER', answer: 'Sierra Granite Boulder' },
        { objA: 'Golden Gate Bridge', objB: 'Park Bench', compare: 'LONGER', answer: 'Golden Gate Bridge' },
        { objA: 'Pacific Gray Whale', objB: 'Sea Star', compare: 'LIGHTER', answer: 'Sea Star' },
        { objA: 'Swimming Pool', objB: 'Teacup', compare: 'HOLDS MORE WATER (Greater Capacity)', answer: 'Swimming Pool' },
      ];
      const pick = prng.choice(attributes);
      const options = prng.shuffle([pick.objA, pick.objB, 'Both are equal', 'Cannot be compared']);
      return {
        ...baseMeta,
        prompt: `Measurable Attributes: Which object is ${pick.compare} — a ${pick.objA} or a ${pick.objB}?`,
        correctAnswer: pick.answer,
        options,
        explanation: `Directly comparing measurable attributes (length, weight, or capacity): A ${pick.answer} is ${pick.compare.toLowerCase()}.`,
        hint: `Picture both objects in the real world and compare their size or weight.`,
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
        prompt: `How many straight sides and corners (vertices) does a ${pick.name.toLowerCase()} have? (Tap the corners on the shape below to count!)`,
        correctAnswer: pick.sides,
        options: prng.shuffle([pick.sides, ...distractors]),
        manipulative: { type: 'polygon-inspector', sides: pick.sides, shapeName: pick.name },
        explanation: `A ${pick.name.toLowerCase()} is a closed 2D shape with exactly ${pick.sides} straight sides and ${pick.sides} corners (vertices).`,
        hint: `Tap each orange corner on the ${pick.name.toLowerCase()} to count them.`,
      };
    }

    // ==================== 1ST GRADE ====================
    case '1.OA.A.1': {
      const a = prng.nextInt(6, 12);
      const b = prng.nextInt(4, 8);
      const sum = a + b;
      const variant = prng.nextInt(1, 3);
      if (variant === 1) {
        // Add To / Put Together
        const distractors = generateDistinctOptions(sum, 4, 7, 20, prng).filter((x) => x !== sum).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Redwood Explorers found ${a} pinecones on the morning hike and ${b} pinecones on the afternoon hike. How many pinecones did they find in all?`,
          correctAnswer: sum,
          options: prng.shuffle([sum, ...distractors]),
          manipulative: { type: 'tape-diagram', parts: [a, b], total: sum, unknownTotal: true },
          explanation: `Using the Tape Diagram part-part-whole model: ${a} + ${b} = ${sum} pinecones.`,
          hint: `Add the two parts together: ${a} + ${b}.`,
        };
      } else if (variant === 2) {
        // Take From
        const distractors = generateDistinctOptions(a, 4, 3, 18, prng).filter((x) => x !== a).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `There were ${sum} monarch butterflies resting on a eucalyptus branch in Pismo Beach. Then ${b} butterflies flew away. How many butterflies are left on the branch?`,
          correctAnswer: a,
          options: prng.shuffle([a, ...distractors]),
          manipulative: { type: 'tape-diagram', parts: [b, a], total: sum, unknownPartIndex: 1 },
          explanation: `Subtract the part that flew away from the total: ${sum} - ${b} = ${a} butterflies.`,
          hint: `Start with the total (${sum}) and subtract ${b}.`,
        };
      } else {
        // Compare ("How many more?")
        const bigger = Math.max(a, b) + 3;
        const smaller = Math.min(a, b);
        const diff = bigger - smaller;
        const distractors = generateDistinctOptions(diff, 4, 1, 15, prng).filter((x) => x !== diff).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Comparison Word Problem: Elena collected ${bigger} seashells at Coronado Beach, and Leo collected ${smaller} seashells. How many MORE seashells did Elena collect than Leo?`,
          correctAnswer: diff,
          options: prng.shuffle([diff, ...distractors]),
          manipulative: { type: 'tape-diagram', parts: [smaller, diff], total: bigger, unknownPartIndex: 1 },
          explanation: `To find how many more Elena collected, subtract: ${bigger} - ${smaller} = ${diff} more seashells.`,
          hint: `Find the difference: ${bigger} - ${smaller} = ❓.`,
        };
      }
    }

    case '1.OA.C.6': {
      const variant = prng.nextInt(1, 3);
      if (variant === 1) {
        // Make-a-Ten Addition within 20
        const a = prng.nextInt(6, 9);
        const b = prng.nextInt(4, 9);
        const sum = a + b;
        const needToTen = 10 - a;
        const rem = b - needToTen;
        const distractors = generateDistinctOptions(sum, 4, 10, 20, prng).filter((x) => x !== sum).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Make-a-Ten Strategy: Solve ${a} + ${b} by making 10 first (${a} + ${needToTen} + ${rem} = 10 + ${rem}).`,
          correctAnswer: sum,
          options: prng.shuffle([sum, ...distractors]),
          manipulative: { type: 'number-line', min: 0, max: 20, start: a, hop: b, target: sum },
          explanation: `Decompose ${b} into ${needToTen} and ${rem}. Make a ten: ${a} + ${needToTen} = 10, then 10 + ${rem} = ${sum}.`,
          hint: `10 + ${rem} = ${sum}.`,
        };
      } else {
        // Subtraction within 20 using Take-from-Ten
        const subtrahend = prng.nextInt(5, 9);
        const diff = prng.nextInt(4, 9);
        const minuend = subtrahend + diff;
        const distractors = generateDistinctOptions(diff, 4, 2, 16, prng).filter((x) => x !== diff).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Subtraction Fluency within 20: What is ${minuend} - ${subtrahend}?`,
          correctAnswer: diff,
          options: prng.shuffle([diff, ...distractors]),
          manipulative: { type: 'tape-diagram', parts: [subtrahend, diff], total: minuend, unknownPartIndex: 1 },
          explanation: `Using related addition or take-from-ten: Since ${subtrahend} + ${diff} = ${minuend}, ${minuend} - ${subtrahend} = ${diff}.`,
          hint: `Think addition: ${subtrahend} + ❓ = ${minuend}.`,
        };
      }
    }

    case '1.OA.D.8': {
      const a = prng.nextInt(4, 11);
      const b = prng.nextInt(3, 9);
      const sum = a + b;
      const variant = prng.nextInt(1, 3);
      if (variant === 1) {
        const distractors = generateDistinctOptions(b, 4, 1, 15, prng).filter((x) => x !== b).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Determine the unknown number that makes the equation true: ${a} + ❓ = ${sum}`,
          correctAnswer: b,
          options: prng.shuffle([b, ...distractors]),
          manipulative: { type: 'tape-diagram', parts: [a, b], total: sum, unknownPartIndex: 1 },
          explanation: `Subtract the known addend from the total: ${sum} - ${a} = ${b}.`,
          hint: `Think: ${sum} - ${a} = ❓.`,
        };
      } else if (variant === 2) {
        const distractors = generateDistinctOptions(b, 4, 1, 15, prng).filter((x) => x !== b).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Determine the unknown number in the subtraction equation: ${sum} - ❓ = ${a}`,
          correctAnswer: b,
          options: prng.shuffle([b, ...distractors]),
          manipulative: { type: 'tape-diagram', parts: [a, b], total: sum, unknownPartIndex: 1 },
          explanation: `If ${sum} minus a number leaves ${a}, then that number is ${sum} - ${a} = ${b}.`,
          hint: `${a} and what partner make ${sum}?`,
        };
      } else {
        const distractors = generateDistinctOptions(sum, 4, 8, 22, prng).filter((x) => x !== sum).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Find the unknown whole number in the equation: ❓ - ${b} = ${a}`,
          correctAnswer: sum,
          options: prng.shuffle([sum, ...distractors]),
          manipulative: { type: 'tape-diagram', parts: [b, a], total: sum, unknownTotal: true },
          explanation: `The unknown is the starting whole before subtracting ${b}. Add the parts: ${b} + ${a} = ${sum}.`,
          hint: `Add ${b} + ${a} to find the starting total.`,
        };
      }
    }

    case '1.NBT.B.2': {
      const tens = prng.nextInt(2, 8);
      const ones = prng.nextInt(1, 9);
      const val = tens * 10 + ones;
      const distractors = [ones * 10 + tens, val + 10, val - 10, val + 1].filter((x) => x !== val && x > 10);
      const options = generateDistinctStringOptions(val, distractors, [24, 37, 52, 68, 81], 4, prng);
      return {
        ...baseMeta,
        prompt: `Look at the Place Value Chart below: What two-digit number is represented by ${tens} tens and ${ones} ones?`,
        correctAnswer: val,
        options,
        manipulative: { type: 'place-value', hundreds: 0, tens, ones },
        explanation: `${tens} bundles of ten equal ${tens * 10}. Adding ${ones} ones gives ${tens * 10} + ${ones} = ${val}.`,
        hint: `Count the green 10-disks (${tens}) and yellow 1-disks (${ones}).`,
      };
    }

    case '1.NBT.B.3': {
      const a = prng.nextInt(15, 89);
      let b = prng.nextInt(15, 89);
      while (b === a) b = prng.nextInt(15, 89);
      const relation = a > b ? '>' : '<';
      return {
        ...baseMeta,
        prompt: `Compare the two-digit numbers using place value: ${a} ❓ ${b}`,
        correctAnswer: relation,
        options: ['>', '<', '=', '+'],
        explanation: `Compare the tens digits first (${Math.floor(a / 10)} tens vs ${Math.floor(b / 10)} tens), then ones if tens are equal: ${a} ${relation} ${b}.`,
        hint: `The open mouth of > or < always points to the greater number.`,
      };
    }

    case '1.NBT.C.5': {
      const base = prng.nextInt(2, 8) * 10 + prng.nextInt(1, 9);
      const isMore = prng.next() > 0.5;
      const target = isMore ? base + 10 : base - 10;
      const distractors = [isMore ? base - 10 : base + 10, isMore ? base + 1 : base - 1, target + 10].filter((x) => x !== target && x > 0);
      const options = generateDistinctStringOptions(target, distractors, [25, 35, 45, 55, 65], 4, prng);
      return {
        ...baseMeta,
        prompt: `Mental Place Value: Without counting by ones, what is 10 ${isMore ? 'MORE' : 'LESS'} than ${base}?`,
        correctAnswer: target,
        options,
        manipulative: { type: 'place-value', hundreds: 0, tens: Math.floor(base / 10), ones: base % 10 },
        explanation: `Adding or subtracting 1 ten changes only the tens digit: ${base} ${isMore ? '+ 10' : '- 10'} = ${target}.`,
        hint: `Increase or decrease the tens digit by 1; the ones digit (${base % 10}) stays the same.`,
      };
    }

    case '1.MD.A.2': {
      const lenA = prng.nextInt(5, 10);
      const lenB = prng.nextInt(3, 7);
      const total = lenA + lenB;
      const distractors = generateDistinctOptions(total, 4, 5, 19, prng).filter((x) => x !== total).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Iterating Centimeter Cubes: A California newt model is ${lenA} centimeter cubes long and a tree frog model is ${lenB} centimeter cubes long. Placed end-to-end with no gaps, how many centimeter cubes long are they together?`,
        correctAnswer: `${total} cm cubes`,
        options: prng.shuffle([`${total} cm cubes`, ...distractors.map((d) => `${d} cm cubes`)]),
        manipulative: { type: 'number-line', min: 0, max: 18, start: lenA, hop: lenB, target: total },
        explanation: `When measured end-to-end with no gaps or overlaps, the total length is ${lenA} + ${lenB} = ${total} cm cubes.`,
        hint: `Add the two lengths: ${lenA} + ${lenB}.`,
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
        prompt: `Read the analog clock below: What time is shown?`,
        correctAnswer: timeStr,
        options: prng.shuffle([timeStr, ...distractors]),
        manipulative: { type: 'clock', hour, minute },
        explanation: `The short hour hand points ${isHalf ? `halfway past ${hour}` : `to ${hour}`}, and the long minute hand points to ${minute === 0 ? '12 (:00 o\'clock)' : '6 (:30 half-past)'}. Time: ${timeStr}.`,
        hint: `Short hand = hour; Long hand at 12 = :00, at 6 = :30.`,
      };
    }

    case '1.G.A.3': {
      const parts = prng.choice([2, 4]);
      const word = parts === 2 ? 'halves' : 'fourths (quarters)';
      return {
        ...baseMeta,
        prompt: `Equal Shares: When a rectangle is partitioned into ${parts} equal shares, what is each share called?`,
        correctAnswer: word,
        options: prng.shuffle(['halves', 'fourths (quarters)', 'thirds', 'whole']),
        manipulative: { type: 'fraction', numerator: 1, denominator: parts },
        explanation: `Partitioning a whole into ${parts} equal parts creates ${word}. Decomposing into more equal shares creates smaller shares.`,
        hint: `2 equal shares = halves; 4 equal shares = fourths (quarters).`,
      };
    }

    // ==================== 2ND GRADE ====================
    case '2.OA.A.1': {
      const variant = prng.nextInt(1, 3);
      if (variant === 1) {
        // Two-step word problem
        const start = prng.nextInt(45, 75);
        const givenA = prng.nextInt(12, 20);
        const givenB = prng.nextInt(10, 18);
        const left = start - (givenA + givenB);
        const distractors = [start - givenA, givenA + givenB, left + 10].filter((x) => x !== left && x > 0);
        const options = generateDistinctStringOptions(left, distractors, [14, 18, 22, 26, 31], 4, prng);
        return {
          ...baseMeta,
          prompt: `Two-Step Word Problem: The Fammatre Elementary school garden in San Jose harvested ${start} cherry tomatoes. Students gave ${givenA} tomatoes to the cafeteria and ${givenB} tomatoes to a neighborhood pantry. How many tomatoes are left?`,
          correctAnswer: left,
          options,
          manipulative: { type: 'tape-diagram', parts: [givenA, givenB, left], total: start, unknownPartIndex: 2 },
          explanation: `Step 1: Add the tomatoes given away (${givenA} + ${givenB} = ${givenA + givenB}). Step 2: Subtract from the total (${start} - ${givenA + givenB} = ${left}).`,
          hint: `First add ${givenA} + ${givenB}, then subtract that sum from ${start}.`,
        };
      } else {
        const a = prng.nextInt(28, 56);
        const b = prng.nextInt(19, 38);
        const sum = a + b;
        const distractors = generateDistinctOptions(sum, 4, 40, 100, prng).filter((x) => x !== sum).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `During the California Coastal Cleanup Day, Team Otter collected ${a} items of beach litter and Team Pelican collected ${b} items. How many items did the two teams collect altogether?`,
          correctAnswer: sum,
          options: prng.shuffle([sum, ...distractors]),
          manipulative: { type: 'tape-diagram', parts: [a, b], total: sum, unknownTotal: true },
          explanation: `Combine the two parts: ${a} + ${b} = ${sum} items.`,
          hint: `Add tens and ones: ${a} + ${b}.`,
        };
      }
    }

    case '2.OA.B.2': {
      const a = prng.nextInt(7, 14);
      const b = prng.nextInt(6, 9);
      const isAdd = prng.next() < 0.5;
      if (isAdd) {
        const sum = a + b;
        const distractors = generateDistinctOptions(sum, 4, 11, 24, prng).filter((x) => x !== sum).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Mental Fluency within 20: What is ${a} + ${b}?`,
          correctAnswer: sum,
          options: prng.shuffle([sum, ...distractors]),
          explanation: `${a} + ${b} = ${sum}.`,
          hint: `Use doubles or make-a-ten to add mentally.`,
        };
      } else {
        const sum = a + b <= 20 ? a + b : 18;
        const sub = prng.nextInt(6, 9);
        const diff = sum - sub;
        const distractors = generateDistinctOptions(diff, 4, 2, 16, prng).filter((x) => x !== diff).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Mental Fluency within 20: What is ${sum} - ${sub}?`,
          correctAnswer: diff,
          options: prng.shuffle([diff, ...distractors]),
          explanation: `Since ${sub} + ${diff} = ${sum}, ${sum} - ${sub} = ${diff}.`,
          hint: `Think of the related addition fact: ${sub} + ❓ = ${sum}.`,
        };
      }
    }

    case '2.OA.C.3': {
      if (prng.next() < 0.5) {
        const half = prng.nextInt(3, 10);
        const evenNum = half * 2;
        const correctEq = `${half} + ${half} = ${evenNum}`;
        const options = prng.shuffle([
          correctEq,
          `${half - 1} + ${half + 1} = ${evenNum}`,
          `${half} + ${half + 1} = ${evenNum + 1}`,
          `${evenNum} + 0 = ${evenNum}`,
        ]);
        return {
          ...baseMeta,
          prompt: `Equal Addends (Doubles): Which equation shows that ${evenNum} is an EVEN number by expressing it as the sum of two equal addends?`,
          correctAnswer: correctEq,
          options,
          explanation: `An even number can be paired into two equal groups (doubles): ${half} + ${half} = ${evenNum}.`,
          hint: `Look for the equation where both addends are identical (${half} + ${half}).`,
        };
      } else {
        const num = prng.nextInt(5, 20);
        const ans = num % 2 === 0 ? 'Even' : 'Odd';
        return {
          ...baseMeta,
          prompt: `A teacher has ${num} pencils to share equally between 2 students with none left over. Is ${num} an Even or Odd number?`,
          correctAnswer: ans,
          options: ['Even', 'Odd', 'Both', 'Neither'],
          explanation: `${num} divided into pairs ${ans === 'Even' ? 'has 0 left over (Even)' : 'has 1 left over (Odd)'}.`,
          hint: `Even numbers end in 0, 2, 4, 6, or 8.`,
        };
      }
    }

    case '2.OA.C.4': {
      const rows = prng.nextInt(2, 5);
      const cols = prng.nextInt(2, 5);
      const total = rows * cols;
      const repeatedAdd = Array.from({ length: rows }, () => cols).join(' + ');
      const distractors = generateDistinctOptions(total, 4, 4, 25, prng).filter((x) => x !== total).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Rectangular Array & Repeated Addition: This array has ${rows} rows with ${cols} dots in each row (${repeatedAdd}). How many dots are in the array altogether?`,
        correctAnswer: total,
        options: prng.shuffle([total, ...distractors]),
        manipulative: { type: 'array', rows, cols },
        explanation: `Adding ${rows} equal rows of ${cols} (${repeatedAdd}) gives ${total} total objects.`,
        hint: `Skip-count by ${cols} for each of the ${rows} rows.`,
      };
    }

    case '2.NBT.A.1': {
      const h = prng.nextInt(2, 8);
      const t = prng.nextInt(1, 7);
      const o = prng.nextInt(1, 8);
      const val = h * 100 + t * 10 + o;
      const distractors = [h * 100 + o * 10 + t, t * 100 + h * 10 + o, val + 10, val - 100].filter((x) => x !== val && x > 100);
      const options = generateDistinctStringOptions(val, distractors, [245, 381, 509, 672, 814], 4, prng);
      return {
        ...baseMeta,
        prompt: `Three-Digit Place Value: Look at the Place Value Disks below (${h} hundreds, ${t} tens, ${o} ones). What number in standard form do they represent?`,
        correctAnswer: val,
        options,
        manipulative: { type: 'place-value', hundreds: h, tens: t, ones: o },
        explanation: `${h} hundreds (${h * 100}) + ${t} tens (${t * 10}) + ${o} ones (${o}) = ${val}.`,
        hint: `Write the hundreds digit (${h}), tens digit (${t}), and ones digit (${o}).`,
      };
    }

    case '2.NBT.A.2': {
      const step = prng.choice([5, 10, 100]);
      const start = prng.nextInt(12, 45) * 5;
      const seq = [start, start + step, start + 2 * step];
      const next = start + 3 * step;
      const distractors = generateDistinctOptions(next, 4, 10, 1000, prng).filter((x) => x !== next).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Skip-Counting within 1,000 by ${step}s: ${seq.join(', ')}, ❓`,
        correctAnswer: next,
        options: prng.shuffle([next, ...distractors]),
        manipulative: { type: 'number-line', min: start, max: next + step, start: seq[0], hop: step, target: next },
        explanation: `Each jump adds ${step}: ${seq[seq.length - 1]} + ${step} = ${next}.`,
        hint: `Add ${step} to ${seq[seq.length - 1]}.`,
      };
    }

    case '2.NBT.B.7': {
      if (prng.next() < 0.5) {
        // 3-digit addition within 1,000 with regrouping
        const a = prng.nextInt(145, 488);
        const b = prng.nextInt(136, 375);
        const sum = a + b;
        const distractors = [sum - 10, sum + 10, sum - 100, sum + 1].filter((x) => x !== sum);
        const options = generateDistinctStringOptions(sum, distractors, [324, 482, 591, 715], 4, prng);
        return {
          ...baseMeta,
          prompt: `Three-Digit Addition within 1,000: Calculate ${a} + ${b} using place value regrouping.`,
          correctAnswer: sum,
          options,
          explanation: `Add ones (${a % 10} + ${b % 10}), regroup 10 ones as 1 ten if needed, add tens, and add hundreds: ${a} + ${b} = ${sum}.`,
          hint: `Line up hundreds, tens, and ones vertically and bundle 10 ones or 10 tens when a column reaches 10 or more.`,
        };
      } else {
        // Subtraction with regrouping
        const top = prng.nextInt(62, 95);
        const bottom = prng.nextInt(25, 58);
        const diff = top - bottom;
        const distractors = buildSubtractionRegroupingDistractors(top, bottom, diff);
        return {
          ...baseMeta,
          prompt: `Place Value Regrouping: Subtract ${top} - ${bottom}`,
          correctAnswer: diff,
          options: prng.shuffle([diff, ...distractors]),
          explanation: `Unbundle 1 ten into 10 ones when needed, then subtract ones and tens: ${top} - ${bottom} = ${diff}.`,
          hint: `Do not subtract the smaller top ones digit from the bottom ones digit—unbundle a ten first!`,
        };
      }
    }

    case '2.MD.B.5': {
      const ropeA = prng.nextInt(24, 55);
      const ropeB = prng.nextInt(16, 38);
      const total = ropeA + ropeB;
      const distractors = generateDistinctOptions(total, 4, 30, 100, prng).filter((x) => x !== total).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Length Word Problem: A Yosemite rock-climbing guide connected a ${ropeA}-meter safety rope to a ${ropeB}-meter rope. How many meters long is the combined rope?`,
        correctAnswer: `${total} m`,
        options: prng.shuffle([`${total} m`, ...distractors.map((d) => `${d} m`)]),
        manipulative: { type: 'tape-diagram', parts: [ropeA, ropeB], total, unknownTotal: true, unit: 'm' },
        explanation: `Add the two lengths in meters: ${ropeA} m + ${ropeB} m = ${total} m.`,
        hint: `Add ${ropeA} + ${ropeB}.`,
      };
    }

    case '2.MD.C.7': {
      const hour = prng.nextInt(1, 12);
      const minute = prng.choice([5, 10, 15, 20, 25, 35, 40, 45, 50, 55]);
      const minStr = minute < 10 ? `0${minute}` : `${minute}`;
      const timeStr = `${hour}:${minStr}`;
      const distractors = [
        `${(hour % 12) + 1}:${minStr}`,
        `${hour}:${(minute + 15) % 60 < 10 ? '0' + ((minute + 15) % 60) : (minute + 15) % 60}`,
        `${((hour + 10) % 12) + 1}:${minStr}`,
      ];
      return {
        ...baseMeta,
        prompt: `What time is shown on the analog clock to the nearest 5 minutes?`,
        correctAnswer: timeStr,
        options: prng.shuffle([timeStr, ...distractors]),
        manipulative: { type: 'clock', hour, minute },
        explanation: `The hour hand is past ${hour}. Skip-counting by 5s from 12 to ${minute / 5} gives ${minute} minutes. Time: ${timeStr}.`,
        hint: `Each number on the clock face represents 5 minutes.`,
      };
    }

    case '2.MD.C.8': {
      const quarters = prng.nextInt(1, 3);
      const dimes = prng.nextInt(1, 3);
      const nickels = prng.nextInt(1, 2);
      const pennies = prng.nextInt(1, 4);
      const total = quarters * 25 + dimes * 10 + nickels * 5 + pennies * 1;
      const distractors = generateDistinctOptions(total, 4, 30, 150, prng).filter((x) => x !== total).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Money Word Problem: Sofia has ${quarters} quarter(s), ${dimes} dime(s), ${nickels} nickel(s), and ${pennies} penny/pennies in her coin pouch. How many cents (¢) does she have in all?`,
        correctAnswer: `${total}¢`,
        options: prng.shuffle([`${total}¢`, ...distractors.map((v) => `${v}¢`)]),
        manipulative: { type: 'money', coins: { quarters, dimes, nickels, pennies }, totalCents: total },
        explanation: `Count from largest coin to smallest: ${quarters}×25¢ (${quarters * 25}¢) + ${dimes}×10¢ (${dimes * 10}¢) + ${nickels}×5¢ (${nickels * 5}¢) + ${pennies}×1¢ (${pennies}¢) = ${total}¢.`,
        hint: `Quarter = 25¢, Dime = 10¢, Nickel = 5¢, Penny = 1¢.`,
      };
    }

    case '2.MD.D.10': {
      const vOtters = prng.nextInt(6, 14);
      const vSeals = prng.nextInt(4, 11);
      const vTurtles = prng.nextInt(3, 9);
      const total = vOtters + vSeals + vTurtles;
      const categories = [
        { label: 'Sea Otters', value: vOtters },
        { label: 'Harbor Seals', value: vSeals },
        { label: 'Sea Turtles', value: vTurtles },
      ];
      if (prng.next() < 0.5) {
        const distractors = generateDistinctOptions(total, 4, 12, 40, prng).filter((x) => x !== total).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Bar Graph Data Analysis: A 2nd-grade class voted on their favorite Monterey Bay marine animal, shown in the bar graph below. How many students voted in all?`,
          correctAnswer: total,
          options: prng.shuffle([total, ...distractors]),
          manipulative: { type: 'bar-graph', categories, maxVal: 15 },
          explanation: `Add the values of all three bars: ${vOtters} + ${vSeals} + ${vTurtles} = ${total} students.`,
          hint: `Read the number on each bar and add them all together.`,
        };
      } else {
        const diff = Math.abs(vOtters - vTurtles);
        const distractors = generateDistinctOptions(diff, 4, 0, 14, prng).filter((x) => x !== diff).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Bar Graph Comparison: Using the bar graph below, what is the difference between the votes for Sea Otters (${vOtters}) and Sea Turtles (${vTurtles})?`,
          correctAnswer: diff,
          options: prng.shuffle([diff, ...distractors]),
          manipulative: { type: 'bar-graph', categories, maxVal: 15 },
          explanation: `Subtract the two bar values: |${vOtters} - ${vTurtles}| = ${diff} votes.`,
          hint: `Find the difference between ${vOtters} and ${vTurtles}.`,
        };
      }
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
        prompt: `Polygon Attributes: A closed 2D shape with exactly ${pick.angles} angles, ${pick.angles} vertices, and ${pick.angles} straight sides is called a:`,
        correctAnswer: pick.name,
        options: prng.shuffle(['Triangle', 'Quadrilateral', 'Pentagon', 'Hexagon']),
        manipulative: { type: 'polygon-inspector', sides: pick.angles, shapeName: pick.name },
        explanation: `By geometric definition, any polygon with ${pick.angles} sides and ${pick.angles} angles is a ${pick.name}.`,
        hint: `Tri = 3, Quad = 4, Penta = 5, Hexa = 6.`,
      };
    }

    // ==================== 3RD GRADE ====================
    case '3.OA.A.3': {
      const groups = prng.nextInt(4, 9);
      const perGroup = prng.nextInt(3, 9);
      const total = groups * perGroup;
      if (prng.next() < 0.55) {
        const distractors = generateDistinctOptions(total, 4, 12, 90, prng).filter((x) => x !== total).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Equal Groups Multiplication: The Farnham Elementary library in Cambrian organized ${groups} shelves with ${perGroup} books on each shelf. How many books are there in total?`,
          correctAnswer: total,
          options: prng.shuffle([total, ...distractors]),
          manipulative: { type: 'array', rows: groups, cols: perGroup },
          explanation: `${groups} equal groups of ${perGroup} books: ${groups} × ${perGroup} = ${total} books.`,
          hint: `Multiply rows by columns: ${groups} × ${perGroup}.`,
        };
      } else {
        const distractors = generateDistinctOptions(perGroup, 4, 2, 14, prng).filter((x) => x !== perGroup).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Equal Sharing Division: A Sequoia National Park ranger shared ${total} Junior Ranger badges equally among ${groups} hiking groups. How many badges did each group receive?`,
          correctAnswer: perGroup,
          options: prng.shuffle([perGroup, ...distractors]),
          manipulative: { type: 'array', rows: groups, cols: perGroup },
          explanation: `Partition ${total} into ${groups} equal groups: ${total} ÷ ${groups} = ${perGroup} badges per group.`,
          hint: `Think of the unknown factor: ${groups} × ❓ = ${total}.`,
        };
      }
    }

    case '3.OA.A.4': {
      const factorA = prng.nextInt(4, 9);
      const unknown = prng.nextInt(3, 9);
      const product = factorA * unknown;
      const isMult = prng.next() < 0.5;
      const distractors = generateDistinctOptions(unknown, 4, 2, 12, prng).filter((x) => x !== unknown).slice(0, 3);
      return {
        ...baseMeta,
        prompt: isMult
          ? `Find the unknown whole number that makes the equation true: ${factorA} × ❓ = ${product}`
          : `Find the unknown divisor that makes the equation true: ${product} ÷ ❓ = ${factorA}`,
        correctAnswer: unknown,
        options: prng.shuffle([unknown, ...distractors]),
        explanation: `Using the inverse relationship between multiplication and division: ${product} ÷ ${factorA} = ${unknown}.`,
        hint: `Since ${factorA} × ${unknown} = ${product}, the missing number is ${unknown}.`,
      };
    }

    case '3.OA.B.5': {
      // Distributive property (Eureka Math Grade 3 break-apart strategy!)
      const a = prng.nextInt(6, 9);
      const b1 = 5;
      const b2 = prng.nextInt(2, 4);
      const b = b1 + b2;
      const prod = a * b;
      const correctDecomp = `(${a} × ${b1}) + (${a} × ${b2})`;
      const options = prng.shuffle([
        correctDecomp,
        `(${a} + ${b1}) × (${a} + ${b2})`,
        `(${a} × ${b1}) × (${a} × ${b2})`,
        `(${a} + ${b1}) + (${a} + ${b2})`,
      ]);
      return {
        ...baseMeta,
        prompt: `Distributive Property (Break-Apart Strategy): To find ${a} × ${b}, Maya broke ${b} into ${b1} + ${b2}. Which expression is equivalent to ${a} × ${b} (which equals ${prod})?`,
        correctAnswer: correctDecomp,
        options,
        manipulative: { type: 'array', rows: a, cols: b },
        explanation: `By the Distributive Property, ${a} × (${b1} + ${b2}) = (${a} × ${b1}) + (${a} × ${b2}) = ${a * b1} + ${a * b2} = ${prod}.`,
        hint: `Multiply ${a} by each part (${b1} and ${b2}), then add the two partial products.`,
      };
    }

    case '3.OA.C.7': {
      const a = prng.nextInt(3, 10);
      const b = prng.nextInt(4, 10);
      const prod = a * b;
      if (prng.next() < 0.55) {
        const distractors = generateDistinctOptions(prod, 4, 12, 100, prng).filter((x) => x !== prod).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Multiplication Fluency within 100: What is ${a} × ${b}?`,
          correctAnswer: prod,
          options: prng.shuffle([prod, ...distractors]),
          manipulative: { type: 'array', rows: a, cols: b },
          explanation: `${a} equal groups of ${b} is ${prod}.`,
          hint: `Decompose ${b} into 5 + ${b - 5} if helpful, or use your ${a}s facts.`,
        };
      } else {
        const distractors = generateDistinctOptions(b, 4, 2, 12, prng).filter((x) => x !== b).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Division Fluency within 100: What is ${prod} ÷ ${a}?`,
          correctAnswer: b,
          options: prng.shuffle([b, ...distractors]),
          manipulative: { type: 'array', rows: a, cols: b },
          explanation: `Using the related multiplication fact ${a} × ${b} = ${prod}, we know ${prod} ÷ ${a} = ${b}.`,
          hint: `Think: ${a} multiplied by what number equals ${prod}?`,
        };
      }
    }

    case '3.OA.D.8': {
      const packs = prng.nextInt(4, 8);
      const perPack = prng.nextInt(5, 9);
      const extra = prng.nextInt(6, 18);
      const isAdd = prng.next() < 0.6;
      const total = isAdd ? packs * perPack + extra : packs * perPack - extra;
      const distractors = generateDistinctOptions(total, 4, 10, 95, prng).filter((x) => x !== total).slice(0, 3);
      return {
        ...baseMeta,
        prompt: isAdd
          ? `Two-Step Word Problem: The Steindorf STEAM robotics club bought ${packs} packs of gears with ${perPack} gears in each pack, plus ${extra} extra gears. How many gears did they buy in all?`
          : `Two-Step Word Problem: A Santa Clara Valley orchard packed ${packs} crates with ${perPack} melons in each crate. They sold ${extra} melons at the farm stand. How many melons are left?`,
        correctAnswer: total,
        options: prng.shuffle([total, ...distractors]),
        manipulative: { type: 'tape-diagram', parts: isAdd ? [packs * perPack, extra] : [total, extra], total: isAdd ? total : packs * perPack, unknownTotal: isAdd, unknownPartIndex: isAdd ? -1 : 0 },
        explanation: `Step 1: Multiply ${packs} × ${perPack} = ${packs * perPack}. Step 2: ${isAdd ? `Add ${extra}: ${packs * perPack} + ${extra}` : `Subtract ${extra}: ${packs * perPack} - ${extra}`} = ${total}.`,
        hint: `First find the product ${packs} × ${perPack} = ${packs * perPack}, then ${isAdd ? 'add' : 'subtract'} ${extra}.`,
      };
    }

    case '3.NBT.A.1': {
      const roundTo = prng.choice([10, 100]);
      const val = prng.nextInt(125, 875);
      const rounded = Math.round(val / roundTo) * roundTo;
      const distractors = [
        rounded - roundTo,
        rounded + roundTo,
        roundTo === 10 ? Math.round(val / 100) * 100 : Math.round(val / 10) * 10,
      ].filter((x) => x !== rounded);
      const options = generateDistinctStringOptions(rounded, distractors, [200, 350, 400, 520, 600], 4, prng);
      return {
        ...baseMeta,
        prompt: `Place Value Rounding: Round ${val} to the nearest ${roundTo}.`,
        correctAnswer: rounded,
        options,
        explanation: `To round ${val} to the nearest ${roundTo}, look at the ${roundTo === 10 ? 'ones' : 'tens'} digit. Halfway (5) or more rounds up to ${rounded}.`,
        hint: `Find which multiple of ${roundTo} is closest to ${val} on a number line.`,
      };
    }

    case '3.NBT.A.2': {
      const a = prng.nextInt(345, 680);
      const b = prng.nextInt(158, 329);
      const isAdd = prng.next() < 0.5;
      const ans = isAdd ? a + b : a - b;
      const distractors = [ans + 10, ans - 10, ans + 100, ans - 1].filter((x) => x !== ans);
      const options = generateDistinctStringOptions(ans, distractors, [245, 412, 589, 734], 4, prng);
      return {
        ...baseMeta,
        prompt: isAdd
          ? `Fluently Add within 1,000: ${a} + ${b}`
          : `Fluently Subtract within 1,000: ${a} - ${b}`,
        correctAnswer: ans,
        options,
        explanation: `Using place-value regrouping across hundreds, tens, and ones: ${a} ${isAdd ? '+' : '-'} ${b} = ${ans}.`,
        hint: `Align hundreds, tens, and ones vertically and work right to left.`,
      };
    }

    case '3.NF.A.1': {
      const den = prng.choice([3, 4, 6, 8]);
      const num = prng.nextInt(1, den - 1);
      const fracStr = `${num}/${den}`;
      const options = generateDistinctFractionOptions(num, den, 4, prng);
      return {
        ...baseMeta,
        prompt: `Unit Fractions & Equal Parts: A whole fraction strip is partitioned into ${den} equal parts, and ${num} of those parts (each of size 1/${den}) are shaded. What fraction of the whole is shaded?`,
        correctAnswer: fracStr,
        options,
        manipulative: { type: 'fraction', numerator: num, denominator: den },
        explanation: `${num} copies of the unit fraction 1/${den} form the fraction ${fracStr}.`,
        hint: `Numerator (top) = ${num} shaded parts; Denominator (bottom) = ${den} equal parts in the whole.`,
      };
    }

    case '3.NF.A.2': {
      const den = prng.choice([3, 4, 6, 8]);
      const num = prng.nextInt(1, den - 1);
      const fracStr = `${num}/${den}`;
      const options = generateDistinctFractionOptions(num, den, 4, prng);
      return {
        ...baseMeta,
        prompt: `Fractions on a Number Line: The interval from 0 to 1 is partitioned into ${den} equal lengths. What fraction is located ${num} intervals to the right of 0?`,
        correctAnswer: fracStr,
        options,
        manipulative: { type: 'fraction', numerator: num, denominator: den },
        explanation: `Each interval has length 1/${den}. Moving ${num} intervals from 0 reaches ${fracStr}.`,
        hint: `Count ${num} hops of size 1/${den} starting at 0.`,
      };
    }

    case '3.NF.A.3': {
      const variant = prng.nextInt(1, 3);
      if (variant === 1) {
        // Same numerator comparison
        const num = prng.choice([2, 3]);
        const denSmall = prng.choice([3, 4]);
        const denLarge = prng.choice([6, 8]);
        const greater = `${num}/${denSmall}`;
        return {
          ...baseMeta,
          prompt: `Comparing Fractions with the Same Numerator: Which fraction is GREATER, ${num}/${denSmall} or ${num}/${denLarge}?`,
          correctAnswer: greater,
          options: prng.shuffle([`${num}/${denSmall}`, `${num}/${denLarge}`, 'They are equal', `${num}/${denSmall + denLarge}`]),
          manipulative: { type: 'fraction', numerator: num, denominator: denSmall },
          explanation: `Both fractions have ${num} parts, but fourths/thirds are larger parts than sixths/eighths because the whole is cut into fewer pieces. Therefore ${num}/${denSmall} > ${num}/${denLarge}.`,
          hint: `When numerators are the same, the fraction with the SMALLER denominator has larger pieces!`,
        };
      } else if (variant === 2) {
        // Whole numbers as fractions
        const whole = prng.nextInt(2, 6);
        const den = prng.choice([1, 2, 3, 4]);
        const num = whole * den;
        const fracStr = `${num}/${den}`;
        const distractors = generateDistinctOptions(whole, 4, 1, 10, prng).filter((x) => x !== whole).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Whole Numbers as Fractions: What whole number is equivalent to the fraction ${fracStr}?`,
          correctAnswer: whole,
          options: prng.shuffle([whole, ...distractors]),
          explanation: `Every ${den} fourths/thirds/halves make 1 whole. Since ${num} ÷ ${den} = ${whole}, ${fracStr} = ${whole}.`,
          hint: `Divide the numerator (${num}) by the denominator (${den}).`,
        };
      } else {
        // Same denominator comparison
        const den = prng.choice([6, 8]);
        const n1 = prng.nextInt(2, 4);
        const n2 = prng.nextInt(5, den - 1);
        return {
          ...baseMeta,
          prompt: `Comparing Fractions with the Same Denominator: Which fraction is GREATER, ${n1}/${den} or ${n2}/${den}?`,
          correctAnswer: `${n2}/${den}`,
          options: prng.shuffle([`${n1}/${den}`, `${n2}/${den}`, 'They are equal', `1/${den}`]),
          manipulative: { type: 'fraction', numerator: n2, denominator: den },
          explanation: `When denominators are the same, compare the numerators: ${n2} parts of size 1/${den} is more than ${n1} parts, so ${n2}/${den} > ${n1}/${den}.`,
          hint: `Both fractions have parts of size 1/${den}. Which has more parts?`,
        };
      }
    }

    case '3.MD.A.1': {
      const startMin = prng.nextInt(12, 34);
      const elapsed = prng.nextInt(16, 25);
      const endMin = startMin + elapsed;
      return {
        ...baseMeta,
        prompt: `Elapsed Time Word Problem: A California Junior Ranger tour started at 3:${startMin} p.m. and ended at 3:${endMin} p.m. How many minutes did the tour last?`,
        correctAnswer: `${elapsed} min`,
        options: prng.shuffle([`${elapsed} min`, `${elapsed + 5} min`, `${elapsed - 5} min`, `${elapsed + 10} min`]),
        manipulative: { type: 'number-line', min: startMin, max: endMin, start: startMin, hop: elapsed, target: endMin },
        explanation: `Count the minutes from 3:${startMin} to 3:${endMin}: ${endMin} - ${startMin} = ${elapsed} minutes.`,
        hint: `Subtract ${endMin} - ${startMin}.`,
      };
    }

    case '3.MD.A.2': {
      const bags = prng.nextInt(4, 9);
      const kgPerBag = prng.nextInt(3, 8);
      const totalKg = bags * kgPerBag;
      const distractors = generateDistinctOptions(totalKg, 4, 10, 80, prng).filter((x) => x !== totalKg).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Metric Mass Word Problem: A wildlife rehabilitator in Lake Tahoe has ${bags} bags of acorns, each with a mass of ${kgPerBag} kilograms (kg). What is the total mass of all the bags in kilograms?`,
        correctAnswer: `${totalKg} kg`,
        options: prng.shuffle([`${totalKg} kg`, ...distractors.map((d) => `${d} kg`)]),
        manipulative: { type: 'tape-diagram', parts: Array.from({ length: Math.min(bags, 5) }, () => kgPerBag), total: totalKg, unknownTotal: true, unit: 'kg' },
        explanation: `Multiply the number of bags by the mass per bag: ${bags} × ${kgPerBag} kg = ${totalKg} kg.`,
        hint: `Multiply ${bags} × ${kgPerBag}.`,
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
        prompt: `Area by Tiling & Multiplication: A California school learning garden is ${l} meters long and ${w} meters wide. What is its area in square meters? (Use the interactive grid below to count unit tiles!)`,
        correctAnswer: `${area} sq m`,
        options,
        manipulative: { type: 'interactive-geometry', width: l, height: w, unit: 'm', showAreaGrid: true },
        explanation: `Area = length × width = ${l} m × ${w} m = ${area} square meters (${area} sq m).`,
        hint: `Multiply length × width (${l} × ${w}), not perimeter!`,
      };
    }

    case '3.MD.D.8': {
      const l = prng.nextInt(5, 11);
      const w = prng.nextInt(3, 8);
      const perimeter = 2 * (l + w);
      const area = l * w;
      if (prng.next() < 0.65) {
        const candidates = [`${area} ft`, `${perimeter + 4} ft`, `${Math.max(10, perimeter - 4)} ft`, `${l + w} ft`];
        const fallbackPool = ['18 ft', '22 ft', '26 ft', '30 ft', '32 ft', '36 ft'];
        const options = generateDistinctStringOptions(`${perimeter} ft`, candidates, fallbackPool, 4, prng);
        return {
          ...baseMeta,
          prompt: `Perimeter of a Polygon: A rectangular playground sandbox is ${l} feet long and ${w} feet wide. What is the total perimeter around the outside? (Click the sides below to trace and measure!)`,
          correctAnswer: `${perimeter} ft`,
          options,
          manipulative: { type: 'interactive-geometry', width: l, height: w, unit: 'ft', showAreaGrid: false },
          explanation: `Perimeter is the sum of all 4 outer sides: ${l} + ${w} + ${l} + ${w} = 2 × (${l} + ${w}) = ${perimeter} ft.`,
          hint: `Add all 4 sides: top (${l}) + bottom (${l}) + left (${w}) + right (${w}).`,
        };
      } else {
        // Missing side length given perimeter
        const distractors = generateDistinctOptions(w, 4, 2, 15, prng).filter((x) => x !== w).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Unknown Side Length from Perimeter: A rectangular dog park has a total perimeter of ${perimeter} feet. Its length is ${l} feet. What is its width?`,
          correctAnswer: `${w} ft`,
          options: prng.shuffle([`${w} ft`, ...distractors.map((d) => `${d} ft`)]),
          manipulative: { type: 'interactive-geometry', width: l, height: w, unit: 'ft', showAreaGrid: false },
          explanation: `Two lengths equal 2 × ${l} = ${2 * l} ft. Subtract from perimeter: ${perimeter} - ${2 * l} = ${2 * w} ft for the two widths. Divide by 2: ${2 * w} ÷ 2 = ${w} ft.`,
          hint: `Subtract ${l} + ${l} (${2 * l}) from ${perimeter}, then divide the result by 2.`,
        };
      }
    }

    case '3.G.A.1': {
      const quadQuestions = [
        {
          prompt: 'Shared Attributes of Quadrilaterals: Which geometric term describes ALL 4-sided closed polygons (including squares, rectangles, rhombuses, and trapezoids)?',
          ans: 'Quadrilateral',
          options: ['Quadrilateral', 'Pentagon', 'Hexagon', 'Parallelogram'],
          exp: 'Every 4-sided closed polygon belongs to the overarching category of quadrilaterals.',
        },
        {
          prompt: 'A quadrilateral with 4 equal side lengths (whether or not its angles are 90°) is ALWAYS classified as a:',
          ans: 'Rhombus',
          options: ['Rhombus', 'Rectangle', 'Trapezoid', 'Pentagon'],
          exp: 'The defining attribute of a rhombus is 4 sides of equal length. A square is a special rhombus that also has 4 right angles.',
        },
        {
          prompt: 'Which shape is BOTH a rectangle (4 right angles) AND a rhombus (4 equal sides)?',
          ans: 'Square',
          options: ['Square', 'Trapezoid', 'Kite', 'Hexagon'],
          exp: 'A square has 4 right angles (making it a rectangle) and 4 equal side lengths (making it a rhombus).',
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
        hint: `Compare the side lengths and angles of the quadrilateral.`,
      };
    }

    // ==================== 4TH GRADE ====================
    case '4.OA.A.2': {
      const small = prng.nextInt(7, 15);
      const times = prng.nextInt(3, 8);
      const large = small * times;
      if (prng.next() < 0.55) {
        const distractors = [small + times, large + small, Math.max(4, large - times)].filter((x) => x !== large);
        return {
          ...baseMeta,
          prompt: `Multiplicative Comparison: A young coastal redwood sapling is ${small} feet tall. A mature redwood tree nearby is ${times} times as tall as the sapling. How tall is the mature redwood tree?`,
          correctAnswer: `${large} ft`,
          options: generateDistinctStringOptions(
            `${large} ft`,
            distractors.map((d) => `${d} ft`),
            ['24 ft', '36 ft', '42 ft', '48 ft', '56 ft'],
            4,
            prng
          ),
          manipulative: { type: 'tape-diagram', parts: Array.from({ length: Math.min(times, 5) }, () => small), total: large, unknownTotal: true, unit: 'ft' },
          explanation: `"${times} times as tall as ${small}" is ${times} × ${small} = ${large} feet (not ${small} + ${times}).`,
          hint: `"Times as many" means multiply (${times} × ${small}), not add!`,
        };
      } else {
        const distractors = generateDistinctOptions(small, 4, 3, 25, prng).filter((x) => x !== small).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Multiplicative Comparison (Unknown Smaller Value): A Golden Gate ferry carries ${large} passengers, which is ${times} times as many passengers as a harbor water taxi. How many passengers does the water taxi carry?`,
          correctAnswer: small,
          options: prng.shuffle([small, ...distractors]),
          explanation: `Since ${large} is ${times} times as many as the water taxi, divide: ${large} ÷ ${times} = ${small} passengers.`,
          hint: `Divide ${large} by ${times} (${times} × ❓ = ${large}).`,
        };
      }
    }

    case '4.OA.A.3': {
      const storyType = prng.choice(['remainder-vans', 'bus', 'grove', 'stem']);
      if (storyType === 'remainder-vans') {
        // Official CAASPP Remainder Interpretation Problem!
        const perVan = prng.choice([6, 8, 9]);
        const fullVans = prng.nextInt(5, 11);
        const rem = prng.nextInt(2, perVan - 1);
        const totalStudents = fullVans * perVan + rem;
        const vansNeeded = fullVans + 1;
        const distractors = [fullVans, rem, fullVans + 2, totalStudents - perVan].filter((x) => x !== vansNeeded);
        const options = generateDistinctStringOptions(vansNeeded, distractors, [5, 7, 8, 9, 10, 12], 4, prng);
        return {
          ...baseMeta,
          prompt: `CAASPP Remainder Interpretation: ${totalStudents} fourth-grade students are taking shuttle vans to Griffith Observatory. Each shuttle van holds at most ${perVan} students. What is the MINIMUM number of vans needed so that EVERY student has a seat?`,
          correctAnswer: vansNeeded,
          options,
          explanation: `Divide ${totalStudents} ÷ ${perVan} = ${fullVans} with a remainder of ${rem} students. Since those ${rem} remaining students cannot be left behind, 1 additional van is required: ${fullVans} + 1 = ${vansNeeded} vans.`,
          hint: `Divide ${totalStudents} by ${perVan}. If there is a remainder, round UP by 1 van so no student is left behind!`,
        };
      } else if (storyType === 'bus') {
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
        const sold = prng.nextInt(10, 22);
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
      const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
      const composites = [12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 32, 35, 36];
      if (prng.next() < 0.6) {
        const pickPrime = prng.choice(primes);
        const pickComposites = prng.shuffle(composites).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Prime vs. Composite Numbers: Which of the following numbers in the range 1–100 is a PRIME number?`,
          correctAnswer: pickPrime,
          options: prng.shuffle([pickPrime, ...pickComposites]),
          explanation: `${pickPrime} is prime because its only factor pair is 1 and ${pickPrime}.`,
          hint: `A prime number has exactly 2 factors: 1 and itself.`,
        };
      } else {
        const factor = prng.choice([6, 7, 8, 9]);
        const mult = factor * prng.nextInt(4, 9);
        const nonMultiples = [mult + 2, mult - 1, mult + 3].filter((x) => x % factor !== 0);
        return {
          ...baseMeta,
          prompt: `Factors & Multiples: Which of the following numbers is a MULTIPLE of ${factor}?`,
          correctAnswer: mult,
          options: prng.shuffle([mult, ...nonMultiples.slice(0, 3)]),
          explanation: `${mult} is a multiple of ${factor} because ${factor} × ${mult / factor} = ${mult}.`,
          hint: `Which number can be divided evenly by ${factor} with no remainder?`,
        };
      }
    }

    case '4.OA.C.5': {
      const start = prng.nextInt(4, 12);
      const addRule = prng.nextInt(6, 15);
      const seq = [start, start + addRule, start + 2 * addRule, start + 3 * addRule];
      const next = start + 4 * addRule;
      const distractors = generateDistinctOptions(next, 4, 20, 100, prng).filter((x) => x !== next).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Rule Pattern Analysis: A number pattern starts at ${start} and follows the rule "Add ${addRule}": ${seq.join(', ')}, ❓. What is the next number in the pattern?`,
        correctAnswer: next,
        options: prng.shuffle([next, ...distractors]),
        explanation: `Applying the rule "Add ${addRule}" to ${seq[3]} gives ${seq[3]} + ${addRule} = ${next}.`,
        hint: `Add ${addRule} to ${seq[3]}.`,
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
        prompt: `Expanded Form to Standard Form: Write ${(th * 1000).toLocaleString()} + ${h * 100} + ${t * 10} + ${o} as a base-ten numeral:`,
        correctAnswer: ansStr,
        options,
        explanation: `Combine each place value: ${th} thousands (${th * 1000}), ${h} hundreds (${h * 100}), ${t} tens (${t * 10}), and ${o} ones = ${ansStr}.`,
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
        explanation: `Inspect the hundreds digit of ${num.toLocaleString()}. 5 or greater rounds the thousands place up, giving ${rounded.toLocaleString()}.`,
        hint: `Check the hundreds digit to decide whether the thousands digit rounds up or stays the same.`,
      };
    }

    case '4.NBT.B.4': {
      const a = prng.nextInt(2340, 7890);
      const b = prng.nextInt(1250, 3680);
      const isAdd = prng.next() < 0.5;
      const top = isAdd ? a : Math.max(a, b);
      const bot = isAdd ? b : Math.min(a, b);
      const ans = isAdd ? top + bot : top - bot;
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
        prompt: `Multi-Digit Standard Algorithm: Calculate ${top.toLocaleString()} ${isAdd ? '+' : '-'} ${bot.toLocaleString()}`,
        correctAnswer: ansStr,
        options,
        explanation: `Align place values from ones to thousands and regroup where needed: ${top.toLocaleString()} ${isAdd ? '+' : '-'} ${bot.toLocaleString()} = ${ansStr}.`,
        hint: `Work column by column from right (ones) to left (thousands).`,
      };
    }

    case '4.NBT.B.5': {
      if (prng.next() < 0.5) {
        // Two 2-digit numbers (Area Model / Partial Products)
        const a = prng.nextInt(14, 32);
        const b = prng.nextInt(12, 25);
        const prod = a * b;
        const distractors = generateDistinctOptions(prod, 4, 150, 850, prng).filter((x) => x !== prod).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Two-Digit × Two-Digit Multiplication: Use an area model or partial products to compute ${a} × ${b}.`,
          correctAnswer: prod,
          options: prng.shuffle([prod, ...distractors]),
          explanation: `Decompose ${a} = ${Math.floor(a / 10) * 10} + ${a % 10} and ${b} = ${Math.floor(b / 10) * 10} + ${b % 10}. Partial products sum to ${prod}.`,
          hint: `Multiply (${a} × ${Math.floor(b / 10) * 10}) + (${a} × ${b % 10}).`,
        };
      } else {
        // 3-digit × 1-digit
        const a = prng.nextInt(124, 345);
        const b = prng.nextInt(4, 8);
        const prod = a * b;
        const ansStr = prod.toLocaleString();
        const candidates = [(prod + b * 10).toLocaleString(), (prod - b * 10).toLocaleString(), (prod + 100).toLocaleString()];
        const options = generateDistinctStringOptions(ansStr, candidates, ['640', '820', '1,120', '1,480'], 4, prng);
        return {
          ...baseMeta,
          prompt: `Multi-Digit Multiplication (Partial Products): Compute ${a} × ${b}.`,
          correctAnswer: ansStr,
          options,
          explanation: `(${Math.floor(a / 100) * 100} × ${b}) + (${Math.floor((a % 100) / 10) * 10} × ${b}) + (${a % 10} × ${b}) = ${ansStr}.`,
          hint: `Multiply hundreds, tens, and ones each by ${b}, then add the partial products.`,
        };
      }
    }

    case '4.NBT.B.6': {
      const divisor = prng.nextInt(4, 9);
      const quotient = prng.nextInt(16, 48);
      const dividend = divisor * quotient;
      const distractors = generateDistinctOptions(quotient, 4, 10, 60, prng).filter((x) => x !== quotient).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Place Value Division: Find the exact quotient of ${dividend} ÷ ${divisor}.`,
        correctAnswer: quotient,
        options: prng.shuffle([quotient, ...distractors]),
        explanation: `Using partial quotients: ${dividend} = (${divisor} × ${Math.floor(quotient / 10) * 10}) + (${divisor} × ${quotient % 10}), so ${dividend} ÷ ${divisor} = ${quotient}.`,
        hint: `Break ${dividend} into ${divisor * Math.floor(quotient / 10) * 10} + ${divisor * (quotient % 10)} and divide each part by ${divisor}.`,
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
        prompt: `Fraction Equivalence Principle (n×a)/(n×b): Which fraction is equivalent to ${baseNum}/${baseDen}?`,
        correctAnswer: targetStr,
        options,
        manipulative: { type: 'fraction', numerator: baseNum, denominator: baseDen },
        explanation: `Multiplying both numerator and denominator by ${mult} partitions each unit fraction into ${mult} smaller equal parts: (${baseNum}×${mult})/(${baseDen}×${mult}) = ${targetStr}.`,
        hint: `Multiply both top and bottom by ${mult}.`,
      };
    }

    case '4.NF.A.2': {
      const comparisons = [
        { f1: '3/4', f2: '5/8', greater: '3/4', exp: 'Rename 3/4 with denominator 8: 3/4 = 6/8, and 6/8 > 5/8.' },
        { f1: '2/3', f2: '3/5', greater: '2/3', exp: 'Using common denominator 15: 2/3 = 10/15 and 3/5 = 9/15, so 2/3 > 3/5.' },
        { f1: '5/6', f2: '7/12', greater: '5/6', exp: 'Rename 5/6 as twelfths: 5/6 = 10/12, which is greater than 7/12.' },
        { f1: '3/8', f2: '2/3', greater: '2/3', exp: 'Compare to benchmark 1/2: 3/8 is less than 1/2 (4/8), while 2/3 is greater than 1/2.' },
      ];
      const pick = prng.choice(comparisons);
      return {
        ...baseMeta,
        prompt: `Compare Fractions with Unlike Denominators: Which fraction is GREATER, ${pick.f1} or ${pick.f2}?`,
        correctAnswer: pick.greater,
        options: prng.shuffle([pick.f1, pick.f2, 'They are equal', '1/8']),
        explanation: pick.exp,
        hint: `Compare both fractions to the benchmark 1/2 or find a common denominator.`,
      };
    }

    case '4.NF.B.3': {
      const den = prng.choice([5, 6, 8, 10, 12]);
      const n1 = prng.nextInt(2, Math.floor(den / 2));
      const n2 = prng.nextInt(1, den - n1 - 1);
      const isAdd = prng.next() < 0.6;
      const ansN = isAdd ? n1 + n2 : Math.max(n1, n2) - Math.min(n1, n2);
      const topN = isAdd ? n1 : Math.max(n1, n2);
      const botN = isAdd ? n2 : Math.min(n1, n2);
      const ans = `${ansN}/${den}`;
      const candidates = [
        `${ansN}/${den * 2}`,
        `${topN * botN}/${den}`,
        `${Math.max(1, ansN - 1)}/${den}`,
        `${ansN + 1}/${den}`,
      ];
      const fallbackPool = ['1/2', '2/3', '3/4', '3/5', '5/6', '7/8', '4/5'];
      const options = generateDistinctStringOptions(ans, candidates, fallbackPool, 4, prng);
      return {
        ...baseMeta,
        prompt: isAdd
          ? `Like-Denominator Fractions: Calculate ${topN}/${den} + ${botN}/${den}`
          : `Like-Denominator Fractions: Calculate ${topN}/${den} - ${botN}/${den}`,
        correctAnswer: ans,
        options,
        explanation: `When parts refer to the same whole (denominator ${den}), ${isAdd ? 'join' : 'separate'} the numerators: (${topN} ${isAdd ? '+' : '-'} ${botN})/${den} = ${ans}.`,
        hint: `${isAdd ? 'Add' : 'Subtract'} the numerators and keep the denominator ${den} unchanged.`,
      };
    }

    case '4.NF.B.4': {
      const den = prng.choice([3, 4, 5, 6, 8, 10]);
      const whole = prng.nextInt(2, 6);
      const num = prng.choice([1, 2]);
      const prodNum = whole * num;
      const ansStr = `${prodNum}/${den}`;
      const candidates = [
        `${whole * num}/${whole * den}`,
        `${prodNum + 1}/${den}`,
        `${Math.max(1, prodNum - 1)}/${den}`,
        `${whole + num}/${den}`,
      ];
      const options = generateDistinctStringOptions(ansStr, candidates, ['2/3', '3/4', '4/5', '5/6', '7/8'], 4, prng);
      return {
        ...baseMeta,
        prompt: `Multiplying a Fraction by a Whole Number: A hiking trail in Joshua Tree National Park is ${num}/${den} mile long. If a ranger patrols the trail ${whole} times, how many miles does the ranger walk in all? (${whole} × ${num}/${den})`,
        correctAnswer: ansStr,
        options,
        explanation: `${whole} copies of ${num}/${den} equals (${whole} × ${num})/${den} = ${ansStr} miles.`,
        hint: `Multiply the whole number (${whole}) by the numerator (${num}) and keep the denominator (${den}).`,
      };
    }

    case '4.NF.C.5': {
      const tenths = prng.nextInt(2, 7);
      const hundredths = prng.nextInt(11, 28);
      const sumHundredths = tenths * 10 + hundredths;
      const ansStr = `${sumHundredths}/100`;
      const candidates = [
        `${tenths + hundredths}/100`,
        `${tenths + hundredths}/110`,
        `${sumHundredths}/10`,
        `${sumHundredths + 10}/100`,
      ];
      const options = generateDistinctStringOptions(ansStr, candidates, ['35/100', '48/100', '62/100', '75/100'], 4, prng);
      return {
        ...baseMeta,
        prompt: `Adding Tenths & Hundredths Fractions: Express ${tenths}/10 as hundredths to compute ${tenths}/10 + ${hundredths}/100.`,
        correctAnswer: ansStr,
        options,
        explanation: `Rewrite ${tenths}/10 as an equivalent fraction with denominator 100: ${tenths}/10 = ${tenths * 10}/100. Then add: ${tenths * 10}/100 + ${hundredths}/100 = ${ansStr}.`,
        hint: `${tenths}/10 equals ${tenths * 10}/100. Now add ${hundredths}/100!`,
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
        prompt: `Decimal Notation for Fractions: Write the decimal ${decStr} as a fraction with a denominator of 100:`,
        correctAnswer: fracStr,
        options,
        explanation: `The decimal ${decStr} represents ${Math.floor(val / 10)} tenths and ${val % 10} hundredths, which equals ${val}/100.`,
        hint: `Two digits after the decimal point represent hundredths (/100).`,
      };
    }

    case '4.NF.C.7': {
      const tenths = prng.nextInt(4, 8);
      const hundredthsVal = (tenths - 1) * 10 + prng.nextInt(2, 9);
      const decA = `0.${tenths}`;
      const decB = `0.${hundredthsVal}`;
      return {
        ...baseMeta,
        prompt: `Comparing Decimals to Hundredths: Which decimal is GREATER, ${decA} or ${decB}? (Caution: compare place value, not number of digits!)`,
        correctAnswer: decA,
        options: prng.shuffle([decA, decB, 'They are equal', `0.0${tenths}`]),
        explanation: `Rewrite ${decA} as hundredths: ${decA} = 0.${tenths}0 (${tenths * 10}/100). Since ${tenths * 10} hundredths > ${hundredthsVal} hundredths, ${decA} > ${decB}.`,
        hint: `Compare the tenths place first: ${tenths} tenths vs ${tenths - 1} tenths!`,
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
        prompt: `Measurement Unit Conversion: Convert ${qty} ${pick.fromUnit} into ${pick.toUnit}. (1 ${pick.fromUnit.slice(0, -1)} = ${pick.factor.toLocaleString()} ${pick.toUnit})`,
        correctAnswer: ansStr,
        options,
        explanation: `Each ${pick.fromUnit.slice(0, -1)} equals ${pick.factor.toLocaleString()} ${pick.toUnit}: ${qty} × ${pick.factor.toLocaleString()} = ${ansStr}.`,
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
        prompt: `Missing Dimension from Area Formula: A rectangular California solar panel array has an area of ${area} sq ft and a length of ${l} ft. What is its width?`,
        correctAnswer: `${w} ft`,
        options: prng.shuffle([`${w} ft`, ...distractors.map((v) => `${v} ft`)]),
        manipulative: { type: 'interactive-geometry', width: l, height: w, unit: 'ft', showAreaGrid: true },
        explanation: `Using the formula Area = length × width (${area} = ${l} × w), divide ${area} ÷ ${l} = ${w} ft.`,
        hint: `Divide the total area (${area}) by the known length (${l}).`,
      };
    }

    case '4.MD.C.6': {
      if (prng.next() < 0.6) {
        const angle = prng.choice([30, 45, 60, 90, 120, 135, 150]);
        const distractors = buildProtractorDistractors(angle);
        const kind = angle < 90 ? 'acute' : angle === 90 ? 'right' : 'obtuse';
        return {
          ...baseMeta,
          prompt: `Use the interactive 180° protractor below: What is the degree measure of this ${kind} angle?`,
          correctAnswer: `${angle}°`,
          options: prng.shuffle([`${angle}°`, ...distractors]),
          manipulative: { type: 'protractor', angle },
          explanation: `Since the base ray points to 0° on the right, read up from 0° along the scale to where the green ray crosses: ${angle}° (${kind} angle).`,
          hint: `Acute angles are < 90°, right angles are 90°, and obtuse angles are > 90°. Don't read the supplementary 180° - θ scale!`,
        };
      } else {
        // Additive angle measure (4.MD.C.7)
        const partA = prng.choice([35, 40, 45, 55]);
        const partB = prng.choice([25, 35, 50]);
        const totalAngle = partA + partB;
        const distractors = [totalAngle + 15, Math.abs(partA - partB), 180 - totalAngle];
        return {
          ...baseMeta,
          prompt: `Additive Angle Measure (4.MD.C.7): A large angle is decomposed into two non-overlapping adjacent angles measuring ${partA}° and ${partB}°. What is the measure of the combined angle?`,
          correctAnswer: `${totalAngle}°`,
          options: prng.shuffle([`${totalAngle}°`, ...distractors.map((d) => `${d}°`)]),
          manipulative: { type: 'protractor', angle: totalAngle },
          explanation: `Angle measure is additive: ${partA}° + ${partB}° = ${totalAngle}°.`,
          hint: `Add the two adjacent angle measures together: ${partA}° + ${partB}°.`,
        };
      }
    }

    case '4.G.A.1': {
      const items = [
        {
          prompt: 'Geometric Lines & Angles: Two lines in the same plane that never intersect and are always the same distance apart are called:',
          ans: 'Parallel lines',
          options: ['Parallel lines', 'Perpendicular lines', 'Intersecting acute lines', 'Line segments'],
          angle: 45,
          exp: 'Parallel lines never intersect and remain equidistant.',
        },
        {
          prompt: 'Two lines that intersect to form four 90° right angles are called:',
          ans: 'Perpendicular lines',
          options: ['Perpendicular lines', 'Parallel lines', 'Obtuse rays', 'Scalene lines'],
          angle: 90,
          exp: 'Perpendicular lines intersect at a 90° right angle.',
        },
        {
          prompt: 'An angle that measures strictly between 90° and 180° (such as 135°) is classified as an:',
          ans: 'Obtuse angle',
          options: ['Obtuse angle', 'Acute angle', 'Right angle', 'Straight angle'],
          angle: 135,
          exp: 'Angles measuring greater than 90° and less than 180° are obtuse.',
        },
        {
          prompt: 'An angle that measures strictly between 0° and 90° (such as 60°) is classified as an:',
          ans: 'Acute angle',
          options: ['Acute angle', 'Obtuse angle', 'Right angle', 'Straight angle'],
          angle: 60,
          exp: 'Angles measuring less than a 90° right angle are acute.',
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
        hint: `Inspect the angle on the interactive protractor model.`,
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
          prompt: `Order of Operations Word Problem: A California school STEM club organized ${teams} robotics teams with ${perTeam} students each. Then ${adjAdded} new students joined, and the entire group was divided equally into ${divisor} testing stations: [(${teams} × ${perTeam}) + ${adjAdded}] ÷ ${divisor}. How many students are at each station?`,
          correctAnswer: ans,
          options,
          explanation: `Inner parentheses first: ${teams} × ${perTeam} = ${teams * perTeam}. Brackets next: ${teams * perTeam} + ${adjAdded} = ${totalPeople}. Finally divide: ${totalPeople} ÷ ${divisor} = ${ans} students.`,
          hint: `Evaluate inside parentheses (${teams} × ${perTeam}), then brackets (+ ${adjAdded}), then divide by ${divisor}.`,
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
          prompt: `Evaluate using Order of Operations (PEMDAS): (${a} + ${b}) × ${c} - ${d}`,
          correctAnswer: ans,
          options: prng.shuffle([ans, ...distractors]),
          explanation: `1. Parentheses: (${a} + ${b} = ${a + b}). 2. Multiply: ${a + b} × ${c} = ${(a + b) * c}. 3. Subtract: ${(a + b) * c} - ${d} = ${ans}.`,
          hint: `PEMDAS: Parentheses first, then Multiplication, then Subtraction.`,
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
        `${a} + (${b} × ${mult})`,
      ]);
      return {
        ...baseMeta,
        prompt: `Write & Interpret Numerical Expressions: Which expression represents "${mult} times as large as the sum of ${a} and ${b}"?`,
        correctAnswer: correctExpr,
        options,
        explanation: `"The sum of ${a} and ${b}" is (${a} + ${b}). Multiplying that entire sum by ${mult} requires parentheses: ${correctExpr}.`,
        hint: `Enclose the sum (${a} + ${b}) in parentheses so it is evaluated before multiplying by ${mult}.`,
      };
    }

    case '5.OA.B.3': {
      const ruleX = prng.nextInt(2, 4);
      const multRatio = prng.choice([2, 3]);
      const ruleY = ruleX * multRatio;
      const stepIdx = prng.nextInt(3, 5);
      const xVal = ruleX * stepIdx;
      const yVal = ruleY * stepIdx;
      const coord = `(${xVal}, ${yVal})`;
      const options = prng.shuffle([
        coord,
        `(${yVal}, ${xVal})`,
        `(${xVal}, ${yVal + ruleX})`,
        `(${xVal + ruleX}, ${yVal})`,
      ]);
      return {
        ...baseMeta,
        prompt: `Two-Rule Numerical Patterns: Pattern X starts at 0 and uses the rule "Add ${ruleX}". Pattern Y starts at 0 and uses the rule "Add ${ruleY}". Notice that each term in Pattern Y is ${multRatio} times the corresponding term in Pattern X. What is the ordered pair (x, y) after ${stepIdx} steps?`,
        correctAnswer: coord,
        options,
        explanation: `After ${stepIdx} steps: x = ${stepIdx} × ${ruleX} = ${xVal}, and y = ${stepIdx} × ${ruleY} = ${yVal}. Ordered pair: ${coord}.`,
        hint: `Multiply ${ruleX} × ${stepIdx} for x, and ${ruleY} × ${stepIdx} for y.`,
      };
    }

    case '5.NBT.A.1': {
      const digit = prng.nextInt(3, 9);
      const numStr = `${digit}${digit}.42`;
      return {
        ...baseMeta,
        prompt: `Base-Ten Place Value Relationships: In the number ${numStr}, how does the value of the ${digit} in the tens place (${digit}0) compare to the value of the ${digit} in the ones place (${digit})?`,
        correctAnswer: '10 times as much',
        options: prng.shuffle(['10 times as much', '1/10 as much', '100 times as much', 'Equal in value']),
        explanation: `In the base-ten system, a digit in one place represents 10 times as much as it represents in the place immediately to its right (${digit}0 = 10 × ${digit}).`,
        hint: `Moving one place to the left multiplies a digit's value by 10.`,
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
        prompt: `Powers of 10 & Exponents: Evaluate ${base} × 10^${exp}.`,
        correctAnswer: prod.toLocaleString(),
        options,
        explanation: `10^${exp} equals ${power.toLocaleString()} (1 followed by ${exp} zeros). Therefore ${base} × 10^${exp} = ${prod.toLocaleString()}.`,
        hint: `The exponent ${exp} tells you how many zeros follow ${base}.`,
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
        prompt: `Decimals to Thousandths (Expanded Form): Write ${whole} + ${tenths}×(1/10) + ${hundredths}×(1/100) + ${thousandths}×(1/1000) in standard decimal form:`,
        correctAnswer: decStr,
        options,
        explanation: `${whole} ones, ${tenths} tenths, ${hundredths} hundredths, and ${thousandths} thousandths is written as ${decStr}.`,
        hint: `1st decimal place = tenths, 2nd = hundredths, 3rd = thousandths.`,
      };
    }

    case '5.NBT.A.4': {
      const whole = prng.nextInt(3, 18);
      const tenths = prng.nextInt(1, 8);
      const hundredths = prng.choice([2, 3, 6, 7, 8]);
      const decVal = `${whole}.${tenths}${hundredths}`;
      const roundedTenths = hundredths >= 5 ? `${whole}.${tenths + 1}` : `${whole}.${tenths}`;
      const candidates = [
        hundredths >= 5 ? `${whole}.${tenths}` : `${whole}.${tenths + 1}`,
        `${whole}.0`,
        `${whole + 1}.0`,
      ];
      const options = generateDistinctStringOptions(roundedTenths, candidates, ['4.5', '6.2', '8.7', '12.4'], 4, prng);
      return {
        ...baseMeta,
        prompt: `Rounding Decimals: Round ${decVal} to the nearest TENTH.`,
        correctAnswer: roundedTenths,
        options,
        explanation: `Inspect the hundredths digit (${hundredths}). Since ${hundredths} is ${hundredths >= 5 ? '5 or greater, round the tenths digit up' : 'less than 5, keep the tenths digit'} to get ${roundedTenths}.`,
        hint: `Look at the hundredths digit (${hundredths}) to decide whether the tenths digit (${tenths}) rounds up.`,
      };
    }

    case '5.NBT.B.5': {
      const a = prng.nextInt(14, 38);
      const b = prng.nextInt(12, 26);
      const prod = a * b;
      const distractors = generateDistinctOptions(prod, 4, 150, 1000, prng).filter((x) => x !== prod).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Fluently Multiply Multi-Digit Whole Numbers: Calculate ${a} × ${b} using the standard algorithm.`,
        correctAnswer: prod,
        options: prng.shuffle([prod, ...distractors]),
        explanation: `Multiply ${a} × ${b % 10} = ${a * (b % 10)}, and ${a} × ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}. Sum = ${prod}.`,
        hint: `Multiply ${a} by the ones digit (${b % 10}), then by the tens digit (${Math.floor(b / 10) * 10}), and add.`,
      };
    }

    case '5.NBT.B.6': {
      const divisor = prng.choice([12, 15, 16, 20, 24, 25]);
      const quotient = prng.nextInt(12, 34);
      const dividend = divisor * quotient;
      const distractors = generateDistinctOptions(quotient, 4, 8, 48, prng).filter((x) => x !== quotient).slice(0, 3);
      return {
        ...baseMeta,
        prompt: `Two-Digit Divisor Division: A Mojave Desert solar farm generated ${dividend} megawatt-hours of clean electricity equally across ${divisor} solar arrays. How many megawatt-hours did each array generate? (${dividend} ÷ ${divisor})`,
        correctAnswer: quotient,
        options: prng.shuffle([quotient, ...distractors]),
        explanation: `Using partial quotients: ${dividend} ÷ ${divisor} = ${quotient} (since ${divisor} × ${quotient} = ${dividend}).`,
        hint: `Break ${dividend} into ${divisor * Math.floor(quotient / 10) * 10} + ${divisor * (quotient % 10)} and divide by ${divisor}.`,
      };
    }

    case '5.NBT.B.7': {
      const variant = forceWordProblem ? 1 : prng.nextInt(1, 3);
      if (variant === 1) {
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
          prompt: `Multi-Step Decimal Word Problem: At a California farmers market, Maya bought ${items} punnets of strawberries for $${priceEach.toFixed(2)} each, plus a jar of wildflower honey for $${extraItem.toFixed(2)}. She paid with a $${billPaid} bill. How much change did she receive?`,
          correctAnswer: `$${changeDue.toFixed(2)}`,
          options,
          explanation: `Strawberries: ${items} × $${priceEach.toFixed(2)} = $${(items * priceEach).toFixed(2)}. Total spent: $${(items * priceEach).toFixed(2)} + $${extraItem.toFixed(2)} = $${totalCost.toFixed(2)}. Change: $${billPaid} - $${totalCost.toFixed(2)} = $${changeDue.toFixed(2)}.`,
          hint: `Step 1: Multiply strawberry cost. Step 2: Add honey. Step 3: Subtract total from $${billPaid}.`,
        };
      } else if (variant === 2) {
        // Decimal multiplication
        const a = prng.choice([1.2, 1.5, 2.4, 2.5, 3.2]);
        const b = prng.choice([1.5, 2.0, 2.5, 3.0, 4.0]);
        const prod = +(a * b).toFixed(2);
        const candidates = [+(prod + 0.5).toFixed(2), +(prod * 10).toFixed(1), +(a + b).toFixed(2)];
        const options = generateDistinctStringOptions(prod, candidates, [3.6, 4.8, 6.25, 7.5, 9.6], 4, prng);
        return {
          ...baseMeta,
          prompt: `Multiplying Decimals to Hundredths: Compute ${a} × ${b}.`,
          correctAnswer: prod,
          options,
          explanation: `Multiply as tenths (${Math.round(a * 10)} tenths × ${Math.round(b * 10)} tenths = ${Math.round(a * 10) * Math.round(b * 10)} hundredths) = ${prod}.`,
          hint: `Multiply ${Math.round(a * 10)} × ${Math.round(b * 10)}, then place the decimal point for hundredths.`,
        };
      } else {
        // Decimal addition/subtraction
        const a = prng.nextInt(35, 85) / 10;
        const b = prng.nextInt(14, 32) / 10;
        const isAdd = prng.next() < 0.5;
        const ans = isAdd ? +(a + b).toFixed(1) : +(a - b).toFixed(1);
        const candidates = [+(ans + 0.1).toFixed(1), +(ans - 0.2).toFixed(1), +(ans + 1.0).toFixed(1)];
        const options = generateDistinctStringOptions(ans, candidates, [2.4, 4.5, 5.8, 6.2, 7.5, 8.4], 4, prng);
        return {
          ...baseMeta,
          prompt: `Decimal Place Value Operation: Calculate ${a.toFixed(1)} ${isAdd ? '+' : '-'} ${b.toFixed(1)}`,
          correctAnswer: ans,
          options,
          explanation: `Align the decimal points vertically: ${a.toFixed(1)} ${isAdd ? '+' : '-'} ${b.toFixed(1)} = ${ans}.`,
          hint: `Line up ones with ones and tenths with tenths.`,
        };
      }
    }

    case '5.NF.A.1': {
      // Procedural symbolic Rational engine for unlike-denominator addition and subtraction!
      const fracPairs = [
        { f1: [1, 2], f2: [1, 4], storyAdd: 'Marcus hiked 1/2 mile in Yosemite Valley and then 1/4 mile to the waterfall overlook.' },
        { f1: [1, 3], f2: [1, 6], storyAdd: 'A sourdough baker in San Francisco used 1/3 bag of flour in the morning and 1/6 bag in the afternoon.' },
        { f1: [2, 5], f2: [3, 10], storyAdd: 'Elena completed 2/5 of her California marine biology project on Monday and 3/10 on Tuesday.' },
        { f1: [3, 8], f2: [1, 4], storyAdd: 'A rain gauge in Mendocino collected 3/8 inch of rain before noon and 1/4 inch after noon.' },
        { f1: [2, 3], f2: [1, 6], storyAdd: 'Leo spent 2/3 of an hour practicing piano and 1/6 of an hour reading.' },
        { f1: [3, 4], f2: [1, 8], storyAdd: 'A water canteen held 3/4 liter of water, and Sofia added 1/8 liter more.' },
        { f1: [1, 2], f2: [2, 5], storyAdd: 'A community garden planted 1/2 of a bed with tomatoes and 2/5 with sweet peppers.' },
        { f1: [1, 3], f2: [1, 4], storyAdd: 'A cyclist rode 1/3 of the Lake Tahoe loop before lunch and 1/4 after lunch.' },
      ];
      const pick = prng.choice(fracPairs);
      const r1 = new Rational(pick.f1[0], pick.f1[1]);
      const r2 = new Rational(pick.f2[0], pick.f2[1]);
      const isAdd = forceWordProblem || prng.next() < 0.65;
      const res = isAdd ? r1.add(r2) : r1.subtract(r2);
      const ansStr = res.toString();

      const candidates = buildFractionAddDistractors(pick.f1[0], pick.f1[1], pick.f2[0], pick.f2[1], ansStr);
      const fallbackPool = ['1/2', '2/3', '3/4', '4/5', '5/6', '7/8', '7/10', '7/12', '9/10'];
      const options = generateDistinctStringOptions(ansStr, candidates, fallbackPool, 4, prng);

      const isWord = forceWordProblem || (isAdd && prng.next() < 0.6);
      const prompt = isWord
        ? `${pick.storyAdd} What fraction did they complete/use in total?`
        : `${isAdd ? 'Add' : 'Subtract'} fractions with unlike denominators: ${pick.f1[0]}/${pick.f1[1]} ${isAdd ? '+' : '-'} ${pick.f2[0]}/${pick.f2[1]}`;

      return {
        ...baseMeta,
        prompt,
        correctAnswer: ansStr,
        options,
        manipulative: { type: 'fraction', numerator: Math.min(res.n, res.d), denominator: Math.min(res.d, 12) },
        explanation: `Find a common denominator for ${pick.f1[1]} and ${pick.f2[1]}, rename both fractions, and ${isAdd ? 'add' : 'subtract'} to get ${ansStr}.`,
        hint: `Never ${isAdd ? 'add' : 'subtract'} unlike denominators directly—rename with a common denominator first!`,
      };
    }

    case '5.NF.B.3': {
      const pairs = [
        { num: 3, den: 4, item: 'granola bars', group: 'hikers' },
        { num: 2, den: 5, item: 'liters of fruit smoothie', group: 'athletes' },
        { num: 4, den: 7, item: 'pounds of trail mix', group: 'campers' },
        { num: 5, den: 8, item: 'pans of cornbread', group: 'tables' },
      ];
      const pick = prng.choice(pairs);
      const ansStr = `${pick.num}/${pick.den}`;
      const candidates = [`${pick.den}/${pick.num}`, `1/${pick.den}`, `${pick.num}/${pick.num + pick.den}`];
      const options = generateDistinctStringOptions(ansStr, candidates, ['1/2', '2/3', '3/4', '3/5', '5/8'], 4, prng);
      return {
        ...baseMeta,
        prompt: `Fractions as Division (a ÷ b = a/b): ${pick.den} ${pick.group} share ${pick.num} ${pick.item} equally. What fraction of a ${pick.item.slice(0, -1)} does each person/table get? (${pick.num} ÷ ${pick.den})`,
        correctAnswer: ansStr,
        options,
        manipulative: { type: 'fraction', numerator: pick.num, denominator: pick.den },
        explanation: `Dividing ${pick.num} wholes equally among ${pick.den} shares gives ${pick.num} ÷ ${pick.den} = ${ansStr}.`,
        hint: `The number being shared (${pick.num}) is the numerator, and the number of equal shares (${pick.den}) is the denominator.`,
      };
    }

    case '5.NF.B.4': {
      const n1 = prng.choice([1, 2, 3]);
      const d1 = prng.choice([4, 5]);
      const n2 = prng.choice([1, 2, 3]);
      const d2 = prng.choice([3, 4]);
      const res = new Rational(n1 * n2, d1 * d2);
      const ansStr = res.toString();
      const candidates = [
        `${n1 + n2}/${d1 + d2}`,
        `${n1}/${d2}`,
        `${res.n}/${Math.max(2, res.d - 1)}`,
        `${Math.min(res.d - 1, res.n + 1)}/${res.d}`,
      ];
      const fallbackPool = ['1/2', '1/3', '2/3', '1/4', '3/4', '1/5', '2/5', '3/10', '7/10'];
      const options = generateDistinctStringOptions(ansStr, candidates, fallbackPool, 4, prng);

      const isWordProblem = forceWordProblem || prng.next() < 0.6;
      const prompt = isWordProblem
        ? `Area with Fractional Side Lengths (5.NF.B.4b): A rectangular pollinator bed in Sacramento is ${n1}/${d1} meter long and ${n2}/${d2} meter wide. What is its area in square meters? (${n1}/${d1} × ${n2}/${d2})`
        : `Multiply fractions and simplify if possible: ${n1}/${d1} × ${n2}/${d2}`;

      return {
        ...baseMeta,
        prompt,
        correctAnswer: ansStr,
        options,
        explanation: `Multiply numerators (${n1} × ${n2} = ${n1 * n2}) and denominators (${d1} × ${d2} = ${d1 * d2}), which simplifies to ${ansStr}.`,
        hint: `Multiply across: (numerator × numerator) / (denominator × denominator), then simplify.`,
      };
    }

    case '5.NF.B.7': {
      const whole = prng.nextInt(3, 8);
      const den = prng.choice([2, 3, 4, 5]);
      if (prng.next() < 0.5) {
        const ans = whole * den;
        const distractors = generateDistinctOptions(ans, 4, 4, 45, prng).filter((x) => x !== ans).slice(0, 3);
        return {
          ...baseMeta,
          prompt: `Dividing a Whole Number by a Unit Fraction: A chef in San Francisco has ${whole} cups of olive oil and pours 1/${den} cup into each dipping bowl. How many bowls can the chef fill? (${whole} ÷ 1/${den})`,
          correctAnswer: ans,
          options: prng.shuffle([ans, ...distractors]),
          explanation: `Each 1 whole cup contains ${den} servings of size 1/${den}. So ${whole} cups contain ${whole} × ${den} = ${ans} servings.`,
          hint: `Ask: How many 1/${den}s are in ${whole} wholes? (${whole} × ${den}).`,
        };
      } else {
        const ansDen = den * whole;
        const ansStr = `1/${ansDen}`;
        const candidates = [`${whole}/${den}`, `1/${den + whole}`, `${den}/${whole}`];
        const options = generateDistinctStringOptions(ansStr, candidates, ['1/6', '1/8', '1/10', '1/12', '1/15', '1/20'], 4, prng);
        return {
          ...baseMeta,
          prompt: `Dividing a Unit Fraction by a Whole Number: A relay team of ${whole} runners shares 1/${den} mile of a Big Sur coastal trail equally. What fraction of a mile does each runner run? (1/${den} ÷ ${whole})`,
          correctAnswer: ansStr,
          options,
          explanation: `Partitioning 1/${den} of a mile into ${whole} equal parts creates parts of size 1/(${den} × ${whole}) = ${ansStr} mile.`,
          hint: `Dividing 1/${den} into ${whole} equal parts multiplies the denominator by ${whole}.`,
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
        prompt: `Multi-Step Measurement Conversion: A sea lion rescue ramp in Sausalito is ${meters} meters and ${extraCm} centimeters long. What is the total length of the ramp in centimeters? (1 m = 100 cm)`,
        correctAnswer: `${totalCm} cm`,
        options,
        explanation: `Convert ${meters} meters to centimeters (${meters} × 100 = ${meters * 100} cm), then add ${extraCm} cm: ${meters * 100} + ${extraCm} = ${totalCm} cm.`,
        hint: `Multiply ${meters} × 100, then add ${extraCm}.`,
      };
    }

    case '5.MD.C.5': {
      const l = prng.nextInt(3, 6);
      const w = prng.nextInt(2, 5);
      const h = prng.nextInt(2, 4);
      const vol = l * w * h;
      if (prng.next() < 0.65) {
        const candidates = [`${vol + l * w} cu ft`, `${Math.max(12, vol - l * w)} cu ft`, `${2 * (l * w + w * h + l * h)} cu ft`, `${l + w + h} cu ft`];
        const fallbackPool = ['24 cu ft', '36 cu ft', '48 cu ft', '60 cu ft', '72 cu ft', '96 cu ft'];
        const options = generateDistinctStringOptions(`${vol} cu ft`, candidates, fallbackPool, 4, prng);
        return {
          ...baseMeta,
          prompt: `3D Volume of a Right Rectangular Prism: A California marine science rescue tank is ${l} feet long, ${w} feet wide, and ${h} feet tall. What is its volume in cubic feet? (Use the 3D Layer Explorer below!)`,
          correctAnswer: `${vol} cu ft`,
          options,
          manipulative: { type: 'volume-prism', length: l, width: w, height: h, unit: 'ft' },
          explanation: `Base area B = ${l} × ${w} = ${l * w} sq ft. Stacking ${h} layers gives Volume = B × h = ${l * w} × ${h} = ${vol} cubic feet.`,
          hint: `Volume = length × width × height (${l} × ${w} × ${h}).`,
        };
      } else {
        // Additive Volume of Composite Prisms (5.MD.C.5c)
        const v2 = prng.choice([12, 16, 20, 24]);
        const totalVol = vol + v2;
        const candidates = [`${vol + 6} cu ft`, `${Math.abs(vol - v2)} cu ft`, `${totalVol + 10} cu ft`];
        const options = generateDistinctStringOptions(`${totalVol} cu ft`, candidates, ['36 cu ft', '48 cu ft', '64 cu ft', '80 cu ft'], 4, prng);
        return {
          ...baseMeta,
          prompt: `Additive Volume of Composite Solids (5.MD.C.5c): An L-shaped aquarium display is made of two non-overlapping rectangular prisms. Section A measures ${l} ft × ${w} ft × ${h} ft, and Section B has a volume of ${v2} cu ft. What is the total combined volume?`,
          correctAnswer: `${totalVol} cu ft`,
          options,
          manipulative: { type: 'volume-prism', length: l, width: w, height: h, unit: 'ft' },
          explanation: `Volume of Section A = ${l} × ${w} × ${h} = ${vol} cu ft. Add Section B: ${vol} + ${v2} = ${totalVol} cu ft.`,
          hint: `First find the volume of Section A (${l} × ${w} × ${h}), then add ${v2}.`,
        };
      }
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
        prompt: `Coordinate Plane (Quadrant 1): A ranger station is plotted at the red star on the coordinate grid below. What ordered pair (x, y) represents its location?`,
        correctAnswer: coordStr,
        options,
        manipulative: { type: 'coordinate', x, y, max: 10 },
        explanation: `Start at the origin (0, 0), move ${x} units right along the horizontal x-axis, then ${y} units up parallel to the vertical y-axis: (${x}, ${y}).`,
        hint: `Always read the horizontal x-coordinate first, then the vertical y-coordinate.`,
      };
    }

    case '5.G.B.3': {
      const hierarchyQuestions = [
        {
          prompt: 'Hierarchy of 2D Figures (5.G.B.3): Because every square has 4 right angles and 2 pairs of parallel opposite sides, which statement is ALWAYS true?',
          ans: 'Every square is also a rectangle and a parallelogram',
          options: [
            'Every square is also a rectangle and a parallelogram',
            'Every rectangle is also a square',
            'Every trapezoid is a parallelogram',
            'No rhombus can be a square',
          ],
          sides: 4,
          exp: 'Attributes belonging to a category (rectangles: 4 right angles) also belong to all subcategories (squares: 4 right angles + 4 equal sides). Thus every square is a rectangle, rhombus, and parallelogram.',
        },
        {
          prompt: 'Triangle Classification (5.G.B.4): A triangle with all 3 sides of equal length and three 60° acute angles is classified as an:',
          ans: 'Equilateral acute triangle',
          options: ['Equilateral acute triangle', 'Scalene right triangle', 'Isosceles obtuse triangle', 'Right equilateral triangle'],
          sides: 3,
          exp: '3 equal sides make it equilateral, and three 60° angles (< 90°) make it acute.',
        },
        {
          prompt: 'Polygon Hierarchy: A quadrilateral with TWO pairs of parallel opposite sides is called a:',
          ans: 'Parallelogram',
          options: ['Parallelogram', 'Trapezoid (exclusive)', 'Pentagon', 'Scalene triangle'],
          sides: 4,
          exp: 'A parallelogram is any quadrilateral with two pairs of parallel sides (rectangles, rhombuses, and squares are all special parallelograms).',
        },
      ];
      const pick = prng.choice(hierarchyQuestions);
      return {
        ...baseMeta,
        prompt: pick.prompt,
        correctAnswer: pick.ans,
        options: prng.shuffle(pick.options),
        manipulative: { type: 'polygon-inspector', sides: pick.sides, shapeName: pick.ans },
        explanation: pick.exp,
        hint: `Think about how subcategories inherit all properties of their parent category.`,
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
    caasppClaim: 'Claim 1: Concepts & Procedures',
    dokLevel: 'DOK 1: Procedural Fluency',
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
    '1/6', '5/6', '1/8', '3/8', '5/8', '7/8', '2/6', '4/6', '2/8', '6/8',
  ];

  return generateDistinctStringOptions(correct, candidates, fallbackFractions, count, prng);
}
