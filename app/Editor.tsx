import { LANGUAGES } from "./constants";
import dynamic from "next/dynamic";
import "@uiw/react-textarea-code-editor/dist.css";
import TextInput from "./TextInput";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: true }
);

const Editor = ({ syntax, setSyntax, text, setText, tagsList, setTagsList, tagInputValue, setTagInputValue, event }: any) => {

  const validateTagsInputKeyDown = (event: any) => {
    const TAG_KEYS = ["Enter", ",", " "];
    if (TAG_KEYS.some((key) => key === event.key)) {
      event.preventDefault();
      if (tagInputValue) {
        setTagsList(Array.from(new Set([...tagsList, tagInputValue])));
        setTagInputValue("");
      }
    }
  };

  return (
    <div className="rounded-md border-2 border-zinc-400 dark:border-neutral-700">
      <div className="bg-zinc-300 dark:bg-neutral-800 p-2">
        <input className="bg-zinc-200 text-neutral-900 dark:bg-neutral-900 dark:text-zinc-300 border-0 outline-0 focus:ring-0 text-sm rounded-md"
          type="text"
          list="syntax-languages"
          placeholder="syntax"
          value={syntax}
          disabled={!!event}
          onChange={(e) => setSyntax(e.target.value)}
        />
        <datalist id="syntax-languages">
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </datalist>
      </div>
      <div className="overflow-auto h-[34rem]">
        <CodeEditor
          className="w-full focus:border focus:border-blue-500 p-3 outline-none h-full"
          value={!!event ? event?.content : text}
          language={!!event ? event?.tags[0][1] : syntax}
          placeholder="Enter your note..."
          autoCapitalize="none"
          onChange={(evn) => setText(evn.target.value)}
          disabled={!!event}
          padding={25}
          style={{
            fontSize: 15,
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
        />
      </div>
      <div className="bg-zinc-300 dark:bg-neutral-800 p-2">
        <TextInput
          label="Tags"
          placeholder={event ? "" : "Enter tags"}
          tagsList={event ? event.tags[4][1].split(",") : tagsList}
          setTagsList={event ? () => {} : setTagsList}
          value={tagInputValue}
          disabled={!!event}
          onKeyDown={validateTagsInputKeyDown}
          onChange={(e) => setTagInputValue(e.target.value)}
        />
      </div>
    </div>
  )
}

export default Editor
