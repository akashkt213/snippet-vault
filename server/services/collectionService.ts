import { CreateCollectionInput } from "@/lib/validators/collection";
import { createCollection, listCollections } from "@/server/repos/collectionRepo";

export async function createCollectionService(input: CreateCollectionInput) {
  return createCollection(input);
}

export async function listCollectionsService() {
  return listCollections();
}
