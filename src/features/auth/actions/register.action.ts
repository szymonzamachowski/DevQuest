"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { RegisterSchema } from "@/features/auth/schemas";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

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

  const rate = await checkRateLimit(await clientKey("register"), {
    limit: 5,
    windowMs: 60_000,
  });
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
