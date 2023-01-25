"use client";
import { IconType } from "react-icons";
import {
  AiFillGithub,
  AiFillHeart,
  AiOutlineTwitter,
  AiFillYoutube,
} from "react-icons/ai";
import { MdExtension } from "react-icons/md";
import { BsFillLightningChargeFill } from "react-icons/bs";

interface ISocialLink {
  name: string;
  url: string;
  Icon: IconType;
}

const SOCIALS: ISocialLink[] = [
  {
    name: "YouTube",
    url: "https://www.youtube.com/@chrisatmachine",
    Icon: AiFillYoutube,
  },
  {
    name: "Twitter",
    url: "https://twitter.com/chrisatmachine",
    Icon: AiOutlineTwitter,
  },
  {
    name: "Donate",
    url: "https://getalby.com/chrisatmachine",
    Icon: AiFillHeart,
  },
  {
    name: "GitHub",
    url: "https://github.com/nodetec/NoteBin",
    Icon: AiFillGithub,
  },
  {
    name: "Nostr Extension",
    url: "https://github.com/fiatjaf/nos2x",
    Icon: MdExtension,
  },
  {
    name: "Lightning Wallet",
    url: "https://getalby.com",
    Icon: BsFillLightningChargeFill,
  },
];

const Footer = () => (
  <footer className="mt-12 mx-auto">
    <ul className="container items-center justify-center flex gap-8 flex-wrap py-4">
      {SOCIALS.map((social) => (
        <li key={social.url}>
          <a
            href={social.url}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="flex items-center gap-2 text-accent opacity-70 hover:opacity-100 text-center"
          >
            <span>
              <social.Icon />
            </span>
            {social.name}
          </a>
        </li>
      ))}
    </ul>
  </footer>
);

export default Footer;
