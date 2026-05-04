import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import type { Language } from "@codemirror/language";
import { getLangExtension } from "@/lib/getLangExtension";


export function CodeViewer({
  code,
  language,
}: {
  code: string;
  language: Language;
}) {
  return (
    <CodeMirror
      value={code}
      editable={false}
      theme="dark"
      extensions={[
        getLangExtension(language),
        EditorView.lineWrapping,
        EditorView.editable.of(false), // extra safety
      ]}
      basicSetup={{
        lineNumbers: false,
        highlightActiveLine: false,
        foldGutter: false,
      }}
      style={{
        fontSize: "11px",
        background: "#0f0f0f",
      }}
    />
  );
}