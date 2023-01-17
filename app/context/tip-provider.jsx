"use client";

import { createContext, useState } from "react";

export const TipContext = createContext({
  noteAddress: '',
  customValue: '',
});

export default function TipProvider({ children }) {
  const [tipInfo, setTipInfo] = useState({
    noteAddress: '',
    customValue: '',
  });

  return (
    <TipContext.Provider value={{ tipInfo, setTipInfo }}>
      {children}
    </TipContext.Provider>
  );
}
