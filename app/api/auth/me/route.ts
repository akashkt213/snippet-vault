import { getCurrentUserService } from "@/server/services/authService";

export async function GET() {
  const user = await getCurrentUserService();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ data: user });
}
