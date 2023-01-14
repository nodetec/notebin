// Nostr Init
import "websocket-polyfill";
import {
  relayInit,
  generatePrivateKey,
  getPublicKey,
  // getEventHash,
  signEvent,
} from "nostr-tools";
import type { Relay } from "nostr-tools";
import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";

export enum EventKind {
  Metadata = 0,
  Text = 1,
  RelayRec = 2,
  Contacts = 3,
  DM = 4,
  Deleted = 5,
}

export type Event = {
  id?: string;
  kind: EventKind;
  pubkey?: string;
  content: string;
  tags: string[][];
  created_at: number;
  sig?: string;
};

export namespace NostrService {
  export async function connect(relayUrl: string) {
    const relay = relayInit(relayUrl);
    await relay.connect();
    console.log(relay);

    relay.on("connect", () => {
      console.log(`connected to ${relay.url}`);
    });

    relay.on("error", () => {
      console.log(`failed to connect to ${relay.url}`);
    });

    return relay;
  }

  export function genPrivateKey(): string {
    return generatePrivateKey();
  }

  export function genPublicKey(privateKey: string): string {
    return getPublicKey(privateKey);
  }

  export async function getEvent(id: string, relay: Relay) {
    console.log("GETEVENT ID:", id);
    console.log("GETEVENT RELAY:", relay);

    return new Promise<Event | null>((resolve) => {
      let sub = relay.sub([
        {
          ids: [id],
        },
      ]);
      sub.on("event", (event: Event) => {
        console.log("we got the event we wanted:", event);
        resolve(event);
      });
      sub.on("eose", () => {
        sub.unsub();
      });
    });
  }

  export function createEvent(
    publicKey: string,
    content: string,
    syntax: string,
    tagsList: string[]
  ) {
    const event: Event = {
      kind: 2222,
      pubkey: publicKey,
      created_at: Math.floor(Date.now() / 1000),
      // tags: ["syntax", syntax],
      tags: [
        ["syntax", syntax],
        ["client", "notebin"],
        ["tags", tagsList.join(",")],
        ["ln_address", "TODO"],
      ],
      content: content,
    };

    return event;
  }

  function serializeEvent(evt: Event) {
    return JSON.stringify([
      0,
      evt.pubkey,
      evt.created_at,
      evt.kind,
      evt.tags,
      evt.content,
    ]);
  }

  function getEventHash(event: Event): string {
    return sha256(serializeEvent(event)).toString(Hex);
  }

  export async function addEventData(
    event: Event
  ) {
    event.id = getEventHash(event);
    event = await window.nostr.signEvent(event);
    return event;
  }
}
