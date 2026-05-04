import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { yaml } from "@codemirror/lang-yaml";
import type { Extension } from "@uiw/react-codemirror";

type EditorLanguage =
  | "JavaScript"
  | "TypeScript"
  | "Python"
  | "Java"
  | "Rust"
  | "CSS"
  | "HTML"
  | "SQL"
  | "YAML"
  | "C++"
  | "PHP";

export function getLangExtension(lang: EditorLanguage): Extension {
  switch (lang) {
    case "JavaScript":
      return javascript();
    case "TypeScript":
      return javascript({ typescript: true });
    case "Python":
      return python();
    case "Java":
      return java();
    case "Rust":
      return rust();
    case "CSS":
      return css();
    case "HTML":
      return html();
    case "SQL":
      return sql();
    case "YAML":
      return yaml();
    case "C++":
      return cpp();
    case "PHP":
      return php();
    default:
      return javascript();
  }
}
