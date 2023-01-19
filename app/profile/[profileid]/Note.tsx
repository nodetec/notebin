import Link from "next/link";
import { DetailedHTMLProps, FC, Fragment, LiHTMLAttributes } from "react";

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
    const [,item] = itemTag || [, ""];
    return item
  }

  const actualTags = getValues("tags").split(",");
  const title = getValues("subject");

  const timeStampToDate = (timestamp: number) => {
    let date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <li
      className="rounded-md hover:shadow-sm hover:scale-101 transition-transform hover:shadow-accent dark:bg-secondary text-accent"
      {...props}
    >
      <Link href={`/note/${noteId}`} className="p-4 flex flex-col gap-2">
        {title ? <h3 className="text-2xl font-semibold text-light">{title}</h3> : null}
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70">
            {timeStampToDate(createdAt)}
          </span>
          {actualTags.length > 0 ? (
            <Fragment>
              <span className="w-[2px] h-full block bg-accent opacity-70" />
              <ul className="flex items-center gap-2">
                {actualTags.map((tag: string) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </Fragment>
          ) : null}
        </div>
        <div className="twolines opacity-70">{content}</div>
      </Link>
    </li>
  );
};

export default Note;
