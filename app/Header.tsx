"use client";
import Link from "next/link";
import React, { useState } from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import { GiOstrich } from "react-icons/gi";

export default function Header({ onSetUser }: any) {
  // const [user, setUser] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  function handleClick() {
    onSetUser("chris");
    setIsOpen(true);
  }

  return (
    <div>
      <nav className="flex justify-between items-center pb-12">
        <Link className="text-3xl font-bold dark:text-white" href="/">
          <span className="text-zinc-200">Note</span>
          <span className="text-blue-400">Bin</span>
        </Link>
        <div className="flex gap-4 flex-row">
          {/* <Link href="/"> */}
          <button
            className="font-bold flex flex-row justify-center items-center bg-slate-300 text-sm dark:text-neutral-900 py-1 px-2 rounded-md"
            onClick={handleClick}
          >
            <GiOstrich
              className="mr-1"
              // color={"#111"}
              size="14"
            />
            login
          </button>
          {/* <button onClick={() => setIsOpen(true)}>Open Popup</button> */}
          <button
            className="font-bold flex flex-row justify-center items-center bg-yellow-300 text-sm dark:text-neutral-900 py-1 px-2 rounded-md"
            onClick={handleClick}
          >
            <BsLightningChargeFill
              className="mr-1"
              // color={"#111"}
              size="14"
            />
            connect
          </button>
        </div>
      </nav>
      <div>
        {isOpen && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="bg-gray-900 opacity-50"></div>
            <div className="bg-slate-800 p-6 rounded-md shadow-lg">
              <button onClick={() => setIsOpen(false)}>Close</button>
              <p>Popup Content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
