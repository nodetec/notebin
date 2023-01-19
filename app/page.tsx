"use client";
import { useState } from "react";
import Editor from "./Editor";
import CreatePostButton from "./CreatePostButton";

const HomePage = () => {
  const [filetype, setFiletype] = useState("markdown");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [tagInputValue, setTagInputValue] = useState<string>("");
  const [tagsList, setTagsList] = useState<string[]>([]);

  return (
    <div className="w-full mx-auto">
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
      <div className="pt-2">
        <CreatePostButton
          filetype={filetype}
          text={text}
          title={title}
          tagsList={tagsList}
        />
      </div>
    </div>
  );
};

export default HomePage;
