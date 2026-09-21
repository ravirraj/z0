import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null | undefined;
}

export interface Session {
  user: SessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

/**
 * Returns the current Better Auth session, or null when signed out.
 * Drop-in replacement for the previous NextAuth `auth()` helper, so all
 * existing `session?.user?.id` call sites keep working.
 */
export async function auth(): Promise<Session | null> {
  const result = await getAuth().api.getSession({
    headers: await headers(),
  });

  if (!result) {
    return null;
  }

  return result as Session;
}
