"use client";

import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";
import { useAppState } from "~/store";

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
    [setContent],
  );

  return (
    <div className="h-[500px] bg-background text-md">
      <CodeMirror
        className="[&_.cm-editor]:!bg-background [&_.cm-editor]:!h-full [&_.cm-scroller]:!bg-background [&_.cm-editor.cm-focused]:!outline-none [&_.cm-gutters]:!bg-background [&_.cm-lineNumbers]:!min-w-[40px] [&_.cm-lineNumbers]:!text-muted-foreground/80 [&_.cm-gutters]:!my-2 [&_.cm-content]:!my-2 [&_.cm-lineNumbers]:!px-1 h-full w-full text-sm"
        value={content}
        basicSetup={{
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          lineNumbers: true,
          foldGutter: false,
        }}
        extensions={languageExtension}
        onChange={onChange}
        theme={resolvedTheme === "dark" ? githubDark : githubLight}
      />
    </div>
  );
}
