"use client";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import { TbNote } from "react-icons/tb";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { RelayContext } from "./context/relay-provider.jsx";

import Button from "./Button";
// import Buttons from "./Buttons";
// import TextInput from "./TextInput";
import { NostrService } from "./utils/NostrService";

export default function Header({ onSetUser }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [keys, setKeys] = useState({ private: "", public: "" });
  const [isLightningConnected, setIsLightningConnected] = useState(false);

  // @ts-ignore
  const { relay, setRelay } = useContext(RelayContext);

  useEffect(() => {
    const shouldReconnect = sessionStorage.getItem("shouldReconnect");

    const getConnected = async (shouldReconnect: string) => {
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

    if (!relay) {
      const new_relay = await NostrService.connect(
        "wss://nostr-pub.wellorder.net"
      );
      setRelay(new_relay);
    }
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
          <Button
            color="yellow"
            onClick={handleClick}
            size="sm"
            icon={<BsLightningChargeFill size="14" />}
          >
            login
          </Button>
        </div>
      </nav>
      {isOpen && (
        <>
          <div className="z-50 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm border-2 border-neutral-500 rounded-md">
            <Button
              icon={<IoMdCloseCircleOutline size={24} />}
              className="absolute w-fit right-0 top-0 text-neutral-400"
              onClick={() => setIsOpen(false)}
              color="transparent"
            />
            <div className="bg-neutral-900 flex flex-col justify-center items-stretch gap-4 p-6 rounded-md shadow-lg ">
              <h3 className="text-xl text-neutral-400 text-center pb-4">
                Generate Keys
              </h3>
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
                onClick={connectLightningHandler}
                color="yellow"
                size="sm"
                icon={<BsLightningChargeFill size="14" />}
              >
                {isLightningConnected ? "connected" : "Login with Lightning"}
              </Button>
            </div>
          </div>
          <div
            className="bg-neutral-900 opacity-50 fixed z-40 w-full h-full"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
}
