"use client";
import Link from "next/link";
import React, { useState } from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import { GiOstrich } from "react-icons/gi";
import { TbNote } from "react-icons/tb";

import Button from "./Button";
import Buttons from "./Buttons";

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
          <div className="flex flex-row">
            <TbNote
              // color={"#111"}
              size="40"
            />
            <span className="text-zinc-200">note</span>
            <span className="text-blue-400">bin</span>
          </div>
        </Link>
        <div className="flex gap-4 flex-row">
          {/* <Link href="/"> */}
          <Button
            color="neutralLight"
            onClick={handleClick}
            size="sm"
            icon={
              <GiOstrich
                // color={"#111"}
                size="14"
              />
            }
          >
            login
          </Button>
          {/* <Button onClick={() => setIsOpen(true)}>Open Popup</Button> */}
          <Button
            onClick={handleClick}
            color="yellow"
            size="sm"
            icon={
              <BsLightningChargeFill
                // color={"#111"}
                size="14"
              />
            }
          >
            connect
          </Button>
        </div>
      </nav>
      <div>
        {isOpen && (
          <div className="z-50 fixed top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="bg-neutral-900 opacity-50"></div>
            <div className="bg-neutral-900 flex flex-col justify-center items-center p-6 rounded-md shadow-lg">
              <h3 className="text-xl text-neutral-400 pb-5">Generate Keys</h3>
              <input
                type="text"
                placeholder="Private Key"
                className="px-3 py-2 mb-2 rounded w-full text-neutral-400 bg-neutral-700"
              />
              <input
                type="text"
                placeholder="Public Key"
                className="px-3 py-2 mb-2 rounded w-full text-neutral-400 bg-neutral-700"
              />
              <Buttons>
                <Button color="neutralDark" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsOpen(false)}>Generate</Button>
              </Buttons>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
