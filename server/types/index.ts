export type SearchSnippetResult = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
  collectionId: string;
  createdAt: Date;
  updatedAt: Date;
};
