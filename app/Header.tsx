import Link from "next/link";
import React from "react";
import { BsLightningChargeFill } from "react-icons/bs";

export default function Header() {
  return (
    <div>
      <nav className="flex justify-between items-center pb-12">
        <Link className="text-3xl font-bold dark:text-white" href="/">
          <span className="text-zinc-200">Note</span>
          <span className="text-blue-400">Bin</span>
        </Link>
        <div className="flex flex-row">
          <Link href="/">
            <button className="font-bold flex flex-row justify-center items-center bg-yellow-300 text-sm dark:text-neutral-900 py-1 px-2 rounded-md">
              <BsLightningChargeFill
                className="mr-1"
                // color={"#111"}
                size="14"
              />
              connect
            </button>
          </Link>
          {/* <Link href="/"> */}
          {/*   <MdAccountCircle className="text-zinc-300" size="30" /> */}
          {/* </Link> */}
        </div>
      </nav>
    </div>
  );
}
