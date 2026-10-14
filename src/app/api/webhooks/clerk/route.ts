// src/app/api/webhooks/clerk/route.ts

import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

import { ADMIN_EMAILS } from "@/lib/admin-emails";
import prisma from "@/lib/clients/prisma-client";


function getPrimaryEmail(data: {
  email_addresses?: Array<{
    id: string;
    email_address: string;
  }>;
  primary_email_address_id?: string | null;
}): string | null {
  const email =
    data.email_addresses?.find(
      (item) => item.id === data.primary_email_address_id,
    )?.email_address ??
    data.email_addresses?.[0]?.email_address ??
    null;

  return email?.trim().toLowerCase() ?? null;
}

function getFullName(data: {
  first_name?: string | null;
  last_name?: string | null;
}): string {
  return (
    `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() ||
    "NARRO User"
  );
}

function isAdminEmail(email: string | null): boolean {
  if (!email) return false;

  return ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.trim().toLowerCase() === email,
  );
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!secret) {
    console.error(
      "[NARRO Clerk Webhook] Missing CLERK_WEBHOOK_SIGNING_SECRET",
    );

    return new Response("Webhook secret is not configured", {
      status: 500,
    });
  }

  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", {
      status: 400,
    });
  }

  const payload = await req.text();

  let event: WebhookEvent;

  try {
    const webhook = new Webhook(secret);

    webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    event = JSON.parse(payload) as WebhookEvent;
  } catch (error) {
    console.error(
      "[NARRO Clerk Webhook] Verification or parsing failed:",
      error,
    );

    return new Response("Invalid webhook", {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const data = event.data;
        const email = getPrimaryEmail(data);
        const name = getFullName(data);
        const admin = isAdminEmail(email);

        await prisma.user.upsert({
          where: {
            clerkUserId: data.id,
          },
          update: {
            name,
            email,
            imageUrl: data.image_url ?? null,
          },
          create: {
            clerkUserId: data.id,
            name,
            email,
            imageUrl: data.image_url ?? null,
            status: "OFFLINE",
          },
        });

        console.log("[NARRO Clerk Webhook] User synced:", {
          clerkUserId: data.id,
          isAdmin: admin,
        });

        break;
      }

      case "session.created": {
        const data = event.data;

        await prisma.user.updateMany({
          where: {
            clerkUserId: data.user_id,
          },
          data: {
            lastSeenAt: new Date(),
          },
        });

        console.log(
          "[NARRO Clerk Webhook] Login recorded:",
          data.user_id,
        );

        break;
      }

      case "user.deleted": {
        const data = event.data;

        if (data.id) {
          await prisma.user.deleteMany({
            where: {
              clerkUserId: data.id,
            },
          });

          console.log(
            "[NARRO Clerk Webhook] User deleted:",
            data.id,
          );
        }

        break;
      }

      default:
        break;
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "[NARRO Clerk Webhook] Database error:",
      error,
    );

    return new Response("Webhook processing failed", {
      status: 500,
    });
  }
}
