"use client";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import { TbNote } from "react-icons/tb";
import { useNostr, dateToUnix } from "nostr-react";
import Popup from "./Popup";

import Button from "./Button";

import { KeysContext } from "./context/keys-provider.jsx";

export default function Header() {
  const { connectedRelays, isLoading } = useNostr();
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
  };

  const relayConnectionStateColors = isLoading
    ? "bg-yellow-500 dark:bg-yellow-400 text-yellow-500 dark:text-yellow-400"
    : connectedRelays
    ? "bg-green-600 dark:bg-green-400 text-green-600 dark:text-green-400"
    : "bg-neutral-500 dark:bg-neutral-400 text-neutral-500 dark:text-neutral-400";

  const shortenHash = (hash: string) => {
    if (hash) {
      return hash.substring(0, 4) + "..." + hash.substring(hash.length - 4);
    }
  };

  return (
    <div>
      <nav className="flex justify-between flex-row items-stretch pb-12 gap-4">
        <div className="flex items-center justify-between w-full gap-4">
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
            <Link
              className="text-xl dark:text-zinc-400 text-neutral-800 hover:dark:text-zinc-500"
              href={`/profile/` + keys.publicKey}
            >
              Profile
            </Link>
          </div>
          <div className="flex gap-4">
            <p
              className={`py-2 px-4 rounded-full bg-opacity-25 dark:bg-opacity-20 text-xs flex items-center gap-2 font-semibold
              ${relayConnectionStateColors}
            `}
            >
              <span
                className={`w-2 h-2 rounded-full inline-block ${relayConnectionStateColors}`}
              />
              {connectedRelays
                ? `Connected to ${connectedRelays.length} relays 📡`
                : "Connecting..."}
            </p>
            {isLightningConnected && keys?.publicKey ? (
              <span className="dark:bg-blue-500 text-zinc-900 rounded-full py-1 px-2">
                {shortenHash(keys?.publicKey)}
              </span>
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
