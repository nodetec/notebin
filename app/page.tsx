"use client";
import { useState } from "react";
import Editor from "./Editor";

const HomePage = () => {
  const [filetype, setFiletype] = useState("markdown");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [tagInputValue, setTagInputValue] = useState<string>("");
  const [tagsList, setTagsList] = useState<string[]>([]);

  return (
    <div className="w-full mx-auto flex-1">
      <Editor
        filetype={filetype}
        setFiletype={setFiletype}
        text={text}
        setText={setText}
        title={title}
        setTitle={setTitle}
        tagsList={tagsList}
        setTagsList={setTagsList}
        tagInputValue={tagInputValue}
        setTagInputValue={setTagInputValue}
      />
    </div>
  );
};

export default HomePage;
