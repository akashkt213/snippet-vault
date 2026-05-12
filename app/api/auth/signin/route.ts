import { signInSchema } from "@/lib/validators/auth";
import { signInService } from "@/server/services/authService";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = signInSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid signin payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await signInService(parsed.data);

  if ("error" in result) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  return Response.json({ data: result.user });
}
