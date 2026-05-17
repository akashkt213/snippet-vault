"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import hljs from "highlight.js";

// ── CodeMirror ────────────────────────────────────────────────────────────────
import CodeMirror from "@uiw/react-codemirror";
import { EditorState } from "@codemirror/state";
import { indentUnit } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Undo2,
  Redo2,
  X,
  Save,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { getLangExtension } from "@/lib/getLangExtension";
import { LANGUAGES } from "@/lib/useLanguages";
import { HLJS_TO_LABEL } from "@/lib/useLanguageToLabel";
import { useUserPreferences } from "@/components/providers/user-preferences-provider";
import { ApiError, apiClient } from "@/lib/api/client";

// ── Zod schema ────────────────────────────────────────────────────────────────
const snippetSchema = z.object({
  title: z.string().min(1, "Title is required").max(80, "Max 80 characters"),
  description: z.string().max(300, "Max 300 characters").optional(),
  code: z.string().min(1, "Code cannot be empty"),
  language: z.string().min(1, "Select a language"),
  collectionId: z.string().min(1, "Collection is required"),
  tags: z.array(z.string()).max(8, "Max 8 tags"),
  // visibility: z.enum(["private", "shared"]),
});

type Collection = {
  id: string;
  name: string;
};

type CollectionsResponse = {
  data: Collection[];
};

type CreateSnippetResponse = {
  data: {
    id: string;
  };
};

type SnippetDetailResponse = {
  data: {
    id: string;
    title: string;
    description: string | null;
    code: string;
    language: string;
    collectionId: string;
    tags: string[];
  };
};

type SnippetFormPageProps = {
  mode?: "create" | "edit";
  snippetId?: string;
  initialTitle?: string | null;
};

// ── Field error ───────────────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[11px] text-red-400 font-mono flex items-center gap-1 mt-1">
      <AlertCircle size={10} /> {message}
    </p>
  );
}

// ── Tag input ─────────────────────────────────────────────────────────────────
function TagInput({
  tags,
  onAdd,
  onRemove,
  error,
}: {
  tags: string[];
  onAdd: (t: string) => void;
  onRemove: (t: string) => void;
  error?: string;
}) {
  const [input, setInput] = useState("");
  const commit = () => {
    const t = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t) && tags.length < 8) {
      onAdd(t);
      setInput("");
    }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-[#3d2f6e]"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="text-purple-600 hover:text-purple-300 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        {tags.length < 8 && (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Backspace" && !input && tags.length)
                onRemove(tags[tags.length - 1]);
            }}
            onBlur={commit}
            placeholder="Add tag..."
            className="bg-transparent text-[11px] font-mono text-ink-secondary placeholder:text-ink-disabled outline-none min-w-17.5 flex-1"
          />
        )}
      </div>
      {error && <FieldError message={error} />}
    </div>
  );
}

// ── Visibility option ─────────────────────────────────────────────────────────
function VisibilityOption({
  selected,
  onSelect,
  icon: Icon,
  label,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ElementType;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-3 px-3.5 py-3 rounded-lg border text-left transition-all duration-150",
        selected
          ? "bg-purple-950 border-[#3d2f6e]"
          : "bg-surface-default border-border-base hover:border-border-hover",
      )}
    >
      <div
        className={cn(
          "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
          selected ? "border-purple-600" : "border-ink-disabled",
        )}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-purple-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon
            size={12}
            className={selected ? "text-purple-400" : "text-[#555555]"}
          />
          <span
            className={cn(
              "text-[12px] font-medium font-mono",
              selected ? "text-purple-300" : "text-[#888888]",
            )}
          >
            {label}
          </span>
        </div>
        <p
          className={cn(
            "text-[11px] font-mono mt-0.5 leading-relaxed",
            selected ? "text-[#7c6bb0]" : "text-[#444444]",
          )}
        >
          {description}
        </p>
      </div>
    </button>
  );
}

// ── Editor toolbar ────────────────────────────────────────────────────────────
function EditorToolbar({
  language,
  onLanguageChange,
  isAutoDetected,
}: {
  language: string;
  onLanguageChange: (v: string) => void;
  isAutoDetected: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-surface-shell border-b border-border-subtle shrink-0">
      {/* <div className="flex items-center gap-1">
        <button
          type="button"
          className="p-1.5 rounded text-[#444444] hover:text-[#888888] hover:bg-surface-raised transition-colors"
          title="Undo"
        >
          <Undo2 size={13} />
        </button>
        <button
          type="button"
          className="p-1.5 rounded text-[#444444] hover:text-[#888888] hover:bg-surface-raised transition-colors"
          title="Redo"
        >
          <Redo2 size={13} />
        </button>
      </div> */}

      <div className="flex items-center gap-2 ml-auto">
        {isAutoDetected && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-purple-400 bg-purple-950 border border-[#3d2f6e] px-2 py-0.5 rounded-full">
            <Sparkles size={9} />
            auto-detected
          </span>
        )}
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="h-7 w-32.5 bg-surface-raised border-border-base text-ink-secondary text-[11px] font-mono rounded-md hover:border-[#3d2f6e] transition-colors [&>svg]:text-[#555555]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-surface-hover border-border-base font-mono text-[11px]">
            {LANGUAGES.map((l) => (
              <SelectItem
                key={l}
                value={l}
                className="text-[11px] font-mono hover:bg-purple-950 hover:text-purple-300 focus:bg-purple-200 focus:text-purple-300 text-purple-300 cursor-pointer"
              >
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function SnippetFormPage({
  mode = "create",
  snippetId,
  initialTitle = null,
}: SnippetFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editorPrefs = useUserPreferences();
  const isEditMode = mode === "edit";
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: collectionsResponse } = useQuery({
    queryKey: ["collections"],
    queryFn: () => apiClient.get<CollectionsResponse>("/api/collections"),
  });
  const collections = collectionsResponse?.data ?? [];

  const { data: existingSnippet, isLoading: isSnippetLoading } = useQuery({
    queryKey: ["snippet", snippetId],
    queryFn: async () => {
      const response = await apiClient.get<SnippetDetailResponse>(
        `/api/snippets/${encodeURIComponent(snippetId ?? "")}`,
      );
      return response.data;
    },
    enabled: isEditMode && Boolean(snippetId),
  });

  const form = useForm({
    defaultValues: {
      title: initialTitle ?? "",
      description: "",
      code: "",
      language: "JavaScript",
      collectionId: "",
      tags: [] as string[],
      // visibility: "private" as "private" | "shared",
    },
    // validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      const parsed = snippetSchema.safeParse(value);
      if (!parsed.success) {
        setSubmitError("Please fix the highlighted fields before saving.");
        return;
      }

      try {
        const payload = {
          title: parsed.data.title,
          description: parsed.data.description?.trim() || undefined,
          code: parsed.data.code,
          language: parsed.data.language,
          collectionId: parsed.data.collectionId,
          tags: parsed.data.tags,
        };

        if (isEditMode && snippetId) {
          await apiClient.patch(
            `/api/snippets/${encodeURIComponent(snippetId)}`,
            payload,
            { timeoutMs: 12_000, retries: 1 },
          );
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["snippet", snippetId] }),
            queryClient.invalidateQueries({ queryKey: ["snippets"] }),
            queryClient.invalidateQueries({ queryKey: ["collection-snippets"] }),
            queryClient.invalidateQueries({ queryKey: ["collections"] }),
          ]);
          router.push(`/snippets/${snippetId}`);
          return;
        }

        await apiClient.post<CreateSnippetResponse>(
          "/api/snippets",
          {
            ...payload,
            isFavorite: false,
          },
          { timeoutMs: 12_000, retries: 1 },
        );
        router.push("/dashboard");
      } catch (error) {
        if (error instanceof ApiError && error.status === 400) {
          setSubmitError("Invalid snippet data. Please review title, code, and collection.");
          return;
        }
        setSubmitError(
          isEditMode
            ? "Failed to update snippet. Please try again."
            : "Failed to save snippet. Please try again.",
        );
      }
    },
  });

  useEffect(() => {
    if (!existingSnippet) return;

    form.setFieldValue("title", existingSnippet.title);
    form.setFieldValue("description", existingSnippet.description ?? "");
    form.setFieldValue("code", existingSnippet.code);
    form.setFieldValue("language", existingSnippet.language);
    form.setFieldValue("collectionId", existingSnippet.collectionId);
    form.setFieldValue("tags", existingSnippet.tags ?? []);
  }, [existingSnippet]);

  // Called when paste detected a language
  const handleLanguageDetected = useCallback(
    (lang: string) => {
      form.setFieldValue("language", lang);
      setIsAutoDetected(true);
      setDetectedLang(lang);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setDetectedLang(null), 3000);
    },
    [form],
  );

  // Detect language from pasted content
  const detectLanguage = useCallback(
    (pastedText: string) => {
      if (pastedText.trim().length < 30) return;
      try {
        const result = hljs.highlightAuto(pastedText, [
          "java",
          "javascript",
          "typescript",
          "python",
          "cpp",
          "c",
          "cs",
          "php",
          "rust",
        ]);
        if (result.language && result.relevance > 2) {
          const mapped = HLJS_TO_LABEL[result.language];
          if (mapped) handleLanguageDetected(mapped);
        }
      } catch {}
    },
    [handleLanguageDetected],
  );

  return (
    <div className="flex flex-col h-full bg-surface-base">
      {isEditMode && isSnippetLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 size={18} className="animate-spin text-purple-400" />
        </div>
      ) : (
        <>
      <div className="flex items-center justify-between px-5 py-3 bg-surface-shell border-b border-border-subtle shrink-0">
        <h1 className="text-[13px] font-semibold text-ink-primary font-mono tracking-wide">
          {isEditMode ? "Edit Snippet" : "Add New Snippet"}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-3 py-1.5 rounded-lg text-[11px] font-mono text-ink-muted border border-border-base hover:border-border-hover hover:text-ink-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={form.handleSubmit}
            disabled={form.state.isSubmitting}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-mono font-medium",
              "bg-purple-950 border border-[#3d2f6e] text-purple-300",
              "hover:bg-[#2a1a4a] hover:border-purple-600 hover:text-[#ddd6fe]",
              "active:scale-[0.98] transition-all duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {form.state.isSubmitting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            {form.state.isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Save Changes"
                : "Save Snippet"}
          </button>
        </div>
      </div>
      {submitError && (
        <div className="px-5 py-2 border-b border-border-subtle bg-red-950/20">
          <FieldError message={submitError} />
        </div>
      )}

      {/* ── Body ──────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left — code editor */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 border-r border-border-subtle relative">
          {/* Toolbar */}
          <form.Subscribe selector={(s) => s.values.language}>
            {(language) => (
              <EditorToolbar
                language={language}
                onLanguageChange={(v) => {
                  form.setFieldValue("language", v);
                  setIsAutoDetected(false);
                }}
                isAutoDetected={isAutoDetected}
              />
            )}
          </form.Subscribe>

          {/* ── CodeMirror editor ─────────────── */}
          <form.Subscribe
            selector={(s) => ({
              code: s.values.code,
              language: s.values.language,
            })}
          >
            {({ code, language }) => {
              const {
                resolvedTheme,
                preferences: {
                  editorFontSize,
                  wordWrap,
                  showLineNumbers,
                  tabSize,
                },
              } = editorPrefs;
              const indent = " ".repeat(tabSize);
              return (
              <div className="flex-1 min-h-0 overflow-hidden">
                <CodeMirror
                  key={`cm-${editorFontSize}-${resolvedTheme}-${wordWrap}-${showLineNumbers}-${tabSize}-${language}`}
                  value={code}
                  height="100%"
                  theme={resolvedTheme}
                  extensions={[
                    getLangExtension(
                      language as Parameters<typeof getLangExtension>[0],
                    ) ?? javascript(),
                    EditorState.tabSize.of(tabSize),
                    indentUnit.of(indent),
                    ...(wordWrap ? [EditorView.lineWrapping] : []),
                  ]}
                  onChange={(val) => {
                    form.setFieldValue("code", val);
                  }}
                  onCreateEditor={(view) => {
                    // Listen for paste events to trigger language detection
                    view.dom.addEventListener("paste", (e: Event) => {
                      const clipboardEvent = e as ClipboardEvent;
                      const text =
                        clipboardEvent.clipboardData?.getData("text") ?? "";
                      // Small delay so CodeMirror has inserted the text first
                      setTimeout(() => detectLanguage(text), 50);
                    });
                  }}
                  basicSetup={{
                    lineNumbers: showLineNumbers,
                    highlightActiveLine: true,
                    foldGutter: false,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    indentOnInput: true,
                    syntaxHighlighting: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    rectangularSelection: false,
                    crosshairCursor: false,
                    highlightSelectionMatches: false,
                    searchKeymap: false,
                  }}
                  style={{
                    height: "100%",
                    fontSize: `${editorFontSize}px`,
                    background:
                      resolvedTheme === "dark"
                        ? "#0f0f0f"
                        : "#fafafa",
                  }}
                />
              </div>
              );
            }}
          </form.Subscribe>

          {/* Code error */}
          <form.Field name="code">
            {(field) =>
              field.state.meta.errors?.length ? (
                <div className="px-4 py-2 bg-surface-base border-t border-border-subtle">
                  <FieldError message={field.state.meta.errors[0]} />
                </div>
              ) : null
            }
          </form.Field>

          {/* Detection toast */}
          {detectedLang && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950 border border-[#3d2f6e] text-purple-300 text-[11px] font-mono shadow-lg pointer-events-none z-10">
              <Sparkles size={11} className="text-purple-400" />
              Detected: {detectedLang}
            </div>
          )}
        </div>

        {/* Right — meta panel */}
        <div className="w-70 shrink-0 flex flex-col bg-surface-shell overflow-y-auto">
          <div className="p-5 border-b border-border-subtle">
            <h2 className="text-[14px] font-semibold text-ink-primary font-mono">
              Snippet Meta
            </h2>
            <p className="text-[11px] text-[#555555] font-mono mt-0.5">
              Configure identity and indexing.
            </p>
          </div>

          <div className="flex flex-col gap-5 p-5">
            {/* Title */}
            <form.Field
              name="title"
              validators={{
                onSubmit: z
                  .string()
                  .min(1, "Title is required")
                  .max(80, "Max 80 characters"),
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-[10px] font-semibold font-mono text-ink-muted tracking-[0.08em] uppercase mb-1.5">
                    Title
                  </label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. Auth Middleware Hook"
                    className={cn(
                      "h-8 bg-transparent border-border-base text-[#cccccc] text-[12px] font-mono",
                      "placeholder:text-ink-disabled rounded-lg",
                      "focus-visible:ring-1 focus-visible:ring-[#3d2f6e] focus-visible:border-[#3d2f6e]",
                      "hover:border-border-hover transition-colors",
                      field.state.meta.errors?.length && "border-red-500/50",
                    )}
                  />
                  <FieldError message={field.state.meta.errors?.toString()} />
                </div>
              )}
            </form.Field>

            {/* Description */}
            <form.Field name="description">
              {(field) => (
                <div>
                  <label className="block text-[10px] font-semibold font-mono text-ink-muted tracking-[0.08em] uppercase mb-1.5">
                    Description{" "}
                    <span className="text-ink-disabled normal-case tracking-normal font-normal">
                      (optional)
                    </span>
                  </label>
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Briefly describe what this snippet does..."
                    rows={3}
                    className={cn(
                      "bg-transparent border-border-base text-[#cccccc] text-[11px] font-mono resize-none",
                      "placeholder:text-ink-disabled rounded-lg leading-relaxed",
                      "focus-visible:ring-1 focus-visible:ring-[#3d2f6e] focus-visible:border-[#3d2f6e]",
                      "hover:border-border-hover transition-colors",
                    )}
                  />
                  <FieldError message={field.state.meta.errors?.[0]} />
                </div>
              )}
            </form.Field>

            {/* Collection */}
            <form.Field name="collectionId">
              {(field) => (
                <div>
                  <label className="block text-[10px] font-semibold font-mono text-ink-muted tracking-[0.08em] uppercase mb-1.5">
                    Collection
                  </label>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-8 bg-transparent border-border-base text-[#cccccc] text-[11px] font-mono rounded-lg",
                        "hover:border-border-hover focus:ring-1 focus:ring-[#3d2f6e] focus:border-[#3d2f6e]",
                        "transition-colors [&>svg]:text-[#555555]",
                        !field.state.value && "[&>span]:text-ink-disabled",
                      )}
                    >
                      <SelectValue placeholder="Select collection..." />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-hover border-border-base font-mono text-[11px]">
                      {collections.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                          className="text-[11px] font-mono hover:bg-purple-950 hover:text-purple-300 focus:bg-purple-200 focus:text-purple-300 text-purple-300 cursor-pointer"
                        >
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={field.state.meta.errors?.[0]} />
                </div>
              )}
            </form.Field>

            {/* Tags */}
            <form.Field name="tags">
              {(field) => (
                <div>
                  <label className="block text-[10px] font-semibold font-mono text-ink-muted tracking-[0.08em] uppercase mb-1.5">
                    Tags
                  </label>
                  <div
                    className={cn(
                      "min-h-9 flex flex-wrap items-center gap-1.5 px-2.5 py-1.5",
                      "rounded-lg border border-border-base bg-transparent",
                      "hover:border-border-hover transition-colors",
                      "focus-within:border-[#3d2f6e] focus-within:ring-1 focus-within:ring-[#3d2f6e]",
                    )}
                  >
                    <TagInput
                      tags={field.state.value}
                      onAdd={(t) =>
                        field.handleChange([...field.state.value, t])
                      }
                      onRemove={(t) =>
                        field.handleChange(
                          field.state.value.filter((x) => x !== t),
                        )
                      }
                      error={field.state.meta.errors?.[0]}
                    />
                  </div>
                  <p className="text-[10px] text-ink-disabled font-mono mt-1">
                    Press Enter or comma to add. Max 8 tags.
                  </p>
                </div>
              )}
            </form.Field>

          </div>

          {/* Bottom actions */}
          <div className="mt-auto p-5 border-t border-border-subtle flex gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-2 rounded-lg text-[11px] font-mono text-ink-muted border border-border-base hover:border-border-hover hover:text-ink-secondary transition-colors uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={form.handleSubmit}
              disabled={form.state.isSubmitting}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg",
                "text-[11px] font-mono font-semibold uppercase tracking-wider",
                "bg-purple-950 border border-[#3d2f6e] text-purple-300",
                "hover:bg-[#2a1a4a] hover:border-purple-600",
                "active:scale-[0.98] transition-all duration-150",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {form.state.isSubmitting ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Save size={11} />
              )}
              {form.state.isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Save Snippet"}
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

export default function AddSnippetPage() {
  const title = useSearchParams().get("title");

  return <SnippetFormPage mode="create" initialTitle={title} />;
}
