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
  const { snippetId } = await context.params;
  const json = (await request.json()) as FavoritePatchBody;

  if (typeof json.isFavorite !== "boolean") {
    return Response.json(
      { error: "Invalid payload. 'isFavorite' must be boolean." },
      { status: 400 },
    );
  }

  const snippet = await updateSnippetFavoriteService(snippetId, json.isFavorite);
  return Response.json({ data: snippet });
}
