# Cambrian Math Quest 📐

[![CI](https://github.com/tinouchemassinissa/cambrian-math-quest/actions/workflows/ci.yml/badge.svg)](https://github.com/tinouchemassinissa/cambrian-math-quest/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Standards: CCSS-M](https://img.shields.io/badge/Standards-California_CCSS--M-emerald)](https://www.cde.ca.gov/ci/ma/cf/)
[![Platform](https://img.shields.io/badge/Platform-PWA_Offline--First-indigo)](https://web.dev/progressive-web-apps/)

An interactive, standards-aligned elementary school mathematics learning game engineered for **Cambrian School District** in **Cambrian Park / San Jose, California**, spanning **Kindergarten through 5th Grade** aligned with the **California Common Core State Standards for Mathematics (CCSS-M)** and California Mathematics Framework.

---

## 🏫 Participating Cambrian Schools & Programs

Cambrian Math Quest celebrates each elementary school community across the Cambrian School District:

- **🦅 Fammatre Elementary School** — *Home of the Falcons* (Focus: Science, Technology, Engineering, Arts, and Math — STEAM exploration)
- **🦊 Farnham Elementary School** — *Home of the Foxes* (Focus: Leadership, Inquiry-Based Mathematics, Student Agency)
- **⭐ Sartorette Elementary School** — *Home of the Superstars* (Focus: Discovery, Creative Problem Solving & Collaborative Learning)
- **🐟 Bagby Elementary School** — *Home of the Barracudas* (Focus: Community, Character & Growth Mindset)
- **🦈 Steindorf STEAM School** — *Home of the Sharks* (Focus: K-8 Project-Based Learning, Engineering Design & Applied Math)

---

## 🎯 California CCSS-M Curriculum Strands

The game procedural curriculum covers all elementary grade levels from TK/Kindergarten to 5th Grade:

| Grade | CCSS-M Domains Covered | Key Learning Milestones |
| :--- | :--- | :--- |
| **Kindergarten (K)** | Counting & Cardinality (`CC`), Operations (`OA`), Base Ten (`NBT`), Geometry (`G`), Measurement (`MD`) | Ten-frame quantities, teen number decomposition ($10 + n$), addition/subtraction within 10, 2D/3D shape attributes |
| **1st Grade (G1)** | Operations & Algebraic Thinking (`OA`), Base Ten (`NBT`), Measurement & Data (`MD`), Geometry (`G`) | Fluency within 20, missing addends, place value tens and ones to 120, telling time to hour and half-hour, halves & fourths |
| **2nd Grade (G2)** | Operations (`OA`), Base Ten (`NBT`), Measurement (`MD`), Geometry (`G`) | Mental math within 20, addition & subtraction with regrouping up to 1,000, skip-counting (5s, 10s, 100s), money (coins & bills), clocks to 5 minutes |
| **3rd Grade (G3)** | Operations & Algebraic Thinking (`OA`), Fractions (`NF`), Base Ten (`NBT`), Measurement (`MD`) | Multiplication & division facts (0–12), array models, unit fractions ($1/b$) on number lines, rounding to 10/100, area & perimeter |
| **4th Grade (G4)** | Multi-Step Operations (`OA`), Base Ten (`NBT`), Fractions & Decimals (`NF`), Measurement (`MD`) | Multi-digit multiplication & long division, real-world multi-step story problems, equivalent fractions, adding fractions with like denominators, protractor angles |
| **5th Grade (G5)** | Order of Operations (`OA`), Decimals (`NBT`), Unlike Fractions (`NF`), Measurement (`MD`), Coordinate Plane (`G`) | PEMDAS with parentheses, decimal operations ($+ - \times \div$), unlike denominator fraction addition, rectangular prism volume ($V = l \times w \times h$), coordinate grid plotting $(x, y)$ |

---

## 🧩 Interactive Visual Manipulatives

Research in elementary mathematics education (such as Eureka Math and Bridges in Mathematics) emphasizes concrete and pictorial representations before abstract formulas. Cambrian Math Quest includes built-in interactive visual models:

1. **Interactive Ten-Frames & Double Ten-Frames**: Tactile visual counters showing 5-structures and base-10 groupings.
2. **Number Line Hops**: Dynamic number lines with forward jumps, intervals, and missing hop values.
3. **Fraction Strips & Bars**: Segmented parts representing denominators and shaded numerators.
4. **Analog Clock Face**: Clear SVG clock face with distinguishable hour and minute hands for time-telling standards.
5. **US Coin & Bill Tray**: Quarters (25¢), dimes (10¢), nickels (5¢), and pennies (1¢) with realistic scale and styling.
6. **Multiplication Array Grid**: Visual grid demonstrating rectangular arrays and area models.
7. **Coordinate Plane Grid**: First-quadrant $(x, y)$ coordinate system with target star markers.

---

## 🎮 Game Modes

- **🗺️ Grade Quest**: The primary campaign navigating through California standards for the selected grade with adaptive difficulty.
- **⚡ Speed Sprint (Cambrian Park Math Dash)**: A 60-second high-energy math sprint with combo streak multipliers.
- **🧩 Manipulatives Lab**: Problem sets specifically pairing each question with interactive visual models.
- **📖 California Word Problems**: Story-based problems featuring Cambrian Park landmarks (Camden Ave farmers market, Los Gatos Creek Trail, Steindorf robotics kits, school carnivals).
- **🧠 Smart Review**: Spaced-repetition engine that automatically identifies due standards and weak spots.
- **🎯 Mistake Review**: Dedicated targeted review queue allowing students to retry missed questions and build a growth mindset.

---

## 👩‍🏫 Teacher Portal & Zero-Dependency Excel (.xlsx) Reports

Classroom mode is built specifically for teachers in Cambrian School District:

- **100% Student Privacy**: Operates entirely in the browser. No student accounts, passwords, or cloud data transfers are required.
- **Live Classroom HUD**: Teachers can set School, Teacher Name, Class Name, and switch active students with a single tap.
- **Instant Excel (.xlsx) Export**: Built using a zero-dependency ZIP/XML open-standards engine:
  - **Sheet 1 — Class Session Summary**: District information, active school, total problems attempted, correct rate, and class accuracy %.
  - **Sheet 2 — Student Roster & Accuracy**: Aggregated metrics per student with attempts, correct answers, and points earned.
  - **Sheet 3 — Detailed Item Log**: Itemized row for every question answered, timestamped with the exact California CCSS-M standard code (e.g. `CCSS.MATH.CONTENT.3.OA.C.7`), prompt, student answer, correct answer, speed, and result.

---

## 🎵 Web Audio Sound & Focus Ambient Music

- Generated entirely via the **Web Audio API** — 100% offline, zero external sound asset dependencies.
- Cheerful rising chime chord for correct answers.
- Streak combo multiplier chords that pitch upwards with higher streaks.
- Gentle low feedback tone for incorrect answers.
- Celebratory victory fanfare.
- Optional serene ambient focus synthesizer (classical Bach / Mozart inspired chord cycles) with volume controls.

---

## 🛠️ Technology Stack & Architecture

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Offline / PWA**: [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/)
- **Visuals & Celebrations**: [`canvas-confetti`](https://www.npmjs.com/package/canvas-confetti)
- **Audio Engine**: Native Web Audio API Synthesizer
- **Spreadsheet Generation**: In-house pure JavaScript Open Packaging Convention ZIP + XML generator (`src/export/xlsxExport.js`)
- **Testing**: Native Node.js test runner (`node --test src/game/*.test.mjs`)
- **CI / CD**: GitHub Actions workflow (`.github/workflows/ci.yml`)

---

## 💻 Local Development & Verification

### Prerequisites
- Node.js 20+ (tested on Node v22)
- npm 10+

### Setup
```bash
git clone https://github.com/tinouchemassinissa/cambrian-math-quest.git
cd cambrian-math-quest
npm install
npm run dev
```

### Verification & Testing
```bash
npm test
npm run build
```

---

## 👤 Author

Developed by **Massinissa TINOUCHE** for the students and teachers of the Cambrian School District.
