"use client";

import { Input } from "~/components/ui/input";
import { useAppState } from "~/store";

export function FilenameInput() {
  const setFilename = useAppState((state) => state.setFilename);
  return (
    <Input
      placeholder="filename"
      className="w-52 rounded-md py-0 font-mono"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setFilename(e.target.value)
      }
    />
  );
}
