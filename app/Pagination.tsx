"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({ numPages }: any) {
  let isFirst;
  let isLast;
  let prevPage: string;
  let nextPage: string;

  const searchParams = useSearchParams();

  const pageSearchParam = searchParams.get("page");

  const currentPage = pageSearchParam ? parseInt(pageSearchParam) : 1;

  isFirst = currentPage === 1;
  isLast = currentPage === numPages;
  prevPage = `/archive?page=${currentPage - 1}`;
  nextPage = `/archive?page=${currentPage + 1}`;

  const router = useRouter();

  function handleNext() {
    router.push(nextPage);
  }

  function handlePrev() {
    router.push(prevPage);
  }

  if (numPages === 1) return <></>;

  return (
    <ul className="flex justify-between">
      {!isFirst && (
        <button onClick={handlePrev}>
          <li className="bg-blue-700 py-2 px-3 text-white rounded-md">Prev</li>
        </button>
      )}
      {/* TODO: cut middle pagination and put ... in middle after unreasonable amount of numbers */}
      {/* {Array.from({ length: numPages }, (_, i) => ( */}
      {/*   <Link href={`/blog/page/${i + 1}`} key={`page-${i}`}> */}
      {/*     <li className={styles.page__number}> */}
      {/*       {i + 1} */}
      {/*     </li> */}
      {/*   </Link> */}
      {/* ))} */}

      {!isLast && (
        <button onClick={handleNext}>
          <li className="bg-blue-700 py-2 px-3 text-white rounded-md">Next</li>
        </button>
      )}
    </ul>
  );
}
