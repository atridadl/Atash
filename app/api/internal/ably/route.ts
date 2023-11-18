import { NextResponse } from "next/server";
import { env } from "env.mjs";
import { currentUser } from "@clerk/nextjs/server";
import type { AblyTokenResponse } from "@/_utils/types";

async function handler() {
  const user = await currentUser();

  if (!env.ABLY_API_KEY) {
    return new Response(
      `Missing ABLY_API_KEY environment variable.
                If you're running locally, please ensure you have a ./.env file with a value for ABLY_API_KEY=your-key.
                If you're running in Netlify, make sure you've configured env variable ABLY_API_KEY. 
                Please see README.md for more details on configuring your Ably API Key.`,
      {
        status: 500,
        statusText: `Missing ABLY_API_KEY environment variable.
        If you're running locally, please ensure you have a ./.env file with a value for ABLY_API_KEY=your-key.
        If you're running in Netlify, make sure you've configured env variable ABLY_API_KEY. 
        Please see README.md for more details on configuring your Ably API Key.`,
      }
    );
  }

  const keyName = env.ABLY_API_KEY.split(":")[0];

  const tokenResponse = await fetch(
    `https://rest.ably.io/keys/${keyName}/requestToken`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(env.ABLY_API_KEY)}`,
      },
      body: JSON.stringify({
        keyName,
        clientId: user?.id,
        timestamp: Date.now(),
      }),
    }
  );
  const tokenResponseData = (await tokenResponse.json()) as AblyTokenResponse;

  return NextResponse.json(tokenResponseData, {
    status: 200,
    statusText: "SUCCESS",
  });
}

export { handler as POST, handler as GET };
