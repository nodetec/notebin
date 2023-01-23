"use client";
import { useProfile } from "nostr-react";
import { useNostr } from "nostr-react";
import { useEffect, useContext } from "react";
import { KeysContext } from "../context/keys-provider";
import type { Event } from "nostr-tools";
import Pagination from "../Pagination";
import { useSearchParams } from "next/navigation";
import Card from "../u/[npub]/Card";

export default function ArchiveNotes({
  numPages,
  events,
  setCurrentPage,
  setFilter,
  postPerPage,
}: any) {
  // @ts-ignore
  const { keys: loggedInUserKeys } = useContext(KeysContext);

  const searchParams = useSearchParams();

  const pageSearchParam = searchParams.get("page");

  const currentPage = pageSearchParam ? parseInt(pageSearchParam) : 1;

  useEffect(() => {
    console.log("searchParams", searchParams.get("page"));
  }, [searchParams]);

  const { connectedRelays } = useNostr();

  function handleFollowFilter(e: any) {
    e.preventDefault();

    // let followedAuthors: Set<string> = new Set();
    let followedAuthors: string[];

    connectedRelays.forEach((relay) => {
      let sub = relay.sub([
        {
          authors: [loggedInUserKeys.publicKey],
          kinds: [3],
          limit: 100,
        },
      ]);
      sub.on("event", (event: Event) => {
        // eventArray.push(event);
        // TODO: we could go through each event and add each lis of followers to a set, but for now we'll just use one
        followedAuthors = event.tags.map((pair: string[]) => pair[1]);
        console.log("followedAuthors", followedAuthors);
      });
      sub.on("eose", () => {
        console.log("EOSE");
        setFilter({
          kinds: [2222],
          authors: followedAuthors,
          limit: 100,
        });
        sub.unsub();
      });
    });
  }

  function handleExploreFilter(e: any) {
    e.preventDefault();
    setFilter({
      kinds: [2222],
      limit: 100,
    });
  }

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={handleExploreFilter}
          className="bg-blue-400 rounded-md text-xl w-40"
        >
          explore
        </button>
        <button
          onClick={handleFollowFilter}
          className="bg-blue-400 rounded-md text-xl w-40"
        >
          following
        </button>
      </div>
      <ul className="flex flex-col gap-4 text-center md:text-start">
        {events
          .slice(
            currentPage * postPerPage - postPerPage,
            currentPage * postPerPage
          )
          .map((event: Event) => {
            return <Card key={event.id} event={event} profile />;
          })}
      </ul>
      <Pagination setCurrentPage={setCurrentPage} numPages={numPages} />
    </>
  );
}
