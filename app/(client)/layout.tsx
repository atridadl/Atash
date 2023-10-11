"use client";

import { AblyProvider } from "ably/react";
import * as Ably from "ably";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = new Ably.Realtime.Promise({
    authUrl: "/api/internal/ably",
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AblyProvider client={client}>{children}</AblyProvider>{" "}
    </QueryClientProvider>
  );
}
