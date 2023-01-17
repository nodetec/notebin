import { LANGUAGES } from "./utils/constants";
import dynamic from "next/dynamic";
import "@uiw/react-textarea-code-editor/dist.css";
import TextInput from "./TextInput";
import Button from "./Button";
import { BsLightningChargeFill } from "react-icons/bs";
import { useContext, useState } from "react";
import Popup from "./Popup";
import { TipContext } from "./context/tip-provider.jsx";
import PopupInput from "./PopupInput";
import { HiOutlineClipboardCheck, HiOutlineClipboardCopy } from "react-icons/hi";
import { TbClipboardX } from "react-icons/tb";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: true }
);

const Editor = ({ filetype, setFiletype, text, setText, tagsList, setTagsList, tagInputValue, setTagInputValue, event }: any) => {
  const [tagsInputError, setTagsInputError] = useState("");
  const [{ copied, error }, setClipboard] = useState({ copied: false, error: false });

  const [isOpen, setIsOpen] = useState(false);
    // @ts-ignore
  const { tipInfo, setTipInfo } = useContext(TipContext);

  const handleSetTagsList = (list: string[]) => {
    if (list.length > 5) {
      setTagsInputError("You can only have up to 5 tags");
      return;
    }
    setTagsInputError("");
    setTagsList(list);
  }

  const validateTagsInputKeyDown = (event: any) => {
    const TAG_KEYS = ["Enter", ",", " "];
    if (TAG_KEYS.some((key) => key === event.key)) {
      event.preventDefault();
      if (tagInputValue) {
        if ( tagsList.length < 5 ) {
          setTagsList(Array.from(new Set([...tagsList, tagInputValue])));
          setTagInputValue("");
        }
        else {
          setTagsInputError("You can only have up to 5 tags");
        }
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
    <div>
      <div className="rounded-md border-2 border-zinc-400 dark:border-neutral-700">
        <div className="bg-zinc-300 dark:bg-neutral-800 p-2 flex items-center justify-between">
          <input
            className="bg-zinc-200 text-neutral-900 dark:bg-neutral-900 dark:text-zinc-300 border-0 outline-0 focus:ring-0 text-sm rounded-md"
            type="text"
            list="filetypes"
            placeholder="filetype"
            value={filetype || event?.tags[0][1]}
            disabled={!!event}
            onChange={(e) => setFiletype(e.target.value)}
          />
          <datalist id="filetypes">
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </datalist>
          {event ? (
            <Button
              color="yellow"
              variant="outline"
              onClick={handleTip}
              size="sm"
              icon={<BsLightningChargeFill size="14" />}
            >
              tip
            </Button>
          ) : (
            <Button
              color="yellow"
              variant="outline"
              onClick={() => setIsOpen(true)}
              size="sm"
              icon={<BsLightningChargeFill size="14" />}
            >
              Accept Tips
            </Button>
          )}
        </div>
        <div className="overflow-auto h-[34rem] relative group">
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
          { event ? 
            <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 text-xs">
              <Button
                color="neutralDark"
                size="sm"
                variant="solid"
                className={copied  ? "text-green-600 dark:text-green-400" : error ? "text-red-600 dark:text-red-400" : ""}
                icon={ copied ? 
                  <HiOutlineClipboardCheck className="w-4 h-4" /> :
                  error ? <TbClipboardX className="w-4 h-4" /> :
                    <HiOutlineClipboardCopy className="w-4 h-4" />}
                onClick={() => {
                  navigator.clipboard.writeText(event.content).then(() => {
                    setClipboard({ copied: true, error: false });
                  }).catch((_) => {
                      setClipboard({ copied: false, error: true });
                    }).finally(() => {
                      setTimeout(() => {
                        setClipboard({ copied: false, error: false });
                      }, 2000);
                    })
                }}
              >{
                copied ? "Copied to clipboard" : error ? "Error copying to clipboard" : "Copy to clipboard"
              }
              </Button>
            </div>
          : null}
        </div>
        <div className="bg-zinc-300 dark:bg-neutral-800 p-2">
          <TextInput
            label="Tags"
            placeholder={event ? "" : "Enter tags"}
            tagsList={
              event?.tags[4][1] ? event?.tags[4][1].split(",") : tagsList
            }
            setTagsList={event ? () => {} : handleSetTagsList}
            value={tagInputValue}
            disabled={!!event}
            error={tagsInputError}
            onKeyDown={validateTagsInputKeyDown}
            onChange={(e) => setTagInputValue(e.target.value)}
          />
        </div>
      </div>
      <Popup title="Tip Info" isOpen={isOpen} setIsOpen={setIsOpen}>
        <PopupInput
          value={tipInfo.noteAddress}
          onChange={(e) =>
            setTipInfo((current: any) => ({
              ...current,
              noteAddress: e.target.value,
            }))
          }
          label="Node Address"
        />
        <PopupInput
          value={tipInfo.customValue}
          onChange={(e) =>
            setTipInfo((current: any) => ({
              ...current,
              customValue: e.target.value,
            }))
          }
          label="Custom Record (if applicable)"
        />
        <Button className="w-full" onClick={() => setIsOpen(false)}>Done</Button>
      </Popup>
    </div>
  );
};

export default Editor
