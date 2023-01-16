"use client";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { BsLightningChargeFill } from "react-icons/bs";
/* import { GiOstrich } from "react-icons/gi"; */
// import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import { TbNote } from "react-icons/tb";
import Popup from "./Popup";

import Button from "./Button";
import { NostrService } from "./utils/NostrService";
import { RELAYS } from "./constants";
// import TextInput from "./TextInput";

import { RelayContext } from "./context/relay-provider.jsx";
import { KeysContext } from "./context/keys-provider.jsx";

export default function Header() {
  // @ts-ignore
  const { relays, setRelays } = useContext(RelayContext);
  // @ts-ignore
  const { keys, setKeys } = useContext(KeysContext);
  const [isOpen, setIsOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [isLightningConnected, setIsLightningConnected] = useState(false);
  /* const [keys, setKeys] = useState({ private: "", public: "" }); */
  // const { mounted, relays, connecting, error, isLightningConnected, setIsLightningConnected } = useRelays();

  useEffect(() => {
    const shouldReconnect = localStorage.getItem("shouldReconnect");

    const connectToRelays = async () => {
      try {
        setConnecting(true);
        const new_relays = await NostrService.connect(RELAYS);
        await setRelays(new_relays);
      } catch (e: any) {
        setError("Error Connecting to Relays");
        console.log(e.message);
      } finally {
        setConnecting(false);
      }
    };

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
          setKeys({ privateKey: "", publicKey: publicKey });
        } catch (e: any) {
          console.log(e.message);
        }
      }
      return enabled;
    };
    if (!relays) {
      connectToRelays();
    }

    if (shouldReconnect === "true") {
      getConnected(shouldReconnect);
    }
  }, []);

  const handleClick = async () => {
    setIsOpen(true);
  };

  const { systemTheme, theme, setTheme } = useTheme();
  const isDarkTheme = (theme === "system" ? systemTheme : theme) === "dark";

  const toggleTheme = () => {
    if (isDarkTheme) {
      setTheme("light");
      document.documentElement.setAttribute("data-color-mode", "light");
    } else {
      setTheme("dark");
      document.documentElement.setAttribute("data-color-mode", "dark");
    }
  };

  const connectLightningHandler = async () => {
    // @ts-ignore
    if (typeof window.webln !== "undefined") {
      // @ts-ignore
      const enabled = await window.webln.enable();
      // @ts-ignore
      const publicKey = await nostr.getPublicKey();
      setKeys({ private: "", public: publicKey });
      localStorage.setItem("shouldReconnect", "true");
    }
    console.log("connected to lightning");
    setIsLightningConnected(true);
  };

  const relayConnectionStateColors = connecting
    ? "bg-yellow-500 dark:bg-yellow-400 text-yellow-500 dark:text-yellow-400"
    : error
    ? "bg-red-500 dark:bg-red-400 text-red-500 dark:text-red-400"
    : relays
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
        <div className="flex items-center w-full gap-4">
          <Link
            className="text-3xl font-bold dark:text-zinc-200 text-neutral-800 flex-1"
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
          <p
            className={`py-2 px-4 rounded-full bg-opacity-25 dark:bg-opacity-20 text-xs flex items-center gap-2 font-semibold
              ${relayConnectionStateColors}
            `}
          >
            <span
              className={`w-2 h-2 rounded-full inline-block ${relayConnectionStateColors}`}
            />
            {relays
              ? `Connected to ${relays.length} relays 📡`
              : "Connecting..."}
          </p>
          {/* {mounted ? ( */}
          {/*   <Button */}
          {/*     onClick={toggleTheme} */}
          {/*     icon={ */}
          {/*       isDarkTheme ? ( */}
          {/*         <HiOutlineSun className="w-6 h-6 text-zinc-200" /> */}
          {/*       ) : ( */}
          {/*         <HiOutlineMoon className="w-6 h-6 text-neutral-800" /> */}
          {/*       ) */}
          {/*     } */}
          {/*     size="sm" */}
          {/*     color={isDarkTheme ? "neutralDark" : "neutralLight"} */}
          {/*     variant="ghost" */}
          {/*   /> */}
          {/* ) : null} */}
          {isLightningConnected && keys?.publicKey ? (
            <span className="dark:bg-blue-500 text-zinc-900 rounded-full py-1 px-2" >{shortenHash(keys?.publicKey)}</span>
          ) : (
            <Button
              color="zincDark"
              variant="outline"
              onClick={handleClick}
              size="sm"
              // icon={<BsLightningChargeFill size="14" />}
            >
              login
            </Button>
          )}
        </div>
      </nav>
      <Popup title="Generate Keys" isOpen={isOpen} setIsOpen={setIsOpen}>
        {/* <TextInput */}
        {/*   value={keys.private} */}
        {/*   onChange={(e) => */}
        {/*     setKeys((current) => ({ */}
        {/*       ...current, */}
        {/*       private: e.target.value, */}
        {/*     })) */}
        {/*   } */}
        {/*   label="Private Key" */}
        {/* /> */}
        {/* <TextInput */}
        {/*   value={keys.public} */}
        {/*   onChange={(e) => */}
        {/*     setKeys((current) => ({ ...current, public: e.target.value })) */}
        {/*   } */}
        {/*   label="Pubilc Key" */}
        {/* /> */}
        {/* <Buttons> */}
        {/*   <Button color="neutralDark" onClick={() => setIsOpen(false)}> */}
        {/*     Cancel */}
        {/*   </Button> */}
        {/*   <Button onClick={() => setIsOpen(false)}>Generate</Button> */}
        {/* </Buttons> */}
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
