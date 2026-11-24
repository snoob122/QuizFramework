# QuizFramework ⚡

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](test/quiz-engine.test.js)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-neon.svg)](index.html)
[![KaTeX Supported](https://img.shields.io/badge/Math-KaTeX%20Native-blueviolet.svg)](lib/katex)

An ultra-modern, glassmorphic quiz platform engineered for plug-and-play AI generation, LaTeX math rendering, and frictionless self-assessment — with zero external dependencies and zero build steps.

---

## 🌟 Highlights

- 🚀 **Zero Build Step & Offline Ready:** Built with standard HTML5, CSS3, and vanilla ES6 JavaScript. Simply double-click `index.html` to run anywhere in any browser.
- 🤖 **AI-Ready & 1-Click Instructions:** Turn slides, PDFs, or lecture notes into interactive quizzes with Gemini, ChatGPT, or Claude. Download [`instruction.md`](instruction.md) directly from the Import modal with one click!
- ⏱️ **Adaptive Time Pressure Mode:** Practice under calibrated exam pressure with a unified question time limit, a dynamic **Green $\to$ Yellow $\to$ Red** progress bar, background timer pause during settings, and a click-to-resume overlay.
- 💾 **Export & Review Attempts:** Export your complete quiz state (including question text, elapsed time, user answers, correctness, and flags) to a JSON file and re-import anytime for later review.
- 📐 **Native LaTeX Math (KaTeX):** High-performance native math typesetting for inline (`$E = mc^2$`) and display (`$$\sum_{i=1}^n x_i$$`) formulas across stems, options, and explanations.
- 💎 **Fluid Glassmorphism & Seamless Themes:** Frosted glass panels, glowing neon accents, and buttery-smooth `0.3s` synchronized transitions between Dark and Light modes.
- 🎯 **Versatile Question Formats:** Native support for Single Choice, Multi-Select, True/False statement clusters, and self-graded Essay questions with rubric checklists.
- 📊 **Smart Results & Filter Matrix:** Sleek results breakdown with instant dropdown filtering to inspect All Questions, Incorrect Answers Only, or Bookmarked/Flagged questions.
- ⚙️ **Persistent User Settings:** Preferences (Zen mode, Instant check, Time Pressure, Show types) save automatically to `localStorage` without altering quiz datasets.
- ⌨️ **Keyboard-First Workflow:** Navigate seamlessly with `A`–`E`, `Enter` to check, `Space` to resume, and `F` to flag.

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

1. Click **"Import"** in the top navigation bar of QuizFramework.
2. In the bottom-right corner of the modal, click **"📥 Download instruction.md"** to get the prompt instructions file.
3. Open your favorite AI chatbot (**Gemini, ChatGPT, or Claude**), attach your study material alongside `instruction.md`, and send this prompt:

```text
Generate QuizFramework JSON code block only (do NOT use interactive quiz tool):
Create 20 questions from the attached material.
Format: Output STRICTLY as a single pure JSON code block matching the instruction.md schema.
```

4. Paste the generated JSON into the QuizFramework Import box and press **Enter** to launch immediately!

> 💡 *See [`instruction.md`](instruction.md) for the full schema specifications, question types, and calibration guidelines.*

---

## ⚡ Key Features & Workflows

### ⏱️ Time Pressure Mode
- **Unified Time Limit**: Set a single, consistent per-question time limit for the entire quiz (calibrated automatically by default).
- **Dynamic Color Bar**: The in-card timer bar dynamically shifts from **Green** (100% time left) $\to$ **Yellow** ($\approx 50\%$) $\to$ **Urgent Red** (critical / 0s) using continuous mathematical hue interpolation.
- **Smart Pause & Resume**: Opening Settings pauses the timer and blurs the background. When closing Settings, a *"Click or Press Space to Continue"* overlay ensures you resume exactly on your terms.
- **Persistent Question Timers**: Navigating between questions preserves the remaining time on each question without resetting.

### 💾 Export & Review Attempts
- Click **"Export"** in the top bar to save your current attempt as a timestamped `.json` review file.
- The exported review package bundles questions, answers, accuracy, correctness, and flagged bookmarks.
- Re-import the file via the Import dialog anytime to study past mistakes and track retention.

### 📊 Clean Results Breakdown & Filtering
- View your final score, accuracy percentage, and time taken in a streamlined summary view.
- Use the **Filter Dropdown** to instantly focus on:
  - **Display All Questions** (complete breakdown)
  - **Display Incorrect Only** (targeted revision of mistakes)
  - **Display Flagged Only** (quick access to bookmarked questions)

### ⚙️ Seamless Settings & LocalStorage
- Toggles for **Show Question Type**, **Instant Check**, **Zen Mode**, and **Time Pressure** are saved to browser `localStorage`.
- Settings dialog includes an **Apply** confirmation workflow with protective warnings when modifying time limit rules during an active session.

---

## ⌨️ Keyboard Shortcuts

Speed through your quizzes without touching the mouse:

| Key | Context | Action |
| :---: | :---: | :--- |
| `A` – `E` or `1` – `5` | Active Question | Select or toggle Option 1 through Option 5 |
| `Enter` | Active Question | Check current question answer |
| `←` / `→` (Arrows) | Active Question | Navigate to Previous / Next question |
| `F` | Active Question | Toggle Flag / Bookmark on current question |
| `Space` / `Enter` | Pause Overlay | Resume quiz and countdown after exiting settings |
| `Enter` / `Space` | Import Modal | **Load quiz & start immediately** (or `Ctrl+Enter` while editing) |
| `Esc` | Modals / Overlays | Close modal or resume from pause overlay |

---

## 📂 Project Structure

```text
QuizFramework/
├── index.html            # Main web application shell
├── README.md             # Project overview & documentation
├── instruction.md        # AI prompt instructions & JSON schema
├── css/
│   ├── glassmorphism.css # Translucent glass tokens & ambient neon palettes
│   └── style.css         # Responsive layout, synchronized themes & animations
├── js/
│   ├── theme.js          # Dark/Light theme toggle & persistence
│   ├── quiz-data.js      # Default sample test dataset (10 questions)
│   └── quiz-engine.js    # Interactive quiz runner, timer, scoring & state
├── lib/katex/            # Bundled offline KaTeX math typesetting engine
└── test/
    ├── quiz-engine.test.js # Core unit test suite
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
- Submit a Pull Request to enhance styles, keyboard shortcuts, or question types.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for personal, educational, and commercial use.
