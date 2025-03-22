import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LanguageName } from "@uiw/codemirror-extensions-langs";
import { initialContent } from "~/lib/initialContent";

interface State {
  content: string;
  setContent: (content: string) => void;

  filename: string | undefined;
  setFilename: (filename: string | undefined) => void;

  lang: LanguageName;
  setLang: (lang: LanguageName) => void;

  description: string | undefined;
  setDescription: (description: string | undefined) => void;
}

export const useAppState = create<State>()(
  persist(
    (set) => ({
      content: initialContent,
      setContent: (content) => set({ content }),

      filename: undefined,
      setFilename: (filename) => set({ filename }),

      lang: "typescript",
      setLang: (lang) => set({ lang }),

      description: undefined,
      setDescription: (description) => set({ description }),
    }),
    {
      name: "notebin-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        content: state.content,
        filename: state.filename,
        lang: state.lang,
        description: state.description,
      }),
    }
  )
);
