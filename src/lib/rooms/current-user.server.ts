// src/lib/rooms/current-user.server.ts
import "server-only";

import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/clients/prisma-client";

export async function getCurrentUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;
  return prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, name: true },
  });
}