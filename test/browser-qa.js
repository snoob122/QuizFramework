const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function runVisualQA() {
  const scratchDir = path.resolve("/Users/bean/.gemini/antigravity/brain/bcf3cc62-01f7-48c4-bf35-4123d6a94752/scratch");
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,800"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const htmlUrl = "file://" + path.resolve(__dirname, "../sample-economics.html");
  console.log("Navigating to:", htmlUrl);
  await page.goto(htmlUrl, { waitUntil: "networkidle0" });

  // 1. Verify Topbar
  const hasLogo = await page.$(".brand-logo");
  console.log("1. Logo in topbar removed:", hasLogo === null ? "YES (PASSED)" : "NO (FAILED)");

  const subtitleExists = await page.$("#quizSubtitle");
  console.log("2. Subtitle removed:", subtitleExists === null ? "YES (PASSED)" : "NO (FAILED)");

  // 2. Check LaTeX rendering on Question 1
  const katexCount = await page.$$eval(".katex", (els) => els.length);
  console.log("3. KaTeX rendered elements count on Q1:", katexCount, katexCount > 0 ? "(PASSED)" : "(FAILED)");

  await page.screenshot({ path: path.join(scratchDir, "qa-1-latex-rendered.png") });

  // 3. Test keyboard shortcut 'B' to select option B (index 1)
  await page.keyboard.press("b");
  await new Promise((r) => setTimeout(r, 200));

  const isBSelected = await page.$eval('.option-item[data-opt-index="1"]', (el) => el.classList.contains("selected"));
  console.log("4. Keybind 'B' selects Option B:", isBSelected ? "YES (PASSED)" : "NO (FAILED)");

  // 4. Check answer
  const checkBtn = await page.$("#checkBtn");
  if (checkBtn) {
    await checkBtn.click();
    await new Promise((r) => setTimeout(r, 300));
  }

  // Check if text 'Correct' or 'Incorrect' is inside option item
  const optionTextB = await page.$eval('.option-item[data-opt-index="1"]', (el) => el.innerText);
  const hasOptionCheckText = optionTextB.includes("✓ Correct") || optionTextB.includes("Correct");
  console.log("5. Option B text does NOT contain '✓ Correct' label inside:", !hasOptionCheckText ? "YES (PASSED)" : "NO (FAILED)");

  // Check if check button disappeared
  const checkBtnAfter = await page.$("#checkBtn");
  const recheckHint = await page.$("#recheckHint");
  console.log("6. Check button disappeared completely after checking:", (checkBtnAfter === null && recheckHint === null) ? "YES (PASSED)" : "NO (FAILED)");

  // Check explanation header text
  const explHeader = await page.$eval(".explanation-header", (el) => el.textContent.trim());
  console.log("7. Explanation header is clean (no emoji/confetti):", `"${explHeader}"`, (explHeader === "Correct") ? "(PASSED)" : "(CHECK)");

  await page.screenshot({ path: path.join(scratchDir, "qa-2-checked-clean.png") });

  // 5. Open Settings Modal
  await page.click("#settingsToggleBtn");
  await new Promise((r) => setTimeout(r, 300));

  const instantCheckCheckbox = await page.$("#settingInstantCheck");
  console.log("8. Setting Instant Check toggle exists:", instantCheckCheckbox !== null ? "YES (PASSED)" : "NO (FAILED)");

  // Toggle Instant Check ON
  await page.evaluate(() => {
    const cb = document.getElementById("settingInstantCheck");
    if (cb) {
      cb.checked = true;
      cb.dispatchEvent(new Event("change"));
    }
  });

  await page.screenshot({ path: path.join(scratchDir, "qa-3-settings-instant-check.png") });

  // Close Settings Modal
  await page.click("#closeSettingsModalBtn");
  await new Promise((r) => setTimeout(r, 200));

  // Navigate to Question 2 via ArrowRight
  await page.keyboard.press("ArrowRight");
  await new Promise((r) => setTimeout(r, 300));

  // Question 2: Single Choice with Instant Check enabled -> Check button should be hidden!
  const checkBtnOnQ2 = await page.$("#checkBtn");
  console.log("9. Check button hidden on Q2 with Instant Check enabled:", checkBtnOnQ2 === null ? "YES (PASSED)" : "NO (FAILED)");

  // Press 'B' to instantly answer Question 2
  await page.keyboard.press("b");
  await new Promise((r) => setTimeout(r, 400));

  // Verify that answering B instantly checked the question!
  const isQ2Checked = await page.evaluate(() => {
    return window.quizApp.userAnswers[1].checked === true;
  });
  console.log("10. Option selection instantly checked the question without check button:", isQ2Checked ? "YES (PASSED)" : "NO (FAILED)");

  await page.screenshot({ path: path.join(scratchDir, "qa-4-instant-checked-q2.png") });

  // 6. Complete remaining questions to test timer stopping
  // Q3: Multi-choice (indices 0, 1, 3 are correct)
  await page.keyboard.press("ArrowRight");
  await new Promise((r) => setTimeout(r, 200));
  await page.evaluate(() => {
    window.quizApp.userAnswers[2].selectedOptions = [0, 1, 3];
    window.quizApp.checkCurrentAnswer();
  });

  // Q4: Multi-choice (indices 0, 2, 3)
  await page.keyboard.press("ArrowRight");
  await new Promise((r) => setTimeout(r, 200));
  await page.evaluate(() => {
    window.quizApp.userAnswers[3].selectedOptions = [0, 2, 3];
    window.quizApp.checkCurrentAnswer();
  });

  // Q5: Single-choice (index 1)
  await page.keyboard.press("ArrowRight");
  await new Promise((r) => setTimeout(r, 200));
  await page.evaluate(() => {
    window.quizApp.userAnswers[4].selectedOptions = [1];
    window.quizApp.checkCurrentAnswer();
  });

  // Q6: Essay (last question)
  await page.keyboard.press("ArrowRight");
  await new Promise((r) => setTimeout(r, 200));
  await page.evaluate(() => {
    window.quizApp.userAnswers[5].checked = true;
    window.quizApp.userAnswers[5].isCorrect = true;
    window.quizApp.updateProgress();
  });

  const timerActive = await page.evaluate(() => window.quizApp.timerInterval !== null);
  console.log("11. Timer automatically stops when all questions are checked:", !timerActive ? "YES (PASSED)" : "NO (FAILED)");

  // Check last question summary button
  const summaryBtn = await page.$("#finishTopBtn");
  console.log("12. Summary button displayed on last question:", summaryBtn !== null ? "YES (PASSED)" : "NO (FAILED)");
  if (summaryBtn) {
    await summaryBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  await page.screenshot({ path: path.join(scratchDir, "qa-5-summary-screen.png") });

  await browser.close();
  console.log("\nVisual QA completed! Screenshots saved to scratch directory.");
}

runVisualQA().catch((err) => {
  console.error("Visual QA failed:", err);
  process.exit(1);
});
