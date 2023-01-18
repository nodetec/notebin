"use client";
import { useNostr } from "nostr-react";
import { FormEvent, useContext, useState } from "react";
import { TbChevronDown, TbMinus, TbPlus } from "react-icons/tb";
import Button from "./Button";
import { RelayContext } from "./context/relay-provider";

const ConnectedRelaysStatus = () => {
  const { connectedRelays, isLoading } = useNostr();
  const connectedRelaysCount = connectedRelays.length;
  const { relays, addRelay, resetRelays, removeRelay } = useContext(RelayContext)!;
  const [isOpen, setIsOpen] = useState(false);
  const error = "";
  const nostrState = isLoading
    ? "loading"
    : connectedRelays
      ? "connected"
      : error
        ? "error"
        : "disconnected"

  const relayConnectionStateColors = {
    connected: {
      bg: "bg-green-600 dark:bg-green-400",
      fg: "text-green-600 dark:text-green-400",
    },
    disconnected: {
      bg: "bg-gray-500 dark:bg-gray-400",
      fg: "text-gray-500 dark:text-gray-400",
    },
    loading: {
      bg: "bg-yellow-500 dark:bg-yellow-400",
      fg: "text-yellow-500 dark:text-yellow-400",
    },
    error: {
      bg: "bg-red-500 dark:bg-red-400",
      fg: "text-red-500 dark:text-red-400",
    },
  };

  const handleNewRelay = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (e.currentTarget.relay.value) {
      addRelay(e.currentTarget.relay.value);
      e.currentTarget.relay.value = "";
    }
  }

  return (
    <div className="relative">
      <button
        className={`py-2 px-4 rounded-full bg-opacity-25 dark:bg-opacity-20 text-xs flex items-center gap-2 font-semibold border border-transparent group hover:border-current
                  ${isOpen ? "border-current" : ""}
                  ${relayConnectionStateColors[nostrState].bg} ${relayConnectionStateColors[nostrState].fg}
                  `}
        onClick={() => setIsOpen((current) => !current)}
      >
        <ConnectionStateDot bg="bg-current" />
        <span>
          {isLoading
            ? "Connecting..."
            : connectedRelays
              ? `Connected to ${connectedRelaysCount}/${relays.length} relay${connectedRelaysCount > 1 ? "s" : ""
              } 📡`
              : "Not connected"}
        </span>
        <span
          className={isOpen ? "translate-y-1" : "group-hover:translate-y-1"}
        >
          <TbChevronDown
            className={`w-4 h-4 ${isOpen ? "animate-bounce" : "group-hover:animate-bounce"
              }`}
          />
        </span>
      </button>
      <ul
        className={`absolute z-50 mx-auto min-w-max -bottom-4 right-0 items-center gap-4 text-neutral-800 dark:text-zinc-400
                        flex-col translate-y-full border border-current p-4 rounded-md bg-zinc-200 dark:bg-neutral-900 
                        ${isOpen ? "flex" : "hidden"}
                        `}
      >
        {relays.map((relay) => (
          <li
            className="flex items-center justify-start w-full gap-4 text-sm group"
            key={relay}
          >
            <ConnectionStateDot bg={relayConnectionStateColors[connectedRelays.some(r => r.url === relay) ? "connected" : "error"].bg} />
            <span>{relay}</span>
            <Button
              icon={<TbMinus className="w-4 h-4" />}
              size="sm"
              color="transparent"
              className={`hover:border-current ml-auto md:opacity-0 group-hover:opacity-100 ${relayConnectionStateColors.error.fg}`}
              onClick={() => {removeRelay(relay)}}
            />
          </li>
        ))}
        <form 
          className="flex items-center justify-between w-full gap-4"
          onSubmit={handleNewRelay}
        >
          <input
            name="relay"
            placeholder="Add a new relay"
            className="text-sm py-2 focus:outline-none focus:border-none bg-transparent border-none focus:ring-0"
            required
          />
          <Button
            size="sm"
            color="transparent"
            className={`hover:border-current ${relayConnectionStateColors.connected.fg}`}
            icon={<TbPlus className="w-4 h-4" />}
          />
        </form>
        <Button
          size="sm"
          color="transparent"
          className={`hover:border-current w-full ${relayConnectionStateColors.error.fg}`}
          onClick={resetRelays}
        >reset to defualts</Button>
      </ul>
      { isOpen ? 
        <div className="fixed z-40 inset-0"
          onClick={() => setIsOpen(false)}
      /> : null }
    </div>
  );
};

const ConnectionStateDot = ({ bg }: { bg: string }) => (
  <span className={`w-2 h-2 rounded-full inline-block animate-pulse ${bg}`} />
);

export default ConnectedRelaysStatus;
