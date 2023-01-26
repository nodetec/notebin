"use client";
import { useContext, useEffect, useState } from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import Popup from "./Popup";

import Button from "./Button";
import AccountButton from "./AccountButton";

import { KeysContext } from "./context/keys-provider.jsx";
import PopupInput from "./PopupInput";
import { generatePrivateKey, getPublicKey } from 'nostr-tools'
import { ImShuffle } from "react-icons/im";

export default function Login() {
  // @ts-ignore
  const { keys, setKeys } = useContext(KeysContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isLightningConnected, setIsLightningConnected] = useState(false);
  const [hidePrivateKey, setHidePrivateKey] = useState(true);

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
          // console.log("public key", publicKey);
          setKeys({ privateKey: "", publicKey });
        } catch (e: any) {
          console.log(e.message);
        }
      }
      return enabled;
    };

    if (shouldReconnect === "true") {
      getConnected(shouldReconnect);
    }
  }, [setKeys]);

  const loginHandler = async () => {
    // @ts-ignore
    if (typeof window.webln !== "undefined") {
      // @ts-ignore
      await window.webln.enable();
      // @ts-ignore
      const publicKey = await nostr.getPublicKey();
      setKeys({ private: "", publicKey: publicKey });
      localStorage.setItem("shouldReconnect", "true");
    }
    console.log("connected to lightning");
    setIsLightningConnected(true);
    setIsOpen(false);
  };

  const generateKeys = () => {
    const privateKey = generatePrivateKey();
    const publicKey = getPublicKey(privateKey);
    setKeys({ privateKey, publicKey });
  };

  const handleClick = async () => {
    setIsOpen(true);
  };

  return (
    <>
      {isLightningConnected && keys?.publicKey ? (
        <AccountButton pubkey={keys?.publicKey} />
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

      <Popup title="Generate Keys" isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="flex items-center gap-2">
          <PopupInput
            label="Private Key"
            value={keys?.privateKey}
            onChange={(e) => setKeys({ ...keys, privateKey: e.target.value })}
            password={keys.privateKey}
            isPassword={hidePrivateKey}
            toggleIsPassword={() => setHidePrivateKey(current => !current)}
          />
        </div>
        <PopupInput
          label="Public Key"
          value={keys?.publicKey}
          onChange={(e) => setKeys({ ...keys, publicKey: e.target.value })}
        />
        <div className="flex items-center gap-2 ">
          <Button
            className="w-full"
            variant="outline"
            onClick={generateKeys}
            size="sm"
            icon=<ImShuffle />
          >
            Generate Keys
          </Button>
          <Button
            className="w-full"
            onClick={loginHandler}
            size="sm"

          >
          Login
          </Button>
        </div>
        <h2 className="text-center">OR</h2>
        <Button
          className="w-full"
          onClick={loginHandler}
          size="sm"
          icon={<BsLightningChargeFill />}
        >
          {isLightningConnected ? "connected" : "Login with NIP-07 Extension"}
        </Button>
      </Popup>
    </>
  );
}
