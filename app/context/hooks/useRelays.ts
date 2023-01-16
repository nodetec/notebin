import { useState, useEffect, useContext } from "react";
import { NostrService } from "../../utils/NostrService";
import { RELAYS } from "../../constants";
import { RelayContext } from "../../context/relay-provider.jsx";

const useRelays = () => {
  const [mounted, setMounted] = useState(false);
  // @ts-ignore
  const { relays, setRelays } = useContext(RelayContext);
  const [isLightningConnected, setIsLightningConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const shouldReconnect = sessionStorage.getItem("shouldReconnect");
    setMounted(true);

    const connectToRelays = async () => {
      try {
        setError("");
        setConnecting(true);
        const new_relays = await NostrService.connect(RELAYS);
        setRelays(new_relays);
      } catch (e: any) {
        setError("Error Connecting to Relays");
        console.log(e.message);
      } finally {
        setConnecting(false);
      }
    };

    const getConnected = async (shouldReconnect: string) => {
      let enabled = false;
      // @ts-ignore
      if (shouldReconnect === "true" && !webln.executing) {
        // @ts-ignore
        enabled = await window.webln.enable();
        setIsLightningConnected(true);
      }
      return enabled;
    };
    if (!relays) {
      connectToRelays();
    }

    if (shouldReconnect) {
      getConnected(shouldReconnect);
    }
  }, []);

  return {
    relays,
    connecting,
    error,
    mounted,
    isLightningConnected,
    setIsLightningConnected,
  }
}

export default useRelays;
