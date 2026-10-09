import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GRADES,
  STANDARDS,
  DOMAINS,
  generateQuestion,
} from '../data/cambrianCurriculum.js';

test('curriculum has all 6 elementary grades (K through 5)', () => {
  const gradeIds = GRADES.map((g) => g.id);
  assert.deepEqual(gradeIds, ['K', '1', '2', '3', '4', '5']);
});

test('curriculum has California Common Core domains', () => {
  assert.ok(DOMAINS.OA, 'OA domain exists');
  assert.ok(DOMAINS.NBT, 'NBT domain exists');
  assert.ok(DOMAINS.NF, 'NF domain exists');
  assert.ok(DOMAINS.MD, 'MD domain exists');
  assert.ok(DOMAINS.G, 'G domain exists');
});

test('generates questions for each grade level with correct answer in options', () => {
  for (const grade of ['K', '1', '2', '3', '4', '5']) {
    for (let i = 0; i < 5; i += 1) {
      const q = generateQuestion(grade);
      assert.ok(q, `Should generate question for grade ${grade}`);
      assert.equal(q.grade, grade);
      assert.ok(q.prompt, 'Question must have a prompt');
      assert.ok(q.options.length >= 2, 'Question must have options');
      assert.ok(
        q.options.includes(q.correctAnswer),
        `Options must contain correct answer: ${q.correctAnswer} in ${JSON.stringify(q.options)}`
      );
      assert.ok(STANDARDS[q.standard], `Standard ${q.standard} must exist in STANDARDS dictionary`);
    }
  }
});
