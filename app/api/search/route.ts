import { NextRequest } from "next/server";
import { searchQuerySchema } from "@/lib/validators/search";
import { searchSnippetsService } from "@/server/services/snippetService";

export async function GET(request: NextRequest) {
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
  const results = await searchSnippetsService(q, limit);

  return Response.json({
    data: results,
    meta: { q, limit, count: results.length },
  });
}
