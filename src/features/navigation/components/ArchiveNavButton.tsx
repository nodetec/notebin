"use client";

import { ArchiveIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppState } from "~/store";

export function ArchiveNavButton() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setPageHistory = useAppState((state) => state.setPageHistory);
  const setCurrentPageIndex = useAppState((state) => state.setCurrentPageIndex);

  const handleClick = async () => {
    setPageHistory([]);
    setCurrentPageIndex(0);
    await queryClient.invalidateQueries({
      queryKey: ["snippets"],
    });
    router.push("/archive");
  };

  return (
    <Button className="font-mono" variant="outline" onClick={handleClick}>
      <ArchiveIcon />
      <span className="hidden md:block">Archive</span>
    </Button>
  );
}
