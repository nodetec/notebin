"use client";
import { useState } from "react";
import NoteOptions from "./NoteOptions";

export default function NoteArea({ user }: any) {
  const [text, setText] = useState("");

  console.log(user)

  const handleChange = (event: any) => {
    setText(event.target.value);
    // console.log(text);
  };
  return (
    <div className="flex flex-row gap-1">
      <div className="w-2/3 h-full">
        <textarea
          className="w-full h-[100vh] 2xl:h-[50vh] focus:border focus:border-blue-500 rounded-md p-3 outline-none dark:bg-slate-700 dark:text-white"
          rows={5}
          value={text}
          onChange={handleChange}
          placeholder="Enter your note..."
        />
      </div>
      <div className="bg-slate-800 w-1/3">
        <NoteOptions text={text} />
      </div>
    </div>
  );
}
