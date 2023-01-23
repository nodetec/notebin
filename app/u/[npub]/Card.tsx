import Link from "next/link";
import { useProfile } from "nostr-react";
import { Event, nip19 } from "nostr-tools";
import { DetailedHTMLProps, FC, LiHTMLAttributes, ReactNode } from "react";
import { BsFillFileEarmarkCodeFill, BsFillTagFill } from "react-icons/bs";
import { FaCalendarAlt } from "react-icons/fa";
import { DUMMY_PROFILE_API } from "../../utils/constants";
import { shortenHash } from "../../lib/utils";

interface NoteProps
  extends DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement> {
  event: Event;
  profile?: boolean;
  dateOnly?: boolean;
}

const Card: FC<NoteProps> = ({
  event,
  profile = false,
  dateOnly = false,
  ...props
}) => {
  const { tags, content, created_at: createdAt, id: noteId } = event;
  const getValues = (name: string) => {
    const [itemTag] = tags.filter((tag: string[]) => tag[0] === name);
    const [, item] = itemTag || [, undefined];
    return item;
  };

  const { data } = useProfile({
    pubkey: event.pubkey,
  });

  const npub = nip19.npubEncode(event.pubkey);

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
        href={`/${nip19.noteEncode(noteId!)}`}
        className="p-5 flex flex-col-reverse gap-4 justify-between"
      >
        <div className="flex flex-col gap-3">
          {title ? (
            <h3 className="text-2xl font-semibold text-light twolines">
              {title}
            </h3>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-5 opacity-70">
            {profile ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <img
                    className="rounded-full w-6 h-6 object-cover"
                    src={
                      data?.picture ||
                      DUMMY_PROFILE_API(data?.name || shortenHash(npub)!)
                    }
                    alt={data?.name}
                  />
                  <div>
                    <span className="text-light">{data?.name || npub}</span>
                  </div>
                </div>
              </div>
            ) : null}
            <DatePosted dateOnly={dateOnly} timestamp={createdAt} />
            <FileType type={getValues("filetype")} />
            {actualTags.length > 1 ? <NoteTags tags={actualTags} /> : null}
          </div>
          <div className="flex flex-col sm:flex-row gap-5 opacity-70">
            <div className="twolines opacity-70">{content}</div>
          </div>
        </div>
        {markdownImageContent?.groups?.filename ? (
          <img
            className="rounded-md self-center w-full h-auto object-cover"
            src={markdownImageContent?.groups?.filename}
            alt={markdownImageContent?.groups?.title}
          />
        ) : null}
      </Link>
    </li>
  );
};

const InfoContainer = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-2">{children}</div>
);

const DatePosted = ({
  timestamp,
  dateOnly,
}: {
  timestamp: number;
  dateOnly?: boolean;
}) => {
  const timeStampToDate = (timestamp: number) => {
    let date = new Date(timestamp * 1000);
    if (dateOnly) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    }
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

export default Card;
