import { ArchiveIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export function ArchiveNavButton() {
  return (
    <Link href="/archive">
      <Button variant="outline">
        <ArchiveIcon />
        Archive
      </Button>
    </Link>
  );
}
