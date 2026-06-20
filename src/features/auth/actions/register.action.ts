"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { RegisterSchema } from "@/features/auth/schemas";
import { checkRateLimit } from "@/lib/rate-limit";

export type RegisterState =
  | { ok: true }
  | {
      ok: false;
      fieldErrors?: Record<string, string[]>;
      formError?: string;
    };

export async function registerAction(_: RegisterState, formData: FormData): Promise<RegisterState> {
  const raw = {
    name: (formData.get("name") || undefined) as string | undefined,
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    confirmPassword: String(formData.get("confirmPassword") || ""),
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";
  const rate = checkRateLimit(`register:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rate.allowed) {
    return { ok: false, formError: "Too many registration attempts. Please try again later." };
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, formError: "Email already registered" };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name: name || null,
      email,
      passwordHash,
    },
  });

  redirect("/login?registered=1");
}
