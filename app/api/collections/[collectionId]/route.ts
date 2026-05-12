import { requireAuthenticatedUser } from "@/lib/auth/requireUser";
import { updateCollectionSchema } from "@/lib/validators/collection";
import {
  deleteCollectionService,
  getCollectionService,
  updateCollectionService,
} from "@/server/services/collectionService";

type RouteParams = {
  params: Promise<{
    collectionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteParams) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collectionId } = await context.params;
  const result = await getCollectionService(collectionId, user.id);

  if ("error" in result) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }

  return Response.json({ data: result.collection });
}

export async function PATCH(request: Request, context: RouteParams) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collectionId } = await context.params;
  const json = await request.json();
  const parsed = updateCollectionSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid collection payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await updateCollectionService(collectionId, user.id, parsed.data);

  if ("error" in result) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }

  return Response.json({ data: result.collection });
}

export async function DELETE(_request: Request, context: RouteParams) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collectionId } = await context.params;
  const result = await deleteCollectionService(collectionId, user.id);

  if ("error" in result) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }

  return Response.json({ data: result.collection });
}
