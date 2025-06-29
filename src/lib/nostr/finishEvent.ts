import {
  type Event,
  type EventTemplate,
  finalizeEvent,
  getEventHash,
} from "nostr-tools";

export const finishEventWithSecretKey = (
  eventTemplate: EventTemplate,
  secretKey: Uint8Array<ArrayBufferLike>,
) => {
  const event = finalizeEvent(eventTemplate, secretKey);

  return event;
};

export async function finishEventWithExtension(t: EventTemplate) {
  let event = t as Event;
  try {
    if (nostr) {
      event.pubkey = await nostr.getPublicKey();
      event.id = getEventHash(event);
      event = (await nostr.signEvent(event)) as Event;
      return event;
    }
    console.error("nostr not defined");
    return null;
  } catch (err) {
    console.error("Error signing event", err);
    return null;
  }
}

export async function finishEvent(
  eventTemplate: EventTemplate,
  secretKey?: Uint8Array<ArrayBufferLike>,
) {
  let event: Event | null = null;
  console.log("secretKey", secretKey);
  if (secretKey) {
    event = finishEventWithSecretKey(eventTemplate, secretKey);
  } else {
    event = await finishEventWithExtension(eventTemplate);
  }

  return event;
}
