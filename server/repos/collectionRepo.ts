import { prisma } from "@/lib/db/prisma";
import { CreateCollectionInput } from "@/lib/validators/collection";

type CollectionWithSnippetCount = {
  id: string;
  name: string;
  description: string | null;
  snippetCount: number;
};

function toCollectionWithSnippetCount(collection: {
  id: string;
  name: string;
  description: string | null;
  _count: {
    snippets: number;
  };
}): CollectionWithSnippetCount {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    snippetCount: collection._count.snippets,
  };
}

export async function createCollection(input: CreateCollectionInput, userId: string) {
  const collection = await prisma.collection.create({
    data: {
      name: input.name,
      description: input.description,
      userId,
    },
    include: {
      _count: {
        select: {
          snippets: true,
        },
      },
    },
  });

  return toCollectionWithSnippetCount(collection);
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

  return collections.map((collection) => toCollectionWithSnippetCount(collection));
}

export async function findCollectionForUser(collectionId: string, userId: string) {
  return prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
  });
}

export async function getCollectionById(collectionId: string, userId: string) {
  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
    include: {
      _count: {
        select: {
          snippets: true,
        },
      },
    },
  });

  if (!collection) {
    return null;
  }

  return toCollectionWithSnippetCount(collection);
}

export async function updateCollection(
  collectionId: string,
  userId: string,
  input: {
    name?: string;
    description?: string;
  },
) {
  const collection = await prisma.collection.update({
    where: {
      id: collectionId,
      userId,
    },
    data: input,
    include: {
      _count: {
        select: {
          snippets: true,
        },
      },
    },
  });

  return toCollectionWithSnippetCount(collection);
}

export async function deleteCollection(collectionId: string, userId: string) {
  const collection = await prisma.collection.delete({
    where: {
      id: collectionId,
      userId,
    },
    include: {
      _count: {
        select: {
          snippets: true,
        },
      },
    },
  });

  return toCollectionWithSnippetCount(collection);
}
