"use client";
import { HOST } from "./utils/constants";
import dynamic from "next/dynamic";
import "@uiw/react-textarea-code-editor/dist.css";
import TextInput from "./TextInput";
import Truncate from "./Truncate";
import { BsFillTagFill } from "react-icons/bs";
import { Fragment, useState } from "react";
import Button from "./Button";
import { AiOutlineShareAlt } from "react-icons/ai";
import SharePopup from "./SharePopup";
import { getTagValues } from "./lib/utils";
import { usePathname } from "next/navigation";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: true }
);

const NoteDisplay = ({ event, filetype }: any) => {
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const content = event.content;
  const title = getTagValues("subject", event.tags);
  const pathname = usePathname();
  let tagsList: any = getTagValues("tags", event.tags);
  if (tagsList) tagsList = tagsList.split(",");

  return (
    <Fragment>
      <div className="rounded-md border-2 border-secondary flex-1">
        <div className="bg-secondary p-2 flex items-center justify-between">
          <div className="flex gap-2 w-full items-center justify-between">
            {filetype ? (
              <p className="text-accent font-semibold pl-2">{filetype}</p>
            ) : (
              <p className="text-accent font-semibold pl-2">note</p>
            )}
            <div className="flex items-center gap-2">
              <Truncate
                content={content}
                iconOnly
                color="neutralLight"
                variant="ghost"
                title="Copy to clipboard"
              />
              <Button
                color="neutralLight"
                variant="ghost"
                title="Share note"
                icon={<AiOutlineShareAlt />}
                onClick={() => setIsSharePopupOpen(true)}
              />
            </div>
          </div>
        </div>
        <div className="flex h-[36rem] overflow-y-auto flex-col md:flex-row">
          <div className="flex flex-col w-full h-full overflow-auto">
            {title && (
              <textarea
                required
                rows={1}
                className="bg-primary border-none focus:border-none resize-none font-medium text-2xl px-6 pt-6 pb-0 w-full overflow-hidden focus:ring-0"
                value={title}
                placeholder="Title..."
                disabled
              />
            )}

            <div className="grow">
              <CodeEditor
                className="w-full focus:border focus:border-blue-500 p-3 outline-none min-h-full note-cursor-text"
                value={content}
                language={filetype}
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
      {tagsList && (
        <div className="rounded-b-md border-x-2 border-b-2 border-secondary p-1 pt-2 -mt-1 flex items-center justify-between gap-4">
          <TextInput
            icon={<BsFillTagFill className="w-4 h-4" />}
            tagsList={tagsList}
            disabled
          />
        </div>
      )}
      <SharePopup
        link={`${HOST}${pathname}`}
        title="Share to"
        isOpen={isSharePopupOpen}
        setIsOpen={setIsSharePopupOpen}
      />
    </Fragment>
  );
};

export default NoteDisplay;
