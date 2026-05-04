"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import hljs from "highlight.js";
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
  Lock,
  Users,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "Rust",
  "Go", "CSS", "HTML", "SQL", "YAML", "Bash", "C++", "C#", "Ruby", "PHP",
];

const COLLECTIONS = [
  "Core Utilities", "React Hooks", "API Helpers",
  "Design Patterns", "DevOps", "Algorithms",
];

// Map hljs language names → our dropdown values
const HLJS_TO_LABEL: Record<string, string> = {
  javascript:  "JavaScript",
  typescript:  "TypeScript",
  python:      "Python",
  java:        "Java",
  rust:        "Rust",
  go:          "Go",
  css:         "CSS",
  xml:         "HTML",
  html:        "HTML",
  sql:         "SQL",
  yaml:        "YAML",
  bash:        "Bash",
  shell:       "Bash",
  cpp:         "C++",
  csharp:      "C#",
  ruby:        "Ruby",
  php:         "PHP",
};

// ── Zod schema ────────────────────────────────────────────────────────────────
const snippetSchema = z.object({
  title:       z.string().min(1, "Title is required").max(80, "Max 80 characters"),
  description: z.string().max(300, "Max 300 characters").optional(),
  code:        z.string().min(1, "Code cannot be empty"),
  language:    z.string().min(1, "Select a language"),
  collection:  z.string().optional(),
  tags:        z.array(z.string()).max(8, "Max 8 tags"),
  visibility:  z.enum(["private", "shared"]),
});

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
              if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); }
              if (e.key === "Backspace" && !input && tags.length) onRemove(tags[tags.length - 1]);
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
          : "bg-surface-default border-border-base hover:border-border-hover"
      )}
    >
      <div className={cn(
        "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
        selected ? "border-purple-600" : "border-ink-disabled"
      )}>
        {selected && <div className="w-2 h-2 rounded-full bg-purple-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon size={12} className={selected ? "text-purple-400" : "text-[#555555]"} />
          <span className={cn("text-[12px] font-medium font-mono", selected ? "text-purple-300" : "text-[#888888]")}>
            {label}
          </span>
        </div>
        <p className={cn("text-[11px] font-mono mt-0.5 leading-relaxed", selected ? "text-[#7c6bb0]" : "text-[#444444]")}>
          {description}
        </p>
      </div>
    </button>
  );
}

// ── Code editor with auto-detection ──────────────────────────────────────────
function CodeEditor({
  value,
  onChange,
  onLanguageDetected,
  detectedLanguage,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onLanguageDetected: (lang: string) => void;
  detectedLanguage: string | null;
  error?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lines = value.split("\n");

  // ── Auto-detect on paste ──────────────────────────────────────────────────
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");

    // Only run detection if there's meaningful code (> 30 chars)
    if (pastedText.trim().length > 30) {
      try {
        const result = hljs.highlightAuto(pastedText);

        // hljs returns a relevance score — only trust it if > 5
        if (result.language && result.relevance > 5) {
          const mapped = HLJS_TO_LABEL[result.language];
          if (mapped) {
            onLanguageDetected(mapped);
          }
        }
      } catch {
        // Silently fail — detection is best-effort
      }
    }
  };

  // ── Tab key → insert spaces ───────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.substring(0, start) + "  " + value.substring(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className={cn(
      "flex flex-1 min-h-0 overflow-hidden",
      error ? "ring-1 ring-red-500/50" : ""
    )}>
      {/* Line numbers */}
      <div
        aria-hidden
        className="select-none shrink-0 w-10 bg-surface-base border-r border-border-subtle pt-3 pb-3 flex flex-col items-end pr-2 overflow-hidden"
      >
        {lines.map((_, i) => (
          <span
            key={i}
            className="text-[11px] font-mono text-ink-disabled leading-[1.7] h-[18.7px]"
          >
            {i + 1}
          </span>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        spellCheck={false}
        autoComplete="off"
        className={cn(
          "flex-1 resize-none bg-[#0d0d0d] text-[#cccccc]",
          "text-[12px] font-mono leading-[1.7] px-4 pt-3 pb-3",
          "outline-none border-none caret-purple-400",
          "placeholder:text-border-base"
        )}
        placeholder="// Paste or type your snippet here..."
      />

      {/* Auto-detected language toast — shows briefly after detection */}
      {detectedLanguage && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950 border border-[#3d2f6e] text-purple-300 text-[11px] font-mono shadow-lg pointer-events-none animate-fade-in">
          <Sparkles size={11} className="text-purple-400" />
          Detected: {detectedLanguage}
        </div>
      )}
    </div>
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
    <div className="flex items-center justify-between px-3 py-2 bg-[#111111] border-b border-border-subtle shrink-0">
      <div className="flex items-center gap-1">
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
      </div>

      <div className="flex items-center gap-2">
        {/* Auto-detected badge */}
        {isAutoDetected && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-purple-400 bg-purple-950 border border-[#3d2f6e] px-2 py-0.5 rounded-full">
            <Sparkles size={9} />
            auto-detected
          </span>
        )}

        <Select value={language} onValueChange={(v) => { onLanguageChange(v); }}>
          <SelectTrigger className="h-7 w-32.5 bg-surface-raised border-border-base text-ink-secondary text-[11px] font-mono rounded-md hover:border-[#3d2f6e] transition-colors [&>svg]:text-[#555555]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-surface-raised border-border-base font-mono text-[11px]">
            {LANGUAGES.map((l) => (
              <SelectItem
                key={l}
                value={l}
                className="text-[11px] font-mono hover:bg-purple-950 hover:text-purple-300 focus:bg-purple-950 focus:text-purple-300 cursor-pointer"
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
export default function AddSnippetPage() {
  const router = useRouter();

  // Track whether the current language was auto-detected
  const [isAutoDetected, setIsAutoDetected]     = useState(false);
  // Briefly show detected language toast
  const [detectedLang,   setDetectedLang]       = useState<string | null>(null);
  const detectedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm({
    defaultValues: {
      title:      "",
      description:"",
      code:       "",
      language:   "JavaScript",
      collection: "",
      tags:       [] as string[],
      visibility: "private" as "private" | "shared",
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      console.log("Submitting:", value);
      await new Promise((r) => setTimeout(r, 800));
      router.push("/dashboard");
    },
  });

  // Called by CodeEditor when hljs detects a language on paste
  const handleLanguageDetected = (lang: string) => {
    form.setFieldValue("language", lang);
    setIsAutoDetected(true);
    setDetectedLang(lang);

    // Hide the toast after 3 seconds
    if (detectedTimerRef.current) clearTimeout(detectedTimerRef.current);
    detectedTimerRef.current = setTimeout(() => setDetectedLang(null), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-surface-base">

      {/* ── Top bar ──────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 bg-surface-shell border-b border-border-subtle shrink-0">
        <h1 className="text-[13px] font-semibold text-ink-primary font-mono tracking-wide">
          Add New Snippet
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
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Save size={12} />
            {form.state.isSubmitting ? "Saving..." : "Save Snippet"}
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left — code editor */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 border-r border-border-subtle relative">

          {/* Toolbar — reads language from form */}
          <form.Subscribe selector={(s) => s.values.language}>
            {(language) => (
              <EditorToolbar
                language={language}
                onLanguageChange={(v) => {
                  form.setFieldValue("language", v);
                  setIsAutoDetected(false); // user manually changed it
                }}
                isAutoDetected={isAutoDetected}
              />
            )}
          </form.Subscribe>

          {/* Code editor */}
          <form.Field
            name="code"
            validators={{ onSubmit: z.string().min(1, "Code cannot be empty") }}
          >
            {(field) => (
              <CodeEditor
                value={field.state.value}
                onChange={field.handleChange}
                onLanguageDetected={handleLanguageDetected}
                detectedLanguage={detectedLang}
                error={field.state.meta.errors?.[0]?.toString()}
              />
            )}
          </form.Field>

          {/* Code field error */}
          <form.Field name="code">
            {(field) =>
              field.state.meta.errors?.length ? (
                <div className="px-4 py-2 bg-surface-base border-t border-border-subtle">
                  <FieldError message={field.state.meta.errors[0]} />
                </div>
              ) : null
            }
          </form.Field>
        </div>

        {/* Right — meta panel */}
        <div className="w-70 shrink-0 flex flex-col bg-surface-shell overflow-y-auto">
          <div className="p-5 border-b border-border-subtle">
            <h2 className="text-[14px] font-semibold text-ink-primary font-mono">Snippet Meta</h2>
            <p className="text-[11px] text-[#555555] font-mono mt-0.5">Configure identity and indexing.</p>
          </div>

          <div className="flex flex-col gap-5 p-5">

            {/* Title */}
            <form.Field
              name="title"
              validators={{ onSubmit: z.string().min(1, "Title is required").max(80, "Max 80 characters") }}
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
                      field.state.meta.errors?.length && "border-red-500/50"
                    )}
                  />
                  <FieldError message={field.state.meta.errors?.[0]?.toString()} />
                </div>
              )}
            </form.Field>

            {/* Description */}
            <form.Field name="description">
              {(field) => (
                <div>
                  <label className="block text-[10px] font-semibold font-mono text-ink-muted tracking-[0.08em] uppercase mb-1.5">
                    Description{" "}
                    <span className="text-ink-disabled normal-case tracking-normal font-normal">(optional)</span>
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
                      "hover:border-border-hover transition-colors"
                    )}
                  />
                  <FieldError message={field.state.meta.errors?.[0]} />
                </div>
              )}
            </form.Field>

            {/* Collection */}
            <form.Field name="collection">
              {(field) => (
                <div>
                  <label className="block text-[10px] font-semibold font-mono text-ink-muted tracking-[0.08em] uppercase mb-1.5">
                    Collection
                  </label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger className={cn(
                      "h-8 bg-transparent border-border-base text-[#cccccc] text-[11px] font-mono rounded-lg",
                      "hover:border-border-hover focus:ring-1 focus:ring-[#3d2f6e] focus:border-[#3d2f6e]",
                      "transition-colors [&>svg]:text-[#555555]",
                      !field.state.value && "[&>span]:text-ink-disabled"
                    )}>
                      <SelectValue placeholder="Select collection..." />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-raised border-border-base font-mono text-[11px]">
                      {COLLECTIONS.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="text-ink-secondary text-[11px] font-mono hover:bg-purple-950 hover:text-purple-300 focus:bg-purple-950 focus:text-purple-300 cursor-pointer"
                        >
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <div className={cn(
                    "min-h-9 flex flex-wrap items-center gap-1.5 px-2.5 py-1.5",
                    "rounded-lg border border-border-base bg-transparent",
                    "hover:border-border-hover transition-colors",
                    "focus-within:border-[#3d2f6e] focus-within:ring-1 focus-within:ring-[#3d2f6e]"
                  )}>
                    <TagInput
                      tags={field.state.value}
                      onAdd={(t) => field.handleChange([...field.state.value, t])}
                      onRemove={(t) => field.handleChange(field.state.value.filter((x) => x !== t))}
                      error={field.state.meta.errors?.[0]}
                    />
                  </div>
                  <p className="text-[10px] text-ink-disabled font-mono mt-1">
                    Press Enter or comma to add. Max 8 tags.
                  </p>
                </div>
              )}
            </form.Field>

            {/* Visibility */}
            <form.Field name="visibility">
              {(field) => (
                <div>
                  <label className="block text-[10px] font-semibold font-mono text-ink-muted tracking-[0.08em] uppercase mb-1.5">
                    Visibility
                  </label>
                  <div className="flex flex-col gap-2">
                    <VisibilityOption
                      selected={field.state.value === "private"}
                      onSelect={() => field.handleChange("private")}
                      icon={Lock}
                      label="Private"
                      description="Only you can view this snippet."
                    />
                    <VisibilityOption
                      selected={field.state.value === "shared"}
                      onSelect={() => field.handleChange("shared")}
                      icon={Users}
                      label="Workspace Shared"
                      description="Visible to 'PRO_USER_01' team."
                    />
                  </div>
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
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Save size={11} />
              {form.state.isSubmitting ? "Saving..." : "Save Snippet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}