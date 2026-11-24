/**
 * QuizFramework Data File (quiz-data.js)
 * -------------------------------------------------------------
 * PLUG & PLAY: This is the ONLY file an AI model or user needs
 * to edit or replace to generate an entirely new interactive quiz!
 * -------------------------------------------------------------
 */

window.QUIZ_CONFIG = {
  title: "AI & Economics Mastery",
  category: "Economics & Tech",
  author: "QuizFramework AI",
  timeLimitMinutes: 0,
  defaultQuestionTime: 25, // Default time per question in seconds for Time Pressure
  passingScore: 70,
  shuffleQuestions: false,
  shuffleOptions: false
};

window.QUIZ_QUESTIONS = [
  {
    id: 1,
    type: "single",
    estimatedTime: 22,
    question: "When market price is strictly above the equilibrium price ($P > P_e$), what condition exists in the market, and how does the competitive market naturally adjust?",
    options: [
      "Shortage occurs; buyers compete by bidding prices upward to $P_e$",
      "Surplus occurs; unsold inventory leads sellers to cut prices downward to $P_e$",
      "Equilibrium is maintained because supply automatically decreases",
      "Government intervention is required because price can never self-correct"
    ],
    correct: 1,
    explanation: "When $P > P_e$, quantity supplied exceeds quantity demanded ($Q_S > Q_D$), creating a market surplus. Sellers face accumulating unsold inventories and compete by lowering prices until equilibrium $P_e$ is restored."
  },
  {
    id: 2,
    type: "multiple",
    estimatedTime: 18,
    question: "Which of the following events will cause the market SUPPLY curve for electric vehicles to shift to the RIGHT? (Select all that apply)",
    options: [
      "A technological breakthrough that cuts battery manufacturing costs in half",
      "A surge in the price of lithium and cobalt raw materials",
      "Government introduces production subsidies for clean vehicle manufacturers",
      "A new regulation increasing sales tax on cars",
      "Three major new automaker factories enter the market"
    ],
    correct: [0, 2, 4],
    explanation: "Supply shifts right (increases) when unit production costs fall (cheaper battery tech), when producers receive government subsidies, or when new factories enter the market. Increased raw material prices and higher taxes shift supply left."
  },
  {
    id: 3,
    type: "multiple",
    estimatedTime: 30,
    question: "A firm sells three products with the following price elasticities of demand: Product A ($|E_D| = 2.4$), Product B ($|E_D| = 1.0$), Product C ($|E_D| = 0.5$). If the firm wants to INCREASE total revenue ($TR$), what pricing actions should it take? (Select all that apply)",
    options: [
      "Lower the price of Product A",
      "Increase the price of Product A",
      "Keep the price of Product B unchanged or adjust without revenue impact",
      "Increase the price of Product C",
      "Lower the price of Product C"
    ],
    correct: [0, 2, 3],
    explanation: "For elastic demand ($|E_D| > 1$, Product A), lowering price increases revenue ($\\% \\Delta Q > \\% \\Delta P$). For inelastic demand ($|E_D| < 1$, Product C), raising price increases revenue ($\\% \\Delta P > \\% \\Delta Q$). For unit elastic demand ($|E_D| = 1$, Product B), total revenue is already maximized."
  },
  {
    id: 4,
    type: "single",
    estimatedTime: 18,
    question: "What is the primary architectural purpose of the modern CSS `light-dark()` function?",
    options: [
      "To apply automatic brightness and contrast filters to background images based on ambient light sensors",
      "To resolve color design tokens automatically based on the computed `color-scheme` without duplicating media queries",
      "To dynamically force modern browser scrollbars and modal backdrops into high-contrast monochrome mode",
      "To execute clientside JavaScript theme switching logic asynchronously within a dedicated Web Worker thread"
    ],
    correct: 1,
    explanation: "`light-dark(lightColor, darkColor)` resolves to the first color when the element's computed `color-scheme` is light, and the second color when dark, dramatically streamlining theme token definitions."
  },
  {
    id: 5,
    type: "essay",
    estimatedTime: 45,
    question: "Explain the economic concept of opportunity cost and analyze this scenario: An engineer earning $\\$80,000$/year quits her job and uses $\\$100,000$ of her personal savings (which was earning $5\\%$ annual interest in a bank) to launch a startup. In its first year, the startup earns $\\$95,000$ in accounting profit. Has she made an economic profit?",
    hint: "Calculate both implicit opportunity costs: foregone salary and foregone interest, then subtract from accounting profit.",
    modelAnswer: "Opportunity cost is the value of the next best alternative forgone when making a decision.\n\nImplicit costs in this scenario:\n1. Foregone salary: $\\$80,000$/year\n2. Foregone bank interest: $\\$100,000 \\times 5\\% = \\$5,000$/year\nTotal Implicit Cost = $\\$80,000 + \\$5,000 = \\$85,000$/year.\n\nEconomic Profit = Accounting Profit - Implicit Opportunity Costs\nEconomic Profit = $\\$95,000 - \\$85,000 = +\\$10,000$/year.\n\nConclusion: Yes, she earned a positive economic profit of $\\$10,000$, meaning her decision to start the business was economically sound compared to her best alternative.",
    keyPoints: [
      "Defines opportunity cost as the value of the next best alternative foregone.",
      "Identifies both foregone salary ($80,000) and foregone interest ($5,000).",
      "Calculates total implicit opportunity costs ($85,000).",
      "Subtracts implicit costs from accounting profit to find economic profit (+$10,000).",
      "Concludes correctly that she earned positive economic profit."
    ],
    explanation: "Economic profit accounts for both explicit out-of-pocket expenses and hidden implicit opportunity costs of time, capital, and labor."
  },
  {
    id: 6,
    type: "essay",
    estimatedTime: 30,
    question: "In 2 to 3 sentences, describe what Chain-of-Thought (CoT) prompting is and why it improves complex reasoning in Large Language Models (LLMs).",
    hint: "Think about breaking down multi-step logic rather than jumping straight to the final answer.",
    modelAnswer: "Chain-of-Thought (CoT) prompting is a technique where an LLM is guided to generate intermediate reasoning steps before arriving at a final answer. By breaking a complex problem into sequential logical deductions, CoT allocates more compute tokens to deliberate reasoning, reducing hallucinations and drastically improving accuracy in math, logic, and multi-step tasks.",
    keyPoints: [
      "Mentions generating step-by-step or intermediate reasoning before the final answer.",
      "Explains that breaking down problems helps structured logical deduction.",
      "Notes the benefit: higher accuracy and fewer errors on complex multi-step tasks."
    ],
    explanation: "CoT allows autoregressive models to simulate deliberate working memory across intermediate token sequences."
  },
  {
    id: 7,
    type: "true_false",
    estimatedTime: 25,
    question: "Evaluate whether each of the following statements regarding **Microeconomics** and **Modern Web Architecture** is **True** or **False**:",
    statements: [
      {
        text: "A price ceiling set strictly **below** the equilibrium price ($P_{max} < P_e$) results in a persistent market **shortage** and deadweight loss ($DWL$).",
        correct: true
      },
      {
        text: "In perfectly competitive markets, individual price-taking firms face a **downward-sloping** individual demand curve.",
        correct: false
      },
      {
        text: "CSS `@property` allows custom properties to define an **explicit syntax**, inheritance behavior, and initial fallback values for smooth transitions.",
        correct: true
      },
      {
        text: "A normal good with positive income elasticity ($E_I > 0$) is automatically classified as a **luxury good**.",
        correct: false
      }
    ],
    explanation: "**Detailed Statement Breakdown:**\n1. **True**: Because price is held below equilibrium, $Q_D > Q_S$, leading to persistent shortage and misallocated resources.\n2. **False**: In perfect competition, individual firms are price takers facing an **infinitely elastic (horizontal)** demand curve ($P = MR = AR$).\n3. **True**: The `@property` at-rule registers CSS custom properties with typed syntax, inheritance control, and initial values, unlocking transitions on gradients and colors.\n4. **False**: A normal good has $E_I > 0$. It is classified as a *necessity* if $0 < E_I \\le 1$, and only classified as a *luxury good* if $E_I > 1$."
  }
];
