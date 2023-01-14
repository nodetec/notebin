"use client";
import { useState } from "react";
import NoteOptions from "./NoteOptions";
import "@uiw/react-textarea-code-editor/dist.css";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: true }
);
export default function NoteArea() {
  const [text, setText] = useState("");
  const [syntaxOption, setSyntaxOption] = useState("markdown");

  return (
    <div className="flex flex-col gap-1 lg:flex-row">
      {/* <div className="w-2/3 h-[20rem] overflow-auto"> */}
      <div className="w-full lg:w-2/3 h-[34rem] overflow-auto">
        <CodeEditor
          className="w-full min-h-full focus:border focus:border-blue-500 rounded-md p-3 outline-none"
          value={text}
          language={syntaxOption}
          placeholder="Please enter text."
          autoCapitalize="none"
          onChange={(evn) => setText(evn.target.value)}
          padding={25}
          // style={{
          //   fontSize: 15,
          //   fontFamily:
          //     "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          // }}
        />
      </div>
      <div className="dark:bg-neutral-800 bg-zinc-200 rounded-md w-full lg:w-1/3">
        <NoteOptions text={text} onSetSyntaxOption={setSyntaxOption} />
      </div>
    </div>
  );
}
