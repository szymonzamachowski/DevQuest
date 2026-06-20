import { z } from "zod";

export const TechStackSchema = z.object({
  frontend: z.string().min(1).optional(),
  backend: z.string().min(1).optional(),
  database: z.string().min(1).optional(),
  orm: z.string().min(1).optional(),
  authentication: z.string().min(1).optional(),
  testing: z.string().min(1).optional(),
  deployment: z.string().min(1).optional(),
});

export type TechStack = z.infer<typeof TechStackSchema>;

export const STACK_OPTIONS = {
  frontend: ["Next.js", "React (Vite)", "Vue", "SvelteKit", "None"],
  backend: ["Next.js API Routes", "Node.js (Express)", "NestJS", "None (frontend only)"],
  database: ["PostgreSQL", "MySQL", "SQLite", "MongoDB", "None"],
  orm: ["Prisma", "Drizzle", "TypeORM", "None"],
  authentication: ["Auth.js", "Clerk", "Supabase Auth", "Custom JWT", "None"],
  testing: ["Vitest", "Jest", "Playwright", "Cypress", "None"],
  deployment: ["Vercel", "Railway", "Docker + VPS", "Netlify", "None"],
} as const;

export type StackCategory = keyof typeof STACK_OPTIONS;
