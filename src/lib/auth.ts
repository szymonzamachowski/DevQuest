import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { verifyGuestToken } from "@/lib/guest-token";

import { LoginSchema } from "@/features/auth/schemas";

export function getAuthOptions(): NextAuthOptions {
  const env = getEnv();

  return {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    secret: env.AUTH_SECRET,
    pages: {
      signIn: "/login",
    },
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const parsed = LoginSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;

          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        },
      }),
      // Demo sandbox: exchanges the short-lived token from startDemoAction for a session.
      CredentialsProvider({
        id: "guest",
        name: "Guest",
        credentials: { token: { label: "Token", type: "text" } },
        async authorize(credentials) {
          const userId = credentials?.token
            ? verifyGuestToken(credentials.token, env.AUTH_SECRET)
            : null;
          if (!userId) return null;
          const user = await prisma.user.findFirst({
            where: { id: userId, isGuest: true, guestExpiresAt: { gt: new Date() } },
          });
          if (!user) return null;
          return { id: user.id, email: user.email, name: user.name, image: user.image };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user?.id) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user && token.id) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
  };
}
