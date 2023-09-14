"use client";

import { AblyProvider } from "ably/react";
import * as Ably from "ably";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = new Ably.Realtime.Promise({
    authUrl: "/api/internal/ably",
  });

  return <AblyProvider client={client}>{children}</AblyProvider>;
}
