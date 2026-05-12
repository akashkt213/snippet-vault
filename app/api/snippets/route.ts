import { requireAuthenticatedUser } from "@/lib/auth/requireUser";
import { createSnippetSchema } from "@/lib/validators/snippet";
import { createSnippetService, listSnippetsService } from "@/server/services/snippetService";

export async function GET(request: Request) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("collectionId") ?? undefined;
  const snippets = await listSnippetsService(user.id, collectionId);
  return Response.json({ data: snippets });
}

export async function POST(request: Request) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = createSnippetSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid snippet payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await createSnippetService(parsed.data, user.id);

  if ("error" in result) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }

  return Response.json({ data: result.snippet }, { status: 201 });
}
