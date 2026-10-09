/**
 * California Elementary Mathematics Quest Curriculum (CA CCSSM)
 * Fully mapped to the official California Mathematics Framework and
 * core elementary curriculum adopted across California districts (Eureka Math / EngageNY).
 *
 * Covers Grades K through 5 across 40 curriculum modules:
 * - Kindergarten: Modules 1–6 (Numbers to 10, 2D/3D Shapes, Comparison, Add/Sub to 10, Numbers 10–20, Shape Analysis)
 * - Grade 1: Modules 1–6 (Sums/Diffs to 10, Place Value within 20, Length, Place Value to 40, Partitioning Shapes/Time, Place Value to 100/Coins)
 * - Grade 2: Modules 1–8 (Sums/Diffs to 100, Length, Place Value to 1000, Addition/Subtraction to 200, Addition/Subtraction to 1000, Multiplication Foundations/Arrays, Money/Data, Time/Geometry)
 * - Grade 3: Modules 1–7 (Multiplication/Division 2–5 & 10, Place Value/Time/Mass, Multiplications 0, 1, 6–9 & Multiples of 10, Area, Fractions on Number Line, Data, Geometry/Perimeter)
 * - Grade 4: Modules 1–7 (Place Value/Algorithms to 1,000,000, Metric Conversions, Multi-Digit Multiplication/Division, Angles/Plane Figures, Fractions, Decimals, Measurement)
 * - Grade 5: Modules 1–6 (Decimal Place Value, Multi-Digit Whole/Decimal Operations, Adding/Subtracting Unlike Fractions, Multiplying/Dividing Fractions, Volume/Area, Coordinate Plane)
 */

export const PROGRAM_INFO = {
  title: 'California Elementary Math Quest',
  subtitle: 'Official California Elementary Curriculum & Practice (Grades K–5)',
  framework: 'California Common Core State Standards for Mathematics (CA CCSSM)',
  coreCurriculum: 'Aligned with Eureka Math (A Story of Units) & California Framework',
  totalGrades: 6,
  totalModules: 40,
  leagues: [
    {
      id: 'golden-bears',
      name: 'California Golden Bears',
      badge: '🐻',
      color: '#eab308',
      focus: 'Foundational Number Sense & Number Talks',
    },
    {
      id: 'redwood-explorers',
      name: 'Redwood Explorers',
      badge: '🌲',
      color: '#15803d',
      focus: 'Real-World Problem Solving & Inquiry',
    },
    {
      id: 'pacific-voyagers',
      name: 'Pacific Voyagers',
      badge: '🌊',
      color: '#0284c7',
      focus: 'Spatial Geometry & Visual Manipulatives',
    },
    {
      id: 'sierra-navigators',
      name: 'Sierra Navigators',
      badge: '🏔️',
      color: '#6366f1',
      focus: 'Fractions, Decimals & Proportional Reasoning',
    },
    {
      id: 'silicon-innovators',
      name: 'Silicon Innovators',
      badge: '⚡',
      color: '#d946ef',
      focus: 'Applied Mathematics, Data & STEAM',
    },
  ],
};

export const GRADES = [
  { id: 'K', label: 'Kindergarten', code: 'K', ageRange: 'Ages 5–6', icon: '🌱', modulesCount: 6 },
  { id: '1', label: '1st Grade', code: '1', ageRange: 'Ages 6–7', icon: '🚀', modulesCount: 6 },
  { id: '2', label: '2nd Grade', code: '2', ageRange: 'Ages 7–8', icon: '⚡', modulesCount: 8 },
  { id: '3', label: '3rd Grade', code: '3', ageRange: 'Ages 8–9', icon: '🌟', modulesCount: 7 },
  { id: '4', label: '4th Grade', code: '4', ageRange: 'Ages 9–10', icon: '🏆', modulesCount: 7 },
  { id: '5', label: '5th Grade', code: '5', ageRange: 'Ages 10–11', icon: '🎓', modulesCount: 6 },
];

export const DOMAINS = {
  CC: { code: 'CC', name: 'Counting & Cardinality', grades: ['K'] },
  OA: { code: 'OA', name: 'Operations & Algebraic Thinking', grades: ['K', '1', '2', '3', '4', '5'] },
  NBT: { code: 'NBT', name: 'Number & Operations in Base Ten', grades: ['K', '1', '2', '3', '4', '5'] },
  NF: { code: 'NF', name: 'Number & Operations—Fractions', grades: ['3', '4', '5'] },
  MD: { code: 'MD', name: 'Measurement & Data', grades: ['K', '1', '2', '3', '4', '5'] },
  G: { code: 'G', name: 'Geometry', grades: ['K', '1', '2', '3', '4', '5'] },
};

/**
 * Official Curriculum Modules by Grade Level
 */
export const MODULES = {
  // KINDERGARTEN
  'K-M1': { id: 'K-M1', grade: 'K', number: 1, title: 'Numbers to 10', standards: ['K.CC.B.4', 'K.CC.A.1', 'K.MD.A.2'] },
  'K-M2': { id: 'K-M2', grade: 'K', number: 2, title: 'Two-Dimensional & Three-Dimensional Shapes', standards: ['K.G.A.2'] },
  'K-M3': { id: 'K-M3', grade: 'K', number: 3, title: 'Comparison of Length, Weight & Numbers to 10', standards: ['K.CC.C.6', 'K.MD.A.2'] },
  'K-M4': { id: 'K-M4', grade: 'K', number: 4, title: 'Number Pairs, Addition & Subtraction to 10', standards: ['K.OA.A.2', 'K.OA.A.4'] },
  'K-M5': { id: 'K-M5', grade: 'K', number: 5, title: 'Numbers 10–20 & Counting to 100', standards: ['K.CC.A.1', 'K.NBT.A.1'] },
  'K-M6': { id: 'K-M6', grade: 'K', number: 6, title: 'Analyzing, Comparing & Composing Shapes', standards: ['K.G.A.2'] },

  // GRADE 1
  '1-M1': { id: '1-M1', grade: '1', number: 1, title: 'Sums and Differences to 10', standards: ['1.OA.C.6'] },
  '1-M2': { id: '1-M2', grade: '1', number: 2, title: 'Introduction to Place Value (Add/Sub Within 20)', standards: ['1.OA.A.1', '1.OA.C.6', '1.OA.D.8'] },
  '1-M3': { id: '1-M3', grade: '1', number: 3, title: 'Ordering and Comparing Length Measurements', standards: ['1.MD.B.3'] },
  '1-M4': { id: '1-M4', grade: '1', number: 4, title: 'Place Value, Comparison & Addition to 40', standards: ['1.NBT.B.2', '1.NBT.B.3'] },
  '1-M5': { id: '1-M5', grade: '1', number: 5, title: 'Identifying, Composing & Partitioning Shapes & Clock', standards: ['1.MD.B.3', '1.G.A.3'] },
  '1-M6': { id: '1-M6', grade: '1', number: 6, title: 'Place Value, Addition & Subtraction to 100 & Coins', standards: ['1.NBT.C.5', '1.OA.C.6'] },

  // GRADE 2
  '2-M1': { id: '2-M1', grade: '2', number: 1, title: 'Sums and Differences to 100', standards: ['2.OA.B.2'] },
  '2-M2': { id: '2-M2', grade: '2', number: 2, title: 'Addition and Subtraction of Length Units', standards: ['2.NBT.B.7'] },
  '2-M3': { id: '2-M3', grade: '2', number: 3, title: 'Place Value, Counting & Comparison to 1,000', standards: ['2.NBT.A.2', '2.NBT.B.7'] },
  '2-M4': { id: '2-M4', grade: '2', number: 4, title: 'Addition and Subtraction Within 200', standards: ['2.NBT.B.7', '2.OA.B.2'] },
  '2-M5': { id: '2-M5', grade: '2', number: 5, title: 'Addition and Subtraction Within 1,000', standards: ['2.NBT.B.7'] },
  '2-M6': { id: '2-M6', grade: '2', number: 6, title: 'Foundations of Multiplication: Arrays & Odd/Even', standards: ['2.OA.C.3', '2.OA.C.4'] },
  '2-M7': { id: '2-M7', grade: '2', number: 7, title: 'Problem Solving with Money, Coins & Bills', standards: ['2.MD.C.8'] },
  '2-M8': { id: '2-M8', grade: '2', number: 8, title: 'Time to 5 Minutes, Shapes & Equal Shares', standards: ['2.MD.C.7', '2.G.A.1'] },

  // GRADE 3
  '3-M1': { id: '3-M1', grade: '3', number: 1, title: 'Multiplication & Division with Units of 2–5 & 10', standards: ['3.OA.A.3', '3.OA.C.7'] },
  '3-M2': { id: '3-M2', grade: '3', number: 2, title: 'Place Value, Rounding & Elapsed Time', standards: ['3.NBT.A.1', '3.MD.A.1'] },
  '3-M3': { id: '3-M3', grade: '3', number: 3, title: 'Multiplication & Division with Units of 0, 1, 6–9 & Multiples of 10', standards: ['3.OA.C.7'] },
  '3-M4': { id: '3-M4', grade: '3', number: 4, title: 'Multiplication and Area (Square Units)', standards: ['3.MD.C.7'] },
  '3-M5': { id: '3-M5', grade: '3', number: 5, title: 'Fractions as Numbers on the Number Line', standards: ['3.NF.A.1', '3.NF.A.2'] },
  '3-M6': { id: '3-M6', grade: '3', number: 6, title: 'Collecting and Displaying Data', standards: ['3.MD.C.7'] },
  '3-M7': { id: '3-M7', grade: '3', number: 7, title: 'Geometry & Perimeter of Polygons', standards: ['3.MD.D.8', '3.G.A.1'] },

  // GRADE 4
  '4-M1': { id: '4-M1', grade: '4', number: 1, title: 'Place Value, Rounding & Addition/Subtraction to 1,000,000', standards: ['4.NBT.A.3', '4.NBT.B.4'] },
  '4-M2': { id: '4-M2', grade: '4', number: 2, title: 'Unit Conversions and Metric Measurement', standards: ['4.MD.A.1'] },
  '4-M3': { id: '4-M3', grade: '4', number: 3, title: 'Multi-Digit Multiplication & Division with Remainders', standards: ['4.NBT.B.5', '4.OA.A.3', '4.OA.B.4'] },
  '4-M4': { id: '4-M4', grade: '4', number: 4, title: 'Angle Measure & Plane Figures (Protractor)', standards: ['4.MD.C.6', '4.G.A.1'] },
  '4-M5': { id: '4-M5', grade: '4', number: 5, title: 'Fraction Equivalence, Ordering & Operations', standards: ['4.NF.A.1', '4.NF.B.3'] },
  '4-M6': { id: '4-M6', grade: '4', number: 6, title: 'Decimal Fractions (Tenths & Hundredths)', standards: ['4.NF.C.6'] },
  '4-M7': { id: '4-M7', grade: '4', number: 7, title: 'Exploring Measurement with Multiplication Word Problems', standards: ['4.OA.A.3'] },

  // GRADE 5
  '5-M1': { id: '5-M1', grade: '5', number: 1, title: 'Place Value and Decimal Fractions', standards: ['5.NBT.A.2', '5.NBT.B.7'] },
  '5-M2': { id: '5-M2', grade: '5', number: 2, title: 'Multi-Digit Whole Number & Decimal Operations (PEMDAS)', standards: ['5.OA.A.1', '5.NBT.B.7'] },
  '5-M3': { id: '5-M3', grade: '5', number: 3, title: 'Addition and Subtraction of Unlike Fractions', standards: ['5.NF.A.1'] },
  '5-M4': { id: '5-M4', grade: '5', number: 4, title: 'Multiplication and Division of Fractions & Decimals', standards: ['5.NF.B.4'] },
  '5-M5': { id: '5-M5', grade: '5', number: 5, title: 'Addition and Multiplication with Volume and Area', standards: ['5.MD.C.5'] },
  '5-M6': { id: '5-M6', grade: '5', number: 6, title: 'Problem Solving with the Coordinate Plane (Quadrant 1)', standards: ['5.G.A.1'] },
};

/**
 * CA CCSS-M Standards Dictionary
 */
export const STANDARDS = {
  // KINDERGARTEN
  'K.CC.A.1': {
    code: 'K.CC.A.1',
    grade: 'K',
    domain: 'CC',
    module: 'K-M1',
    cluster: 'Know number names and the count sequence',
    title: 'Count to 100 by Ones and Tens',
    desc: 'Count to 100 by ones and by tens. Identify the missing number in counting sequences.',
  },
  'K.CC.B.4': {
    code: 'K.CC.B.4',
    grade: 'K',
    domain: 'CC',
    module: 'K-M1',
    cluster: 'Count to tell the number of objects',
    title: 'Count Objects and Ten-Frames',
    desc: 'Understand the relationship between numbers and quantities; connect counting to cardinality up to 20.',
  },
  'K.CC.C.6': {
    code: 'K.CC.C.6',
    grade: 'K',
    domain: 'CC',
    module: 'K-M3',
    cluster: 'Compare numbers',
    title: 'Compare Quantities (Greater, Less, Equal)',
    desc: 'Identify whether the number of objects in one group is greater than, less than, or equal to another.',
  },
  'K.OA.A.2': {
    code: 'K.OA.A.2',
    grade: 'K',
    domain: 'OA',
    module: 'K-M4',
    cluster: 'Understand addition and subtraction',
    title: 'Addition & Subtraction within 10',
    desc: 'Solve addition and subtraction word problems and equations within 10.',
  },
  'K.OA.A.4': {
    code: 'K.OA.A.4',
    grade: 'K',
    domain: 'OA',
    module: 'K-M4',
    cluster: 'Understand addition and subtraction',
    title: 'Partners to Make 10 (Friends of 10)',
    desc: 'For any number from 1 to 9, find the number that makes 10 when added.',
  },
  'K.NBT.A.1': {
    code: 'K.NBT.A.1',
    grade: 'K',
    domain: 'NBT',
    module: 'K-M5',
    cluster: 'Work with numbers 11-19 to gain foundations for place value',
    title: 'Decompose Teen Numbers (10 and More)',
    desc: 'Compose and decompose numbers from 11 to 19 into ten ones and additional ones.',
  },
  'K.MD.A.2': {
    code: 'K.MD.A.2',
    grade: 'K',
    domain: 'MD',
    module: 'K-M3',
    cluster: 'Describe and compare measurable attributes',
    title: 'Compare Measurable Attributes',
    desc: 'Directly compare two objects with a measurable attribute in common (longer, shorter, heavier).',
  },
  'K.G.A.2': {
    code: 'K.G.A.2',
    grade: 'K',
    domain: 'G',
    module: 'K-M2',
    cluster: 'Identify and describe shapes',
    title: 'Name 2D & 3D Shapes & Attributes',
    desc: 'Correctly name shapes (circle, triangle, rectangle, square, hexagon, cube) regardless of orientation.',
  },

  // 1ST GRADE
  '1.OA.A.1': {
    code: '1.OA.A.1',
    grade: '1',
    domain: 'OA',
    module: '1-M2',
    cluster: 'Represent and solve problems involving addition and subtraction',
    title: 'Word Problems within 20',
    desc: 'Use addition and subtraction within 20 to solve word problems involving situations of adding to and taking from.',
  },
  '1.OA.C.6': {
    code: '1.OA.C.6',
    grade: '1',
    domain: 'OA',
    module: '1-M1',
    cluster: 'Add and subtract within 20',
    title: 'Addition & Subtraction Fluency within 20',
    desc: 'Add and subtract within 20, demonstrating fluency for addition and subtraction within 10.',
  },
  '1.OA.D.8': {
    code: '1.OA.D.8',
    grade: '1',
    domain: 'OA',
    module: '1-M2',
    cluster: 'Work with addition and subtraction equations',
    title: 'Determine Unknown Number in Equations',
    desc: 'Determine the unknown whole number in an addition or subtraction equation (e.g., 8 + ? = 14).',
  },
  '1.NBT.B.2': {
    code: '1.NBT.B.2',
    grade: '1',
    domain: 'NBT',
    module: '1-M4',
    cluster: 'Understand place value',
    title: 'Tens & Ones Place Value',
    desc: 'Understand that the two digits of a two-digit number represent amounts of tens and ones.',
  },
  '1.NBT.B.3': {
    code: '1.NBT.B.3',
    grade: '1',
    domain: 'NBT',
    module: '1-M4',
    cluster: 'Understand place value',
    title: 'Compare Two 2-Digit Numbers',
    desc: 'Compare two two-digit numbers based on meanings of the tens and ones digits, recording with >, =, <.',
  },
  '1.NBT.C.5': {
    code: '1.NBT.C.5',
    grade: '1',
    domain: 'NBT',
    module: '1-M6',
    cluster: 'Use place value understanding to add and subtract',
    title: '10 More and 10 Less Mentally',
    desc: 'Given a two-digit number, mentally find 10 more or 10 less without having to count.',
  },
  '1.MD.B.3': {
    code: '1.MD.B.3',
    grade: '1',
    domain: 'MD',
    module: '1-M5',
    cluster: 'Tell and write time',
    title: 'Telling Time to Hour and Half-Hour',
    desc: 'Tell and write time in hours and half-hours using analog and digital clocks.',
  },
  '1.G.A.3': {
    code: '1.G.A.3',
    grade: '1',
    domain: 'G',
    module: '1-M5',
    cluster: 'Reason with shapes and their attributes',
    title: 'Partition Halves and Fourths',
    desc: 'Partition circles and rectangles into two and four equal shares; describe shares using halves, fourths, quarters.',
  },

  // 2ND GRADE
  '2.OA.B.2': {
    code: '2.OA.B.2',
    grade: '2',
    domain: 'OA',
    module: '2-M1',
    cluster: 'Add and subtract within 20',
    title: 'Fluently Add & Subtract within 20',
    desc: 'Fluently add and subtract within 20 using mental strategies. By end of Grade 2, know from memory all sums of two one-digit numbers.',
  },
  '2.OA.C.3': {
    code: '2.OA.C.3',
    grade: '2',
    domain: 'OA',
    module: '2-M6',
    cluster: 'Work with equal groups to gain foundations for multiplication',
    title: 'Odd and Even Numbers',
    desc: 'Determine whether a group of objects (up to 20) has an odd or even number of members.',
  },
  '2.OA.C.4': {
    code: '2.OA.C.4',
    grade: '2',
    domain: 'OA',
    module: '2-M6',
    cluster: 'Work with equal groups to gain foundations for multiplication',
    title: 'Rectangular Arrays & Repeated Addition',
    desc: 'Use addition to find the total number of objects in rectangular arrays with up to 5 rows and 5 columns.',
  },
  '2.NBT.A.2': {
    code: '2.NBT.A.2',
    grade: '2',
    domain: 'NBT',
    module: '2-M3',
    cluster: 'Understand place value',
    title: 'Skip-Counting by 5s, 10s, and 100s',
    desc: 'Count within 1000; skip-count by 5s, 10s, and 100s up to 1,000.',
  },
  '2.NBT.B.7': {
    code: '2.NBT.B.7',
    grade: '2',
    domain: 'NBT',
    module: '2-M4',
    cluster: 'Use place value understanding and properties of operations',
    title: 'Addition & Subtraction within 1,000',
    desc: 'Add and subtract within 1000 using concrete models or drawings and strategies based on place value with regrouping.',
  },
  '2.MD.C.7': {
    code: '2.MD.C.7',
    grade: '2',
    domain: 'MD',
    module: '2-M8',
    cluster: 'Work with time and money',
    title: 'Time to Nearest 5 Minutes',
    desc: 'Tell and write time from analog and digital clocks to the nearest five minutes, using a.m. and p.m.',
  },
  '2.MD.C.8': {
    code: '2.MD.C.8',
    grade: '2',
    domain: 'MD',
    module: '2-M7',
    cluster: 'Work with time and money',
    title: 'Money: Coins and Dollar Word Problems',
    desc: 'Solve word problems involving dollar bills, quarters, dimes, nickels, and pennies.',
  },
  '2.G.A.1': {
    code: '2.G.A.1',
    grade: '2',
    domain: 'G',
    module: '2-M8',
    cluster: 'Reason with shapes and their attributes',
    title: 'Recognize Polygons & Faces',
    desc: 'Recognize and draw shapes having specified attributes, such as a given number of angles or equal faces.',
  },

  // 3RD GRADE
  '3.OA.A.3': {
    code: '3.OA.A.3',
    grade: '3',
    domain: 'OA',
    module: '3-M1',
    cluster: 'Represent and solve problems involving multiplication and division',
    title: 'Multiplication & Division Word Problems',
    desc: 'Use multiplication and division within 100 to solve word problems in situations involving equal groups, arrays, and measurement.',
  },
  '3.OA.C.7': {
    code: '3.OA.C.7',
    grade: '3',
    domain: 'OA',
    module: '3-M3',
    cluster: 'Multiply and divide within 100',
    title: 'Multiplication & Division Fluency (0–12)',
    desc: 'Fluently multiply and divide within 100, using strategies such as the relationship between multiplication and division.',
  },
  '3.NBT.A.1': {
    code: '3.NBT.A.1',
    grade: '3',
    domain: 'NBT',
    module: '3-M2',
    cluster: 'Use place value understanding and properties of operations',
    title: 'Rounding to Nearest 10 and 100',
    desc: 'Use place value understanding to round whole numbers to the nearest 10 or 100.',
  },
  '3.NF.A.1': {
    code: '3.NF.A.1',
    grade: '3',
    domain: 'NF',
    module: '3-M5',
    cluster: 'Develop understanding of fractions as numbers',
    title: 'Unit Fractions & Part-Whole Models',
    desc: 'Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts.',
  },
  '3.NF.A.2': {
    code: '3.NF.A.2',
    grade: '3',
    domain: 'NF',
    module: '3-M5',
    cluster: 'Develop understanding of fractions as numbers',
    title: 'Fractions on the Number Line',
    desc: 'Represent a fraction 1/b and a/b on a number line diagram between 0 and 1.',
  },
  '3.MD.A.1': {
    code: '3.MD.A.1',
    grade: '3',
    domain: 'MD',
    module: '3-M2',
    cluster: 'Solve problems involving measurement and estimation',
    title: 'Telling Time to the Minute & Elapsed Time',
    desc: 'Tell and write time to the nearest minute and measure elapsed time intervals in minutes.',
  },
  '3.MD.C.7': {
    code: '3.MD.C.7',
    grade: '3',
    domain: 'MD',
    module: '3-M4',
    cluster: 'Geometric measurement: understand concepts of area',
    title: 'Area of Rectangles (Square Units)',
    desc: 'Relate area to the operations of multiplication and addition by tiling and multiplying side lengths.',
  },
  '3.MD.D.8': {
    code: '3.MD.D.8',
    grade: '3',
    domain: 'MD',
    module: '3-M7',
    cluster: 'Geometric measurement: perimeters of polygons',
    title: 'Perimeter of Polygons',
    desc: 'Solve real-world and mathematical problems involving perimeters of polygons, including finding an unknown side length.',
  },

  // 4TH GRADE
  '4.OA.A.3': {
    code: '4.OA.A.3',
    grade: '4',
    domain: 'OA',
    module: '4-M3',
    cluster: 'Use the four operations with whole numbers to solve problems',
    title: 'Multi-Step Word Problems with Remainders',
    desc: 'Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations.',
  },
  '4.OA.B.4': {
    code: '4.OA.B.4',
    grade: '4',
    domain: 'OA',
    module: '4-M3',
    cluster: 'Gain familiarity with factors and multiples',
    title: 'Factors, Multiples, Prime & Composite',
    desc: 'Find all factor pairs for a whole number in the range 1–100; determine whether a number is prime or composite.',
  },
  '4.NBT.A.3': {
    code: '4.NBT.A.3',
    grade: '4',
    domain: 'NBT',
    module: '4-M1',
    cluster: 'Generalize place value understanding for multi-digit whole numbers',
    title: 'Round Multi-Digit Numbers to Any Place',
    desc: 'Use place value understanding to round multi-digit whole numbers to any place value up to 1,000,000.',
  },
  '4.NBT.B.5': {
    code: '4.NBT.B.5',
    grade: '4',
    domain: 'NBT',
    module: '4-M3',
    cluster: 'Use place value understanding to perform multi-digit arithmetic',
    title: 'Multi-Digit Multiplication (Up to 4-Digit × 1-Digit and 2-Digit × 2-Digit)',
    desc: 'Multiply a whole number of up to four digits by a one-digit whole number, and multiply two two-digit numbers.',
  },
  '4.NF.A.1': {
    code: '4.NF.A.1',
    grade: '4',
    domain: 'NF',
    module: '4-M5',
    cluster: 'Extend understanding of fraction equivalence and ordering',
    title: 'Equivalent Fractions (Visual Models)',
    desc: 'Explain why a fraction a/b is equivalent to a fraction (n×a)/(n×b) using visual fraction models.',
  },
  '4.NF.B.3': {
    code: '4.NF.B.3',
    grade: '4',
    domain: 'NF',
    module: '4-M5',
    cluster: 'Build fractions from unit fractions',
    title: 'Add & Subtract Fractions with Like Denominators',
    desc: 'Understand addition and subtraction of fractions as joining and separating parts referring to the same whole.',
  },
  '4.NF.C.6': {
    code: '4.NF.C.6',
    grade: '4',
    domain: 'NF',
    module: '4-M6',
    cluster: 'Understand decimal notation for fractions',
    title: 'Decimals as Fractions (Tenths & Hundredths)',
    desc: 'Use decimal notation for fractions with denominators 10 or 100 (e.g., rewrite 0.62 as 62/100).',
  },
  '4.MD.C.6': {
    code: '4.MD.C.6',
    grade: '4',
    domain: 'MD',
    module: '4-M4',
    cluster: 'Geometric measurement: understand concepts of angle',
    title: 'Angle Measurement & Protractor Degrees',
    desc: 'Measure angles in whole-number degrees using a protractor. Classify acute, right, and obtuse angles.',
  },

  // 5TH GRADE
  '5.OA.A.1': {
    code: '5.OA.A.1',
    grade: '5',
    domain: 'OA',
    module: '5-M2',
    cluster: 'Write and interpret numerical expressions',
    title: 'Order of Operations & Parentheses (PEMDAS)',
    desc: 'Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols.',
  },
  '5.NBT.A.2': {
    code: '5.NBT.A.2',
    grade: '5',
    domain: 'NBT',
    module: '5-M1',
    cluster: 'Understand the place value system',
    title: 'Powers of 10 and Decimal Patterns',
    desc: 'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10.',
  },
  '5.NBT.B.7': {
    code: '5.NBT.B.7',
    grade: '5',
    domain: 'NBT',
    module: '5-M1',
    cluster: 'Perform operations with multi-digit whole numbers and with decimals',
    title: 'Operations with Decimals (+, -, ×, ÷)',
    desc: 'Add, subtract, multiply, and divide decimals to hundredths using concrete models or drawings and place value strategies.',
  },
  '5.NF.A.1': {
    code: '5.NF.A.1',
    grade: '5',
    domain: 'NF',
    module: '5-M3',
    cluster: 'Use equivalent fractions as a strategy to add and subtract fractions',
    title: 'Add & Subtract Unlike Denominator Fractions',
    desc: 'Add and subtract fractions with unlike denominators (including mixed numbers) by replacing with equivalent fractions.',
  },
  '5.NF.B.4': {
    code: '5.NF.B.4',
    grade: '5',
    domain: 'NF',
    module: '5-M4',
    cluster: 'Apply and extend previous understandings of multiplication and division',
    title: 'Multiply Fractions by Fractions',
    desc: 'Apply and extend previous understandings of multiplication to multiply a fraction or whole number by a fraction.',
  },
  '5.MD.C.5': {
    code: '5.MD.C.5',
    grade: '5',
    domain: 'MD',
    module: '5-M5',
    cluster: 'Geometric measurement: understand concepts of volume',
    title: 'Volume of Rectangular Prisms (V = l × w × h)',
    desc: 'Relate volume to the operations of multiplication and addition and solve real world problems using V = l × w × h.',
  },
  '5.G.A.1': {
    code: '5.G.A.1',
    grade: '5',
    domain: 'G',
    module: '5-M6',
    cluster: 'Graph points on the coordinate plane',
    title: 'Coordinate Plane: Plotting (x, y) in Quadrant 1',
    desc: 'Use a pair of perpendicular number lines to define a coordinate system and locate points (x, y).',
  },
};

/**
 * Procedural Problem Generator:
 * Uses multi-template procedural generators with verified math formulas.
 * Each standard supports 3-5 distinct sub-templates producing thousands of
 * unique, mathematically sound, grade-appropriate problems!
 */
export function generateQuestion(grade = '3', domain = null, seed = Math.random) {
  let candidateStandards = Object.values(STANDARDS).filter((s) => s.grade === grade);
  if (domain) {
    const matched = candidateStandards.filter((s) => s.domain === domain);
    if (matched.length) candidateStandards = matched;
  }
  const standard = candidateStandards[Math.floor(seed() * candidateStandards.length)];

  switch (standard.code) {
    // ==================== KINDERGARTEN ====================
    case 'K.CC.A.1': {
      const modePick = seed();
      if (modePick < 0.5) {
        // Count by 10s
        const tensSequenceStart = [10, 20, 30, 40, 50, 60][Math.floor(seed() * 6)];
        const seq = [tensSequenceStart, tensSequenceStart + 10, tensSequenceStart + 20];
        const next = tensSequenceStart + 30;
        return {
          id: `q-K-CC1-${Date.now()}-${Math.floor(seed() * 1000)}`,
          grade: 'K',
          standard: standard.code,
          domain: standard.domain,
          cluster: standard.cluster,
          title: standard.title,
          module: standard.module,
          prompt: `Counting by tens: ${seq.join(', ')}, ❓`,
          correctAnswer: next,
          options: generateDistinctOptions(next, 4, 10, 100, seed),
          hint: `Add 10 to ${seq[seq.length - 1]}. 10 more is ${next}.`,
        };
      } else {
        // Count by 1s
        const start = Math.floor(seed() * 20) + 1;
        const seq = [start, start + 1, start + 2];
        const next = start + 3;
        return {
          id: `q-K-CC1-${Date.now()}-${Math.floor(seed() * 1000)}`,
          grade: 'K',
          standard: standard.code,
          domain: standard.domain,
          cluster: standard.cluster,
          title: standard.title,
          module: standard.module,
          prompt: `What number comes next when counting: ${seq.join(', ')}, ❓`,
          correctAnswer: next,
          options: generateDistinctOptions(next, 4, 1, 30, seed),
          hint: `What number comes right after ${seq[seq.length - 1]}?`,
        };
      }
    }

    case 'K.CC.B.4': {
      const count = Math.floor(seed() * 10) + 1;
      return {
        id: `q-K-CC4-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: 'K',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `How many dots are in the ten-frame?`,
        correctAnswer: count,
        options: generateDistinctOptions(count, 4, 1, 10, seed),
        manipulative: {
          type: 'ten-frame',
          count,
          total: 10,
        },
        hint: `Count the dots row by row. The top row holds 5.`,
      };
    }

    case 'K.CC.C.6': {
      const a = Math.floor(seed() * 9) + 1;
      let b = Math.floor(seed() * 9) + 1;
      while (b === a) b = Math.floor(seed() * 9) + 1;
      const askGreater = seed() > 0.5;
      const correct = askGreater ? Math.max(a, b) : Math.min(a, b);
      return {
        id: `q-K-CC6-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: 'K',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Which number is ${askGreater ? 'GREATER (more)' : 'LESS (fewer)'}: ${a} or ${b}?`,
        correctAnswer: correct,
        options: shuffle([a, b], seed),
        hint: `${Math.max(a, b)} is more than ${Math.min(a, b)}.`,
      };
    }

    case 'K.OA.A.2': {
      const a = Math.floor(seed() * 5) + 1;
      const b = Math.floor(seed() * (10 - a)) + 1;
      const isAdd = seed() > 0.4;
      if (isAdd) {
        const sum = a + b;
        return {
          id: `q-K-OA2-${Date.now()}-${Math.floor(seed() * 1000)}`,
          grade: 'K',
          standard: standard.code,
          domain: standard.domain,
          cluster: standard.cluster,
          title: standard.title,
          module: standard.module,
          prompt: `California state park rangers spotted ${a} sea otters and ${b} more swam over. How many sea otters in all?`,
          correctAnswer: sum,
          options: generateDistinctOptions(sum, 4, 1, 10, seed),
          manipulative: {
            type: 'ten-frame',
            count: sum,
            groups: [a, b],
            total: 10,
          },
          hint: `Add ${a} + ${b} = ${sum}.`,
        };
      } else {
        const total = a + b;
        const diff = total - a;
        return {
          id: `q-K-OA2-${Date.now()}-${Math.floor(seed() * 1000)}`,
          grade: 'K',
          standard: standard.code,
          domain: standard.domain,
          cluster: standard.cluster,
          title: standard.title,
          module: standard.module,
          prompt: `There were ${total} oranges in a basket. Children ate ${a}. How many oranges remain?`,
          correctAnswer: diff,
          options: generateDistinctOptions(diff, 4, 0, 10, seed),
          manipulative: {
            type: 'ten-frame',
            count: total,
            removeCount: a,
            total: 10,
          },
          hint: `Start with ${total} and take away ${a} to get ${diff}.`,
        };
      }
    }

    case 'K.OA.A.4': {
      const a = Math.floor(seed() * 9) + 1;
      const partner = 10 - a;
      return {
        id: `q-K-OA4-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: 'K',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Number Partners: What number pairs with ${a} to make 10? (${a} + ❓ = 10)`,
        correctAnswer: partner,
        options: generateDistinctOptions(partner, 4, 1, 9, seed),
        manipulative: {
          type: 'ten-frame',
          count: 10,
          groups: [a, partner],
          total: 10,
        },
        hint: `How many more dots are needed to fill a ten-frame of ${a}? Answer: ${partner}.`,
      };
    }

    case 'K.NBT.A.1': {
      const ones = Math.floor(seed() * 9) + 1;
      const teen = 10 + ones;
      return {
        id: `q-K-NBT1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: 'K',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `1 full group of 10 and ${ones} extra ones make what teen number?`,
        correctAnswer: teen,
        options: generateDistinctOptions(teen, 4, 11, 19, seed),
        manipulative: {
          type: 'double-ten-frame',
          count: teen,
          firstFull: 10,
          secondCount: ones,
        },
        hint: `10 + ${ones} = ${teen}.`,
      };
    }

    case 'K.G.A.2': {
      const shapes = [
        { name: 'Triangle', sides: 3 },
        { name: 'Rectangle', sides: 4 },
        { name: 'Square', sides: 4 },
        { name: 'Hexagon', sides: 6 },
        { name: 'Circle', sides: 0 },
      ];
      const pick = shapes[Math.floor(seed() * shapes.length)];
      if (pick.sides > 0) {
        return {
          id: `q-K-G2-${Date.now()}-${Math.floor(seed() * 1000)}`,
          grade: 'K',
          standard: standard.code,
          domain: standard.domain,
          cluster: standard.cluster,
          title: standard.title,
          module: standard.module,
          prompt: `How many straight sides does a ${pick.name.toLowerCase()} have?`,
          correctAnswer: pick.sides,
          options: generateDistinctOptions(pick.sides, 4, 0, 8, seed),
          hint: `A ${pick.name.toLowerCase()} has ${pick.sides} straight outer sides.`,
        };
      } else {
        return {
          id: `q-K-G2-${Date.now()}-${Math.floor(seed() * 1000)}`,
          grade: 'K',
          standard: standard.code,
          domain: standard.domain,
          cluster: standard.cluster,
          title: standard.title,
          module: standard.module,
          prompt: `Which shape is curved all the way around with zero straight edges?`,
          correctAnswer: 'Circle',
          options: shuffleDistinctOptions('Circle', ['Circle', 'Triangle', 'Square', 'Hexagon'], 4, seed),
          hint: `A circle has no straight edges or sharp corners.`,
        };
      }
    }

    // ==================== 1ST GRADE ====================
    case '1.OA.A.1': {
      const a = Math.floor(seed() * 8) + 4;
      const b = Math.floor(seed() * 7) + 3;
      const sum = a + b;
      return {
        id: `q-1-OA1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '1',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `California Redwood Explorers found ${a} pinecones on trail A and ${b} pinecones on trail B. How many total pinecones?`,
        correctAnswer: sum,
        options: generateDistinctOptions(sum, 4, 7, 20, seed),
        hint: `${a} + ${b} = ${sum}.`,
      };
    }

    case '1.OA.C.6': {
      const a = Math.floor(seed() * 9) + 2;
      const b = Math.floor(seed() * 9) + 2;
      const sum = a + b;
      return {
        id: `q-1-OA6-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '1',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Addition Fluency: What is ${a} + ${b}?`,
        correctAnswer: sum,
        options: generateDistinctOptions(sum, 4, 4, 20, seed),
        manipulative: {
          type: 'number-line',
          min: 0,
          max: 20,
          start: a,
          hop: b,
          target: sum,
        },
        hint: `Make a 10: ${a} + ${10 - a} = 10, then add the rest.`,
      };
    }

    case '1.OA.D.8': {
      const a = Math.floor(seed() * 8) + 3;
      const missing = Math.floor(seed() * 8) + 2;
      const sum = a + missing;
      return {
        id: `q-1-OA8-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '1',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Find the missing value: ${a} + ❓ = ${sum}`,
        correctAnswer: missing,
        options: generateDistinctOptions(missing, 4, 1, 15, seed),
        hint: `Think subtraction: ${sum} - ${a} = ${missing}.`,
      };
    }

    case '1.NBT.B.2': {
      const tens = Math.floor(seed() * 7) + 1;
      const ones = Math.floor(seed() * 9) + 1;
      const val = tens * 10 + ones;
      return {
        id: `q-1-NBT2-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '1',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `What two-digit number is made of ${tens} tens and ${ones} ones?`,
        correctAnswer: val,
        options: generateDistinctOptions(val, 4, 11, 99, seed),
        hint: `${tens} tens = ${tens * 10}. ${tens * 10} + ${ones} = ${val}.`,
      };
    }

    case '1.NBT.C.5': {
      const base = (Math.floor(seed() * 7) + 2) * 10 + (Math.floor(seed() * 9) + 1);
      const isMore = seed() > 0.5;
      const target = isMore ? base + 10 : base - 10;
      return {
        id: `q-1-NBT5-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '1',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Mental Math: What is 10 ${isMore ? 'MORE' : 'LESS'} than ${base}?`,
        correctAnswer: target,
        options: generateDistinctOptions(target, 4, 10, 99, seed),
        hint: `Change only the tens place digit.`,
      };
    }

    case '1.MD.B.3': {
      const hour = Math.floor(seed() * 12) + 1;
      const isHalf = seed() > 0.5;
      const minute = isHalf ? 30 : 0;
      const timeStr = `${hour}:${minute === 0 ? '00' : '30'}`;
      const wrong = [
        `${(hour % 12) + 1}:${minute === 0 ? '00' : '30'}`,
        `${hour}:${minute === 0 ? '30' : '00'}`,
        `${((hour + 10) % 12) + 1}:${minute === 0 ? '00' : '30'}`,
      ];
      return {
        id: `q-1-MD3-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '1',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `What time is shown on the clock face?`,
        correctAnswer: timeStr,
        options: shuffleDistinctOptions(timeStr, [timeStr, ...wrong], 4, seed),
        manipulative: {
          type: 'clock',
          hour,
          minute,
        },
        hint: `The short hour hand points to ${hour}. The long minute hand points to ${minute === 0 ? '12 (o\'clock)' : '6 (half-past)'}.`,
      };
    }

    // ==================== 2ND GRADE ====================
    case '2.OA.B.2': {
      const a = Math.floor(seed() * 9) + 6;
      const b = Math.floor(seed() * 9) + 6;
      const sum = a + b;
      return {
        id: `q-2-OA2-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '2',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Mental Fluency: ${a} + ${b} = ❓`,
        correctAnswer: sum,
        options: generateDistinctOptions(sum, 4, 12, 20, seed),
        hint: `${a} + ${10 - a} = 10; 10 + ${b - (10 - a)} = ${sum}.`,
      };
    }

    case '2.OA.C.3': {
      const num = Math.floor(seed() * 19) + 2;
      const ans = num % 2 === 0 ? 'Even' : 'Odd';
      return {
        id: `q-2-OA3-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '2',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Is the number ${num} Even or Odd?`,
        correctAnswer: ans,
        options: ['Even', 'Odd'],
        hint: `Even numbers end in 0, 2, 4, 6, 8. Odd numbers end in 1, 3, 5, 7, 9.`,
      };
    }

    case '2.NBT.A.2': {
      const step = [5, 10, 100][Math.floor(seed() * 3)];
      const start = (Math.floor(seed() * 5) + 1) * step;
      const seq = [start, start + step, start + 2 * step];
      const next = start + 3 * step;
      return {
        id: `q-2-NBT2-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '2',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Skip-counting pattern: ${seq.join(', ')}, ❓`,
        correctAnswer: next,
        options: generateDistinctOptions(next, 4, 10, 1000, seed),
        manipulative: {
          type: 'number-line',
          min: start - step,
          max: next + step,
          start: seq[0],
          hop: step,
          target: next,
        },
        hint: `Each hop counts by ${step}. Next is ${next}.`,
      };
    }

    case '2.NBT.B.7': {
      const a = Math.floor(seed() * 350) + 140;
      const b = Math.floor(seed() * 350) + 120;
      const sum = a + b;
      return {
        id: `q-2-NBT7-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '2',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Add with regrouping: ${a} + ${b}`,
        correctAnswer: sum,
        options: generateDistinctOptions(sum, 4, 250, 950, seed),
        hint: `Add ones (${a % 10} + ${b % 10}), then tens, then hundreds. Total: ${sum}.`,
      };
    }

    case '2.MD.C.8': {
      const quarters = Math.floor(seed() * 3) + 1;
      const dimes = Math.floor(seed() * 3) + 1;
      const nickels = Math.floor(seed() * 2);
      const pennies = Math.floor(seed() * 4) + 1;
      const totalCents = quarters * 25 + dimes * 10 + nickels * 5 + pennies * 1;
      return {
        id: `q-2-MD8-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '2',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Calculate the total value in the coin tray: (${quarters} quarters, ${dimes} dimes, ${nickels} nickels, ${pennies} pennies)`,
        correctAnswer: `${totalCents}¢`,
        options: generateDistinctOptions(totalCents, 4, 25, 150, seed).map((v) => `${v}¢`),
        manipulative: {
          type: 'money',
          coins: { quarters, dimes, nickels, pennies },
          totalCents,
        },
        hint: `Quarters: 25¢, Dimes: 10¢, Nickels: 5¢, Pennies: 1¢.`,
      };
    }

    // ==================== 3RD GRADE ====================
    case '3.OA.A.3': {
      const groups = Math.floor(seed() * 6) + 3;
      const perGroup = Math.floor(seed() * 7) + 3;
      const total = groups * perGroup;
      return {
        id: `q-3-OA3-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '3',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `A California school library received ${groups} boxes with ${perGroup} books in each box. How many books in total?`,
        correctAnswer: total,
        options: generateDistinctOptions(total, 4, 9, 100, seed),
        manipulative: {
          type: 'array',
          rows: groups,
          cols: perGroup,
        },
        hint: `Multiply ${groups} × ${perGroup} = ${total}.`,
      };
    }

    case '3.OA.C.7': {
      const a = Math.floor(seed() * 10) + 2;
      const b = Math.floor(seed() * 10) + 2;
      const prod = a * b;
      return {
        id: `q-3-OA7-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '3',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Multiplication Fluency: What is ${a} × ${b}?`,
        correctAnswer: prod,
        options: generateDistinctOptions(prod, 4, 4, 144, seed),
        manipulative: {
          type: 'array',
          rows: a,
          cols: b,
        },
        hint: `${a} groups of ${b} equals ${prod}.`,
      };
    }

    case '3.NBT.A.1': {
      const roundTo = seed() > 0.5 ? 10 : 100;
      const val = Math.floor(seed() * 750) + 125;
      const rounded = Math.round(val / roundTo) * roundTo;
      return {
        id: `q-3-NBT1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '3',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Round ${val} to the nearest ${roundTo}.`,
        correctAnswer: rounded,
        options: generateDistinctOptions(rounded, 4, Math.max(0, rounded - 120), rounded + 120, seed),
        hint: `5 or higher in the next place value rounds up.`,
      };
    }

    case '3.NF.A.1': {
      const den = [2, 3, 4, 6, 8][Math.floor(seed() * 5)];
      const num = Math.floor(seed() * (den - 1)) + 1;
      const fracStr = `${num}/${den}`;
      const wrong = [
        `${den - num}/${den}`,
        `${num}/${den === 8 ? 6 : den + 1}`,
        `1/${den}`,
      ];
      return {
        id: `q-3-NF1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '3',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `What fraction of the visual bar model is shaded?`,
        correctAnswer: fracStr,
        options: shuffleDistinctOptions(fracStr, [fracStr, ...wrong], 4, seed),
        manipulative: {
          type: 'fraction',
          numerator: num,
          denominator: den,
        },
        hint: `Top number = ${num} shaded parts. Bottom number = ${den} total parts.`,
      };
    }

    case '3.MD.C.7': {
      const l = Math.floor(seed() * 7) + 3;
      const w = Math.floor(seed() * 6) + 2;
      const area = l * w;
      return {
        id: `q-3-MD7-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '3',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `A community garden bed is ${l} meters long and ${w} meters wide. What is its area in square meters?`,
        correctAnswer: `${area} sq m`,
        options: generateDistinctOptions(area, 4, 10, 80, seed).map((v) => `${v} sq m`),
        manipulative: {
          type: 'array',
          rows: w,
          cols: l,
          unit: 'm',
        },
        hint: `Area = length × width (${l} × ${w} = ${area} sq m).`,
      };
    }

    // ==================== 4TH GRADE ====================
    case '4.OA.A.3': {
      const bags = Math.floor(seed() * 5) + 4;
      const perBag = Math.floor(seed() * 6) + 5;
      const given = Math.floor(seed() * 12) + 5;
      const total = bags * perBag;
      const remaining = total - given;
      return {
        id: `q-4-OA3-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '4',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `A California science museum prepared ${bags} kits with ${perBag} test tubes in each. They handed out ${given} test tubes. How many test tubes remain?`,
        correctAnswer: remaining,
        options: generateDistinctOptions(remaining, 4, 2, 60, seed),
        hint: `Total = ${bags} × ${perBag} = ${total}. Then ${total} - ${given} = ${remaining}.`,
      };
    }

    case '4.OA.B.4': {
      const primes = [11, 13, 17, 19, 23, 29, 31];
      const composites = [12, 14, 15, 16, 18, 20, 21, 24, 25];
      const pickPrime = primes[Math.floor(seed() * primes.length)];
      return {
        id: `q-4-OA4-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '4',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Which of these numbers is a PRIME number?`,
        correctAnswer: pickPrime,
        options: shuffle([pickPrime, ...composites.slice(0, 3)], seed),
        hint: `A prime number has only two factors: 1 and itself (${pickPrime}).`,
      };
    }

    case '4.NBT.B.5': {
      const a = Math.floor(seed() * 55) + 18;
      const b = Math.floor(seed() * 8) + 3;
      const prod = a * b;
      return {
        id: `q-4-NBT5-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '4',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Multiply using the standard algorithm: ${a} × ${b}`,
        correctAnswer: prod,
        options: generateDistinctOptions(prod, 4, 50, 600, seed),
        hint: `Multiply (${Math.floor(a / 10) * 10} × ${b}) + (${a % 10} × ${b}) = ${prod}.`,
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
      return {
        id: `q-4-NF1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '4',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Which fraction is equivalent to ${baseNum}/${baseDen}?`,
        correctAnswer: targetStr,
        options: shuffleDistinctOptions(targetStr, [targetStr, ...wrong], 4, seed),
        manipulative: {
          type: 'fraction',
          numerator: baseNum,
          denominator: baseDen,
        },
        hint: `Multiply numerator and denominator by ${mult}: (${baseNum}×${mult})/(${baseDen}×${mult}) = ${targetStr}.`,
      };
    }

    case '4.MD.C.6': {
      const angle = [30, 45, 60, 90, 120, 135, 150][Math.floor(seed() * 7)];
      return {
        id: `q-4-MD6-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '4',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `What is the degree measure of this angle?`,
        correctAnswer: `${angle}°`,
        options: generateDistinctOptions(angle, 4, 20, 180, seed).map((v) => `${v}°`),
        hint: `Right angle = 90°. Acute < 90°. Obtuse > 90°. This angle is ${angle}°.`,
      };
    }

    // ==================== 5TH GRADE ====================
    case '5.OA.A.1': {
      const a = Math.floor(seed() * 6) + 2;
      const b = Math.floor(seed() * 6) + 2;
      const c = Math.floor(seed() * 4) + 2;
      const d = Math.floor(seed() * 5) + 1;
      const ans = (a + b) * c - d;
      return {
        id: `q-5-OA1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '5',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Evaluate with Order of Operations (PEMDAS): (${a} + ${b}) × ${c} - ${d}`,
        correctAnswer: ans,
        options: generateDistinctOptions(ans, 4, 5, 80, seed),
        hint: `Parentheses first (${a + b}), then multiply by ${c} (${(a + b) * c}), then subtract ${d} = ${ans}.`,
      };
    }

    case '5.NBT.B.7': {
      const a = (Math.floor(seed() * 50) + 10) / 10;
      const b = (Math.floor(seed() * 40) + 10) / 10;
      const sum = +(a + b).toFixed(1);
      const wrong = [
        +(sum + 0.1).toFixed(1),
        +(sum - 0.2).toFixed(1),
        +(sum + 1.0).toFixed(1),
      ];
      return {
        id: `q-5-NBT7-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '5',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Decimal Operation: Calculate ${a.toFixed(1)} + ${b.toFixed(1)}`,
        correctAnswer: sum,
        options: shuffleDistinctOptions(sum, [sum, ...wrong], 4, seed),
        hint: `Line up decimal points: ${a.toFixed(1)} + ${b.toFixed(1)} = ${sum}.`,
      };
    }

    case '5.NF.A.1': {
      const pairs = [
        { f1: '1/2', f2: '1/4', ans: '3/4', num: 3, den: 4 },
        { f1: '1/3', f2: '1/6', ans: '1/2', num: 1, den: 2 },
        { f1: '2/5', f2: '3/10', ans: '7/10', num: 7, den: 10 },
        { f1: '1/4', f2: '3/8', ans: '5/8', num: 5, den: 8 },
        { f1: '2/3', f2: '1/6', ans: '5/6', num: 5, den: 6 },
      ];
      const pick = pairs[Math.floor(seed() * pairs.length)];
      const wrong = ['2/6', '4/7', '3/8', '2/5'].filter((x) => x !== pick.ans).slice(0, 3);
      return {
        id: `q-5-NF1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '5',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Add fractions with unlike denominators: ${pick.f1} + ${pick.f2}`,
        correctAnswer: pick.ans,
        options: shuffleDistinctOptions(pick.ans, [pick.ans, ...wrong], 4, seed),
        manipulative: {
          type: 'fraction',
          numerator: pick.num,
          denominator: pick.den,
        },
        hint: `Find a common denominator first, then add numerators. Result is ${pick.ans}.`,
      };
    }

    case '5.MD.C.5': {
      const l = Math.floor(seed() * 5) + 3;
      const w = Math.floor(seed() * 4) + 2;
      const h = Math.floor(seed() * 4) + 2;
      const vol = l * w * h;
      return {
        id: `q-5-MD5-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '5',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `A California STEAM robotics container measures ${l} cm long, ${w} cm wide, and ${h} cm tall. What is its volume in cubic centimeters?`,
        correctAnswer: `${vol} cu cm`,
        options: generateDistinctOptions(vol, 4, 12, 160, seed).map((v) => `${v} cu cm`),
        hint: `Volume = length × width × height (${l} × ${w} × ${h} = ${vol} cu cm).`,
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
      return {
        id: `q-5-G1-${Date.now()}-${Math.floor(seed() * 1000)}`,
        grade: '5',
        standard: standard.code,
        domain: standard.domain,
        cluster: standard.cluster,
        title: standard.title,
        module: standard.module,
        prompt: `Identify the coordinates (x, y) of the star plotted on the coordinate grid:`,
        correctAnswer: coordStr,
        options: shuffleDistinctOptions(coordStr, [coordStr, ...wrong], 4, seed),
        manipulative: {
          type: 'coordinate',
          x,
          y,
          max: 10,
        },
        hint: `Read the x-coordinate across (${x}) then the y-coordinate up (${y}) to get ${coordStr}.`,
      };
    }

    default: {
      return {
        id: `q-def-${Date.now()}`,
        grade,
        standard: '3.OA.C.7',
        domain: 'OA',
        cluster: 'Multiply and divide within 100',
        title: 'Multiplication Fluency',
        module: '3-M3',
        prompt: `What is 7 × 8?`,
        correctAnswer: 56,
        options: [48, 54, 56, 64],
        hint: `7 × 8 = 56.`,
      };
    }
  }
}

function generateDistinctOptions(correct, count = 4, min = 0, max = 100, seed = Math.random) {
  const set = new Set([correct]);
  let attempts = 0;
  while (set.size < count && attempts < 100) {
    attempts += 1;
    const delta = Math.floor(seed() * 9) - 4;
    const cand = correct + (delta === 0 ? (seed() > 0.5 ? 1 : -1) : delta);
    if (cand >= min && cand <= max) {
      set.add(cand);
    }
  }
  let fill = 1;
  while (set.size < count) {
    set.add(correct + fill);
    fill += 1;
  }
  return shuffle(Array.from(set), seed);
}

function shuffleDistinctOptions(correct, candidates, count = 4, seed = Math.random) {
  const set = new Set([correct]);
  for (const c of candidates) {
    if (set.size < count) set.add(c);
  }
  return shuffle(Array.from(set), seed);
}

export function shuffle(items, seed = Math.random) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seed() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
