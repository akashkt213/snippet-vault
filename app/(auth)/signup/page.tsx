"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Code2 } from "lucide-react";

import { ApiError, apiClient } from "@/lib/api/client";
import { AuthUserResponse } from "@/lib/types/auth";
import { signUpSchema } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const body = error.body as { error?: string } | null;
    if (body?.error) {
      return body.error;
    }
  }

  return "Something went wrong. Please try again.";
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsed = signUpSchema.safeParse({
      name: name.trim() || undefined,
      email,
      password,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post<AuthUserResponse>("/api/auth/signup", parsed.data, {
        timeoutMs: 12_000,
        retries: 0,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border-base bg-surface-shell text-ink-primary shadow-none ring-0">
      <CardHeader className="space-y-4 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-[#3d2f6e] bg-purple-950">
            <Code2 size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.08em] text-purple-300 uppercase font-mono">
              SnippetVault
            </p>
            <CardDescription className="text-ink-muted">
              Create an account to save snippets.
            </CardDescription>
          </div>
        </div>
        <CardTitle className="text-xl text-ink-primary">Create your account</CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-[0.04em] text-ink-secondary uppercase font-mono">
              Name
            </label>
            <Input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Optional display name"
              className="border-border-base bg-surface-default text-ink-primary"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium tracking-[0.04em] text-ink-secondary uppercase font-mono">
              Email
            </label>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="border-border-base bg-surface-default text-ink-primary"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium tracking-[0.04em] text-ink-secondary uppercase font-mono">
              Password
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="border-border-base bg-surface-default text-ink-primary"
              disabled={isSubmitting}
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <Button
            type="submit"
            className="w-full bg-purple-950 text-purple-300 hover:bg-[#2a1a4a]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-300 hover:text-[#ddd6fe]">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
