/**
 * Cambrian School District & California Elementary Mathematics Curriculum
 * Aligned with California Common Core State Standards for Mathematics (CCSS-M)
 * Serving Cambrian Park, San Jose, CA:
 * - Fammatre Elementary (Falcons)
 * - Farnham Elementary (Foxes)
 * - Sartorette Elementary (Superstars)
 * - Bagby Elementary (Barracudas)
 * - Steindorf STEAM School (Sharks)
 */

export const DISTRICT_INFO = {
  districtName: 'Cambrian School District',
  location: 'Cambrian Park / San Jose, California',
  county: 'Santa Clara County',
  framework: 'California Mathematics Framework (CCSS-M)',
  schools: [
    {
      id: 'fammatre',
      name: 'Fammatre Elementary',
      mascot: 'Falcons',
      badge: '🦅',
      color: '#3b82f6',
      focus: 'STEAM & Science Exploration',
    },
    {
      id: 'farnham',
      name: 'Farnham Elementary',
      mascot: 'Foxes',
      badge: '🦊',
      color: '#f97316',
      focus: 'Leadership & Inquiry-Based Math',
    },
    {
      id: 'sartorette',
      name: 'Sartorette Elementary',
      mascot: 'Superstars',
      badge: '⭐',
      color: '#eab308',
      focus: 'Discovery & Creative Problem Solving',
    },
    {
      id: 'bagby',
      name: 'Bagby Elementary',
      mascot: 'Barracudas',
      badge: '🐟',
      color: '#06b6d4',
      focus: 'Community & Growth Mindset',
    },
    {
      id: 'steindorf',
      name: 'Steindorf STEAM School',
      mascot: 'Sharks',
      badge: '🦈',
      color: '#10b981',
      focus: 'Engineering, Design & Applied Mathematics',
    },
  ],
};

export const GRADES = [
  { id: 'K', label: 'Kindergarten', code: 'K', ageRange: 'Ages 5-6', icon: '🌱' },
  { id: '1', label: '1st Grade', code: '1', ageRange: 'Ages 6-7', icon: '🚀' },
  { id: '2', label: '2nd Grade', code: '2', ageRange: 'Ages 7-8', icon: '⚡' },
  { id: '3', label: '3rd Grade', code: '3', ageRange: 'Ages 8-9', icon: '🌟' },
  { id: '4', label: '4th Grade', code: '4', ageRange: 'Ages 9-10', icon: '🏆' },
  { id: '5', label: '5th Grade', code: '5', ageRange: 'Ages 10-11', icon: '🎓' },
];

export const DOMAINS = {
  CC: { code: 'CC', name: 'Counting & Cardinality', grades: ['K'] },
  OA: { code: 'OA', name: 'Operations & Algebraic Thinking', grades: ['K', '1', '2', '3', '4', '5'] },
  NBT: { code: 'NBT', name: 'Number & Operations in Base Ten', grades: ['K', '1', '2', '3', '4', '5'] },
  NF: { code: 'NF', name: 'Number & Operations—Fractions', grades: ['3', '4', '5'] },
  MD: { code: 'MD', name: 'Measurement & Data', grades: ['K', '1', '2', '3', '4', '5'] },
  G: { code: 'G', name: 'Geometry', grades: ['K', '1', '2', '3', '4', '5'] },
};

export const STANDARDS = {
  // KINDERGARTEN
  'K.CC.B.4': {
    code: 'K.CC.B.4',
    grade: 'K',
    domain: 'CC',
    title: 'Count Objects and Ten-Frames',
    desc: 'Understand the relationship between numbers and quantities up to 20.',
  },
  'K.OA.A.2': {
    code: 'K.OA.A.2',
    grade: 'K',
    domain: 'OA',
    title: 'Addition & Subtraction within 10',
    desc: 'Solve addition and subtraction word problems and equations within 10.',
  },
  'K.NBT.A.1': {
    code: 'K.NBT.A.1',
    grade: 'K',
    domain: 'NBT',
    title: 'Teen Numbers as 10 and More',
    desc: 'Compose and decompose numbers from 11 to 19 into ten ones and additional ones.',
  },
  'K.MD.A.2': {
    code: 'K.MD.A.2',
    grade: 'K',
    domain: 'MD',
    title: 'Comparing Measurements',
    desc: 'Directly compare two objects with a measurable attribute in common.',
  },
  'K.G.A.2': {
    code: 'K.G.A.2',
    grade: 'K',
    domain: 'G',
    title: 'Shapes & Attributes',
    desc: 'Correctly name 2D and 3D shapes regardless of orientations or size.',
  },

  // 1ST GRADE
  '1.OA.C.6': {
    code: '1.OA.C.6',
    grade: '1',
    domain: 'OA',
    title: 'Add & Subtract within 20',
    desc: 'Add and subtract within 20, demonstrating fluency for addition and subtraction within 10.',
  },
  '1.OA.D.8': {
    code: '1.OA.D.8',
    grade: '1',
    domain: 'OA',
    title: 'Missing Addend Equations',
    desc: 'Determine the unknown whole number in an addition or subtraction equation.',
  },
  '1.NBT.B.2': {
    code: '1.NBT.B.2',
    grade: '1',
    domain: 'NBT',
    title: 'Tens & Ones Place Value',
    desc: 'Understand that the two digits of a two-digit number represent amounts of tens and ones.',
  },
  '1.MD.B.3': {
    code: '1.MD.B.3',
    grade: '1',
    domain: 'MD',
    title: 'Telling Time to Hour and Half Hour',
    desc: 'Tell and write time in hours and half-hours using analog and digital clocks.',
  },
  '1.G.A.3': {
    code: '1.G.A.3',
    grade: '1',
    domain: 'G',
    title: 'Halves and Quarters',
    desc: 'Partition circles and rectangles into two and four equal shares.',
  },

  // 2ND GRADE
  '2.OA.B.2': {
    code: '2.OA.B.2',
    grade: '2',
    domain: 'OA',
    title: 'Mental Addition & Subtraction',
    desc: 'Fluently add and subtract within 20 using mental strategies.',
  },
  '2.NBT.B.7': {
    code: '2.NBT.B.7',
    grade: '2',
    domain: 'NBT',
    title: 'Addition & Subtraction within 1000',
    desc: 'Add and subtract within 1000 using models and place value strategies with regrouping.',
  },
  '2.NBT.A.2': {
    code: '2.NBT.A.2',
    grade: '2',
    domain: 'NBT',
    title: 'Skip Counting (5s, 10s, 100s)',
    desc: 'Count within 1000; skip-count by 5s, 10s, and 100s.',
  },
  '2.MD.C.8': {
    code: '2.MD.C.8',
    grade: '2',
    domain: 'MD',
    title: 'Money (Coins and Dollars)',
    desc: 'Solve word problems involving dollar bills, quarters, dimes, nickels, and pennies.',
  },
  '2.MD.C.7': {
    code: '2.MD.C.7',
    grade: '2',
    domain: 'MD',
    title: 'Time to the Nearest 5 Minutes',
    desc: 'Tell and write time from analog and digital clocks to the nearest five minutes.',
  },

  // 3RD GRADE
  '3.OA.C.7': {
    code: '3.OA.C.7',
    grade: '3',
    domain: 'OA',
    title: 'Multiplication & Division Facts',
    desc: 'Fluently multiply and divide within 100 using strategies like relationship between multiplication and division.',
  },
  '3.OA.A.3': {
    code: '3.OA.A.3',
    grade: '3',
    domain: 'OA',
    title: 'Multiplication Arrays & Word Problems',
    desc: 'Use multiplication and division within 100 to solve word problems in situations involving equal groups and arrays.',
  },
  '3.NF.A.1': {
    code: '3.NF.A.1',
    grade: '3',
    domain: 'NF',
    title: 'Understanding Fractions & Number Lines',
    desc: 'Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts.',
  },
  '3.NBT.A.1': {
    code: '3.NBT.A.1',
    grade: '3',
    domain: 'NBT',
    title: 'Rounding to Nearest 10 and 100',
    desc: 'Use place value understanding to round whole numbers to the nearest 10 or 100.',
  },
  '3.MD.C.7': {
    code: '3.MD.C.7',
    grade: '3',
    domain: 'MD',
    title: 'Area and Perimeter',
    desc: 'Relate area to the operations of multiplication and addition.',
  },

  // 4TH GRADE
  '4.OA.A.3': {
    code: '4.OA.A.3',
    grade: '4',
    domain: 'OA',
    title: 'Multi-Step Real World Problems',
    desc: 'Solve multistep word problems posed with whole numbers and having whole-number answers using four operations.',
  },
  '4.NBT.B.5': {
    code: '4.NBT.B.5',
    grade: '4',
    domain: 'NBT',
    title: 'Multi-Digit Multiplication',
    desc: 'Multiply a whole number of up to four digits by a one-digit whole number, and multiply two two-digit numbers.',
  },
  '4.NF.A.1': {
    code: '4.NF.A.1',
    grade: '4',
    domain: 'NF',
    title: 'Fraction Equivalence & Ordering',
    desc: 'Explain why a fraction a/b is equivalent to a fraction (n×a)/(n×b) using visual fraction models.',
  },
  '4.NF.C.6': {
    code: '4.NF.C.6',
    grade: '4',
    domain: 'NF',
    title: 'Decimals as Fractions (Tenths & Hundredths)',
    desc: 'Use decimal notation for fractions with denominators 10 or 100.',
  },
  '4.MD.C.6': {
    code: '4.MD.C.6',
    grade: '4',
    domain: 'MD',
    title: 'Angles & Protractor Measurement',
    desc: 'Measure angles in whole-number degrees using a protractor. Sketch angles of specified measure.',
  },

  // 5TH GRADE
  '5.OA.A.1': {
    code: '5.OA.A.1',
    grade: '5',
    domain: 'OA',
    title: 'Order of Operations & Expressions',
    desc: 'Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols.',
  },
  '5.NBT.B.7': {
    code: '5.NBT.B.7',
    grade: '5',
    domain: 'NBT',
    title: 'Operations with Decimals',
    desc: 'Add, subtract, multiply, and divide decimals to hundredths using concrete models or drawings.',
  },
  '5.NF.A.1': {
    code: '5.NF.A.1',
    grade: '5',
    domain: 'NF',
    title: 'Add & Subtract Unlike Fractions',
    desc: 'Add and subtract fractions with unlike denominators by replacing given fractions with equivalent fractions.',
  },
  '5.MD.C.5': {
    code: '5.MD.C.5',
    grade: '5',
    domain: 'MD',
    title: 'Volume of Rectangular Prisms',
    desc: 'Relate volume to the operations of multiplication and addition and solve real-world problems.',
  },
  '5.G.A.1': {
    code: '5.G.A.1',
    grade: '5',
    domain: 'G',
    title: 'Coordinate Plane & Graphing',
    desc: 'Use a pair of perpendicular number lines to define a coordinate system and plot (x, y) coordinates.',
  },
};

/**
 * Procedural problem generator creating standards-aligned questions.
 */
export function generateQuestion(grade = '3', domain = null, seed = Math.random) {
  // Find valid standards for the given grade
  let candidateStandards = Object.values(STANDARDS).filter((s) => s.grade === grade);
  if (domain) {
    candidateStandards = candidateStandards.filter((s) => s.domain === domain);
  }
  if (!candidateStandards.length) {
    candidateStandards = Object.values(STANDARDS).filter((s) => s.grade === grade);
  }
  const standard = candidateStandards[Math.floor(seed() * candidateStandards.length)];

  switch (standard.code) {
    // ---------------- KINDERGARTEN ----------------
    case 'K.CC.B.4': {
      const count = Math.floor(seed() * 10) + 1;
      const options = generateDistinctOptions(count, 4, 1, 10, seed);
      return {
        id: `q-K-CC-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: 'K',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `How many dots are in the ten-frame?`,
        correctAnswer: count,
        options,
        manipulative: {
          type: 'ten-frame',
          count,
          total: 10,
        },
        hint: `Count each dot row by row. The top row holds 5 dots.`,
      };
    }

    case 'K.OA.A.2': {
      const a = Math.floor(seed() * 6) + 1;
      const b = Math.floor(seed() * (10 - a)) + 1;
      const isAdd = seed() > 0.4;
      if (isAdd) {
        const sum = a + b;
        const options = generateDistinctOptions(sum, 4, 1, 10, seed);
        return {
          id: `q-K-OA-${Date.now()}-${Math.floor(seed() * 1000)}`,
          grade: 'K',
          standard: standard.code,
          domain: standard.domain,
          title: standard.title,
          prompt: `What is ${a} + ${b}?`,
          correctAnswer: sum,
          options,
          manipulative: {
            type: 'ten-frame',
            count: sum,
            groups: [a, b],
            total: 10,
          },
          hint: `Start with ${a} and count forward ${b} more.`,
        };
      } else {
        const total = a + b;
        const diff = total - a;
        const options = generateDistinctOptions(diff, 4, 0, 10, seed);
        return {
          id: `q-K-OA-${Date.now()}-${Math.floor(seed() * 1000)}`,
          grade: 'K',
          standard: standard.code,
          domain: standard.domain,
          title: standard.title,
          prompt: `What is ${total} - ${a}?`,
          correctAnswer: diff,
          options,
          manipulative: {
            type: 'ten-frame',
            count: total,
            removeCount: a,
            total: 10,
          },
          hint: `Start with ${total} dots and cross out ${a}.`,
        };
      }
    }

    case 'K.NBT.A.1': {
      const ones = Math.floor(seed() * 9) + 1;
      const teen = 10 + ones;
      const options = generateDistinctOptions(teen, 4, 11, 19, seed);
      return {
        id: `q-K-NBT-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: 'K',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `1 full ten-frame and ${ones} extra ones make what number?`,
        correctAnswer: teen,
        options,
        manipulative: {
          type: 'double-ten-frame',
          count: teen,
          firstFull: 10,
          secondCount: ones,
        },
        hint: `10 + ${ones} equals the teen number.`,
      };
    }

    case 'K.G.A.2': {
      const shapes = [
        { name: 'Triangle', sides: 3, vertices: 3 },
        { name: 'Rectangle', sides: 4, vertices: 4 },
        { name: 'Square', sides: 4, vertices: 4 },
        { name: 'Hexagon', sides: 6, vertices: 6 },
        { name: 'Circle', sides: 0, vertices: 0 },
      ];
      const pick = shapes[Math.floor(seed() * shapes.length)];
      const askSides = seed() > 0.5 && pick.sides > 0;
      if (askSides) {
        const options = generateDistinctOptions(pick.sides, 4, 0, 8, seed);
        return {
          id: `q-K-G-${Date.now()}-${Math.floor(seed() * 1000)}`,
          grade: 'K',
          standard: standard.code,
          domain: standard.domain,
          title: standard.title,
          prompt: `How many straight sides does a ${pick.name.toLowerCase()} have?`,
          correctAnswer: pick.sides,
          options,
          manipulative: {
            type: 'shape',
            shapeName: pick.name.toLowerCase(),
          },
          hint: `Count each flat outer edge of the ${pick.name.toLowerCase()}.`,
        };
      } else {
        const shapeNames = shapes.map((s) => s.name);
        const options = shuffleDistinctOptions(pick.name, shapeNames, 4, seed);
        return {
          id: `q-K-G-${Date.now()}-${Math.floor(seed() * 1000)}`,
          grade: 'K',
          standard: standard.code,
          domain: standard.domain,
          title: standard.title,
          prompt: `Which shape has ${pick.sides === 0 ? 'zero corners and curves smoothly' : pick.sides + ' straight sides'}?`,
          correctAnswer: pick.name,
          options,
          manipulative: {
            type: 'shape',
            shapeName: pick.name.toLowerCase(),
          },
          hint: `Think of a ${pick.name}.`,
        };
      }
    }

    // ---------------- 1ST GRADE ----------------
    case '1.OA.C.6': {
      const a = Math.floor(seed() * 9) + 2;
      const b = Math.floor(seed() * 9) + 2;
      const sum = a + b;
      const options = generateDistinctOptions(sum, 4, 4, 20, seed);
      return {
        id: `q-1-OA-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '1',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `Calculate: ${a} + ${b}`,
        correctAnswer: sum,
        options,
        manipulative: {
          type: 'number-line',
          min: 0,
          max: 20,
          start: a,
          hop: b,
          target: sum,
        },
        hint: `Make a 10 first: ${a} + ${10 - a} = 10, then add the rest.`,
      };
    }

    case '1.OA.D.8': {
      const a = Math.floor(seed() * 8) + 3;
      const missing = Math.floor(seed() * 8) + 2;
      const sum = a + missing;
      const options = generateDistinctOptions(missing, 4, 1, 15, seed);
      return {
        id: `q-1-OA8-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '1',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `Find the missing number: ${a} + ❓ = ${sum}`,
        correctAnswer: missing,
        options,
        manipulative: {
          type: 'number-line',
          min: 0,
          max: 20,
          start: a,
          target: sum,
          unknownHop: true,
        },
        hint: `Think subtraction: ${sum} - ${a} = ❓`,
      };
    }

    case '1.NBT.B.2': {
      const tens = Math.floor(seed() * 7) + 1;
      const ones = Math.floor(seed() * 9) + 1;
      const val = tens * 10 + ones;
      const options = generateDistinctOptions(val, 4, 10, 99, seed);
      return {
        id: `q-1-NBT-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '1',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `What number has ${tens} tens and ${ones} ones?`,
        correctAnswer: val,
        options,
        manipulative: {
          type: 'place-value-blocks',
          tens,
          ones,
        },
        hint: `${tens} tens is ${tens * 10}. Then add ${ones}.`,
      };
    }

    case '1.MD.B.3': {
      const hour = Math.floor(seed() * 12) + 1;
      const isHalf = seed() > 0.5;
      const minute = isHalf ? 30 : 0;
      const timeStr = `${hour}:${minute === 0 ? '00' : '30'}`;
      const wrongTimes = [
        `${(hour % 12) + 1}:${minute === 0 ? '00' : '30'}`,
        `${hour}:${minute === 0 ? '30' : '00'}`,
        `${((hour + 10) % 12) + 1}:${minute === 0 ? '00' : '30'}`,
      ];
      const options = shuffleDistinctOptions(timeStr, [timeStr, ...wrongTimes], 4, seed);
      return {
        id: `q-1-MD-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '1',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `What time is shown on the clock?`,
        correctAnswer: timeStr,
        options,
        manipulative: {
          type: 'clock',
          hour,
          minute,
        },
        hint: `The short hand points to the hour (${hour}) and the long hand points to the minutes.`,
      };
    }

    // ---------------- 2ND GRADE ----------------
    case '2.OA.B.2': {
      const a = Math.floor(seed() * 15) + 10;
      const b = Math.floor(seed() * 15) + 10;
      const sum = a + b;
      const options = generateDistinctOptions(sum, 4, 20, 60, seed);
      return {
        id: `q-2-OA-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '2',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `Solve mentally: ${a} + ${b}`,
        correctAnswer: sum,
        options,
        manipulative: {
          type: 'number-line',
          min: 0,
          max: 100,
          start: a,
          hop: b,
          target: sum,
        },
        hint: `Add the tens first (${Math.floor(a / 10) * 10} + ${Math.floor(b / 10) * 10}), then add the ones.`,
      };
    }

    case '2.NBT.B.7': {
      const a = Math.floor(seed() * 300) + 120;
      const b = Math.floor(seed() * 250) + 75;
      const sum = a + b;
      const options = generateDistinctOptions(sum, 4, 200, 800, seed);
      return {
        id: `q-2-NBT7-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '2',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `Fammatre Elementary has ${a} books in STEAM lab and Sartorette adds ${b} more. How many total books?`,
        correctAnswer: sum,
        options,
        manipulative: {
          type: 'place-value-blocks',
          hundreds: Math.floor(sum / 100),
          tens: Math.floor((sum % 100) / 10),
          ones: sum % 10,
        },
        hint: `Align columns: hundreds, tens, and ones with regrouping if needed.`,
      };
    }

    case '2.NBT.A.2': {
      const step = [5, 10, 100][Math.floor(seed() * 3)];
      const start = Math.floor(seed() * 4) * step + step;
      const seq = [start, start + step, start + 2 * step, start + 3 * step];
      const next = start + 4 * step;
      const options = generateDistinctOptions(next, 4, 10, 500, seed);
      return {
        id: `q-2-NBT2-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '2',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `What comes next in the skip-counting pattern: ${seq.join(', ')}, ❓`,
        correctAnswer: next,
        options,
        manipulative: {
          type: 'number-line',
          min: start - step,
          max: next + step,
          start: seq[0],
          hop: step,
          target: next,
        },
        hint: `Each hop is counting by ${step}.`,
      };
    }

    case '2.MD.C.8': {
      // Money: coins
      const quarters = Math.floor(seed() * 3) + 1; // 25 to 75
      const dimes = Math.floor(seed() * 3) + 1;    // 10 to 30
      const nickels = Math.floor(seed() * 2);      // 0 to 10
      const pennies = Math.floor(seed() * 4) + 1;  // 1 to 4
      const totalCents = quarters * 25 + dimes * 10 + nickels * 5 + pennies * 1;
      const options = generateDistinctOptions(totalCents, 4, 25, 150, seed);
      return {
        id: `q-2-MD8-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '2',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `How much money is in the tray? (${quarters} quarters, ${dimes} dimes, ${nickels} nickels, ${pennies} pennies)`,
        correctAnswer: `${totalCents}¢`,
        options: options.map((v) => `${v}¢`),
        manipulative: {
          type: 'money',
          coins: { quarters, dimes, nickels, pennies },
          totalCents,
        },
        hint: `Quarters are 25¢, dimes are 10¢, nickels are 5¢, and pennies are 1¢.`,
      };
    }

    // ---------------- 3RD GRADE ----------------
    case '3.OA.C.7': {
      const a = Math.floor(seed() * 9) + 2;
      const b = Math.floor(seed() * 9) + 2;
      const prod = a * b;
      const options = generateDistinctOptions(prod, 4, 4, 100, seed);
      return {
        id: `q-3-OA7-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '3',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `What is ${a} × ${b}?`,
        correctAnswer: prod,
        options,
        manipulative: {
          type: 'array',
          rows: a,
          cols: b,
        },
        hint: `Think of ${a} rows with ${b} items in each row.`,
      };
    }

    case '3.NF.A.1': {
      const den = [2, 3, 4, 6, 8][Math.floor(seed() * 5)];
      const num = Math.floor(seed() * (den - 1)) + 1;
      const fracStr = `${num}/${den}`;
      const wrongFracs = [
        `${den - num}/${den}`,
        `${num}/${den === 8 ? 6 : den + 1}`,
        `1/${den}`,
      ];
      const options = shuffleDistinctOptions(fracStr, [fracStr, ...wrongFracs], 4, seed);
      return {
        id: `q-3-NF1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '3',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `What fraction of the shape is shaded?`,
        correctAnswer: fracStr,
        options,
        manipulative: {
          type: 'fraction',
          numerator: num,
          denominator: den,
        },
        hint: `The top number (numerator) is the shaded parts (${num}). The bottom number (denominator) is the total equal parts (${den}).`,
      };
    }

    case '3.NBT.A.1': {
      const roundTo = seed() > 0.5 ? 10 : 100;
      const num = Math.floor(seed() * 800) + 123;
      const rounded = Math.round(num / roundTo) * roundTo;
      const options = generateDistinctOptions(rounded, 4, Math.max(0, rounded - 150), rounded + 150, seed);
      return {
        id: `q-3-NBT1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '3',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `Round ${num} to the nearest ${roundTo}.`,
        correctAnswer: rounded,
        options,
        manipulative: {
          type: 'number-line',
          min: Math.floor(num / roundTo) * roundTo,
          max: (Math.floor(num / roundTo) + 1) * roundTo,
          target: num,
        },
        hint: `Look at the digit immediately to the right. 5 or higher rounds UP, 4 or lower stays the same.`,
      };
    }

    case '3.MD.C.7': {
      const l = Math.floor(seed() * 7) + 3;
      const w = Math.floor(seed() * 6) + 2;
      const area = l * w;
      const options = generateDistinctOptions(area, 4, 10, 80, seed);
      return {
        id: `q-3-MD7-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '3',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `A garden bed at Farnham Elementary is ${l} feet long and ${w} feet wide. What is its area?`,
        correctAnswer: `${area} sq ft`,
        options: options.map((v) => `${v} sq ft`),
        manipulative: {
          type: 'array',
          rows: w,
          cols: l,
          unit: 'ft',
        },
        hint: `Area of a rectangle = length × width (${l} × ${w}).`,
      };
    }

    // ---------------- 4TH GRADE ----------------
    case '4.OA.A.3': {
      // Word problem Cambrian Park farmers market
      const boxes = Math.floor(seed() * 4) + 3;
      const perBox = Math.floor(seed() * 6) + 6;
      const sold = Math.floor(seed() * 10) + 5;
      const total = boxes * perBox;
      const left = total - sold;
      const options = generateDistinctOptions(left, 4, 1, 50, seed);
      return {
        id: `q-4-OA3-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '4',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `At the Cambrian Park Farmers Market, the Bagby school booth has ${boxes} boxes with ${perBox} organic apples in each. If they sell ${sold} apples, how many apples remain?`,
        correctAnswer: left,
        options,
        hint: `Step 1: Find total apples (${boxes} × ${perBox} = ${total}). Step 2: Subtract ${sold}.`,
      };
    }

    case '4.NBT.B.5': {
      const a = Math.floor(seed() * 45) + 15;
      const b = Math.floor(seed() * 8) + 3;
      const prod = a * b;
      const options = generateDistinctOptions(prod, 4, 50, 600, seed);
      return {
        id: `q-4-NBT5-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '4',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `Multiply: ${a} × ${b}`,
        correctAnswer: prod,
        options,
        manipulative: {
          type: 'area-model',
          dimA: a,
          dimB: b,
        },
        hint: `Break ${a} into tens and ones: (${Math.floor(a / 10) * 10} × ${b}) + (${a % 10} × ${b}).`,
      };
    }

    case '4.NF.A.1': {
      const mult = Math.floor(seed() * 3) + 2;
      const baseNum = [1, 2, 3][Math.floor(seed() * 3)];
      const baseDen = [2, 3, 4, 5][Math.floor(seed() * 4)];
      const eqNum = baseNum * mult;
      const eqDen = baseDen * mult;
      const targetStr = `${eqNum}/${eqDen}`;
      const wrong = [
        `${baseNum + mult}/${baseDen + mult}`,
        `${eqNum}/${baseDen}`,
        `${baseNum}/${eqDen}`,
      ];
      const options = shuffleDistinctOptions(targetStr, [targetStr, ...wrong], 4, seed);
      return {
        id: `q-4-NF1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '4',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `Which fraction is equivalent to ${baseNum}/${baseDen}?`,
        correctAnswer: targetStr,
        options,
        manipulative: {
          type: 'fraction',
          numerator: baseNum,
          denominator: baseDen,
        },
        hint: `Multiply both numerator and denominator by ${mult}: (${baseNum}×${mult})/(${baseDen}×${mult}).`,
      };
    }

    case '4.MD.C.6': {
      const angle = [30, 45, 60, 90, 120, 135, 150][Math.floor(seed() * 7)];
      const options = generateDistinctOptions(angle, 4, 20, 180, seed);
      return {
        id: `q-4-MD6-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '4',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `What is the degree measure of this angle?`,
        correctAnswer: `${angle}°`,
        options: options.map((v) => `${v}°`),
        manipulative: {
          type: 'angle',
          degrees: angle,
        },
        hint: `A right angle is 90°. Acute is less than 90°, obtuse is greater than 90°.`,
      };
    }

    // ---------------- 5TH GRADE ----------------
    case '5.OA.A.1': {
      // Order of operations: (a + b) * c - d
      const a = Math.floor(seed() * 6) + 2;
      const b = Math.floor(seed() * 6) + 2;
      const c = Math.floor(seed() * 4) + 2;
      const d = Math.floor(seed() * 5) + 1;
      const ans = (a + b) * c - d;
      const options = generateDistinctOptions(ans, 4, 5, 80, seed);
      return {
        id: `q-5-OA1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '5',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `Evaluate the expression: (${a} + ${b}) × ${c} - ${d}`,
        correctAnswer: ans,
        options,
        hint: `Follow PEMDAS: 1st evaluate parentheses (${a} + ${b} = ${a + b}), 2nd multiply by ${c}, 3rd subtract ${d}.`,
      };
    }

    case '5.NBT.B.7': {
      const a = (Math.floor(seed() * 50) + 10) / 10; // 1.0 to 6.0
      const b = (Math.floor(seed() * 40) + 10) / 10; // 1.0 to 5.0
      const sum = +(a + b).toFixed(1);
      const wrong = [
        +(sum + 0.1).toFixed(1),
        +(sum - 0.2).toFixed(1),
        +(sum + 1.0).toFixed(1),
      ];
      const options = shuffleDistinctOptions(sum, [sum, ...wrong], 4, seed);
      return {
        id: `q-5-NBT7-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '5',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `Calculate: ${a.toFixed(1)} + ${b.toFixed(1)}`,
        correctAnswer: sum,
        options,
        hint: `Line up the decimal points and add each column from right to left.`,
      };
    }

    case '5.NF.A.1': {
      // Unlike fractions: 1/2 + 1/4 = 3/4 or 1/3 + 1/6 = 3/6 = 1/2
      const pairs = [
        { f1: '1/2', f2: '1/4', ans: '3/4', num: 3, den: 4 },
        { f1: '1/3', f2: '1/6', ans: '1/2', num: 1, den: 2 },
        { f1: '2/5', f2: '3/10', ans: '7/10', num: 7, den: 10 },
        { f1: '1/4', f2: '3/8', ans: '5/8', num: 5, den: 8 },
        { f1: '2/3', f2: '1/6', ans: '5/6', num: 5, den: 6 },
      ];
      const pick = pairs[Math.floor(seed() * pairs.length)];
      const wrong = ['2/6', '4/7', '3/8', '2/5'].filter((x) => x !== pick.ans).slice(0, 3);
      const options = shuffleDistinctOptions(pick.ans, [pick.ans, ...wrong], 4, seed);
      return {
        id: `q-5-NF1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '5',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `Add the fractions with unlike denominators: ${pick.f1} + ${pick.f2}`,
        correctAnswer: pick.ans,
        options,
        manipulative: {
          type: 'fraction',
          numerator: pick.num,
          denominator: pick.den,
        },
        hint: `Find a common denominator first, then add the numerators.`,
      };
    }

    case '5.MD.C.5': {
      const l = Math.floor(seed() * 5) + 3;
      const w = Math.floor(seed() * 4) + 2;
      const h = Math.floor(seed() * 4) + 2;
      const vol = l * w * h;
      const options = generateDistinctOptions(vol, 4, 12, 160, seed);
      return {
        id: `q-5-MD5-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '5',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `A robotics kit container at Steindorf STEAM School is ${l} in long, ${w} in wide, and ${h} in tall. What is its volume?`,
        correctAnswer: `${vol} cu in`,
        options: options.map((v) => `${v} cu in`),
        manipulative: {
          type: 'prism-volume',
          l,
          w,
          h,
        },
        hint: `Volume of a rectangular prism = length × width × height (${l} × ${w} × ${h}).`,
      };
    }

    case '5.G.A.1': {
      const x = Math.floor(seed() * 8) + 1;
      const y = Math.floor(seed() * 8) + 1;
      const coordStr = `(${x}, ${y})`;
      const wrong = [
        `(${y}, ${x})`,
        `(${Math.max(1, x - 1)}, ${y})`,
        `(${x}, ${Math.max(1, y - 1)})`,
      ];
      const options = shuffleDistinctOptions(coordStr, [coordStr, ...wrong], 4, seed);
      return {
        id: `q-5-G1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '5',
        standard: standard.code,
        domain: standard.domain,
        title: standard.title,
        prompt: `What are the coordinates (x, y) of the plotted star on the grid?`,
        correctAnswer: coordStr,
        options,
        manipulative: {
          type: 'coordinate',
          x,
          y,
          max: 10,
        },
        hint: `Read along the horizontal x-axis first (${x}), then up along the vertical y-axis (${y}).`,
      };
    }

    default: {
      // Fallback simple addition
      const a = 5;
      const b = 4;
      return {
        id: `q-fallback-${Date.now()}`,
        grade,
        standard: 'K.OA.A.2',
        domain: 'OA',
        title: 'Basic Addition',
        prompt: `What is ${a} + ${b}?`,
        correctAnswer: a + b,
        options: [8, 9, 10, 11],
        hint: `Add 5 and 4.`,
      };
    }
  }
}

function generateDistinctOptions(correct, count = 4, min = 0, max = 100, seed = Math.random) {
  const set = new Set([correct]);
  let attempts = 0;
  while (set.size < count && attempts < 100) {
    attempts += 1;
    const delta = Math.floor(seed() * 9) - 4; // -4 to +4
    const cand = correct + (delta === 0 ? (seed() > 0.5 ? 1 : -1) : delta);
    if (cand >= min && cand <= max) {
      set.add(cand);
    }
  }
  // Fill remaining if needed
  let fill = 1;
  while (set.size < count) {
    set.add(correct + fill);
    fill += 1;
  }
  const arr = Array.from(set);
  return shuffle(arr, seed);
}

function shuffleDistinctOptions(correct, candidates, count = 4, seed = Math.random) {
  const set = new Set([correct]);
  for (const c of candidates) {
    if (set.size < count) set.add(c);
  }
  const arr = Array.from(set);
  return shuffle(arr, seed);
}

export function shuffle(items, seed = Math.random) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seed() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
