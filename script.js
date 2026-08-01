"use strict";

// --* DOM SHORTCUTS *-- //
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Random panel
const len = $("#rand-len"),
  count = $("#rand-num"),
  genpass = $("#rand-out"),
  genbut = $("#rand-gen");
const boxes = [$("#opt-low"), $("#opt-up"), $("#opt-num"), $("#opt-sym")];

// Memorable panel
const memoLen = $("#memo-len"),
  memoCount = $("#memo-num"),
  memoOut = $("#memo-out"),
  memoGen = $("#memo-gen");
const memoCap = $("#memo-cap"),
  memoFull = $("#memo-full"),
  memoSep = $("#memo-sep"),
  memoNoSpc = $("#memo-nospc");

// PIN panel
const pinLen = $("#pin-len"),
  pinCount = $("#pin-num"),
  pinOut = $("#pin-out"),
  pinGen = $("#pin-gen");
const pinNoRep = $("#pin-norep"),
  pinNoSeq = $("#pin-noseq"),
  pinSep = $("#pin-sep"),
  pinHex = $("#pin-hex");

// Shared UI
const tabBtns = $$(".tab-btn"),
  panels = $$(".panel");
const toast = $("#toast"),
  toastImg = $("#toast img"),
  toastMsg = $("#toast p");

const CHAR_MAP = {
  "opt-low": "abcdefghijklmnopqrstuvwxyz",
  "opt-up": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "opt-num": "0123456789",
  "opt-sym": "!@#$%^&*()_+~`|}{[]:;?><,./-=",
};

// --* STRENGTH SYSTEM *-- //
const GUESS_RATE = 1e10;

const STRENGTH_LEVELS = [
  { label: "Very Weak", max: 1, color: "#ef4444" },
  { label: "Weak", max: 60, color: "#f97316" },
  { label: "Poor", max: 3600, color: "#f59e0b" },
  { label: "Fair", max: 86400, color: "#eab308" },
  { label: "Moderate", max: 2_592_000, color: "#84cc16" },
  { label: "Good", max: 31_536_000, color: "#22c55e" },
  { label: "Very Good", max: 315_360_000, color: "#10b981" },
  { label: "Strong", max: 3_153_600_000, color: "#06b6d4" },
  { label: "Very Strong", max: Infinity, color: "#1a679e" },
];

const strengthEls = {
  rand: [$("#rand-strength-label"), $("#rand-strength-detail")],
  memo: [$("#memo-strength-label"), $("#memo-strength-detail")],
  pin: [$("#pin-strength-label"), $("#pin-strength-detail")],
};

const formatCrackTime = (seconds) => {
  if (seconds < 1) return "instantly";
  const units = [
    [31_536_000, "year"],
    [2_592_000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
    [1, "second"],
  ];
  for (const [unit, name] of units) {
    if (seconds >= unit) {
      const n = seconds / unit;
      if (unit === 31_536_000 && n > 1e6) return "practically uncrackable";
      const rounded = Math.round(n);
      return `${rounded.toLocaleString()} ${name}${rounded === 1 ? "" : "s"}`;
    }
  }
  return "instantly";
};

const setStrength = (prefix, bits) => {
  const [label, detail] = strengthEls[prefix];
  if (!label) return;
  const seconds = bits > 0 ? Math.pow(2, bits) / (2 * GUESS_RATE) : 0;
  const idx = STRENGTH_LEVELS.findIndex((l) => seconds < l.max);
  const level = STRENGTH_LEVELS[idx === -1 ? STRENGTH_LEVELS.length - 1 : idx];
  label.textContent = level.label;
  detail.innerHTML = `${bits.toFixed(1)} bits<span class="crack-time"> • ${formatCrackTime(seconds)} to crack</span>`;
  label.style.setProperty("--strength-color", level.color);
};

const pinEntropyBits = (n, base, noRep, noSeq) => {
  let dp = new Float64Array(base).fill(1);
  let next = new Float64Array(base);
  for (let pos = 1; pos < n; pos++) {
    for (let d = 0; d < base; d++) {
      let total = 0;
      for (let p = 0; p < base; p++) {
        if (noRep && d === p) continue;
        if (noSeq && Math.abs(d - p) === 1) continue;
        total += dp[p];
      }
      next[d] = total;
    }
    [dp, next] = [next, dp];
  }
  const total = dp.reduce((a, b) => a + b, 0);
  return total > 0 ? Math.log2(total) : 0;
};

// --* SHARED SECURE RNG POOL *-- //
const RNG = new Uint32Array(64);
let rngIdx = RNG.length;
const rand = (max) => {
  if (rngIdx >= RNG.length) {
    crypto.getRandomValues(RNG);
    rngIdx = 0;
  }
  return RNG[rngIdx++] % max;
};

// --* RANDOM PASSWORD *-- //
const generate = () => {
  let pool = "";
  const pass = [];
  boxes.forEach((box) => {
    if (box.checked) {
      const chars = CHAR_MAP[box.id];
      pool += chars;
      pass.push(chars[rand(chars.length)]);
    }
  });
  if (!pool) return;
  const targetLen = +len.value;
  while (pass.length < targetLen) pass.push(pool[rand(pool.length)]);
  for (let i = pass.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [pass[i], pass[j]] = [pass[j], pass[i]];
  }
  pass.length = Math.min(pass.length, targetLen);
  genpass.value = pass.join("");
  setStrength("rand", pass.length * Math.log2(pool.length));
};

const updateCheckboxState = () => {
  const checked = boxes.filter((b) => b.checked);
  boxes.forEach((box) => {
    const disable = checked.length === 1 && box.checked;
    box.disabled = disable;
    box.parentElement.classList.toggle("disabled", disable);
  });
};
boxes[0].checked = true;
updateCheckboxState();
boxes.forEach((box) =>
  box.addEventListener("change", () => {
    if (!boxes.some((b) => b.checked)) box.checked = true;
    updateCheckboxState();
    generate();
  }),
);

// --* GENERIC SLIDER <-> NUMBER SYNC *-- //
const bindRange = (slider, numEl, min, max, onChange) => {
  const sync = (v, updateNum = true, force = false) => {
    const val = Math.max(min, Math.min(max, +v || min));
    if (updateNum) numEl.value = val;
    if (val !== +slider.value || force) {
      slider.value = val;
      slider.style.setProperty(
        "--slider-fill",
        `${((val - min) / (max - min)) * 100}%`,
      );
      onChange();
    }
  };
  slider.addEventListener("input", (e) => sync(e.target.value, true, true));
  numEl.addEventListener("input", (e) => {
    const v = (e.target.value = e.target.value.replace(/\D/g, "").slice(-2));
    if (v) sync(v, false);
  });
  numEl.addEventListener("change", (e) => sync(e.target.value));
  sync(slider.value, true, true);
};

bindRange(len, count, 1, 64, generate);
genbut.addEventListener("click", generate);

// --* MEMORABLE PARAPHRASE *-- //
const generateMemo = () => {
  const words = [];
  for (let i = 0; i < +memoLen.value; i++) {
    let w = MEMO_DICTIONARY[rand(MEMO_DICTIONARY.length)];
    if (memoCap.checked) w = w[0].toUpperCase() + w.slice(1);
    words.push(w);
  }
  const sep = memoSep.checked ? "-" : memoNoSpc.checked ? "" : " ";
  memoOut.value = words.join(sep);
  const dictSize =
    typeof MEMO_DICTIONARY !== "undefined" ? MEMO_DICTIONARY.length : 0;
  setStrength("memo", dictSize > 1 ? words.length * Math.log2(dictSize) : 0);
};

bindRange(memoLen, memoCount, 1, 16, generateMemo);
memoGen.addEventListener("click", generateMemo);

const updateMemoState = () => {
  memoNoSpc.disabled = memoSep.checked;
  memoNoSpc.checked = memoSep.checked || memoNoSpc.checked;
  memoNoSpc.parentElement.classList.toggle("disabled", memoSep.checked);
  generateMemo();
};
[memoCap, memoFull, memoSep, memoNoSpc].forEach((box) =>
  box.addEventListener("change", updateMemoState),
);
updateMemoState();

// --* PIN *-- //
const generatePin = () => {
  const targetLen = +pinLen.value;
  const chars = pinHex.checked ? "0123456789ABCDEF" : "0123456789";
  const pin = [];
  let guard = 0;
  while (pin.length < targetLen && guard++ < targetLen * 50) {
    const c = chars[rand(chars.length)];
    if (pin.length) {
      const prev = pin[pin.length - 1];
      if (pinNoRep.checked && c === prev) continue;
      if (
        pinNoSeq.checked &&
        Math.abs(chars.indexOf(c) - chars.indexOf(prev)) === 1
      )
        continue;
    }
    pin.push(c);
  }
  let out = pin.join("");
  if (pinSep.checked) out = out.match(/.{1,4}/g).join("-");
  pinOut.value = out;
  setStrength(
    "pin",
    pinEntropyBits(targetLen, chars.length, pinNoRep.checked, pinNoSeq.checked),
  );
};

bindRange(pinLen, pinCount, 4, 32, generatePin);
pinGen.addEventListener("click", generatePin);
[pinNoRep, pinNoSeq, pinSep, pinHex].forEach((box) =>
  box.addEventListener("change", generatePin),
);

// --* TABS *-- //
tabBtns.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    const current = document.querySelector(".panel.active");
    const target = panels[i];
    if (!target || current === target) return;
    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    if (current) {
      current.classList.replace("active", "exiting");
      setTimeout(() => current.classList.remove("exiting"), 500);
    }
    target.classList.remove("exiting");
    target.classList.add("active");
  });
});
tabBtns[0]?.click();

// --* GENERIC COPY BUTTON *-- //
// One factory replaces the three duplicated copy handlers.
const bindCopy = (btn, input, label) => {
  let timer;
  btn.addEventListener("click", () => {
    const ok = () => {
      showToast("confirm", "Copied!");
      btn.classList.add("copied");
      btn.children[0].src = "Asset/Icons/confirm.svg";
      clearTimeout(timer);
      timer = setTimeout(() => {
        btn.classList.remove("copied");
        btn.children[0].src = "Asset/Icons/copy-content.svg";
      }, 2000);
    };
    const fail = () => showToast("error", `Failed to copy ${label}`);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(input.value).then(ok).catch(fail);
    } else {
      input.select();
      try {
        document.execCommand("copy");
        ok();
      } catch {
        fail();
      }
      window.getSelection().removeAllRanges();
    }
  });
};
bindCopy($("#rand-copy"), genpass, "password");
bindCopy($("#memo-copy"), memoOut, "paraphrase");
bindCopy($("#pin-copy"), pinOut, "PIN");

// --* VISIBILITY TOGGLE *-- //
const bindVis = (btn, input) => {
  btn.addEventListener("click", () => {
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    btn.children[0].src = `Asset/Icons/visibility${hidden ? "" : "-off"}.svg`;
  });
};
bindVis($("#rand-vis"), genpass);
bindVis($("#memo-vis"), memoOut);
bindVis($("#pin-vis"), pinOut);

// --* SKELETON LOADING *-- //
$(".password-card").classList.add("loading");
window.addEventListener(
  "load",
  () => setTimeout(() => $(".password-card").classList.remove("loading"), 1000),
  { once: true },
);

// --* TOAST *-- //
let toastTimer;
const showToast = (type, msg) => {
  const t = ["confirm", "error", "alert"].includes(type) ? type : "info";
  toastImg.src = `Asset/Icons/${t}.svg`;
  toastMsg.textContent = msg;
  toast.className = `toast ${t}`;
  requestAnimationFrame(() => toast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
};
