import "websocket-polyfill";
import { relayInit } from "nostr-tools";
import type { Relay } from "nostr-tools";

class NostrService {
  private static instance: NostrService;
  private relayUrls: string[];
  public relays: Relay[] = [];

  private constructor(relayUrls: string[]) {
    this.relayUrls = relayUrls;
    this.connect().then((relays) => {
      this.relays = relays;
    });
  }

  public static getInstance(relayUrls: string[]): NostrService {
    console.log("INSTANCE", this.instance)
    if (!NostrService.instance) {
      NostrService.instance = new NostrService(relayUrls);
    }
    return NostrService.instance;
  }

  private async connect() {
    const relays: Relay[] = [];
    if (this.relays.length === 0) {
      this.relayUrls.forEach(async (relayUrl) => {
        const relay = relayInit(relayUrl);
        await relay.connect();
        relays.push(relay);
        relay.on("connect", () => {
          console.log(`✅ [SERVER] connected to ${relay.url}`);
        });
        relay.on("disconnect", () => {
          console.log(`🚪 [SERVER] disconnected from ${relay.url}`);
        });
        relay.on("error", () => {
          console.log(`❌ [SERVER] failed to connect to ${relay.url}`);
        });
      });
    }
    return relays;
  }
}
// }

export const ns = NostrService.getInstance([
  "wss://nostr-pub.wellorder.net",
  "wss://relay.nostr.ch",
  "wss://relay.snort.social",
]);
