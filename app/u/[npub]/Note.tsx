import Link from "next/link";
import { nip19 } from "nostr-tools";
import { DetailedHTMLProps, FC, LiHTMLAttributes, ReactNode } from "react";
import { BsFillFileEarmarkCodeFill, BsFillTagFill } from "react-icons/bs";
import { FaCalendarAlt } from "react-icons/fa";

interface NoteProps
  extends DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement> {
  content: string;
  createdAt: number;
  noteId: string;
  tags: string[][];
}

const Note: FC<NoteProps> = ({
  content,
  createdAt,
  noteId,
  tags,
  ...props
}) => {
  const getValues = (name: string) => {
    const [itemTag] = tags.filter((tag: string[]) => tag[0] === name);
    const [, item] = itemTag || [, undefined];
    return item;
  };

  const actualTags = getValues("tags").split(",");
  const title = getValues("subject");
  const markdownImageContent =
    /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<title>\".*\")?\)/g.exec(content);

  return (
    <li
      className="rounded-md hover:shadow-sm hover:scale-101 transition-transform hover:shadow-accent dark:bg-secondary text-accent"
      {...props}
    >
      <Link
        href={`/${nip19.noteEncode(noteId)}`}
        className="p-5 flex flex-row justify-between"
      >
        <div className="flex flex-col gap-3">
          {title ? (
            <h3 className="text-2xl font-semibold text-light twolines">
              {title}
            </h3>
          ) : null}
          <div className="flex flex-col sm:flex-row items-center gap-5 opacity-70">
            <DatePosted timestamp={createdAt} />
            <FileType type={getValues("filetype")} />
            {actualTags.length > 1 ? <NoteTags tags={actualTags} /> : null}
          </div>
          <div className="flex flex-col sm:flex-row gap-5 opacity-70">
            <div className="twolines opacity-70">{content}</div>
          </div>
        </div>
        {markdownImageContent?.groups?.filename ? (
          <img
            className="rounded-md self-center w-12 h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 object-cover"
            src={markdownImageContent?.groups?.filename}
            title={markdownImageContent?.groups?.title}
          />
        ) : null}
      </Link>
    </li>
  );
};

const InfoContainer = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-2">{children}</div>
);

const DatePosted = ({ timestamp }: { timestamp: number }) => {
  const timeStampToDate = (timestamp: number) => {
    let date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <InfoContainer>
      <span>
        <FaCalendarAlt className="w-4 h-4 text-current" />
      </span>
      <span>{timeStampToDate(timestamp)}</span>
    </InfoContainer>
  );
};

const NoteTags = ({ tags }: { tags: string[] }) => (
  <InfoContainer>
    <span>
      <BsFillTagFill className="w-4 h-4 text-current" />
    </span>
    <ul className="flex items-center gap-2">
      {tags.map((tag: string) => (
        <li key={tag}>#{tag}</li>
      ))}
    </ul>
  </InfoContainer>
);

const FileType = ({ type }: { type: string }) => (
  <InfoContainer>
    <span>
      <BsFillFileEarmarkCodeFill className="w-4 h-4 text-current" />
    </span>
    <span>{type}</span>
  </InfoContainer>
);

export default Note;
