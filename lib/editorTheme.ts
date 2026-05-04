import { EditorView } from "@codemirror/view";

// ── Tokyo Night theme ─────────────────────────────────────────────────────────
export const midnightTheme = EditorView.theme(
  {
    // ── Editor shell ──────────────────────────────────────────────────────────
    "&": {
      backgroundColor: "#1a1b26",
      color: "#c0caf5",
      height: "100%",
      fontSize: "12px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    },
    ".cm-content": {
      caretColor: "#c0caf5",
      padding: "12px 0",
    },
    ".cm-line": {
      padding: "0 16px",
      lineHeight: "1.7",
    },
    ".cm-cursor": {
      borderLeftColor: "#c0caf5",
      borderLeftWidth: "2px",
    },
    // ── Gutter ────────────────────────────────────────────────────────────────
    ".cm-gutters": {
      backgroundColor: "#13141e",
      borderRight: "1px solid #1e2030",
      color: "#3b4261",
      minWidth: "44px",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      paddingRight: "12px",
      fontSize: "11px",
      lineHeight: "1.7",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#1e2030",
      color: "#737aa2",
    },
    ".cm-activeLine": {
      backgroundColor: "#1e2030",
    },
    // ── Selection ─────────────────────────────────────────────────────────────
    ".cm-selectionBackground": {
      backgroundColor: "#2e3c64 !important",
    },
    ".cm-focused .cm-selectionBackground": {
      backgroundColor: "#2e3c64 !important",
    },
    "::selection": {
      backgroundColor: "#2e3c64 !important",
    },
    // ── Matching brackets ────────────────────────────────────────────────────
    ".cm-matchingBracket": {
      backgroundColor: "#3d4f7c",
      color: "#c0caf5 !important",
    },
    // ── Scrollbar ─────────────────────────────────────────────────────────────
    ".cm-scroller": {
      overflow: "auto",
      fontFamily: "'JetBrains Mono', monospace",
    },
    // ── Focus ring ────────────────────────────────────────────────────────────
    "&.cm-focused": {
      outline: "none",
    },
    // ── Syntax tokens — Tokyo Night palette ──────────────────────────────────
    //  keywords:    if, const, return, async, function …
    ".tok-keyword": { color: "#bb9af7" },
    //  operators:   =, +, ===, =>, ?? …
    ".tok-operator": { color: "#89ddff" },
    //  strings:     "hello", `template`, 'world'
    ".tok-string": { color: "#9ece6a" },
    ".tok-string2": { color: "#9ece6a" },
    //  numbers:     42, 3.14, 0xff
    ".tok-number": { color: "#ff9e64" },
    //  comments:    // …  /* … */
    ".tok-comment": { color: "#444b6a", fontStyle: "italic" },
    //  class / type names:  MyClass, Promise, Record<…>
    ".tok-className": { color: "#2ac3de" },
    ".tok-typeName": { color: "#2ac3de" },
    //  function names:  fetchUser(), useEffect()
    ".tok-function": { color: "#7aa2f7" },
    //  regular identifiers / variables
    ".tok-variableName": { color: "#c0caf5" },
    //  object properties:  obj.key
    ".tok-propertyName": { color: "#73daca" },
    //  punctuation:  { } ( ) ; , .
    ".tok-punctuation": { color: "#565f89" },
    //  HTML / JSX tag names:  <div>, <Button>
    ".tok-tagName": { color: "#f7768e" },
    //  HTML attribute names:  className, onClick
    ".tok-attributeName": { color: "#bb9af7" },
    //  booleans:    true, false
    ".tok-bool": { color: "#ff9e64" },
    //  null / undefined
    ".tok-null": { color: "#ff9e64" },
    //  regex literals:  /pattern/gi
    ".tok-regexp": { color: "#9ece6a" },
    //  decorators / meta:  @Component
    ".tok-meta": { color: "#737aa2" },
    //  self / this
    ".tok-self": { color: "#e0af68" },
    //  import / export namespace
    ".tok-namespace": { color: "#2ac3de" },
    //  definition sites (let x =, function foo …)
    ".tok-definition": { color: "#c0caf5" },
    //  module paths:  from 'react'
    ".tok-moduleKeyword": { color: "#bb9af7" },
    //  invalid / error tokens
    ".tok-invalid": { color: "#f7768e" },
  },
  { dark: true },
);
