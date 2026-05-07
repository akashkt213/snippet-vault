import { createSnippetSchema } from "@/lib/validators/snippet";
import { createSnippetService, listSnippetsService } from "@/server/services/snippetService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("collectionId") ?? undefined;
  const snippets = await listSnippetsService(collectionId);
  return Response.json({ data: snippets });
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createSnippetSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid snippet payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const snippet = await createSnippetService(parsed.data);
  return Response.json({ data: snippet }, { status: 201 });
}
