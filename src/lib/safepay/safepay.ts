import { Safepay } from "@sfpy/node-sdk";
import { createHmac, timingSafeEqual } from "node:crypto";

type SafepayOptions = ConstructorParameters<typeof Safepay>[0];
type SafepayEnvironment = SafepayOptions["environment"];

function env(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function resolveEnvironment(): SafepayEnvironment {
  const value = process.env.SAFEPAY_ENV;

  if (value !== "production" && value !== "sandbox") {
    throw new Error('Invalid SAFEPAY_ENV. Expected "production" or "sandbox".');
  }

  // The SDK's type isn't exported, so it can't be matched structurally.
  // These runtime values must match what the SDK expects (see note below).
  return value as unknown as SafepayEnvironment;
}

let client: Safepay | null = null;

/**
 * Lazily initialize Safepay so missing credentials do not break next build.
 * The client is initialized only when a request needs it.
 */
export function getSafepay(): Safepay {
  if (!client) {
    client = new Safepay({
      environment: resolveEnvironment(),
      apiKey: env("SAFEPAY_API_KEY"),
      v1Secret: env("SAFEPAY_V1_SECRET"),
      webhookSecret: env("SAFEPAY_WEBHOOK_SECRET"),
    });
  }

  return client;
}

/**
 * Validate the browser redirect signature using HMAC-SHA256.
 * The webhook remains the primary payment confirmation mechanism.
 */
export function isValidRedirectSignature(
  tracker: string,
  signature: string,
): boolean {
  try {
    const expected = createHmac("sha256", env("SAFEPAY_V1_SECRET"))
      .update(tracker)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const signatureBuffer = Buffer.from(signature, "hex");

    return (
      expectedBuffer.length === signatureBuffer.length &&
      timingSafeEqual(expectedBuffer, signatureBuffer)
    );
  } catch {
    return false;
  }
}