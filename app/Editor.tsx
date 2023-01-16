import { LANGUAGES } from "./constants";
import dynamic from "next/dynamic";
import "@uiw/react-textarea-code-editor/dist.css";
import TextInput from "./TextInput";
import Button from "./Button";
import { BsLightningChargeFill } from "react-icons/bs";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: true }
);

const Editor = ({ filetype, setFiletype, text, setText, tagsList, setTagsList, tagInputValue, setTagInputValue, event }: any) => {

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

  const handleTip = async () => {
    // @ts-ignore
    if (typeof window.webln !== "undefined") {
      const nodeAddress = event.tags[2][1];
      const customRecord = event.tags[3][1];
      // @ts-ignore
      const result = await webln.keysend({
        destination: nodeAddress,
        amount: 1,
        customRecords: {
          696969: customRecord,
        },
      });
      console.log("Tip Result:", result);
    }
  };

  return (
    <div className="rounded-md border-2 border-zinc-400 dark:border-neutral-700">
      <div className="bg-zinc-300 dark:bg-neutral-800 p-2 flex items-center justify-between">
        <input className="bg-zinc-200 text-neutral-900 dark:bg-neutral-900 dark:text-zinc-300 border-0 outline-0 focus:ring-0 text-sm rounded-md"
          type="text"
          list="filetypes"
          placeholder="filetype"
          value={filetype || event?.tags[0][1]}
          disabled={!!event}
          onChange={(e) => setFiletype(e.target.value)}
        />
        <datalist id="filetypes">
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </datalist>
        {event ?
          <Button
            color="yellow"
            onClick={handleTip}
            size="sm"
            icon={<BsLightningChargeFill size="14" />}
          >
            tip
          </Button> :
          null
        }
      </div>
      <div className="overflow-auto h-[34rem]">
        <CodeEditor
          className="w-full focus:border focus:border-blue-500 p-3 outline-none min-h-full"
          value={event ? event?.content : text}
          language={event ? event?.tags[0][1] : filetype}
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
          tagsList={event?.tags[4][1] ? event?.tags[4][1].split(",") : tagsList}
          setTagsList={event ? () => { } : setTagsList}
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
