/**
 * QuizFramework Engine (quiz-engine.js)
 * Robust, stateful, accessible quiz runner supporting:
 * - Single choice & Multi-choice (1 to n answers, any amount of options)
 * - Essay self-assessment questions with rubric evaluation
 * - Persistent flag/bookmark system
 * - Instant answer verification & detailed explanation reveal
 * - Real-time statistics, progress tracking, and timer
 * - Full summary screen with percentage calculations and interactive review matrix
 * - Dynamic custom quiz importer (JSON / AI prompt outputs)
 */

class QuizEngine {
  constructor() {
    this.config = window.QUIZ_CONFIG || {
      title: "Interactive Quiz",
      subtitle: "Knowledge Assessment",
      passingScore: 70,
      timeLimitMinutes: 0
    };

    this.questions = (window.QUIZ_QUESTIONS && window.QUIZ_QUESTIONS.length > 0)
      ? window.QUIZ_QUESTIONS
      : [];

    this.currentIndex = 0;
    this.userAnswers = []; // Records user state per question
    this.flagged = new Set(); // Set of question indices flagged
    this.startTime = Date.now();
    this.timerInterval = null;
    this.elapsedSeconds = 0;
    this.isSummaryView = false;
    this.filterMode = "all"; // "all" | "incorrect"

    // Load User Preferences (Theme, Question Type hints, Zen Mode, Time Pressure)
    this.settings = this.loadSettings();

    this.questionTimerInterval = null;
    this.questionSecondsRemaining = 0;

    this.initUserAnswers();
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem("QUIZ_SETTINGS");
      if (stored) {
        return {
          showQuestionType: true,
          instantCheck: false,
          zenMode: false,
          timePressure: false,
          timePressureSeconds: null,
          ...JSON.parse(stored)
        };
      }
    } catch (e) {}
    return {
      showQuestionType: true,
      instantCheck: false,
      zenMode: false,
      timePressure: false,
      timePressureSeconds: null
    };
  }

  saveSettings() {
    try {
      localStorage.setItem("QUIZ_SETTINGS", JSON.stringify(this.settings));
    } catch (e) {}
    this.applySettings();
  }

  calculateEstimatedTime(q) {
    if (typeof q.estimatedTime === "number" && q.estimatedTime > 0) {
      return Math.round(q.estimatedTime);
    }
    // Time to read entire stem + 2s per option
    const text = q.question || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    // Average reading speed ~3 words/second, minimum 4s
    const readingTime = Math.max(4, Math.ceil(words / 3));

    let optionsCount = 4;
    if (Array.isArray(q.options) && q.options.length > 0) {
      optionsCount = q.options.length;
    } else if (Array.isArray(q.statements) && q.statements.length > 0) {
      optionsCount = q.statements.length;
    }
    const optionsTime = optionsCount * 2;

    let calcBonus = 0;
    if (text.includes("$") || (q.code && q.code.length > 0)) {
      calcBonus = 5;
    }

    return Math.max(10, readingTime + optionsTime + calcBonus);
  }

  getQuizDefaultTime() {
    if (this.questions.length === 0) return 20;
    const sum = this.questions.reduce((acc, q) => acc + this.calculateEstimatedTime(q), 0);
    const avg = sum / this.questions.length;
    // Single time limit for every question: 5% higher than the average time of all questions
    return Math.max(5, Math.round(avg * 1.05));
  }

  getActiveTimePressureSeconds() {
    if (typeof this.settings.timePressureSeconds === "number" && this.settings.timePressureSeconds > 0) {
      return Math.round(this.settings.timePressureSeconds);
    }
    return this.getQuizDefaultTime();
  }

  updateTimePressureFeedback() {
    const feedbackEl = document.getElementById("timePressureFeedback");
    const inputEl = document.getElementById("settingTimePressureSeconds");
    if (!feedbackEl || !inputEl) return;

    const defaultTime = this.getQuizDefaultTime();
    const userVal = parseInt(inputEl.value, 10);
    const isVn = (this.config.category && /kinh tế|tiếng việt/i.test(this.config.category)) || 
                 (this.config.title && /kinh tế|chương|đề/i.test(this.config.title));

    if (isNaN(userVal) || userVal <= 0) {
      feedbackEl.innerHTML = `<span style="color: var(--neon-rose); font-weight: 600;">⚠️ ${isVn ? "Thời gian phải là số nguyên lớn hơn 0." : "Time must be an integer greater than 0."}</span>`;
      return;
    }

    if (userVal < defaultTime) {
      feedbackEl.innerHTML = `<span style="color: var(--neon-amber); font-weight: 600;">⚠️ ${isVn ? `${userVal}s thấp hơn thời gian chuẩn (${defaultTime}s) — bài thi sẽ khó hơn nhiều!` : `${userVal}s is lower than standard limit (${defaultTime}s) — much harder!`}</span>`;
    } else if (userVal > defaultTime) {
      feedbackEl.innerHTML = `<span style="color: var(--neon-cyan); font-weight: 500;">ℹ️ ${isVn ? `${userVal}s cao hơn thời gian chuẩn (${defaultTime}s) — bài thi sẽ bớt thử thách hơn.` : `${userVal}s is higher than standard limit (${defaultTime}s) — not as challenging.`}</span>`;
    } else {
      feedbackEl.innerHTML = `<span style="color: var(--neon-emerald); font-weight: 500;">✓ ${isVn ? `Trùng khớp với thời gian chuẩn (${defaultTime}s/câu).` : `Balanced standard pace (${defaultTime}s/question).`}</span>`;
    }
  }

  applySettings() {
    document.body.classList.toggle("zen-mode", !!this.settings.zenMode);

    const showTypeSwitch = document.getElementById("settingShowType");
    if (showTypeSwitch) showTypeSwitch.checked = !!this.settings.showQuestionType;

    const instantCheckSwitch = document.getElementById("settingInstantCheck");
    if (instantCheckSwitch) instantCheckSwitch.checked = !!this.settings.instantCheck;

    const zenSwitch = document.getElementById("settingZenMode");
    if (zenSwitch) zenSwitch.checked = !!this.settings.zenMode;

    const timePressureSwitch = document.getElementById("settingTimePressure");
    if (timePressureSwitch) timePressureSwitch.checked = !!this.settings.timePressure;

    const timePressureBox = document.getElementById("timePressureConfigBox");
    if (timePressureBox) timePressureBox.style.display = this.settings.timePressure ? "block" : "none";

    const timePressureSecInput = document.getElementById("settingTimePressureSeconds");
    if (timePressureSecInput) timePressureSecInput.value = this.getActiveTimePressureSeconds();

    this.updateTimePressureFeedback();

    const settingsBtn = document.getElementById("settingsToggleBtn");
    if (settingsBtn) {
      settingsBtn.classList.toggle("zen-active", !!this.settings.zenMode);
      settingsBtn.setAttribute("title", this.settings.zenMode ? "Settings (Zen Mode Active)" : "Settings");
    }

    if (!this.isSummaryView) {
      this.renderQuestion(this.currentIndex);
    }
  }

  getCleanQuestionText(text) {
    if (!text) return "";
    if (this.settings.showQuestionType) return text;

    // Disabling show question type will automatically disable any hints or text that suggest how many answers the user should choose
    return text
      .replace(/\s*\((?:Select|Choose)\s+all(?:\s+that\s+apply|\s+\d+\s+correct\s+answers|\s+\d+\s+answers)?\)/gi, "")
      .replace(/\s*\(Chọn tất cả(?: các)? đáp án đúng\)/gi, "")
      .replace(/\s*\(Chọn tất cả đáp án đúng\)/gi, "")
      .trim();
  }

  formatMarkdown(text) {
    if (!text || typeof text !== "string") return "";

    // 1. Stash LaTeX math expressions ($$...$$ and $...$) so markdown regex never mangles formula tokens
    const mathTokens = [];
    let processed = text;

    // Display math $$...$$
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
      mathTokens.push(match);
      return `%%MATH_TOKEN_${mathTokens.length - 1}%%`;
    });

    // Inline math $...$ (respect escaped \$)
    processed = processed.replace(/(^|[^\\])\$([^\$]+?)\$/g, (match, prefix, mathContent) => {
      mathTokens.push(`$${mathContent}$`);
      return `${prefix}%%MATH_TOKEN_${mathTokens.length - 1}%%`;
    });

    // 2. Escape HTML tags for safety
    processed = processed
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 3. Format Inline Code: `code`
    processed = processed.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // 4. Format Bold: **text** or __text__
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // 5. Format Italic: *text* or _text_
    processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    processed = processed.replace(/(^|[^a-zA-Z0-9])_([^_]+)_(?![a-zA-Z0-9])/g, '$1<em>$2</em>');

    // 6. Format Strikethrough: ~~text~~
    processed = processed.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // 7. Format Paragraphs & Line Breaks
    processed = processed.replace(/\r\n/g, "\n");
    processed = processed.replace(/\n\n+/g, '<br><br>');
    processed = processed.replace(/\n/g, '<br>');

    // 8. Restore LaTeX math tokens
    processed = processed.replace(/%%MATH_TOKEN_(\d+)%%/g, (_, idx) => {
      return mathTokens[parseInt(idx, 10)] || "";
    });

    return processed;
  }

  getStatements(q) {
    if (Array.isArray(q.statements)) {
      return q.statements.map((s, idx) => {
        if (typeof s === "string") {
          const isCorr = Array.isArray(q.correct) ? Boolean(q.correct[idx]) : true;
          return { text: s, correct: isCorr };
        }
        return {
          text: s.text || s.statement || "",
          correct: Boolean(s.correct)
        };
      });
    }
    if (Array.isArray(q.options)) {
      const correctArr = Array.isArray(q.correct) ? q.correct : [];
      return q.options.map((opt, idx) => ({
        text: typeof opt === "string" ? opt : opt.text,
        correct: Boolean(correctArr[idx])
      }));
    }
    return [];
  }

  renderMath(targetEl = null) {
    const el = targetEl || document.getElementById("workspaceArea");
    if (!el) return;

    if (typeof window.renderMathInElement === "function") {
      try {
        window.renderMathInElement(el, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
          throwOnError: false
        });
      } catch (err) {
        console.warn("KaTeX auto-render error:", err);
      }
    }
  }

  openSettingsModal() {
    const modal = document.getElementById("settingsModal");
    if (modal) {
      modal.classList.add("active");
      document.body.classList.add("modal-open");

      // Pause question countdown timer while in settings
      if (this.settings.timePressure && this.userAnswers[this.currentIndex] && !this.userAnswers[this.currentIndex].checked) {
        this.clearQuestionTimer();
        this.isPausedForModal = true;
      }

      const showTypeSwitch = document.getElementById("settingShowType");
      if (showTypeSwitch) showTypeSwitch.checked = !!this.settings.showQuestionType;
      const instantCheckSwitch = document.getElementById("settingInstantCheck");
      if (instantCheckSwitch) instantCheckSwitch.checked = !!this.settings.instantCheck;
      const zenSwitch = document.getElementById("settingZenMode");
      if (zenSwitch) zenSwitch.checked = !!this.settings.zenMode;

      const timePressureSwitch = document.getElementById("settingTimePressure");
      if (timePressureSwitch) timePressureSwitch.checked = !!this.settings.timePressure;

      const timePressureBox = document.getElementById("timePressureConfigBox");
      if (timePressureBox) timePressureBox.style.display = this.settings.timePressure ? "block" : "none";

      const timePressureSecInput = document.getElementById("settingTimePressureSeconds");
      if (timePressureSecInput) timePressureSecInput.value = this.getActiveTimePressureSeconds();

      this.updateTimePressureFeedback();
    }
  }

  closeSettingsModal() {
    const modal = document.getElementById("settingsModal");
    if (modal) {
      modal.classList.remove("active");
    }
    document.body.classList.remove("modal-open");

    if (this.isPausedForModal) {
      this.isPausedForModal = false;
      if (this.settings.timePressure && this.userAnswers[this.currentIndex] && !this.userAnswers[this.currentIndex].checked) {
        this.showResumeOverlay();
      }
    }
  }

  showResumeOverlay() {
    const overlay = document.getElementById("pauseResumeOverlay");
    if (!overlay) {
      if (this.settings.timePressure && this.userAnswers[this.currentIndex] && !this.userAnswers[this.currentIndex].checked) {
        this.startQuestionTimer(this.currentIndex);
      }
      return;
    }

    const isVn = (this.config.category && /kinh tế|tiếng việt/i.test(this.config.category)) || 
                 (this.config.title && /kinh tế|chương|đề/i.test(this.config.title));
    const titleEl = document.getElementById("pauseTitle");
    const subEl = document.getElementById("pauseSubtitle");
    if (titleEl) titleEl.textContent = isVn ? "Nhấp để Tiếp Tục" : "Click to Continue";
    if (subEl) subEl.textContent = isVn ? "Đồng hồ sẽ tiếp tục đếm ngược" : "Timer will resume counting down";

    overlay.style.display = "flex";
    document.body.classList.add("quiz-paused");
  }

  hideResumeOverlayAndContinue() {
    const overlay = document.getElementById("pauseResumeOverlay");
    if (overlay) {
      overlay.style.display = "none";
    }
    document.body.classList.remove("quiz-paused");
    if (this.settings.timePressure && this.userAnswers[this.currentIndex] && !this.userAnswers[this.currentIndex].checked) {
      this.startQuestionTimer(this.currentIndex);
    }
  }

  initUserAnswers() {
    this.userAnswers = this.questions.map((q) => ({
      id: q.id,
      checked: false,
      timedOut: false,
      remainingMs: null,
      selectedOptions: [], // Array of option indices
      tfAnswers: {}, // Map statement index -> boolean
      essayText: "",
      isCorrect: null, // true | false | null (unanswered)
      selfAssessed: false
    }));
  }

  clearQuestionTimer() {
    if (this.questionTimerInterval) {
      clearInterval(this.questionTimerInterval);
      this.questionTimerInterval = null;
    }
    if (typeof this.currentQuestionTimerIndex === "number") {
      const state = this.userAnswers[this.currentQuestionTimerIndex];
      if (state && !state.checked && this.questionTimerStartTime) {
        const elapsed = Date.now() - this.questionTimerStartTime;
        state.remainingMs = Math.max(0, this.questionTimerInitialRemainingMs - elapsed);
        this.questionSecondsRemaining = Math.ceil(state.remainingMs / 1000);
      }
      this.currentQuestionTimerIndex = null;
      this.questionTimerStartTime = null;
    }
  }

  startQuestionTimer(index) {
    this.clearQuestionTimer();
    if (!this.settings.timePressure) return;
    const state = this.userAnswers[index];
    if (!state || state.checked) return;

    const totalSec = this.getActiveTimePressureSeconds();
    const totalMs = totalSec * 1000;

    const initialRemainingMs = (typeof state.remainingMs === "number" && state.remainingMs > 0)
      ? state.remainingMs
      : totalMs;

    this.currentQuestionTimerIndex = index;
    this.questionTimerStartTime = Date.now();
    this.questionTimerInitialRemainingMs = initialRemainingMs;
    this.questionSecondsRemaining = Math.ceil(initialRemainingMs / 1000);

    this.updateQuestionTimerDisplay(initialRemainingMs, totalMs);

    this.questionTimerInterval = setInterval(() => {
      const elapsed = Date.now() - this.questionTimerStartTime;
      const remainingMs = Math.max(0, this.questionTimerInitialRemainingMs - elapsed);
      state.remainingMs = remainingMs;
      this.questionSecondsRemaining = Math.ceil(remainingMs / 1000);

      this.updateQuestionTimerDisplay(remainingMs, totalMs);

      if (remainingMs <= 0) {
        this.clearQuestionTimer();
        state.remainingMs = 0;
        this.handleQuestionTimeout(index);
      }
    }, 50);
  }

  updateQuestionTimerDisplay(remainingMs = null, totalMs = null) {
    const total = totalMs || (this.getActiveTimePressureSeconds() * 1000);
    const remMs = typeof remainingMs === "number" ? remainingMs : (this.questionSecondsRemaining * 1000);
    const remSec = Math.ceil(remMs / 1000);
    const pct = Math.max(0, Math.min(100, (remMs / total) * 100));
    const isCritical = pct <= 20;

    // 1. In-Card Tag
    const qTimerNum = document.getElementById("qTimerNum");
    const qTimerTag = document.getElementById("qTimerTag");
    if (qTimerNum) {
      qTimerNum.textContent = `${remSec}`;
    }
    if (qTimerTag) {
      qTimerTag.classList.toggle("tag-pulse-critical", isCritical);
    }

    // 2. In-Card Progress Bar
    const qTimerBar = document.getElementById("qTimerBar");
    if (qTimerBar) {
      qTimerBar.style.width = `${pct}%`;
      const hue = Math.round((pct / 100) * 120);
      qTimerBar.style.backgroundColor = `hsl(${hue}, 85%, 48%)`;
      qTimerBar.classList.toggle("warning", pct <= 50 && pct > 20);
      qTimerBar.classList.toggle("critical", isCritical);
    }
  }

  handleQuestionTimeout(index) {
    const q = this.questions[index];
    const state = this.userAnswers[index];
    if (!state || state.checked) return;

    state.checked = true;
    state.timedOut = true;

    // Time pressure rule: The question will be marked wrong if answer incorrectly or didn't choose any answer
    if (q.type === "true_false" || q.type === "tf") {
      const stmts = this.getStatements(q);
      const isAllAnswered = stmts.length > 0 && stmts.every((_, i) => state.tfAnswers && state.tfAnswers[i] !== undefined && state.tfAnswers[i] !== null);
      const isAllCorrect = isAllAnswered && stmts.every((s, i) => state.tfAnswers[i] === s.correct);
      state.isCorrect = isAllCorrect;
    } else if (q.type === "essay") {
      state.isCorrect = false;
    } else {
      const correctArr = Array.isArray(q.correct) ? [...q.correct].sort((a, b) => a - b) : [q.correct];
      const userArr = [...state.selectedOptions].sort((a, b) => a - b);
      const isMatch = userArr.length > 0 && correctArr.length === userArr.length && correctArr.every((v, i) => v === userArr[i]);
      state.isCorrect = isMatch;
    }

    this.renderQuestion(index);
    this.updateProgress();
  }

  restartQuizFromBeginning() {
    this.clearQuestionTimer();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.initUserAnswers();
    this.flagged.clear();
    this.startTime = Date.now();
    this.elapsedSeconds = 0;
    this.startTimer();
    this.renderHeader();
    this.renderSidebar();
    this.jumpToQuestion(0);
  }

  start() {
    this.applySettings();
    this.renderHeader();
    this.renderSidebar();
    this.renderQuestion(this.currentIndex);
    this.setupGlobalEvents();
    this.startTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      const timerEl = document.getElementById("timerDisplay");
      if (timerEl) {
        timerEl.textContent = this.formatTime(this.elapsedSeconds);
      }
    }, 1000);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  renderHeader() {
    const titleEl = document.getElementById("quizTitle");
    const categoryEl = document.getElementById("quizCategory");

    if (titleEl) {
      titleEl.textContent = this.config.title;
      titleEl.setAttribute("title", this.config.title);
    }
    if (categoryEl && this.config.category) {
      categoryEl.textContent = this.config.category;
    }

    this.updateProgress();
  }

  updateProgress() {
    const total = this.questions.length;
    const answeredCount = this.userAnswers.filter((a) => a.checked).length;
    const correctCount = this.userAnswers.filter((a) => a.isCorrect === true).length;
    const percentComplete = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
    const percentAccuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    // Stop timer when every question has been done and checked
    if (total > 0 && answeredCount === total && this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const fillEl = document.getElementById("progressFill");
    const labelEl = document.getElementById("progressLabel");
    const qCountBadge = document.getElementById("qCountBadge");
    const sidebarDoneVal = document.getElementById("sidebarDoneVal");
    const sidebarAccuracyVal = document.getElementById("sidebarAccuracyVal");
    const sidebarFlagVal = document.getElementById("sidebarFlagVal");

    if (fillEl) fillEl.style.width = `${percentComplete}%`;
    if (labelEl) labelEl.innerHTML = `<span class="progress-answered-count">${answeredCount} / ${total} Answered</span> <span class="progress-percent">(${percentComplete}%)</span>`;
    if (qCountBadge) qCountBadge.textContent = `${this.currentIndex + 1} of ${total}`;

    if (sidebarDoneVal) sidebarDoneVal.textContent = `${answeredCount}/${total}`;
    if (sidebarAccuracyVal) sidebarAccuracyVal.textContent = `${percentAccuracy}%`;
    if (sidebarFlagVal) sidebarFlagVal.textContent = this.flagged.size;

    this.updateSidebarGrid();
  }

  renderSidebar() {
    const grid = document.getElementById("sidebarQuestionGrid");
    if (!grid) return;

    grid.innerHTML = "";
    this.questions.forEach((q, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "q-btn";
      btn.id = `qBtn-${idx}`;
      btn.innerHTML = `<span>${idx + 1}</span>`;
      btn.setAttribute("title", `Jump to Question ${idx + 1}: ${q.question.substring(0, 40)}...`);
      btn.addEventListener("click", () => {
        this.jumpToQuestion(idx);
      });
      grid.appendChild(btn);
    });

    this.updateSidebarGrid();
  }

  updateSidebarGrid() {
    this.questions.forEach((q, idx) => {
      const btn = document.getElementById(`qBtn-${idx}`);
      if (!btn) return;

      const state = this.userAnswers[idx];
      btn.className = "q-btn";

      if (idx === this.currentIndex && !this.isSummaryView) {
        btn.classList.add("active");
      }

      if (state.checked) {
        if (state.isCorrect === true) {
          btn.classList.add("correct");
        } else if (state.isCorrect === false) {
          btn.classList.add("incorrect");
        }
      }

      if (this.flagged.has(idx)) {
        btn.classList.add("flagged");
      }
    });
  }

  renderCheckButton(q, state) {
    // If answer is already checked, check button disappears completely
    if (state.checked) {
      return "";
    }

    // If instant check is enabled for non-essay questions, check button is hidden
    if (this.settings.instantCheck && q.type !== "essay") {
      return "";
    }

    return `
      <button type="button" class="btn-neon-lime icon-btn-round" id="checkBtn" title="Check Answer" aria-label="Check Answer">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    `;
  }

  renderQuestion(index) {
    this.isSummaryView = false;
    this.currentIndex = index;

    const workspace = document.getElementById("workspaceArea");
    if (!workspace) return;

    this.clearQuestionTimer();

    const q = this.questions[index];
    const state = this.userAnswers[index];
    const isFlagged = this.flagged.has(index);
    const isLastQuestion = index === this.questions.length - 1;

    // Start question countdown timer if Time Pressure is active and question not checked
    if (this.settings.timePressure && !state.checked) {
      this.startQuestionTimer(index);
    }

    // Compute type badge & instructions
    let typeBadgeLabel = "Single Choice";
    let typeInstruction = "Select 1 option and press Check.";
    const isVn = (this.config.category && /kinh tế|tiếng việt/i.test(this.config.category)) || 
                 (this.config.title && /kinh tế|chương|đề/i.test(this.config.title));

    if (q.type === "multiple") {
      const correctArr = Array.isArray(q.correct) ? q.correct : [q.correct];
      typeBadgeLabel = isVn ? `Nhiều đáp án (${correctArr.length} đúng)` : `Multi-Choice (${correctArr.length} correct)`;
      typeInstruction = isVn ? `Chọn tất cả ${correctArr.length} đáp án đúng và nhấn Kiểm tra.` : `Select all ${correctArr.length} correct answers and press Check.`;
    } else if (q.type === "true_false" || q.type === "tf") {
      const stmts = this.getStatements(q);
      typeBadgeLabel = isVn ? `Đúng / Sai (${stmts.length} ý)` : `True / False (${stmts.length} statements)`;
      typeInstruction = isVn 
        ? `Chọn Đúng hoặc Sai cho mỗi nhận định. Cần trả lời đúng tất cả các ý để đạt điểm.`
        : `Evaluate each statement as True or False. All ${stmts.length} must be correct to earn credit.`;
    } else if (q.type === "essay") {
      typeBadgeLabel = isVn ? "Tự luận / Tự đánh giá" : "Essay / Self-Grade";
      typeInstruction = isVn
        ? "Nhập câu trả lời, nhấn Kiểm tra, sau đó tự chấm theo thang điểm barem."
        : "Type your response, press Check Answer, then self-evaluate against the rubric.";
    }

    const showType = !!this.settings.showQuestionType;
    const cleanQuestionText = this.getCleanQuestionText(q.question);
    const formattedQuestionText = this.formatMarkdown(cleanQuestionText);

    const activeTotalMs = this.getActiveTimePressureSeconds() * 1000;
    const initialRemMs = (state && typeof state.remainingMs === "number" && state.remainingMs > 0)
      ? state.remainingMs
      : activeTotalMs;
    const activeSec = Math.ceil(initialRemMs / 1000);

    const timePressureTag = this.settings.timePressure && !state.checked
      ? `<span class="glass-tag tag-rose" id="qTimerTag" title="Time remaining for this question">⏱ <span id="qTimerNum">${activeSec}</span>s</span>`
      : "";

    const initialBarPct = Math.max(0, Math.min(100, (initialRemMs / activeTotalMs) * 100));
    const initialHue = Math.round((initialBarPct / 100) * 120);
    const initialBgColor = `hsl(${initialHue}, 85%, 48%)`;
    const initialIsCritical = initialBarPct <= 20;
    const timerBarHtml = this.settings.timePressure && !state.checked
      ? `<div class="q-timer-track"><div class="q-timer-bar ${initialIsCritical ? "critical" : ""}" id="qTimerBar" style="width: ${initialBarPct}%; background-color: ${initialBgColor};"></div></div>`
      : "";

    const html = `
      <div class="content-wrapper">
        <div class="question-card glass-panel-elevated">
          <div class="question-meta-bar">
            <div class="question-tags">
              <span class="glass-tag tag-cyan">Question ${index + 1}</span>
              ${showType ? `<span class="glass-tag tag-violet">${typeBadgeLabel}</span>` : ""}
              ${timePressureTag}
            </div>
            <button type="button" class="flag-toggle-btn ${isFlagged ? "flagged" : ""}" id="flagBtn" aria-label="Flag for review">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFlagged ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
              <span>${isFlagged ? "Flagged" : "Flag"}</span>
            </button>
          </div>

          ${timerBarHtml}

          <h2 class="question-text">${formattedQuestionText}</h2>

          ${q.code ? `<pre class="question-code-block"><code>${this.escapeHtml(q.code)}</code></pre>` : ""}

          ${
            showType
              ? `<p style="font-size: 0.86rem; color: var(--text-secondary); margin-bottom: 20px;">
                  <em>💡 ${typeInstruction}</em>
                </p>`
              : ""
          }

          ${
            q.type === "essay"
              ? this.renderEssayInput(q, state)
              : q.type === "true_false" || q.type === "tf"
              ? this.renderTrueFalseList(q, state)
              : this.renderOptionsList(q, state)
          }

          <div id="explanationContainer">
            ${state.checked ? this.renderExplanation(q, state) : ""}
          </div>

          <div class="question-action-bar">
            <div class="nav-buttons">
              <button type="button" class="btn-glass icon-btn-round" id="prevBtn" ${index === 0 ? "disabled style='opacity: 0.35; cursor: not-allowed;'" : ""} title="Previous Question" aria-label="Previous Question">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              ${
                !isLastQuestion
                  ? `<button type="button" class="btn-glass icon-btn-round" id="nextBtn" title="Next Question" aria-label="Next Question">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>`
                  : ""
              }
            </div>

            <div style="display: flex; gap: 12px; align-items: center;">
              ${this.renderCheckButton(q, state)}
              ${
                isLastQuestion
                  ? `<button type="button" class="btn-neon-lime" id="finishTopBtn" title="View Final Summary & Results" aria-label="View Final Summary & Results">
                      <span>Summary</span>
                    </button>`
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    `;

    workspace.innerHTML = html;
    this.bindQuestionEvents(q, state);
    this.updateProgress();
    this.renderMath(workspace);
  }

  renderTrueFalseList(q, state) {
    const stmts = this.getStatements(q);
    const isLocked = state.checked;
    const isVn = (this.config.category && /kinh tế|tiếng việt/i.test(this.config.category)) || 
                 (this.config.title && /kinh tế|chương|đề/i.test(this.config.title));
    const labelTrue = this.config.labelTrue || (isVn ? "Đúng" : "True");
    const labelFalse = this.config.labelFalse || (isVn ? "Sai" : "False");

    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    return `
      <div class="options-list tf-statements-list" role="group" aria-label="True/False Statements">
        ${stmts.map((stmt, sIdx) => {
          const userVal = state.tfAnswers ? state.tfAnswers[sIdx] : undefined;
          const letter = letters[sIdx] || `${sIdx + 1}`;

          let rowStateClass = "";
          let trueBtnStateClass = "";
          let falseBtnStateClass = "";

          if (isLocked) {
            const isStmtCorrect = userVal === stmt.correct;
            rowStateClass = isStmtCorrect ? "correct-state" : "incorrect-state";

            if (stmt.correct === true) {
              if (userVal === true) {
                trueBtnStateClass = "btn-correct-selected";
              } else if (userVal === false) {
                falseBtnStateClass = "btn-incorrect-selected";
                trueBtnStateClass = "btn-missed";
              } else {
                trueBtnStateClass = "btn-missed";
              }
            } else {
              // stmt.correct === false
              if (userVal === false) {
                falseBtnStateClass = "btn-correct-selected";
              } else if (userVal === true) {
                trueBtnStateClass = "btn-incorrect-selected";
                falseBtnStateClass = "btn-missed";
              } else {
                falseBtnStateClass = "btn-missed";
              }
            }
          }

          return `
            <div class="option-item tf-option-item ${rowStateClass} ${isLocked ? "locked" : ""}" data-stmt-index="${sIdx}">
              <div class="option-indicator">${letter}</div>
              <div class="option-label">${this.formatMarkdown(stmt.text)}</div>
              <div class="tf-toggle-group">
                <button type="button" 
                  class="tf-toggle-btn tf-btn-true ${userVal === true ? "selected" : ""} ${trueBtnStateClass}" 
                  data-stmt-index="${sIdx}" 
                  data-value="true" 
                  ${isLocked ? "disabled" : ""}
                  title="${labelTrue}">
                  ${labelTrue}
                </button>
                <button type="button" 
                  class="tf-toggle-btn tf-btn-false ${userVal === false ? "selected" : ""} ${falseBtnStateClass}" 
                  data-stmt-index="${sIdx}" 
                  data-value="false" 
                  ${isLocked ? "disabled" : ""}
                  title="${labelFalse}">
                  ${labelFalse}
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  handleTrueFalseSelect(q, state, sIdx, val) {
    if (state.checked) return;
    if (!state.tfAnswers) state.tfAnswers = {};
    state.tfAnswers[sIdx] = val;

    // Fast DOM update without full re-render
    const row = document.querySelector(`.tf-option-item[data-stmt-index="${sIdx}"], .tf-statement-row[data-stmt-index="${sIdx}"]`);
    if (row) {
      const trueBtn = row.querySelector(".tf-btn-true");
      const falseBtn = row.querySelector(".tf-btn-false");
      if (trueBtn && falseBtn) {
        trueBtn.classList.toggle("selected", val === true);
        falseBtn.classList.toggle("selected", val === false);
      }
    }

    if (this.settings.instantCheck) {
      const stmts = this.getStatements(q);
      const allDone = stmts.length > 0 && stmts.every((_, i) => state.tfAnswers[i] !== undefined && state.tfAnswers[i] !== null);
      if (allDone) {
        this.checkCurrentAnswer();
      }
    }
  }

  renderOptionsList(q, state) {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const isLocked = state.checked;

    const correctArr = Array.isArray(q.correct) ? q.correct : [q.correct];

    return `
      <div class="options-list" role="group" aria-label="Question options">
        ${q.options
          .map((opt, optIdx) => {
            const isSelected = state.selectedOptions.includes(optIdx);
            let stateClass = "";

            if (isLocked) {
              const isCorrectOpt = correctArr.includes(optIdx);
              if (isSelected && isCorrectOpt) {
                stateClass = "correct-state";
              } else if (isSelected && !isCorrectOpt) {
                stateClass = "incorrect-state";
              } else if (!isSelected && isCorrectOpt) {
                stateClass = "missed-state";
              }
            }

            return `
              <div 
                class="option-item ${isSelected ? "selected" : ""} ${stateClass} ${isLocked ? "locked" : ""}" 
                data-opt-index="${optIdx}"
                tabindex="${isLocked ? "-1" : "0"}"
                role="checkbox"
                aria-checked="${isSelected}"
              >
                <div class="option-indicator">${letters[optIdx] || optIdx + 1}</div>
                <div class="option-label">${this.formatMarkdown(opt)}</div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  renderEssayInput(q, state) {
    const isLocked = state.checked;

    return `
      <div class="essay-container">
        <label for="essayInput" style="font-weight: 700; font-size: 0.92rem; color: var(--text-secondary);">
          Your Answer:
        </label>
        <textarea 
          id="essayInput" 
          class="essay-textarea" 
          placeholder="Type your explanation or reasoning here..."
          ${isLocked ? "readonly" : ""}
        >${this.escapeHtml(state.essayText)}</textarea>

        ${
          isLocked
            ? `
          <div class="model-answer-card">
            <div class="model-answer-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <span>Model Answer & Reference Rubric:</span>
            </div>
            <div class="model-answer-body">
              ${this.formatMarkdown(q.modelAnswer)}
            </div>

            ${
              q.keyPoints && q.keyPoints.length > 0
                ? `
              <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary); margin-top: 6px;">Key Points Checklist:</div>
              <ul class="rubric-list">
                ${q.keyPoints.map((pt) => `<li>✓ ${this.formatMarkdown(pt)}</li>`).join("")}
              </ul>
            `
                : ""
            }

            <div class="self-eval-box">
              <div class="self-eval-prompt">
                How does your answer compare to the model answer?
              </div>
              <div class="self-eval-buttons">
                <button type="button" class="btn-glass self-grade-btn" data-grade="correct" style="${
                  state.isCorrect === true ? "background: rgba(16, 185, 129, 0.25); border-color: var(--neon-emerald); color: var(--neon-emerald);" : ""
                }">
                  🟢 I got it right (+1 Correct)
                </button>
                <button type="button" class="btn-glass self-grade-btn" data-grade="incorrect" style="${
                  state.isCorrect === false ? "background: rgba(244, 63, 94, 0.25); border-color: var(--neon-rose); color: var(--neon-rose);" : ""
                }">
                  🔴 Needs review / Missed key points
                </button>
              </div>
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  renderExplanation(q, state) {
    let headerClass = "reviewed";
    let headerText = "Explanation & Insights";

    if (state.isCorrect === true) {
      headerClass = "correct";
      headerText = "Correct";
    } else if (state.isCorrect === false) {
      headerClass = "incorrect";
      headerText = "Incorrect";
    }

    return `
      <div class="explanation-panel">
        <div class="explanation-header ${headerClass}">
          <span>${headerText}</span>
        </div>
        <div class="explanation-text">
          ${q.explanation ? this.formatMarkdown(q.explanation) : "Review the reference solution above."}
        </div>
      </div>
    `;
  }

  bindQuestionEvents(q, state) {
    // Flag Button
    const flagBtn = document.getElementById("flagBtn");
    if (flagBtn) {
      flagBtn.addEventListener("click", () => {
        this.toggleFlag(this.currentIndex);
      });
    }

    // Previous / Next Buttons
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.previousQuestion());
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextQuestion());
    }

    // Finish / Summary Button
    const finishBtn = document.getElementById("finishTopBtn");
    if (finishBtn) {
      finishBtn.addEventListener("click", () => this.showSummary());
    }

    // Options Click Handling for Single / Multi Choice
    if (q.type !== "essay" && q.type !== "true_false" && q.type !== "tf" && !state.checked) {
      const optionEls = document.querySelectorAll(".option-item");
      optionEls.forEach((el) => {
        el.addEventListener("click", () => {
          const optIdx = parseInt(el.getAttribute("data-opt-index"), 10);
          this.handleOptionSelect(q, state, optIdx);
        });

        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const optIdx = parseInt(el.getAttribute("data-opt-index"), 10);
            this.handleOptionSelect(q, state, optIdx);
          }
        });
      });
    }

    // True/False Button Handling
    if ((q.type === "true_false" || q.type === "tf") && !state.checked) {
      const tfButtons = document.querySelectorAll(".tf-toggle-btn");
      tfButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const sIdx = parseInt(btn.getAttribute("data-stmt-index"), 10);
          const val = btn.getAttribute("data-value") === "true";
          this.handleTrueFalseSelect(q, state, sIdx, val);
        });
      });
    }

    // Essay Textarea Input
    if (q.type === "essay" && !state.checked) {
      const textarea = document.getElementById("essayInput");
      if (textarea) {
        textarea.addEventListener("input", (e) => {
          state.essayText = e.target.value;
        });
      }
    }

    // Check Answer Button
    const checkBtn = document.getElementById("checkBtn");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        this.checkCurrentAnswer();
      });
    }

    // Self-grading buttons for essay
    const selfGradeBtns = document.querySelectorAll(".self-grade-btn");
    selfGradeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const grade = btn.getAttribute("data-grade");
        state.isCorrect = grade === "correct";
        state.selfAssessed = true;
        this.renderQuestion(this.currentIndex);
      });
    });
  }

  handleOptionSelect(q, state, optIdx) {
    if (state.checked) return;

    if (q.type === "single") {
      state.selectedOptions = [optIdx];
      if (this.settings.instantCheck) {
        this.checkCurrentAnswer();
        return;
      }
    } else {
      // Multiple choices (1 -> n answers)
      const existing = state.selectedOptions.indexOf(optIdx);
      if (existing > -1) {
        state.selectedOptions.splice(existing, 1);
      } else {
        state.selectedOptions.push(optIdx);
      }
      state.selectedOptions.sort((a, b) => a - b);

      if (this.settings.instantCheck) {
        const correctArr = Array.isArray(q.correct) ? q.correct : [q.correct];
        if (state.selectedOptions.length === correctArr.length) {
          this.checkCurrentAnswer();
          return;
        }
      }
    }

    // Refresh option item classes
    const optionEls = document.querySelectorAll(".option-item");
    optionEls.forEach((el) => {
      const idx = parseInt(el.getAttribute("data-opt-index"), 10);
      const isSel = state.selectedOptions.includes(idx);
      el.classList.toggle("selected", isSel);
      el.setAttribute("aria-checked", isSel ? "true" : "false");
    });
  }

  checkCurrentAnswer() {
    this.clearQuestionTimer();
    const q = this.questions[this.currentIndex];
    const state = this.userAnswers[this.currentIndex];

    if (q.type === "true_false" || q.type === "tf") {
      const stmts = this.getStatements(q);
      const isAllAnswered = stmts.length > 0 && stmts.every((_, i) => state.tfAnswers && state.tfAnswers[i] !== undefined && state.tfAnswers[i] !== null);
      if (!isAllAnswered) {
        alert("Please select True or False for all statements before checking!");
        return;
      }

      state.checked = true;
      const isAllCorrect = isAllAnswered && stmts.every((stmt, i) => state.tfAnswers[i] === stmt.correct);
      state.isCorrect = isAllCorrect;
    } else if (q.type !== "essay") {
      if (state.selectedOptions.length === 0) {
        alert("Please select at least one option before checking!");
        return;
      }

      state.checked = true;
      const correctArr = Array.isArray(q.correct) ? [...q.correct].sort((a, b) => a - b) : [q.correct];
      const userArr = [...state.selectedOptions].sort((a, b) => a - b);

      // Verify exact set match
      const isMatch = correctArr.length === userArr.length && correctArr.every((val, i) => val === userArr[i]);
      state.isCorrect = isMatch;
    } else {
      // Essay question: reveal model answer, wait for self evaluation
      state.checked = true;
      if (state.isCorrect === null) {
        // Default to null until self-graded
        state.isCorrect = null;
      }
    }

    this.renderQuestion(this.currentIndex);
  }

  toggleFlag(index) {
    if (this.flagged.has(index)) {
      this.flagged.delete(index);
    } else {
      this.flagged.add(index);
    }
    const flagBtn = document.getElementById("flagBtn");
    if (flagBtn) {
      const isFlagged = this.flagged.has(index);
      flagBtn.classList.toggle("flagged", isFlagged);
      const svg = flagBtn.querySelector("svg");
      if (svg) svg.setAttribute("fill", isFlagged ? "currentColor" : "none");
      const span = flagBtn.querySelector("span");
      if (span) span.textContent = isFlagged ? "Flagged" : "Flag";
    }
    this.updateProgress();
  }

  previousQuestion() {
    if (this.currentIndex > 0) {
      this.jumpToQuestion(this.currentIndex - 1);
    }
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.jumpToQuestion(this.currentIndex + 1);
    } else {
      this.showSummary();
    }
  }

  jumpToQuestion(index) {
    if (index >= 0 && index < this.questions.length) {
      this.renderQuestion(index);
      const workspace = document.getElementById("workspaceArea");
      if (workspace) workspace.scrollTop = 0;
    }
  }

  showSummary() {
    this.isSummaryView = true;
    this.clearQuestionTimer();
    const workspace = document.getElementById("workspaceArea");
    if (!workspace) return;

    const total = this.questions.length;
    const answered = this.userAnswers.filter((a) => a.checked).length;
    const correct = this.userAnswers.filter((a) => a.isCorrect === true).length;
    const incorrect = this.userAnswers.filter((a) => a.isCorrect === false).length;
    const pendingEssay = this.userAnswers.filter((a) => a.checked && a.isCorrect === null).length;
    const timedOutCount = this.userAnswers.filter((a) => a.timedOut).length;
    const unanswered = total - answered;
    const flaggedCount = this.flagged.size;

    const accuracyPercent = total > 0 ? Math.round((correct / total) * 100) : 0;

    let questionsToDisplay = this.questions.map((q, i) => ({ q, i }));
    if (this.filterMode === "incorrect") {
      questionsToDisplay = questionsToDisplay.filter(({ i }) => this.userAnswers[i].isCorrect === false);
    } else if (this.filterMode === "flagged") {
      questionsToDisplay = questionsToDisplay.filter(({ i }) => this.flagged.has(i));
    }

    const html = `
      <div class="content-wrapper">
        <div class="summary-container glass-panel-elevated">
          
          <div class="summary-hero-card glass-banner-gradient">
            <div class="summary-score-left">
              <span class="summary-badge-title">Result</span>
              <div class="summary-score-large">${accuracyPercent}%</div>
              <p style="font-size: 0.95rem; opacity: 0.88; font-weight: 500; margin-top: 4px;">
                ${correct} out of ${total} Questions Answered Correctly (Passing threshold: ${this.config.passingScore}%)
              </p>
            </div>
            
            <div style="text-align: right; display: flex; flex-direction: column; gap: 8px;">
              <span class="glass-tag" style="background: rgba(0, 0, 0, 0.25); border-color: rgba(255, 255, 255, 0.3);">
                Time Spent: ${this.formatTime(this.elapsedSeconds)}
              </span>
              <span class="glass-tag" style="background: rgba(0, 0, 0, 0.25); border-color: rgba(255, 255, 255, 0.3);">
                Time Pressure: ${this.settings.timePressure ? `Active (${this.getActiveTimePressureSeconds()}s/Q)` : "Off"}
              </span>
              ${timedOutCount > 0 ? `<span class="glass-tag tag-rose" style="background: rgba(244, 63, 94, 0.2);">Timed Out: ${timedOutCount} Qs</span>` : ""}
            </div>
          </div>

          <!-- Quick Stats Grid -->
          <div class="summary-stat-grid">
            <div class="summary-stat-card">
              <span class="val" style="color: var(--neon-cyan);">${total}</span>
              <span class="label">Total Questions</span>
            </div>
            <div class="summary-stat-card">
              <span class="val" style="color: var(--neon-emerald);">${correct}</span>
              <span class="label">Correct Answers (${accuracyPercent}%)</span>
            </div>
            <div class="summary-stat-card">
              <span class="val" style="color: var(--neon-rose);">${incorrect}</span>
              <span class="label">Incorrect Answers (${total > 0 ? Math.round((incorrect / total) * 100) : 0}%)</span>
            </div>
            <div class="summary-stat-card">
              <span class="val" style="color: var(--neon-amber);">${unanswered + pendingEssay}</span>
              <span class="label">Unanswered / Pending</span>
            </div>
          </div>

          <!-- Filter & Action Controls -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div class="summary-filter-wrapper">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              <select id="summaryFilterSelect" class="summary-filter-select" aria-label="Filter Questions">
                <option value="all" ${this.filterMode === "all" ? "selected" : ""}>Display All Questions (${total})</option>
                <option value="incorrect" ${this.filterMode === "incorrect" ? "selected" : ""}>Display Only Incorrect (${incorrect})</option>
                <option value="flagged" ${this.filterMode === "flagged" ? "selected" : ""}>Display Flagged Questions (${flaggedCount})</option>
              </select>
            </div>

            <div style="display: flex; gap: 10px; align-items: center;">
              <button type="button" class="btn-glass" id="summaryExportBtn">Export Review</button>
              <button type="button" class="btn-glass" id="retakeBtn">Retake Quiz</button>
              <button type="button" class="btn-neon-lime" id="importNewQuizBtn">Load Custom AI Quiz</button>
            </div>
          </div>

          <!-- Comprehensive Matrix Grid of Questions -->
          <div class="summary-matrix-section">
            <h3>Question-by-Question Review Matrix</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 8px;">
              Click any question row to jump directly into the full explanation and review details:
            </p>

            <div class="matrix-grid">
              ${
                questionsToDisplay.length === 0
                  ? `<div style="padding: 24px; text-align: center; color: var(--text-secondary);">No questions in this filter view.</div>`
                  : questionsToDisplay
                      .map(({ q, i }) => {
                        const st = this.userAnswers[i];
                        let statusTag = `<span class="glass-tag" style="color: var(--text-muted);">Unanswered</span>`;

                        if (st.checked) {
                          if (st.isCorrect === true) {
                            statusTag = `<span class="glass-tag tag-lime">Correct</span>`;
                          } else if (st.isCorrect === false) {
                            statusTag = `<span class="glass-tag tag-rose">Incorrect</span>`;
                          } else {
                            statusTag = `<span class="glass-tag tag-amber">Pending Self-Grade</span>`;
                          }
                        }

                        const isFlag = this.flagged.has(i);

                        return `
                        <div class="matrix-row-item" data-jump-index="${i}">
                          <div class="matrix-q-info">
                            <div class="matrix-q-num ${st.isCorrect === true ? "correct" : st.isCorrect === false ? "incorrect" : ""}">
                              ${i + 1}
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                              <div class="matrix-q-text">${this.formatMarkdown(this.getCleanQuestionText(q.question))}</div>
                              <span style="font-size: 0.78rem; color: var(--text-muted);">${
                                q.type === "single"
                                  ? "Single Choice"
                                  : q.type === "multiple"
                                  ? "Multi-Choice"
                                  : q.type === "true_false" || q.type === "tf"
                                  ? "True / False Set"
                                  : "Essay Question"
                              }</span>
                            </div>
                          </div>
                          
                          <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                            ${isFlag ? `<span class="glass-tag tag-amber" title="Flagged">Flagged</span>` : ""}
                            ${statusTag}
                            <span style="font-size: 0.85rem; color: var(--text-secondary);">Review →</span>
                          </div>
                        </div>
                      `;
                      })
                      .join("")
              }
            </div>
          </div>

        </div>
      </div>
    `;

    workspace.innerHTML = html;
    this.updateProgress();

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.renderMath(workspace);

    // Bind Summary Events
    document.querySelectorAll(".matrix-row-item").forEach((el) => {
      el.addEventListener("click", () => {
        const jumpIdx = parseInt(el.getAttribute("data-jump-index"), 10);
        this.jumpToQuestion(jumpIdx);
      });
    });

    const summaryFilterSelect = document.getElementById("summaryFilterSelect");
    if (summaryFilterSelect) {
      summaryFilterSelect.addEventListener("change", (e) => {
        this.filterMode = e.target.value;
        this.showSummary();
      });
    }

    const summaryExportBtn = document.getElementById("summaryExportBtn");
    if (summaryExportBtn) {
      summaryExportBtn.addEventListener("click", () => {
        this.exportCurrentQuiz();
      });
    }

    const retakeBtn = document.getElementById("retakeBtn");
    if (retakeBtn) {
      retakeBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to restart the quiz? All answers will be reset.")) {
          this.restartQuizFromBeginning();
        }
      });
    }

    const importNewBtn = document.getElementById("importNewQuizBtn");
    if (importNewBtn) {
      importNewBtn.addEventListener("click", () => {
        this.openImportModal();
      });
    }
  }

  openImportModal() {
    const modal = document.getElementById("importModal");
    if (modal) {
      modal.classList.add("active");
      const submitBtn = document.getElementById("submitImportBtn");
      if (submitBtn) {
        submitBtn.focus();
      }
    }
  }

  closeImportModal() {
    const modal = document.getElementById("importModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  exportCurrentQuiz() {
    try {
      const payload = {
        version: 1,
        exportType: "quizframework_review",
        exportedAt: new Date().toISOString(),
        config: this.config,
        questions: this.questions,
        userAnswers: this.userAnswers,
        flagged: Array.from(this.flagged),
        elapsedSeconds: this.elapsedSeconds
      };

      const dataStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeTitle = (this.config && this.config.title)
        ? this.config.title.toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 30)
        : "quiz";
      a.href = url;
      a.download = `${safeTitle}-review-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export quiz: " + err.message);
    }
  }

  async downloadInstructionFile() {
    try {
      const response = await fetch("instruction.md");
      if (response.ok) {
        const text = await response.text();
        const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "instruction.md";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.warn("Fetch instruction.md failed, using direct download link", e);
    }
    const a = document.createElement("a");
    a.href = "instruction.md";
    a.download = "instruction.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  importCustomQuiz(rawInput) {
    try {
      if (!rawInput || !rawInput.trim()) {
        throw new Error("Input is empty. Please paste your JSON/JS code or upload a file.");
      }

      let cleaned = rawInput.trim();
      // Strip markdown code fences if present (e.g. ```json ... ``` or ```javascript ... ```)
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/\n?```\s*$/, "").trim();
      }

      let data = null;
      try {
        data = JSON.parse(cleaned);
      } catch (jsonErr) {
        // Attempt evaluating as JavaScript defining window.QUIZ_QUESTIONS or window.QUIZ_CONFIG
        try {
          const sandbox = { window: {} };
          const fn = new Function("window", cleaned);
          fn(sandbox.window);
          if (sandbox.window.QUIZ_QUESTIONS && Array.isArray(sandbox.window.QUIZ_QUESTIONS)) {
            data = {
              config: sandbox.window.QUIZ_CONFIG || null,
              questions: sandbox.window.QUIZ_QUESTIONS
            };
          }
        } catch (evalErr) {
          throw new Error("Failed to parse data as JSON or JavaScript.\nError: " + jsonErr.message);
        }
      }

      if (!data) {
        throw new Error("Could not extract questions from input. Make sure it provides an array of questions or window.QUIZ_QUESTIONS.");
      }

      // Check if importing a previously exported review dataset
      if (data.exportType === "quizframework_review" || (Array.isArray(data.userAnswers) && Array.isArray(data.questions))) {
        this.questions = data.questions;
        if (data.config) {
          this.config = { ...this.config, ...data.config };
        }
        this.userAnswers = data.userAnswers;
        this.flagged = new Set(Array.isArray(data.flagged) ? data.flagged : []);
        this.elapsedSeconds = typeof data.elapsedSeconds === "number" ? data.elapsedSeconds : 0;
        this.closeImportModal();
        this.renderHeader();
        this.renderSidebar();
        this.updateProgress();

        const allChecked = this.userAnswers.length > 0 && this.userAnswers.every((a) => a.checked);
        if (allChecked) {
          this.showSummary();
        } else {
          this.jumpToQuestion(0);
        }
        return;
      }

      if (Array.isArray(data)) {
        this.questions = data;
      } else if (data.questions && Array.isArray(data.questions)) {
        this.questions = data.questions;
        if (data.config) {
          this.config = { ...this.config, ...data.config };
        }
      } else {
        throw new Error("Invalid structure: expected array of questions or object with 'questions' array.");
      }

      if (this.questions.length === 0) {
        throw new Error("Loaded questions array is empty. Please provide at least 1 question.");
      }

      this.closeImportModal();
      this.restartQuizFromBeginning();
    } catch (err) {
      alert(`⚠️ Failed to load quiz:\n${err.message}`);
    }
  }

  setupGlobalEvents() {
    // Sidebar Toggle Button
    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    const sidebar = document.getElementById("appSidebar");
    const sidebarColumn = document.getElementById("sidebarColumn");
    if (sidebarToggleBtn && sidebar) {
      sidebarToggleBtn.addEventListener("click", () => {
        if (window.innerWidth <= 900) {
          sidebar.classList.toggle("mobile-open");
          const isOpen = sidebar.classList.contains("mobile-open");
          sidebarToggleBtn.setAttribute("aria-expanded", String(isOpen));
        } else {
          sidebar.classList.toggle("collapsed");
          if (sidebarColumn) sidebarColumn.classList.toggle("collapsed");
          const isCollapsed = sidebar.classList.contains("collapsed");
          sidebarToggleBtn.setAttribute("aria-expanded", String(!isCollapsed));
        }
      });

      // Close mobile sidebar on outside click
      document.addEventListener("click", (e) => {
        if (window.innerWidth <= 900 && sidebar.classList.contains("mobile-open")) {
          if (!sidebar.contains(e.target) && !sidebarToggleBtn.contains(e.target)) {
            sidebar.classList.remove("mobile-open");
            sidebarToggleBtn.setAttribute("aria-expanded", "false");
          }
        }
      });
    }

    // Top Export Quiz Button
    const topExportBtn = document.getElementById("topExportBtn");
    if (topExportBtn) {
      topExportBtn.addEventListener("click", () => {
        this.exportCurrentQuiz();
      });
    }

    // Top Import Quiz Button
    const topImportBtn = document.getElementById("topImportBtn");
    if (topImportBtn) {
      topImportBtn.addEventListener("click", () => {
        this.openImportModal();
      });
    }

    // Download instruction.md Button
    const downloadInstructionBtn = document.getElementById("downloadInstructionBtn");
    if (downloadInstructionBtn) {
      downloadInstructionBtn.addEventListener("click", () => {
        this.downloadInstructionFile();
      });
    }

    // Modal Close Button
    const closeModalBtn = document.getElementById("closeModalBtn");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        this.closeImportModal();
      });
    }

    // Modal Submit Button & Keybind to import in import menu
    const submitImportBtn = document.getElementById("submitImportBtn");
    const jsonInput = document.getElementById("jsonInputArea");
    if (submitImportBtn && jsonInput) {
      submitImportBtn.addEventListener("click", () => {
        this.importCustomQuiz(jsonInput.value);
      });
    }

    // Import modal keybind listeners (Enter / Spacebar)
    const importModal = document.getElementById("importModal");
    if (importModal && jsonInput) {
      importModal.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          this.closeImportModal();
          return;
        }

        const isTextarea = document.activeElement === jsonInput;
        if (e.key === "Enter" || e.key === " ") {
          if (!isTextarea) {
            e.preventDefault();
            this.importCustomQuiz(jsonInput.value);
          } else {
            // Inside textarea: Enter without Shift, or Ctrl/Cmd+Enter submits
            if (e.key === "Enter" && (!e.shiftKey || e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              this.importCustomQuiz(jsonInput.value);
            } else if (e.key === " " && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              this.importCustomQuiz(jsonInput.value);
            }
          }
        }
      });
    }

    // Direct File Upload (.json / .js)
    const quizFileInput = document.getElementById("quizFileInput");
    if (quizFileInput) {
      quizFileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          if (jsonInput) {
            jsonInput.value = content;
          }
          this.importCustomQuiz(content);
        };
        reader.onerror = () => {
          alert("Error reading uploaded file.");
        };
        reader.readAsText(file);
      });
    }

    // Settings Button & Modal
    const settingsToggleBtn = document.getElementById("settingsToggleBtn");
    if (settingsToggleBtn) {
      settingsToggleBtn.addEventListener("click", () => this.openSettingsModal());
    }

    const closeSettingsModalBtn = document.getElementById("closeSettingsModalBtn");
    if (closeSettingsModalBtn) {
      closeSettingsModalBtn.addEventListener("click", () => this.closeSettingsModal());
    }

    const settingsModal = document.getElementById("settingsModal");
    if (settingsModal) {
      settingsModal.addEventListener("click", (e) => {
        if (e.target === settingsModal) {
          this.closeSettingsModal();
        }
      });
    }

    const cancelSettingsBtn = document.getElementById("cancelSettingsBtn");
    if (cancelSettingsBtn) {
      cancelSettingsBtn.addEventListener("click", () => this.closeSettingsModal());
    }

    // Toggle Time Pressure Config Box visibility in Settings without prompt
    const settingTimePressure = document.getElementById("settingTimePressure");
    if (settingTimePressure) {
      settingTimePressure.addEventListener("change", (e) => {
        const configBox = document.getElementById("timePressureConfigBox");
        if (configBox) configBox.style.display = e.target.checked ? "block" : "none";
      });
    }

    // Input changes (typing, up/down arrows) update feedback without prompting
    const settingTimePressureSeconds = document.getElementById("settingTimePressureSeconds");
    if (settingTimePressureSeconds) {
      settingTimePressureSeconds.addEventListener("input", () => {
        this.updateTimePressureFeedback();
      });
    }

    // Reset button resets input value without prompting
    const resetTimePressureBtn = document.getElementById("resetTimePressureBtn");
    if (resetTimePressureBtn) {
      resetTimePressureBtn.addEventListener("click", () => {
        const defaultTime = this.getQuizDefaultTime();
        const inputEl = document.getElementById("settingTimePressureSeconds");
        if (inputEl) inputEl.value = defaultTime;
        this.updateTimePressureFeedback();
      });
    }

    // Apply Button: Applies all settings at once
    const applySettingsBtn = document.getElementById("applySettingsBtn");
    if (applySettingsBtn) {
      applySettingsBtn.addEventListener("click", () => {
        const showTypeSwitch = document.getElementById("settingShowType");
        const instantCheckSwitch = document.getElementById("settingInstantCheck");
        const zenSwitch = document.getElementById("settingZenMode");
        const timePressureSwitch = document.getElementById("settingTimePressure");
        const timePressureSecInput = document.getElementById("settingTimePressureSeconds");

        const newShowType = showTypeSwitch ? showTypeSwitch.checked : this.settings.showQuestionType;
        const newInstantCheck = instantCheckSwitch ? instantCheckSwitch.checked : this.settings.instantCheck;
        const newZenMode = zenSwitch ? zenSwitch.checked : this.settings.zenMode;
        const newTimePressure = timePressureSwitch ? timePressureSwitch.checked : this.settings.timePressure;
        let newSec = timePressureSecInput ? parseInt(timePressureSecInput.value, 10) : this.getActiveTimePressureSeconds();
        if (isNaN(newSec) || newSec <= 0) {
          newSec = this.getQuizDefaultTime();
        }

        const timePressureChanged = (newTimePressure !== this.settings.timePressure) ||
          (newTimePressure && newSec !== this.getActiveTimePressureSeconds());

        if (timePressureChanged) {
          const isVn = (this.config.category && /kinh tế|tiếng việt/i.test(this.config.category)) || 
                       (this.config.title && /kinh tế|chương|đề/i.test(this.config.title));
          const promptText = isVn
            ? "⚠️ Thay đổi Chế độ Áp lực Thời gian sẽ bắt đầu lại bài thi từ đầu. Tất cả câu trả lời trước đó sẽ được làm mới.\n\nBạn có muốn tiếp tục không?"
            : "⚠️ Applying these Time Pressure changes will restart the quiz from the beginning. All existing answers will be reset.\n\nDo you want to proceed?";

          const accepted = confirm(promptText);
          if (!accepted) {
            return;
          }

          this.settings.showQuestionType = newShowType;
          this.settings.instantCheck = newInstantCheck;
          this.settings.zenMode = newZenMode;
          this.settings.timePressure = newTimePressure;
          this.settings.timePressureSeconds = newSec;
          this.saveSettings();
          this.applySettings();
          this.isPausedForModal = false;
          this.closeSettingsModal();
          this.restartQuizFromBeginning();

          if (this.settings.timePressure) {
            this.showResumeOverlay();
          }
        } else {
          this.settings.showQuestionType = newShowType;
          this.settings.instantCheck = newInstantCheck;
          this.settings.zenMode = newZenMode;
          this.saveSettings();
          this.applySettings();
          this.renderQuestion(this.currentIndex);
          this.closeSettingsModal();
        }
      });
    }

    // Pause Resume Overlay Listener
    const pauseResumeOverlay = document.getElementById("pauseResumeOverlay");
    if (pauseResumeOverlay) {
      pauseResumeOverlay.addEventListener("click", () => {
        this.hideResumeOverlayAndContinue();
      });
    }

    const settingsThemeBtn = document.getElementById("settingsThemeBtn");
    if (settingsThemeBtn) {
      settingsThemeBtn.addEventListener("click", () => {
        if (typeof window.toggleTheme === "function") {
          window.toggleTheme();
        } else {
          const themeBtn = document.getElementById("themeToggleBtn");
          if (themeBtn) themeBtn.click();
        }
      });
    }

    // Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      // Handle active Import Modal
      const importModal = document.getElementById("importModal");
      if (importModal && importModal.classList.contains("active")) {
        if (e.key === "Escape") {
          e.preventDefault();
          this.closeImportModal();
          return;
        }
        const jsonInput = document.getElementById("jsonInputArea");
        const isTextarea = document.activeElement === jsonInput;
        if (e.key === "Enter" || e.key === " ") {
          if (!isTextarea) {
            e.preventDefault();
            this.importCustomQuiz(jsonInput ? jsonInput.value : "");
            return;
          } else {
            if (e.key === "Enter" && (!e.shiftKey || e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              this.importCustomQuiz(jsonInput ? jsonInput.value : "");
              return;
            } else if (e.key === " " && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              this.importCustomQuiz(jsonInput ? jsonInput.value : "");
              return;
            }
          }
        }
        return;
      }

      // Handle active Settings Modal
      const settingsModal = document.getElementById("settingsModal");
      if (settingsModal && settingsModal.classList.contains("active")) {
        if (e.key === "Escape") {
          e.preventDefault();
          this.closeSettingsModal();
        }
        return;
      }

      // Handle active Pause Overlay (Click/Space/Enter/Esc to continue)
      const pauseOverlay = document.getElementById("pauseResumeOverlay");
      if (pauseOverlay && pauseOverlay.style.display !== "none") {
        if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          this.hideResumeOverlayAndContinue();
          return;
        }
      }

      // Ignore if typing inside textarea or inputs
      if (["TEXTAREA", "INPUT"].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.key === "ArrowLeft") {
        this.previousQuestion();
      } else if (e.key === "ArrowRight") {
        this.nextQuestion();
      } else if (e.key === "Enter") {
        if (!this.userAnswers[this.currentIndex]?.checked) {
          this.checkCurrentAnswer();
        }
      } else {
        const q = this.questions[this.currentIndex];
        const state = this.userAnswers[this.currentIndex];

        // Number keys: '1' -> 0, '2' -> 1, ...
        if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)) {
          const optIdx = parseInt(e.key, 10) - 1;
          if (q && q.options && optIdx < q.options.length) {
            this.handleOptionSelect(q, state, optIdx);
          }
          return;
        }

        // Letter keys: A/a -> 0, B/b -> 1, C/c -> 2, D/d -> 3, E/e -> 4, etc.
        const letter = e.key.toUpperCase();
        const letterMap = { A: 0, B: 1, C: 2, D: 3, E: 4 };
        if (q && q.options && q.options.length > 5) {
          letterMap["F"] = 5;
        }

        if (letter in letterMap) {
          const optIdx = letterMap[letter];
          if (q && q.options && optIdx < q.options.length) {
            this.handleOptionSelect(q, state, optIdx);
          }
        } else if (letter === "F") {
          this.toggleFlag(this.currentIndex);
        }
      }
    });
  }

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  formatParagraphs(text) {
    if (!text) return "";
    return text
      .split(/\n\n+/)
      .map((p) => `<p style="margin-bottom: 8px;">${this.escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }
}

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
  window.quizApp = new QuizEngine();
  window.quizApp.start();
});
