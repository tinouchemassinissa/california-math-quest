import { evaluateArithmetic, isAnswerEquivalent, canonicalAnswer } from './answerMath.js';

// These bounded checks cover recognized prompt families, not arbitrary prose.
export function semanticErrors(question) {
  const errors = standaloneEquationErrors(question.explanation || '');
  const { prompt = '', correctAnswer, manipulative: m, standard } = question;
  const expect = (value, why) => { if (!isAnswerEquivalent(correctAnswer, value)) errors.push(why); };
  const direct = prompt.match(/(?:Calculate:?|Compute:?|What is|Fluently (?:Add|Subtract) within 1,000:)\s*([\d(][\d\s.,()+*/×÷−^\-]*)/i);
  if (direct && /[+*/×÷−\-]/.test(direct[1])) {
    try { expect(evaluateArithmetic(direct[1].trim().replace(/\.$/, '')).toString(), 'Answer disagrees with the explicit arithmetic in the prompt'); } catch { /* other prompt families need their own checks */ }
  }
  const pemdas = prompt.match(/Evaluate using Order of Operations \(PEMDAS\): (.+)$/);
  if (pemdas) { try { expect(evaluateArithmetic(pemdas[1]).toString(), 'Order-of-operations answer is wrong'); } catch { errors.push('Invalid order-of-operations expression'); } }
  const rounding = prompt.match(/Round ([\d,.]+) to the nearest (10|100|THOUSAND|TENTH)\./i);
  if (rounding) { const unit = { THOUSAND: 1000, TENTH: 0.1 }[rounding[2].toUpperCase()] || Number(rounding[2]); const n = Number(rounding[1].replace(/,/g, '')); const expected = Math.round(n / unit + 1e-9) * unit; expect(Number(expected.toFixed(3)), 'Rounding answer is wrong'); }
  const frac = prompt.match(/(?:Calculate|denominators:|simplify if possible:)\s*(\d+\/\d+\s*[+×−\-]\s*\d+\/\d+)/);
  if (frac) { try { expect(evaluateArithmetic(frac[1]).toString(), 'Fraction operation answer is wrong'); } catch { errors.push('Invalid fraction operation'); } }
  const bounded = { 'K.OA.A.2': 10, 'K.OA.A.4': 10, '1.OA.A.1': 20, '1.OA.C.6': 20, '1.OA.D.8': 20, '2.OA.B.2': 20, '3.NBT.A.2': 1000 }[standard];
  if (bounded && typeof correctAnswer === 'number' && (correctAnswer < 0 || correctAnswer > bounded)) errors.push('Answer exceeds the range of its standard');
  if (Array.isArray(question.options)) {
    const keys = question.options.map(canonicalAnswer);
    if (new Set(keys).size !== keys.length) errors.push('Options include mathematically equivalent choices');
  }
  if (m) {
    if (m.type === 'tape-diagram' && Array.isArray(m.parts)) {
      if (!m.parts.length || m.parts.some(n => !Number.isFinite(n) || n < 0) || Math.abs(m.parts.reduce((a,b) => a+b, 0) - m.total) > 1e-9) errors.push('Tape diagram parts do not equal its total');
    }
    if (m.type === 'number-line' && !(m.min <= m.start && m.start <= m.max && m.min <= m.target && m.target <= m.max)) errors.push('Number-line values exceed its shown range');
    if (m.type === 'fraction' || m.type === 'fraction-number-line') {
      if (!Number.isInteger(m.numerator) || !Number.isInteger(m.denominator) || m.denominator <= 0 || m.numerator < 0 || m.numerator > m.denominator) errors.push('Fraction diagram cannot display this quantity');
    }
    if (m.type === 'array' && (!Number.isInteger(m.rows) || !Number.isInteger(m.cols) || m.rows < 0 || m.cols < 0)) errors.push('Invalid array');
    if (standard === '2.OA.C.4' && m.type === 'array' && (m.rows > 5 || m.cols > 5)) errors.push('Grade 2 array exceeds 5 rows or columns');
    if (standard === '3.OA.C.7' && m.type === 'array' && (m.rows > 9 || m.cols > 9 || m.rows * m.cols > 100)) errors.push('Fact practice exceeds single-digit factors');
  }
  return errors;
}

export function standaloneEquationErrors(text = '') {
  const errors = [];
  const number = '\\d+(?:,\\d{3})*(?:\\.\\d+)?';
  const regex = new RegExp(`(${number})\\s*([+×÷−-])\\s*(${number})\\s*=\\s*(${number})`, 'g');
  for (const m of String(text).matchAll(regex)) {
    const before = text.slice(0,m.index).trimEnd(); const after = text.slice(m.index+m[0].length).trimStart();
    // A piece of a longer expression/fraction is not a standalone equality.
    if (/[\d×÷*/+^−-]$/.test(before) || /^[\d×÷*/+^−-]/.test(after)) continue;
    try {
      const lhs = evaluateArithmetic(`${m[1]} ${m[2]} ${m[3]}`);
      if (!lhs.equals(evaluateArithmetic(m[4]))) errors.push(`Incorrect arithmetic statement: ${m[0]}`);
    } catch { errors.push('Invalid arithmetic statement in worked solution'); }
  }
  return errors;
}
