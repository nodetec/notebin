"use client";
import Link from "next/link";
import { BsArchive } from "react-icons/bs";
import { SlNote } from "react-icons/sl";
import { usePathname } from "next/navigation";

export default function HeaderButtons() {
  const pathname = usePathname();
  return (
    <>
      {pathname !== "/" && (
        <Link href="/">
          <SlNote
            className="text-accent opacity-70 hover:opacity-100 text-center"
            size="24"
          />
        </Link>
      )}

      {pathname !== "/archive" && (
        <Link href="/archive?page=1">
          <BsArchive
            className="text-accent opacity-70 hover:opacity-100 text-center"
            size="24"
          />
        </Link>
      )}
    </>
  );
}
