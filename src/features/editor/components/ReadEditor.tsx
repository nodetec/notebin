"use client";

import {
  type LanguageName,
  loadLanguage,
} from "@uiw/codemirror-extensions-langs";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { getTagValue } from "~/lib/nostr/getTagValue";
import { useSnippetEvent } from "../hooks/useSnippetEvent";

type ReadEditorProps = {
  kind?: number;
  eventId: string;
  author?: string;
  relays?: string[];
};

export function ReadEditor({ kind, eventId, author, relays }: ReadEditorProps) {
  const { resolvedTheme } = useTheme();

  const { data: snippet } = useSnippetEvent(eventId, kind, author, relays);

  const languageExtension = useMemo(() => {
    const extension = loadLanguage(
      (getTagValue(snippet, "l") as LanguageName) || "markdown",
    );
    return extension ? [extension] : [];
  }, [snippet]);

  return (
    <div className="h-full bg-background text-md">
      <CodeMirror
        className="[&_.cm-editor]:!bg-background [&_.cm-editor]:!h-full [&_.cm-scroller]:!bg-background [&_.cm-editor.cm-focused]:!outline-none [&_.cm-gutters]:!bg-background [&_.cm-lineNumbers]:!min-w-[40px] [&_.cm-lineNumbers]:!text-muted-foreground/80 [&_.cm-gutters]:!my-2 [&_.cm-content]:!my-2 [&_.cm-lineNumbers]:!px-1 h-full w-full text-sm"
        value={snippet?.content}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          rectangularSelection: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
        }}
        extensions={languageExtension}
        theme={resolvedTheme === "dark" ? githubDark : githubLight}
        readOnly
        editable={false}
      />
    </div>
  );
}
