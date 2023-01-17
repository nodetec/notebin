"use client";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import { TbNote } from "react-icons/tb";
import Popup from "./Popup";

import Button from "./Button";
import AccountButton from "./AccountButton";

import { KeysContext } from "./context/keys-provider.jsx";
import ConnectedRelaysStatus from "./ConnectedRelaysStatus";

export default function Header() {
  // @ts-ignore
  const { keys, setKeys } = useContext(KeysContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isLightningConnected, setIsLightningConnected] = useState(false);

  useEffect(() => {
    const shouldReconnect = localStorage.getItem("shouldReconnect");

    const getConnected = async (shouldReconnect: string) => {
      let enabled = false;
      // @ts-ignore
      if (shouldReconnect === "true" && !webln.executing) {
        try {
          // @ts-ignore
          enabled = await window.webln.enable();
          setIsLightningConnected(true);
          // @ts-ignore
          const publicKey = await nostr.getPublicKey();
          console.log("public key", publicKey);
          setKeys({ privateKey: "", publicKey: publicKey });
        } catch (e: any) {
          console.log(e.message);
        }
      }
      return enabled;
    };

    if (shouldReconnect === "true") {
      getConnected(shouldReconnect);
    }
  }, []);

  const handleClick = async () => {
    setIsOpen(true);
  };

  const connectLightningHandler = async () => {
    // @ts-ignore
    if (typeof window.webln !== "undefined") {
      // @ts-ignore
      await window.webln.enable();
      // @ts-ignore
      const publicKey = await nostr.getPublicKey();
      setKeys({ private: "", public: publicKey });
      localStorage.setItem("shouldReconnect", "true");
    }
    console.log("connected to lightning");
    setIsLightningConnected(true);
    setIsOpen(false);
  };

  /* const shortenHash = (hash: string) => {
    if (hash) {
      return hash.substring(0, 4) + "..." + hash.substring(hash.length - 4);
    }
  }; */

  return (
    <div>
      <nav className="flex justify-between flex-row items-stretch pb-12 gap-4">
        <div className="flex items-center justify-between w-full gap-4 flex-col sm:flex-row">
          <div className="flex items-center gap-4">
            <Link
              className="text-3xl font-bold dark:text-zinc-200 text-neutral-800"
              href="/"
            >
              <div className="flex flex-row">
                <TbNote
                  className="text-neutral-800 dark:text-zinc-200"
                  size="40"
                />
                <span className="dark:text-zinc-200 text-neutral-800 ml-1">
                  note
                </span>
                <span className="text-blue-400">bin</span>
              </div>
            </Link>
          </div>
          <div className="flex gap-4">
            <ConnectedRelaysStatus />
            {isLightningConnected && keys?.publicKey ? (
              <AccountButton publicKey={keys?.publicKey} />
            ) : (
              <Button
                color="zincDark"
                variant="outline"
                onClick={handleClick}
                size="sm"
              >
                login
              </Button>
            )}
          </div>
        </div>
      </nav>
      <Popup title="Generate Keys" isOpen={isOpen} setIsOpen={setIsOpen}>
        <Button
          className="w-full"
          onClick={connectLightningHandler}
          color="yellow"
          size="sm"
          icon={<BsLightningChargeFill size="14" />}
        >
          {isLightningConnected ? "connected" : "Login with Lightning"}
        </Button>
      </Popup>
    </div>
  );
}
