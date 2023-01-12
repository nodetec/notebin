"use client";
import NoteArea from "./NoteArea";
import Header from "./Header";
import { useState } from "react";

export default function Home() {
  const [user, setUser] = useState("test");
  return (
    <>
      <Header onSetUser={setUser} />
      <NoteArea user={user} />
    </>
  );
}
