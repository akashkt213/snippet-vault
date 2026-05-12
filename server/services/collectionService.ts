import { CreateCollectionInput, UpdateCollectionInput } from "@/lib/validators/collection";
import {
  createCollection,
  deleteCollection,
  findCollectionForUser,
  getCollectionById,
  listCollections,
  updateCollection,
} from "@/server/repos/collectionRepo";

export async function createCollectionService(input: CreateCollectionInput, userId: string) {
  return createCollection(input, userId);
}

export async function listCollectionsService(userId: string) {
  return listCollections(userId);
}

export async function getCollectionForUserService(collectionId: string, userId: string) {
  return findCollectionForUser(collectionId, userId);
}

export async function getCollectionService(collectionId: string, userId: string) {
  const collection = await getCollectionById(collectionId, userId);

  if (!collection) {
    return { error: "COLLECTION_NOT_FOUND" as const };
  }

  return { collection };
}

export async function updateCollectionService(
  collectionId: string,
  userId: string,
  input: UpdateCollectionInput,
) {
  try {
    const collection = await updateCollection(collectionId, userId, input);
    return { collection };
  } catch {
    return { error: "COLLECTION_NOT_FOUND" as const };
  }
}

export async function deleteCollectionService(collectionId: string, userId: string) {
  try {
    const collection = await deleteCollection(collectionId, userId);
    return { collection };
  } catch {
    return { error: "COLLECTION_NOT_FOUND" as const };
  }
}
