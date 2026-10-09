/**
 * Exact Symbolic Rational Number Engine
 * Eliminates JavaScript floating-point errors (e.g. 0.1 + 0.2 !== 0.3)
 * Guarantees mathematical precision for elementary fraction and integer arithmetic.
 */

export function gcd(a, b) {
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
  return Math.abs(Math.trunc(a * b)) / g;
}

export class Rational {
  constructor(numerator, denominator = 1) {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
      throw new TypeError(`Rational expects finite numbers: ${numerator}/${denominator}`);
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
    return new Rational(this.n * o.d + o.n * this.d, this.d * o.d);
  }

  subtract(other) {
    const o = other instanceof Rational ? other : new Rational(other);
    return new Rational(this.n * o.d - o.n * this.d, this.d * o.d);
  }

  multiply(other) {
    const o = other instanceof Rational ? other : new Rational(other);
    return new Rational(this.n * o.n, this.d * o.d);
  }

  divide(other) {
    const o = other instanceof Rational ? other : new Rational(other);
    if (o.n === 0) {
      throw new RangeError('Division by zero rational');
    }
    return new Rational(this.n * o.d, this.d * o.n);
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
