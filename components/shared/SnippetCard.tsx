"use client";

import { useState } from "react";
import { Copy, Check, Star, Clock, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeViewer } from "./CodeViewer";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Language =
  | "REACT"
  | "JS"
  | "TS"
  | "JAVA"
  | "PY"
  | "CSS"
  | "YAML"
  | "RUST"
  | "SQL"
  | "BASH"
  | "GO";

export type Snippet = {
  id: string;
  title: string;
  description: string;
  code: string;
  language: Language;
  tags?: string[];
  starred?: boolean;
  addedAt: string; // e.g. "2d ago", "1w ago"
};

// ── Language config ───────────────────────────────────────────────────────────
const LANG_CONFIG: Record<
  Language,
  { bg: string; text: string; label: string }
> = {
  REACT: { bg: "#1a2340", text: "#93c5fd", label: "REACT" },
  JS: { bg: "#1e1333", text: "#c4b5fd", label: "JS" },
  TS: { bg: "#1e1333", text: "#a78bfa", label: "TS" },
  JAVA: { bg: "#2d1a1f", text: "#fda4af", label: "JAVA" },
  PY: { bg: "#1e2d1e", text: "#86efac", label: "PY" },
  CSS: { bg: "#1a2340", text: "#93c5fd", label: "CSS" },
  YAML: { bg: "#2a2010", text: "#fcd34d", label: "YAML" },
  RUST: { bg: "#2d1a1f", text: "#fda4af", label: "RUST" },
  SQL: { bg: "#2a2010", text: "#fcd34d", label: "SQL" },
  BASH: { bg: "#1e2d1e", text: "#86efac", label: "BASH" },
  GO: { bg: "#1a2340", text: "#93c5fd", label: "GO" },
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface SnippetCardProps {
  snippet: Snippet;
  onStar?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SnippetCard({
  snippet,
  onStar,
  onEdit,
  onDelete,
  onClick,
  className,
}: SnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const lang = LANG_CONFIG[snippet.language] ?? LANG_CONFIG["JS"];

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStar?.(snippet.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(snippet.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(snippet.id);
  };

  const actionButtonClassName = cn(
    "flex items-center justify-center p-1.5 rounded-md",
    "border transition-all duration-150",
    "bg-border-subtle border-border-base text-ink-muted",
    "hover:border-[#3d2f6e] hover:text-purple-300",
  );

  return (
    <div
      onClick={() => onClick?.(snippet.id)}
      className={cn(
        // base card
        "group flex flex-col bg-surface-default border border-border-base rounded-xl overflow-hidden",
        "cursor-pointer transition-all duration-200",
        // hover — lift + accent border
        "hover:border-[#3d2f6e] hover:bg-[#161616]",
        className,
      )}
    >
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[14px] font-semibold text-ink-primary truncate font-mono">
              {snippet.title}
            </h3>
            {/* Language badge */}
            <span
              className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded font-mono tracking-wider"
              style={{ background: lang.bg, color: lang.text }}
            >
              {lang.label}
            </span>
          </div>
          <p className="text-[12px] text-ink-muted leading-relaxed line-clamp-2 font-mono">
            {snippet.description}
          </p>
        </div>
      
        {/* Star button */}
        <button
          onClick={handleStar}
          className={cn(
            "shrink-0 p-1 rounded-md transition-colors duration-150 mt-0.5",
            snippet.starred
              ? "text-purple-400"
              : "text-ink-disabled hover:text-ink-muted",
          )}
          title={snippet.starred ? "Unstar" : "Star"}
        >
          <Star size={13} fill={snippet.starred ? "#a78bfa" : "none"} />
        </button>
      </div>

      {/* ── Code block ─────────────────────────── */}
      <div className="relative flex-1 mx-0 bg-surface-shell border-t border-b border-border-subtle overflow-hidden">
        {/* Scrollable code area */}
        <div className="overflow-x-auto overflow-y-hidden">
          <pre className="px-4 py-3 text-[11px] leading-[1.7] text-ink-secondary font-mono whitespace-pre min-h-40 max-h-55 overflow-y-auto">
            <CodeViewer code={snippet.code} language={snippet.language} />
          </pre>
        </div>

        {/* Scrollbar track styling is handled globally */}
      </div>

      {/* ── Footer ─────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Added at */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#444444] font-mono">
          <Clock size={11} />
          <span>Added {snippet.addedAt}</span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5">
          {snippet.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[9px] text-[#555555] bg-border-subtle border border-border-base px-1.5 py-0.5 rounded font-mono"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className={cn(
              actionButtonClassName,
              copied && "bg-[#1e2d1e] border-[#86efac] text-[#86efac]",
            )}
            title="Copy code"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
          <button
            onClick={handleEdit}
            className={actionButtonClassName}
            title="Edit snippet"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              actionButtonClassName,
              "hover:border-[#5c2b2b] hover:text-red-400",
            )}
            title="Delete snippet"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}