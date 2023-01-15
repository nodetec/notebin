"use client";
import { useState } from "react";
import "@uiw/react-textarea-code-editor/dist.css";
import dynamic from "next/dynamic";
import { LANGUAGES } from "./constants";
import Button from "./Button";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: true }
);
export default function NoteArea({ onSetSyntaxOption }: any) {
  const [text, setText] = useState("");
  const [syntax, setSyntax] = useState("markdown");
  const [syntaxOption, setSyntaxOption] = useState("markdown");
  const [postLoading, setPostLoading] = useState(false);

  return (
    <div className="w-full lg:w-2/3 mx-auto">
      <div className="overflow-auto rounded-md border-2 border-zinc-400 dark:border-neutral-700 ">
        <div className="bg-zinc-300 dark:bg-neutral-800 p-2">
          <input className="bg-zinc-200 text-neutral-900 dark:bg-neutral-900 dark:text-zinc-300 border-0 outline-0 focus:ring-0 text-sm rounded-md"
            type="text"
            list="syntax-languages"
            placeholder="syntax" />
          <datalist id="syntax-languages">
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </datalist>
        </div>
        <CodeEditor
          className="w-full min-h-full focus:border focus:border-blue-500 p-3 outline-none h-[34rem]"
          value={text}
          language={syntaxOption}
          placeholder="Enter your note..."
          autoCapitalize="none"
          onChange={(evn) => setText(evn.target.value)}
          padding={25}
          style={{
            fontSize: 15,
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
        />
      </div>
      <div className="pt-2">
        <Button
          color="blue"
          variant="solid"
          size="sm"
          className="w-auto ml-auto"
          loading={postLoading}
        >
          {postLoading ? "Sending..." : "Create Note"}
        </Button>
      </div>
    </div>
  );
}
