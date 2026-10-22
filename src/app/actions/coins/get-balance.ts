"use server";

import prisma from "@/lib/clients/prisma-client";
import { auth } from "@clerk/nextjs/server";


export async function getCoinBalance(): Promise<number | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { coinBalance: true },
  });

  return user?.coinBalance ?? null;
}