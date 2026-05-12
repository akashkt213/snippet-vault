"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Code2 } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { getAuthErrorMessage, useAuthApi } from "@/lib/hooks/useAuthApi";
import { getFormFieldErrors, signUpFormSchema, signUpSchema } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function formatFieldError(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return undefined;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-400">{message}</p>;
}

export default function SignupPage() {
  const router = useRouter();
  const { signUpMutation } = useAuthApi();
  const { mutateAsync: signUp, isPending } = signUpMutation;

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signUpFormSchema,
      onSubmitAsync: async ({ value }) => {
        const parsed = signUpFormSchema.safeParse(value);

        if (!parsed.success) {
          return {
            fields: getFormFieldErrors(parsed.error),
          };
        }

        const payload = signUpSchema.parse({
          name: parsed.data.name.trim() || undefined,
          email: parsed.data.email,
          password: parsed.data.password,
        });

        try {
          await signUp(payload);
        } catch (error) {
          if (error instanceof ApiError && error.status === 409) {
            return {
              fields: {
                email: getAuthErrorMessage(error),
              },
            };
          }

          return {
            fields: {
              password: getAuthErrorMessage(error),
            },
          };
        }
      },
    },
    onSubmit: async () => {
      router.push("/dashboard");
      router.refresh();
    },
  });

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
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="name"
            validators={{
              onBlur: signUpFormSchema.shape.name,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-xs font-medium tracking-[0.04em] text-ink-secondary uppercase font-mono"
                >
                  Name
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="name"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Optional display name"
                  className="border-border-base bg-surface-default text-ink-primary"
                  disabled={isPending}
                />
                <FieldError message={formatFieldError(field.state.meta.errors[0])} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onBlur: signUpFormSchema.shape.email,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-xs font-medium tracking-[0.04em] text-ink-secondary uppercase font-mono"
                >
                  Email
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="you@example.com"
                  className="border-border-base bg-surface-default text-ink-primary"
                  disabled={isPending}
                />
                <FieldError message={formatFieldError(field.state.meta.errors[0])} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onBlur: signUpFormSchema.shape.password,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-xs font-medium tracking-[0.04em] text-ink-secondary uppercase font-mono"
                >
                  Password
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="At least 8 characters"
                  className="border-border-base bg-surface-default text-ink-primary"
                  disabled={isPending}
                />
                <FieldError message={formatFieldError(field.state.meta.errors[0])} />
              </div>
            )}
          </form.Field>

          <Button
            type="submit"
            className="w-full bg-purple-950 text-purple-300 hover:bg-[#2a1a4a]"
            disabled={isPending}
          >
            {isPending ? "Creating account..." : "Create account"}
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
