/**
 * QuizFramework Data File (quiz-data.js)
 * -------------------------------------------------------------
 * PLUG & PLAY: This is the ONLY file an AI model or user needs
 * to edit or replace to generate an entirely new interactive quiz!
 * -------------------------------------------------------------
 */

window.QUIZ_CONFIG = {
  title: "QuizFramework Test Sample",
  category: "Testing & Feature Demo",
  author: "QuizFramework Test Suite",
  timeLimitMinutes: 0,
  defaultQuestionTime: 20, // Default time per question in seconds for Time Pressure
  passingScore: 70,
  shuffleQuestions: false,
  shuffleOptions: false
};

window.QUIZ_QUESTIONS = [
  {
    id: 1,
    type: "single",
    estimatedTime: 18,
    question: "**[Sample Test] Single Choice:** Which of the following is an additive primary color in RGB displays?",
    options: [
      "Yellow pigment light",
      "Green spectrum light",
      "Purple spectrum light",
      "Orange pigment light"
    ],
    correct: 1,
    explanation: "In additive RGB color models used by digital screens, the primary colors are red, green, and blue. Green is one of the three primary light colors."
  },
  {
    id: 2,
    type: "multiple",
    estimatedTime: 20,
    question: "**[Sample Test] Multi-Choice:** Which technologies run natively inside standard web browsers? (Select all that apply)",
    options: [
      "HTML markup structure",
      "CSS stylesheet rules",
      "Native Python runtime",
      "JavaScript script engine"
    ],
    correct: [0, 1, 3],
    explanation: "HTML, CSS, and JavaScript run natively in modern browsers. Python requires an external server runtime or a WebAssembly binary interpreter."
  },
  {
    id: 3,
    type: "true_false",
    estimatedTime: 18,
    question: "**[Sample Test] True / False:** Evaluate whether each statement about computer architecture is True or False:",
    statements: [
      {
        text: "RAM provides volatile memory that clears when the computer is powered off.",
        correct: true
      },
      {
        text: "Solid State Drives (SSDs) read data using spinning mechanical platters.",
        correct: false
      },
      {
        text: "The CPU executes arithmetic, logical, and control instructions.",
        correct: true
      }
    ],
    explanation: "RAM is volatile fast temporary storage. SSDs use non-volatile flash memory without moving parts. The CPU carries out instructions and logical computations."
  },
  {
    id: 4,
    type: "single",
    estimatedTime: 20,
    question: "**[Sample Test] Math & KaTeX:** Given the linear equation $2x + 6 = 14$, what is the value of $x$?",
    options: [
      "The value is $x = 2$",
      "The value is $x = 3$",
      "The value is $x = 4$",
      "The value is $x = 5$"
    ],
    correct: 2,
    explanation: "Subtracting $6$ from both sides gives $2x = 8$. Dividing both sides by $2$ yields $$x = 4$$. KaTeX formats both inline and display math equations."
  },
  {
    id: 5,
    type: "single",
    estimatedTime: 18,
    question: "**[Sample Test] Code Snippet:** What string value is returned by the following JavaScript expression?",
    code: "console.log(typeof 42);",
    options: [
      "The string \"number\"",
      "The string \"integer\"",
      "The string \"numeric\"",
      "The string \"object\""
    ],
    correct: 0,
    explanation: "JavaScript represents integer and floating-point values as numbers. The `typeof` operator evaluates numbers to the primitive string `\"number\"`."
  },
  {
    id: 6,
    type: "essay",
    estimatedTime: 25,
    question: "**[Sample Test] Essay & Rubric:** In 1 to 2 sentences, explain the primary difference between HTTP GET and POST methods.",
    hint: "Consider purpose, idempotency, and where request parameters or payloads are carried.",
    modelAnswer: "GET is an idempotent method used to retrieve data from a server, passing parameters within the URL query string. POST transmits payload data in the request body to create or process resources, and is non-idempotent.",
    keyPoints: [
      "Identifies GET for retrieving resources and POST for submitting/creating data.",
      "Mentions parameter location: GET uses URL queries, while POST includes a body payload.",
      "Notes idempotency: GET requests do not alter server state, whereas POST requests can."
    ],
    explanation: "GET is safe and idempotent for resource fetching, while POST carries request bodies to alter or create resources on the server."
  },
  {
    id: 7,
    type: "single",
    estimatedTime: 18,
    question: "**[Sample Test] Single Choice:** What is the average time complexity of Binary Search on a sorted array of size $n$?",
    options: [
      "Quadratic complexity $O(n^2)$",
      "Linear complexity $O(n)$",
      "Linearithmic complexity $O(n \\log n)$",
      "Logarithmic complexity $O(\\log n)$"
    ],
    correct: 3,
    explanation: "Binary search eliminates half of the remaining elements in each step, giving an average and worst-case time complexity of $O(\\log n)$."
  },
  {
    id: 8,
    type: "multiple",
    estimatedTime: 20,
    question: "**[Sample Test] Multi-Choice:** Which of the following are valid built-in Git CLI commands? (Select all that apply)",
    options: [
      "git commit",
      "git branch",
      "git upload",
      "git status"
    ],
    correct: [0, 1, 3],
    explanation: "`git commit`, `git branch`, and `git status` are standard Git commands. Uploading changes to a remote repository is performed using `git push`."
  },
  {
    id: 9,
    type: "true_false",
    estimatedTime: 18,
    question: "**[Sample Test] True / False:** Evaluate whether each networking and web protocol statement is True or False:",
    statements: [
      {
        text: "HTTPS encrypts network traffic between client and server using TLS encryption.",
        correct: true
      },
      {
        text: "DNS translates human-readable domain names into numerical IP addresses.",
        correct: true
      },
      {
        text: "HTTP response status code 404 indicates a successful request completion.",
        correct: false
      }
    ],
    explanation: "HTTPS secures communication via TLS. DNS maps domain names to IP addresses. HTTP status 404 indicates resource 'Not Found', whereas 200 represents success."
  },
  {
    id: 10,
    type: "essay",
    estimatedTime: 25,
    question: "**[Sample Test] Essay & Rubric:** In 1 to 2 sentences, explain the fundamental difference between relational (SQL) and non-relational (NoSQL) databases.",
    hint: "Focus on schema structure and data modeling paradigms.",
    modelAnswer: "Relational databases enforce predefined structured schemas with tabular relations and SQL querying. Non-relational databases store unstructured or semi-structured data using flexible models such as documents, key-values, or graphs.",
    keyPoints: [
      "Mentions predefined tabular schemas and SQL for relational databases.",
      "Mentions flexible, dynamic schema-less models (documents, key-values) for NoSQL databases.",
      "Contrasts strict relational integrity with flexible unstructured storage."
    ],
    explanation: "Relational databases prioritize schema rigor and tabular relationships, whereas NoSQL systems offer dynamic flexible schemas for varied data structures."
  }
];
