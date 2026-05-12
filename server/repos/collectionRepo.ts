import { prisma } from "@/lib/db/prisma";
import { CreateCollectionInput } from "@/lib/validators/collection";

export async function createCollection(input: CreateCollectionInput, userId: string) {
  return prisma.collection.create({
    data: {
      name: input.name,
      description: input.description,
      userId,
    },
  });
}

export async function listCollections(userId: string) {
  const collections = await prisma.collection.findMany({
    where: { userId },
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

export async function findCollectionForUser(collectionId: string, userId: string) {
  return prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
  });
}
