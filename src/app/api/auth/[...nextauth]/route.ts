import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

import { getAuthOptions } from "@/lib/auth";

function getHandler() {
  return NextAuth(getAuthOptions());
}

export function GET(req: NextRequest) {
  return getHandler()(req);
}

export function POST(req: NextRequest) {
  return getHandler()(req);
}
