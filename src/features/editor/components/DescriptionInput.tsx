"use client";

import { Input } from "~/components/ui/input";
import { useAppState } from "~/store";

export function DescriptionInput() {
  const setDescription = useAppState((state) => state.setDescription);
  return (
    <Input
      placeholder="description"
      className="my-8 max-w-4xl rounded-md py-0 font-mono"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setDescription(e.target.value)
      }
    />
  );
}
