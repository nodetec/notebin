import Link from "next/link";

export default function Note({ title, index, created, id }: any) {
  return (
    <li className="border-solid border-b border-zinc-700 pb-3 mb-3">
      <Link href={`/note/${id}`}>
        <div className="flex flex-row hover:scale-101 ease-in-out duration-300">
          <span className="dark:text-zinc-500 mr-3 ">0{index + 1}</span>
          <div className="dark:text-gray-200 md:flex md:flex-row w-full md:justify-between">
            <div>{title}</div>
            {/* <div className="sm:text-sm dark:text-zinc-500 ml-auto self-end"> */}
            {/*   {dateString} */}
            {/* </div> */}
          </div>
        </div>
      </Link>
    </li>
  );
}
