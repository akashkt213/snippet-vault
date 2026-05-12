import { getAuthenticatedUser } from "@/lib/auth/session";

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  return user;
}
