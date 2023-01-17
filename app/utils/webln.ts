import { Event } from "./NostrService";

export const handleTip = async (event: Event|undefined, tipAmount: number = 1) => {
    // @ts-ignore
    if (typeof window.webln !== "undefined") {
      const nodeAddress = event?.tags[2][1];
      const customRecord = event?.tags[3][1];
      // @ts-ignore
      const result = await webln.keysend({
        destination: nodeAddress,
        amount: tipAmount,
        customRecords: {
          696969: customRecord,
        },
      });
      console.log("Tip Result:", result);
    }
  };

