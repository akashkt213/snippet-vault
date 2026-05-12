"use client";

import { useParams } from "next/navigation";

import { SnippetFormPage } from "@/app/(dashboard)/newsnippet/page";

export default function EditSnippetPage() {
  const params = useParams<{ snippetId: string }>();

  return <SnippetFormPage mode="edit" snippetId={params.snippetId} />;
}
