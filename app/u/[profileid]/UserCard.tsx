import Buttons from "../../Buttons";
import FollowButton from "./FollowButton";
import Truncate from "../../Truncate";
import Popup from "../../Popup";
import PopupInput from "../../PopupInput";
import { useState } from "react";
import Button from "../../Button";

export default function UserCard({
  name,
  npub,
  about,
  picture,
  pubkey,
  loggedInUsersContacts,
  loggedInUserPublicKey,
}: any) {
  const contacts = loggedInUsersContacts.map((pair: string) => pair[1]);
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = async () => {
    setIsOpen(!isOpen);
  };
  /* (contacts.includes(pubkey) */

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
      </p>
      <p className="flex items-center gap-1">
        <Truncate content={npub} color="transparent" size="sm" />
      </p>
      <p className="text-sm text-accent">{about}</p>
      {loggedInUserPublicKey === pubkey ? (
        <Buttons>
          <Button
            color="blue"
            variant="outline"
            onClick={handleClick}
            size="sm"
          >
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
        </Buttons>
      )}
      <Popup title="Edit Profile" isOpen={isOpen} setIsOpen={setIsOpen}>
        <PopupInput label="Profile Image Url"></PopupInput>
        <PopupInput label="Name*"></PopupInput>
        <PopupInput label="Bio"></PopupInput>
        <PopupInput label="Node Address"></PopupInput>
        <PopupInput label="Custom Record (if applicable)"></PopupInput>
        <Button
            color="blue"
            variant="solid"
            onClick={handleClick}
            size="sm"
            className="w-1/4"
          >
            Save
          </Button>
      </Popup>
    </div>
  );
}
