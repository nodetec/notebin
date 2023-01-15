"use client";
import { useState } from "react";
import "@uiw/react-textarea-code-editor/dist.css";
import dynamic from "next/dynamic";
import Button from "./Button";
import TextInput from "./TextInput";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: true }
);
export default function NoteArea() {
  const [text, setText] = useState("");
  const [syntaxOption, setSyntaxOption] = useState("markdown");

  return (
    <div className="container items-center flex flex-col justify-center w-2/3">
      <div className="bg-zinc-800 w-full py-3 border-r border-l border-t border-zinc-700 rounded-t-md">
        <input className="bg-zinc-900 w-16 px-2 mx-2 rounded-md" placeholder="syntax"></input>
      </div>
      <div className="w-full h-[34rem] overflow-auto">
        <CodeEditor
          className="w-full min-h-full border-zinc-700 border focus:border focus:border-blue-500 rounded-b-md p-3 outline-none"
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
      <div className="flex flex-row justify-end mt-3 w-full">
        <button className="text-white bg-blue-500 rounded-md py-1 px-2">
          Create Note
        </button>
        {/* <Button */}
        {/*   color={"blue"} */}
        {/*   className={"mt-4 w-32"} */}
        {/*   // onClick={handleClick} */}
        {/*   type="button" */}
        {/* > */}
        {/* </Button> */}
      </div>
    </div>
  );
}
