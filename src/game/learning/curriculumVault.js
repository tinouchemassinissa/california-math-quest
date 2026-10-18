/**
 * Curriculum Knowledge Vault & Algorithmic Template Synthesizer
 *
 * Enables the application to:
 * 1. Ingest questions from external APIs / OER feeds and store them in persistent local storage.
 * 2. "Learn" from ingested questions by extracting sentence structures, variable slots, and mathematical schemas.
 * 3. Synthesize brand-new algorithmic question generators from learned templates so the app's
 *    offline generation capacity permanently expands whenever it connects online.
 */

import { verifyQuestion } from '../mathEngine/verifier.js';

const LEGACY_VAULT_KEY_V1 = 'california_math_quest_knowledge_vault_v1';
const LEGACY_TEMPLATES_KEY_V1 = 'california_math_quest_learned_templates_v1';

const VAULT_STORAGE_KEY = 'california_math_quest_knowledge_vault_v2';
const TEMPLATES_STORAGE_KEY = 'california_math_quest_learned_templates_v2';

// In-memory active stores
let storedQuestions = [];
let learnedTemplates = [];

/**
 * Parse a numeric answer and optional unit suffix (e.g. "48 sq ft" -> { value: 48, unitSuffix: " sq ft" })
 */
function parseNumericAnswerWithUnit(correctAnswer) {
  if (typeof correctAnswer === 'number' && Number.isFinite(correctAnswer)) {
    return { value: correctAnswer, unitSuffix: '' };
  }
  if (typeof correctAnswer === 'string') {
    const trimmed = correctAnswer.trim();
    // Do not treat fractions like "3/8" or times like "4:30" as plain numbers
    if (trimmed.includes('/') || trimmed.includes(':')) {
      return { value: NaN, unitSuffix: '' };
    }
    const match = trimmed.match(
      /^(-?\d+(?:\.\d+)?)(\s*(?:sq\s*\w+|square\s*\w+|cu\s*\w+|cubic\s*\w+|feet|ft|meters|m|cm|inches|in|¢|°))?$/i
    );
    if (match) {
      return {
        value: Number(match[1]),
        unitSuffix: match[2] || '',
      };
    }
  }
  return { value: NaN, unitSuffix: '' };
}

/**
 * Initialize vault from persistent storage and purge any corrupted v1 templates
 */
export function initCurriculumVault() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { questionsCount: storedQuestions.length, templatesCount: learnedTemplates.length };
  }

  // Purge legacy v1 storage keys that could contain unknown-operation templates
  try {
    window.localStorage.removeItem(LEGACY_VAULT_KEY_V1);
    window.localStorage.removeItem(LEGACY_TEMPLATES_KEY_V1);
  } catch {
    // Ignore storage removal errors
  }

  try {
    const rawQuestions = window.localStorage.getItem(VAULT_STORAGE_KEY);
    if (rawQuestions) {
      const parsed = JSON.parse(rawQuestions);
      storedQuestions = Array.isArray(parsed)
        ? parsed.filter((q) => verifyQuestion(q).valid)
        : [];
    }
  } catch {
    storedQuestions = [];
  }

  try {
    const rawTemplates = window.localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (rawTemplates) {
      const parsed = JSON.parse(rawTemplates);
      // Only keep valid templates (never keep parametric templates with unknown operation)
      learnedTemplates = Array.isArray(parsed)
        ? parsed.filter(
            (t) =>
              t &&
              (t.type === 'fixed_exemplar' ||
                (t.type === 'parametric_template' &&
                  ['addition', 'subtraction', 'multiplication', 'division'].includes(t.operation)))
          )
        : [];
    }
  } catch {
    learnedTemplates = [];
  }

  return getVaultStats();
}

/**
 * Extract a generalized pattern/template from a verified question.
 * Example:
 * Input: "A classroom rug is 8 feet long and 6 feet wide. What is its area in square feet?" ("48 sq ft")
 * Output template: "A classroom rug is {n1} feet long and {n2} feet wide. What is its area in square feet?"
 * with operation: 'multiplication', unitSuffix: ' sq ft', variables: [n1, n2]
 */
export function extractTemplateFromQuestion(question) {
  if (!question || !question.prompt || typeof question.correctAnswer === 'undefined') {
    return null;
  }

  const prompt = question.prompt;
  const numbersInPrompt = [];
  const regex = /\b\d+(\.\d+)?\b/g;
  let match;

  while ((match = regex.exec(prompt)) !== null) {
    numbersInPrompt.push(Number(match[0]));
  }

  const { value: cNum, unitSuffix } = parseNumericAnswerWithUnit(question.correctAnswer);

  // Deduce exact binary operation ONLY when there are exactly 2 numbers in the prompt
  // and no special remainder / fraction / clock / multi-step traps
  let operation = 'unknown';
  const hasSpecialSemantics = /remainder|minimum|maximum|fraction|slice|clock|hour|minute|ten-frame|bar graph/i.test(
    prompt
  );

  if (!hasSpecialSemantics && numbersInPrompt.length === 2 && Number.isFinite(cNum)) {
    const n1 = numbersInPrompt[0];
    const n2 = numbersInPrompt[1];
    if (n1 * n2 === cNum) operation = 'multiplication';
    else if (n1 + n2 === cNum) operation = 'addition';
    else if (n1 - n2 === cNum) operation = 'subtraction';
    else if (n2 !== 0 && n1 % n2 === 0 && n1 / n2 === cNum) operation = 'division';
  }

  // If the question is not a clean 2-number arithmetic relationship, preserve it as an exact fixed exemplar!
  // NEVER create a parametric_template with operation === 'unknown'.
  if (operation === 'unknown') {
    return {
      id: `tmpl-${question.standard}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      standard: question.standard,
      grade: question.grade,
      domain: question.domain || 'MATH',
      title: question.title || 'Learned Problem',
      type: 'fixed_exemplar',
      prompt: question.prompt,
      correctAnswer: question.correctAnswer,
      options: question.options,
      explanation: question.explanation,
      hint: question.hint,
      manipulative: question.manipulative,
      timesUsed: 0,
    };
  }

  // Parameterize the 2 numbers in the prompt
  let parameterizedPrompt = prompt;
  const variables = [];
  let numIndex = 1;

  for (const num of numbersInPrompt) {
    const varName = `{n${numIndex}}`;
    parameterizedPrompt = parameterizedPrompt.replace(new RegExp(`\\b${num}\\b`), varName);
    variables.push({
      name: varName,
      originalValue: num,
      min: Math.max(2, Math.floor(num * 0.5)),
      max: Math.max(10, Math.ceil(num * 1.8)),
    });
    numIndex += 1;
  }

  return {
    id: `tmpl-${question.standard}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    standard: question.standard,
    grade: question.grade,
    domain: question.domain || 'MATH',
    title: question.title || 'Learned Word Problem Template',
    type: 'parametric_template',
    templateString: parameterizedPrompt,
    variables,
    operation,
    unitSuffix,
    sourceExplanation: question.explanation || '',
    sourceHint: question.hint || '',
    timesUsed: 0,
    learnedAt: new Date().toISOString(),
  };
}

/**
 * Ingest a verified question into the Knowledge Vault, extract its template, and persist.
 */
export function learnFromQuestion(question) {
  if (!question || !question.prompt) return false;

  // Run verification gate first: do not learn from invalid math!
  const verifyResult = verifyQuestion(question);
  if (!verifyResult.valid) {
    return false;
  }

  // Check if identical prompt already stored
  const exists = storedQuestions.some((q) => q.prompt === question.prompt);
  if (!exists) {
    storedQuestions.push({
      ...question,
      ingestedAt: new Date().toISOString(),
    });
    if (storedQuestions.length > 300) {
      storedQuestions.shift();
    }
  }

  // Extract structural template
  const template = extractTemplateFromQuestion(question);
  if (template) {
    const templateExists = learnedTemplates.some(
      (t) =>
        t.standard === template.standard &&
        (t.templateString === template.templateString || t.prompt === template.prompt)
    );
    if (!templateExists) {
      learnedTemplates.push(template);
      if (learnedTemplates.length > 150) {
        learnedTemplates.shift();
      }
    }
  }

  saveVaultToStorage();
  return true;
}

/**
 * Batch ingest items from an online curriculum feed
 */
export function learnFromFeed(items) {
  if (!Array.isArray(items)) return { ingested: 0, templatesLearned: 0 };
  let ingested = 0;
  const initialTmplCount = learnedTemplates.length;

  for (const item of items) {
    if (learnFromQuestion(item)) {
      ingested += 1;
    }
  }

  return {
    ingested,
    templatesLearned: learnedTemplates.length - initialTmplCount,
    totalLearned: storedQuestions.length,
    totalTemplates: learnedTemplates.length,
  };
}

/**
 * Synthesize a fresh problem from a learned template
 */
export function synthesizeFromLearnedTemplate(template, prng) {
  if (!template) return null;

  if (template.type === 'fixed_exemplar') {
    const candidate = {
      ...template,
      id: `learned-ex-${Date.now()}-${prng.nextInt(100, 999)}`,
      verified: true,
      isSynthesizedFromAI: true,
    };
    return verifyQuestion(candidate).valid ? candidate : null;
  }

  if (template.type === 'parametric_template') {
    if (!['multiplication', 'addition', 'subtraction', 'division'].includes(template.operation)) {
      return null;
    }

    let freshPrompt = template.templateString;
    const assignedValues = {};

    template.variables.forEach((v, idx) => {
      const min = Math.max(2, v.min || 2);
      const max = Math.max(min + 2, v.max || 12);
      let val = prng.nextInt(min, max);
      if (template.operation === 'division' && idx === 1) {
        val = prng.nextInt(2, 9);
      }
      assignedValues[`n${idx + 1}`] = val;
      freshPrompt = freshPrompt.replace(`{n${idx + 1}}`, val);
    });

    let numericAnswer = null;
    let stepExplanation = '';
    const v1 = assignedValues['n1'];
    const v2 = assignedValues['n2'];

    if (v1 === undefined || v2 === undefined) {
      return null;
    }

    if (template.operation === 'multiplication') {
      numericAnswer = v1 * v2;
      stepExplanation = `${v1} × ${v2} = ${numericAnswer}.`;
    } else if (template.operation === 'addition') {
      numericAnswer = v1 + v2;
      stepExplanation = `${v1} + ${v2} = ${numericAnswer}.`;
    } else if (template.operation === 'subtraction') {
      const high = Math.max(v1, v2);
      const low = Math.min(v1, v2);
      freshPrompt = template.templateString.replace('{n1}', high).replace('{n2}', low);
      numericAnswer = high - low;
      stepExplanation = `${high} − ${low} = ${numericAnswer}.`;
    } else if (template.operation === 'division') {
      const product = v1 * v2;
      freshPrompt = template.templateString.replace('{n1}', product).replace('{n2}', v2);
      numericAnswer = v1;
      stepExplanation = `${product} ÷ ${v2} = ${numericAnswer}.`;
    }

    const suffix = template.unitSuffix || '';
    const formatVal = (n) => (suffix ? `${n}${suffix}` : n);

    const formattedCorrect = formatVal(numericAnswer);

    // Build distinct distractors around calculated answer with matching units
    const numericDistractors = new Set();
    if (template.operation === 'multiplication') {
      numericDistractors.add(numericAnswer + v1);
      numericDistractors.add(Math.max(1, numericAnswer - v2));
      numericDistractors.add(2 * (v1 + v2));
    }
    numericDistractors.add(numericAnswer + 2);
    numericDistractors.add(Math.max(1, numericAnswer - 2));
    numericDistractors.add(numericAnswer + 10);

    let offset = 1;
    while (numericDistractors.size < 6) {
      const cand = numericAnswer + offset * 3;
      if (cand > 0 && cand !== numericAnswer) {
        numericDistractors.add(cand);
      }
      offset += 1;
    }

    const distinctWrong = Array.from(numericDistractors)
      .filter((d) => d > 0 && d !== numericAnswer)
      .slice(0, 3)
      .map(formatVal);

    const options = prng.shuffle([formattedCorrect, ...distinctWrong]);

    const synthesizedQuestion = {
      id: `synth-${template.standard}-${Date.now()}-${prng.nextInt(100, 999)}`,
      grade: template.grade,
      standard: template.standard,
      domain: template.domain,
      title: template.title,
      prompt: freshPrompt,
      correctAnswer: formattedCorrect,
      options,
      explanation: `${stepExplanation}${suffix ? ` (${formattedCorrect})` : ''}`,
      hint:
        template.sourceHint ||
        `Solve using ${template.operation}: compute the relationship step by step.`,
      isSynthesizedFromAI: true,
      verified: true,
    };

    const verified = verifyQuestion(synthesizedQuestion);
    if (verified.valid) {
      template.timesUsed = (template.timesUsed || 0) + 1;
      return synthesizedQuestion;
    }
  }

  return null;
}

/**
 * Get learned templates for a specific grade or standard
 */
export function getLearnedTemplates(grade, standardCode = null) {
  return learnedTemplates.filter(
    (t) => (!grade || t.grade === grade) && (!standardCode || t.standard === standardCode)
  );
}

/**
 * Returns statistics about the knowledge vault
 */
export function getVaultStats() {
  const standardsCovered = new Set(storedQuestions.map((q) => q.standard)).size;
  const grades = Array.from(new Set(storedQuestions.map((q) => q.grade))).sort();

  return {
    questionsCount: storedQuestions.length,
    templatesCount: learnedTemplates.length,
    standardsCovered,
    grades,
    lastUpdated:
      storedQuestions.length > 0 ? storedQuestions[storedQuestions.length - 1].ingestedAt : null,
  };
}

/**
 * Clears the knowledge vault
 */
export function clearVault() {
  storedQuestions = [];
  learnedTemplates = [];
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(VAULT_STORAGE_KEY);
    window.localStorage.removeItem(TEMPLATES_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_VAULT_KEY_V1);
    window.localStorage.removeItem(LEGACY_TEMPLATES_KEY_V1);
  }
}

function saveVaultToStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(storedQuestions));
    window.localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(learnedTemplates));
  } catch (err) {
    console.warn('Storage quota exceeded for curriculum vault:', err);
  }
}
