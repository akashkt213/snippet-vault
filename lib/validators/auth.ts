import { z } from "zod";

export const signInEmailSchema = z
  .string()
  .trim()
  .min(1, "email is required")
  .email("invalid email")
  .max(255);

export const signInPasswordSchema = z
  .string()
  .min(1, "Password is Required")
  .min(
    8,
    "password must be a combination of capital small letters and special character with min length of 8 characters",
  )
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/,
    "password must be a combination of capital small letters and special character with min length of 8 characters",
  )
  .max(128);

export const signInSchema = z.object({
  email: signInEmailSchema,
  password: signInPasswordSchema,
});

export const signUpSchema = z.object({
  email: signInEmailSchema,
  password: signInPasswordSchema,
  name: z.string().trim().min(1).max(80).optional(),
});

export const signUpFormSchema = z.object({
  name: z.string().trim().max(80),
  email: signInEmailSchema,
  password: signInPasswordSchema,
});

export function getFormFieldErrors(error: z.ZodError) {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors).flatMap(([field, messages]) =>
      messages?.[0] ? [[field, messages[0]]] : [],
    ),
  );
}

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
