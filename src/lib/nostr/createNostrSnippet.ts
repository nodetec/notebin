import type { Event } from "nostr-tools";
import { decodeBase64Content } from "../utils";

export interface NostrSnippet {
  event: Event;
  content: string;
  createdAt: number;
  language?: string;
  name?: string;
  description?: string;
  extension?: string;
  runtime?: string;
  license?: string;
  dependencies?: string[];
  repo?: string;
  isBase64Encoded?: boolean;
}

export function createNostrSnippet(event: Event) {
  const { content, isBase64Encoded } = decodeBase64Content(event.content);

  const snippet: NostrSnippet = {
    event,
    content,
    createdAt: event.created_at,
    language: event.tags.find((tag) => tag[0] === "l")?.[1],
    name: event.tags.find((tag) => tag[0] === "name")?.[1],
    description: event.tags.find((tag) => tag[0] === "description")?.[1],
    extension: event.tags.find((tag) => tag[0] === "extension")?.[1],
    runtime: event.tags.find((tag) => tag[0] === "runtime")?.[1],
    license: event.tags.find((tag) => tag[0] === "license")?.[1],
    isBase64Encoded,
  };

  return snippet;
}
