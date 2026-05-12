"use client";

import { useMutation } from "@tanstack/react-query";

import { ApiError, apiClient } from "@/lib/api/client";
import { AuthUserResponse } from "@/lib/types/auth";
import { SignInInput, SignUpInput } from "@/lib/validators/auth";

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const body = error.body as { error?: string } | null;
    if (body?.error) {
      return body.error;
    }
  }

  return "Something went wrong. Please try again.";
}

export function useAuthApi() {
  const signInMutation = useMutation({
    mutationFn: (input: SignInInput) =>
      apiClient.post<AuthUserResponse>("/api/auth/signin", input, {
        timeoutMs: 12_000,
        retries: 0,
      }),
  });

  const signUpMutation = useMutation({
    mutationFn: (input: SignUpInput) =>
      apiClient.post<AuthUserResponse>("/api/auth/signup", input, {
        timeoutMs: 12_000,
        retries: 0,
      }),
  });

  return { signInMutation, signUpMutation };
}
