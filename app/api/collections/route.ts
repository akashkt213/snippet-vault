import { createCollectionSchema } from "@/lib/validators/collection";
import { createCollectionService, listCollectionsService } from "@/server/services/collectionService";

export async function GET() {
  const collections = await listCollectionsService();
  return Response.json({ data: collections });
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createCollectionSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid collection payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const collection = await createCollectionService(parsed.data);
  return Response.json({ data: collection }, { status: 201 });
}
