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
  return prisma.collection.findMany({
    orderBy: { updatedAt: "desc" },
  });
}
