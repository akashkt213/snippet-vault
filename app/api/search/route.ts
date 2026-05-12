import { NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/requireUser";
import { searchQuerySchema } from "@/lib/validators/search";
import { searchSnippetsService } from "@/server/services/snippetService";

export async function GET(request: NextRequest) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const parsed = searchQuerySchema.safeParse({
    q: searchParams.get("q"),
    limit: searchParams.get("limit") ?? 10,
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid query parameters", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { q, limit } = parsed.data;
  const results = await searchSnippetsService(user.id, q, limit);

  return Response.json({
    data: results,
    meta: { q, limit, count: results.length },
  });
}
