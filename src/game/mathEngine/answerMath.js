import { Rational } from './rational.js';

// A bounded arithmetic parser, never eval/Function. Used independently of generators.
export function evaluateArithmetic(input) {
  const source = String(input).trim().replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\[/g, '(').replace(/\]/g, ')');
  if (!source || source.length > 300 || /[^\d\s.,()+*/^\-]/.test(source)) throw new Error('Not a numeric expression');
  const clean = source.replace(/\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g, n => n.replace(/,/g, ''));
  if (clean.includes(',')) throw new Error('Not a number grouping');
  const tokens = clean.match(/\d+(?:\.\d+)?|[()+*/^\-]/g) || [];
  if (tokens.join('') !== clean.replace(/\s/g, '')) throw new Error('Invalid token');
  let i = 0;
  const atom = () => {
    if (tokens[i] === '(') { i++; const v = sum(); if (tokens[i++] !== ')') throw new Error('Missing close'); return v; }
    const t = tokens[i++];
    if (!t || !/^\d+(?:\.\d+)?$/.test(t)) throw new Error('Missing number');
    const decimals = (t.split('.')[1] || '').length;
    if (decimals > 6) throw new Error('Decimal too long');
    return new Rational(Number(t.replace('.', '')), 10 ** decimals);
  };
  const power = () => {
    let v = atom();
    if (tokens[i] === '^') { i++; const e = unary(); if(e.d !== 1 || e.n < 0 || e.n > 6) throw new Error('Exponent out of range'); v = new Rational(v.n ** e.n, v.d ** e.n); }
    return v;
  };
  const unary = () => {
    if (tokens[i] === '-') { i++; return new Rational(-1).multiply(unary()); }
    if (tokens[i] === '+') { i++; return unary(); }
    return power();
  };
  const product = () => { let v = unary(); while (tokens[i] === '*' || tokens[i] === '/') { const op = tokens[i++]; const rhs = unary(); v = op === '*' ? v.multiply(rhs) : v.divide(rhs); } return v; };
  const sum = () => { let v = product(); while (tokens[i] === '+' || tokens[i] === '-') { const op = tokens[i++]; const rhs = product(); v = op === '+' ? v.add(rhs) : v.subtract(rhs); } return v; };
  const value = sum();
  if (i !== tokens.length || !Number.isSafeInteger(value.n) || !Number.isSafeInteger(value.d)) throw new Error('Invalid or oversized expression');
  return value;
}

export function parseQuantity(value) {
  let text = String(value ?? '').trim().toLowerCase();
  let unit = '';
  if (text.startsWith('$')) { unit = '$'; text = text.slice(1); }
  const match = text.match(/\s*(sq\s+(?:ft|m|cm|in)|cu\s+(?:ft|m|cm|in)|cm cubes|ft|cm|km|kg|ml|min|m|g|l|¢|°)$/);
  if (match) { if (unit) return null; unit = match[0].trim(); text = text.slice(0, match.index).trim(); }
  try { return { value: evaluateArithmetic(text), unit }; } catch { return null; }
}
export function canonicalAnswer(value) {
  const q = parseQuantity(value);
  return q ? `${q.value.toString()}|${q.unit}` : String(value).trim().toLowerCase();
}
export function isAnswerEquivalent(given, correct, { allowBareUnits = true } = {}) {
  if (given == null || correct == null || String(given).trim() === '' || String(correct).trim() === '') return false;
  if (String(given ?? '').trim().toLowerCase() === String(correct ?? '').trim().toLowerCase()) return true;
  const g = parseQuantity(given); const c = parseQuantity(correct);
  if (!g || !c || !g.value.equals(c.value)) return false;
  return g.unit === c.unit || (allowBareUnits && !g.unit && Boolean(c.unit));
}
