import { LANGUAGES, VALIDATION } from "./utils/constants";
import dynamic from "next/dynamic";
import "@uiw/react-textarea-code-editor/dist.css";
import TextInput from "./TextInput";
import Truncate from "./Truncate";
import { BsFillTagFill } from "react-icons/bs";
import { Fragment } from "react";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: true }
);

const NoteDisplay = ({ event }: any) => {
  return (
    <Fragment>
      <div className="rounded-md border-2 border-secondary">
        <div className="bg-secondary p-2 flex items-center justify-between">
          <div className="flex gap-2 w-full justify-between">
            <input
              className="bg-primary text-accent border-0 outline-0 focus:ring-0 text-sm rounded-md"
              type="text"
              list="filetypes"
              placeholder="filetype"
              // value={event.tags[0][1]}
              disabled={!!event}
            />
            <datalist id="filetypes">
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </datalist>
            <Truncate
              content={event.content}
              iconOnly
              color="neutralLight"
              variant="ghost"
            />
          </div>
        </div>
        <div className="flex h-[36rem] overflow-y-auto flex-col md:flex-row">
          <div className="flex flex-col w-full h-full overflow-auto">
            <textarea
              required
              rows={1}
              className="bg-primary border-none focus:border-none resize-none font-medium text-2xl px-6 pt-6 pb-0 w-full overflow-hidden focus:ring-0"
              // title={event.tags[5][1]}
              // value={event.tags[5][1]}
              placeholder="Title..."
              disabled
            />
            <span className="px-6 pt-0.5 text-xs text-red-500 hidden">
              {VALIDATION.required}
            </span>
            <div className="grow">
              <CodeEditor
                className={`w-full focus:border focus:border-blue-500 p-3 outline-none min-h-full "note-cursor-text"`}
                value={event.content}
                language={event.tags[0][1]}
                autoCapitalize="none"
                disabled
                padding={25}
                style={{
                  fontSize: 15,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-b-md border-x-2 border-b-2 border-secondary p-1 pt-2 -mt-1 flex items-center justify-between gap-4">
        <TextInput
          icon={<BsFillTagFill className="w-4 h-4" />}
          placeholder=""
          // tagsList={event?.tags[4][1].split(",")}
          disabled
        />
      </div>
    </Fragment>
  );
};

export default NoteDisplay;
