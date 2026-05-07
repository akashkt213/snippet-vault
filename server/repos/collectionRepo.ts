import { prisma } from "@/lib/db/prisma";
import { CreateCollectionInput } from "@/lib/validators/collection";

export async function createCollection(input: CreateCollectionInput) {
  return prisma.collection.create({
    data: {
      name: input.name,
      description: input.description,
    },
  });
}

export async function listCollections() {
  const collections = await prisma.collection.findMany({
    include: {
      _count: {
        select: {
          snippets: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    description: collection.description,
    snippetCount: collection._count.snippets,
  }));
}
