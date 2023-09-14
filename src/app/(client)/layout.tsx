"use client";

import { AblyProvider } from "ably/react";
import * as Ably from "ably";
import { env } from "@/env.mjs";
import { useUser } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();

  const client = new Ably.Realtime.Promise({
    key: env.NEXT_PUBLIC_ABLY_PUBLIC_KEY,
    clientId: user?.id,
  });

  return <AblyProvider client={client}>{children}</AblyProvider>;
}
