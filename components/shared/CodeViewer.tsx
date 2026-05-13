"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";
import { getLangExtension } from "@/lib/getLangExtension";
import { useUserPreferences } from "@/components/providers/user-preferences-provider";

type EditorLanguage = Parameters<typeof getLangExtension>[0];

export function CodeViewer({
  code,
  language,
}: {
  code: string;
  language: EditorLanguage;
}) {
  const { resolvedTheme, preferences } = useUserPreferences();

  const { editorFontSize, wordWrap, tabSize, showLineNumbers } = preferences;

  const extensions = useMemo(
    () => {
      const lang = getLangExtension(language);
      const list = [
        lang,
        EditorState.tabSize.of(tabSize),
        indentUnit.of(" ".repeat(tabSize)),
        EditorView.editable.of(false),
      ];
      if (wordWrap) {
        list.push(EditorView.lineWrapping);
      }
      return list;
    },
    [language, tabSize, wordWrap],
  );

  const surface = resolvedTheme === "dark" ? "#0f0f0f" : "#fafafa";

  return (
    <CodeMirror
      key={`cv-${editorFontSize}-${resolvedTheme}-${wordWrap}-${tabSize}-${showLineNumbers}`}
      value={code}
      editable={false}
      theme={resolvedTheme}
      extensions={extensions}
      basicSetup={{
        lineNumbers: showLineNumbers,
        highlightActiveLine: false,
        foldGutter: false,
      }}
      style={{
        fontSize: `${editorFontSize}px`,
        background: surface,
      }}
    />
  );
}
