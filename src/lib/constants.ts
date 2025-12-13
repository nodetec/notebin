// export const DEFAULT_RELAYS = ["wss://relay.ammetronics.com"];

const FALLBACK_RELAYS = [
  "wss://nos.lol",
  "wss://relay.damus.io",
  "wss://relay.snort.social",
];

function normalizeRelayUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  const withScheme = value.includes("://") ? value : `wss://${value}`;
  const normalized = withScheme.replace(/\/+$/, "");

  if (normalized.startsWith("wss://") || normalized.startsWith("ws://")) {
    return normalized;
  }
  if (normalized.startsWith("https://")) {
    return `wss://${normalized.slice("https://".length)}`;
  }
  if (normalized.startsWith("http://")) {
    return `ws://${normalized.slice("http://".length)}`;
  }

  return null;
}

function parseRelays(envValue: string | undefined): string[] {
  if (!envValue) return [];

  const relays = envValue
    .split(",")
    .map(normalizeRelayUrl)
    .filter((relay): relay is string => Boolean(relay));

  return [...new Set(relays)];
}

const envRelays = parseRelays(
  process.env.NEXT_PUBLIC_NOSTR_RELAYS ?? process.env.NOSTR_RELAYS,
);

export const DEFAULT_RELAYS = envRelays.length > 0 ? envRelays : FALLBACK_RELAYS;

