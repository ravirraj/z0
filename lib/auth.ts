import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/lib/db/connection";
import * as schema from "@/lib/db/schema";

const isDevelopment = process.env.NODE_ENV === "development";

function getSecret(): string {
  const secret =
    process.env.BETTER_AUTH_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    "";

  if (secret) {
    return secret;
  }

  if (isDevelopment) {
    console.warn(
      "⚠️  BETTER_AUTH_SECRET not found. Using default secret for development.\n" +
        "For production, please set BETTER_AUTH_SECRET in your environment variables.\n",
    );
    return "dev-secret-key-not-for-production";
  }

  throw new Error(
    "BETTER_AUTH_SECRET (or AUTH_SECRET) is required. Generate one with: openssl rand -base64 32",
  );
}

function createAuthInstance() {
  if (!db) {
    throw new Error("Database not initialized. Ensure POSTGRES_URL is set.");
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!(googleClientId && googleClientSecret)) {
    console.warn(
      "⚠️  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set. " +
        "Google sign-in is disabled until they are configured.",
    );
  }

  return betterAuth({
    secret: getSecret(),
    baseURL: process.env.BETTER_AUTH_URL || undefined,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      autoSignIn: true,
    },
    socialProviders: {
      ...(googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : {}),
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
  });
}

type AuthInstance = ReturnType<typeof createAuthInstance>;

let instance: AuthInstance | null = null;

/**
 * Lazily creates (and caches) the Better Auth instance.
 * Lazy so importing this module never throws during builds without env vars.
 */
export function getAuth(): AuthInstance {
  if (!instance) {
    instance = createAuthInstance();
  }

  return instance;
}
