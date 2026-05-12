import { CreateCollectionInput } from "@/lib/validators/collection";
import {
  createCollection,
  findCollectionForUser,
  listCollections,
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
