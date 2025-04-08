"use client";

import { XIcon } from "lucide-react";
import { useAppState } from "~/store";

export function InputTagList() {
  const tags = useAppState((state) => state.tags);
  const setTags = useAppState((state) => state.setTags);

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    console.log("Removing tag:", tagToRemove);
    console.log("Current tags:", tags);
    console.log("New tags:", newTags);
    setTags(newTags);
  };

  return (
    <>
      {tags.length > 0 && (
        <div className="mx-1 mt-8 flex flex-wrap gap-2 font-mono text-sm">
          {tags.map((tag) => (
            <div
              key={tag}
              className="group flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-500/50 hover:text-blue-500"
                aria-label={`Remove tag ${tag}`}
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
