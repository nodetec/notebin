import {
  type LanguageName,
  loadLanguage,
} from "@uiw/codemirror-extensions-langs";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { createNevent } from "~/lib/nostr/createNevent";
import type { NostrSnippet } from "~/lib/nostr/createNostrSnippet";
import { AuthorProfile } from "./AuthorProfile";

type SnippetCardProps = {
  snippet: NostrSnippet;
  hideAuthor?: boolean;
};

export function SnippetCard({ snippet, hideAuthor = false }: SnippetCardProps) {
  const { resolvedTheme } = useTheme();

  const languageExtension = useMemo(() => {
    const extension = loadLanguage(
      (snippet.language as LanguageName) || "markdown",
    );
    return extension ? [extension] : [];
  }, [snippet]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm">
          {snippet.event.pubkey && !hideAuthor && (
            <>
              <AuthorProfile
                publicKey={snippet.event.pubkey}
                showAvatar={true}
                showName={true}
                showNip05={false}
                avatarSize="sm"
                className="text-muted-foreground hover:text-foreground"
              />
              <span className="text-muted-foreground">/</span>
            </>
          )}
          <Link
            href={`/snippet/${createNevent(snippet.event, DEFAULT_RELAYS)}`}
            className="truncate font-mono font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            {snippet.name || "Untitled"}
          </Link>
        </div>
        {snippet.description && (
          <p className="line-clamp-1 text-muted-foreground text-sm">
            {snippet.description}
          </p>
        )}
      </div>

      <div className="h-[204px] overflow-hidden rounded-md border bg-background text-md">
        <CodeMirror
          className="[&_.cm-editor]:!bg-background [&_.cm-scroller]:!bg-background [&_.cm-editor.cm-focused]:!outline-none [&_.cm-gutters]:!bg-background [&_.cm-lineNumbers]:!min-w-[40px] [&_.cm-lineNumbers]:!text-muted-foreground/80 [&_.cm-lineNumbers]:!px-1 w-full overflow-hidden text-sm"
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
