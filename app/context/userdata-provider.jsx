"use client";

import { createContext, useState } from "react";

export const UserDataContext = createContext(null);

export default function UserDataProvider({ children }) {
  let [userData, setUserData] = useState(null);

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}
