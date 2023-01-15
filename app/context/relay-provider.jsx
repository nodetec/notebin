"use client";

import { createContext, useState } from "react";

export const RelayContext = createContext(null);

export default function RelayProvider({ children }) {
  let [relays, setRelays] = useState(null);

  return (
    <RelayContext.Provider value={{ relays, setRelays }}>
      {children}
    </RelayContext.Provider>
  );
}
