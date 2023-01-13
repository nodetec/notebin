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
  const [text, setText] = useState(`function add(a, b) {\n  return a + b;\n}`);
  return (
    <div className="flex flex-row gap-1">
      <div className="w-2/3 h-full">
        <CodeEditor
          className="w-full h-[100vh] 3xl:h-[50vh] focus:border focus:border-blue-500 rounded-md p-3 outline-none dark:bg-gray-900"
          value={text}
          language="jsx"
          placeholder="Please enter JS code."
          onChange={(evn) => setText(evn.target.value)}
          padding={15}
          style={{
            fontSize: 20,
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
        />
      </div>
      <div className="bg-gray-800 w-1/3">
        <NoteOptions text={text} />
      </div>
    </div>
  );
}
