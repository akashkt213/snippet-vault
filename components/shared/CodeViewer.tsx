import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { getLangExtension } from "@/lib/getLangExtension";

type EditorLanguage = Parameters<typeof getLangExtension>[0];

export function CodeViewer({
  code,
  language,
}: {
  code: string;
  language: EditorLanguage;
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