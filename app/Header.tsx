"use client";
import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import { useTheme } from "next-themes";
import { BsLightningChargeFill } from "react-icons/bs";
/* import { GiOstrich } from "react-icons/gi"; */
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import { TbNote } from "react-icons/tb";
import { RelayContext } from "./context/relay-provider.jsx";
import Popup from "./Popup";

import Button from "./Button";
// import TextInput from "./TextInput";
import { NostrService } from "./utils/NostrService";

export default function Header({ onSetUser }: any) {
  const [isOpen, setIsOpen] = useState(false);
  /* const [keys, setKeys] = useState({ private: "", public: "" }); */
  const [isLightningConnected, setIsLightningConnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  // @ts-ignore
  const { relay, setRelay } = useContext(RelayContext);

  useEffect(() => {
    const shouldReconnect = sessionStorage.getItem("shouldReconnect");
    setMounted(true);

    const getConnected = async (shouldReconnect: string) => {
      if (!relay) {
        const new_relay = await NostrService.connect(
          "wss://nostr-pub.wellorder.net"
        );
        setRelay(new_relay);
      }
      let enabled = false;
      // @ts-ignore
      if (shouldReconnect === "true" && !webln.executing) {
        // @ts-ignore
        enabled = await window.webln.enable();
        setIsLightningConnected(true);
      }
      return enabled;
    };

    if (shouldReconnect) {
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
      const enabled = await window.webln.enable();

      sessionStorage.setItem("shouldReconnect", "true");
    }
    console.log("connected to lightning");
    setIsLightningConnected(true);
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

  return (
    <div>
      <nav className="flex justify-between flex-row items-stretch pb-12 gap-4">
        <div className="flex justify-between items-center w-full gap-4">
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
          {mounted ? (
            <Button
              onClick={toggleTheme}
              icon={
                isDarkTheme ? (
                  <HiOutlineSun className="w-6 h-6 text-zinc-200" />
                ) : (
                  <HiOutlineMoon className="w-6 h-6 text-neutral-800" />
                )
              }
              size="sm"
              color={isDarkTheme ? "neutralDark" : "neutralLight"}
              variant="ghost"
            />
          ) : null}
        </div>
        <Button
          color="yellow"
          variant="outline"
          onClick={handleClick}
          size="sm"
          icon={<BsLightningChargeFill size="14" />}
        >
          login
        </Button>
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
