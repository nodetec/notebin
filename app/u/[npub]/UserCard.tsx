import Buttons from "../../Buttons";
import FollowButton from "./FollowButton";
import Truncate from "../../Truncate";
import Popup from "../../Popup";
import PopupInput from "../../PopupInput";
import { useEffect, useState } from "react";
import Button from "../../Button";
import { useNostr } from "nostr-react";
import { NostrService } from "../../utils/NostrService";
import type { Event } from "nostr-tools";
import { BsPatchCheckFill, BsLightningChargeFill } from "react-icons/bs";
import { requestInvoice } from "lnurl-pay";
import { utils } from "lnurl-pay";
import { bech32 } from "bech32";

const presetAmounts = [
  { value: "1000", label: "1k" },
  { value: "5000", label: "5k" },
  { value: "10000", label: "10k" },
  { value: "25000", label: "25k" },
];

export default function UserCard({
  name,
  nip05,
  npub,
  about,
  picture,
  pubkey,
  loggedInUsersContacts,
  loggedInUserPublicKey,
  // lnPubkey,
  // lnCustomValue,
  lud06,
  lud16,
}: any) {
  const { connectedRelays } = useNostr();
  const { publish } = useNostr();
  const contacts = loggedInUsersContacts.map((pair: string) => pair[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTipSuccessOpen, setIsTipSuccessOpen] = useState(false);
  const [newProfile, setProfile] = useState({
    newName: name,
    newAbout: about,
    newPicture: picture,
    newNip05: nip05,
    // newLnPubkey: lnPubkey,
    // newLnCustomValue: lnCustomValue,
    newLud06: lud06,
    newLud16: lud16,
  });
  const {
    newName,
    newAbout,
    newPicture,
    newNip05,
    // newLnPubkey,
    // newLnCustomValue,
    newLud06,
    newLud16,
  } = newProfile;
  const [tipInputValue, setTipInputValue] = useState<string>("1");
  const [tipMessage, setTipMessage] = useState<string>();
  const [paymentHash, setPaymentHash] = useState();
  const [newLnAddress, setNewLnAddress] = useState<any>();
  const [convertedAddress, setConvertedAddress] = useState<any>();

  useEffect(() => {
    setNewLnAddress(lud16);
    setProfile({
      newName: name,
      newAbout: about,
      newPicture: picture,
      newNip05: nip05,
      // newLnPubkey: lnPubkey,
      // newLnCustomValue: lnCustomValue,
      newLud06: lud06,
      newLud16: lud16,
    });
  }, []);

  useEffect(() => {
    setNewLnAddress(lud16);
  }, [isOpen]);

  async function convert(newLnAddress: any) {
    const url = utils.decodeUrlOrAddress(newLnAddress);

    if (utils.isUrl(url)) {
      try {
        const response = await fetch(url);

        if (utils.isLnurl(newLnAddress)) {
          console.log("RESPONSE:", response);
          const data = await response.json();
          console.log("DATA:", data);
          console.log("METADATA:", JSON.parse(data.metadata)[0][1]);
          const newConvertedAddress = JSON.parse(data.metadata)[0][1];

          setProfile({ ...newProfile, newLud16: newConvertedAddress });
          setConvertedAddress(newConvertedAddress);
          console.log(newConvertedAddress); // chrisatmachine@getalby.com
        }

        if (utils.isLightningAddress(newLnAddress)) {
          let words = bech32.toWords(Buffer.from(url, "utf8"));
          let newConvertedAddress = "";
          newConvertedAddress = bech32.encode("lnurl", words, 2000);
          setProfile({ ...newProfile, newLud06: newConvertedAddress });
          setConvertedAddress(newConvertedAddress);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    async function getLnAddress() {
      if (newLnAddress) {
        convert(newLnAddress);
      }
    }
    setConvertedAddress("");
    getLnAddress();
  }, [newLnAddress]);

  const handleClick = async () => {
    setIsOpen(!isOpen);
  };

  const validateTipInputKeyDown = (e: any) => {
    if ((e.which != 8 && e.which != 0 && e.which < 48) || e.which > 57) {
      e.preventDefault();
    }
  };

  const handleSendTip = async (e: any) => {
    e.preventDefault();
    // @ts-ignore
    if (typeof window.webln !== "undefined") {
      const lnUrlOrAddress = lud06 || lud16;

      const { invoice, params, successAction, validatePreimage } =
        await requestInvoice({
          lnUrlOrAddress,
          // @ts-ignore
          tokens: tipInputValue, // satoshis
          comment: tipMessage,
        });
      try {
        // @ts-ignore
        const result = await webln.sendPayment(invoice);
        console.log("Tip Result:", result);
        setPaymentHash(result.paymentHash);
      } catch (e) {
        console.log("Tip Error:", e);
      }
    }
    setIsOpen(!isOpen);
    setIsTipSuccessOpen(!isTipSuccessOpen);

    // TODO: maybe support old keysend way of doing things
    // // @ts-ignore
    // if (typeof window.webln !== "undefined") {
    //   let tip = {
    //     destination: lnPubkey,
    //     amount: tipInputValue,
    //   };
    //   console.log("TIP:", tip);
    //   console.log("lnCustomValue:", lnCustomValue);
    //   if (lnCustomValue) {
    //     // @ts-ignore
    //     tip.customRecords = {
    //       696969: lnCustomValue,
    //     };
    //   }
    //   try {
    //     // @ts-ignore
    //     const result = await webln.keysend(tip);
    //     console.log("Tip Result:", result);
    //     setPaymentHash(result.paymentHash);
    //   } catch (e) {
    //     console.log("Tip Error:", e);
    //   }
    // }
    // setIsOpen(!isOpen);
    // setIsTipSuccessOpen(!isTipSuccessOpen);
  };

  const handleSubmitNewProfile = async (e: any) => {
    e.preventDefault();

    const content = {
      name: newName,
      about: newAbout,
      picture: newPicture,
      nip05: newNip05,
      lud06: newLud06,
      lud16: newLud16,
    };
    // ln_pubkey: newLnPubkey,
    // ln_custom_value: newLnCustomValue,

    const stringifiedContent = JSON.stringify(content);

    let event = NostrService.createEvent(
      0,
      loggedInUserPublicKey,
      stringifiedContent,
      []
    );

    try {
      event = await NostrService.addEventData(event);
    } catch (err: any) {
      // setPost({ postSending: false, postError: err.message });
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
        setIsOpen(!isOpen);
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
        // setPost({ postSending: false, postError: "" });
      });

      await pub.on("seen", async () => {
        console.log("OUR EVENT WAS SEEN");
        setIsOpen(!isOpen);
      });

      pub.on("failed", (reason: any) => {
        // setPost({ postSending: false, postError: reason });
        console.log("OUR EVENT HAS FAILED");
      });
    }
  };

  return (
    <div className="flex flex-col items-center md:items-start gap-4">
      <img
        className="rounded-full mb-4 min-w-[9rem] w-36 h-36 object-cover"
        src={picture}
        alt={name}
      />
      <p className="text-2xl font-bold text-zinc-200">
        <span className="text-red-500">@</span>
        {name}
        {/* BsPatchCheckFill */}
        {nip05 && (
          <p className="text-sm text-accent">
            <div className="flex items-center gap-1">
              <BsPatchCheckFill className="text-blue-500" size="14" />
              <span>{nip05}</span>
            </div>
          </p>
        )}
      </p>
      <p className="flex items-center gap-1">
        <Truncate content={npub} color="transparent" size="sm" />
      </p>
      <p className="text-sm text-accent">{about}</p>
      {loggedInUserPublicKey === pubkey ? (
        <Buttons>
          <Button color="blue" variant="ghost" onClick={handleClick} size="sm">
            edit profile
          </Button>
        </Buttons>
      ) : (
        <Buttons>
          <FollowButton
            loggedInUserPublicKey={loggedInUserPublicKey}
            currentContacts={loggedInUsersContacts}
            profilePublicKey={pubkey}
            contacts={contacts}
          />
          {(lud06 || lud16) && (
            <Button
              color="yellow"
              variant="ghost"
              onClick={handleClick}
              size="sm"
              icon={<BsLightningChargeFill size="14" />}
            >
              tip
            </Button>
          )}
        </Buttons>
      )}

      <Popup
        title="Success"
        isOpen={isTipSuccessOpen}
        setIsOpen={setIsTipSuccessOpen}
      >
        <h4 className="text-lg text-green-500 text-center pb-4">{`You sent ${name} ${tipInputValue} sat(s)!`}</h4>
        <h5 className="text text-accent bg-secondary overflow-x-scroll rounded-md text-center p-4">
          <div className="cursor-text flex justify-start whitespace-nowrap items-center">
            <div className="mr-2">{"Payment Hash:"}</div>
            <div className="pr-4">{paymentHash}</div>
          </div>
        </h5>
      </Popup>
      {loggedInUserPublicKey === pubkey ? (
        <Popup title="Edit Profile" isOpen={isOpen} setIsOpen={setIsOpen}>
          <PopupInput
            value={newName}
            onChange={(e) =>
              setProfile({ ...newProfile, newName: e.target.value })
            }
            label="Name"
          />
          <PopupInput
            value={newNip05}
            onChange={(e) =>
              setProfile({ ...newProfile, newNip05: e.target.value })
            }
            label="NIP-05 ID"
          />
          <PopupInput
            value={newPicture}
            onChange={(e) =>
              setProfile({ ...newProfile, newPicture: e.target.value })
            }
            label="Profile Image Url"
          />
          <PopupInput
            value={newAbout}
            onChange={(e) =>
              setProfile({ ...newProfile, newAbout: e.target.value })
            }
            label="About"
          />
          <h3 className="text-xl text-accent text-center pt-4">
            ⚡ Enable Lightning Tips ⚡
          </h3>
          <PopupInput
            value={newLnAddress}
            onChange={(e) => setNewLnAddress(e.target.value)}
            label="Lightning Address or LUD-06 Identifier"
          ></PopupInput>

          <h5 className="text text-accent bg-secondary overflow-x-scroll rounded-md text-center p-4">
            <div className="cursor-text flex justify-start whitespace-nowrap items-center">
              <div className="pr-4">{convertedAddress}</div>
            </div>
          </h5>
          {/* <PopupInput */}
          {/*   value={newLud16} */}
          {/*   onChange={(e) => setNewLnCustomValue(e.target.value)} */}
          {/*   label="LUD-16" */}
          {/* ></PopupInput> */}
          {/* <PopupInput */}
          {/*   value={newLnPubkey} */}
          {/*   onChange={(e) => setNewLnPubkey(e.target.value)} */}
          {/*   label="LN Public Key" */}
          {/* ></PopupInput> */}
          {/* <PopupInput */}
          {/*   value={newLnCustomValue} */}
          {/*   onChange={(e) => setNewLnCustomValue(e.target.value)} */}
          {/*   label="Custom Record (if applicable)" */}
          {/* ></PopupInput> */}
          <Button
            color="blue"
            variant="solid"
            onClick={handleSubmitNewProfile}
            size="sm"
            className="w-1/4"
          >
            Save
          </Button>
        </Popup>
      ) : (
        <Popup title="Pay with Lightning" isOpen={isOpen} setIsOpen={setIsOpen}>
          <h2 className="pt-2 font-bold text-lg text-accent">Amount</h2>
          <div className="flex items-center w-full py-2 px-4 rounded-md bg-primary text-zinc-300 ring-1 ring-yellow-500">
            <input
              type="number"
              value={tipInputValue}
              onKeyDown={validateTipInputKeyDown}
              onChange={(e) => setTipInputValue(e.target.value)}
              placeholder="Enter amount in sats"
              required
              min={1}
              className="w-full flex-1 focus:ring-0 border-0 bg-transparent text-zinc-300"
            />
            <span className="text-yellow-400 text-sm font-bold">satoshis</span>
          </div>
          <Buttons>
            {presetAmounts.map((amount) => (
              <Button
                key={amount.label}
                color="yellow"
                variant="outline"
                iconAfter
                className="w-full"
                icon={<BsLightningChargeFill size="14" />}
                onClick={() => setTipInputValue(amount.value)}
              >
                {amount.label}
              </Button>
            ))}
          </Buttons>
          <h2 className="pt-2 font-bold text-lg text-accent">Message</h2>
          <div className="flex items-center w-full py-2 px-4 rounded-md bg-primary text-zinc-300 ring-1 ring-zinc-500">
            <input
              type="text"
              value={tipMessage}
              onChange={(e) => setTipMessage(e.target.value)}
              placeholder="optional"
              className="w-full flex-1 focus:ring-0 border-0 bg-transparent text-zinc-300"
            />
          </div>
          <Button
            color="yellow"
            variant="solid"
            onClick={handleSendTip}
            size="md"
            icon={<BsLightningChargeFill size="14" />}
            className="w-full"
          >
            Send
          </Button>
        </Popup>
      )}
    </div>
  );
}
