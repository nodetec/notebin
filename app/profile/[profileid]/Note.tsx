import Link from "next/link";

export default function Note({ content, index, createdAt, id, tags }: any) {
  let title = tags.filter(function (tag: any) {
    return tag[0] === "subject";
  });

  if (title[0]) {
    console.log("title:", title[0][1]);
    title = title[0][1];
  } else {
    title = "(Untitled)";
  }

  function truncateString(str: any) {
    let truncated = "";
    let count = 0;
    for (let i = 0; i < str.length; i++) {
      let char = str.charAt(i);
      let code = str.codePointAt(i);
      if (code >= 0x10000) {
        // Surrogate pair: add 2 to count
        count += 2;
      } else {
        count++;
      }
      if (count <= 156) {
        truncated += char;
      } else {
        truncated += "...";
        break;
      }
    }
    return truncated;
  }

  function timeStampToDate(timestamp: any) {
    let date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <li className="border-solid border-b border-zinc-700 pb-6 mb-6">
      <Link href={`/note/${id}`}>
        <div className="flex flex-row hover:scale-101 ease-in-out duration-300">
          <span className="dark:text-zinc-500 mr-3 text-xl">0{index + 1}</span>
          <div className="dark:text-gray-200 md:flex md:flex-row w-full">
            <div className="flex flex-col w-full">
              <div className="flex flex-row justify-between items-center pb-3 w-full">
                <div className="text-xl font-semibold">{title}</div>
                <div className="sm:text-sm dark:text-zinc-600">
                  {timeStampToDate(createdAt)}
                </div>
              </div>
              <div className="text-zinc-500">{truncateString(content)}</div>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
