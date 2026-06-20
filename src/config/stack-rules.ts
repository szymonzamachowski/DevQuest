export type StackRule = {
  id: string;
  label: string;
  when: (stack: Record<string, string | undefined>) => boolean;
  type: "strength" | "risk" | "missing" | "recommendation";
  message: string;
  scoreDelta?: number;
};

export const STACK_RULES: StackRule[] = [
  {
    id: "nextjs-fullstack",
    label: "Next.js full-stack",
    when: (s) => s.frontend === "Next.js" && (s.backend === "Next.js API Routes" || !s.backend),
    type: "strength",
    message:
      "Next.js is suitable for building both frontend and backend workflows in a smaller project.",
    scoreDelta: 8,
  },
  {
    id: "postgres-prisma",
    label: "PostgreSQL + Prisma",
    when: (s) => s.database === "PostgreSQL" && s.orm === "Prisma",
    type: "strength",
    message:
      "PostgreSQL with Prisma provides a reliable relational data layer with strong TypeScript support.",
    scoreDelta: 10,
  },
  {
    id: "authjs-next",
    label: "Auth.js with Next.js",
    when: (s) => s.authentication === "Auth.js" && s.frontend === "Next.js",
    type: "strength",
    message: "Auth.js integrates well with Next.js App Router for session-based authentication.",
    scoreDelta: 6,
  },
  {
    id: "playwright-e2e",
    label: "Playwright E2E",
    when: (s) => s.testing === "Playwright",
    type: "strength",
    message: "Playwright provides robust end-to-end coverage for critical user flows like booking.",
    scoreDelta: 8,
  },
  {
    id: "no-database",
    label: "No database selected",
    when: (s) => !s.database || s.database === "None",
    type: "risk",
    message:
      "A booking system requires persistent storage. Without a database, data integrity will be compromised.",
    scoreDelta: -15,
  },
  {
    id: "no-testing",
    label: "No testing tool",
    when: (s) => !s.testing || s.testing === "None",
    type: "risk",
    message:
      "The team selected no testing tool. Regression risk increases significantly before release.",
    scoreDelta: -12,
  },
  {
    id: "no-auth",
    label: "No authentication",
    when: (s) => !s.authentication || s.authentication === "None",
    type: "risk",
    message: "Employee dashboard and admin features typically require authentication.",
    scoreDelta: -8,
  },
  {
    id: "mongo-without-orm",
    label: "MongoDB without ORM",
    when: (s) => s.database === "MongoDB" && (!s.orm || s.orm === "None"),
    type: "risk",
    message:
      "Using MongoDB without an ORM increases schema drift risk for a structured booking domain.",
    scoreDelta: -6,
  },
  {
    id: "sqlite-production",
    label: "SQLite in production",
    when: (s) => s.database === "SQLite" && s.deployment !== "None",
    type: "risk",
    message:
      "SQLite may be insufficient for concurrent booking writes in a multi-user production environment.",
    scoreDelta: -5,
  },
  {
    id: "missing-deployment",
    label: "No deployment target",
    when: (s) => !s.deployment || s.deployment === "None",
    type: "missing",
    message:
      "No deployment provider selected. Release planning will be blocked without a target environment.",
    scoreDelta: -5,
  },
  {
    id: "missing-orm-relational",
    label: "Relational DB without ORM",
    when: (s) =>
      (s.database === "PostgreSQL" || s.database === "MySQL") && (!s.orm || s.orm === "None"),
    type: "missing",
    message:
      "A relational database without an ORM makes migrations and type-safe queries harder to maintain.",
    scoreDelta: -7,
  },
  {
    id: "recommend-playwright",
    label: "Recommend Playwright",
    when: (s) => (!s.testing || s.testing === "None") && s.frontend === "Next.js",
    type: "recommendation",
    message:
      "Add Playwright or Vitest to cover booking flow and prevent double-booking regressions.",
  },
  {
    id: "recommend-prisma",
    label: "Recommend Prisma",
    when: (s) => s.database === "PostgreSQL" && (!s.orm || s.orm === "None"),
    type: "recommendation",
    message: "Consider Prisma for schema migrations and type-safe database access.",
  },
  {
    id: "recommend-vercel",
    label: "Recommend Vercel",
    when: (s) => s.frontend === "Next.js" && (!s.deployment || s.deployment === "None"),
    type: "recommendation",
    message: "Vercel offers a low-friction deployment path for Next.js applications.",
  },
];

export const BASE_COMPATIBILITY_SCORE = 70;
