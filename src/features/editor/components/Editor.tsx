"use client";

import { useState, useMemo, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubLight } from "@uiw/codemirror-theme-github";
import { githubDark } from "@uiw/codemirror-theme-github";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import type { LanguageName } from "@uiw/codemirror-extensions-langs";
import { useAppState } from "~/store";
import { useTheme } from "next-themes";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";

type CodeFormProps = {
  readOnly: boolean;
};

export function Editor({ readOnly }: CodeFormProps) {
  const [lang, setLang] = useState<LanguageName>("tsx");
  const content = useAppState((state) => state.content);
  const setContent = useAppState((state) => state.setContent);
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
    <ScrollArea className="bg-background px-2 text-md">
      <div className="h-[600px] bg-background text-md">
        <CodeMirror
          className="[&_.cm-editor]:!bg-background [&_.cm-scroller]:!bg-background [&_.cm-editor.cm-focused]:!outline-none h-full w-full border-none py-4"
          value={content}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
          }}
          extensions={languageExtension}
          onChange={onChange}
          theme={resolvedTheme === "dark" ? githubDark : githubLight}
          readOnly={readOnly}
        />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
