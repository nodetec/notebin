"use client";

import { Input } from "~/components/ui/input";
import { useAppState } from "~/store";

export function FilenameInput() {
  const setFilename = useAppState((state) => state.setFilename);
  const filename = useAppState((state) => state.filename);

  return (
    <Input
      value={filename}
      placeholder="filename & extension"
      className="w-52 rounded-md py-0 font-mono text-sm"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setFilename(e.target.value)
      }
    />
  );
}
