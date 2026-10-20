// src/components/VisualMathActivity.jsx
import React, { useState } from "react";

// src/game/mathEngine/rational.js
function gcd(a, b) {
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
function exactResult(n, d) {
  if (d === 0n) throw new RangeError("Division by zero rational");
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  let a = n < 0n ? -n : n, b = d;
  while (b) [a, b] = [b, a % b];
  const common = a || 1n;
  n /= common;
  d /= common;
  const limit = BigInt(Number.MAX_SAFE_INTEGER);
  if (n > limit || n < -limit || d > limit) throw new RangeError("Rational result exceeds exact supported bounds");
  return new Rational(Number(n), Number(d));
}
var Rational = class _Rational {
  constructor(numerator, denominator = 1) {
    if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)) {
      throw new TypeError(`Rational expects safe integers: ${numerator}/${denominator}`);
    }
    if (Math.trunc(denominator) === 0) {
      throw new RangeError("Denominator cannot be zero.");
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
    const o = other instanceof _Rational ? other : new _Rational(other);
    return exactResult(BigInt(this.n) * BigInt(o.d) + BigInt(o.n) * BigInt(this.d), BigInt(this.d) * BigInt(o.d));
  }
  subtract(other) {
    const o = other instanceof _Rational ? other : new _Rational(other);
    return exactResult(BigInt(this.n) * BigInt(o.d) - BigInt(o.n) * BigInt(this.d), BigInt(this.d) * BigInt(o.d));
  }
  multiply(other) {
    const o = other instanceof _Rational ? other : new _Rational(other);
    return exactResult(BigInt(this.n) * BigInt(o.n), BigInt(this.d) * BigInt(o.d));
  }
  divide(other) {
    const o = other instanceof _Rational ? other : new _Rational(other);
    if (o.n === 0) {
      throw new RangeError("Division by zero rational");
    }
    return exactResult(BigInt(this.n) * BigInt(o.d), BigInt(this.d) * BigInt(o.n));
  }
  equals(other) {
    const o = other instanceof _Rational ? other : new _Rational(other);
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
};

// src/game/mathEngine/answerMath.js
function evaluateArithmetic(input) {
  const source = String(input).trim().replace(/−/g, "-").replace(/×/g, "*").replace(/÷/g, "/").replace(/\[/g, "(").replace(/\]/g, ")");
  if (!source || source.length > 300 || /[^\d\s.,()+*/^\-]/.test(source)) throw new Error("Not a numeric expression");
  const clean = source.replace(/\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g, (n) => n.replace(/,/g, ""));
  if (clean.includes(",")) throw new Error("Not a number grouping");
  const tokens = clean.match(/\d+(?:\.\d+)?|[()+*/^\-]/g) || [];
  if (tokens.join("") !== clean.replace(/\s/g, "")) throw new Error("Invalid token");
  let i = 0;
  const atom = () => {
    if (tokens[i] === "(") {
      i++;
      const v = sum();
      if (tokens[i++] !== ")") throw new Error("Missing close");
      return v;
    }
    const t = tokens[i++];
    if (!t || !/^\d+(?:\.\d+)?$/.test(t)) throw new Error("Missing number");
    const decimals = (t.split(".")[1] || "").length;
    if (decimals > 6) throw new Error("Decimal too long");
    return new Rational(Number(t.replace(".", "")), 10 ** decimals);
  };
  const power = () => {
    let v = atom();
    if (tokens[i] === "^") {
      i++;
      const e = unary();
      if (e.d !== 1 || e.n < 0 || e.n > 6) throw new Error("Exponent out of range");
      v = new Rational(v.n ** e.n, v.d ** e.n);
    }
    return v;
  };
  const unary = () => {
    if (tokens[i] === "-") {
      i++;
      return new Rational(-1).multiply(unary());
    }
    if (tokens[i] === "+") {
      i++;
      return unary();
    }
    return power();
  };
  const product = () => {
    let v = unary();
    while (tokens[i] === "*" || tokens[i] === "/") {
      const op = tokens[i++];
      const rhs = unary();
      v = op === "*" ? v.multiply(rhs) : v.divide(rhs);
    }
    return v;
  };
  const sum = () => {
    let v = product();
    while (tokens[i] === "+" || tokens[i] === "-") {
      const op = tokens[i++];
      const rhs = product();
      v = op === "+" ? v.add(rhs) : v.subtract(rhs);
    }
    return v;
  };
  const value = sum();
  if (i !== tokens.length || !Number.isSafeInteger(value.n) || !Number.isSafeInteger(value.d)) throw new Error("Invalid or oversized expression");
  return value;
}
function parseQuantity(value) {
  let text = String(value ?? "").trim().toLowerCase();
  let unit = "";
  if (text.startsWith("$")) {
    unit = "$";
    text = text.slice(1);
  }
  const match = text.match(/\s*(sq\s+(?:ft|m|cm|in)|cu\s+(?:ft|m|cm|in)|cm cubes|ft|cm|km|kg|ml|min|m|g|l|¢|°)$/);
  if (match) {
    if (unit) return null;
    unit = match[0].trim();
    text = text.slice(0, match.index).trim();
  }
  try {
    return { value: evaluateArithmetic(text), unit };
  } catch {
    return null;
  }
}
function isAnswerEquivalent(given, correct, { allowBareUnits = true } = {}) {
  if (given == null || correct == null || String(given).trim() === "" || String(correct).trim() === "") return false;
  if (String(given ?? "").trim().toLowerCase() === String(correct ?? "").trim().toLowerCase()) return true;
  const g = parseQuantity(given);
  const c = parseQuantity(correct);
  if (!g || !c || !g.value.equals(c.value)) return false;
  return g.unit === c.unit || allowBareUnits && !g.unit && Boolean(c.unit);
}

// src/game/visualMathActivities.js
var SYMMETRY_LEFT = [[0, 0], [1, 0], [1, 1], [2, 2], [0, 3]];
var mirrorCell = ([x, y]) => [5 - x, y];
var cellKey = ([x, y]) => x + "," + y;
function matchesCells(selected, expected) {
  const keys = expected.map(cellKey);
  return selected.length === keys.length && new Set(selected).size === keys.length && keys.every((k) => selected.includes(k));
}
function checkFractionShade(selected) {
  return selected.length === 3 && new Set(selected).size === 3 && selected.every((k) => /^[0-3],[01]$/.test(k)) ? { ok: true, message: "Yes! Three of eight equal parts are shaded: 3/8." } : { ok: false, message: "Count the shaded parts. The numerator tells how many to shade. Keep all eight equal parts." };
}
function checkCounterGroups(positions) {
  if (positions.length !== 12 || positions.some((p) => !Number.isInteger(p) || p < 0 || p > 2)) return { ok: false, message: "Move every counter from the tray into a group first." };
  const counts = [0, 1, 2].map((g) => positions.filter((p) => p === g).length);
  return counts.every((c) => c === 4) ? { ok: true, message: "You shared 12 counters equally: 3 groups of 4!" } : { ok: false, message: "Compare the groups. Move a counter from a larger group to a smaller one until they match." };
}
function checkSymmetry(selected) {
  return matchesCells(selected, SYMMETRY_LEFT.map(mirrorCell)) ? { ok: true, message: "Your picture is symmetric! Each matching square is the same distance from the mirror line." } : { ok: false, message: "Look across the mirror line, one row at a time. A square close to the line needs a match just as close on the other side." };
}
var AREA_CELLS = Array.from({ length: 12 }, (_, i) => [1 + i % 4, 1 + Math.floor(i / 4)]);
function checkAreaModel(selected, perimeter) {
  if (!matchesCells(selected, AREA_CELLS)) return { ok: false, message: "Cover only the inside of the outlined rectangle. Count rows and columns; leave no gaps." };
  if (!isAnswerEquivalent(perimeter, 14)) return { ok: false, message: "Your area tiles fit! For perimeter, count unit edges around the outside. Include all four sides." };
  return { ok: true, message: "You found both: area is 12 square units; perimeter is 14 units. Area covers the inside; perimeter measures the boundary." };
}

// src/components/VisualMathActivity.jsx
function VisualMathActivity({ activity }) {
  const [selected, setSelected] = useState([]), [positions, setPositions] = useState(Array(12).fill(-1)), [counter, setCounter] = useState(null), [perimeter, setPerimeter] = useState(""), [result, setResult] = useState(null);
  const toggle = (key) => {
    setSelected((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
    setResult(null);
  };
  const move = (group) => {
    if (counter === null) return;
    setPositions((prev) => prev.map((p, i) => i === counter ? group : p));
    setCounter(null);
    setResult(null);
  };
  const check = () => setResult(activity === "shade" ? checkFractionShade(selected) : activity === "counters" ? checkCounterGroups(positions) : activity === "symmetry" ? checkSymmetry(selected) : checkAreaModel(selected, perimeter));
  const grid = (rows, cols, render) => /* @__PURE__ */ React.createElement("div", { className: "visual-cell-grid", style: { gridTemplateColumns: `repeat(${cols},1fr)` } }, Array.from({ length: rows * cols }, (_, i) => render(i % cols, Math.floor(i / cols))));
  return /* @__PURE__ */ React.createElement("div", { className: "visual-math-activity" }, activity === "shade" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h4", null, "Make 3/8 of one whole"), /* @__PURE__ */ React.createElement("p", null, "This rectangle is one whole, split into eight equal parts. Tap parts to shade them; tap again to undo."), grid(2, 4, (x, y) => {
    const key = cellKey([x, y]);
    return /* @__PURE__ */ React.createElement("button", { type: "button", key, "aria-label": `Fraction part ${y * 4 + x + 1}`, "aria-pressed": selected.includes(key), onClick: () => toggle(key), className: selected.includes(key) ? "filled" : "" });
  }), /* @__PURE__ */ React.createElement("p", null, selected.length, " of 8 parts shaded")), activity === "counters" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h4", null, "Share 12 counters into 3 equal groups"), /* @__PURE__ */ React.createElement("p", null, "Select a counter, then choose its destination. Move it again whenever you like. All groups need the same number."), /* @__PURE__ */ React.createElement("div", { className: "counter-board" }, [-1, 0, 1, 2].map((g) => /* @__PURE__ */ React.createElement("section", { key: g }, /* @__PURE__ */ React.createElement("h5", null, g === -1 ? "Tray" : `Group ${g + 1}`), /* @__PURE__ */ React.createElement("div", { className: "counter-pieces" }, positions.map((p, i) => p === g && /* @__PURE__ */ React.createElement("button", { key: i, type: "button", className: "counter-piece", "aria-label": `Counter ${i + 1}`, "aria-pressed": counter === i, onClick: () => setCounter(i) }, "\u25CF"))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", disabled: counter === null, onClick: () => move(g) }, g === -1 ? "Return to tray" : "Place selected counter here"), /* @__PURE__ */ React.createElement("p", null, positions.filter((p) => p === g).length, " counters"))))), activity === "symmetry" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h4", null, "Finish the mirror picture"), /* @__PURE__ */ React.createElement("p", null, "Keep the left side as it is. Tap squares on the right to reflect it across the dashed line."), grid(4, 6, (x, y) => {
    const key = cellKey([x, y]), fixed = x < 3, filled = fixed ? SYMMETRY_LEFT.some((p) => cellKey(p) === key) : selected.includes(key);
    return /* @__PURE__ */ React.createElement("button", { type: "button", key, className: `${filled ? "filled" : ""} ${x === 2 ? "mirror-edge" : ""}`, disabled: fixed, "aria-label": `${fixed ? "Example" : "Mirror"} row ${y + 1}, column ${x + 1}`, "aria-pressed": filled, onClick: () => toggle(key) });
  })), activity === "area" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h4", null, "Cover the rectangle, then walk its boundary"), /* @__PURE__ */ React.createElement("p", null, "Each square is 1 unit by 1 unit. Tap every square inside the outlined rectangle. Then count the unit edges around its outside."), grid(5, 6, (x, y) => {
    const key = cellKey([x, y]), inside = AREA_CELLS.some((p) => cellKey(p) === key);
    return /* @__PURE__ */ React.createElement("button", { type: "button", key, className: `${selected.includes(key) ? "filled" : ""} ${inside ? "area-inside" : ""} ${inside && x === 1 ? "edge-left" : ""} ${inside && x === 4 ? "edge-right" : ""} ${inside && y === 1 ? "edge-top" : ""} ${inside && y === 3 ? "edge-bottom" : ""}`, "aria-label": `Area tile row ${y + 1}, column ${x + 1}`, "aria-pressed": selected.includes(key), onClick: () => toggle(key) });
  }), /* @__PURE__ */ React.createElement("p", null, selected.length, " square units covered"), /* @__PURE__ */ React.createElement("label", null, "Perimeter in units ", /* @__PURE__ */ React.createElement("input", { "aria-label": "Perimeter in units", inputMode: "numeric", value: perimeter, onChange: (e) => {
    setPerimeter(e.target.value);
    setResult(null);
  } }))), /* @__PURE__ */ React.createElement("div", { className: "drawing-step-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-primary", onClick: check }, "Check my model"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => {
    setSelected([]);
    setPositions(Array(12).fill(-1));
    setCounter(null);
    setPerimeter("");
    setResult(null);
  } }, "Start model again")), /* @__PURE__ */ React.createElement("p", { role: "status" }, result?.message), /* @__PURE__ */ React.createElement("small", null, "Bip checks this model only. This is practice, with no timer or lost hearts."));
}
export {
  VisualMathActivity as default
};
