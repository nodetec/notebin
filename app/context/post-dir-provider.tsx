"use client";

import { createContext, useState, useEffect, ReactNode } from "react";

export const PostDirContext = createContext<{
  isCol: boolean;
  togglePostDir: () => void;
}>({
  isCol: false,
  togglePostDir: () => {},
});

const PostDirProvider = ({ children }: { children: ReactNode }) => {
  const [isCol, setIsCol] = useState(false);

  useEffect(() => {
    setIsCol(JSON.parse(localStorage.getItem("post-dir") || "false"));
  }, []);

  useEffect(() => {
    localStorage.setItem("post-dir", JSON.stringify(isCol));
  }, [isCol]);

  const togglePostDir = () => {
    setIsCol((current) => !current);
  };

  return (
    <PostDirContext.Provider value={{ isCol, togglePostDir }}>
      {children}
    </PostDirContext.Provider>
  );
};

export default PostDirProvider;
