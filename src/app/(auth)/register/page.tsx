"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { useForm } from "react-hook-form";
import * as z from "zod";

const isValidNpub = (npub: string) => {
  try {
    return nip19.decode(npub).type === "npub";
  } catch (e) {
    return false;
  }
};

const isValidNsec = (nsec: string) => {
  try {
    return nip19.decode(nsec).type === "nsec";
  } catch (e) {
    return false;
  }
};

const formSchema = z.object({
  npub: z.string().refine(isValidNpub, {
    message: "Invalid npub.",
  }),
  nsec: z.string().refine(isValidNsec, {
    message: "Invalid nsec.",
  }),
});

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nsec: "",
      npub: "",
    },
  });

  const { reset } = form;

  useEffect(() => {
    const secretKey = generateSecretKey();
    const publicKey = getPublicKey(secretKey);
    const nsec = nip19.nsecEncode(secretKey);
    const npub = nip19.npubEncode(publicKey);

    reset({
      nsec,
      npub,
    });
  }, [reset]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { npub, nsec } = values;
    const publicKey = nip19.decode(npub).data as string;
    const secretKey = nip19.decode(nsec).data as Uint8Array;

    await signIn("credentials", {
      publicKey,
      secretKey,
      redirect: true,
      callbackUrl: "/",
    });
  }

  return (
    <div className="mx-auto grid w-[350px] gap-6 rounded-md border p-6">
      <div className="flex w-full flex-col space-y-4 text-left">
        <h1 className="font-bold font-mono text-2xl tracking-tight">
          Create an Account
        </h1>
        <p className="font-mono text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-mono font-semibold text-blue-500 dark:text-blue-400"
          >
            Sign in
          </Link>
        </p>
      </div>

      <Form {...form}>
        <form
          className="flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="nsec"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="border-primary/60 font-mono"
                    {...field}
                    disabled
                    placeholder="nsec..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="npub"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="border-primary/60 font-mono"
                    {...field}
                    disabled
                    placeholder="npub..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="mt-2 flex flex-wrap gap-1 font-mono text-sm text-zinc-500 leading-6 dark:text-zinc-400">
            <span>Use a</span>
            <span>
              <a
                href="https://getalby.com/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-500 hover:underline dark:text-blue-400"
              >
                nostr extension
              </a>
            </span>
            <span>to login in the future</span>
          </p>

          <Button className="font-mono" type="submit" disabled={isLoading}>
            Register
          </Button>
        </form>
      </Form>
    </div>
  );
}
