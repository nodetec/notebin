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

export default function UserCard({
  name,
  nip05,
  npub,
  about,
  picture,
  pubkey,
  loggedInUsersContacts,
  loggedInUserPublicKey,
  lnPubkey,
  lnCustomValue,
  lud06,
  lud16,
}: any) {
  const { connectedRelays } = useNostr();
  const { publish } = useNostr();
  const contacts = loggedInUsersContacts.map((pair: string) => pair[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newAbout, setNewAbout] = useState(about);
  const [newPicture, setNewPicture] = useState(picture);
  const [newNip05, setNewNip05] = useState(nip05);
  const [newLnPubkey, setNewLnPubkey] = useState(lnPubkey);
  const [newLnCustomValue, setNewLnCustomValue] = useState(lnCustomValue);
  const [newLud06, setNewLud06] = useState(lud06);
  const [newLud16, setNewLud16] = useState(lud16);
  const [tipInputValue, setTipInputValue] = useState<string>("1");

  // TODO: on close reset values

  useEffect(() => {
    setNewName(name);
    setNewAbout(about);
    setNewPicture(picture);
    setNewNip05(nip05);
    setNewLnPubkey(lnPubkey);
    setNewLnCustomValue(lnCustomValue);
    setNewLud06(lud06);
    setNewLud16(lud16);
  }, []);

  const handleClick = async () => {
    setIsOpen(!isOpen);
  };

  const validateTipInputKeyDown = (e: any) => {
    if ((e.which != 8 && e.which != 0 && e.which < 48) || e.which > 57) {
      e.preventDefault();
    }
  };

  const handleSendTip = (e: any) => {
    // TODO: send lightning tips
  };
  /* (contacts.includes(pubkey) */

  const handleSubmitNewProfile = async (e: any) => {
    e.preventDefault();

    const content = {
      name: newName,
      about: newAbout,
      picture: newPicture,
      nip05: newNip05,
      lud06: newLud06,
      lud16: newLud16,
      ln_pubkey: newLnPubkey,
      ln_custom_value: newLnCustomValue,
    };

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

    console.log("EVENT NEW PROFILE:", event);

    console.log("SUBMIT NEW PROFILE");
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
          <Button
            color="yellow"
            variant="ghost"
            onClick={handleClick}
            size="sm"
            icon={<BsLightningChargeFill size="14" />}
          >
            tip
          </Button>
        </Buttons>
      )}
      {loggedInUserPublicKey === pubkey ? (
        <Popup title="Edit Profile" isOpen={isOpen} setIsOpen={setIsOpen}>
          <PopupInput
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            label="Name"
          ></PopupInput>
          <PopupInput
            value={newNip05}
            onChange={(e) => setNewNip05(e.target.value)}
            label="NIP-05 ID"
          ></PopupInput>
          <PopupInput
            value={newPicture}
            onChange={(e) => setNewPicture(e.target.value)}
            label="Profile Image Url"
          ></PopupInput>
          <PopupInput
            value={newAbout}
            onChange={(e) => setNewAbout(e.target.value)}
            label="About"
          ></PopupInput>
          <h3 className="text-xl text-accent text-center pt-4">
            ⚡ Enable Lightning Tips ⚡
          </h3>
          <PopupInput
            value={newLnPubkey}
            onChange={(e) => setNewLnPubkey(e.target.value)}
            label="LN Public Key"
          ></PopupInput>
          <PopupInput
            value={newLnCustomValue}
            onChange={(e) => setNewLnCustomValue(e.target.value)}
            label="Custom Record (if applicable)"
          ></PopupInput>
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
        <Popup
          title="Pay with Lightning"
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          className="w-[24rem]"
        >
          <div className="flex items-center w-full py-2 px-4 rounded-md dark:bg-primary dark:text-zinc-300 ring-1 ring-yellow-500">
            <input
              type="number"
              value={tipInputValue}
              onKeyDown={validateTipInputKeyDown}
              onChange={(e) => setTipInputValue(e.target.value)}
              placeholder="Enter amount in sats"
              required
              min={1}
              className="w-full flex-1 focus:ring-0 border-0 bg-transparent dark:text-zinc-300"
            />
            <span className="text-yellow-400 text-sm font-bold">satoshis</span>
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
