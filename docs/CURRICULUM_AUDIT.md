# Curriculum and correctness audit — 18 October 2026

The bank contains **84 selected K–5 standard identifiers**, not the whole California curriculum. A standard identifier is a mapping target, not evidence that all of its subskills have been taught or assessed. No state, school, district or publisher approval is claimed.

## Primary source

California Department of Education, *California Common Core State Standards: Mathematics*, adopted 2010, modified January 2013, electronic edition with 2014 corrections:
https://www.cde.ca.gov/be/st/ss/documents/ccssmathstandardaug2013.pdf

Teaching framework (2023): https://www.cde.ca.gov/ci/ma/cf/

The elementary sections are printed pages 10–39. The changes below were compared with the corresponding standards, not inferred from a language model. Teacher review of full coverage, pedagogy and accessibility remains outstanding.

## Corrected problems

- Adaptive selection now requests the chosen exact standard, instead of randomly selecting another standard from its domain.
- A failed generator no longer silently returns generic arithmetic under an unrelated standard label. Unsupported grade/standard pairs and exhausted generation fail visibly.
- Equivalent numerical/fraction choices are detected: two spellings of one mathematical answer are not two distractors. A bounded arithmetic parser supports decimals, fractions and grouping without eval or arbitrary code execution.
- Supplied wrong units are rejected. A bare numerical response may omit an expected unit, but `24 ft` is not accepted as `24 m` or `24 sq m`. This is not a full unit-conversion engine.
- Tape-diagram group counts now match the described quantities, instead of truncating repeated groups to five. Their segment proportions are no longer forced to a misleading minimum width.
- The fraction-number-line skill now has a number-line diagram rather than a fraction strip.
- Kindergarten shape naming now asks for names of rotated shapes. It previously asked for side counts under a naming label. Current examples are only triangle, square, circle and hexagon; rectangle and solid-shape coverage is incomplete.
- Kindergarten measurable comparison now shows aligned ribbons instead of relying on assumptions about named real-world objects. Current coverage is length only, not mass/capacity.
- First-grade unit-length practice now shows adjacent equal units with no gaps or overlaps.
- Protractor reading remains 4.MD.C.6; angle addition has its own 4.MD.C.7 generator. Category inheritance stays 5.G.B.3; classification examples use 5.G.B.4.
- Third-grade multiplication/division facts use one-digit factors, include zero in multiplication, and never divide by zero. Not every fact has been exhaustively enumerated in this audit.
- Second-grade within-20 and third-grade within-1,000 generators no longer exceed their stated ranges.
- Corrected the whole-number fraction explanation to refer to the actual denominator, a misleading rounding explanation, and remainder notation in generated and bundled solutions.
- Bundled supplement items now use registered parent identifiers and the diagram schema expected by the renderer. General trivia is no longer automatically relabeled as a California numerical-expression lesson.
- Imported/inferred templates are excluded from default practice. A template fitting one numeric example is not proof of its semantic correctness, range or curriculum alignment. The experimental import feature is not certified for student deployment.
- Bip's ordinary first hint is a reviewed conceptual clue, separate from the full worked solution. Wrong-answer reactions no longer automatically recite the solution. Worked solutions remain available on demand; the answer-result display still identifies the correct answer after submission.
- Removed unsupported official-affiliation and absolute safety/correctness labels. Suggested assessment claims/DOK labels are heuristics, not official classifications.

## Checks performed

49 Node tests passed after these changes, including:

- A deterministic sample of at least 100,000 generated items across all registered skills against implemented invariants, plus existing 20,000- and 30,000-cycle state/generation simulations. These are sampled tests, not exhaustive proofs or browser end-to-end tests.
- Independent integer calculations for single-digit multiplication/division; prime/multiple predicates; fraction operations; rectangular area/perimeter; prism/composite volume.
- Independent recalculation of recognized standalone binary equations in sampled worked solutions. This deliberately excludes fragments of longer expressions and does not understand arbitrary prose.
- Mutation checks for wrong answers, mislabeled grades, inconsistent diagrams and equivalent distractors; numeric range regressions; reproducible seed handling; fail-closed errors.
- Sampled nonempty solution/diagram checks for all 84 registered skill identifiers and validation of the 27 bundled supplement items.
- Vite production build.

Browser rendering, screen-reader/physical-device testing and actual classroom learning outcomes are **not tested** in this environment. No new AI model or full 3D character rig was installed in this batch. Bip remains an animated-clip/scripted teaching companion.

## Release interpretation

Passing the checks means the sampled items satisfy the explicitly implemented rules. It does not mean every possible generated question, English explanation or curriculum mapping has been independently proven correct. Visual appearance, language clarity, assessment coverage and pedagogical effectiveness require further review. Use a teacher-reviewed pilot before broad school adoption. The current practice progress score is an app heuristic, not a validated measure of a child's mastery.

## Guided lessons and wording pass

Reviewed a source inventory of 375 prompt, hint and explanation entries across the generator, with additional inspection of story arrays. This is a source-template wording pass, not a claim that every possible rendered sentence or every screen has been independently reviewed. Fixed an odd-number sharing contradiction, missing fraction-story questions, ambiguous unit-fraction division notation, clock wording at zero minutes, same-whole comparison assumptions, singular/plural agreement and conditional rounding language.

Added child-controlled clue → picture → worked-step lessons for multiplication/division facts and supported fraction operations. Other skills retain a conceptual hint, existing diagram where available and the existing explanation. Normal correct answers no longer advance automatically; speed sprint remains timed, and opening help pauses it. Supported attempts do not raise independent mastery and are scheduled for another review.

New tests enumerate multiplication operands 0–9 and division groups 1–9 with quotients 0–9, reject mismatched lesson answers, check 2,000 seeded fraction candidates and verify assisted progress handling. These checks cover arithmetic and state logic, not screen rendering, reading level or pedagogical effectiveness.

## Algorithm hardening — follow-up

- Fraction arithmetic uses exact BigInt intermediates, then reduces before returning safe-integer numerator/denominator fields. Noninteger, nonfinite and oversized inputs are rejected instead of silently truncated or rounded. gcd/lcm reject invalid inputs rather than entering a nonterminating loop.
- Arithmetic parsing applies exponent precedence before unary minus and handles exponent chains from the right. Exponents remain bounded to 0–6; unsupported/oversized expressions fail.
- Question verification checks field types before semantic parsing, rejects negative parsed quantities and uses the same acceptance rule as the student answer checker to reject ambiguous choices. Empty answers never match. These bounded checks are not a natural-language proof or a security certification.
- Generation requires a finite seed when supplied and 1–100 integer verification attempts, preventing unbounded retry configurations.
- The app admits only the latest asynchronous question result and accepts one answer per loaded question. A new load immediately clears the previous question. Using the eliminate-choice helper also marks practice as assisted.
- Regression checks cover sign/exponent cases, lossy-number boundaries, malformed payloads, equivalent-choice ambiguity, retry limits, duplicate submission and out-of-order load completion. An independent BigInt reference checks 68,000 bounded fraction operations.

Full follow-up validation: 57 Node tests and the production build. UI integration was compiled but not exercised in a browser; teacher, accessibility and device review remain outstanding.

## First complete learning paths

Added six original bounded mini-lessons, one starting subskill per grade: joining small groups (K.OA.A.2), making ten within 20 (1.OA.C.6), hundreds/tens/ones (2.NBT.A.1), multiplication/division facts (3.OA.C.7), like-denominator fraction addition (4.NF.B.3) and unlike-denominator fraction addition (5.NF.A.1). These use familiar visual teaching strategies; they are not copied from or endorsed by Eureka Math or another publisher.

The local bank contains 60 fixed operand sets, each with derived answers, choices, explanations and diagram quantities. Every set is checked against the runtime verifier and independent arithmetic in tests. The first release contains 2 starting questions, 1 example, 2 guided questions, 2 independent checks, 2 review questions and 1 simpler support example per path. Two starting misses select the support example before returning to the grade-level practice. Repeated predefined wrong-answer patterns suggest a visual strategy; a single answer does not establish a misconception. The short strategy-choice prompt is guided reflection, not a validated diagnostic assessment.

Learning paths have no timers, lives, public scores or automatically advancing questions. Pictures are hidden on diagnostic/independent questions until requested; requesting them marks the response as assisted. Two correct unassisted check answers earn the narrowly worded snapshot "Two questions solved independently," not mastery. Review is scheduled after a day for that result, or ten minutes when more practice is needed; an early review button is also available. Repeated reviews reuse the two fixed review items, so they cannot demonstrate broad generalization. Snapshots remain in browser storage under normalized learner name and grade; names are labels, not authenticated identities. Unfinished lessons are not persisted. No background notification is scheduled.

Validation: 65 Node tests, production build, and server rendering of all six initial paths (four choices, no initial answer-picture, escaped learner text). Browser interactions, responsive appearance and accessibility were not exercised here. Teacher review and expansion to additional subskills remain outstanding.

## Expanded paths, layout and Bip reactions

Expanded to three mini-lessons per grade (18 paths, 180 fixed item definitions). Added take-away and missing-part activities for K–1, tens/hundreds digit value for grade 2, multiplication/division-focused paths for grade 3, and further fraction sums/subtraction for grades 4–5. Quantities overlap between some paths; 180 definitions do not mean 180 distinct mathematical facts. Every item passes runtime validation and independent arithmetic/diagram checks. Learning records are now keyed by learner, grade and lesson; the starter path reads the earlier key for continuity. Switching lessons ends unfinished attempts.

Moved the home learning invitation inside the right column to remove the blank desktop area caused by a full-width grid child. Added a compact lesson picker and a Bip sidebar that becomes a horizontal card on narrow screens. Bip now reacts to help, correct/incorrect answers and completion using existing local clips with short CSS effects. This is not a newly rigged 3D character. Muted playback, manual read-aloud, pause, reduced-motion defaults and video-error fallback are provided. Read-aloud depends on device speech support.

Validation: 68 Node tests, build, all 18 starting screens server-rendered, and a source/render check that the home invitation is inside the right column. Existing local video files referenced by each reaction are present. Browser playback, visual layout and physical-device interaction remain unverified in this environment.

## Family app and owner-content boundary

The pilot now separates a child-facing experience from local family/teacher guidance. Homework attachments are not automatically interpreted, uploaded or converted into public practice. The private owner Studio is a distinct server service with explicit draft approval/export and a separate content-only publishing command. Filename suggestions are labelled, shared-content packages reject private metadata, and ordinary words such as "banana" no longer trigger the corruption check just because they contain the letters "nan".

Validation increased to 79 Node tests plus 5 Python backend tests. IndexedDB tests use an in-memory implementation and verify blob preservation, export/import and rollback on conflicts/corrupt attachments. Real-server checks covered unauthenticated rejection, authenticated checking and OCR of a synthetic printed expression only. They do not establish OCR accuracy for real homework, browser-local data durability or learning efficacy. See docs/PILOT_DEPLOYMENT_STATUS.md for the exact deployment boundary.
