"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { RELAYS } from "../utils/constants";

interface IRelayContext {
  relays: string[];
  setRelays: (relays: string[]) => void;
  resetRelays: () => void;
  addRelay: (relay: string) => void;
  removeRelay: (relay: string) => void;
}

export const RelayContext = createContext<IRelayContext|null>(null);

const RelayProvider = ({ children }: { children: ReactNode }) => {
  const [relays, setRelays] = useState(RELAYS);

  useEffect(() => {
    setRelays(JSON.parse(localStorage.getItem("customRelays") || "[]"));
  }, []);

  useEffect(() => {
    localStorage.setItem("customRelays", JSON.stringify(relays));
  }, [relays])

  const resetRelays = () => {
    setRelays(RELAYS);
  }
  
  const addRelay = (relay: string) => {
    const newRelays = [...relays, relay];
    setRelays(newRelays);
  }

  const removeRelay = (relay: string) => {
    const newRelays = relays.filter((r) => r !== relay);
    setRelays(newRelays);
  }

  return (
    <RelayContext.Provider value={{ relays, setRelays, resetRelays, addRelay, removeRelay }}>
      {children}
    </RelayContext.Provider>
  );
}

export default RelayProvider;
