import { createSnippetSchema } from "@/lib/validators/snippet";
import { createSnippetService, listSnippetsService } from "@/server/services/snippetService";

export async function GET() {
  const snippets = await listSnippetsService();
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
