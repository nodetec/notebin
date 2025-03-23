"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubLight } from "@uiw/codemirror-theme-github";
import { githubDark } from "@uiw/codemirror-theme-github";
import {
  type LanguageName,
  loadLanguage,
} from "@uiw/codemirror-extensions-langs";
import { useTheme } from "next-themes";
import { useSnippetEvent } from "../hooks/useSnippetEvent";
import { getTagValue } from "~/lib/nostr/getTagValue";

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
    <div className="h-[500px] bg-background text-md">
      <CodeMirror
        className="[&_.cm-editor]:!bg-background [&_.cm-editor]:!h-full [&_.cm-scroller]:!bg-background [&_.cm-editor.cm-focused]:!outline-none h-full w-full cursor-text px-2 py-4 text-sm"
        value={snippet?.content}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          rectangularSelection: false,
          highlightActiveLine: false,
        }}
        extensions={languageExtension}
        theme={resolvedTheme === "dark" ? githubDark : githubLight}
        readOnly
        editable={false}
      />
    </div>
  );
}
