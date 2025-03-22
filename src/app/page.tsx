"use client";

import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { Editor, FilenameInput, LanguageSelect } from "~/features/editor";
import { useAppState } from "~/store";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { Github } from "lucide-react";
import { DescriptionInput } from "~/features/editor";

export default function CodeForm() {
  const lang = useAppState((state) => state.lang);

  const languageExtension = useMemo(() => {
    const extension = loadLanguage(lang);
    return extension ? [extension] : [];
  }, [lang]);

  async function submitHandler() {
    console.log("submitHandler");
  }

  return (
    <main className="mt-8 flex h-full w-full flex-col items-center justify-center gap-4 bg-background px-4">
      <div className="flex w-full max-w-4xl flex-col">
        <div className="flex w-full items-start justify-between gap-4">
          <h1 className="mb-8 font-bold font-mono text-3xl">Notebin</h1>
          <div className="flex items-center gap-2">
            <a href="https://github.com/nodetec/notebin">
              <Button variant="outline" size="icon">
                <Github className="size-4" />
              </Button>
            </a>
            <ModeToggle />
            <Button className="font-mono" variant="secondary">
              login
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-border bg-background">
          <div className="flex w-full items-center justify-between border-b bg-muted/50 px-2 py-3 align-start dark:bg-muted/30">
            <FilenameInput />
            <LanguageSelect />
          </div>
          <Editor readOnly={false} />
        </div>
        <DescriptionInput />
        <div className="flex w-full items-center justify-end">
          <Button
            className="w-full font-mono sm:w-auto"
            onClick={submitHandler}
          >
            Post Snippet
          </Button>
        </div>
      </div>
    </main>
  );
}
