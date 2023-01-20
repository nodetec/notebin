import Link from "next/link";
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

  return (
    <li
      className="rounded-md hover:shadow-sm hover:scale-101 transition-transform hover:shadow-accent dark:bg-secondary text-accent"
      {...props}
    >
      <Link href={`/${noteId}`} className="p-5 flex flex-col gap-3">
        {title ? (
          <h3 className="text-2xl font-semibold text-light twolines">
            {title}
          </h3>
        ) : null}
        <div className="flex items-center gap-5 opacity-70">
          <DatePosted timestamp={createdAt} />
          <FileType type={getValues("filetype")} />
          {actualTags.length > 1 ? <NoteTags tags={actualTags} /> : null}
        </div>
        <div className="twolines opacity-70">{content}</div>
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
