// ---------- DOM ----------
const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");
const keysEl = document.getElementById("keys");

// ---------- State ----------
let current = "0";     // number being typed (string)
let previous = null;   // stored left operand (number)
let operator = null;   // "+", "-", "*", "/"
let overwrite = false; // next digit replaces the display
const MAX_DIGITS = 12;
const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// ---------- Logic ----------
const calculate = (a, op, b) => {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
  }
};

const clean = (n) => String(parseFloat(n.toPrecision(12)));

const format = (str) => {
  if (str === "Error") return str;
  const [int, dec] = str.split(".");
  const withCommas = Number(int).toLocaleString("en-US");
  const sign = int === "-0" ? "-" : "";
  return dec !== undefined ? `${sign}${withCommas}.${dec}` : `${sign}${withCommas}`;
};

const inputDigit = (d) => {
  if (current === "Error" || overwrite) { current = "0"; overwrite = false; }
  if (current.replace(/[-.]/g, "").length + d.length > MAX_DIGITS) return;
  if (current === "0") current = d === "00" ? "0" : d;
  else current += d;
};

const inputDot = () => {
  if (current === "Error" || overwrite) { current = "0"; overwrite = false; }
  if (!current.includes(".")) current += ".";
};

const percent = () => {
  if (current === "Error") return;
  current = clean(parseFloat(current) / 100);
  overwrite = true;
};

const chooseOperator = (op) => {
  if (current === "Error") return;
  // chain: 2 + 3 + → compute 2 + 3 first
  if (operator && !overwrite) evaluate(true);
  if (current === "Error") return;
  previous = parseFloat(current);
  operator = op;
  overwrite = true;
  expressionEl.textContent = `${format(clean(previous))} ${SYMBOLS[op]}`;
};

const evaluate = (chained = false) => {
  if (!operator || current === "Error") return;
  const b = parseFloat(current);
  const value = calculate(previous, operator, b);
  if (!chained) {
    expressionEl.textContent =
      `${format(clean(previous))} ${SYMBOLS[operator]} ${format(clean(b))} =`;
  }
  current = Number.isFinite(value) ? clean(value) : "Error";
  if (current === "Error") expressionEl.textContent = "Cannot divide by zero";
  previous = null;
  operator = null;
  overwrite = true;
};

const clearAll = () => {
  current = "0";
  previous = null;
  operator = null;
  overwrite = false;
  expressionEl.textContent = "";
};

const backspace = () => {
  if (overwrite || current === "Error") return;
  current = current.length > 1 && current !== "-0" ? current.slice(0, -1) : "0";
};

// ---------- UI ----------
const render = () => {
  resultEl.textContent = format(current);
  const len = resultEl.textContent.length;
  resultEl.classList.toggle("small", len > 9 && len <= 13);
  resultEl.classList.toggle("tiny", len > 13);

  document.querySelectorAll(".key-op").forEach((btn) => {
    btn.classList.toggle("active", overwrite && btn.dataset.op === operator);
  });
};

// ---------- Events ----------
keysEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const { digit, op, action } = btn.dataset;
  if (digit) inputDigit(digit);
  else if (op) chooseOperator(op);
  else if (action === "dot") inputDot();
  else if (action === "percent") percent();
  else if (action === "equals") evaluate();
  else if (action === "clear") clearAll();

  render();
});

document.addEventListener("keydown", (e) => {
  const k = e.key;
  if (/^\d$/.test(k)) inputDigit(k);
  else if (k === ".") inputDot();
  else if (["+", "-", "*", "/"].includes(k)) chooseOperator(k);
  else if (k === "x" || k === "X") chooseOperator("*");
  else if (k === "%") percent();
  else if (k === "Enter" || k === "=") { e.preventDefault(); evaluate(); }
  else if (k === "Backspace") backspace();
  else if (k === "Escape") clearAll();
  else return;
  render();
});

render();
