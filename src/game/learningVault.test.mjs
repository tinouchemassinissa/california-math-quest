import test from 'node:test';
import assert from 'node:assert/strict';
import {
  learnFromQuestion,
  learnFromFeed,
  extractTemplateFromQuestion,
  synthesizeFromLearnedTemplate,
  getVaultStats,
  clearVault,
} from './learning/curriculumVault.js';
import { createPRNG } from './mathEngine/prng.js';
import { verifyQuestion } from './mathEngine/verifier.js';

test('Curriculum Vault correctly extracts parametric templates from word problems', () => {
  const sampleQuestion = {
    id: 'test-1',
    grade: '3',
    standard: '3.OA.A.3',
    domain: 'OA',
    title: 'Word Problem Multiplication',
    prompt: 'A farmer packed 4 boxes with 6 apples in each. How many apples in total?',
    correctAnswer: 24,
    options: [20, 22, 24, 28],
    explanation: 'Multiply 4 by 6 to get 24.',
    hint: 'Multiply boxes by apples.',
  };

  const template = extractTemplateFromQuestion(sampleQuestion);
  assert.ok(template);
  assert.equal(template.type, 'parametric_template');
  assert.equal(template.operation, 'multiplication');
  assert.ok(template.templateString.includes('{n1}'));
  assert.ok(template.templateString.includes('{n2}'));
});

test('Curriculum Vault learns from questions and rejects mathematically invalid ones', () => {
  clearVault();

  // Valid question
  const validQ = {
    id: 'valid-1',
    grade: '2',
    standard: '2.OA.A.1',
    domain: 'OA',
    title: 'Add within 100',
    prompt: 'There are 15 red birds and 12 blue birds in the tree. How many birds in total?',
    correctAnswer: 27,
    options: [25, 26, 27, 28],
    explanation: '15 + 12 = 27.',
  };
  const learned = learnFromQuestion(validQ);
  assert.equal(learned, true);

  // Invalid question (duplicate options)
  const invalidQ = {
    id: 'invalid-1',
    grade: '2',
    standard: '2.OA.A.1',
    domain: 'OA',
    title: 'Faulty Question',
    prompt: 'What is 5 + 5?',
    correctAnswer: 10,
    options: [10, 10, 12, 14], // duplicate 10
  };
  const rejected = learnFromQuestion(invalidQ);
  assert.equal(rejected, false);
});

test('Curriculum Vault synthesizes fresh randomized questions from learned templates', () => {
  clearVault();

  const sourceQuestion = {
    id: 'source-1',
    grade: '4',
    standard: '4.OA.A.2',
    domain: 'OA',
    title: 'Multiplicative Comparison',
    prompt: 'A chef made 5 trays of muffins with 8 muffins on each tray. How many muffins total?',
    correctAnswer: 40,
    options: [35, 40, 45, 50],
    explanation: '5 × 8 = 40 muffins.',
  };

  learnFromQuestion(sourceQuestion);
  const template = extractTemplateFromQuestion(sourceQuestion);

  const prng = createPRNG(4242);
  const synthesized = synthesizeFromLearnedTemplate(template, prng);

  assert.ok(synthesized);
  assert.equal(synthesized.isSynthesizedFromAI, true);
  assert.ok(synthesized.prompt.includes('trays of muffins'));
  assert.ok(synthesized.options.includes(synthesized.correctAnswer));

  // Verify that the synthesized problem passes the formal verification gate
  const verification = verifyQuestion(synthesized);
  assert.equal(verification.valid, true);
});

test('Batch learnFromFeed ingests curriculum items and reports stats', () => {
  clearVault();

  const mockFeed = [
    {
      id: 'f-1',
      grade: '1',
      standard: '1.OA.C.6',
      domain: 'OA',
      title: 'Fluency',
      prompt: 'What is 7 + 6?',
      correctAnswer: 13,
      options: [11, 12, 13, 14],
      explanation: '7 + 6 = 13.',
    },
    {
      id: 'f-2',
      grade: '3',
      standard: '3.MD.C.7',
      domain: 'MD',
      title: 'Area',
      prompt: 'A rectangle has a length of 7 feet and a width of 5 feet. What is its area?',
      correctAnswer: 35,
      options: [24, 30, 35, 40],
      explanation: '7 × 5 = 35 sq ft.',
    },
  ];

  const result = learnFromFeed(mockFeed);
  assert.equal(result.ingested, 2);
  assert.ok(result.totalLearned >= 2);

  const stats = getVaultStats();
  assert.equal(stats.questionsCount, 2);
  assert.ok(stats.templatesCount >= 1);
});
