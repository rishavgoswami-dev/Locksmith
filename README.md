<div align="center">

<img src="Asset/Icons/logo.svg" width="72" alt="Locksmith logo" />

# Locksmith™

**Smart, Strong & Secure Password Generator**

Generate cryptographically secure passwords, memorable paraphrases, and PINs — right in your browser, with zero data ever leaving your device.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
![No dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![Made with](https://img.shields.io/badge/made%20with-HTML%20%7C%20CSS%20%7C%20JS-orange)

</div>

---

## ✨ Overview

**Locksmith** is a lightweight, client-side password generator with three dedicated modes — **Random**, **Memorable**, and **PIN** — each with live entropy calculation and estimated crack time, so you know exactly how strong your credentials are before you use them.

No servers. No tracking. No stored data. Everything happens locally using the browser's `crypto.getRandomValues()` API.

## 🔑 Features

- **🎲 Random Passwords** — Customizable length (1–64 characters) with toggleable lowercase, uppercase, numbers, and symbols.
- **🧠 Memorable Paraphrases** — Word-based passphrases (1–16 words) with capitalization, custom separators, and word-merging options.
- **🔢 PIN Generator** — Numeric or hexadecimal PINs (4–32 digits) with optional uniqueness and anti-sequential constraints.
- **📊 Live Strength Meter** — Real-time entropy (bits) and estimated crack-time feedback for every generated value.
- **🔐 Cryptographically Secure** — Powered by the Web Crypto API (`crypto.getRandomValues()`), not `Math.random()`.
- **📋 One-Click Copy** — Copy any generated value to your clipboard instantly, with toast confirmation.
- **👁️ Visibility Toggle** — Show or hide generated values on demand.
- **📱 Fully Responsive** — Optimized layouts down to very small viewports, including landscape mobile.
- **🎨 Polished UI** — Smooth tab transitions, skeleton loading state, and accessible, keyboard-friendly controls.

## 🚀 Getting Started

Locksmith is a static site with no build step or dependencies.

1. **Clone the repository**
   ```bash
   git clone https://github.com/rishavgoswami-dev/locksmith.git
   cd locksmith
   ```
2. **Open it**
   Simply open `index.html` in your browser — or serve it locally:
   ```bash
   npx serve .
   ```

That's it. No `npm install`, no build tools, no configuration.

## 🗂️ Project Structure

```
Locksmith/
├── index.html        # App markup and layout
├── style.css          # Styling, themes, and responsive rules
├── script.js           # Core generator logic and UI behavior
├── dictionary.js        # Word list used for memorable paraphrases
├── Asset/Icons/           # SVG icon set
└── LICENSE
```

## 🛠️ Tech Stack

Built with plain **HTML5**, **CSS3**, and **vanilla JavaScript** — no frameworks, no bundlers, no runtime dependencies.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **GNU General Public License v3.0**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

Made with 🔒 for a more secure web.

</div>
