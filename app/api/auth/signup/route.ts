import { signInSchema, signUpSchema } from "@/lib/validators/auth";
import { signInService, signUpService } from "@/server/services/authService";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = signUpSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid signup payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await signUpService(parsed.data);

  if ("error" in result) {
    return Response.json({ error: "Email is already registered." }, { status: 409 });
  }

  return Response.json({ data: result.user }, { status: 201 });
}
