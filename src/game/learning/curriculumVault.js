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
import { Rational } from '../mathEngine/rational.js';

const VAULT_STORAGE_KEY = 'california_math_quest_knowledge_vault_v1';
const TEMPLATES_STORAGE_KEY = 'california_math_quest_learned_templates_v1';

// In-memory active stores
let storedQuestions = [];
let learnedTemplates = [];

/**
 * Initialize vault from persistent storage
 */
export function initCurriculumVault() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { questionsCount: storedQuestions.length, templatesCount: learnedTemplates.length };
  }

  try {
    const rawQuestions = window.localStorage.getItem(VAULT_STORAGE_KEY);
    if (rawQuestions) {
      storedQuestions = JSON.parse(rawQuestions);
    }
  } catch {
    storedQuestions = [];
  }

  try {
    const rawTemplates = window.localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (rawTemplates) {
      learnedTemplates = JSON.parse(rawTemplates);
    }
  } catch {
    learnedTemplates = [];
  }

  return getVaultStats();
}

/**
 * Extract a generalized pattern/template from a verified question.
 * Example:
 * Input: "A baker has 4 boxes of donuts. Each box has 6 donuts. How many donuts in total?"
 * Output template: "A baker has {n1} boxes of donuts. Each box has {n2} donuts. How many donuts in total?"
 * with operation: MULTIPLICATION, variables: [n1, n2], range: [2, 12]
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

  if (numbersInPrompt.length < 2) {
    // If not a multi-number pattern, save as a direct question template
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
      timesUsed: 0,
    };
  }

  // Parameterize numbers in the prompt
  let parameterizedPrompt = prompt;
  const variables = [];
  let numIndex = 1;

  for (const num of numbersInPrompt) {
    const varName = `{n${numIndex}}`;
    // Replace only first occurrence of this exact number
    parameterizedPrompt = parameterizedPrompt.replace(new RegExp(`\\b${num}\\b`), varName);
    variables.push({
      name: varName,
      originalValue: num,
      min: Math.max(1, Math.floor(num * 0.5)),
      max: Math.max(10, Math.ceil(num * 2)),
    });
    numIndex += 1;
  }

  // Deduce operation if possible
  let operation = 'unknown';
  const cNum = Number(question.correctAnswer);
  if (!Number.isNaN(cNum) && numbersInPrompt.length >= 2) {
    const n1 = numbersInPrompt[0];
    const n2 = numbersInPrompt[1];
    if (n1 + n2 === cNum) operation = 'addition';
    else if (n1 - n2 === cNum || n2 - n1 === cNum) operation = 'subtraction';
    else if (n1 * n2 === cNum) operation = 'multiplication';
    else if (n2 !== 0 && Math.round((n1 / n2) * 100) === Math.round(cNum * 100)) operation = 'division';
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
      storedQuestions.shift(); // Keep storage bounded
    }
  }

  // Extract structural template
  const template = extractTemplateFromQuestion(question);
  if (template) {
    // Avoid duplicate template strings for the same standard
    const templateExists = learnedTemplates.some(
      (t) => t.standard === template.standard && (t.templateString === template.templateString || t.prompt === template.prompt)
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
    return {
      ...template,
      id: `learned-ex-${Date.now()}-${prng.nextInt(100, 999)}`,
      verified: true,
      isSynthesizedFromAI: true,
    };
  }

  if (template.type === 'parametric_template') {
    // Generate fresh numbers within the learned constraints
    let freshPrompt = template.templateString;
    const assignedValues = {};

    template.variables.forEach((v, idx) => {
      const min = v.min || 2;
      const max = v.max || 20;
      let val = prng.nextInt(min, max);
      // For division, ensure clean divisibility if possible
      if (template.operation === 'division' && idx === 1) {
        val = prng.nextInt(2, 9);
      }
      assignedValues[`n${idx + 1}`] = val;
      freshPrompt = freshPrompt.replace(`{n${idx + 1}}`, val);
    });

    let answer = null;
    let stepExplanation = '';
    const v1 = assignedValues['n1'];
    const v2 = assignedValues['n2'];

    if (template.operation === 'multiplication' && v1 !== undefined && v2 !== undefined) {
      answer = v1 * v2;
      stepExplanation = `${v1} × ${v2} = ${answer}.`;
    } else if (template.operation === 'addition' && v1 !== undefined && v2 !== undefined) {
      answer = v1 + v2;
      stepExplanation = `${v1} + ${v2} = ${answer}.`;
    } else if (template.operation === 'subtraction' && v1 !== undefined && v2 !== undefined) {
      const high = Math.max(v1, v2);
      const low = Math.min(v1, v2);
      // Ensure positive result for elementary students
      freshPrompt = template.templateString.replace('{n1}', high).replace('{n2}', low);
      answer = high - low;
      stepExplanation = `${high} - ${low} = ${answer}.`;
    } else if (template.operation === 'division' && v1 !== undefined && v2 !== undefined) {
      const product = v1 * v2;
      freshPrompt = template.templateString.replace('{n1}', product).replace('{n2}', v2);
      answer = v1;
      stepExplanation = `${product} ÷ ${v2} = ${answer}.`;
    } else {
      // Fallback to original values if non-standard operation
      return {
        ...template,
        id: `learned-fixed-${Date.now()}`,
        prompt: template.templateString.replace(/\{n\d+\}/g, (m) => {
          const idx = parseInt(m.replace('{n', '').replace('}', ''), 10);
          return template.variables[idx - 1]?.originalValue || 5;
        }),
        correctAnswer: template.variables[0]?.originalValue || 10,
        options: [8, 10, 12, 15],
      };
    }

    // Build distractors around calculated answer
    const distractors = new Set();
    distractors.add(answer + 1);
    distractors.add(Math.max(1, answer - 1));
    distractors.add(answer + (template.operation === 'multiplication' ? v2 || 2 : 10));
    while (distractors.size < 3) {
      distractors.add(answer + prng.choice([-3, -2, 2, 3, 4, 5]));
    }

    const options = prng.shuffle([answer, ...Array.from(distractors).filter((d) => d !== answer).slice(0, 3)]);

    const synthesizedQuestion = {
      id: `synth-${template.standard}-${Date.now()}-${prng.nextInt(100, 999)}`,
      grade: template.grade,
      standard: template.standard,
      domain: template.domain,
      title: template.title,
      prompt: freshPrompt,
      correctAnswer: answer,
      options,
      explanation: `${stepExplanation} ${template.sourceExplanation}`,
      hint: template.sourceHint || `Solve using ${template.operation}: compute the relationship step by step.`,
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
    lastUpdated: storedQuestions.length > 0 ? storedQuestions[storedQuestions.length - 1].ingestedAt : null,
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
