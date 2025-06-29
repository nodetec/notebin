import type { LanguageName } from "@uiw/codemirror-extensions-langs";

export const languageToExtension: Record<LanguageName, string> = {
  shell: "sh",
  c: "c",
  csharp: "cs",
  css: "css",
  dockerfile: "dockerfile",
  elm: "elm",
  erlang: "erl",
  go: "go",
  haskell: "hs",
  html: "html",
  java: "java",
  javascript: "js",
  json: "json",
  jsx: "jsx",
  kotlin: "kt",
  lua: "lua",
  markdown: "md",
  powershell: "ps1",
  php: "php",
  python: "py",
  r: "r",
  ruby: "rb",
  rust: "rs",
  scala: "scala",
  solidity: "sol",
  sql: "sql",
  swift: "swift",
  svelte: "svelte",
  toml: "toml",
  typescript: "ts",
  tsx: "tsx",
  vue: "vue",
  xml: "xml",
  yaml: "yml",
} as const;

export function getExtensionForLanguage(language?: string): string {
  if (!language) return "txt";
  return languageToExtension[language as LanguageName] || "txt";
}
