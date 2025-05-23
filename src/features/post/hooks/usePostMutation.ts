import { useMutation } from "@tanstack/react-query";
import type { LanguageName } from "@uiw/codemirror-extensions-langs";
import { type EventTemplate, nip19 } from "nostr-tools";
import type { EventPointer } from "nostr-tools/nip19";
import { redirectToSnippet } from "~/actions/redirectToSnippet";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { finishEvent } from "~/lib/nostr/finishEvent";
import { parseUint8Array } from "~/lib/nostr/parseUint8Array";
import { publish } from "~/lib/nostr/publish";
import { getExtension } from "~/lib/utils";
import { useAppState } from "~/store";

interface PostSnippetPayload {
  content: string;
  filename: string;
  lang: LanguageName;
  description?: string;
  publicKey: string;
  secretKey?: string;
  writeRelays?: string[];
  tags?: string[];
}

async function postSnippet(payload: PostSnippetPayload) {
  const tags: string[][] = [
    ["l", payload.lang],
    ["name", payload.filename],
    ["description", payload.description ?? ""],
  ];

  if (payload.tags) {
    tags.push(...payload.tags.map((tag) => ["t", tag]));
  }

  const extension = getExtension(payload.filename);

  if (extension) {
    tags.push(["extension", extension]);
  }

  const eventTemplate: EventTemplate = {
    kind: 1337,
    content: payload.content,
    tags: tags,
    created_at: Math.floor(Date.now() / 1000),
  };

  let relays: string[] = DEFAULT_RELAYS;

  if (payload.writeRelays) {
    relays = payload.writeRelays;
  }

  const secretKey = parseUint8Array(payload.secretKey);

  const event = await finishEvent(eventTemplate, secretKey);

  if (relays.length > 0 && event) {
    await publish(event, relays);

    const eventPointer: EventPointer = {
      id: event.id,
      relays: relays,
      author: event.pubkey,
      kind: event.kind,
    };

    const nevent = nip19.neventEncode(eventPointer);
    redirectToSnippet(nevent);
    useAppState.getState().setContent("");
    useAppState.getState().setFilename("");
    useAppState.getState().setDescription("");
    useAppState.getState().setLang("typescript");
    useAppState.getState().setTags([]);
  }
}

export function usePostMutation() {
  return useMutation({
    mutationFn: postSnippet,
    onError: (error) => {
      console.error("Failed to post snippet:", error);
    },
  });
}
