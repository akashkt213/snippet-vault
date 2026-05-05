export type SearchSnippetResult = {
  id: string;
  title: string;
  description: string | null;
  language: string;
  tags: string[];
  collectionId: string;
};
