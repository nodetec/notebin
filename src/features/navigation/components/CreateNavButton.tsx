"use client";

import { PlusIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useAppState } from "~/store";

export function CreateNavButton() {
  const router = useRouter();
  const pathname = usePathname();

  const content = useAppState((state) => state.content);
  const filename = useAppState((state) => state.filename);
  const description = useAppState((state) => state.description);

  function handleClick() {
    if (content !== "" || filename !== "" || description !== "") {
      if (pathname === "/") {
        const confirmed = window.confirm("Your changes will be lost.");
        if (!confirmed) {
          return;
        }

        useAppState.getState().setContent("");
        useAppState.getState().setFilename("");
        useAppState.getState().setDescription("");
        useAppState.getState().setLang("typescript");

        return;
      }

      return router.push("/");
    }

    return router.push("/");
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={handleClick}>
          <PlusIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Create a new snippet</p>
      </TooltipContent>
    </Tooltip>
  );
}
