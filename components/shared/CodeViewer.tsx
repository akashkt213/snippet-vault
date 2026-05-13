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
  const {
    resolvedCodeMirrorTheme,
    preferences,
  } = useUserPreferences();

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

  const surface =
    resolvedCodeMirrorTheme === "dark" ? "#0f0f0f" : "#fafafa";

  return (
    <CodeMirror
      key={`cv-${editorFontSize}-${resolvedCodeMirrorTheme}-${wordWrap}-${tabSize}-${showLineNumbers}`}
      value={code}
      editable={false}
      theme={resolvedCodeMirrorTheme}
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
