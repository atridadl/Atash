import { NextResponse } from "next/server";

import * as Ably from "ably/promises";
import { env } from "env.mjs";
import { currentUser } from "@clerk/nextjs";

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

  const client = new Ably.Rest(env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: user?.id,
  });

  return NextResponse.json(tokenRequestData, {
    status: 200,
    statusText: "SUCCESS",
  });
}

export { handler as POST, handler as GET };
