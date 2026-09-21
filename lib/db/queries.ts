import "server-only";

import { and, count, desc, eq, gte } from "drizzle-orm";
import { decryptV0ApiKey, encryptV0ApiKey } from "@/lib/v0-key-crypto";
import db from "./connection";
import { chat_ownerships, type User, user } from "./schema";

/**
 * Gets the database instance, throwing if not initialized.
 * @throws Error if POSTGRES_URL is not set
 */
function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Ensure POSTGRES_URL is set.");
  }

  return db;
}

/** Retrieves a user by ID, including BYOK fields. */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const [found] = await getDb()
      .select()
      .from(user)
      .where(eq(user.id, userId));

    return found ?? null;
  } catch (error) {
    console.error("Failed to get user by ID from database");
    throw error;
  }
}

/** Stores encrypted v0 API key for a user. */
export async function setUserV0ApiKey({
  userId,
  apiKey,
}: {
  userId: string;
  apiKey: string;
}): Promise<void> {
  try {
    const { encrypted, iv } = encryptV0ApiKey(apiKey);

    await getDb()
      .update(user)
      .set({
        v0_api_key_encrypted: encrypted,
        v0_api_key_iv: iv,
        v0_api_key_updated_at: new Date(),
      })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to set user v0 API key in database");
    throw error;
  }
}

/** Clears stored v0 API key for a user. */
export async function clearUserV0ApiKey({
  userId,
}: {
  userId: string;
}): Promise<void> {
  try {
    await getDb()
      .update(user)
      .set({
        v0_api_key_encrypted: null,
        v0_api_key_iv: null,
        v0_api_key_updated_at: null,
      })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to clear user v0 API key in database");
    throw error;
  }
}

/** Returns whether a user has a stored v0 API key. */
export async function hasUserV0ApiKey({
  userId,
}: {
  userId: string;
}): Promise<boolean> {
  const found = await getUserById(userId);
  return Boolean(found?.v0_api_key_encrypted && found?.v0_api_key_iv);
}

/** Decrypts and returns the stored v0 API key for a user. */
export async function getUserV0ApiKey({
  userId,
}: {
  userId: string;
}): Promise<string | null> {
  const found = await getUserById(userId);

  if (!(found?.v0_api_key_encrypted && found?.v0_api_key_iv)) {
    return null;
  }

  return decryptV0ApiKey({
    encrypted: found.v0_api_key_encrypted,
    iv: found.v0_api_key_iv,
  });
}

/** Creates a mapping between a v0 chat ID and a user ID. */
export async function createChatOwnership({
  v0ChatId,
  userId,
}: {
  v0ChatId: string;
  userId: string;
}) {
  try {
    return await getDb()
      .insert(chat_ownerships)
      .values({
        v0_chat_id: v0ChatId,
        user_id: userId,
      })
      .onConflictDoNothing({ target: chat_ownerships.v0_chat_id });
  } catch (error) {
    console.error("Failed to create chat ownership in database");
    throw error;
  }
}

/** Gets the ownership record for a v0 chat ID. */
export async function getChatOwnership({ v0ChatId }: { v0ChatId: string }) {
  try {
    const [ownership] = await getDb()
      .select()
      .from(chat_ownerships)
      .where(eq(chat_ownerships.v0_chat_id, v0ChatId));
    return ownership;
  } catch (error) {
    console.error("Failed to get chat ownership from database");
    throw error;
  }
}

/** Gets all chat IDs owned by a user, sorted by creation date (newest first). */
export async function getChatIdsByUserId({
  userId,
}: {
  userId: string;
}): Promise<string[]> {
  try {
    const ownerships = await getDb()
      .select({ v0ChatId: chat_ownerships.v0_chat_id })
      .from(chat_ownerships)
      .where(eq(chat_ownerships.user_id, userId))
      .orderBy(desc(chat_ownerships.created_at));

    return ownerships.map((o: { v0ChatId: string }) => o.v0ChatId);
  } catch (error) {
    console.error("Failed to get chat IDs by user from database");
    throw error;
  }
}

/** Deletes the ownership record for a v0 chat ID. */
export async function deleteChatOwnership({ v0ChatId }: { v0ChatId: string }) {
  try {
    return await getDb()
      .delete(chat_ownerships)
      .where(eq(chat_ownerships.v0_chat_id, v0ChatId));
  } catch (error) {
    console.error("Failed to delete chat ownership from database");
    throw error;
  }
}

/**
 * Gets the number of chats created by a user in the specified time window.
 * Used for rate limiting authenticated users.
 */
export async function getChatCountByUserId({
  userId,
  differenceInHours,
}: {
  userId: string;
  differenceInHours: number;
}): Promise<number> {
  try {
    const hoursAgo = new Date(Date.now() - differenceInHours * 60 * 60 * 1000);

    const [stats] = await getDb()
      .select({ count: count(chat_ownerships.id) })
      .from(chat_ownerships)
      .where(
        and(
          eq(chat_ownerships.user_id, userId),
          gte(chat_ownerships.created_at, hoursAgo),
        ),
      );

    return stats?.count || 0;
  } catch (error) {
    console.error("Failed to get chat count by user from database");
    throw error;
  }
}
