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
    syntax: string
  ) {
    const event: Event = {
      kind: 2222,
      pubkey: publicKey,
      created_at: Math.floor(Date.now() / 1000),
      // tags: ["syntax", syntax],
      tags: [
        ["syntax", syntax],
        ["client", "notebin"],
        ["tags", "TODO"],
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

  function validateEvent(event: Event) {
    if (event.id !== getEventHash(event)) {
      console.log("event id does not match event hash");
      return false;
    }

    if (typeof event.content !== "string") {
      console.log("event content is not a string");
      return false;
    }

    if (typeof event.created_at !== "number") {
      console.log("event created_at is not a number");
      return false;
    }

    if (!Array.isArray(event.tags)) {
      console.log("event tags is not an array");
      return false;
    }

    for (const tag of event.tags) {
      if (!Array.isArray(tag)) {
        console.log("event tag is not an array");
        return false;
      }

      for (let j = 0; j < tag.length; j++) {
        if (typeof tag[j] === "object") return false;
      }
    }

    return true;
  }

  export async function addEventData(relay: Relay, privateKey: string, event: Event) {
    // event.id = getEventHash(event);
    event.id = getEventHash(event);

    console.log("HELLO");

    console.log(event);

    console.log("validating event");
    const valid = validateEvent(event);
    console.log("validated event:", valid);

    event = await window.nostr.signEvent(event);
    // event.sig = signEvent(event, privateKey);
    console.log("SIG:", event);
    console.log(event);



    return event;
  }
}
