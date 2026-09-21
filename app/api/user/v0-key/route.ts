import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  clearUserV0ApiKey,
  getUserById,
  hasUserV0ApiKey,
  setUserV0ApiKey,
} from "@/lib/db/queries";
import { createV0Client } from "@/lib/v0-client";

/**
 * Validates a v0 API key by calling the v0 API through the official SDK.
 * Uses the lightweight `user.get()` endpoint and accepts any key format
 * the SDK itself accepts (no prefix/regex assumptions).
 */
async function validateV0ApiKey(key: string): Promise<boolean> {
  const trimmed = key.trim();

  if (!trimmed) {
    return false;
  }

  try {
    await createV0Client(trimmed).user.get();
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const [hasKey, user] = await Promise.all([
      hasUserV0ApiKey({ userId: session.user.id }),
      getUserById(session.user.id),
    ]);

    return NextResponse.json({
      hasKey,
      lastUpdatedAt: user?.v0_api_key_updated_at ?? null,
    });
  } catch (error) {
    if (isByokMigrationError(error)) {
      return migrationRequiredResponse();
    }
    throw error;
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const apiKey = body?.apiKey;

    if (typeof apiKey !== "string" || !(await validateV0ApiKey(apiKey))) {
      return NextResponse.json(
        { error: "Invalid v0 API key" },
        { status: 400 },
      );
    }

    await setUserV0ApiKey({ userId: session.user.id, apiKey: apiKey.trim() });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isByokMigrationError(error)) {
      return migrationRequiredResponse();
    }
    throw error;
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    await clearUserV0ApiKey({ userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isByokMigrationError(error)) {
      return migrationRequiredResponse();
    }
    throw error;
  }
}

function isByokMigrationError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("v0_api_key_encrypted") ||
    message.includes("v0_api_key_iv") ||
    message.includes("v0_api_key_updated_at")
  );
}

function migrationRequiredResponse() {
  return NextResponse.json(
    {
      error:
        "Database migration required. Run `pnpm db:migrate` and restart the app.",
      code: "migration_required",
    },
    { status: 503 },
  );
}
