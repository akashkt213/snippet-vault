import { requireAuthenticatedUser } from "@/lib/auth/requireUser";
import { updateSnippetFavoriteService } from "@/server/services/snippetService";

type FavoritePatchBody = {
  isFavorite?: unknown;
};

type RouteParams = {
  params: Promise<{
    snippetId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteParams) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { snippetId } = await context.params;
  const json = (await request.json()) as FavoritePatchBody;

  if (typeof json.isFavorite !== "boolean") {
    return Response.json(
      { error: "Invalid payload. 'isFavorite' must be boolean." },
      { status: 400 },
    );
  }

  const result = await updateSnippetFavoriteService(snippetId, user.id, json.isFavorite);

  if ("error" in result) {
    return Response.json({ error: "Snippet not found." }, { status: 404 });
  }

  return Response.json({ data: result.snippet });
}
