import { execSync } from "node:child_process";

export default async function globalSetup() {
  if (process.env.E2E_SKIP_SEED === "1") return;

  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  execSync("npx prisma db seed", { stdio: "inherit" });
}
