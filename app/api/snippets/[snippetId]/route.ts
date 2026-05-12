import { requireAuthenticatedUser } from "@/lib/auth/requireUser";
import { updateSnippetSchema } from "@/lib/validators/snippet";
import {
  deleteSnippetService,
  getSnippetService,
  updateSnippetService,
} from "@/server/services/snippetService";

type RouteParams = {
  params: Promise<{
    snippetId: string;
  }>;
};

export async function GET(_request: Request, context: RouteParams) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { snippetId } = await context.params;
  const result = await getSnippetService(snippetId, user.id);

  if ("error" in result) {
    return Response.json({ error: "Snippet not found." }, { status: 404 });
  }

  return Response.json({ data: result.snippet });
}

export async function PATCH(request: Request, context: RouteParams) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { snippetId } = await context.params;
  const json = await request.json();
  const parsed = updateSnippetSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid snippet payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await updateSnippetService(snippetId, user.id, parsed.data);

  if ("error" in result) {
    if (result.error === "COLLECTION_NOT_FOUND") {
      return Response.json({ error: "Collection not found." }, { status: 404 });
    }

    return Response.json({ error: "Snippet not found." }, { status: 404 });
  }

  return Response.json({ data: result.snippet });
}

export async function DELETE(_request: Request, context: RouteParams) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { snippetId } = await context.params;
  const result = await deleteSnippetService(snippetId, user.id);

  if ("error" in result) {
    return Response.json({ error: "Snippet not found." }, { status: 404 });
  }

  return Response.json({ data: result.snippet });
}
