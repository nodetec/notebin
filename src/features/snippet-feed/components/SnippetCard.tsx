import { githubLight } from "@uiw/codemirror-theme-github";

import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { githubDark } from "@uiw/codemirror-theme-github";
import type { NostrSnippet } from "~/lib/nostr/createNostrSnippet";
import { useMemo } from "react";
import {
  type LanguageName,
  loadLanguage,
} from "@uiw/codemirror-extensions-langs";
import Link from "next/link";
import { createNevent } from "~/lib/nostr/createNevent";
import { DEFAULT_RELAYS } from "~/lib/constants";

type SnippetCardProps = {
  snippet: NostrSnippet;
};

export function SnippetCard({ snippet }: SnippetCardProps) {
  const { resolvedTheme } = useTheme();

  const languageExtension = useMemo(() => {
    const extension = loadLanguage(
      (snippet.language as LanguageName) || "markdown",
    );
    return extension ? [extension] : [];
  }, [snippet]);

  return (
    <div className="flex flex-col gap-2">
      <Link href={`/${createNevent(snippet.event, DEFAULT_RELAYS)}`}>
        <h2 className="truncate font-mono font-semibold text-blue-400 text-sm">
          {snippet.name || "Untitled"}
        </h2>
      </Link>

      <div className="h-[204px] overflow-hidden rounded-md border bg-background text-md">
        <CodeMirror
          className="[&_.cm-editor]:!bg-background [&_.cm-scroller]:!bg-background [&_.cm-editor.cm-focused]:!outline-none [&_.cm-gutters]:!bg-background [&_.cm-lineNumbers]:!min-w-[40px] [&_.cm-lineNumbers]:!text-muted-foreground/80 w-full overflow-hidden text-sm"
          value={snippet?.content}
          basicSetup={{
            allowMultipleSelections: false,
            autocompletion: false,
            bracketMatching: false,
            closeBrackets: false,
            closeBracketsKeymap: false,
            completionKeymap: false,
            history: false,
            drawSelection: false,
            crosshairCursor: false,
            dropCursor: false,
            highlightSelectionMatches: false,
            indentOnInput: false,
            highlightSpecialChars: false,
            foldKeymap: false,
            lintKeymap: false,
            searchKeymap: false,
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
    </div>
  );
}
