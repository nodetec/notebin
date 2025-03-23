"use client";

import { Input } from "~/components/ui/input";
import { useAppState } from "~/store";

export function DescriptionInput() {
  const setDescription = useAppState((state) => state.setDescription);
  const description = useAppState((state) => state.description);

  return (
    <Input
      value={description}
      placeholder="description"
      className="my-8 max-w-4xl rounded-md py-5 font-mono text-sm"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setDescription(e.target.value)
      }
    />
  );
}
