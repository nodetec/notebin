"use client";

import type { Event } from "nostr-tools";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { DEFAULT_RELAYS } from "~/lib/constants";
import { sendZap, type ZapRequest } from "../lib/zap";

type Props = {
  children: React.ReactNode;
  recipientProfileEvent: Event | null | undefined;
  senderPubkey: string | null | undefined;
  eventId?: string;
  address?: string;
};

export function ZapDialog({
  children,
  recipientProfileEvent,
  senderPubkey,
  eventId,
  address,
}: Props) {
  // create state to hold the amount of satoshis to send
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  if (!recipientProfileEvent) {
    return null;
  }

  if (!senderPubkey) {
    return null;
  }

  // create function to set the amount of satoshis to send
  function setAmountToTip(amount: number) {
    setAmount(amount.toString());
  }

  async function handleSubmit() {
    if (amount === "" || Number.parseInt(amount, 10) === 0) {
      setAmount("");
      setMessage("");
      toast("Amount must be greater than 0", {
        description: "Please enter a valid amount.",
      });
      return;
    }

    if (!recipientProfileEvent) {
      toast("Error sending zap", {
        description: "There was an error sending your zap.",
      });
      return;
    }

    if (!senderPubkey) {
      toast("Error sending zap", {
        description: "There was an error sending your zap.",
      });
      return;
    }

    const zapRequest: ZapRequest = {
      recipientPubkey: recipientProfileEvent.pubkey,
      amount: Number.parseInt(amount, 10) * 1000,
      relays: DEFAULT_RELAYS,
      comment: message,
      senderPubkey,
      eventId: eventId,
      address: address,
    };

    try {
      await sendZap(zapRequest, recipientProfileEvent);
      toast("Zap sent", {
        description: "Your zap has been sent.",
      });
    } catch (e) {
      console.error("error sending zap", e);
      toast(" Error sending zap", {
        description: "There was an error sending your zap.",
      });
      return;
    }
    setOpen(false);
    setAmount("");
    setMessage("");
  }

  // Reset the fields when the dialog is closed
  function handleDialogOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setAmount("");
      setMessage("");
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="-translate-y-[36vh] max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>Send a Tip</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="amount">Amount</Label>
            <Input
              type="number"
              id="amount"
              placeholder="Enter amount in satoshis"
              className="col-span-3"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                    ? Number.parseInt(e.target.value, 10).toString()
                    : "",
                )
              }
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setAmountToTip(1000)}
              variant="secondary"
              className="flex-1"
            >
              1k ⚡
            </Button>
            <Button
              onClick={() => setAmountToTip(5000)}
              variant="secondary"
              className="flex-1"
            >
              5k ⚡
            </Button>
            <Button
              onClick={() => setAmountToTip(10000)}
              variant="secondary"
              className="flex-1"
            >
              10k ⚡
            </Button>
            <Button
              onClick={() => setAmountToTip(25000)}
              variant="secondary"
              className="flex-1"
            >
              25k ⚡
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              placeholder="Optional"
              className="col-span-3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} type="submit">
            Send Satoshis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
