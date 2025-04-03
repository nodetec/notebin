import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LanguageName } from "@uiw/codemirror-extensions-langs";

interface State {
  content: string;
  setContent: (content: string) => void;

  filename: string;
  setFilename: (filename: string) => void;

  lang: LanguageName;
  setLang: (lang: LanguageName) => void;

  description: string;
  setDescription: (description: string) => void;

  until: number | undefined;
  setUntil: (until: number) => void;

  pageHistory: number[];
  setPageHistory: (pageHistory: number[]) => void;

  currentPageIndex: number;
  setCurrentPageIndex: (currentPageIndex: number) => void;
}

export const useAppState = create<State>()(
  persist(
    (set) => ({
      content: "",
      setContent: (content) => set({ content }),

      filename: "",
      setFilename: (filename) => set({ filename }),

      lang: "typescript",
      setLang: (lang) => set({ lang }),

      description: "",
      setDescription: (description) => set({ description }),

      until: undefined,
      setUntil: (until) => set({ until }),

      pageHistory: [],
      setPageHistory: (pageHistory) => set({ pageHistory }),

      currentPageIndex: 0,
      setCurrentPageIndex: (currentPageIndex) => set({ currentPageIndex }),
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
    },
  ),
);
