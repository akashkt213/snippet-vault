import type { AuthenticatedUser } from "@/lib/auth/session";

export function getUserLabel(user: Pick<AuthenticatedUser, "email" | "name">) {
  if (user.name?.trim()) {
    return user.name.trim();
  }

  const [localPart] = user.email.split("@");
  return localPart || user.email;
}
