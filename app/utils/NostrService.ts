// Nostr Init
import "websocket-polyfill";
import {
  relayInit,
  generatePrivateKey,
  getPublicKey,
  getEventHash,
  signEvent,
} from "nostr-tools";
import type { Relay, Event } from "nostr-tools";

export namespace NostrService {
  export async function connect(relayUrl: string) {
    const relay = relayInit(relayUrl);
    await relay.connect();

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

  export async function post(relay: Relay, privateKey: string, event: Event) {
    event.id = getEventHash(event);
    event.sig = signEvent(event, privateKey);

    let pub = relay.publish(event);
    pub.on("ok", () => {
      console.debug(`${relay.url} has accepted our event`);
    });

    pub.on("seen", () => {
      console.debug(`we saw the event on ${relay.url}`);
    });

    pub.on("failed", (reason: any) => {
      console.error(`failed to publish to ${relay.url}: ${reason}`);
    });

    return event.id;
  }
}
