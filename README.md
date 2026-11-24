# QuizFramework ⚡

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](test/quiz-engine.test.js)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-neon.svg)](index.html)
[![KaTeX Supported](https://img.shields.io/badge/Math-KaTeX%20Native-blueviolet.svg)](lib/katex)

An ultra-modern, glassmorphic quiz platform engineered for plug-and-play AI generation, LaTeX math rendering, and frictionless self-assessment — with zero external dependencies and zero build steps.

---

## 🌟 Highlights

- 🚀 **Zero Build Step & Offline Ready:** Built with standard HTML5, CSS3, and vanilla ES6 JavaScript. Simply double-click `index.html` to run anywhere in any browser.
- 🤖 **AI-Ready & Plug-and-Play:** Turn lecture slides, PDFs, or notes into full interactive quizzes in seconds with ChatGPT, Claude, or Gemini using [`modelInstruction.md`](modelInstruction.md).
- 📐 **Native LaTeX Math (KaTeX):** High-performance native math typesetting for inline (`$E = mc^2$`) and display (`$$\sum_{i=1}^n x_i$$`) formulas across question stems, options, and explanations.
- 💎 **Modern Glassmorphic UI:** Translucent frosted glass panels, ambient glowing backdrop orbs, fluid animations, and clean Dark/Light theme toggling.
- 🎯 **Rich Question Formats:** Native support for Single Choice, Multi-Select, True/False statement clusters, and self-graded Essay questions with rubric checklists.
- ⚡ **Productivity Power Features:** Per-question Time Pressure challenge mode, Zen mode, instant answer checking, and comprehensive keyboard navigation (`A`–`D`, `Enter`, `F` to flag).
- 📥 **Zero-Friction Importer:** Paste AI-generated JSON or JavaScript directly into the built-in web modal to launch custom quizzes without touching code.

---

## ℹ️ Overview

**QuizFramework** bridges the gap between raw study materials, modern AI models, and active recall learning. Traditional quiz platforms often enforce rigid accounts, paywalls, clumsy math support, or uninspired interfaces. QuizFramework provides a lightweight, private, and gorgeous web app where question content is strictly decoupled from presentation logic.

Simply feed your study content to an AI alongside our template, copy the generated JSON code block, and paste it into the app. Your custom interactive assessment is ready instantly.

### 🌐 In the Broader Ecosystem
How does QuizFramework compare to existing solutions?
- **vs. Google Forms & Kahoot:** No accounts, no paywalls, no tracking, and first-class LaTeX math support out of the box.
- **vs. NotebookLM & Quizlet:** Complete control over your quiz data, question formats (including multi-statement True/False and rubric self-evaluations), and styling with zero vendor lock-in.
- **vs. Complex Web Apps:** No `npm install`, no Webpack/Vite bundlers, and no server configuration needed. It runs right off your local filesystem or as a static site on GitHub Pages.

### 👤 Who Made This?
QuizFramework was created and is actively maintained by **[snoob122](https://github.com/snoob122)** (Bean) and open-source contributors. The goal is to provide students, educators, and lifelong learners with an approachable, high-quality, and aesthetically pleasing tool for deliberate practice and AI-assisted mastery.

---

## 🚀 Quickstart

You can be testing yourself in less than 30 seconds:

```bash
# 1. Clone the repository
git clone https://github.com/snoob122/QuizFramework.git

# 2. Enter the folder
cd QuizFramework

# 3. Open in your browser (no server or build tools needed!)
open index.html   # macOS
# or double-click index.html on Windows / Linux
```

Want to run a local development server instead?
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## 🤖 Generating Quizzes with AI

To turn any lecture slide, textbook chapter, or PDF into a QuizFramework test:

1. Open your favorite AI chatbot (**Gemini, ChatGPT, or Claude**).
2. Attach your study material along with [`modelInstruction.md`](modelInstruction.md).
3. Send this quick prompt:

```text
Generate QuizFramework JSON code block only (do NOT use interactive quiz tool):
Create 20 questions from the attached material.
Format: Output STRICTLY as a single pure JSON code block matching the modelInstruction.md schema.
```

4. In QuizFramework, click **"Import"** in the top bar, paste the JSON, and press **Enter** to start!

> 💡 *See [`modelInstruction.md`](modelInstruction.md) for the complete specification, evaluation rubrics, and automated benchmark tools.*

---

## ⌨️ Keyboard Shortcuts

Speed through your quizzes without touching the mouse:

| Key | Context | Action |
| :---: | :---: | :--- |
| `A` – `E` or `1` – `5` | Main Quiz | Select or toggle Option 1 through Option 5 |
| `Enter` | Main Quiz | Check current question answer |
| `←` / `→` (Arrows) | Main Quiz | Navigate to Previous / Next question |
| `F` | Main Quiz | Toggle Flag / Bookmark on current question |
| `Enter` / `Space` | Import Modal | **Load quiz & start immediately** (or `Ctrl+Enter` while editing) |
| `Esc` | Modals | Close Import Modal or Settings Modal |

---

## 📂 Project Structure

```text
QuizFramework/
├── index.html            # Main web application shell
├── README.md             # Project guide & quickstart
├── modelInstruction.md   # AI generation prompt & schema specification
├── css/
│   ├── glassmorphism.css # Translucent glass utilities & ambient effects
│   └── style.css         # Responsive layout & theme design tokens
├── js/
│   ├── theme.js          # Dark/Light color scheme controller
│   ├── quiz-data.js      # Default sample questions dataset
│   └── quiz-engine.js    # Interactive quiz runner, scoring, & state
├── lib/katex/            # Bundled offline KaTeX math typesetting
└── test/
    ├── quiz-engine.test.js # Core functionality unit test suite
    └── quiz-benchmark.js  # 100-point pedagogical quality benchmark
```

---

## 🧪 Testing & Verification

QuizFramework includes a full automated test and quality assurance benchmark suite:

```bash
# Run unit tests and QA benchmark
node test/quiz-engine.test.js
node test/quiz-benchmark.js
```

---

## 🤝 Contributing

Contributions, feedback, and issue reports are always welcome! Feel free to:
- Open an [Issue](https://github.com/snoob122/QuizFramework/issues) to report a bug or suggest a feature.
- Submit a Pull Request to enhance styles, keyboard features, or question types.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for personal, educational, and commercial use.
