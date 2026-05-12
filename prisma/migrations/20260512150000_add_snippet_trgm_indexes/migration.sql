CREATE INDEX IF NOT EXISTS "Snippet_title_trgm_idx"
  ON "Snippet" USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Snippet_description_trgm_idx"
  ON "Snippet" USING gin (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Snippet_language_trgm_idx"
  ON "Snippet" USING gin (language gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Snippet_code_trgm_idx"
  ON "Snippet" USING gin (code gin_trgm_ops);

CREATE OR REPLACE FUNCTION "immutable_array_to_string"(text[], text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$ SELECT COALESCE(array_to_string($1, $2), ''); $$;

CREATE INDEX IF NOT EXISTS "Snippet_tags_trgm_idx"
  ON "Snippet" USING gin ("immutable_array_to_string"(tags, ' ') gin_trgm_ops);
