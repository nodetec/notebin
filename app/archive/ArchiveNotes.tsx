"use client";
import { useNostr } from "nostr-react";
import { useState, useEffect, useContext } from "react";
import { KeysContext } from "../context/keys-provider";
import type { Event } from "nostr-tools";
import Pagination from "../Pagination";
import { useSearchParams } from "next/navigation";
import Card from "../u/[npub]/Card";
import Button from "../Button";
import { ImSearch } from "react-icons/im";
import { HiUserAdd } from "react-icons/hi";
import BasicDatePicker from "../BasicDatePicker";

export default function ArchiveNotes({
  numPages,
  events,
  filter,
  setFilter,
  postPerPage,
}: any) {
  // @ts-ignore
  const { keys: loggedInUserKeys } = useContext(KeysContext);

  const searchParams = useSearchParams();

  const pageSearchParam = searchParams.get("page");

  const currentPage = pageSearchParam ? parseInt(pageSearchParam) : 1;

  const [since, setSince] = useState(undefined);
  const [until, setUntil] = useState(undefined);
  const [sinceDate, setSinceDate] = useState(null);
  const [untilDate, setUntilDate] = useState(null);
  const [isDatePickerSinceEmpty, setIsDatePickerSinceEmpty] = useState(false);
  const [isDatePickerUntilEmpty, setIsDatePickerUntilEmpty] = useState(false);

  useEffect(() => {
    console.log("searchParams", searchParams.get("page"));
  }, [searchParams]);

  useEffect(() => {
    let datesAreOnSameDay = true;
    if (sinceDate && untilDate) {
      datesAreOnSameDay = areDatesOnSameDay(sinceDate, untilDate);
    }

    if (
      typeof since === "number" &&
      typeof until === "number" &&
      until > since &&
      !datesAreOnSameDay
    ) {
      dateFilter(since, until);
    } else if (isDatePickerSinceEmpty && isDatePickerUntilEmpty) {
      // @ts-ignore
      dateFilter(undefined, undefined);
    }
  }, [since, until]);

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
          ...filter,
          authors: followedAuthors,
        });
        sub.unsub();
      });
    });
  }

  const handleExploreFilter = (e: any) => {
    e.preventDefault();
    setFilter({
      ...filter,
      authors: undefined,
    });
  }

  const areDatesOnSameDay = (date1: Date, date2: Date) => {
    if (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    ) {
      return true;
    }

    return false;
  };

  const handleDates = (unixTime: Number, label: string, date: Date, isDatePickerEmpty: boolean) => {
    if (label === "since") {
      // @ts-ignore
      setSince(unixTime);
      // @ts-ignore
      setSinceDate(date);
      setIsDatePickerSinceEmpty(isDatePickerEmpty);
    } else if (label === "until") {
      // @ts-ignore
      setUntil(unixTime);
      // @ts-ignore
      setUntilDate(date);
      setIsDatePickerUntilEmpty(isDatePickerEmpty);
    }
  };

  const dateFilter = (since: Number, until: Number) => {
    setFilter({
      ...filter,
      since,
      until,
    });

    if (isDatePickerSinceEmpty && isDatePickerUntilEmpty) {
      if (!filter.authors?.length) {
        handleExploreFilter;
      } else {
        handleFollowFilter;
      }
    }
  };

  return (
    <>
      <div className="flex gap-2 bg-secondary rounded-md p-2">
        <Button
          variant={filter.authors?.length ? "ghost" : "solid"}
          onClick={handleExploreFilter}
          size="sm"
          icon={<ImSearch />}
          className="w-full"
        >
          explore
        </Button>
        <Button
          variant={filter.authors?.length ? "solid" : "ghost"}
          onClick={handleFollowFilter}
          icon={<HiUserAdd />}
          size="sm"
          className="w-full"
        >
          following
        </Button>
      </div>
      <div className="flex flex-wrap justify-start gap-3 rounded-md p-2 basic-date-pickers">
        <div className="mr-3">
          <BasicDatePicker
            label="since"
            // @ts-ignore
            until={until}
            // @ts-ignore
            untilDate={untilDate}
            handleDates={handleDates}
          />
        </div>
        <div className="mr-3">
          <BasicDatePicker
            label="until"
            // @ts-ignore
            since={since}
            // @ts-ignore
            sinceDate={sinceDate}
            handleDates={handleDates}
          />
        </div>
      </div>
      <ul className="flex flex-col gap-4">
        {events
          .slice(
            currentPage * postPerPage - postPerPage,
            currentPage * postPerPage
          )
          .map((event: Event) => {
            return <Card key={event.id} event={event} profile />;
          })}
      </ul>
      {numPages > 1 ? <Pagination numPages={numPages} /> : null}
    </>
  );
}
