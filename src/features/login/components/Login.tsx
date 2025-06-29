"use client";

import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";

type LoginProps = {
  children: React.ReactNode;
};

export function Login({ children }: LoginProps) {
  return (
    <Button className="font-mono" variant="secondary" onClick={() => signIn()}>
      {children}
    </Button>
  );
}
