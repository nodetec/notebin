"use client";

import { useMemo, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubLight } from "@uiw/codemirror-theme-github";
import { githubDark } from "@uiw/codemirror-theme-github";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { useAppState } from "~/store";
import { useTheme } from "next-themes";

export function ActiveEditor() {
  const setContent = useAppState((state) => state.setContent);

  const content = useAppState((state) => state.content);
  const lang = useAppState((state) => state.lang);

  const { resolvedTheme } = useTheme();

  const languageExtension = useMemo(() => {
    const extension = loadLanguage(lang);
    return extension ? [extension] : [];
  }, [lang]);

  const onChange = useCallback(
    (val: string) => {
      setContent(val);
    },
    [setContent]
  );

  return (
    <div className="h-[500px] bg-background text-md">
      <CodeMirror
        className="[&_.cm-editor]:!bg-background [&_.cm-editor]:!h-full [&_.cm-scroller]:!bg-background [&_.cm-editor.cm-focused]:!outline-none h-full w-full px-2 py-4 text-sm"
        value={content}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
        }}
        extensions={languageExtension}
        onChange={onChange}
        theme={resolvedTheme === "dark" ? githubDark : githubLight}
      />
    </div>
  );
}
