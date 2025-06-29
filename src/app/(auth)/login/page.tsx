"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { bytesToHex } from "@noble/hashes/utils";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { getPublicKey, nip19 } from "nostr-tools";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

const isValidNsec = (nsec: string) => {
  try {
    return nip19.decode(nsec).type === "nsec";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
};

const formSchema = z.object({
  nsec: z.string().refine(isValidNsec, {
    message: "Invalid nsec.",
  }),
});

export default function UserAuthForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nsec: "",
    },
  });

  const signInWithExtension = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsLoading(true);
    if (typeof nostr !== "undefined") {
      const publicKey: string = await nostr.getPublicKey();
      await signIn("credentials", {
        publicKey: publicKey,
        secretKey: 0,
        redirect: true,
        callbackUrl: "/",
      });
    } else {
      alert("No extension found");
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { nsec } = values;
    const secretKeyUint8 = nip19.decode(nsec).data as Uint8Array;
    const publicKey = getPublicKey(secretKeyUint8);
    const secretKey = bytesToHex(secretKeyUint8);

    await signIn("credentials", {
      publicKey,
      secretKey,
      redirect: true,
      callbackUrl: "/",
    });
  }

  return (
    <div className="mx-auto grid w-[350px] gap-6 rounded-md border p-6">
      <div className="flex w-full flex-col space-y-6 text-left">
        <h1 className="font-bold font-mono text-2xl tracking-tight">Log in</h1>
        <p className="font-mono text-muted-foreground text-sm">
          New to Nostr?{" "}
          <Link
            href="/register"
            className="font-mono font-semibold text-blue-500 dark:text-blue-400"
          >
            Create an account
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
                    className="font-mono"
                    disabled={isLoading}
                    placeholder="nsec..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="font-mono" type="submit" disabled={isLoading}>
            Sign In
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 font-mono text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        className="flex gap-x-1 font-mono"
        variant="outline"
        type="button"
        onClick={signInWithExtension}
        disabled={isLoading}
      >
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg
          className="-ml-3.5 -mt-0.5 h-6 w-6 fill-secondary-foreground"
          // id="_8"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
        >
          <path d="m210.81,116.2v83.23c0,3.13-2.54,5.67-5.67,5.67h-68.04c-3.13,0-5.67-2.54-5.67-5.67v-15.5c.31-19,2.32-37.2,6.54-45.48,2.53-4.98,6.7-7.69,11.49-9.14,9.05-2.72,24.93-.86,31.67-1.18,0,0,20.36.81,20.36-10.72,0-9.28-9.1-8.55-9.1-8.55-10.03.26-17.67-.42-22.62-2.37-8.29-3.26-8.57-9.24-8.6-11.24-.41-23.1-34.47-25.87-64.48-20.14-32.81,6.24.36,53.27.36,116.05v8.38c-.06,3.08-2.55,5.57-5.65,5.57h-33.69c-3.13,0-5.67-2.54-5.67-5.67V55.49c0-3.13,2.54-5.67,5.67-5.67h31.67c3.13,0,5.67,2.54,5.67,5.67,0,4.65,5.23,7.24,9.01,4.53,11.39-8.16,26.01-12.51,42.37-12.51,36.65,0,64.36,21.36,64.36,68.69Zm-60.84-16.89c0-6.7-5.43-12.13-12.13-12.13s-12.13,5.43-12.13,12.13,5.43,12.13,12.13,12.13,12.13-5.43,12.13-12.13Z" />
        </svg>
        Nostr Extension
      </Button>
    </div>
  );
}
