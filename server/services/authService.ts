import { cookies } from "next/headers";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearSessionCookie,
  createSession,
  deleteSession,
  getAuthenticatedUser,
  SESSION_COOKIE_NAME,
  setSessionCookie,
} from "@/lib/auth/session";
import { SignInInput, SignUpInput } from "@/lib/validators/auth";
import { createUser, findUserByEmail } from "@/server/repos/userRepo";

export async function signUpService(input: SignUpInput) {
  const email = input.email.toLowerCase();
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return { error: "EMAIL_ALREADY_EXISTS" as const };
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email,
    passwordHash,
    name: input.name,
  });

  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  return { user };
}

export async function signInService(input: SignInInput) {
  const email = input.email.toLowerCase();
  const user = await findUserByEmail(email);

  if (!user) {
    return { error: "INVALID_CREDENTIALS" as const };
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    return { error: "INVALID_CREDENTIALS" as const };
  }

  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
  };
}

export async function signOutService() {
  const user = await getAuthenticatedUser();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await deleteSession(token);
  }

  await clearSessionCookie();

  return { signedOut: true, userId: user?.id ?? null };
}

export async function getCurrentUserService() {
  return getAuthenticatedUser();
}
