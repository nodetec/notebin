"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { useAppState } from "~/store";

export function TagsInput() {
  const setTags = useAppState((state) => state.setTags);
  const tags = useAppState((state) => state.tags);

  const [inputValue, setInputValue] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !tags.includes(trimmedValue)) {
        setTags([...tags, trimmedValue]);
        setInputValue("");
      }
    }
  }

  return (
    <div className="flex gap-2 font-mono text-sm">
      <Input
        value={inputValue}
        placeholder="tags"
        className="max-w-4xl rounded-t-none py-5 pr-20 dark:bg-background"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
          handleKeyDown(e)
        }
      />
    </div>
  );
}
