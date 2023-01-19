"use client";

import { useNostr } from "nostr-react";
import { NostrService } from "../../utils/NostrService";

export default function FollowButton({
  loggedInUserPublicKey,
  currentContacts,
  profilePublicKey,
  action,
}: any) {
  const { publish } = useNostr();
  const { connectedRelays } = useNostr();

  const handleFollow = async (e: any) => {
    e.preventDefault();

    let newContactList;

    if (action === "follow") {
      newContactList = [...currentContacts, ["p", profilePublicKey]];
    } else {
      newContactList = currentContacts.filter(
        (pair: string) => pair[1] !== profilePublicKey
      );
    }

    let event = NostrService.createEvent(
      3,
      loggedInUserPublicKey,
      "",
      newContactList
    );

    try {
      event = await NostrService.addEventData(event);
    } catch (err: any) {
      return;
    }

    let eventId: any = null;
    eventId = event?.id;

    connectedRelays.forEach((relay) => {
      let sub = relay.sub([
        {
          ids: [eventId],
        },
      ]);
      sub.on("event", (event: Event) => {
        console.log("we got the event we wanted:", event);
      });
      sub.on("eose", () => {
        console.log("EOSE");
        sub.unsub();
      });
    });

    const pubs = publish(event);

    // @ts-ignore
    for await (const pub of pubs) {
      pub.on("ok", () => {
        console.log("OUR EVENT WAS ACCEPTED");
      });

      await pub.on("seen", async () => {
        console.log("OUR EVENT WAS SEEN");
      });

      pub.on("failed", (reason: any) => {
        console.log("OUR EVENT HAS FAILED");
      });
    }
  };

  return (
    <button
      className="bg-blue-400 text-slate-900 p-2 rounded-md mt-3 hover:bg-blue-500"
      onClick={handleFollow}
    >
      {action}
    </button>
  );
}
