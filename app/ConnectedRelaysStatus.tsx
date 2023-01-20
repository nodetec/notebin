"use client";
import { useNostr } from "nostr-react";
import { TbChevronDown } from "react-icons/tb";

const ConnectedRelaysStatus = () => {
  const { connectedRelays, isLoading } = useNostr();
  const connectedRelaysCount = connectedRelays.length;
  const error = "";

  const relayConnectionStateColors = isLoading
    ? {
        bg: "bg-yellow-500 dark:bg-yellow-400",
        fg: "text-yellow-500 dark:text-yellow-400",
      }
    : error
    ? { bg: "bg-red-500 dark:bg-red-400", fg: "text-red-500 dark:text-red-400" }
    : connectedRelays
    ? {
        bg: "bg-green-600 dark:bg-green-400",
        fg: "text-green-600 dark:text-green-400",
      }
    : {
        bg: "bg-neutral-500 dark:bg-neutral-400",
        fg: "text-neutral-500 dark:text-neutral-400",
      };

  return (
    <button
      className={`py-2 px-4 rounded-full bg-opacity-25 dark:bg-opacity-20 text-xs flex items-center gap-2 font-semibold relative border border-transparent focus:border-current group
              ${connectedRelaysCount > 0 ? "hover:border-current" : ""}
              ${relayConnectionStateColors.bg} ${
        relayConnectionStateColors.fg
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full inline-block ${relayConnectionStateColors.bg}`}
      />
      <span>
        {isLoading
          ? "Connecting..."
          : connectedRelays
          ? `Connected to ${connectedRelaysCount} relay${
              connectedRelaysCount > 1 ? "s" : ""
            } 📡`
          : "Not connected"}
      </span>
      {connectedRelaysCount > 0 ? (
        <span>
          <TbChevronDown className="w-4 h-4" />
        </span>
      ) : null}
      {connectedRelaysCount > 0 ? (
        <span
          className={`absolute z-50 hidden group-focus:flex mx-auto min-w-max -bottom-4 right-0 items-center gap-4 flex-col translate-y-full border border-current p-4 rounded-md bg-accent dark:bg-primary ${relayConnectionStateColors.fg}`}
        >
          {connectedRelays.map((relay) => (
            <span key={relay.url} className="">
              {relay.url}
            </span>
          ))}
        </span>
      ) : null}
    </button>
  );
};

export default ConnectedRelaysStatus;
