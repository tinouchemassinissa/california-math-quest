/**
 * Exact Symbolic Rational Number Engine
 * Eliminates JavaScript floating-point errors (e.g. 0.1 + 0.2 !== 0.3)
 * Exact within safe-integer bounds; oversized or noninteger inputs are rejected.
 */

export function gcd(a, b) {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) throw new TypeError("gcd expects safe integers");
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function lcm(a, b) {
  const g = gcd(a, b);
  const result = BigInt(a) / BigInt(g) * BigInt(b);
  const positive = result < 0n ? -result : result;
  if (positive > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError("lcm exceeds exact supported bounds");
  return Number(positive);
}

// Use exact intermediates before reducing and converting back to bounded Numbers.
function exactResult(n, d) {
  if (d === 0n) throw new RangeError('Division by zero rational');
  if (d < 0n) { n = -n; d = -d; }
  let a = n < 0n ? -n : n, b = d;
  while (b) [a,b] = [b,a % b];
  const common = a || 1n;
  n /= common; d /= common;
  const limit = BigInt(Number.MAX_SAFE_INTEGER);
  if (n > limit || n < -limit || d > limit) throw new RangeError('Rational result exceeds exact supported bounds');
  return new Rational(Number(n),Number(d));
}

export class Rational {
  constructor(numerator, denominator = 1) {
    if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)) {
      throw new TypeError(`Rational expects safe integers: ${numerator}/${denominator}`);
    }
    if (Math.trunc(denominator) === 0) {
      throw new RangeError('Denominator cannot be zero.');
    }

    let n = Math.trunc(numerator);
    let d = Math.trunc(denominator);

    if (d < 0) {
      n = -n;
      d = -d;
    }

    const common = gcd(n, d);
    this.n = n / common;
    this.d = d / common;
  }

  add(other) {
    const o = other instanceof Rational ? other : new Rational(other);
    return exactResult(BigInt(this.n) * BigInt(o.d) + BigInt(o.n) * BigInt(this.d), BigInt(this.d) * BigInt(o.d));
  }

  subtract(other) {
    const o = other instanceof Rational ? other : new Rational(other);
    return exactResult(BigInt(this.n) * BigInt(o.d) - BigInt(o.n) * BigInt(this.d), BigInt(this.d) * BigInt(o.d));
  }

  multiply(other) {
    const o = other instanceof Rational ? other : new Rational(other);
    return exactResult(BigInt(this.n) * BigInt(o.n), BigInt(this.d) * BigInt(o.d));
  }

  divide(other) {
    const o = other instanceof Rational ? other : new Rational(other);
    if (o.n === 0) {
      throw new RangeError('Division by zero rational');
    }
    return exactResult(BigInt(this.n) * BigInt(o.d), BigInt(this.d) * BigInt(o.n));
  }

  equals(other) {
    const o = other instanceof Rational ? other : new Rational(other);
    return this.n === o.n && this.d === o.d;
  }

  toNumber() {
    return this.n / this.d;
  }

  toString() {
    if (this.d === 1) return String(this.n);
    return `${this.n}/${this.d}`;
  }

  toMixedString() {
    if (this.d === 1) return String(this.n);
    const whole = Math.trunc(this.n / this.d);
    const rem = Math.abs(this.n % this.d);
    if (whole === 0) return `${this.n}/${this.d}`;
    if (rem === 0) return String(whole);
    return `${whole} ${rem}/${this.d}`;
  }
}
