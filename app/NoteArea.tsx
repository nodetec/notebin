"use client";
import { useState } from "react";
import NoteOptions from "./NoteOptions";
import "@uiw/react-textarea-code-editor/dist.css";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: true }
);
export default function NoteArea({ user }: any) {
  const [text, setText] = useState("");
  const [syntaxOption, setSyntaxOption] = useState("markdown");

  return (
    <div className="flex flex-row gap-1">
      {/* <div className="w-2/3 h-[20rem] overflow-auto"> */}
      <div className="w-2/3 h-[34rem] overflow-auto">
        <CodeEditor
          className="w-full min-h-full focus:border focus:border-blue-500 rounded-md p-3 outline-none dark:bg-neutral-800"
          value={text}
          language={syntaxOption}
          placeholder="Please enter text."
          onChange={(evn) => setText(evn.target.value)}
          padding={25}
          style={{
            fontSize: 15,
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
        />
      </div>
      <div className="bg-neutral-800 rounded-md w-1/3">
        <NoteOptions text={text} onSetSyntaxOption={setSyntaxOption} />
      </div>
    </div>
  );
}
