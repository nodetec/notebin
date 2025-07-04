"use client";

import type { LanguageName } from "@uiw/codemirror-extensions-langs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { languages } from "~/lib/languages";
import { useAppState } from "~/store";

export function LanguageSelect() {
  const setLang = useAppState((state) => state.setLang);
  const lang = useAppState((state) => state.lang);
  return (
    <Select onValueChange={(e: LanguageName) => setLang(e)} value={lang}>
      <SelectTrigger className="h-6 w-[125px] rounded-md text-xs">
        <SelectValue className="font-mono" placeholder="language" />
      </SelectTrigger>
      <SelectContent className="font-mono text-xs">
        {languages.map((object) => (
          <SelectItem
            key={object.value}
            className="font-mono text-xs"
            value={object.value}
          >
            {object.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
