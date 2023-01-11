import Link from "next/link";
import React from "react";
import { BsLightningChargeFill } from "react-icons/bs";

export default function Footer() {
  return (
    <footer className="border-t border-slate-700 mt-12">
      <div className="container items-center mx-auto grid grid-cols-3 gap-4 py-4">
        <a href="#" className="text-slate-500 hover:text-gray-600 text-center">
          YouTube
        </a>
        <a href="#" className="text-slate-500 hover:text-gray-600 text-center">
          Twitter
        </a>
        <a href="#" className="text-slate-500 hover:text-gray-600 text-center">
          Donate
        </a>
        <a href="#" className="text-slate-500 hover:text-gray-600 text-center">
          Merch
        </a>
        <a href="#" className="text-slate-500 hover:text-gray-600 text-center">
          nostr
        </a>
        <a href="#" className="text-slate-500 hover:text-gray-600 text-center">
          Lightning Wallet
        </a>
      </div>
    </footer>
  );
}
